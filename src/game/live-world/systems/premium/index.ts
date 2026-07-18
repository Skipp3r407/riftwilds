export {
  TERRAIN_KEYS,
  PROP_KEYS,
  BUILDING_KEYS,
  ACTOR_KEYS,
  terrainTex,
  propTex,
  buildingTex,
  actorTex,
  buildingKeyFromObjectId,
} from "@/game/live-world/systems/premium/asset-keys";
export {
  buildElevationGrid,
  resolveTerrainTexture,
  commonsPropScatter,
  isPremiumRegion,
  hash2,
} from "@/game/live-world/systems/premium/premium-logic";
export { drawPremiumTerrain } from "@/game/live-world/systems/premium/layered-terrain";
export {
  spawnPremiumProps,
  trySpawnBuildingSprite,
  trySpawnDecorationSprite,
  trySpawnResourceSprite,
  resourcePropKey,
} from "@/game/live-world/systems/premium/world-props";
export {
  createAtmosphere,
  type AtmosphereHandles,
  type AtmosphereState,
  type WeatherKind,
} from "@/game/live-world/systems/premium/atmosphere";
export {
  attachIsoCamera,
  type IsoCameraController,
} from "@/game/live-world/systems/premium/iso-camera";
export {
  CAMERA_ZOOM_STORAGE_KEY,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  NON_PREMIUM_DEFAULT_ZOOM,
  ZOOM_STEP,
  clampCameraZoom,
  loadPersistedCameraZoom,
  persistCameraZoom,
} from "@/game/live-world/systems/premium/camera-zoom";
