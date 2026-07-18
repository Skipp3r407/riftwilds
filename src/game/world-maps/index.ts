export type {
  MapBlueprint,
  MapLayerKind,
  RegionIdentity,
  WorldMapObject,
  WorldMapObjectType,
  UnlockTier,
} from "@/game/world-maps/types";
export {
  REGION_IDENTITIES,
  REGION_BY_SLUG,
  REGION_UNLOCK_GATES,
  WORLD_PAGE_SLUGS,
  isRegionUnlockedLocally,
} from "@/game/world-maps/regions";
export { getBlueprint, allBlueprints } from "@/game/world-maps/blueprints";
export {
  loadMap,
  canEnterLiveWorldRegion,
  isPortalLocked,
} from "@/game/world-maps/load-blueprint";
export { RESOURCE_DEFS } from "@/game/world-maps/defs/resources";
export { ENEMY_DEFS } from "@/game/world-maps/defs/enemies";
export { NPC_CATALOG } from "@/game/world-maps/defs/npcs";
export { PORTAL_DEFS } from "@/game/world-maps/defs/portals";
export {
  CONTINENT_SPINE,
  GATEWAY_STONES,
  isRegionUnlocked,
  getRegionUnlockView,
} from "@/game/world-travel";
