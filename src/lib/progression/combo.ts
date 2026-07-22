/**
 * Multi-activity combo XP bonuses.
 * 2 / 4 / 6 / 10 distinct categories → +10% / +20% / +30% / +50%.
 */

import type { XpSourceCategory } from "@/lib/progression/types";

/** Rolling window for counting distinct XP activity categories. */
export const COMBO_WINDOW_MS = 60 * 60 * 1000;

export const COMBO_TIERS: ReadonlyArray<{ minActivities: number; bonusPercent: number }> = [
  { minActivities: 10, bonusPercent: 50 },
  { minActivities: 6, bonusPercent: 30 },
  { minActivities: 4, bonusPercent: 20 },
  { minActivities: 2, bonusPercent: 10 },
];

export function comboBonusPercent(activityCount: number): number {
  const n = Math.max(0, Math.floor(activityCount));
  for (const tier of COMBO_TIERS) {
    if (n >= tier.minActivities) return tier.bonusPercent;
  }
  return 0;
}

export function comboMultiplierLabel(percent: number): string {
  if (percent <= 0) return "x1.0";
  return `x${(1 + percent / 100).toFixed(1)}`;
}

export function refreshComboWindow(params: {
  activities: XpSourceCategory[];
  windowStartedAt: number;
  category: XpSourceCategory;
  now: number;
}): {
  activities: XpSourceCategory[];
  windowStartedAt: number;
  bonusPercent: number;
} {
  let activities = [...params.activities];
  let windowStartedAt = params.windowStartedAt;
  if (!windowStartedAt || params.now - windowStartedAt > COMBO_WINDOW_MS) {
    activities = [];
    windowStartedAt = params.now;
  }
  if (!activities.includes(params.category)) {
    activities.push(params.category);
  }
  return {
    activities,
    windowStartedAt,
    bonusPercent: comboBonusPercent(activities.length),
  };
}
