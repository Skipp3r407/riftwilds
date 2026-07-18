import type { RegionIdentity } from "@/game/world-maps/types";

/** Matches World page slugs — progression unlocks only (never paid). */
export const REGION_IDENTITIES: RegionIdentity[] = [
  {
    id: "riftwild-commons",
    slug: "riftwild-commons",
    name: "Riftwild Commons",
    blurb: "Central social region — habitat, plaza, training yard",
    unlockTier: "start",
    musicKey: "music-commons",
    weatherKeys: ["clear", "light_rain", "mist", "fireflies", "rift_aurora"],
    defaultWeather: "clear",
    tilePalette: {
      ground: 0x15261c,
      path: 0x243048,
      accent: 0x1a2438,
      water: 0x1a3a5c,
    },
    spawn: { x: 1024, y: 768 },
    instanceCapacity: 40,
    playability: "playable",
    sceneKey: "CommonsScene",
    hubOpen: true,
  },
  {
    id: "ember-crater",
    slug: "ember-crater",
    name: "Ember Crater",
    blurb: "Volcanic caves, ember materials, lava bridges",
    unlockTier: "start",
    musicKey: "music-ember",
    weatherKeys: ["clear", "ash_storm", "heat_shimmer"],
    defaultWeather: "heat_shimmer",
    tilePalette: {
      ground: 0x1a0e0a,
      path: 0x3a2218,
      accent: 0x4a1810,
      hazard: 0xff5a1f,
    },
    spawn: { x: 320, y: 400 },
    instanceCapacity: 32,
    playability: "enterable_stub",
    sceneKey: "EmberCraterScene",
    bossName: "Ashmaw Colossus",
    hubOpen: true,
  },
  {
    id: "moonwater-coast",
    slug: "moonwater-coast",
    name: "Moonwater Coast",
    blurb: "Beaches, tide pools, fishing, underwater ruins",
    unlockTier: "start",
    musicKey: "music-tide",
    weatherKeys: ["clear", "coastal_fog", "light_rain"],
    defaultWeather: "coastal_fog",
    tilePalette: {
      ground: 0x1a2430,
      path: 0xc4b896,
      accent: 0x243848,
      water: 0x1e5a8a,
    },
    // East of Tide Inn / north of Fish Market — clear of building colliders
    spawn: { x: 16 * 32, y: 10 * 32 },
    instanceCapacity: 32,
    playability: "enterable_stub",
    sceneKey: "MoonwaterCoastScene",
    bossName: "Moonwater Leviathan",
    hubOpen: true,
  },
  {
    id: "elderwood-forest",
    slug: "elderwood-forest",
    name: "Elderwood Forest",
    blurb: "Farming, herb gathering, ancient tree dungeon",
    unlockTier: "start",
    musicKey: "music-grove",
    weatherKeys: ["clear", "mist", "fireflies"],
    defaultWeather: "mist",
    tilePalette: {
      ground: 0x143020,
      path: 0x3a2a18,
      accent: 0x1e4028,
      water: 0x1a4050,
    },
    spawn: { x: 340, y: 380 },
    instanceCapacity: 32,
    playability: "enterable_stub",
    sceneKey: "ElderwoodForestScene",
    bossName: "Elderwood Heartwood",
    hubOpen: true,
  },
  {
    id: "stormspire-peaks",
    slug: "stormspire-peaks",
    name: "Stormspire Peaks",
    blurb: "Climbing, lightning crystals, wind trials",
    unlockTier: "early",
    musicKey: "music-storm",
    weatherKeys: ["clear", "sparks_rain"],
    defaultWeather: "sparks_rain",
    tilePalette: {
      ground: 0x1a2030,
      path: 0x2a3448,
      accent: 0x3a4860,
      hazard: 0x7ec8ff,
    },
    spawn: { x: 300, y: 480 },
    instanceCapacity: 28,
    playability: "enterable_stub",
    sceneKey: "StormspirePeaksScene",
    bossName: "Stormspire Titan",
    hubOpen: false,
  },
  {
    id: "stoneheart-canyon",
    slug: "stoneheart-canyon",
    name: "Stoneheart Canyon",
    blurb: "Mining, ruins, fossil excavation",
    unlockTier: "early",
    musicKey: "music-stone",
    weatherKeys: ["clear", "mist"],
    defaultWeather: "clear",
    tilePalette: {
      ground: 0x2a1e14,
      path: 0x4a3828,
      accent: 0x3a2818,
    },
    spawn: { x: 320, y: 400 },
    instanceCapacity: 28,
    playability: "enterable_stub",
    sceneKey: "StoneheartCanyonScene",
    bossName: "Stoneheart Behemoth",
    hubOpen: false,
  },
  {
    id: "frostveil-basin",
    slug: "frostveil-basin",
    name: "Frostveil Basin",
    blurb: "Snow, ice caves, winter events",
    unlockTier: "early",
    musicKey: "music-frost",
    weatherKeys: ["clear", "blizzard", "aurora"],
    defaultWeather: "aurora",
    tilePalette: {
      ground: 0xd8e8f4,
      path: 0xa8c0d4,
      accent: 0xe8f4ff,
      water: 0x7ab0d0,
    },
    spawn: { x: 340, y: 420 },
    instanceCapacity: 28,
    playability: "enterable_stub",
    sceneKey: "FrostveilBasinScene",
    bossName: "Frostveil Warden",
    hubOpen: false,
  },
  {
    id: "radiant-citadel",
    slug: "radiant-citadel",
    name: "Radiant Citadel",
    blurb: "Light temples, healing quests, celestial lore",
    unlockTier: "mid",
    musicKey: "music-radiant",
    weatherKeys: ["clear", "rift_aurora"],
    defaultWeather: "clear",
    tilePalette: {
      ground: 0xf0e6c8,
      path: 0xe0d0a0,
      accent: 0xfff4d0,
    },
    spawn: { x: 360, y: 400 },
    instanceCapacity: 28,
    playability: "enterable_stub",
    sceneKey: "RadiantCitadelScene",
    bossName: "Radiant Sentinel",
    hubOpen: false,
  },
  {
    id: "void-hollow",
    slug: "void-hollow",
    name: "Void Hollow",
    blurb: "Puzzle portals, void materials, high-level quests",
    unlockTier: "late",
    musicKey: "music-void",
    weatherKeys: ["void_distortion", "mist"],
    defaultWeather: "void_distortion",
    tilePalette: {
      ground: 0x120818,
      path: 0x2a1838,
      accent: 0x3a2050,
      hazard: 0xc040ff,
    },
    spawn: { x: 320, y: 400 },
    instanceCapacity: 24,
    playability: "enterable_stub",
    sceneKey: "VoidHollowScene",
    bossName: "Void Riftborn",
    hubOpen: false,
  },
  {
    id: "alloy-ruins",
    slug: "alloy-ruins",
    name: "Alloy Ruins",
    blurb: "Mechanical structures, crafting technology",
    unlockTier: "mid",
    musicKey: "music-alloy",
    weatherKeys: ["clear", "sparks_rain", "light_rain"],
    defaultWeather: "sparks_rain",
    tilePalette: {
      ground: 0x1a1e24,
      path: 0x2a3038,
      accent: 0x3a4850,
      hazard: 0x3de7ff,
    },
    spawn: { x: 340, y: 400 },
    instanceCapacity: 28,
    playability: "enterable_stub",
    sceneKey: "AlloyRuinsScene",
    bossName: "Alloy Warframe",
    hubOpen: false,
  },
  {
    id: "spirit-marsh",
    slug: "spirit-marsh",
    name: "Spirit Marsh",
    blurb: "Lanterns, spirit quests, memory shrines",
    unlockTier: "mid",
    musicKey: "music-spirit",
    weatherKeys: ["spirit_mist", "fireflies"],
    defaultWeather: "spirit_mist",
    tilePalette: {
      ground: 0x14241c,
      path: 0x2a3828,
      accent: 0x1a3028,
      water: 0x1a4038,
    },
    spawn: { x: 320, y: 400 },
    instanceCapacity: 28,
    playability: "enterable_stub",
    sceneKey: "SpiritMarshScene",
    bossName: "Spirit Lantern King",
    hubOpen: false,
  },
  {
    id: "celestial-rift",
    slug: "celestial-rift",
    name: "Celestial Rift",
    blurb: "Endgame cosmic region — World Rifts",
    unlockTier: "endgame",
    musicKey: "music-celestial",
    weatherKeys: ["starfall", "rift_aurora", "void_distortion"],
    defaultWeather: "starfall",
    tilePalette: {
      ground: 0x0a1028,
      path: 0x1a2848,
      accent: 0x2a1850,
      hazard: 0xffd060,
    },
    spawn: { x: 400, y: 420 },
    instanceCapacity: 20,
    playability: "enterable_stub",
    sceneKey: "CelestialRiftScene",
    bossName: "Celestial Rift Entity",
    hubOpen: false,
  },
];

export const REGION_BY_SLUG = Object.fromEntries(
  REGION_IDENTITIES.map((r) => [r.slug, r]),
) as Record<string, RegionIdentity>;

export const WORLD_PAGE_SLUGS = REGION_IDENTITIES.map((r) => r.slug);

/** Progression gates — story/level/reputation/restoration; never paid pets. */
export type UnlockGate = {
  regionId: string;
  requires: {
    storyChapter?: string;
    playerLevel?: number;
    regionVisit?: string;
    bossDefeat?: string;
    gatewayRestored?: string;
    /** [factionId, minimum score] */
    reputationMin?: [string, number];
    questComplete?: string;
  };
  note: string;
};

/**
 * Continent spine: Commons → Elderwood → Stoneheart → Stormspire → Radiant.
 * Other regions hang off hub/peer links; unlocks never require SOL or paid pets.
 */
export const REGION_UNLOCK_GATES: UnlockGate[] = [
  {
    regionId: "riftwild-commons",
    requires: {},
    note: "Always available — starter hub.",
  },
  {
    regionId: "ember-crater",
    requires: {},
    note: "Open at start from Commons Portal Circle.",
  },
  {
    regionId: "moonwater-coast",
    requires: {},
    note: "Open at start from Commons Portal Circle.",
  },
  {
    regionId: "elderwood-forest",
    requires: {},
    note: "Spine step 1 — open at start from Commons.",
  },
  {
    regionId: "stoneheart-canyon",
    requires: {
      storyChapter: "chapter-2",
      playerLevel: 10,
      regionVisit: "elderwood-forest",
    },
    note: "Spine step 2 — visit Elderwood first; never paid.",
  },
  {
    regionId: "stormspire-peaks",
    requires: {
      storyChapter: "chapter-2",
      playerLevel: 8,
      regionVisit: "stoneheart-canyon",
    },
    note: "Spine step 3 — after Stoneheart; never paid.",
  },
  {
    regionId: "frostveil-basin",
    requires: { storyChapter: "chapter-3", playerLevel: 12 },
    note: "Early progression — no paid unlock.",
  },
  {
    regionId: "radiant-citadel",
    requires: {
      storyChapter: "chapter-4",
      playerLevel: 18,
      regionVisit: "stormspire-peaks",
    },
    note: "Spine step 4 — after Stormspire; never paid.",
  },
  {
    regionId: "alloy-ruins",
    requires: {
      storyChapter: "chapter-4",
      playerLevel: 20,
      reputationMin: ["forgebound", 10],
    },
    note: "Midgame — story + Forgebound reputation.",
  },
  {
    regionId: "spirit-marsh",
    requires: {
      storyChapter: "chapter-5",
      playerLevel: 22,
      regionVisit: "elderwood-forest",
    },
    note: "Midgame — story + Elderwood visit.",
  },
  {
    regionId: "void-hollow",
    requires: {
      storyChapter: "chapter-6",
      playerLevel: 28,
      bossDefeat: "radiant-sentinel",
    },
    note: "Late game — major boss + chapter.",
  },
  {
    regionId: "celestial-rift",
    requires: {
      storyChapter: "chapter-8",
      playerLevel: 35,
      gatewayRestored: "world-rift-gate",
      bossDefeat: "void-riftborn",
    },
    note: "Endgame — gateway restoration; never paid.",
  },
];

export function isRegionUnlockedLocally(
  regionId: string,
  progress: {
    playerLevel: number;
    storyChapters: string[];
    bossesDefeated: string[];
    gateways: string[];
    regionsVisited?: string[];
    reputation?: Record<string, number>;
    completedQuests?: string[];
  } = {
    playerLevel: 1,
    storyChapters: [],
    bossesDefeated: [],
    gateways: [],
  },
): boolean {
  const gate = REGION_UNLOCK_GATES.find((g) => g.regionId === regionId);
  if (!gate) return false;
  const r = gate.requires;
  if (r.playerLevel && progress.playerLevel < r.playerLevel) return false;
  if (r.storyChapter && !progress.storyChapters.includes(r.storyChapter))
    return false;
  if (r.bossDefeat && !progress.bossesDefeated.includes(r.bossDefeat))
    return false;
  if (r.gatewayRestored && !progress.gateways.includes(r.gatewayRestored))
    return false;
  if (
    r.regionVisit &&
    !(progress.regionsVisited ?? []).includes(r.regionVisit)
  ) {
    return false;
  }
  if (r.reputationMin) {
    const [faction, min] = r.reputationMin;
    if ((progress.reputation?.[faction] ?? 0) < min) return false;
  }
  if (
    r.questComplete &&
    !(progress.completedQuests ?? []).includes(r.questComplete)
  ) {
    return false;
  }
  return true;
}
