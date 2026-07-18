/**
 * Activity-category diminishing returns — diversity restores value.
 */

import type { ActivityCategory } from "@/lib/social-presence/types";

export const DIMINISH_WINDOW_MS = 30 * 60_000;

/** Multiplier by count of same category in the rolling window. */
export function categoryMultiplier(countInWindow: number): number {
  if (countInWindow <= 2) return 1;
  if (countInWindow <= 4) return 0.75;
  if (countInWindow <= 7) return 0.5;
  if (countInWindow <= 12) return 0.3;
  return 0.15;
}

export function applyDiminishing(
  baseXp: number,
  category: ActivityCategory,
  counts: Partial<Record<ActivityCategory, number>>,
): { xp: number; multiplier: number; category: ActivityCategory } {
  const count = counts[category] ?? 0;
  const multiplier = categoryMultiplier(count);
  return {
    xp: Math.max(1, Math.floor(baseXp * multiplier)),
    multiplier,
    category,
  };
}

export function bumpCategoryCount(
  counts: Partial<Record<ActivityCategory, number>>,
  category: ActivityCategory,
  windowStartedAt: number,
  now = Date.now(),
): {
  counts: Partial<Record<ActivityCategory, number>>;
  windowStartedAt: number;
} {
  if (now - windowStartedAt > DIMINISH_WINDOW_MS) {
    return { counts: { [category]: 1 }, windowStartedAt: now };
  }
  return {
    counts: { ...counts, [category]: (counts[category] ?? 0) + 1 },
    windowStartedAt,
  };
}
