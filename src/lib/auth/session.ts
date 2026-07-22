import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import type { AccountStatus, TokenTier } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authDefaults } from "@/lib/config/project";
import { secureCookieOptions } from "@/lib/auth/cookie-options";
import {
  isDevOverrideRuntimeAllowed,
  isDevOverrideToken,
  mintDevOverrideToken,
  parseDevOverrideToken,
  toDevFullSession,
} from "@/lib/auth/dev-override";
import {
  createSessionToken,
  getSessionExpiry,
  hashToken,
  normalizeWalletAddress,
} from "@/lib/auth/siws";
import type { AuthContext } from "@/lib/security/authorization";

export const REFRESH_COOKIE_NAME = "ph_refresh";

export type FullSessionContext = AuthContext & {
  sessionId: string;
  accountStatus: AccountStatus;
  onboardingComplete: boolean;
  emailVerified: boolean;
  email: string | null;
  displayName: string | null;
  username: string | null;
  lastLocationPath: string | null;
  lockedUntil: Date | null;
  isBanned: boolean;
};

function rememberMeExpiry(): Date {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
}

function standardExpiry(): Date {
  return getSessionExpiry();
}

export async function createUserSession(params: {
  userId: string;
  walletAddress?: string | null;
  rememberMe?: boolean;
  deviceId?: string | null;
  userAgentHash?: string;
  ipHash?: string;
  authMethod?: AuthContext["authMethod"];
}): Promise<{
  token: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  rememberMe: boolean;
}> {
  const token = createSessionToken();
  const refreshToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const refreshTokenHash = hashToken(refreshToken);
  const rememberMe = Boolean(params.rememberMe);
  const expiresAt = rememberMe ? rememberMeExpiry() : standardExpiry();
  const refreshExpiresAt = rememberMe
    ? rememberMeExpiry()
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  await prisma.session.create({
    data: {
      userId: params.userId,
      walletAddress: params.walletAddress
        ? normalizeWalletAddress(params.walletAddress)
        : "",
      tokenHash,
      refreshTokenHash,
      refreshExpiresAt,
      expiresAt,
      rememberMe,
      deviceId: params.deviceId ?? undefined,
      userAgentHash: params.userAgentHash,
      ipHash: params.ipHash,
      lastSeenAt: new Date(),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(authDefaults.COOKIE_NAME, token, {
    ...secureCookieOptions(rememberMe ? 60 * 60 * 24 * 30 : undefined),
    expires: expiresAt,
  });
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    ...secureCookieOptions(rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 14),
    expires: refreshExpiresAt,
  });

  await prisma.user.update({
    where: { id: params.userId },
    data: { lastLoginAt: new Date() },
  });

  return { token, refreshToken, expiresAt, refreshExpiresAt, rememberMe };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authDefaults.COOKIE_NAME)?.value;
  if (token && !isDevOverrideToken(token)) {
    try {
      await prisma.session.updateMany({
        where: { tokenHash: hashToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // DB down — still clear cookies.
    }
  }
  cookieStore.set(authDefaults.COOKIE_NAME, "", {
    ...secureCookieOptions(),
    expires: new Date(0),
  });
  cookieStore.set(REFRESH_COOKIE_NAME, "", {
    ...secureCookieOptions(),
    expires: new Date(0),
  });
}

/**
 * Issue a local-only Development Override session cookie.
 * Signed token — no production DB write required. Rejects in production.
 */
export async function createDevOverrideSession(): Promise<{
  token: string;
  mode: "local-signed";
}> {
  if (!isDevOverrideRuntimeAllowed()) {
    throw new Error("DEV_OVERRIDE_FORBIDDEN");
  }
  const token = mintDevOverrideToken();
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  cookieStore.set(authDefaults.COOKIE_NAME, token, {
    ...secureCookieOptions(60 * 60 * 24 * 7),
    expires: expiresAt,
  });
  return { token, mode: "local-signed" };
}

export async function destroyAllSessions(userId: string): Promise<number> {
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await destroySession();
  return result.count;
}

export async function rotateRefreshSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  if (!refresh) return false;

  const existing = await prisma.session.findUnique({
    where: { refreshTokenHash: hashToken(refresh) },
    include: { user: true },
  });

  if (
    !existing ||
    existing.revokedAt ||
    !existing.refreshExpiresAt ||
    existing.refreshExpiresAt < new Date() ||
    existing.user.deletedAt ||
    existing.user.isBanned ||
    existing.user.accountStatus === "BANNED" ||
    existing.user.accountStatus === "DELETED"
  ) {
    return false;
  }

  // Rotate: revoke old, issue new.
  await prisma.session.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  await createUserSession({
    userId: existing.userId,
    walletAddress: existing.walletAddress,
    rememberMe: existing.rememberMe,
    deviceId: existing.deviceId,
    userAgentHash: existing.userAgentHash ?? undefined,
    ipHash: existing.ipHash ?? undefined,
  });

  return true;
}

function toAuthContext(session: {
  userId: string;
  walletAddress: string | null;
  user: {
    role: string;
    profile: { tokenTier: TokenTier } | null;
  };
}): AuthContext {
  const wallet =
    session.walletAddress && session.walletAddress.length > 0
      ? session.walletAddress
      : null;
  return {
    userId: session.userId,
    walletAddress: wallet,
    role: session.user.role,
    tokenTier: session.user.profile?.tokenTier ?? "VISITOR",
    authMethod: wallet ? "wallet_siws" : "email",
  };
}

export async function getSessionContext(): Promise<AuthContext | null> {
  const full = await getFullSessionContext();
  if (!full) return null;
  return {
    userId: full.userId,
    walletAddress: full.walletAddress,
    role: full.role,
    tokenTier: full.tokenTier,
    authMethod: full.authMethod,
  };
}

export async function getFullSessionContext(): Promise<FullSessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authDefaults.COOKIE_NAME)?.value;
  if (!token) return null;

  // Local Development Override — signed cookie, no DB required.
  const devPayload = parseDevOverrideToken(token);
  if (devPayload) {
    return toDevFullSession(devPayload);
  }
  if (isDevOverrideToken(token)) {
    // Prefix present but invalid / production — treat as no session.
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: {
        user: { include: { profile: true } },
      },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    if (session.user.deletedAt) {
      return null;
    }

    // Touch lastSeen (best-effort, ignore errors).
    void prisma.session
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => undefined);

    const base = toAuthContext(session);
    const onboardingComplete = Boolean(session.user.onboardingCompletedAt);

    return {
      ...base,
      sessionId: session.id,
      accountStatus: session.user.accountStatus,
      onboardingComplete,
      emailVerified: Boolean(session.user.emailVerifiedAt),
      email: session.user.email,
      displayName: session.user.profile?.displayName ?? null,
      username: session.user.profile?.username ?? null,
      lastLocationPath: session.user.profile?.lastLocationPath ?? null,
      lockedUntil: session.user.lockedUntil,
      isBanned: session.user.isBanned || session.user.accountStatus === "BANNED",
    };
  } catch {
    // DB unavailable — do not crash gameplay gate.
    return null;
  }
}

export function hashIp(ip: string | null): string | undefined {
  if (!ip) return undefined;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function hashUserAgent(ua: string | null): string | undefined {
  if (!ua) return undefined;
  return createHash("sha256").update(ua).digest("hex").slice(0, 32);
}
