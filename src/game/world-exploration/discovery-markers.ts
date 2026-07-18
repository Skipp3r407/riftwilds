/**
 * Treasure / POI / habitat / enemy / boss / perk markers with spoiler-safe visibility.
 */

import {
  EXPLORATION_PERKS,
  getDiscoverableCatalog,
} from "@/game/world-exploration/discovery-catalog";
import {
  hasEarnedPerk,
  isBossDefeated,
  isDiscovered,
  loadExplorationProgress,
} from "@/game/world-exploration/progress";
import { iconKeyForMarker } from "@/game/world-exploration/map-icons";
import { codexHrefForDiscoverable } from "@/game/world-exploration/codex-links";
import type { MapMarker } from "@/game/world-exploration/types";
import { loadQuestDemoState } from "@/game/quests/quest-demo-store";

function hasClueUnlocked(def: { clueQuestKeys?: string[] }): boolean {
  if (!def.clueQuestKeys?.length) return false;
  const demo = loadQuestDemoState();
  return def.clueQuestKeys.some((k) => {
    const s = demo[k]?.status;
    return s === "active" || s === "completed";
  });
}

export function buildDiscoveryMarkers(opts?: {
  regionSlug?: string | null;
  includeHints?: boolean;
}): MapMarker[] {
  const includeHints = opts?.includeHints ?? true;
  const progress = loadExplorationProgress();
  const treasureSense = progress.earnedPerkIds.includes("perk-treasure-sense");
  const markers: MapMarker[] = [];

  for (const def of getDiscoverableCatalog()) {
    if (opts?.regionSlug && def.regionSlug !== opts.regionSlug) continue;
    const discovered = isDiscovered(def.id);

    if (!discovered) {
      // Never expose coords/names for secrets
      if (!includeHints) continue;
      const clueOk = hasClueUnlocked(def) || (treasureSense && def.kind === "treasure");
      if (!clueOk) continue;

      markers.push({
        id: `hint-${def.id}`,
        kind:
          def.kind === "treasure"
            ? "treasure"
            : def.kind === "habitat"
              ? "habitat"
              : def.kind === "world_boss"
                ? "world_boss"
                : def.kind === "enemy_territory"
                  ? "enemy_territory"
                  : def.kind === "poi" || def.kind === "landmark"
                    ? "poi"
                    : "poi",
        category:
          def.kind === "treasure"
            ? "treasures"
            : def.kind === "habitat"
              ? "habitats"
              : def.kind === "world_boss"
                ? "bosses"
                : def.kind === "enemy_territory"
                  ? "enemies"
                  : "pois",
        regionSlug: def.regionSlug,
        x: null,
        y: null,
        label: "Uncharted lead",
        subtitle: def.clue,
        state: "undiscovered",
        visibility: "region_hint",
        iconKey: iconKeyForMarker(
          def.kind === "treasure"
            ? "treasure"
            : def.kind === "world_boss"
              ? "world_boss"
              : def.kind === "enemy_territory"
                ? "enemy_territory"
                : def.kind === "habitat"
                  ? "habitat"
                  : "poi",
        ),
        searchText: `${def.regionSlug} clue uncharted`.toLowerCase(),
        codexHref: null,
        clusterKey: `${def.regionSlug}:hints`,
        priority: 15,
        metadata: { hintOnly: true, discoverableId: def.id },
      });
      continue;
    }

    // Discovered — full pin
    const claimed = progress.claimedTreasureIds.includes(def.id);
    const defeated =
      def.kind === "world_boss" && def.bossId ? isBossDefeated(def.bossId) : false;

    let kind: MapMarker["kind"] = "poi";
    let category: MapMarker["category"] = "pois";
    if (def.kind === "treasure") {
      kind = "treasure";
      category = "treasures";
    } else if (def.kind === "habitat") {
      kind = "habitat";
      category = "habitats";
    } else if (def.kind === "world_boss") {
      kind = "world_boss";
      category = "bosses";
    } else if (def.kind === "enemy_territory") {
      kind = "enemy_territory";
      category = "enemies";
    } else if (def.kind === "perk") {
      kind = "perk";
      category = "perks";
    } else if (def.kind === "landmark") {
      kind = "landmark";
      category = "pois";
    }

    // Habitats: region-level after discovery (coords ok but labelled as habitat zone)
    const regionLevel = def.kind === "habitat";

    markers.push({
      id: `disc-${def.id}`,
      kind,
      category,
      regionSlug: def.regionSlug,
      x: regionLevel ? def.x : def.x,
      y: regionLevel ? def.y : def.y,
      label: def.secretName,
      subtitle: claimed
        ? "Claimed"
        : defeated
          ? "Defeated"
          : def.clue,
      state: claimed ? "claimed" : defeated ? "defeated" : "discovered",
      visibility: "discovered",
      iconKey: iconKeyForMarker(kind),
      searchText: `${def.secretName} ${def.regionSlug} ${def.kind}`.toLowerCase(),
      codexHref: codexHrefForDiscoverable(def),
      sourceObjectId: def.id,
      clusterKey: `${def.regionSlug}:${category}`,
      priority:
        kind === "world_boss" ? 90 : kind === "treasure" ? 70 : kind === "habitat" ? 55 : 40,
      metadata: {
        discoverableId: def.id,
        habitatSpeciesSlug: def.habitatSpeciesSlug,
        bossId: def.bossId,
        enemyId: def.enemyId,
      },
    });
  }

  // Earned perks as map badges (never show unearned perk names)
  for (const perk of EXPLORATION_PERKS) {
    if (!hasEarnedPerk(perk.id)) continue;
    if (opts?.regionSlug && perk.regionSlug && perk.regionSlug !== opts.regionSlug) {
      continue;
    }
    const regionSlug = perk.regionSlug ?? "riftwild-commons";
    markers.push({
      id: `perk-${perk.id}`,
      kind: "perk",
      category: "perks",
      regionSlug,
      x: null,
      y: null,
      label: perk.name,
      subtitle: perk.description,
      state: "discovered",
      visibility: "discovered",
      iconKey: iconKeyForMarker("perk"),
      searchText: `${perk.name} perk`.toLowerCase(),
      codexHref: null,
      clusterKey: `${regionSlug}:perks`,
      priority: 25,
      metadata: { perkId: perk.id },
    });
  }

  return markers;
}
