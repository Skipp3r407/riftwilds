/**
 * Lightweight unlock hooks — call from hatch/care/story paths when wiring is easy.
 * Uses in-memory demo metrics until PlayerAchievement persistence is connected.
 */

import { evaluateAchievements, type MetricBag } from "@/game/achievements/evaluator";
import type { AchievementDef } from "@/game/achievements/catalog";

const demoMetrics: MetricBag = {
  egg_claim_count: 1,
  hatch_count: 1,
  care_streak_days: 3,
  feed_count: 12,
  region_discovery: 2,
  gateway_activations: 1,
  live_world_enters: 1,
  arena_training_wins: 4,
  marketplace_views: 1,
  codex_species_unlocked: 8,
};

const demoUnlocked = new Set<string>(["first_claim", "first_hatch", "live_world_enter"]);

export function getDemoAchievementMetrics(): MetricBag {
  return { ...demoMetrics };
}

export function getDemoUnlockedKeys(): string[] {
  return [...demoUnlocked];
}

export function recordAchievementMetric(
  metric: string,
  delta = 1,
): AchievementDef[] {
  demoMetrics[metric] = (demoMetrics[metric] ?? 0) + delta;
  const { newlyUnlocked } = evaluateAchievements(demoMetrics, [...demoUnlocked]);
  for (const a of newlyUnlocked) demoUnlocked.add(a.key);
  return newlyUnlocked;
}

/** Hatchery hook — call after successful hatch. */
export function onPetHatched(): AchievementDef[] {
  return [
    ...recordAchievementMetric("hatch_count", 1),
  ];
}

/** Story engine hook. */
export function onStoryChoiceMade(): AchievementDef[] {
  return recordAchievementMetric("story_choices", 1);
}

/** Civilization contribution hook. */
export function onCivilizationContribute(): AchievementDef[] {
  return recordAchievementMetric("civ_contributions", 1);
}

/** Archivist consult hook. */
export function onArchivistConsult(): AchievementDef[] {
  return recordAchievementMetric("archivist_consults", 1);
}
