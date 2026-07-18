export {
  TERRAIN_KEYS,
  PROP_KEYS,
  TREE_PROP_KEYS,
  LIBRARY_PROP_KEYS,
  LIBRARY_WORLD_KEYS,
  BUILDING_KEYS,
  ACTOR_KEYS,
  terrainTex,
  propTex,
  buildingTex,
  actorTex,
  buildingKeyFromObjectId,
  isTreeProp,
  isLibraryWorldKey,
  isLibraryTreeKey,
} from "@/game/live-world/systems/premium/asset-keys";
export {
  buildElevationGrid,
  resolveTerrainTexture,
  commonsPropScatter,
  filterScatterForBudget,
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
  updateBuildingRoofFade,
  updateOccluderFades,
  collectBuildingFacades,
  collectOccluders,
  drawCityWallVisuals,
  drawTownStreetFurniture,
  type BuildingFacade,
  type Occluder,
  type PremiumPropSpawnResult,
} from "@/game/live-world/systems/premium/world-props";
export {
  DEPTH,
  depthAt,
  addContactShadow,
} from "@/game/live-world/systems/premium/depth-layers";
export {
  KEEPER_DISPLAY,
  PET_DISPLAY,
  actorContactShadow,
  scaleNpcDisplayHeight,
  ensureCozyActorAnims,
  playCozyActorAnim,
  KEEPER_WALK_ANIM,
  PET_WALK_ANIM,
} from "@/game/live-world/systems/premium/actor-presentation";
export {
  ACTOR_SHEET_KEYS,
  actorSheetTex,
  KEEPER_SHEET_FRAME,
  PET_SHEET_FRAME,
} from "@/game/live-world/systems/premium/asset-keys";
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
