/**
 * Shared playable world-map types for Riftwilds Live World.
 * Machine-readable blueprints drive Phaser scenes + validation.
 */

export type MapLayerKind =
  | "ground"
  | "decorative"
  | "collision"
  | "interactive"
  | "overhead"
  | "effects";

export type WorldMapObjectType =
  | "decoration"
  | "resource"
  | "npc"
  | "enemy_spawn"
  | "portal"
  | "door"
  | "chest"
  | "quest"
  | "puzzle"
  | "waypoint"
  | "shop"
  | "hazard"
  | "building"
  | "fishing_spot"
  | "farm_plot"
  | "safe_zone"
  | "spawn"
  | "hidden_area"
  | "boss_arena";

export type UnlockTier =
  | "start"
  | "early"
  | "mid"
  | "late"
  | "endgame";

export type RegionPlayability =
  | "playable"
  | "enterable_stub"
  | "blueprint_only";

export type WeatherKey =
  | "clear"
  | "light_rain"
  | "mist"
  | "fireflies"
  | "ash_storm"
  | "heat_shimmer"
  | "coastal_fog"
  | "aurora"
  | "blizzard"
  | "spirit_mist"
  | "rift_aurora"
  | "sparks_rain"
  | "void_distortion"
  | "starfall";

export interface WorldMapObject {
  id: string;
  type: WorldMapObjectType;
  regionId: string;
  sceneId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  collision?: boolean;
  interactive?: boolean;
  interactionRadius?: number;
  requiredQuestId?: string;
  requiredAbility?: string;
  requiredItemId?: string;
  /** Progression unlock — never paid pet / paid region. */
  unlockFlag?: string;
  respawnSeconds?: number;
  label?: string;
  color?: number;
  metadata?: Record<string, unknown>;
}

export interface MapZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind:
    | "settlement"
    | "exploration"
    | "danger"
    | "dungeon"
    | "hidden"
    | "boss"
    | "safe"
    | "pathway";
  safe?: boolean;
}

export interface PathwayDef {
  id: string;
  from: string;
  to: string;
  waypoints: { x: number; y: number }[];
  locked?: boolean;
  unlockFlag?: string;
  requiredAbility?: string;
}

export interface CollisionRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: "wall" | "hazard" | "building" | "cliff" | "water" | "lava";
}

export interface MinimapMeta {
  width: number;
  height: number;
  landmarkPins: {
    id: string;
    label: string;
    x: number;
    y: number;
    icon: string;
  }[];
}

export interface CameraBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionIdentity {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  unlockTier: UnlockTier;
  musicKey: string;
  weatherKeys: WeatherKey[];
  defaultWeather: WeatherKey;
  tilePalette: {
    ground: number;
    path: number;
    accent: number;
    hazard?: number;
    water?: number;
  };
  spawn: { x: number; y: number };
  /** Soft capacity hint for future instance sharding. */
  instanceCapacity: number;
  playability: RegionPlayability;
  sceneKey: string;
  bossName?: string;
  /** Hub regions open from start (no paid unlock). */
  hubOpen: boolean;
}

export interface MapBlueprint {
  schemaVersion: 1;
  regionId: string;
  slug: string;
  name: string;
  tileSize: number;
  cols: number;
  rows: number;
  layers: MapLayerKind[];
  zones: MapZone[];
  pathways: PathwayDef[];
  objects: WorldMapObject[];
  colliders: CollisionRect[];
  camera: CameraBounds;
  minimap: MinimapMeta;
  weatherKeys: WeatherKey[];
  musicKey: string;
  safeZones: { id: string; x: number; y: number; width: number; height: number }[];
  spawn: { x: number; y: number };
  portalHub?: { x: number; y: number; radius: number };
  notes?: string[];
  completeness: "FULL" | "PARTIAL";
}
