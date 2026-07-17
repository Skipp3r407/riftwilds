import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  countContentByKind,
  listExpansionPacks,
} from "@/game/expansion/registry";
import { ensureCoreDecadePackRegistered } from "@/game/expansion/packs/core-decade-pack";
import type { EcosystemSnapshot } from "@/game/expansion/types";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { resolveActiveDisaster } from "@/game/living-world/disasters";
import {
  civilizationProgressPercent,
  getCivilizationProgress,
} from "@/game/civilization/progress-store";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";
import { ACHIEVEMENT_CATALOG } from "@/game/achievements/catalog";
import { resolveFestivalOccurrences } from "@/game/festivals/calendar";

const EXPANSION_FLAGS = [
  "EXPANSION_FRAMEWORK_ENABLED",
  "LIVING_WORLD_CLOCK_ENABLED",
  "STORY_ENGINE_ENABLED",
  "CIVILIZATION_RESTORATION_ENABLED",
  "ACHIEVEMENT_UNIVERSE_ENABLED",
  "PROCEDURAL_EXPEDITIONS_ENABLED",
  "FESTIVALS_ENABLED",
  "GENETICS_V2_ENABLED",
  "RIFTLING_AI_ENABLED",
  "AI_ARCHIVIST_ENABLED",
  "ECOSYSTEM_DASHBOARD_ENABLED",
  "ENDGAME_RAIDS_ENABLED",
  "ENDLESS_RIFT_ENABLED",
  "CINEMATICS_ENABLED",
  "ANALYTICS_DASHBOARD_ENABLED",
] as const;

export function buildEcosystemSnapshot(atMs: number = Date.now()): EcosystemSnapshot {
  ensureCoreDecadePackRegistered();
  const clock = resolveLivingWorldClock(atMs);
  const disaster = resolveActiveDisaster(clock);
  const civ = getCivilizationProgress();
  const festivals = resolveFestivalOccurrences(clock);

  const flags: Record<string, boolean> = {};
  for (const key of EXPANSION_FLAGS) {
    flags[key] = featureFlagDefaults[key as keyof typeof featureFlagDefaults] ?? false;
  }

  return {
    generatedAt: new Date(atMs).toISOString(),
    packs: listExpansionPacks(),
    countsByKind: countContentByKind(),
    livingWorld: {
      season: clock.labels.season,
      dayPhase: clock.labels.dayPhase,
      weather: clock.labels.weather,
      disasterActive: disaster?.disaster.key ?? null,
    },
    civilization: {
      era: `Era ${civ.era}`,
      progressPercent: civilizationProgressPercent(),
      unlockedMilestones: civ.unlockedMilestoneKeys.length,
      totalMilestones: CIVILIZATION_MILESTONES.length,
    },
    achievements: { catalogSize: ACHIEVEMENT_CATALOG.length },
    festivals: {
      upcoming: festivals.filter((f) => !f.active).length,
      active: festivals.filter((f) => f.active).length,
    },
    flags,
  };
}
