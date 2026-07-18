/**
 * Weighted airdrop rolls — tier multipliers + pity floor.
 * Not pure equal odds; higher tiers get better rare weights.
 */

import {
  PITY_MIN_RARITY,
  TIER_RARITY_MULTIPLIERS,
  rarityIndex,
  tierIndex,
} from "@/lib/loyalty/config";
import { shouldForcePity } from "@/lib/loyalty/pity";
import { tierMeetsMinimum } from "@/lib/loyalty/tiers";
import type {
  AirdropRewardDef,
  LoyaltyTier,
  RewardRarity,
  WeightedRollResult,
} from "@/lib/loyalty/types";

export type WeightEntry = {
  reward: AirdropRewardDef;
  effectiveWeight: number;
};

export function eligibleRewards(
  table: AirdropRewardDef[],
  tier: LoyaltyTier,
  options?: { pityForced?: boolean; pityFloor?: RewardRarity },
): AirdropRewardDef[] {
  const pityForced = options?.pityForced ?? false;
  const pityFloor = options?.pityFloor ?? PITY_MIN_RARITY;

  return table.filter((r) => {
    if (r.minTier && !tierMeetsMinimum(tier, r.minTier)) return false;
    if (r.exclusiveOnly && r.minTier && !tierMeetsMinimum(tier, r.minTier)) return false;
    if (pityForced && rarityIndex(r.rarity) < rarityIndex(pityFloor)) return false;
    return true;
  });
}

export function computeWeights(
  table: AirdropRewardDef[],
  tier: LoyaltyTier,
  options?: { pityForced?: boolean },
): WeightEntry[] {
  const pool = eligibleRewards(table, tier, options);
  const mults = TIER_RARITY_MULTIPLIERS[tier];

  return pool
    .map((reward) => {
      const mult = mults[reward.rarity] ?? 1;
      const effectiveWeight = Math.max(0, reward.weight * mult);
      return { reward, effectiveWeight };
    })
    .filter((e) => e.effectiveWeight > 0);
}

/**
 * Deterministic-friendly weighted pick.
 * `rng` should return [0, 1). Inject for tests.
 */
export function weightedPick(
  entries: WeightEntry[],
  rng: () => number = Math.random,
): { reward: AirdropRewardDef; roll: number; totalWeight: number } | null {
  if (!entries.length) return null;
  const totalWeight = entries.reduce((s, e) => s + e.effectiveWeight, 0);
  if (totalWeight <= 0) return null;

  let roll = rng() * totalWeight;
  if (!Number.isFinite(roll) || roll < 0) roll = 0;
  // Clamp away from totalWeight edge so last entry is reachable
  if (roll >= totalWeight) roll = totalWeight - Number.EPSILON;

  let cursor = 0;
  for (const entry of entries) {
    cursor += entry.effectiveWeight;
    if (roll < cursor) {
      return { reward: entry.reward, roll, totalWeight };
    }
  }
  return {
    reward: entries[entries.length - 1]!.reward,
    roll,
    totalWeight,
  };
}

export function rollAirdrop(
  table: AirdropRewardDef[],
  tier: LoyaltyTier,
  pityCount: number,
  rng: () => number = Math.random,
): WeightedRollResult | null {
  const pityForced = shouldForcePity(pityCount);
  let entries = computeWeights(table, tier, { pityForced });

  // Fallback: if pity emptied the pool somehow, use full eligible set
  if (!entries.length && pityForced) {
    entries = computeWeights(table, tier, { pityForced: false });
  }

  const picked = weightedPick(entries, rng);
  if (!picked) return null;

  return {
    reward: picked.reward,
    roll: picked.roll,
    totalWeight: picked.totalWeight,
    pityApplied: pityForced,
    tier,
  };
}

/** Relative rare-weight share for analytics / admin stubs. */
export function rareWeightShare(table: AirdropRewardDef[], tier: LoyaltyTier): number {
  const entries = computeWeights(table, tier);
  const total = entries.reduce((s, e) => s + e.effectiveWeight, 0);
  if (total <= 0) return 0;
  const rare = entries
    .filter((e) => rarityIndex(e.reward.rarity) >= rarityIndex("RARE"))
    .reduce((s, e) => s + e.effectiveWeight, 0);
  return rare / total;
}

export function compareTierAdvantage(lower: LoyaltyTier, higher: LoyaltyTier): boolean {
  return tierIndex(higher) > tierIndex(lower);
}
