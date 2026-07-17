import {
  ACHIEVEMENT_CATALOG,
  type AchievementDef,
} from "@/game/achievements/catalog";

export type MetricBag = Record<string, number>;

export type UnlockResult = {
  newlyUnlocked: AchievementDef[];
  alreadyUnlocked: string[];
};

/** Pure evaluation — compare bag of metrics against catalog criteria. */
export function evaluateAchievements(
  metrics: MetricBag,
  alreadyUnlockedKeys: readonly string[] = [],
): UnlockResult {
  const unlocked = new Set(alreadyUnlockedKeys);
  const newlyUnlocked: AchievementDef[] = [];

  for (const def of ACHIEVEMENT_CATALOG) {
    if (unlocked.has(def.key)) continue;
    const value = metrics[def.criteria.metric] ?? 0;
    if (value >= def.criteria.target) {
      newlyUnlocked.push(def);
      unlocked.add(def.key);
    }
  }

  return {
    newlyUnlocked,
    alreadyUnlocked: [...unlocked].filter((k) => !newlyUnlocked.some((n) => n.key === k)),
  };
}

export function mergeMetrics(base: MetricBag, delta: MetricBag): MetricBag {
  const out = { ...base };
  for (const [k, v] of Object.entries(delta)) {
    out[k] = (out[k] ?? 0) + v;
  }
  return out;
}
