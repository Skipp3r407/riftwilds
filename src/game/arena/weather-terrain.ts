import type { AffinityName } from "@prisma/client";

/** Original Riftwilds field conditions — not elemental weather clones of other IPs. */
export const WEATHER_IDS = [
  "CLEAR",
  "EMBER_HAZE",
  "TIDAL_MIST",
  "GROVE_POLLEN",
  "STORMFRONT",
  "STONE_DUST",
  "FROST_SHEEN",
  "RADIANT_GLOW",
  "VOID_GLOOM",
  "ALLOY_STATIC",
  "SPIRIT_AURORA",
] as const;

export type WeatherId = (typeof WEATHER_IDS)[number];

export const TERRAIN_IDS = [
  "NEUTRAL_RING",
  "EMBER_FLOOR",
  "TIDAL_BASIN",
  "GROVE_ROOTS",
  "STORM_PLATFORM",
  "STONE_PLATEAU",
  "FROST_SHELF",
  "RADIANT_DAIS",
  "VOID_RIFT",
  "ALLOY_GRID",
  "SPIRIT_CIRCLE",
] as const;

export type TerrainId = (typeof TERRAIN_IDS)[number];

export type FieldMods = {
  /** Affinity damage dealt multipliers while field is active. */
  affinityDealt?: Partial<Record<AffinityName, number>>;
  /** Flat energy regen at energy phase. */
  energyRegen?: number;
  /** Speed multiplier for all combatants. */
  speedMul?: number;
  accuracyFlat?: number;
};

export type WeatherDef = {
  id: WeatherId;
  name: string;
  description: string;
  mods: FieldMods;
  /** Suggested biome for arena art. */
  biomeHint: string;
};

export type TerrainDef = {
  id: TerrainId;
  name: string;
  description: string;
  mods: FieldMods;
  biomeHint: string;
};

export const WEATHER_CATALOG: Record<WeatherId, WeatherDef> = {
  CLEAR: {
    id: "CLEAR",
    name: "Clear Skies",
    description: "No weather pressure.",
    mods: {},
    biomeHint: "commons",
  },
  EMBER_HAZE: {
    id: "EMBER_HAZE",
    name: "Ember Haze",
    description: "Warm ash thickens the air — Ember techniques flare.",
    mods: { affinityDealt: { EMBER: 1.1, FROST: 0.92 }, energyRegen: 1 },
    biomeHint: "ember",
  },
  TIDAL_MIST: {
    id: "TIDAL_MIST",
    name: "Tidal Mist",
    description: "Moisture softens impacts and feeds Tide arts.",
    mods: { affinityDealt: { TIDE: 1.1, EMBER: 0.92 }, accuracyFlat: -2 },
    biomeHint: "tide",
  },
  GROVE_POLLEN: {
    id: "GROVE_POLLEN",
    name: "Grove Pollen",
    description: "Living pollen steadies Grove and slows Alloy.",
    mods: { affinityDealt: { GROVE: 1.1, ALLOY: 0.94 }, energyRegen: 2 },
    biomeHint: "grove",
  },
  STORMFRONT: {
    id: "STORMFRONT",
    name: "Stormfront",
    description: "Pressure builds — Storm moves crackle faster.",
    mods: { affinityDealt: { STORM: 1.12, STONE: 0.94 }, speedMul: 1.05 },
    biomeHint: "storm",
  },
  STONE_DUST: {
    id: "STONE_DUST",
    name: "Stone Dust",
    description: "Grit armor favors Stone; Spirit fades.",
    mods: { affinityDealt: { STONE: 1.1, SPIRIT: 0.94 } },
    biomeHint: "stone",
  },
  FROST_SHEEN: {
    id: "FROST_SHEEN",
    name: "Frost Sheen",
    description: "Ice glaze boosts Frost and chills Ember.",
    mods: { affinityDealt: { FROST: 1.1, EMBER: 0.9 }, speedMul: 0.97 },
    biomeHint: "frost",
  },
  RADIANT_GLOW: {
    id: "RADIANT_GLOW",
    name: "Radiant Glow",
    description: "Bright rift-light empowers Radiant.",
    mods: { affinityDealt: { RADIANT: 1.1, VOID: 0.92 }, accuracyFlat: 3 },
    biomeHint: "radiant",
  },
  VOID_GLOOM: {
    id: "VOID_GLOOM",
    name: "Void Gloom",
    description: "Dim veil strengthens Void and muddles aim.",
    mods: { affinityDealt: { VOID: 1.12, RADIANT: 0.9 }, accuracyFlat: -4 },
    biomeHint: "void",
  },
  ALLOY_STATIC: {
    id: "ALLOY_STATIC",
    name: "Alloy Static",
    description: "Metal hums — Alloy techniques spark.",
    mods: { affinityDealt: { ALLOY: 1.1, TIDE: 0.94 }, energyRegen: 1 },
    biomeHint: "alloy",
  },
  SPIRIT_AURORA: {
    id: "SPIRIT_AURORA",
    name: "Spirit Aurora",
    description: "Soft aurora lifts Spirit and Bond.",
    mods: { affinityDealt: { SPIRIT: 1.1, ALLOY: 0.94 }, energyRegen: 2 },
    biomeHint: "spirit",
  },
};

export const TERRAIN_CATALOG: Record<TerrainId, TerrainDef> = {
  NEUTRAL_RING: {
    id: "NEUTRAL_RING",
    name: "Neutral Ring",
    description: "Standard sparring floor.",
    mods: {},
    biomeHint: "commons",
  },
  EMBER_FLOOR: {
    id: "EMBER_FLOOR",
    name: "Ember Floor",
    description: "Warm plates favor Ember footwork.",
    mods: { affinityDealt: { EMBER: 1.08 }, speedMul: 1.03 },
    biomeHint: "ember",
  },
  TIDAL_BASIN: {
    id: "TIDAL_BASIN",
    name: "Tidal Basin",
    description: "Shallow pools feed Tide recovery.",
    mods: { affinityDealt: { TIDE: 1.08 }, energyRegen: 2 },
    biomeHint: "tide",
  },
  GROVE_ROOTS: {
    id: "GROVE_ROOTS",
    name: "Grove Roots",
    description: "Living roots brace Grove defenses.",
    mods: { affinityDealt: { GROVE: 1.08 } },
    biomeHint: "grove",
  },
  STORM_PLATFORM: {
    id: "STORM_PLATFORM",
    name: "Storm Platform",
    description: "Conductive plating hastens Storm.",
    mods: { affinityDealt: { STORM: 1.08 }, speedMul: 1.04 },
    biomeHint: "storm",
  },
  STONE_PLATEAU: {
    id: "STONE_PLATEAU",
    name: "Stone Plateau",
    description: "Solid ground favors Stone braces.",
    mods: { affinityDealt: { STONE: 1.08 } },
    biomeHint: "stone",
  },
  FROST_SHELF: {
    id: "FROST_SHELF",
    name: "Frost Shelf",
    description: "Slick ice aids Frost and risks slips.",
    mods: { affinityDealt: { FROST: 1.08 }, accuracyFlat: -2 },
    biomeHint: "frost",
  },
  RADIANT_DAIS: {
    id: "RADIANT_DAIS",
    name: "Radiant Dais",
    description: "Bright stone sharpens Radiant aim.",
    mods: { affinityDealt: { RADIANT: 1.08 }, accuracyFlat: 2 },
    biomeHint: "radiant",
  },
  VOID_RIFT: {
    id: "VOID_RIFT",
    name: "Void Rift",
    description: "Unstable floor cloaks Void steps.",
    mods: { affinityDealt: { VOID: 1.1 } },
    biomeHint: "void",
  },
  ALLOY_GRID: {
    id: "ALLOY_GRID",
    name: "Alloy Grid",
    description: "Machined grid powers Alloy arts.",
    mods: { affinityDealt: { ALLOY: 1.08 }, energyRegen: 1 },
    biomeHint: "alloy",
  },
  SPIRIT_CIRCLE: {
    id: "SPIRIT_CIRCLE",
    name: "Spirit Circle",
    description: "Warded circle soothes Spirit casters.",
    mods: { affinityDealt: { SPIRIT: 1.08 }, energyRegen: 2 },
    biomeHint: "spirit",
  },
};

export function weatherForAffinity(affinity: AffinityName): WeatherId {
  const map: Record<AffinityName, WeatherId> = {
    EMBER: "EMBER_HAZE",
    TIDE: "TIDAL_MIST",
    GROVE: "GROVE_POLLEN",
    STORM: "STORMFRONT",
    STONE: "STONE_DUST",
    FROST: "FROST_SHEEN",
    RADIANT: "RADIANT_GLOW",
    VOID: "VOID_GLOOM",
    ALLOY: "ALLOY_STATIC",
    SPIRIT: "SPIRIT_AURORA",
  };
  return map[affinity] ?? "CLEAR";
}

export function terrainForAffinity(affinity: AffinityName): TerrainId {
  const map: Record<AffinityName, TerrainId> = {
    EMBER: "EMBER_FLOOR",
    TIDE: "TIDAL_BASIN",
    GROVE: "GROVE_ROOTS",
    STORM: "STORM_PLATFORM",
    STONE: "STONE_PLATEAU",
    FROST: "FROST_SHELF",
    RADIANT: "RADIANT_DAIS",
    VOID: "VOID_RIFT",
    ALLOY: "ALLOY_GRID",
    SPIRIT: "SPIRIT_CIRCLE",
  };
  return map[affinity] ?? "NEUTRAL_RING";
}

export function combineFieldMods(weather: WeatherId, terrain: TerrainId): FieldMods {
  const w = WEATHER_CATALOG[weather].mods;
  const t = TERRAIN_CATALOG[terrain].mods;
  const affinityDealt: Partial<Record<AffinityName, number>> = { ...w.affinityDealt };
  for (const [k, v] of Object.entries(t.affinityDealt ?? {}) as [AffinityName, number][]) {
    affinityDealt[k] = (affinityDealt[k] ?? 1) * v;
  }
  return {
    affinityDealt,
    energyRegen: (w.energyRegen ?? 0) + (t.energyRegen ?? 0),
    speedMul: (w.speedMul ?? 1) * (t.speedMul ?? 1),
    accuracyFlat: (w.accuracyFlat ?? 0) + (t.accuracyFlat ?? 0),
  };
}

export function fieldAffinityMultiplier(
  mods: FieldMods,
  affinity: AffinityName | null,
): number {
  if (!affinity) return 1;
  return mods.affinityDealt?.[affinity] ?? 1;
}
