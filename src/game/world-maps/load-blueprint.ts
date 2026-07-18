import { getBlueprint } from "@/game/world-maps/blueprints";
import { REGION_BY_SLUG, isRegionUnlockedLocally } from "@/game/world-maps/regions";
import type { MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { loadTravelProgress } from "@/game/world-travel/progress";
import { isPortalUnlockSatisfied } from "@/game/world-travel/unlocks";
import { loadLivePlayState } from "@/game/npcs/play-state";

export type LoadedMap = {
  blueprint: MapBlueprint;
  regionName: string;
  sceneKey: string;
  playable: boolean;
  portals: WorldMapObject[];
  npcs: WorldMapObject[];
  resources: WorldMapObject[];
  buildings: WorldMapObject[];
  waypoints: WorldMapObject[];
  gateways: WorldMapObject[];
};

function liveUnlockProgress() {
  try {
    const travel = loadTravelProgress();
    return {
      playerLevel: travel.playerLevel,
      storyChapters: travel.storyChapters,
      bossesDefeated: travel.bossesDefeated,
      gateways: travel.gatewaysRestored,
      regionsVisited: travel.regionsDiscovered,
      reputation: travel.reputation,
      completedQuests: travel.completedQuests,
    };
  } catch {
    return {
      playerLevel: 1,
      storyChapters: [] as string[],
      bossesDefeated: [] as string[],
      gateways: [] as string[],
      regionsVisited: ["riftwild-commons"],
      reputation: {} as Record<string, number>,
      completedQuests: [] as string[],
    };
  }
}

/** Respect PLAYABLE_LIVE_WORLD_* flags + real progression for region entry. */
export function canEnterLiveWorldRegion(slug: string): boolean {
  if (!featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED) return false;
  const region = REGION_BY_SLUG[slug];
  if (!region) return false;
  if (region.playability === "blueprint_only") return false;
  if (region.hubOpen) return true;
  return isRegionUnlockedLocally(slug, liveUnlockProgress());
}

export function loadMap(slug: string): LoadedMap {
  const blueprint = getBlueprint(slug);
  const region = REGION_BY_SLUG[slug];
  const objects = blueprint.objects;
  return {
    blueprint,
    regionName: region?.name ?? blueprint.name,
    sceneKey: region?.sceneKey ?? `${slug}-scene`,
    playable: canEnterLiveWorldRegion(slug),
    portals: objects.filter((o) => o.type === "portal"),
    npcs: objects.filter((o) => o.type === "npc"),
    resources: objects.filter((o) => o.type === "resource"),
    buildings: objects.filter((o) => o.type === "building"),
    waypoints: objects.filter((o) => o.type === "waypoint"),
    gateways: objects.filter(
      (o) => o.type === "gateway" || o.metadata?.gatewayStone === true,
    ),
  };
}

/** Dynamic portal lock — unlockFlag + region gates + play flags. */
export function isPortalLocked(portal: WorldMapObject): boolean {
  const lockedByDefault = portal.metadata?.locked === true;
  const unlockFlag =
    portal.unlockFlag ??
    (typeof portal.metadata?.unlockFlag === "string"
      ? portal.metadata.unlockFlag
      : undefined);

  let playFlags: string[] = [];
  try {
    playFlags = loadLivePlayState().flags;
  } catch {
    playFlags = [];
  }

  const open = isPortalUnlockSatisfied(
    unlockFlag,
    lockedByDefault,
    liveUnlockProgress(),
    playFlags,
  );
  return !open;
}
