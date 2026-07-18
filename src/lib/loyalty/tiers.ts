import { TIER_BADGES, TIER_LABELS, TIER_THRESHOLDS } from "@/lib/loyalty/config";
import type { LoyaltyTier } from "@/lib/loyalty/types";
import { LOYALTY_TIERS } from "@/lib/loyalty/types";

/** Derive loyalty tier from consecutive daily streak (and optional bonuses). */
export function tierFromDailyStreak(dailyStreak: number): LoyaltyTier {
  let tier: LoyaltyTier = "BRONZE";
  for (const row of TIER_THRESHOLDS) {
    if (dailyStreak >= row.minDailyStreak) tier = row.tier;
  }
  return tier;
}

export function tierMeetsMinimum(current: LoyaltyTier, minimum: LoyaltyTier): boolean {
  return LOYALTY_TIERS.indexOf(current) >= LOYALTY_TIERS.indexOf(minimum);
}

export function tierDisplay(tier: LoyaltyTier): { label: string; badgeId: string; tier: LoyaltyTier } {
  return { tier, label: TIER_LABELS[tier], badgeId: TIER_BADGES[tier] };
}

export function nextTierProgress(dailyStreak: number): {
  current: LoyaltyTier;
  next: LoyaltyTier | null;
  daysToNext: number | null;
  progressRatio: number;
} {
  const current = tierFromDailyStreak(dailyStreak);
  const idx = LOYALTY_TIERS.indexOf(current);
  const next = idx < LOYALTY_TIERS.length - 1 ? LOYALTY_TIERS[idx + 1]! : null;
  if (!next) {
    return { current, next: null, daysToNext: null, progressRatio: 1 };
  }
  const nextThreshold = TIER_THRESHOLDS.find((t) => t.tier === next)!.minDailyStreak;
  const currentThreshold = TIER_THRESHOLDS.find((t) => t.tier === current)!.minDailyStreak;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const into = Math.max(0, dailyStreak - currentThreshold);
  return {
    current,
    next,
    daysToNext: Math.max(0, nextThreshold - dailyStreak),
    progressRatio: Math.min(1, into / span),
  };
}
