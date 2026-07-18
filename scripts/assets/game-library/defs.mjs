/**
 * Riftwilds game library catalog definitions.
 * Expands archetypes × variants into ≥1000 original-IP entries.
 */

export const STYLE_SUFFIX =
  "Original Riftwilds IP only. Cozy readable top-down game sprite with chunky silhouette and soft dark outline, lush warm greens browns sandstone, cyan rift and amber hearth accents only, transparent background, no text no watermark no logos, cute fantasy RPG village feel, not anime not third-party asset clones.";

/** @typedef {'ground'|'prop'|'entity'|'structure'|'overhead'|'fx'} Layer */
/** @typedef {'commons'|'elderwood'|'ember'|'coast'|'frost'|'storm'|'stone'|'spirit'|'void'|'alloy'|'radiant'|'any'} Biome */

/**
 * @typedef {object} CatalogEntry
 * @property {string} id
 * @property {string} category
 * @property {string} path - public URL path
 * @property {string[]} tags
 * @property {Biome} biome
 * @property {Layer} layer
 * @property {{x:number,y:number}} anchors - normalized foot origin (0-1)
 * @property {string} label
 * @property {string} prompt
 * @property {string} family
 * @property {Record<string,string>} [variant]
 * @property {boolean} [bootCritical]
 * @property {number} [size]
 */

const SEASONS = ["spring", "summer", "autumn", "winter"];
const SIZES3 = ["sapling", "mature", "ancient"];
const SIZES2 = ["small", "large"];
const PALETTES = ["moss", "amber", "cyan", "sandstone", "ember", "frost"];

const TREE_TYPES = [
  "oak", "pine", "birch", "willow", "maple", "ash", "elder", "rift-crystal",
  "orchard", "flowering", "cypress", "mangrove", "aspen", "hollow", "twin-trunk",
  "canopy-umbrella", "moss-tower", "ember-bark", "frost-needle", "tide-palm",
  "spirit-wisp", "stone-heartwood", "storm-spire", "alloy-wire", "grove-sentinel",
];

const BUSH_TYPES = [
  "berry", "thorn", "moss", "fern", "heather", "lavender-rift", "holly", "bramble",
  "sage", "juniper", "rosehip", "cloudberry", "rift-bloom", "ember-scrub",
  "frost-tuft", "tide-kelp", "spirit-mist", "stone-lichen", "storm-reed", "alloy-coil",
];

const FLOWER_TYPES = [
  "dawnpetal", "riftlily", "ambercup", "mossbell", "skythistle", "hearthbloom",
  "voidnettle", "tidecrown", "frostbell", "emberpop", "spiritlace", "stonewort",
  "stormiris", "alloydaisy", "groveorchid",
];

const GRASS_TYPES = [
  "tuft", "clump", "blade-tall", "meadow", "dry-patch", "reed", "fern-floor",
  "moss-carpet", "wildflower-mix", "path-edge", "plaza-crack", "rift-glow-grass",
];

const MUSHROOM_TYPES = [
  "cap-amber", "cap-cyan", "shelf", "cluster", "glow-spore", "hollow-stem",
  "rift-morel", "ember-puff", "frost-cap", "tide-gill", "spirit-bell", "stone-bracket",
  "storm-umbrella", "alloy-disk", "grove-ring", "void-ink",
];

const VINE_TYPES = [
  "wall-ivy", "arch-hang", "ground-creep", "rift-tendril", "ember-vine",
  "frost-lace", "tide-kelp-rope", "spirit-thread", "stone-root", "storm-wire",
];

const ROCK_TYPES = [
  "boulder", "pile", "flat-slab", "spire", "moss-rock", "rift-shard",
  "ember-scoria", "frost-chunk", "tide-smooth", "spirit-orb-stone",
];

const ROAD_TYPES = [
  "straight", "curve", "tee", "cross", "worn", "cobble", "dirt", "mossy",
  "plaza-edge", "bridge-approach", "gate-threshold", "alley",
];

const WATER_TYPES = [
  "pool", "stream", "ripple", "foam", "shore", "deep", "shallow", "waterfall-base",
];

const DECAL_TYPES = [
  "path-wear", "mud-splash", "leaf-litter", "petal-scatter", "ash-dust",
  "frost-rime", "sand-drift", "moss-patch", "crack-line", "rift-glow-mark",
  "wagon-rut", "footprint-trail", "oil-spot", "grain-spill", "herb-scatter",
  "sparkle-dust", "shadow-soft", "shadow-hard", "puddle", "snow-drift",
];

const WALL_STYLES = ["timber", "stone", "mixed", "adobe", "rift-inlaid"];
const ROOF_STYLES = ["thatch", "tile", "slate", "shingle", "copper-rift"];
const DOOR_STYLES = ["plank", "arched", "iron-band", "stable", "shuttered", "rift-glyph"];
const WINDOW_STYLES = ["square", "arched", "lattice", "stained-amber", "shutter", "rift-pane"];

const PROP_CRATES = ["plain", "banded", "open", "marked", "stacked", "rift-sealed", "market", "workshop"];
const PROP_BARRELS = ["oak", "iron-ring", "leaky", "ember-seal", "tide-seal", "stacked", "tap", "painted"];
const LANTERNS = ["post", "hanging", "table", "rift-glow", "ember", "frost", "paper", "cage", "well", "plaza", "alley", "dock"];
const SIGNS = ["wood-blank", "arrow-left", "arrow-right", "market", "inn", "danger", "portal", "guild", "farm", "training", "keep-out", "welcome", "rift-warning", "fish", "herbs", "forge"];
const FURNITURE = ["bench", "table", "stool", "shelf", "chest", "bed-frame", "loom", "anvil-stand", "desk", "bookcase", "crate-seat", "picnic", "altar-slab", "counter", "rack", "trough", "well-crank", "wheelbarrow", "cart", "ladder"];
const TOOLS = ["hammer", "axe", "pick", "hoe", "fishing-rod", "saw", "tongs", "ladle", "broom", "shovel", "sickle", "net", "chisel", "quill", "lantern-hand", "rope-coil"];
const MARKET_GOODS = ["apple-crate", "herb-bundle", "fish-basket", "cloth-roll", "pottery", "spice-sack", "cheese-wheel", "bread-board", "egg-basket", "crystal-tray", "flower-pot", "honey-jar", "map-scroll", "ink-pot", "seed-bag", "mushroom-box", "berry-bowl", "oil-flask", "candle-stack", "ribbon-spool", "tool-rack", "shield-display", "boot-pair", "hat-peg"];

const ANIMALS = [
  "grove-hare", "plaza-pigeon", "dock-gull", "meadow-fox", "barn-cat", "yard-hen",
  "pond-turtle", "forest-deer", "ember-salamander", "frost-hare", "tide-crab",
  "spirit-moth", "stone-badger", "storm-swift", "alloy-beetle", "void-bat",
  "radiant-dove", "orchard-bee", "market-rat", "well-frog", "fence-goat",
  "cart-mule", "watch-hound", "grove-squirrel", "rift-newt", "ash-crow",
  "moss-snail", "ember-lizard", "frost-owl", "tide-otter",
];

const AMBIENT = [
  "firefly-cluster", "spore-puff", "leaf-drift", "dust-mote", "ripple-ring",
  "ember-spark", "frost-flake", "tide-bubble", "spirit-wisp", "stone-dust",
  "storm-static", "alloy-glint", "void-mote", "radiant-mote", "pollen-cloud",
  "smoke-curl", "steam-puff", "shadow-flicker", "rift-pulse", "hearth-glow",
];

const RIFTLING_SPECIES = [
  "sparklet", "mossbun", "emberpup", "tideling", "frostnip", "stormkit",
  "stoneling", "spiritwisp", "voidling", "alloybit", "radiantpup", "grovetuft",
  "ashcinder", "dewdrop", "thornlet", "crystalpup", "sandgrain", "mirewisp",
  "peaklet", "bloomkin", "shardling", "nimbuskit", "cobblepup", "glimmer",
  "rootlet", "flarekit", "brinepup", "iciclebit", "gustlet", "oreling",
  "hauntwisp", "gearkit", "halopup", "fernlet", "cinderbun", "pearlkit",
  "bramblepup", "prismlet", "dunegrain", "bogwisp",
];

const NPC_ROLES = [
  "merchant", "guard", "gardener", "courier", "fisher", "smith", "scholar", "cook",
  "child", "elder", "bard", "healer", "farmer", "builder", "stablehand", "scribe",
  "hunter", "tailor", "potter", "miller", "innkeeper", "dockhand", "acolyte", "ranger",
];

const KEEPER_LOOKS = [
  "travel-cloak", "plaza-coat", "grove-vest", "ember-apron", "tide-slicker",
  "frost-parka", "storm-cape", "stone-tabard", "spirit-shawl", "void-hood",
  "alloy-harness", "radiant-robe",
];

const ITEM_KINDS = [
  "potion-amber", "potion-cyan", "scroll", "key", "coin-pouch", "gem", "herb",
  "ration", "map", "compass", "charm", "ring", "amulet", "boot", "glove",
  "hat", "cloak-icon", "sword-icon", "shield-icon", "bow-icon", "staff-icon",
  "pickaxe-icon", "fishing-icon", "seed", "bait", "bandage", "torch-item",
  "rope-item", "bucket", "lantern-item", "bell", "whistle", "flute", "drum",
  "book", "quill-item", "ink", "crystal-shard", "rift-dust", "egg-fragment",
];

const EGG_KINDS = [
  "grove", "ember", "tide", "frost", "storm", "stone", "spirit", "void",
  "alloy", "radiant", "commons", "ancient", "speckled", "rift-veined",
  "mossy", "ashen", "pearl", "obsidian", "golden-hearth", "cyan-pulse",
];

const EQUIP_ICONS = [
  "helm-leather", "helm-iron", "chest-cloth", "chest-mail", "legs-cloth", "legs-mail",
  "boots-travel", "boots-iron", "gloves-work", "gloves-battle", "cape-travel", "cape-guild",
  "sword-short", "sword-long", "axe-hand", "mace", "dagger", "spear", "bow", "crossbow",
  "staff-wood", "staff-rift", "wand", "shield-round", "shield-kite", "buckler",
  "ring-plain", "ring-rift", "amulet-amber", "amulet-cyan", "belt", "quiver",
  "pouch", "backpack", "torch-equip", "lantern-equip", "pick", "hammer-smith",
  "fishing-rod-eq", "sickle-eq",
];

const FX_SMOKE = ["puff-01", "puff-02", "puff-03", "puff-04", "column-01", "column-02", "drift-01", "drift-02"];
const FX_SPARKLE = ["glint-01", "glint-02", "burst-01", "burst-02", "rift-01", "rift-02", "hearth-01", "hearth-02"];
const FX_SHADOW = ["ellipse-soft", "ellipse-hard", "blob", "long", "contact", "canopy"];
const FX_WEATHER = [
  "rain-01", "rain-02", "rain-03", "rain-04",
  "snow-01", "snow-02", "snow-03", "snow-04",
  "leaf-01", "leaf-02", "ember-ash-01", "ember-ash-02",
  "pollen-01", "pollen-02", "mist-01", "mist-02",
];

const BUILDING_STALLS = ["produce", "fish", "cloth", "tools", "potions", "pets", "books", "bakery", "smithy-stand", "flower", "maps", "general"];
const FENCES = ["wood-post", "wood-rail", "stone-low", "iron-spike", "hedge", "rope", "rift-rail", "gate-post", "corner", "broken", "orchard", "dock-rail"];
const GATES = ["timber", "stone-arch", "iron", "portcullis-stub", "garden", "market", "plaza", "rift-seal"];
const BRIDGES = ["wood-short", "wood-long", "stone-arch", "rope", "dock-plank", "ruin", "rift-span", "covered"];
const DOCKS = ["plank", "pile", "crate-edge", "ladder", "bollard", "net-rack"];

const BIOMES = /** @type {Biome[]} */ ([
  "commons", "elderwood", "ember", "coast", "frost", "storm", "stone", "spirit", "void", "alloy", "radiant",
]);

function slug(...parts) {
  return parts.filter(Boolean).join("-").replace(/[^a-z0-9-]+/g, "-");
}

function promptFor(label, extra = "") {
  return `${label}. Soft-isometric cutout sprite for browser MMORPG overworld. ${extra} ${STYLE_SUFFIX}`;
}

/**
 * Expand all catalog entries (no files written).
 * @returns {CatalogEntry[]}
 */
export function expandCatalog() {
  /** @type {CatalogEntry[]} */
  const out = [];

  const push = (e) => {
    out.push(e);
  };

  // Trees: 25 × 4 × 3 = 300
  for (const type of TREE_TYPES) {
    for (const season of SEASONS) {
      for (const size of SIZES3) {
        const id = slug("tree", type, season, size);
        push({
          id,
          category: "trees",
          family: "tree",
          path: `/assets/game/library/trees/${id}.webp`,
          tags: ["tree", "canopy", type, season, size, "vegetation"],
          biome: type.includes("ember") ? "ember" : type.includes("frost") ? "frost" : type.includes("tide") ? "coast" : "commons",
          layer: "overhead",
          anchors: { x: 0.5, y: 0.92 },
          label: `${size} ${type} tree (${season})`,
          prompt: promptFor(`${size} ${type} tree in ${season}`, "full canopy silhouette, visible trunk foot"),
          variant: { type, season, size },
          bootCritical: type === "oak" && season === "summer" && size === "mature",
          size: size === "sapling" ? 96 : size === "mature" ? 128 : 160,
        });
      }
    }
  }

  // Bushes: 20 × 4 × 2 = 160
  for (const type of BUSH_TYPES) {
    for (const season of SEASONS) {
      for (const size of SIZES2) {
        const id = slug("bush", type, season, size);
        push({
          id,
          category: "bushes",
          family: "bush",
          path: `/assets/game/library/bushes/${id}.webp`,
          tags: ["bush", type, season, size, "vegetation"],
          biome: "commons",
          layer: "prop",
          anchors: { x: 0.5, y: 0.9 },
          label: `${size} ${type} bush (${season})`,
          prompt: promptFor(`${size} ${type} bush in ${season}`),
          variant: { type, season, size },
          bootCritical: type === "moss" && season === "summer" && size === "large",
          size: size === "small" ? 64 : 96,
        });
      }
    }
  }

  // Flowers: 15 × 3 palettes × 2 = 90
  for (const type of FLOWER_TYPES) {
    for (const palette of PALETTES.slice(0, 3)) {
      for (const size of SIZES2) {
        const id = slug("flower", type, palette, size);
        push({
          id,
          category: "flowers",
          family: "flower",
          path: `/assets/game/library/flowers/${id}.webp`,
          tags: ["flower", type, palette, size],
          biome: "commons",
          layer: "prop",
          anchors: { x: 0.5, y: 0.95 },
          label: `${size} ${type} (${palette})`,
          prompt: promptFor(`${size} ${type} flower cluster, ${palette} petals`),
          variant: { type, palette, size },
          bootCritical: type === "riftlily" && palette === "cyan" && size === "small",
          size: 64,
        });
      }
    }
  }

  // Grass: 12 × 3 biomes = 36
  for (const type of GRASS_TYPES) {
    for (const biome of ["commons", "elderwood", "ember"]) {
      const id = slug("grass", type, biome);
      push({
        id,
        category: "grass",
        family: "grass",
        path: `/assets/game/library/grass/${id}.webp`,
        tags: ["grass", type, biome, "decal"],
        biome: /** @type {Biome} */ (biome),
        layer: "ground",
        anchors: { x: 0.5, y: 0.85 },
        label: `${type} grass (${biome})`,
        prompt: promptFor(`${type} grass clump for ${biome} biome`),
        variant: { type, biome },
        size: 64,
      });
    }
  }

  // Mushrooms: 16 × 2 = 32
  for (const type of MUSHROOM_TYPES) {
    for (const size of SIZES2) {
      const id = slug("mushroom", type, size);
      push({
        id,
        category: "mushrooms",
        family: "mushroom",
        path: `/assets/game/library/mushrooms/${id}.webp`,
        tags: ["mushroom", type, size],
        biome: "elderwood",
        layer: "prop",
        anchors: { x: 0.5, y: 0.95 },
        label: `${size} ${type} mushroom`,
        prompt: promptFor(`${size} ${type} mushroom cluster`),
        variant: { type, size },
        bootCritical: type === "cap-amber" && size === "small",
        size: 64,
      });
    }
  }

  // Vines: 10 × 2 = 20
  for (const type of VINE_TYPES) {
    for (const size of SIZES2) {
      const id = slug("vine", type, size);
      push({
        id,
        category: "vines",
        family: "vine",
        path: `/assets/game/library/vines/${id}.webp`,
        tags: ["vine", type, size],
        biome: "elderwood",
        layer: "overhead",
        anchors: { x: 0.5, y: 0.2 },
        label: `${size} ${type}`,
        prompt: promptFor(`${size} hanging ${type} vine`),
        variant: { type, size },
        size: 96,
      });
    }
  }

  // Rocks: 10 × 3 palettes = 30
  for (const type of ROCK_TYPES) {
    for (const palette of PALETTES.slice(0, 3)) {
      const id = slug("rock", type, palette);
      push({
        id,
        category: "rocks",
        family: "rock",
        path: `/assets/game/library/rocks/${id}.webp`,
        tags: ["rock", type, palette],
        biome: "commons",
        layer: "prop",
        anchors: { x: 0.5, y: 0.9 },
        label: `${type} (${palette})`,
        prompt: promptFor(`${type} rock, ${palette} tones`),
        variant: { type, palette },
        size: 80,
      });
    }
  }

  // Roads: 12 × 2 wear = 24
  for (const type of ROAD_TYPES) {
    for (const wear of ["fresh", "worn"]) {
      const id = slug("road", type, wear);
      push({
        id,
        category: "roads",
        family: "road",
        path: `/assets/game/library/roads/${id}.webp`,
        tags: ["road", type, wear, "terrain"],
        biome: "commons",
        layer: "ground",
        anchors: { x: 0.5, y: 0.5 },
        label: `${type} road (${wear})`,
        prompt: promptFor(`top-down ${type} road tile, ${wear}`),
        variant: { type, wear },
        size: 64,
      });
    }
  }

  // Water: 8 × 2 = 16
  for (const type of WATER_TYPES) {
    for (const tone of ["clear", "deep"]) {
      const id = slug("water", type, tone);
      push({
        id,
        category: "water",
        family: "water",
        path: `/assets/game/library/water/${id}.webp`,
        tags: ["water", type, tone, "terrain"],
        biome: "coast",
        layer: "ground",
        anchors: { x: 0.5, y: 0.5 },
        label: `${type} water (${tone})`,
        prompt: promptFor(`top-down ${type} water, ${tone}`),
        variant: { type, tone },
        size: 64,
      });
    }
  }

  // Terrain decals: 20
  for (const type of DECAL_TYPES) {
    const id = slug("decal", type);
    push({
      id,
      category: "terrain-decals",
      family: "decal",
      path: `/assets/game/library/terrain/${id}.webp`,
      tags: ["decal", type, "terrain"],
      biome: "any",
      layer: "ground",
      anchors: { x: 0.5, y: 0.5 },
      label: `${type} decal`,
      prompt: promptFor(`ground decal: ${type}`),
      variant: { type },
      size: 64,
    });
  }

  // Modular buildings
  for (const style of WALL_STYLES) {
    for (const facing of ["front", "side", "corner", "damaged"]) {
      const id = slug("wall", style, facing);
      push({
        id,
        category: "buildings-walls",
        family: "wall",
        path: `/assets/game/library/buildings/${id}.webp`,
        tags: ["wall", "modular", style, facing],
        biome: "commons",
        layer: "structure",
        anchors: { x: 0.5, y: 0.95 },
        label: `${style} wall ${facing}`,
        prompt: promptFor(`isometric ${style} wall module, ${facing}`),
        variant: { style, facing },
        size: 128,
      });
    }
  }
  for (const style of ROOF_STYLES) {
    for (const pitch of ["low", "steep", "hip"]) {
      const id = slug("roof", style, pitch);
      push({
        id,
        category: "buildings-roofs",
        family: "roof",
        path: `/assets/game/library/buildings/${id}.webp`,
        tags: ["roof", "modular", style, pitch],
        biome: "commons",
        layer: "overhead",
        anchors: { x: 0.5, y: 0.85 },
        label: `${style} roof ${pitch}`,
        prompt: promptFor(`isometric ${style} roof, ${pitch} pitch`),
        variant: { style, pitch },
        size: 128,
      });
    }
  }
  for (const style of DOOR_STYLES) {
    for (const state of ["closed", "ajar", "open"]) {
      if (style === "rift-glyph" && state === "ajar") continue; // keep count tidy
      const id = slug("door", style, state);
      push({
        id,
        category: "buildings-doors",
        family: "door",
        path: `/assets/game/library/buildings/${id}.webp`,
        tags: ["door", style, state],
        biome: "commons",
        layer: "structure",
        anchors: { x: 0.5, y: 0.98 },
        label: `${style} door (${state})`,
        prompt: promptFor(`${style} door, ${state}`),
        variant: { style, state },
        size: 80,
      });
    }
  }
  // doors: 6*3 - 1 = 17 — pad with window extras below

  for (const style of WINDOW_STYLES) {
    for (const lit of ["day", "night", "shuttered"]) {
      const id = slug("window", style, lit);
      push({
        id,
        category: "buildings-windows",
        family: "window",
        path: `/assets/game/library/buildings/${id}.webp`,
        tags: ["window", style, lit],
        biome: "commons",
        layer: "structure",
        anchors: { x: 0.5, y: 0.5 },
        label: `${style} window (${lit})`,
        prompt: promptFor(`${style} window, ${lit}`),
        variant: { style, lit },
        size: 64,
      });
    }
  }

  for (const type of BUILDING_STALLS) {
    const id = slug("stall", type);
    push({
      id,
      category: "stalls",
      family: "stall",
      path: `/assets/game/library/buildings/${id}.webp`,
      tags: ["stall", "market", type],
      biome: "commons",
      layer: "structure",
      anchors: { x: 0.5, y: 0.95 },
      label: `${type} market stall`,
      prompt: promptFor(`isometric market stall selling ${type}`),
      variant: { type },
      size: 128,
    });
  }
  for (const type of FENCES) {
    const id = slug("fence", type);
    push({
      id,
      category: "fences",
      family: "fence",
      path: `/assets/game/library/buildings/${id}.webp`,
      tags: ["fence", type],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.95 },
      label: `${type} fence`,
      prompt: promptFor(`${type} fence segment`),
      variant: { type },
      bootCritical: type === "wood-post",
      size: 80,
    });
  }
  for (const type of GATES) {
    const id = slug("gate", type);
    push({
      id,
      category: "gates",
      family: "gate",
      path: `/assets/game/library/buildings/${id}.webp`,
      tags: ["gate", type],
      biome: "commons",
      layer: "structure",
      anchors: { x: 0.5, y: 0.95 },
      label: `${type} gate`,
      prompt: promptFor(`${type} town gate`),
      variant: { type },
      size: 128,
    });
  }
  for (const type of BRIDGES) {
    const id = slug("bridge", type);
    push({
      id,
      category: "bridges",
      family: "bridge",
      path: `/assets/game/library/buildings/${id}.webp`,
      tags: ["bridge", type],
      biome: "commons",
      layer: "structure",
      anchors: { x: 0.5, y: 0.9 },
      label: `${type} bridge`,
      prompt: promptFor(`${type} bridge prop`),
      variant: { type },
      size: 160,
    });
  }
  for (const type of DOCKS) {
    const id = slug("dock", type);
    push({
      id,
      category: "docks",
      family: "dock",
      path: `/assets/game/library/buildings/${id}.webp`,
      tags: ["dock", type],
      biome: "coast",
      layer: "structure",
      anchors: { x: 0.5, y: 0.9 },
      label: `${type} dock piece`,
      prompt: promptFor(`dock ${type}`),
      variant: { type },
      size: 96,
    });
  }

  // Props
  for (const type of PROP_CRATES) {
    for (const palette of PALETTES.slice(0, 3)) {
      const id = slug("crate", type, palette);
      push({
        id,
        category: "props-crates",
        family: "crate",
        path: `/assets/game/library/props/${id}.webp`,
        tags: ["crate", "prop", type, palette],
        biome: "commons",
        layer: "prop",
        anchors: { x: 0.5, y: 0.95 },
        label: `${type} crate (${palette})`,
        prompt: promptFor(`${type} wooden crate, ${palette}`),
        variant: { type, palette },
        bootCritical: type === "market" && palette === "amber",
        size: 64,
      });
    }
  }
  for (const type of PROP_BARRELS) {
    for (const palette of PALETTES.slice(0, 3)) {
      const id = slug("barrel", type, palette);
      push({
        id,
        category: "props-barrels",
        family: "barrel",
        path: `/assets/game/library/props/${id}.webp`,
        tags: ["barrel", "prop", type, palette],
        biome: "commons",
        layer: "prop",
        anchors: { x: 0.5, y: 0.95 },
        label: `${type} barrel (${palette})`,
        prompt: promptFor(`${type} barrel, ${palette}`),
        variant: { type, palette },
        size: 64,
      });
    }
  }
  for (const type of LANTERNS) {
    const id = slug("lantern", type);
    push({
      id,
      category: "props-lanterns",
      family: "lantern",
      path: `/assets/game/library/props/${id}.webp`,
      tags: ["lantern", "prop", type, "light"],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.98 },
      label: `${type} lantern`,
      prompt: promptFor(`${type} lantern with warm amber glow`),
      variant: { type },
      bootCritical: type === "rift-glow",
      size: 80,
    });
  }
  for (const type of SIGNS) {
    const id = slug("sign", type);
    push({
      id,
      category: "props-signs",
      family: "sign",
      path: `/assets/game/library/props/${id}.webp`,
      tags: ["sign", "prop", type],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.98 },
      label: `${type} sign`,
      prompt: promptFor(`wooden ${type} signpost, no readable letters — abstract glyphs only`),
      variant: { type },
      size: 80,
    });
  }
  for (const type of FURNITURE) {
    const id = slug("furniture", type);
    push({
      id,
      category: "props-furniture",
      family: "furniture",
      path: `/assets/game/library/props/${id}.webp`,
      tags: ["furniture", "prop", type],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.95 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`rustic ${type} furniture prop`),
      variant: { type },
      size: 80,
    });
  }
  for (const type of TOOLS) {
    const id = slug("tool", type);
    push({
      id,
      category: "props-tools",
      family: "tool",
      path: `/assets/game/library/props/${id}.webp`,
      tags: ["tool", "prop", type],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.9 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`${type} tool icon/prop`),
      variant: { type },
      size: 64,
    });
  }
  for (const type of MARKET_GOODS) {
    const id = slug("goods", type);
    push({
      id,
      category: "props-goods",
      family: "goods",
      path: `/assets/game/library/props/${id}.webp`,
      tags: ["goods", "market", "prop", type],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.95 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`market goods: ${type}`),
      variant: { type },
      size: 64,
    });
  }

  // Animals + ambient + riftlings
  for (const type of ANIMALS) {
    const id = slug("animal", type);
    push({
      id,
      category: "animals",
      family: "animal",
      path: `/assets/game/library/animals/${id}.webp`,
      tags: ["animal", "creature", type],
      biome: "commons",
      layer: "entity",
      anchors: { x: 0.5, y: 0.95 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`full-body ${type} ambient animal, side-ish soft iso`),
      variant: { type },
      size: 80,
    });
  }
  for (const type of AMBIENT) {
    const id = slug("ambient", type);
    push({
      id,
      category: "ambient",
      family: "ambient",
      path: `/assets/game/library/effects/${id}.webp`,
      tags: ["ambient", "fx", type],
      biome: "any",
      layer: "fx",
      anchors: { x: 0.5, y: 0.5 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`ambient fx: ${type}`),
      variant: { type },
      size: 64,
    });
  }
  for (const type of RIFTLING_SPECIES) {
    for (const stage of ["hatchling", "juvenile"]) {
      const id = slug("riftling", type, stage);
      push({
        id,
        category: "riftlings",
        family: "riftling",
        path: `/assets/game/library/riftlings/${id}.webp`,
        tags: ["riftling", "creature", type, stage],
        biome: "commons",
        layer: "entity",
        anchors: { x: 0.5, y: 0.95 },
        label: `${type} ${stage}`,
        prompt: promptFor(`original Riftling companion ${type} as ${stage}, crystal-rift biology, friendly silhouette`),
        variant: { type, stage },
        size: stage === "hatchling" ? 64 : 80,
      });
    }
  }

  // NPCs / Keepers
  for (const role of NPC_ROLES) {
    const id = slug("npc", role);
    push({
      id,
      category: "npcs",
      family: "npc",
      path: `/assets/game/library/npcs/${id}.webp`,
      tags: ["npc", role, "full-body"],
      biome: "commons",
      layer: "entity",
      anchors: { x: 0.5, y: 0.98 },
      label: `${role} NPC`,
      prompt: promptFor(`full-body ${role} townsperson, feet visible, readable silhouette ~keeper scale`),
      variant: { role },
      size: 96,
    });
  }
  for (const look of KEEPER_LOOKS) {
    const id = slug("keeper", look);
    push({
      id,
      category: "keepers",
      family: "keeper",
      path: `/assets/game/library/npcs/${id}.webp`,
      tags: ["keeper", "player", look, "full-body"],
      biome: "commons",
      layer: "entity",
      anchors: { x: 0.5, y: 0.98 },
      label: `Keeper (${look})`,
      prompt: promptFor(`full-body Keeper avatar in ${look}, feet visible`),
      variant: { look },
      size: 96,
    });
  }

  // Items / eggs / equipment
  for (const type of ITEM_KINDS) {
    const id = slug("item", type);
    push({
      id,
      category: "items",
      family: "item",
      path: `/assets/game/library/items/${id}.webp`,
      tags: ["item", "icon", type],
      biome: "any",
      layer: "prop",
      anchors: { x: 0.5, y: 0.5 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`inventory icon: ${type}`),
      variant: { type },
      size: 64,
    });
  }
  for (const type of EGG_KINDS) {
    const id = slug("egg", type);
    push({
      id,
      category: "eggs",
      family: "egg",
      path: `/assets/game/library/eggs/${id}.webp`,
      tags: ["egg", type],
      biome: "commons",
      layer: "prop",
      anchors: { x: 0.5, y: 0.9 },
      label: `${type} egg`,
      prompt: promptFor(`Riftwilds hatchery egg, ${type} affinity markings`),
      variant: { type },
      size: 64,
    });
  }
  for (const type of EQUIP_ICONS) {
    const id = slug("equip", type);
    push({
      id,
      category: "equipment",
      family: "equipment",
      path: `/assets/game/library/equipment/${id}.webp`,
      tags: ["equipment", "icon", type],
      biome: "any",
      layer: "prop",
      anchors: { x: 0.5, y: 0.5 },
      label: type.replace(/-/g, " "),
      prompt: promptFor(`equipment icon: ${type}`),
      variant: { type },
      size: 64,
    });
  }

  // Effects
  for (const type of FX_SMOKE) {
    const id = slug("fx-smoke", type);
    push({
      id,
      category: "effects-smoke",
      family: "smoke",
      path: `/assets/game/library/effects/${id}.webp`,
      tags: ["fx", "smoke", type],
      biome: "any",
      layer: "fx",
      anchors: { x: 0.5, y: 0.8 },
      label: `smoke ${type}`,
      prompt: promptFor(`smoke particle frame ${type}`),
      variant: { type },
      size: 64,
    });
  }
  for (const type of FX_SPARKLE) {
    const id = slug("fx-sparkle", type);
    push({
      id,
      category: "effects-sparkles",
      family: "sparkle",
      path: `/assets/game/library/effects/${id}.webp`,
      tags: ["fx", "sparkle", type],
      biome: "any",
      layer: "fx",
      anchors: { x: 0.5, y: 0.5 },
      label: `sparkle ${type}`,
      prompt: promptFor(`sparkle particle ${type}`),
      variant: { type },
      size: 48,
    });
  }
  for (const type of FX_SHADOW) {
    const id = slug("fx-shadow", type);
    push({
      id,
      category: "effects-shadows",
      family: "shadow",
      path: `/assets/game/library/effects/${id}.webp`,
      tags: ["fx", "shadow", type],
      biome: "any",
      layer: "ground",
      anchors: { x: 0.5, y: 0.5 },
      label: `shadow ${type}`,
      prompt: promptFor(`soft contact shadow ${type}`),
      variant: { type },
      size: 64,
    });
  }
  for (const type of FX_WEATHER) {
    const id = slug("fx-weather", type);
    push({
      id,
      category: "effects-weather",
      family: "weather",
      path: `/assets/game/library/effects/${id}.webp`,
      tags: ["fx", "weather", type],
      biome: "any",
      layer: "fx",
      anchors: { x: 0.5, y: 0.5 },
      label: `weather ${type}`,
      prompt: promptFor(`weather particle ${type}`),
      variant: { type },
      size: 48,
    });
  }

  // Extra biome rock piles for coverage if under 1000
  if (out.length < 1000) {
    let n = 0;
    while (out.length < 1000) {
      const biome = BIOMES[n % BIOMES.length];
      const id = slug("scatter", "clutter", biome, String(n));
      push({
        id,
        category: "props-clutter",
        family: "clutter",
        path: `/assets/game/library/props/${id}.webp`,
        tags: ["clutter", "prop", biome],
        biome,
        layer: "prop",
        anchors: { x: 0.5, y: 0.95 },
        label: `${biome} clutter ${n}`,
        prompt: promptFor(`small lived-in clutter pile for ${biome}`),
        variant: { biome, n: String(n) },
        size: 64,
      });
      n++;
    }
  }

  return out;
}

export function categoryBreakdown(entries) {
  /** @type {Record<string, number>} */
  const map = {};
  for (const e of entries) {
    map[e.category] = (map[e.category] ?? 0) + 1;
  }
  return map;
}

export function bootCriticalEntries(entries) {
  return entries.filter((e) => e.bootCritical);
}
