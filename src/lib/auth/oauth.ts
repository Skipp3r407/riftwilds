/**
 * OAuth helpers — Google (live), Discord/Apple (scaffold + callback stubs).
 * Custom session cookies (not NextAuth).
 */

import { cookies } from "next/headers";
import type { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createUserSession, hashIp, hashUserAgent } from "@/lib/auth/session";
import { secureCookieOptions } from "@/lib/auth/cookie-options";
import { writeSecurityAudit, recordLoginAttempt } from "@/lib/auth/security-audit";
import { LEGAL_PRIVACY_VERSION, LEGAL_TERMS_VERSION } from "@/lib/auth/legal-versions";
import { normalizeEmail } from "@/lib/auth/password";

export const OAUTH_STATE_COOKIE = "ph_oauth_state";
export const OAUTH_PROVIDERS = ["google", "discord", "apple"] as const;
export type OAuthProviderId = (typeof OAUTH_PROVIDERS)[number];

export type OAuthStatePayload = {
  state: string;
  provider: OAuthProviderId;
  returnUrl: string;
  /** Unix ms */
  issuedAt: number;
};

export function isOAuthProvider(raw: string): raw is OAuthProviderId {
  return (OAUTH_PROVIDERS as readonly string[]).includes(raw);
}

export function oauthEnvReady(provider: OAuthProviderId): boolean {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === "discord") {
    return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  }
  return Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID);
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function oauthCallbackUrl(provider: OAuthProviderId): string {
  return `${appBaseUrl()}/api/auth/oauth/${provider}/callback`;
}

export function oauthAuthorizeUrl(
  provider: OAuthProviderId,
  state: string,
): string | null {
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: oauthCallbackUrl("google"),
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
  if (provider === "discord") {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      redirect_uri: oauthCallbackUrl("discord"),
      response_type: "code",
      scope: "identify email",
      state,
    });
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }
  // Apple Sign In needs a form POST + JWT client secret — documented in AUTH_SETUP.md.
  return null;
}

export async function setOAuthStateCookie(payload: OAuthStatePayload): Promise<void> {
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, JSON.stringify(payload), {
    ...secureCookieOptions(60 * 10),
    httpOnly: true,
  });
}

export async function consumeOAuthStateCookie(
  expectedState: string,
  provider: OAuthProviderId,
): Promise<OAuthStatePayload | null> {
  const jar = await cookies();
  const raw = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OAuthStatePayload;
    if (parsed.state !== expectedState || parsed.provider !== provider) return null;
    if (Date.now() - parsed.issuedAt > 1000 * 60 * 10) return null;
    const returnUrl =
      parsed.returnUrl?.startsWith("/") && !parsed.returnUrl.startsWith("//")
        ? parsed.returnUrl
        : "/play";
    return { ...parsed, returnUrl };
  } catch {
    return null;
  }
}

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
};

type GoogleUserInfo = {
  id?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: oauthCallbackUrl("google"),
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return (await res.json()) as GoogleTokenResponse;
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return (await res.json()) as GoogleUserInfo;
}

export type OAuthLoginResult =
  | { ok: true; userId: string; accountStatus: AccountStatus; returnUrl: string }
  | { ok: false; error: string };

export async function completeGoogleOAuth(params: {
  code: string;
  state: string;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string;
}): Promise<OAuthLoginResult> {
  const statePayload = await consumeOAuthStateCookie(params.state, "google");
  if (!statePayload) {
    return { ok: false, error: "Invalid or expired OAuth state. Try again." };
  }

  const tokens = await exchangeGoogleCode(params.code);
  if (!tokens.access_token) {
    return { ok: false, error: tokens.error ?? "Google token exchange failed." };
  }

  const profile = await fetchGoogleProfile(tokens.access_token);
  const providerAccountId = profile.id || profile.sub;
  if (!providerAccountId) {
    return { ok: false, error: "Google profile missing subject id." };
  }

  const email = profile.email ? normalizeEmail(profile.email) : null;
  const emailVerified =
    profile.email_verified === true || profile.email_verified === "true";

  const existingAccount = await prisma.authAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId,
      },
    },
    include: { user: true },
  });

  let user = existingAccount?.user ?? null;

  if (!user && email) {
    user = await prisma.user.findFirst({
      where: { OR: [{ email }, { emailNormalized: email }], deletedAt: null },
    });
  }

  if (user && (user.accountStatus === "BANNED" || user.accountStatus === "DELETED" || user.isBanned)) {
    return { ok: false, error: "This account cannot sign in." };
  }

  if (!user) {
    if (!email) {
      return { ok: false, error: "Google account did not return an email." };
    }
    user = await prisma.user.create({
      data: {
        email,
        emailNormalized: email,
        emailVerifiedAt: emailVerified ? new Date() : null,
        accountStatus: emailVerified ? "ACTIVE" : "PENDING_VERIFICATION",
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
        profile: {
          create: {
            displayName: profile.name?.slice(0, 48) || undefined,
            avatarKey: profile.picture || undefined,
          },
        },
        settings: { create: {} },
        authAccounts: {
          create: {
            provider: "google",
            providerAccountId,
            email,
            verifiedAt: emailVerified ? new Date() : null,
            lastUsedAt: new Date(),
            scope: tokens.scope,
            tokenType: tokens.token_type,
            expiresAt: tokens.expires_in
              ? new Date(Date.now() + tokens.expires_in * 1000)
              : undefined,
          },
        },
        authIdentities: {
          create: {
            provider: "google",
            providerUserId: providerAccountId,
            email,
            displayName: profile.name ?? undefined,
            avatarUrl: profile.picture ?? undefined,
            verifiedAt: emailVerified ? new Date() : null,
            lastUsedAt: new Date(),
          },
        },
        termsAcceptances: {
          create: {
            version: LEGAL_TERMS_VERSION,
            ipHash: hashIp(params.ip ?? null),
            userAgentHash: hashUserAgent(params.userAgent ?? null),
          },
        },
        privacyAcceptances: {
          create: {
            version: LEGAL_PRIVACY_VERSION,
            ipHash: hashIp(params.ip ?? null),
            userAgentHash: hashUserAgent(params.userAgent ?? null),
          },
        },
        accountStatusHistory: {
          create: {
            toStatus: emailVerified ? "ACTIVE" : "PENDING_VERIFICATION",
            reason: "oauth_google_register",
          },
        },
      },
    });
  } else if (!existingAccount) {
    await prisma.authAccount.create({
      data: {
        userId: user.id,
        provider: "google",
        providerAccountId,
        email: email ?? undefined,
        verifiedAt: emailVerified ? new Date() : null,
        lastUsedAt: new Date(),
        scope: tokens.scope,
        tokenType: tokens.token_type,
      },
    });
    await prisma.authIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider: "google",
          providerUserId: providerAccountId,
        },
      },
      create: {
        userId: user.id,
        provider: "google",
        providerUserId: providerAccountId,
        email: email ?? undefined,
        displayName: profile.name ?? undefined,
        avatarUrl: profile.picture ?? undefined,
        verifiedAt: emailVerified ? new Date() : null,
        lastUsedAt: new Date(),
      },
      update: {
        lastUsedAt: new Date(),
        email: email ?? undefined,
        displayName: profile.name ?? undefined,
        avatarUrl: profile.picture ?? undefined,
      },
    });
    if (emailVerified && !user.emailVerifiedAt) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          accountStatus:
            user.accountStatus === "PENDING_VERIFICATION" ? "ACTIVE" : user.accountStatus,
          email: user.email ?? email,
          emailNormalized: user.emailNormalized ?? email,
        },
      });
    }
  } else {
    await prisma.authAccount.update({
      where: { id: existingAccount.id },
      data: { lastUsedAt: new Date() },
    });
  }

  const ipHash = hashIp(params.ip ?? null);
  const uaHash = hashUserAgent(params.userAgent ?? null);

  await createUserSession({
    userId: user.id,
    rememberMe: true,
    ipHash,
    userAgentHash: uaHash,
    authMethod: "social",
  });

  await recordLoginAttempt({
    email: email ?? undefined,
    userId: user.id,
    success: true,
    ipHash,
    userAgentHash: uaHash,
    provider: "google",
  });
  await writeSecurityAudit({
    userId: user.id,
    action: "auth.oauth_login",
    ipHash,
    requestId: params.requestId,
    metadata: { provider: "google" },
  });

  return {
    ok: true,
    userId: user.id,
    accountStatus: user.accountStatus,
    returnUrl: statePayload.returnUrl,
  };
}
