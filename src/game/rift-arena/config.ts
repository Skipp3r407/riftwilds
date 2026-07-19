/**
 * Rift Arena config — free play default.
 * SOL stake / escrow amounts exist for Phase 2 scaffolding only and never activate
 * without RIFT_ARENA_SOL_STAKES_ENABLED + SOL_WALLET_ENABLED (both default OFF).
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";

export const riftArenaConfig = {
  FREE_QUEUE_MAX_WAIT_MS: 45_000,
  RANKED_PROVISIONAL_GAMES: 10,
  RANKED_START_RATING: 1000,
  DAILY_FREE_MATCH_SOFT_CAP: 80,
  /** Soft client cue — not enforced stakes. */
  TURN_TIMER_SECONDS: 90,
  DISCLOSURES: {
    skillFirst:
      "Rift Arena winners are decided by skill-based card play. No gambling, slots, roulette, or chance loot boxes.",
    freeDefault:
      "The default experience is free play. SOL Arena is an optional, clearly separate mode and stays disabled until explicitly flagged on.",
    noGuaranteedEarnings:
      "Riftwilds never promises guaranteed earnings from Arena play, spectating, or staking.",
    noP2W:
      "Participation is optional. No paid power that buys competitive card strength.",
  },
  /**
   * Phase 2 scaffold only — amounts never charged while stakes flag is OFF.
   * Values are documentation for future escrow wiring.
   */
  SOL_STAKE_TIERS_LAMPORTS_DOC: [
    { id: "micro", label: "Micro", lamports: 10_000_000 },
    { id: "standard", label: "Standard", lamports: 50_000_000 },
    { id: "high", label: "High", lamports: 250_000_000 },
  ] as const,
} as const;

export function isRiftArenaSolStakesLive(): boolean {
  // Cast: defaults are literal `false`; runtime overrides may flip via settings later.
  const flags = featureFlagDefaults as Record<string, boolean | string | number>;
  return (
    flags.RIFT_ARENA_SOL_STAKES_ENABLED === true &&
    flags.RIFT_ARENA_SOL_ESCROW_ENABLED === true &&
    flags.SOL_WALLET_ENABLED === true &&
    (REAL_VALUE_WAGERING_ENABLED as boolean) === true
  );
}

export function assertRiftArenaSolStakesOffInPhase1(): void {
  if (isRiftArenaSolStakesLive()) {
    throw new Error(
      "SOL Arena stakes must remain OFF until compliance + escrow product enablement.",
    );
  }
}
