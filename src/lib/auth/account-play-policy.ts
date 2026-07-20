/**
 * Client-safe play policy helpers (no next/headers).
 * Server gate logic stays in account-gate.ts.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";

export function isAccountRequiredForPlay(): boolean {
  return (
    featureFlagDefaults.AUTH_ACCOUNT_REQUIRED_FOR_PLAY === true ||
    featureFlagDefaults.AUTH_WALLET_OPTIONAL_PLAY === false
  );
}

export function isGuestGameplayAllowed(): boolean {
  return !isAccountRequiredForPlay();
}
