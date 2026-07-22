/**
 * Client-safe play policy helpers (no next/headers).
 * Server gate logic stays in account-gate.ts.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";

/** Matches resolveGameplayGate preview identity when AUTH_LOCAL_PREVIEW_BYPASS is on. */
export const LOCAL_PREVIEW_USER_ID = "local-preview-user";
export const LOCAL_PREVIEW_OWNER_KEY = `sess_${LOCAL_PREVIEW_USER_ID}`;

export function isAccountRequiredForPlay(): boolean {
  return (
    featureFlagDefaults.AUTH_ACCOUNT_REQUIRED_FOR_PLAY === true ||
    featureFlagDefaults.AUTH_WALLET_OPTIONAL_PLAY === false
  );
}

export function isGuestGameplayAllowed(): boolean {
  return !isAccountRequiredForPlay();
}

/**
 * Local-only preview when Postgres/auth cannot mint a real session.
 * Must stay in sync with middleware + resolveGameplayGate — otherwise the
 * Practice Board loads while /api/tcg/match/* returns NO_SESSION.
 */
export function isLocalPreviewBypass(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.NODE_ENV !== "production" && env.AUTH_LOCAL_PREVIEW_BYPASS === "true"
  );
}
