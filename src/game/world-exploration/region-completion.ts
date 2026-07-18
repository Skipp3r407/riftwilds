/**
 * Per-region exploration completion % and world rollup.
 */

import { getBlueprint } from "@/game/world-maps/blueprints";
import {
  fogCoverageRatio,
  loadFogState,
} from "@/game/live-world/systems/exploration-fog";
import { listDiscoverablesForRegion } from "@/game/world-exploration/discovery-catalog";
import {
  isBossDefeated,
  isDiscovered,
} from "@/game/world-exploration/progress";
import { QUEST_CATALOG } from "@/game/quests/quest-catalog";
import { loadQuestDemoState } from "@/game/quests/quest-demo-store";
import { resolveLiveRegionSlug } from "@/game/world-exploration/region-aliases";
import type { RegionCompletionSnapshot } from "@/game/world-exploration/types";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";

function ratio(total: number, found: number): number {
  if (total <= 0) return 1;
  return Math.min(1, found / total);
}

export function getRegionCompletion(regionSlug: string): RegionCompletionSnapshot {
  let fogPercent = 0;
  let landmarksTotal = 0;
  let landmarksDiscovered = 0;

  try {
    const bp = getBlueprint(regionSlug);
    fogPercent = Math.round(
      fogCoverageRatio(regionSlug, bp.camera.width, bp.camera.height) * 100,
    );
    const regionFog = loadFogState().regions[regionSlug];
    const discoveredWaypoints = new Set(regionFog?.discoveredWaypoints ?? []);
    const discoveredLandmarks = new Set(regionFog?.discoveredLandmarks ?? []);

    for (const o of bp.objects) {
      if (!o.id.startsWith("lm-") && o.type !== "waypoint") continue;
      landmarksTotal++;
      if (
        isDiscovered(`landmark-${regionSlug}-${o.id}`) ||
        discoveredWaypoints.has(o.id) ||
        discoveredLandmarks.has(o.id)
      ) {
        landmarksDiscovered++;
      }
    }
  } catch {
    /* empty region */
  }

  const disc = listDiscoverablesForRegion(regionSlug);
  const treasures = disc.filter((d) => d.kind === "treasure");
  const pois = disc.filter(
    (d) => d.kind === "poi" || d.kind === "landmark" || d.kind === "hidden_area",
  );
  const habitats = disc.filter((d) => d.kind === "habitat");
  const bosses = disc.filter((d) => d.kind === "world_boss");

  const treasuresFound = treasures.filter((d) => isDiscovered(d.id)).length;
  const poisFound = pois.filter((d) => isDiscovered(d.id)).length;
  const habitatsFound = habitats.filter((d) => isDiscovered(d.id)).length;
  const bossesDefeated = bosses.filter(
    (d) => d.bossId && isBossDefeated(d.bossId),
  ).length;

  const demo = loadQuestDemoState();
  const regionQuests = QUEST_CATALOG.filter(
    (q) => resolveLiveRegionSlug(q.regionKey) === regionSlug,
  );
  const questsComplete = regionQuests.filter(
    (q) => demo[q.key]?.status === "completed",
  ).length;
  const questsTotal = regionQuests.length;

  const percentComplete = Math.round(
    fogPercent * 0.25 +
      ratio(treasures.length, treasuresFound) * 100 * 0.2 +
      ratio(pois.length, poisFound) * 100 * 0.15 +
      ratio(habitats.length, habitatsFound) * 100 * 0.1 +
      ratio(bosses.length, bossesDefeated) * 100 * 0.1 +
      ratio(questsTotal, questsComplete) * 100 * 0.1 +
      ratio(landmarksTotal, landmarksDiscovered) * 100 * 0.1,
  );

  return {
    regionSlug,
    fogPercent,
    landmarksDiscovered,
    landmarksTotal,
    treasuresFound,
    treasuresTotal: treasures.length,
    poisFound,
    poisTotal: pois.length,
    habitatsFound,
    habitatsTotal: habitats.length,
    bossesDefeated,
    bossesTotal: bosses.length,
    questsComplete,
    questsTotal,
    percentComplete: Math.min(100, percentComplete),
  };
}

export function listRegionCompletions(): RegionCompletionSnapshot[] {
  return REGION_IDENTITIES.map((r) => getRegionCompletion(r.slug));
}
