import { getBlueprint } from "@/game/world-maps/blueprints";
import { REGION_BY_SLUG, isRegionUnlockedLocally } from "@/game/world-maps/regions";
import type { MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

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
};

/** Respect PLAYABLE_LIVE_WORLD_* flags for whether Phaser may enter a region. */
export function canEnterLiveWorldRegion(slug: string): boolean {
  if (!featureFlagDefaults.PLAYABLE_LIVE_WORLD_ENABLED) return false;
  const region = REGION_BY_SLUG[slug];
  if (!region) return false;
  if (region.playability === "blueprint_only") return false;
  // Starter hubs open; progression gates apply for locked portals
  if (region.hubOpen) return true;
  return isRegionUnlockedLocally(slug, {
    playerLevel: 99,
    storyChapters: [
      "chapter-2",
      "chapter-3",
      "chapter-4",
      "chapter-5",
      "chapter-6",
      "chapter-8",
    ],
    bossesDefeated: ["radiant-sentinel", "void-riftborn"],
    gateways: ["world-rift-gate"],
  });
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
  };
}

export function isPortalLocked(portal: WorldMapObject): boolean {
  return portal.metadata?.locked === true;
}
