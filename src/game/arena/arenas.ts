import type { AffinityName } from "@prisma/client";
import type { TerrainId, WeatherId } from "@/game/arena/weather-terrain";
import { terrainForAffinity, weatherForAffinity } from "@/game/arena/weather-terrain";

export type ArenaBiomeId =
  | "commons"
  | "ember"
  | "tide"
  | "grove"
  | "storm"
  | "stone"
  | "frost"
  | "radiant"
  | "void"
  | "alloy"
  | "spirit";

export type ArenaDefinition = {
  id: string;
  name: string;
  biome: ArenaBiomeId;
  description: string;
  artPath: string;
  defaultWeather: WeatherId;
  defaultTerrain: TerrainId;
  affinityHint?: AffinityName;
};

export const BATTLE_ARENAS: ArenaDefinition[] = [
  {
    id: "commons-yard",
    name: "Commons Yard",
    biome: "commons",
    description: "Open training ring under soft rift light.",
    artPath: "/assets/battle/arenas/commons-yard.svg",
    defaultWeather: "CLEAR",
    defaultTerrain: "NEUTRAL_RING",
  },
  {
    id: "ember-crucible",
    name: "Ember Crucible",
    biome: "ember",
    description: "Heat-warped stone and drifting ash.",
    artPath: "/assets/battle/arenas/ember-crucible.png",
    defaultWeather: "EMBER_HAZE",
    defaultTerrain: "EMBER_FLOOR",
    affinityHint: "EMBER",
  },
  {
    id: "tide-basin",
    name: "Moonwater Basin",
    biome: "tide",
    description: "Shallow reflective pools and mist rails.",
    artPath: "/assets/battle/arenas/tide-basin.png",
    defaultWeather: "TIDAL_MIST",
    defaultTerrain: "TIDAL_BASIN",
    affinityHint: "TIDE",
  },
  {
    id: "grove-hollow",
    name: "Sproutfall Hollow",
    biome: "grove",
    description: "Root-wrapped clearing with pollen motes.",
    artPath: "/assets/battle/arenas/grove-hollow.png",
    defaultWeather: "GROVE_POLLEN",
    defaultTerrain: "GROVE_ROOTS",
    affinityHint: "GROVE",
  },
  {
    id: "storm-spire",
    name: "Storm Spire Deck",
    biome: "storm",
    description: "Wind-scoured platform above rolling clouds.",
    artPath: "/assets/battle/arenas/storm-spire.png",
    defaultWeather: "STORMFRONT",
    defaultTerrain: "STORM_PLATFORM",
    affinityHint: "STORM",
  },
  {
    id: "stone-plateau",
    name: "Stone Plateau",
    biome: "stone",
    description: "Mineral shelves and dust-veiled cliffs.",
    artPath: "/assets/battle/arenas/stone-plateau.svg",
    defaultWeather: "STONE_DUST",
    defaultTerrain: "STONE_PLATEAU",
    affinityHint: "STONE",
  },
  {
    id: "frost-shelf",
    name: "Frost Shelf",
    biome: "frost",
    description: "Blue ice shelves under pale winter light.",
    artPath: "/assets/battle/arenas/frost-shelf.svg",
    defaultWeather: "FROST_SHEEN",
    defaultTerrain: "FROST_SHELF",
    affinityHint: "FROST",
  },
  {
    id: "radiant-dais",
    name: "Radiant Dais",
    biome: "radiant",
    description: "Bright stone circle washed in gold rift-light.",
    artPath: "/assets/battle/arenas/radiant-dais.svg",
    defaultWeather: "RADIANT_GLOW",
    defaultTerrain: "RADIANT_DAIS",
    affinityHint: "RADIANT",
  },
  {
    id: "void-rift",
    name: "Void Rift Floor",
    biome: "void",
    description: "Dark fracture lines and soft violet haze.",
    artPath: "/assets/battle/arenas/void-rift.png",
    defaultWeather: "VOID_GLOOM",
    defaultTerrain: "VOID_RIFT",
    affinityHint: "VOID",
  },
  {
    id: "alloy-grid",
    name: "Alloy Grid",
    biome: "alloy",
    description: "Machined plates humming with static.",
    artPath: "/assets/battle/arenas/alloy-grid.svg",
    defaultWeather: "ALLOY_STATIC",
    defaultTerrain: "ALLOY_GRID",
    affinityHint: "ALLOY",
  },
  {
    id: "spirit-circle",
    name: "Spirit Circle",
    biome: "spirit",
    description: "Warded ring under aurora ribbons.",
    artPath: "/assets/battle/arenas/spirit-circle.svg",
    defaultWeather: "SPIRIT_AURORA",
    defaultTerrain: "SPIRIT_CIRCLE",
    affinityHint: "SPIRIT",
  },
];

export function arenaForAffinity(affinity: AffinityName): ArenaDefinition {
  return (
    BATTLE_ARENAS.find((a) => a.affinityHint === affinity) ??
    BATTLE_ARENAS[0]!
  );
}

export function arenaFieldForAffinity(affinity: AffinityName) {
  const arena = arenaForAffinity(affinity);
  return {
    arena,
    weather: weatherForAffinity(affinity),
    terrain: terrainForAffinity(affinity),
  };
}
