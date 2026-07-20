/**
 * Development Override — local/dev-only auth bypass for Riftwilds.
 *
 * NEVER active when NODE_ENV === "production".
 * See docs/DEV_OVERRIDE.md.
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { AccountStatus, TokenTier } from "@prisma/client";
import type { AuthContext } from "@/lib/security/authorization";
import type { FullSessionContext } from "@/lib/auth/session";

export const DEV_OVERRIDE_USER_ID = "dev-keeper-local";
export const DEV_OVERRIDE_TOKEN_PREFIX = "devov.";
export const DEV_MOCK_STORAGE_KEY = "riftwilds:dev-override:v1";

export type DevKeeperProfile = {
  userId: string;
  displayName: string;
  username: string;
  email: string;
  role: "admin";
  level: number;
  softCurrency: number;
  shards: number;
  solTestBalance: number;
  developer: true;
  unlocks: {
    cards: true;
    companions: true;
    comics: true;
    areas: true;
    quests: true;
    marketplace: true;
    guild: true;
    housing: true;
  };
};

/** Canonical local-only Dev Keeper — never written to production DB. */
export const DEV_KEEPER_PROFILE: DevKeeperProfile = {
  userId: DEV_OVERRIDE_USER_ID,
  displayName: "Dev Keeper",
  username: "dev_keeper",
  email: "dev-keeper@localhost",
  role: "admin",
  level: 100,
  softCurrency: 9_999_999,
  shards: 9_999_999,
  solTestBalance: 100,
  developer: true,
  unlocks: {
    cards: true,
    companions: true,
    comics: true,
    areas: true,
    quests: true,
    marketplace: true,
    guild: true,
    housing: true,
  },
};

function envFlagTrue(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

/** Explicit temporary login-bypass flags (alias + legacy). */
function hasDevBypassFlag(env: NodeJS.ProcessEnv): boolean {
  return (
    envFlagTrue(env.DEV_OVERRIDE) ||
    envFlagTrue(env.NEXT_PUBLIC_DEV_OVERRIDE) ||
    envFlagTrue(env.AUTH_DEV_BYPASS) ||
    envFlagTrue(env.NEXT_PUBLIC_AUTH_DEV_BYPASS)
  );
}

/**
 * True production hosts — override must never run here even with flags.
 * Vercel preview (`VERCEL_ENV=preview`) is not true production.
 */
export function isTrueProductionAuthContext(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") {
    return false;
  }
  return (
    env.VERCEL_ENV === "production" ||
    env.NODE_ENV === "production" ||
    env.NEXT_PHASE === "phase-production-build"
  );
}

/**
 * Server + build safeguard: override may never run on true production.
 * Allowed when:
 * - `NODE_ENV === "development"` (local `npm run dev`), or
 * - explicit bypass flags on non-true-production (incl. Vercel preview), or
 * - non-production NODE_ENV with those flags (e.g. test).
 */
export function isDevOverrideRuntimeAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.VERCEL_ENV === "production") return false;
  if (env.NODE_ENV === "development") return true;

  const flagged = hasDevBypassFlag(env);

  // Vercel preview / Vercel development — require explicit flag.
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") {
    return flagged;
  }

  // Local `next start` / unknown production — never (flags ignored).
  if (env.NODE_ENV === "production") return false;

  return flagged;
}

/**
 * Client-safe visibility (bundled).
 * Local `npm run dev` always shows the button. Preview stacks need
 * `NEXT_PUBLIC_AUTH_DEV_BYPASS=1` or `NEXT_PUBLIC_DEV_OVERRIDE=true`
 * (assert scripts block those flags on true production builds).
 */
export function isDevOverrideUiEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return (
    envFlagTrue(process.env.NEXT_PUBLIC_DEV_OVERRIDE) ||
    envFlagTrue(process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS)
  );
}

/**
 * Live World / Restoration soft-gate helper: public stays Coming Soon,
 * but local/dev override (or explicit DEV_PREVIEW env) may open entry.
 */
export function isLiveWorldDevAccessAllowed(
  env: {
    nodeEnv?: string | undefined;
    nextPublicDevOverride?: string | undefined;
    liveWorldDevPreviewEnv?: string | undefined;
  } = {},
): boolean {
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv === "production") return false;
  if (nodeEnv === "development") return true;
  if (envFlagTrue(env.nextPublicDevOverride ?? process.env.NEXT_PUBLIC_DEV_OVERRIDE)) {
    return true;
  }
  if (envFlagTrue(process.env.NEXT_PUBLIC_AUTH_DEV_BYPASS)) return true;
  if (envFlagTrue(env.liveWorldDevPreviewEnv ?? process.env.LIVE_WORLD_DEV_PREVIEW_ENABLED)) {
    return true;
  }
  if (envFlagTrue(process.env.DEV_OVERRIDE) || envFlagTrue(process.env.AUTH_DEV_BYPASS)) {
    return true;
  }
  return false;
}

function signingSecret(env: NodeJS.ProcessEnv = process.env): string {
  return (
    env.SESSION_SECRET ||
    env.DEV_OVERRIDE_SECRET ||
    "riftwilds-local-dev-override-not-for-production"
  );
}

type DevSessionPayload = {
  sub: string;
  role: string;
  developer: true;
  displayName: string;
  username: string;
  exp: number;
  iat: number;
};

function b64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

export function mintDevOverrideToken(
  ttlSeconds = 60 * 60 * 24 * 7,
  now = Date.now(),
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!isDevOverrideRuntimeAllowed(env)) {
    throw new Error("DEV_OVERRIDE_FORBIDDEN");
  }
  const payload: DevSessionPayload = {
    sub: DEV_OVERRIDE_USER_ID,
    role: "admin",
    developer: true,
    displayName: DEV_KEEPER_PROFILE.displayName,
    username: DEV_KEEPER_PROFILE.username,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + ttlSeconds,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", signingSecret(env))
    .update(body)
    .digest();
  return `${DEV_OVERRIDE_TOKEN_PREFIX}${body}.${b64url(sig)}`;
}

export function parseDevOverrideToken(
  token: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): DevSessionPayload | null {
  if (!token || !token.startsWith(DEV_OVERRIDE_TOKEN_PREFIX)) return null;
  if (!isDevOverrideRuntimeAllowed(env)) return null;

  const raw = token.slice(DEV_OVERRIDE_TOKEN_PREFIX.length);
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const sigPart = raw.slice(dot + 1);
  if (!body || !sigPart) return null;

  let expected: Buffer;
  try {
    expected = fromB64url(sigPart);
  } catch {
    return null;
  }
  const actual = createHmac("sha256", signingSecret(env))
    .update(body)
    .digest();
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as DevSessionPayload;
    if (!payload?.developer || payload.sub !== DEV_OVERRIDE_USER_ID) return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isDevOverrideToken(token: string | null | undefined): boolean {
  return Boolean(token?.startsWith(DEV_OVERRIDE_TOKEN_PREFIX));
}

export function toDevFullSession(
  payload?: DevSessionPayload | null,
): FullSessionContext {
  const p = payload;
  return {
    userId: DEV_OVERRIDE_USER_ID,
    walletAddress: null,
    role: "admin",
    tokenTier: "FOUNDER" as TokenTier,
    authMethod: "email",
    sessionId: "dev-override-local",
    accountStatus: "ACTIVE" as AccountStatus,
    onboardingComplete: true,
    emailVerified: true,
    email: DEV_KEEPER_PROFILE.email,
    displayName: p?.displayName ?? DEV_KEEPER_PROFILE.displayName,
    username: p?.username ?? DEV_KEEPER_PROFILE.username,
    lastLocationPath: "/play",
    lockedUntil: null,
    isBanned: false,
  };
}

export function toDevAuthContext(): AuthContext & { developer: true } {
  return {
    userId: DEV_OVERRIDE_USER_ID,
    walletAddress: null,
    role: "admin",
    tokenTier: "FOUNDER",
    authMethod: "email",
    developer: true,
  };
}

/** Build-time: throw if true production build still has override env enabled. */
export function assertNoDevOverrideInProductionBuild(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (!isTrueProductionAuthContext(env)) return;

  if (hasDevBypassFlag(env)) {
    throw new Error(
      "[DEV_OVERRIDE] Refusing production build: unset DEV_OVERRIDE / NEXT_PUBLIC_DEV_OVERRIDE / AUTH_DEV_BYPASS / NEXT_PUBLIC_AUTH_DEV_BYPASS.",
    );
  }
}
