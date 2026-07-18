import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import {
  TILE,
  building,
  enemyZone,
  finalizeBlueprint,
  gatewayStoneAt,
  npcAt,
  portalRing,
  resourceAt,
} from "@/game/world-maps/blueprint-helpers";
import type {
  CollisionRect,
  MapBlueprint,
  MapZone,
  PathwayDef,
  RegionIdentity,
  WorldMapObject,
} from "@/game/world-maps/types";
import { ENEMY_DEFS } from "@/game/world-maps/defs/enemies";
import { RESOURCE_DEFS } from "@/game/world-maps/defs/resources";

function hazardCollidersFor(slug: string, T: number): CollisionRect[] {
  const table: Record<string, CollisionRect[]> = {
    "ember-crater": [
      { id: "lava-strip-1", x: 18 * T, y: 14 * T, width: 16 * T, height: 2 * T, kind: "lava" },
      { id: "lava-pool-2", x: 40 * T, y: 38 * T, width: 8 * T, height: 4 * T, kind: "lava" },
      { id: "ash-cliff-1", x: 4 * T, y: 20 * T, width: 2 * T, height: 10 * T, kind: "cliff" },
      {
        id: "collapsed-lava-bridge",
        x: 24 * T,
        y: 16 * T,
        width: 4 * T,
        height: T,
        kind: "blocker",
        metadata: {
          barrierStyle: "collapsed_bridge",
          message: "The lava bridge is out — ash crews have not rebuilt it yet.",
        },
      },
    ],
    "moonwater-coast": [
      { id: "deep-water-1", x: 18 * T, y: 36 * T, width: 20 * T, height: 3 * T, kind: "deep_water" },
      { id: "tide-water-2", x: 40 * T, y: 34 * T, width: 10 * T, height: 6 * T, kind: "deep_water" },
      {
        id: "tide-shallow-ford",
        x: 18 * T,
        y: 34 * T,
        width: 6 * T,
        height: 2 * T,
        kind: "shallow_water",
        solid: false,
      },
    ],
    "elderwood-forest": [
      { id: "grove-stream", x: 22 * T, y: 28 * T, width: 8 * T, height: 2 * T, kind: "deep_water" },
      { id: "root-cliff", x: 32 * T, y: 18 * T, width: 2 * T, height: 8 * T, kind: "cliff" },
    ],
    "stormspire-peaks": [
      { id: "cliff-drop-1", x: 14 * T, y: 16 * T, width: 18 * T, height: 2 * T, kind: "cliff" },
      { id: "wind-hazard", x: 34 * T, y: 10 * T, width: 6 * T, height: 4 * T, kind: "hazard" },
    ],
    "stoneheart-canyon": [
      { id: "canyon-rim", x: 16 * T, y: 12 * T, width: 20 * T, height: 2 * T, kind: "cliff" },
      { id: "quarry-pit", x: 28 * T, y: 22 * T, width: 6 * T, height: 4 * T, kind: "hazard" },
    ],
    "frostveil-basin": [
      { id: "ice-water", x: 18 * T, y: 24 * T, width: 12 * T, height: 4 * T, kind: "deep_water" },
      { id: "glacier-wall", x: 6 * T, y: 8 * T, width: 4 * T, height: 10 * T, kind: "cliff" },
    ],
    "radiant-citadel": [
      { id: "mirror-pool", x: 24 * T, y: 20 * T, width: 6 * T, height: 4 * T, kind: "deep_water" },
    ],
    "void-hollow": [
      { id: "void-rift", x: 20 * T, y: 18 * T, width: 8 * T, height: 3 * T, kind: "hazard" },
      { id: "null-cliff", x: 34 * T, y: 26 * T, width: 4 * T, height: 8 * T, kind: "cliff" },
    ],
    "alloy-ruins": [
      { id: "spark-pit", x: 22 * T, y: 20 * T, width: 6 * T, height: 3 * T, kind: "hazard" },
      { id: "scrap-wall", x: 8 * T, y: 14 * T, width: 3 * T, height: 8 * T, kind: "cliff" },
    ],
    "spirit-marsh": [
      { id: "marsh-water-1", x: 16 * T, y: 22 * T, width: 14 * T, height: 4 * T, kind: "deep_water" },
      { id: "reed-bog", x: 30 * T, y: 30 * T, width: 8 * T, height: 4 * T, kind: "deep_water" },
    ],
    "celestial-rift": [
      { id: "starfall-gap", x: 36 * T, y: 8 * T, width: 8 * T, height: 3 * T, kind: "hazard" },
      { id: "rift-edge", x: 10 * T, y: 32 * T, width: 12 * T, height: 2 * T, kind: "cliff" },
    ],
  };
  return table[slug] ?? [];
}

function landmarkObjectsFor(
  slug: string,
  region: RegionIdentity,
  T: number,
): WorldMapObject[] {
  const specs: Record<string, { id: string; label: string; col: number; row: number; color: number }[]> =
    {
      "ember-crater": [
        { id: "lm-bridge", label: "Lava Bridge", col: 24, row: 15, color: 0xff5a1f },
        { id: "lm-forge", label: "Forge Spire", col: 28, row: 28, color: 0xd48a3a },
        { id: "lm-ash-cairn", label: "Ash Cairn", col: 10, row: 8, color: 0xa05030 },
      ],
      "moonwater-coast": [
        { id: "lm-beach", label: "Tide Marker", col: 28, row: 30, color: 0xc4b896 },
        { id: "lm-light", label: "Beacon Rock", col: 8, row: 34, color: 0xe8d080 },
        { id: "lm-net-rack", label: "Net Drying Rack", col: 12, row: 12, color: 0x6a90b0 },
      ],
      "elderwood-forest": [
        { id: "lm-heart", label: "Heartwood Marker", col: 36, row: 22, color: 0x4adf7a },
        { id: "lm-moss", label: "Moss Arch", col: 18, row: 20, color: 0x6a9040 },
        { id: "lm-shrine-stone", label: "Shrine Stone", col: 8, row: 8, color: 0x508060 },
      ],
      "stormspire-peaks": [
        { id: "lm-spire", label: "Storm Spire", col: 36, row: 14, color: 0x7ec8ff },
        { id: "lm-beacon", label: "Wind Beacon", col: 8, row: 30, color: 0xa0d8ff },
        { id: "lm-rope", label: "Rope Bridge Post", col: 20, row: 18, color: 0x6a8098 },
      ],
      "stoneheart-canyon": [
        { id: "lm-fossil", label: "Fossil Shelf", col: 24, row: 18, color: 0xc4a06a },
        { id: "lm-bridge", label: "Stone Bridge Pier", col: 14, row: 10, color: 0x8a7050 },
        { id: "lm-quarry-crane", label: "Quarry Crane", col: 36, row: 8, color: 0xa08060 },
      ],
      "frostveil-basin": [
        { id: "lm-aurora", label: "Aurora Cairn", col: 26, row: 20, color: 0xb0d8ff },
        { id: "lm-ice-pier", label: "Frozen Pier", col: 20, row: 12, color: 0xd0e8f8 },
        { id: "lm-lodge-chimney", label: "Lodge Chimney", col: 6, row: 6, color: 0x80a0c0 },
      ],
      "radiant-citadel": [
        { id: "lm-sun", label: "Sun Dial", col: 28, row: 18, color: 0xffd060 },
        { id: "lm-mirror", label: "Mirror Pool Edge", col: 24, row: 22, color: 0xf0e8c0 },
        { id: "lm-gate-arch", label: "Golden Gate Arch", col: 8, row: 30, color: 0xffe080 },
      ],
      "void-hollow": [
        { id: "lm-obelisk", label: "Null Obelisk", col: 26, row: 22, color: 0x6a40a0 },
        { id: "lm-rift-ring", label: "Rift Ring", col: 18, row: 10, color: 0xc040ff },
        { id: "lm-echo-tree", label: "Echo Tree", col: 36, row: 8, color: 0x503070 },
      ],
      "alloy-ruins": [
        { id: "lm-gear", label: "Gear Court", col: 22, row: 16, color: 0xa0a8b0 },
        { id: "lm-conduit", label: "Conduit Pillar", col: 10, row: 22, color: 0x3de7ff },
        { id: "lm-scrap-pile", label: "Scrap Pile", col: 36, row: 10, color: 0x708090 },
      ],
      "spirit-marsh": [
        { id: "lm-lantern", label: "Memory Lantern", col: 20, row: 24, color: 0x60c090 },
        { id: "lm-ferry", label: "Ferry Dock", col: 8, row: 20, color: 0x408070 },
        { id: "lm-shrine-post", label: "Shrine Post", col: 12, row: 32, color: 0x80d0b0 },
      ],
      "celestial-rift": [
        { id: "lm-star", label: "Star Anchor", col: 24, row: 14, color: 0x9b7bff },
        { id: "lm-lens", label: "Observatory Lens", col: 10, row: 22, color: 0xffd060 },
        { id: "lm-island-pin", label: "Island Pin", col: 40, row: 10, color: 0xc0a0ff },
      ],
    };
  return (specs[slug] ?? []).map((s) => ({
    id: s.id,
    type: "decoration" as const,
    regionId: region.id,
    sceneId: region.sceneKey,
    x: s.col * T,
    y: s.row * T,
    width: 2 * T,
    height: 2 * T,
    collision: true,
    label: s.label,
    color: s.color,
  }));
}

type ZoneSpec = {
  id: string;
  name: string;
  kind: MapZone["kind"];
  safe?: boolean;
  /** Tile grid placement (col, row, w, h) */
  grid: [number, number, number, number];
};

type RegionBlueprintSpec = {
  cols: number;
  rows: number;
  completeness: "FULL" | "PARTIAL";
  zones: ZoneSpec[];
  buildings: {
    id: string;
    label: string;
    grid: [number, number, number, number];
    color: number;
  }[];
  npcIds: { id: string; col: number; row: number }[];
  resourceIds: string[];
  enemyIds: string[];
  bossArena?: { col: number; row: number; w: number; h: number; bossId: string };
  hiddenAreas: { id: string; label: string; col: number; row: number }[];
  puzzles: { id: string; label: string; col: number; row: number }[];
  waypoints: { id: string; label: string; col: number; row: number }[];
  guideNpcId?: string;
  notes: string[];
};

const SPECS: Record<string, RegionBlueprintSpec> = {
  "ember-crater": {
    cols: 56,
    rows: 48,
    completeness: "PARTIAL",
    zones: [
      { id: "entrance-camp", name: "Crater Entrance Camp", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "lava-bridges", name: "Lava Bridge Network", kind: "danger", grid: [16, 8, 20, 12] },
      { id: "crystal-fields", name: "Ember Crystal Fields", kind: "exploration", grid: [38, 6, 14, 12] },
      { id: "ashen-caverns", name: "Ashen Caverns", kind: "dungeon", grid: [4, 20, 14, 14] },
      { id: "molten-forge", name: "Molten Forge", kind: "settlement", safe: true, grid: [22, 24, 12, 10] },
      { id: "burned-grove", name: "Burned Grove", kind: "exploration", grid: [38, 24, 14, 10] },
      { id: "caldera-temple", name: "Caldera Temple", kind: "dungeon", grid: [18, 36, 16, 10] },
      { id: "boss-arena", name: "Ashmaw Arena", kind: "boss", grid: [40, 36, 12, 10] },
    ],
    buildings: [
      { id: "ember-camp", label: "Expedition Camp", grid: [3, 3, 8, 6], color: 0xd48a3a },
      { id: "molten-forge-bldg", label: "Molten Forge", grid: [24, 26, 8, 6], color: 0xff5a1f },
      { id: "caldera-temple-bldg", label: "Caldera Temple", grid: [20, 38, 10, 6], color: 0xa03020 },
    ],
    npcIds: [
      { id: "kael-ashwalker", col: 6, row: 8 },
      { id: "forgekeeper-vessa", col: 26, row: 28 },
      { id: "cinder-sage-malrec", col: 22, row: 40 },
      { id: "warden-pyra", col: 10, row: 6 },
      { id: "ember-porter-ash", col: 5, row: 9 },
      { id: "ember-cook-cind", col: 7, row: 7 },
      { id: "ember-miner-bas", col: 40, row: 10 },
      { id: "ember-guard-lox", col: 9, row: 5 },
    ],
    resourceIds: ["ember-crystal", "charstone", "ashroot", "flamecap", "cinder-bloom"],
    enemyIds: ["cinder-crawler", "magma-beetle", "ash-hound", "ember-wisp"],
    bossArena: { col: 42, row: 38, w: 8, h: 6, bossId: "ashmaw-colossus" },
    hiddenAreas: [
      { id: "hidden-lava-cavern", label: "Lava Waterfall Cavern", col: 18, row: 14 },
      { id: "hidden-forge-vault", label: "Ancient Forge Vault", col: 28, row: 28 },
    ],
    puzzles: [
      { id: "puzzle-cooling", label: "Cooling Valve Puzzle", col: 26, row: 30 },
      { id: "puzzle-braziers", label: "Brazier Trial", col: 24, row: 40 },
    ],
    waypoints: [{ id: "wp-ember-camp", label: "Camp Waypoint", col: 8, row: 6 }],
    guideNpcId: "kael-ashwalker",
    notes: [
      "Enterable stub scene from Commons portals.",
      "Lava hazard colliders mark bridge gaps.",
      "Boss arena referenced; full combat later.",
    ],
  },
  "moonwater-coast": {
    cols: 56,
    rows: 48,
    completeness: "PARTIAL",
    zones: [
      { id: "coastal-village", name: "Coastal Village", kind: "safe", safe: true, grid: [2, 4, 14, 12] },
      { id: "moonlit-beach", name: "Moonlit Beach", kind: "exploration", grid: [18, 28, 22, 12] },
      { id: "tide-pools", name: "Tide Pool Gardens", kind: "exploration", grid: [18, 16, 16, 10] },
      { id: "sea-caves", name: "Sea Caves", kind: "dungeon", grid: [38, 18, 14, 12] },
      { id: "underwater-ruins", name: "Underwater Ruins", kind: "dungeon", grid: [36, 4, 16, 12] },
      { id: "lighthouse", name: "Lighthouse Cliffs", kind: "exploration", grid: [2, 28, 12, 14] },
      { id: "leviathan-bay", name: "Leviathan Bay", kind: "boss", grid: [40, 34, 12, 10] },
    ],
    buildings: [
      { id: "coast-inn", label: "Tide Inn", grid: [4, 6, 8, 5], color: 0x3a8fd4 },
      { id: "fish-market", label: "Fish Market", grid: [4, 12, 8, 5], color: 0x4adf7a },
      { id: "lighthouse-bldg", label: "Lighthouse", grid: [4, 30, 5, 8], color: 0xe8d080 },
    ],
    npcIds: [
      { id: "luma-tidecrest", col: 8, row: 10 },
      { id: "finn-coralhand", col: 24, row: 32 },
      { id: "oracle-selene", col: 6, row: 34 },
      { id: "marina-drift", col: 12, row: 12 },
      { id: "coast-netmender-pli", col: 6, row: 11 },
      { id: "coast-child-shell", col: 22, row: 30 },
      { id: "coast-innkeep-dor", col: 5, row: 8 },
      { id: "coast-guard-brine", col: 9, row: 9 },
    ],
    resourceIds: ["moon-pearl", "tide-shell", "seaweed-bundle", "coral-shard", "driftwood"],
    enemyIds: ["tide-crab", "reef-stalker"],
    bossArena: { col: 42, row: 36, w: 8, h: 6, bossId: "moonwater-leviathan" },
    hiddenAreas: [
      { id: "hidden-sea-chamber", label: "Hidden Sea Chamber", col: 42, row: 22 },
      { id: "hidden-cliff-cave", label: "Cliff Cave", col: 6, row: 38 },
    ],
    puzzles: [
      { id: "puzzle-tide-gate", label: "Tide Gate", col: 22, row: 20 },
      { id: "puzzle-signal", label: "Lighthouse Signal", col: 6, row: 32 },
    ],
    waypoints: [{ id: "wp-coast-dock", label: "Dock Waypoint", col: 10, row: 8 }],
    guideNpcId: "luma-tidecrest",
    notes: ["Enterable stub from Commons.", "Deep water colliders along beach south edge."],
  },
  "elderwood-forest": {
    cols: 56,
    rows: 48,
    completeness: "PARTIAL",
    zones: [
      { id: "grove-camp", name: "Grove Camp", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "herb-trails", name: "Herb Trails", kind: "exploration", grid: [16, 4, 18, 12] },
      { id: "farm-clearing", name: "Farm Clearing", kind: "settlement", safe: true, grid: [36, 4, 14, 10] },
      { id: "ancient-grove", name: "Ancient Grove", kind: "exploration", grid: [8, 18, 20, 14] },
      { id: "tree-dungeon", name: "Heartwood Dungeon", kind: "dungeon", grid: [32, 18, 18, 14] },
      { id: "spirit-glade", name: "Spirit Glade", kind: "hidden", grid: [4, 34, 12, 10] },
      { id: "heartwood-arena", name: "Heartwood Arena", kind: "boss", grid: [36, 34, 14, 10] },
    ],
    buildings: [
      { id: "ranger-lodge", label: "Ranger Lodge", grid: [3, 3, 8, 6], color: 0x4adf7a },
      { id: "herb-shed", label: "Herb Shed", grid: [38, 5, 6, 5], color: 0x6a9040 },
      { id: "heartwood-gate", label: "Heartwood Gate", grid: [34, 20, 8, 6], color: 0x3a6040 },
    ],
    npcIds: [
      { id: "warden-sylvi", col: 8, row: 8 },
      { id: "mosskeeper-elden", col: 20, row: 18 },
      { id: "fenn-quickbranch", col: 14, row: 14 },
      { id: "grandmother-willowmere", col: 28, row: 24 },
      { id: "elder-forager-nim", col: 12, row: 12 },
      { id: "elder-carver-tor", col: 16, row: 16 },
      { id: "elder-singer-luma", col: 22, row: 14 },
      { id: "elder-guard-briar", col: 7, row: 9 },
    ],
    resourceIds: ["grove-herb", "ancient-bark", "mossmeal", "glowcap", "berry-bush"],
    enemyIds: ["grove-sprite", "bark-guardian", "vine-sprout"],
    bossArena: { col: 38, row: 36, w: 10, h: 6, bossId: "elderwood-heartwood" },
    hiddenAreas: [
      { id: "hidden-spirit-glade", label: "Spirit Glade", col: 6, row: 36 },
      { id: "hidden-root-tunnel", label: "Root Tunnel", col: 24, row: 24 },
    ],
    puzzles: [
      { id: "puzzle-moss-path", label: "Moss Path Sequence", col: 18, row: 22 },
      { id: "puzzle-grove-rings", label: "Grove Ring Puzzle", col: 40, row: 24 },
    ],
    waypoints: [{ id: "wp-grove-camp", label: "Grove Waypoint", col: 8, row: 6 }],
    guideNpcId: "warden-sylvi",
    notes: ["Enterable stub from Commons.", "Canopy overhead layer markers in zones."],
  },
  "stormspire-peaks": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "base-camp", name: "Wind Camp", kind: "safe", safe: true, grid: [2, 28, 12, 10] },
      { id: "cliff-paths", name: "Cliff Paths", kind: "danger", grid: [14, 16, 18, 14] },
      { id: "crystal-spires", name: "Lightning Spires", kind: "exploration", grid: [34, 8, 12, 14] },
      { id: "wind-trials", name: "Wind Trials", kind: "dungeon", grid: [16, 4, 14, 10] },
      { id: "boss", name: "Stormspire Summit", kind: "boss", grid: [34, 26, 12, 10] },
    ],
    buildings: [{ id: "storm-camp", label: "Wind Camp", grid: [3, 30, 8, 5], color: 0x7ec8ff }],
    npcIds: [
      { id: "aeron-cloudstep", col: 10, row: 20 },
      { id: "engineer-volt", col: 18, row: 16 },
      { id: "skywarden-ilya", col: 22, row: 12 },
      { id: "hermit-thane", col: 8, row: 28 },
      { id: "storm-porter-zee", col: 9, row: 18 },
      { id: "storm-cook-pip2", col: 11, row: 19 },
      { id: "storm-climber-aro", col: 14, row: 15 },
      { id: "storm-guard-nimbus", col: 12, row: 14 },
    ],
    resourceIds: ["lightning-crystal", "wind-silk", "sky-iron", "cloudcap"],
    enemyIds: ["storm-raptor", "spark-wisp", "gale-mite"],
    bossArena: { col: 36, row: 28, w: 8, h: 6, bossId: "stormspire-titan" },
    hiddenAreas: [{ id: "hidden-cloud-cave", label: "Cloud Cave", col: 20, row: 8 }],
    puzzles: [{ id: "puzzle-wind", label: "Wind Trial Gates", col: 20, row: 6 }],
    waypoints: [{ id: "wp-storm", label: "Camp Waypoint", col: 6, row: 32 }],
    notes: ["Enterable stub with distinct wind/lightning identity — denser climb loops backlog."],
  },
  "stoneheart-canyon": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "settlement", name: "Canyon Settlement", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "fossil", name: "Fossil Basin", kind: "exploration", grid: [16, 4, 16, 12] },
      { id: "quarry", name: "Quarry Paths", kind: "danger", grid: [34, 4, 12, 14] },
      { id: "ruins", name: "Carved Ruins", kind: "dungeon", grid: [8, 20, 16, 12] },
      { id: "mine", name: "Underground Mine", kind: "dungeon", grid: [28, 20, 16, 12] },
      { id: "boss", name: "Canyon Colosseum", kind: "boss", grid: [18, 30, 14, 8] },
    ],
    buildings: [{ id: "mine-camp", label: "Mining Camp", grid: [3, 3, 8, 5], color: 0xc07040 }],
    npcIds: [
      { id: "doran-flint", col: 10, row: 18 },
      { id: "petra-stoneveil", col: 20, row: 22 },
      { id: "marshal-korr", col: 8, row: 12 },
      { id: "gemwright-opal", col: 16, row: 14 },
      { id: "stone-hauler-mog", col: 11, row: 16 },
      { id: "stone-cook-peb", col: 9, row: 14 },
      { id: "stone-survey-lin", col: 15, row: 18 },
      { id: "stone-guard-slab", col: 7, row: 13 },
    ],
    resourceIds: ["stoneheart-ore", "fossil-shard", "canyon-clay", "amber-vein"],
    enemyIds: ["rock-crawler", "dust-scorpion", "slate-bat"],
    bossArena: { col: 20, row: 32, w: 10, h: 5, bossId: "stoneheart-behemoth" },
    hiddenAreas: [{ id: "hidden-fossil", label: "Fossil Chamber", col: 22, row: 8 }],
    puzzles: [{ id: "puzzle-pressure", label: "Pressure Plates", col: 12, row: 24 }],
    waypoints: [{ id: "wp-stone", label: "Camp Waypoint", col: 6, row: 6 }],
    notes: ["Spine step 2 canyon identity — quarry, fossils, and bridges."],
  },
  "frostveil-basin": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "village", name: "Frostveil Village", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "lake", name: "Frozen Lake", kind: "exploration", grid: [16, 8, 16, 12] },
      { id: "forest", name: "Snow Forest", kind: "exploration", grid: [34, 4, 12, 14] },
      { id: "caves", name: "Ice Cave Network", kind: "dungeon", grid: [4, 18, 16, 12] },
      { id: "aurora", name: "Aurora Shrine", kind: "dungeon", grid: [24, 20, 14, 10] },
      { id: "boss", name: "Frostveil Citadel", kind: "boss", grid: [30, 30, 14, 8] },
    ],
    buildings: [{ id: "frost-lodge", label: "Warm Lodge", grid: [3, 3, 8, 5], color: 0xa0c8e8 }],
    npcIds: [
      { id: "freya-snowmark", col: 10, row: 16 },
      { id: "jori-icebloom", col: 16, row: 18 },
      { id: "hunter-varek", col: 22, row: 20 },
      { id: "aurora-linn", col: 18, row: 12 },
      { id: "frost-porter-yul", col: 9, row: 15 },
      { id: "frost-knitter-esa", col: 12, row: 17 },
      { id: "frost-scout-rin", col: 14, row: 15 },
      { id: "frost-guard-ice", col: 8, row: 14 },
    ],
    resourceIds: ["frost-crystal", "ice-bloom", "snow-pine-resin", "glacier-glass"],
    enemyIds: ["frost-wolf", "ice-mite", "snow-lurker"],
    bossArena: { col: 32, row: 32, w: 10, h: 5, bossId: "frostveil-warden" },
    hiddenAreas: [{ id: "hidden-spring", label: "Warm Spring", col: 8, row: 22 }],
    puzzles: [{ id: "puzzle-aurora", label: "Aurora Lights", col: 28, row: 22 }],
    waypoints: [{ id: "wp-frost", label: "Lodge Waypoint", col: 6, row: 6 }],
    notes: ["Aurora / ice-cave identity — seasonal event hooks wired."],
  },
  "radiant-citadel": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "gate", name: "Golden Gate District", kind: "safe", safe: true, grid: [2, 28, 14, 10] },
      { id: "gardens", name: "Healing Gardens", kind: "settlement", safe: true, grid: [18, 24, 14, 10] },
      { id: "records", name: "Hall of Records", kind: "settlement", grid: [4, 12, 12, 10] },
      { id: "temple", name: "Sun Temple", kind: "dungeon", grid: [20, 4, 14, 12] },
      { id: "walkways", name: "Floating Walkways", kind: "danger", grid: [34, 8, 12, 14] },
      { id: "lower", name: "Lower Citadel", kind: "exploration", grid: [34, 24, 12, 10] },
      { id: "court", name: "Celestial Court", kind: "boss", grid: [18, 14, 12, 8] },
    ],
    buildings: [{ id: "sun-temple", label: "Sun Temple", grid: [22, 5, 10, 7], color: 0xffd060 }],
    npcIds: [
      { id: "chancellor-aurex", col: 16, row: 16 },
      { id: "scholar-lyra", col: 20, row: 14 },
      { id: "sentinel-cassian", col: 10, row: 18 },
      { id: "curator-verin", col: 24, row: 16 },
      { id: "citadel-scribe-omi", col: 15, row: 15 },
      { id: "citadel-vendor-lux", col: 18, row: 17 },
      { id: "citadel-acolyte-ven", col: 19, row: 15 },
      { id: "citadel-guard-halo", col: 11, row: 17 },
    ],
    resourceIds: ["radiant-crystal", "sunpetal", "mirror-sand", "halo-resin"],
    enemyIds: ["radiant-construct", "light-mote", "gilded-ward"],
    bossArena: { col: 20, row: 16, w: 8, h: 5, bossId: "radiant-sentinel" },
    hiddenAreas: [{ id: "hidden-archive", label: "Restricted Archive", col: 8, row: 14 }],
    puzzles: [{ id: "puzzle-mirrors", label: "Mirror Beams", col: 26, row: 8 }],
    waypoints: [{ id: "wp-radiant", label: "Gate Waypoint", col: 6, row: 32 }],
    notes: ["Midgame temple identity; unlock via story chapter 4."],
  },
  "void-hollow": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "camp", name: "Hollow Entrance Camp", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "shards", name: "Shattered Pathways", kind: "danger", grid: [16, 4, 16, 12] },
      { id: "echo", name: "Echo Forest", kind: "exploration", grid: [34, 4, 12, 12] },
      { id: "labyrinth", name: "Portal Labyrinth", kind: "dungeon", grid: [8, 18, 16, 12] },
      { id: "inverted", name: "Inverted Ruins", kind: "dungeon", grid: [28, 18, 16, 12] },
      { id: "core", name: "Void Core", kind: "danger", grid: [16, 30, 14, 8] },
      { id: "boss", name: "Riftborn Arena", kind: "boss", grid: [34, 30, 12, 8] },
    ],
    buildings: [{ id: "void-lab", label: "Rift Lab", grid: [3, 3, 8, 5], color: 0xc040ff }],
    npcIds: [
      { id: "shadecaller-neris", col: 10, row: 14 },
      { id: "watcher-omen", col: 18, row: 12 },
      { id: "veya-dusk", col: 14, row: 18 },
      { id: "keeper-null", col: 22, row: 20 },
      { id: "void-porter-dim", col: 9, row: 15 },
      { id: "void-scribe-umbra", col: 12, row: 16 },
      { id: "void-scout-gloom", col: 15, row: 15 },
      { id: "void-guard-veil", col: 11, row: 13 },
    ],
    resourceIds: ["void-crystal", "rift-dust", "echo-thread", "null-shard"],
    enemyIds: ["rift-stalker", "void-mite", "echo-shade"],
    bossArena: { col: 36, row: 32, w: 8, h: 5, bossId: "void-riftborn" },
    hiddenAreas: [{ id: "hidden-pocket", label: "Pocket Dimension", col: 20, row: 22 }],
    puzzles: [{ id: "puzzle-portals", label: "Color Portal Chain", col: 12, row: 22 }],
    waypoints: [{ id: "wp-void", label: "Camp Waypoint", col: 6, row: 6 }],
    notes: ["Late-game void identity; never paid unlock."],
  },
  "alloy-ruins": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "salvager", name: "Salvager Settlement", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "courtyard", name: "Machine Courtyard", kind: "exploration", grid: [16, 4, 16, 12] },
      { id: "factory", name: "Rusted Factory", kind: "danger", grid: [34, 4, 12, 14] },
      { id: "conduits", name: "Energy Conduits", kind: "dungeon", grid: [4, 18, 16, 12] },
      { id: "garden", name: "Mechanical Garden", kind: "exploration", grid: [24, 18, 14, 10] },
      { id: "archive", name: "Data Archive", kind: "dungeon", grid: [8, 30, 14, 8] },
      { id: "foundry", name: "Warframe Foundry", kind: "boss", grid: [30, 30, 14, 8] },
    ],
    buildings: [{ id: "repair-shop", label: "Repair Shop", grid: [3, 3, 8, 5], color: 0x3de7ff }],
    npcIds: [
      { id: "tinker-pax", col: 12, row: 16 },
      { id: "unit-ari-7", col: 18, row: 18 },
      { id: "salvager-knox", col: 10, row: 20 },
      { id: "professor-ferrum", col: 22, row: 14 },
      { id: "alloy-porter-cog", col: 11, row: 17 },
      { id: "alloy-welder-spark", col: 14, row: 16 },
      { id: "alloy-runner-bit", col: 16, row: 15 },
      { id: "alloy-guard-bolt", col: 9, row: 18 },
    ],
    resourceIds: ["alloy-fragment", "circuit-crystal", "gear-oil", "spark-coil"],
    enemyIds: ["security-drone", "scrap-mite", "arc-spider"],
    bossArena: { col: 32, row: 32, w: 10, h: 5, bossId: "alloy-warframe" },
    hiddenAreas: [{ id: "hidden-proto", label: "Prototype Lab", col: 38, row: 10 }],
    puzzles: [{ id: "puzzle-power", label: "Power Routing", col: 8, row: 22 }],
    waypoints: [{ id: "wp-alloy", label: "Settlement Waypoint", col: 6, row: 6 }],
    notes: ["Midgame scrap/tech identity — gear court and foundry."],
  },
  "spirit-marsh": {
    cols: 48,
    rows: 40,
    completeness: "PARTIAL",
    zones: [
      { id: "lantern-village", name: "Lantern Village", kind: "safe", safe: true, grid: [2, 2, 12, 10] },
      { id: "walkways", name: "Mist Walkways", kind: "exploration", grid: [16, 6, 16, 12] },
      { id: "sunken", name: "Sunken Settlement", kind: "dungeon", grid: [34, 4, 12, 12] },
      { id: "shrines", name: "Memory Shrine Field", kind: "exploration", grid: [4, 18, 16, 12] },
      { id: "bog", name: "Whispering Bog", kind: "danger", grid: [24, 18, 16, 12] },
      { id: "temple", name: "Lantern Temple", kind: "dungeon", grid: [8, 30, 14, 8] },
      { id: "court", name: "Drowned Court", kind: "boss", grid: [30, 30, 14, 8] },
    ],
    buildings: [{ id: "lantern-hall", label: "Lantern Hall", grid: [3, 3, 8, 5], color: 0x60d0c0 }],
    npcIds: [
      { id: "medium-amara", col: 12, row: 16 },
      { id: "ferryman-grey", col: 8, row: 20 },
      { id: "lantern-keeper-sio", col: 16, row: 14 },
      { id: "echo-child-nimi", col: 20, row: 22 },
      { id: "marsh-porter-reed", col: 10, row: 17 },
      { id: "marsh-singer-fog", col: 14, row: 15 },
      { id: "marsh-herbal-mist", col: 15, row: 18 },
      { id: "marsh-guard-wick", col: 9, row: 16 },
    ],
    resourceIds: ["spirit-bloom", "memory-shard", "reed-wick", "mist-pearl"],
    enemyIds: ["marsh-spirit", "spirit-spark", "bog-wisp"],
    bossArena: { col: 32, row: 32, w: 10, h: 5, bossId: "spirit-lantern-king" },
    hiddenAreas: [{ id: "hidden-crypt", label: "Sunken Crypt", col: 38, row: 8 }],
    puzzles: [{ id: "puzzle-lanterns", label: "Lantern Order", col: 12, row: 32 }],
    waypoints: [{ id: "wp-spirit", label: "Village Waypoint", col: 6, row: 6 }],
    notes: ["Midgame mist/lantern identity — shrines and whispering bog."],
  },
  "celestial-rift": {
    cols: 52,
    rows: 44,
    completeness: "PARTIAL",
    zones: [
      { id: "landing", name: "Celestial Landing", kind: "safe", safe: true, grid: [2, 2, 14, 10] },
      { id: "starfall", name: "Starfall Fields", kind: "exploration", grid: [18, 4, 16, 12] },
      { id: "islands", name: "Floating Island Chain", kind: "danger", grid: [36, 4, 14, 14] },
      { id: "observatory", name: "Astral Observatory", kind: "settlement", grid: [4, 18, 14, 10] },
      { id: "broken-city", name: "Broken Celestial City", kind: "dungeon", grid: [22, 18, 16, 12] },
      { id: "heart", name: "Heart of the Rift", kind: "danger", grid: [8, 32, 16, 10] },
      { id: "world-rift", name: "World Rift Arena", kind: "boss", grid: [32, 32, 16, 10] },
    ],
    buildings: [
      { id: "expedition-base", label: "Expedition Base", grid: [3, 3, 10, 6], color: 0x9b7bff },
      { id: "observatory-bldg", label: "Astral Observatory", grid: [6, 20, 10, 6], color: 0xffd060 },
    ],
    npcIds: [
      { id: "astronomer-caelis", col: 14, row: 16 },
      { id: "guardian-seraphine", col: 20, row: 12 },
      { id: "starforger-orion", col: 16, row: 20 },
      { id: "nameless-witness", col: 24, row: 18 },
      { id: "celestial-acolyte-nova", col: 13, row: 15 },
      { id: "celestial-scribe-astro", col: 15, row: 17 },
      { id: "celestial-porter-orbit", col: 17, row: 16 },
      { id: "celestial-guard-lumen", col: 19, row: 13 },
    ],
    resourceIds: ["celestial-shard", "star-dust", "orbit-glass", "rift-petal"],
    enemyIds: ["starborn-guardian", "comet-mite", "astral-wisp"],
    bossArena: { col: 36, row: 34, w: 10, h: 6, bossId: "celestial-rift-entity" },
    hiddenAreas: [
      { id: "hidden-constellation", label: "Constellation Island", col: 40, row: 10 },
      { id: "hidden-time-vault", label: "Time-Frozen Vault", col: 28, row: 22 },
    ],
    puzzles: [
      { id: "puzzle-constellation", label: "Constellation Device", col: 10, row: 22 },
      { id: "puzzle-affinity", label: "Affinity Platforms", col: 12, row: 34 },
    ],
    waypoints: [{ id: "wp-celestial", label: "Landing Waypoint", col: 8, row: 6 }],
    notes: [
      "Endgame starfield identity — gateway restoration gated.",
      "Never requires paid pets or paid region unlocks.",
    ],
  },
};

function buildFromSpec(slug: string): MapBlueprint {
  const region = REGION_BY_SLUG[slug];
  if (!region) throw new Error(`Unknown region ${slug}`);
  const spec = SPECS[slug];
  if (!spec) throw new Error(`No blueprint spec for ${slug}`);
  const T = TILE;

  const zones: MapZone[] = spec.zones.map((z) => {
    const [c, r, w, h] = z.grid;
    return {
      id: z.id,
      name: z.name,
      x: c * T,
      y: r * T,
      width: w * T,
      height: h * T,
      kind: z.kind,
      safe: z.safe,
    };
  });

  const pathways: PathwayDef[] = [];
  for (let i = 0; i < zones.length - 1; i++) {
    pathways.push({
      id: `path-${zones[i]!.id}-${zones[i + 1]!.id}`,
      from: zones[i]!.id,
      to: zones[i + 1]!.id,
      waypoints: [
        {
          x: zones[i]!.x + zones[i]!.width / 2,
          y: zones[i]!.y + zones[i]!.height / 2,
        },
        {
          x: zones[i + 1]!.x + zones[i + 1]!.width / 2,
          y: zones[i + 1]!.y + zones[i + 1]!.height / 2,
        },
      ],
    });
  }

  const built = spec.buildings.map((b) => {
    const [c, r, w, h] = b.grid;
    return building(region, b.id, b.label, c * T, r * T, w * T, h * T, b.color);
  });

  const objects: WorldMapObject[] = [
    ...built.map((b) => b.object),
    {
      id: `${slug}-spawn`,
      type: "spawn",
      regionId: region.id,
      sceneId: region.sceneKey,
      x: region.spawn.x,
      y: region.spawn.y,
      label: "Spawn",
    },
    ...spec.npcIds.map((n) => npcAt(region, n.id, n.col * T, n.row * T)),
    ...spec.resourceIds.flatMap((rid, i) => {
      const def = RESOURCE_DEFS.find((r) => r.id === rid);
      if (!def) return [];
      const col = 10 + (i % 6) * 4;
      const row = 12 + Math.floor(i / 6) * 4;
      return [resourceAt(region, rid, `res-${slug}-${rid}`, col * T, row * T)];
    }),
    ...spec.enemyIds.map((eid, i) => {
      const col = 20 + (i % 4) * 5;
      const row = 20 + Math.floor(i / 4) * 5;
      return enemyZone(region, `spawn-${slug}-${eid}`, eid, col * T, row * T, 4 * T, 4 * T);
    }),
    ...spec.hiddenAreas.map((h) => ({
      id: h.id,
      type: "hidden_area" as const,
      regionId: region.id,
      sceneId: region.sceneKey,
      x: h.col * T,
      y: h.row * T,
      label: h.label,
      metadata: { discoverable: true },
    })),
    ...spec.puzzles.map((p) => ({
      id: p.id,
      type: "puzzle" as const,
      regionId: region.id,
      sceneId: region.sceneKey,
      x: p.col * T,
      y: p.row * T,
      interactive: true,
      interactionRadius: 40,
      label: p.label,
    })),
    ...spec.waypoints.map((w) => ({
      id: w.id,
      type: "waypoint" as const,
      regionId: region.id,
      sceneId: region.sceneKey,
      x: w.col * T,
      y: w.row * T,
      interactive: true,
      interactionRadius: 40,
      label: w.label,
      metadata: { fastTravel: true },
    })),
    ...portalRing(region, region.spawn.x, region.spawn.y - 2 * T, 2 * T),
    gatewayStoneAt(region, region.spawn.x + 2 * T, region.spawn.y - 1 * T),
  ];

  if (spec.bossArena) {
    const b = spec.bossArena;
    const boss = ENEMY_DEFS.find((e) => e.id === b.bossId);
    objects.push({
      id: `${slug}-boss-arena`,
      type: "boss_arena",
      regionId: region.id,
      sceneId: region.sceneKey,
      x: b.col * T,
      y: b.row * T,
      width: b.w * T,
      height: b.h * T,
      label: boss?.name ?? b.bossId,
      metadata: { bossId: b.bossId, arenaRef: `${slug}-boss` },
    });
  }

  // Region-specific hazard / terrain colliders (roads come from pathways)
  const hazardColliders = hazardCollidersFor(slug, T);

  // Landmark decorations so stubs aren't empty flats
  const landmarks = landmarkObjectsFor(slug, region, T);
  for (const lm of landmarks) {
    objects.push(lm);
  }
  const landmarkColliders: CollisionRect[] = landmarks.map((lm) => ({
    id: `${lm.id}-col`,
    x: lm.x,
    y: lm.y,
    width: lm.width ?? 64,
    height: lm.height ?? 64,
    kind: "building" as const,
  }));

  const safeZones = zones
    .filter((z) => z.safe)
    .map((z) => ({
      id: `${z.id}-safe`,
      x: z.x,
      y: z.y,
      width: z.width,
      height: z.height,
    }));

  return finalizeBlueprint(region, {
    cols: spec.cols,
    rows: spec.rows,
    zones,
    pathways,
    objects,
    colliders: [
      ...built.map((b) => b.collider),
      ...hazardColliders,
      ...landmarkColliders,
    ],
    safeZones,
    spawn: region.spawn,
    notes: spec.notes,
    completeness: spec.completeness,
  });
}

export function buildRegionBlueprint(slug: string): MapBlueprint {
  if (slug === "riftwild-commons") {
    throw new Error("Use buildRiftwildCommonsBlueprint() for Commons");
  }
  return buildFromSpec(slug);
}

export const FACTORY_SLUGS = Object.keys(SPECS);
