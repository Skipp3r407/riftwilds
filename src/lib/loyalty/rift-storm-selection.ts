/**
 * Fair selection — verified participation + streak + pity + recent rewards
 * + anti-AFK + account age + fraud risk + randomness.
 * Not pure playtime. New players still have a chance.
 */

import { STORM_TIER_WEIGHT_BOOST, intensityWeightBoost } from "@/lib/loyalty/rift-storm-config";
import type { StormIntensityTier, StormParticipantState } from "@/lib/loyalty/rift-storm-types";
import type { LoyaltyTier } from "@/lib/loyalty/types";

export type SelectionFactors = {
  participationScore: number;
  tierBoost: number;
  intensityBoost: number;
  pityBonus: number;
  recentRewardPenalty: number;
  accountAgeFactor: number;
  fraudPenalty: number;
  randomFactor: number;
  /** Final weight used in wave rolls / win chance. */
  weight: number;
};

/**
 * Account age: new players get a gentle floor (still chance), veterans slight bonus — capped.
 */
export function accountAgeFactor(accountAgeDays: number): number {
  if (accountAgeDays <= 3) return 0.92; // slight softener, not a ban
  if (accountAgeDays <= 14) return 1;
  if (accountAgeDays <= 90) return 1.05;
  return 1.08;
}

export function recentRewardPenalty(recentCount: number): number {
  if (recentCount <= 0) return 1;
  if (recentCount === 1) return 0.92;
  if (recentCount === 2) return 0.82;
  return 0.7;
}

export function computeSelectionWeight(params: {
  participant: StormParticipantState;
  loyaltyTier: LoyaltyTier;
  intensity: StormIntensityTier;
  pityCount: number;
  rng?: () => number;
}): SelectionFactors {
  const rng = params.rng ?? Math.random;
  const tierBoost = 1 + STORM_TIER_WEIGHT_BOOST[params.loyaltyTier];
  const intensityBoost = intensityWeightBoost(params.intensity);
  const pityBonus = params.pityCount >= 5 ? 1.2 : params.pityCount >= 3 ? 1.1 : 1;
  const recentPenalty = recentRewardPenalty(params.participant.recentRewardIds.length);
  const age = accountAgeFactor(params.participant.accountAgeDays);
  const fraudPenalty = Math.max(0.15, 1 - params.participant.fraudRisk);
  // Randomness in [0.75, 1.25] — secure enough for demo; production should use CSPRNG.
  const randomFactor = 0.75 + rng() * 0.5;

  const base = Math.max(0.1, params.participant.score);
  const weight =
    base * tierBoost * intensityBoost * pityBonus * recentPenalty * age * fraudPenalty * randomFactor;

  return {
    participationScore: params.participant.score,
    tierBoost,
    intensityBoost,
    pityBonus,
    recentRewardPenalty: recentPenalty,
    accountAgeFactor: age,
    fraudPenalty,
    randomFactor,
    weight,
  };
}

/**
 * Convert selection weight into a wave win probability (never 100% for best rewards).
 * Guaranteed final wave uses separate path.
 */
export function weightToWinChance(weight: number, waveMinScore: number): number {
  const normalized = weight / Math.max(1, waveMinScore * 3);
  return Math.min(0.85, Math.max(0.05, normalized * 0.45));
}

/** Apply tier weight boost to table entry weights (improve odds, never guarantee). */
export function applyTierWeightBoost(baseWeight: number, loyaltyTier: LoyaltyTier): number {
  return baseWeight * (1 + STORM_TIER_WEIGHT_BOOST[loyaltyTier]);
}
