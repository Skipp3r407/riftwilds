/**
 * SOL economy feature-flag helpers.
 * All real-money paths default OFF. Legacy flags remain as additional gates.
 */

import {
  featureFlagDefaults,
  isFeatureEnabled,
  type FeatureFlagKey,
  type FeatureFlagOverrides,
} from "@/lib/config/feature-flags";

/** Mandate SOL flags — all must default false in featureFlagDefaults. */
export const SOL_ECONOMY_FLAG_KEYS = [
  "SOL_WALLET_ENABLED",
  "SOL_PURCHASES_ENABLED",
  "SOL_MARKETPLACE_ENABLED",
  "SOL_TOURNAMENTS_ENABLED",
  "SOL_MINTING_ENABLED",
  "SOL_WITHDRAWALS_ENABLED",
  "SOL_CREATOR_MARKETPLACE_ENABLED",
  "SOL_COMMUNITY_FUNDING_ENABLED",
] as const satisfies readonly FeatureFlagKey[];

export type SolEconomyFlagKey = (typeof SOL_ECONOMY_FLAG_KEYS)[number];

export function solFlagDefaults(): Record<SolEconomyFlagKey, boolean> {
  return {
    SOL_WALLET_ENABLED: featureFlagDefaults.SOL_WALLET_ENABLED,
    SOL_PURCHASES_ENABLED: featureFlagDefaults.SOL_PURCHASES_ENABLED,
    SOL_MARKETPLACE_ENABLED: featureFlagDefaults.SOL_MARKETPLACE_ENABLED,
    SOL_TOURNAMENTS_ENABLED: featureFlagDefaults.SOL_TOURNAMENTS_ENABLED,
    SOL_MINTING_ENABLED: featureFlagDefaults.SOL_MINTING_ENABLED,
    SOL_WITHDRAWALS_ENABLED: featureFlagDefaults.SOL_WITHDRAWALS_ENABLED,
    SOL_CREATOR_MARKETPLACE_ENABLED: featureFlagDefaults.SOL_CREATOR_MARKETPLACE_ENABLED,
    SOL_COMMUNITY_FUNDING_ENABLED: featureFlagDefaults.SOL_COMMUNITY_FUNDING_ENABLED,
  };
}

/** True only if every mandate SOL flag is false (safe default posture). */
export function allSolEconomyFlagsOff(overrides?: FeatureFlagOverrides): boolean {
  return SOL_ECONOMY_FLAG_KEYS.every((k) => !isFeatureEnabled(k, overrides));
}

/** Live SOL marketplace requires both new + legacy marketplace gates. */
export function isSolMarketplaceLive(overrides?: FeatureFlagOverrides): boolean {
  return (
    isFeatureEnabled("SOL_MARKETPLACE_ENABLED", overrides) &&
    isFeatureEnabled("REAL_SOL_MARKETPLACE_ENABLED", overrides) &&
    isFeatureEnabled("SOL_PURCHASES_ENABLED", overrides)
  );
}

export function isSolPurchaseLive(overrides?: FeatureFlagOverrides): boolean {
  return (
    isFeatureEnabled("SOL_PURCHASES_ENABLED", overrides) &&
    isFeatureEnabled("SOL_WALLET_ENABLED", overrides)
  );
}

export function isSolMintingLive(overrides?: FeatureFlagOverrides): boolean {
  return (
    isFeatureEnabled("SOL_MINTING_ENABLED", overrides) &&
    isFeatureEnabled("NFT_MINTING_ENABLED", overrides) &&
    isFeatureEnabled("ONCHAIN_COLLECTIBLES_ENABLED", overrides)
  );
}

export function isSolTournamentEntryLive(overrides?: FeatureFlagOverrides): boolean {
  return (
    isFeatureEnabled("SOL_TOURNAMENTS_ENABLED", overrides) &&
    isFeatureEnabled("SOL_PURCHASES_ENABLED", overrides)
  );
}
