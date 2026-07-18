import { PITY_MIN_RARITY, PITY_THRESHOLD, rarityIndex } from "@/lib/loyalty/config";
import type { RewardRarity } from "@/lib/loyalty/types";

export function shouldForcePity(
  pityCount: number,
  threshold = PITY_THRESHOLD,
): boolean {
  return pityCount >= threshold;
}

/** True if rolled rarity is below pity floor (COMMON when pity wants UNCOMMON+). */
export function isBelowPityFloor(
  rarity: RewardRarity,
  floor: RewardRarity = PITY_MIN_RARITY,
): boolean {
  return rarityIndex(rarity) < rarityIndex(floor);
}

/**
 * Update pity counter after a roll.
 * Hitting UNCOMMON+ resets; otherwise increments.
 */
export function nextPityCount(
  current: number,
  rolledRarity: RewardRarity,
  floor: RewardRarity = PITY_MIN_RARITY,
): number {
  if (rarityIndex(rolledRarity) >= rarityIndex(floor)) return 0;
  return current + 1;
}
