/**
 * Server-side gameplay gate — source of truth for NO ACCOUNT = NO GAMEPLAY.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AccountStatus } from "@prisma/client";
import {
  evaluateAccountStatus,
  type AccountGateBlocked,
} from "@/lib/auth/account-status";
import {
  DEV_OVERRIDE_USER_ID,
  isDevOverrideRuntimeAllowed,
} from "@/lib/auth/dev-override";
import { destroySession, getFullSessionContext } from "@/lib/auth/session";
import { authDefaults } from "@/lib/config/project";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { createRequestId } from "@/lib/utils/request-id";
import type { AuthContext } from "@/lib/security/authorization";

export {
  isAccountRequiredForPlay,
  isGuestGameplayAllowed,
} from "@/lib/auth/account-play-policy";

export type GameplaySession = AuthContext & {
  accountStatus: AccountStatus;
  onboardingComplete: boolean;
  emailVerified: boolean;
  displayName: string | null;
  username: string | null;
  lastLocationPath: string | null;
  /** True only for local Development Override sessions. */
  developer?: boolean;
};

export async function resolveGameplayGate(opts?: {
  returnUrl?: string;
  requireOnboarding?: boolean;
}): Promise<
  | { ok: true; session: GameplaySession }
  | { ok: false; decision: AccountGateBlocked }
> {
  // Local-only preview when Postgres is unavailable (see AUTH_LOCAL_PREVIEW_BYPASS).
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_LOCAL_PREVIEW_BYPASS === "true"
  ) {
    return {
      ok: true,
      session: {
        userId: "local-preview-user",
        walletAddress: null,
        role: "player",
        tokenTier: "VISITOR",
        authMethod: "email",
        accountStatus: "ACTIVE",
        onboardingComplete: true,
        emailVerified: true,
        displayName: "Preview Keeper",
        username: "preview_keeper",
        lastLocationPath: opts?.returnUrl ?? "/play",
      },
    };
  }

  const full = await getFullSessionContext();
  if (!full) {
    return {
      ok: false,
      decision: {
        ok: false,
        canPlay: false,
        reason: "NO_SESSION",
        clearSession: true,
        redirectTo: `/login?returnUrl=${encodeURIComponent(opts?.returnUrl ?? "/play")}`,
        message: "Sign in to play Riftwilds. Guest gameplay is disabled.",
      },
    };
  }

  const decision = evaluateAccountStatus({
    status: full.accountStatus,
    onboardingComplete:
      opts?.requireOnboarding === false ? true : full.onboardingComplete,
    lockedUntil: full.lockedUntil,
    returnUrl: opts?.returnUrl,
  });

  if (decision.ok === false) {
    return { ok: false, decision };
  }

  const developer =
    isDevOverrideRuntimeAllowed() && full.userId === DEV_OVERRIDE_USER_ID;

  return {
    ok: true,
    session: {
      userId: full.userId,
      walletAddress: full.walletAddress,
      role: full.role,
      tokenTier: full.tokenTier,
      authMethod: full.authMethod,
      accountStatus: full.accountStatus,
      onboardingComplete: full.onboardingComplete,
      emailVerified: full.emailVerified,
      displayName: full.displayName,
      username: full.username,
      lastLocationPath: full.lastLocationPath,
      ...(developer ? { developer: true as const } : {}),
    },
  };
}

/** API helper — 401 JSON when guest / bad account. */
export async function requireGameplayApi(opts?: {
  requestId?: string;
  requireOnboarding?: boolean;
}): Promise<GameplaySession> {
  const requestId = opts?.requestId ?? createRequestId();
  const gate = await resolveGameplayGate({
    requireOnboarding: opts?.requireOnboarding,
  });
  if (gate.ok === false) {
    if (gate.decision.clearSession) {
      await destroySession();
    }
    throw new AppError({
      code:
        gate.decision.reason === "BANNED" || gate.decision.reason === "SUSPENDED"
          ? ErrorCodes.FORBIDDEN
          : ErrorCodes.UNAUTHORIZED,
      message: gate.decision.message,
      requestId,
      status:
        gate.decision.reason === "BANNED" || gate.decision.reason === "SUSPENDED"
          ? 403
          : 401,
    });
  }
  return gate.session;
}

export function unauthorizedGameplayResponse(
  requestId: string,
  message = "Sign in required — guest gameplay is disabled.",
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: ErrorCodes.UNAUTHORIZED,
        message,
        requestId,
        retryable: false,
      },
    },
    { status: 401, headers: { "X-Request-Id": requestId } },
  );
}

/** Clear ph_session + legacy guest cookies. */
export async function clearGameplayCookies(): Promise<void> {
  const jar = await cookies();
  const expire = { path: "/", expires: new Date(0) };
  jar.set(authDefaults.COOKIE_NAME, "", expire);
  jar.set("rift_guest", "", expire);
  jar.set("tcg_guest", "", expire);
  jar.set("ph_refresh", "", expire);
}
