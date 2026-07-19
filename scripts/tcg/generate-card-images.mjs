/**
 * Composite Riftwilds TCG full-art card faces from existing creature/item art.
 *
 * Local only (sharp) — no Grok/XAI.
 * Each card gets a unique atmospheric scenic background (element/region themed),
 * with Companion / Ascendant mood variants so twins are not identical.
 * Name, RE cost, type, rules, ATK/HP are rasterized into the WebP.
 *
 * Usage:
 *   npm run tcg:generate:card-images
 *   node scripts/tcg/generate-card-images.mjs [--limit N] [--only id1,id2] [--force]
 *
 * Out:
 *   public/assets/tcg/cards/{cardId}.webp
 *   src/content/tcg/data/cardImages.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ROOT } from "./content-sources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const OUT_DIR = path.join(ROOT, "public/assets/tcg/cards");
const MANIFEST_PATH = path.join(ROOT, "src/content/tcg/data/cardImages.json");

/** Portrait card ratio ~2.5×3.5 */
const W = 500;
const H = 700;
const CONCURRENCY = 6;

const RARITY_ACCENT = {
  common: "#a07850",
  uncommon: "#3de7ff",
  rare: "#3de7ff",
  epic: "#ffb84d",
  legendary: "#66e0ff",
  mythic: "#d4a0ff",
  founder: "#ffe566",
  seasonal: "#ffc070",
  holiday: "#ffc070",
  animated: "#3de7ff",
  foil: "#e8d5b0",
  signed: "#ffe566",
  collector: "#ffb84d",
};

const ELEMENT_LABEL = {
  fire: "EMBER",
  water: "TIDE",
  nature: "GROVE",
  earth: "STONE",
  storm: "STORM",
  crystal: "FROST",
  shadow: "VOID",
  light: "RADIANT",
  spirit: "SPIRIT",
  arcane: "SPIRIT",
  poison: "GROVE",
  metal: "ALLOY",
  celestial: "RADIANT",
  void: "VOID",
  neutral: "SPIRIT",
};

/** Region map / wallpaper plates keyed by element + regionId. */
const REGION_PLATES = {
  "ember-crater": "public/assets/maps/regions/ember-crater.png",
  "moonwater-coast": "public/assets/maps/regions/moonwater-coast.png",
  "elderwood-forest": "public/assets/maps/regions/elderwood-forest.png",
  "stormspire-peaks": "public/assets/maps/regions/stormspire-peaks.png",
  "stoneheart-canyon": "public/assets/maps/regions/stoneheart-canyon.png",
  "frostveil-basin": "public/assets/maps/regions/frostveil-basin.png",
  "radiant-citadel": "public/assets/maps/regions/radiant-citadel.png",
  "void-hollow": "public/assets/maps/regions/void-hollow.png",
  "alloy-ruins": "public/assets/maps/regions/alloy-ruins.png",
  "spirit-marsh": "public/assets/maps/regions/spirit-marsh.png",
  "spirit-realm": "public/assets/wallpapers/cosmic-aurora.png",
  "celestial-rift": "public/assets/maps/regions/celestial-rift.png",
  "riftwild-commons": "public/assets/maps/regions/riftwild-commons.png",
};

/** Living-world building tiles + tiny library NPC pawns — never use as card face art. */
function isPlaceholderBuildingArt(assetPath) {
  if (!assetPath) return true;
  return /\/assets\/game\/library\/(?:buildings|npcs)\//i.test(assetPath);
}

/** Tiny geometric library sprites (circle-head pawns) are useless as subjects. */
function isTinyPlaceholderAsset(diskPath) {
  try {
    if (!diskPath || !fs.existsSync(diskPath)) return true;
    return fs.statSync(diskPath).size < 8_000;
  } catch {
    return true;
  }
}

const ELEMENT_TO_REGION = {
  fire: "ember-crater",
  water: "moonwater-coast",
  nature: "elderwood-forest",
  poison: "elderwood-forest",
  earth: "stoneheart-canyon",
  storm: "stormspire-peaks",
  crystal: "frostveil-basin",
  light: "radiant-citadel",
  celestial: "celestial-rift",
  shadow: "void-hollow",
  void: "void-hollow",
  metal: "alloy-ruins",
  spirit: "spirit-marsh",
  arcane: "celestial-rift",
  neutral: "riftwild-commons",
};

const WALLPAPER_FALLBACKS = {
  fire: "public/assets/wallpapers/spark-glow.png",
  water: "public/assets/wallpapers/moonwater-harbor.png",
  nature: "public/assets/wallpapers/elderwood-forest.png",
  poison: "public/assets/wallpapers/elderwood-forest.png",
  earth: "public/assets/wallpapers/homestead-dusk.png",
  storm: "public/assets/wallpapers/stormspire.png",
  crystal: "public/assets/wallpapers/rift-sky.png",
  light: "public/assets/wallpapers/radiant-castle.png",
  celestial: "public/assets/wallpapers/cosmic-aurora.png",
  shadow: "public/assets/wallpapers/circus-night.png",
  void: "public/assets/wallpapers/circus-night.png",
  metal: "public/assets/wallpapers/lantern-street.png",
  spirit: "public/assets/wallpapers/riftling-meadow.png",
  arcane: "public/assets/wallpapers/cosmic-aurora.png",
  neutral: "public/assets/wallpapers/commons-plaza.png",
};

/** Scenic palette + motif per element. */
const SCENES = {
  fire: {
    sky: ["#1a0c08", "#4a2010", "#8a3a18"],
    mid: "#5c2814",
    ground: "#2a140c",
    accent: "#ff8a3a",
    glow: "#ffb84d",
    motif: "ember",
  },
  water: {
    sky: ["#061828", "#0c3858", "#1a6088"],
    mid: "#0e4060",
    ground: "#083040",
    accent: "#3de7ff",
    glow: "#7ec8ff",
    motif: "tide",
  },
  nature: {
    sky: ["#0a1810", "#1a3820", "#2a5830"],
    mid: "#184828",
    ground: "#0c2414",
    accent: "#6ecf7a",
    glow: "#a8e0a0",
    motif: "grove",
  },
  poison: {
    sky: ["#0a1810", "#183818", "#284828"],
    mid: "#204020",
    ground: "#0c2010",
    accent: "#80c060",
    glow: "#b0e080",
    motif: "grove",
  },
  earth: {
    sky: ["#18140c", "#3a3020", "#5a4830"],
    mid: "#4a3824",
    ground: "#24180c",
    accent: "#d0a060",
    glow: "#e8c890",
    motif: "canyon",
  },
  storm: {
    sky: ["#0c1428", "#1c2848", "#304070"],
    mid: "#243858",
    ground: "#101828",
    accent: "#90b8ff",
    glow: "#c0d8ff",
    motif: "storm",
  },
  crystal: {
    sky: ["#101828", "#203848", "#386070"],
    mid: "#284858",
    ground: "#142028",
    accent: "#80e0f0",
    glow: "#c0f0ff",
    motif: "crystal",
  },
  light: {
    sky: ["#1c1810", "#3a3020", "#6a5830"],
    mid: "#504830",
    ground: "#241c10",
    accent: "#ffe080",
    glow: "#fff0c0",
    motif: "radiant",
  },
  celestial: {
    sky: ["#080c28", "#181848", "#302868"],
    mid: "#282858",
    ground: "#0c1028",
    accent: "#a090ff",
    glow: "#d0c0ff",
    motif: "celestial",
  },
  shadow: {
    sky: ["#080410", "#180c28", "#281438"],
    mid: "#201030",
    ground: "#0c0814",
    accent: "#a060c0",
    glow: "#d0a0e0",
    motif: "void",
  },
  void: {
    sky: ["#040208", "#14081c", "#200c28"],
    mid: "#180c20",
    ground: "#080410",
    accent: "#8060c0",
    glow: "#b090e0",
    motif: "void",
  },
  metal: {
    sky: ["#101418", "#242830", "#3a4048"],
    mid: "#303840",
    ground: "#14181c",
    accent: "#c0a060",
    glow: "#e0c890",
    motif: "alloy",
  },
  spirit: {
    sky: ["#0c1820", "#183040", "#284858"],
    mid: "#204050",
    ground: "#0c1820",
    accent: "#80d0c0",
    glow: "#b0f0e0",
    motif: "spirit",
  },
  arcane: {
    sky: ["#100818", "#281438", "#402060"],
    mid: "#301848",
    ground: "#140c20",
    accent: "#c080ff",
    glow: "#e0b0ff",
    motif: "celestial",
  },
  neutral: {
    sky: ["#101820", "#243040", "#385060"],
    mid: "#304050",
    ground: "#142028",
    accent: "#3de7ff",
    glow: "#ffb84d",
    motif: "commons",
  },
};

function parseArgs(argv) {
  const out = { limit: 0, only: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a === "--limit") out.limit = Number(argv[++i]) || 0;
    else if (a === "--only") {
      out.only = new Set(
        String(argv[++i] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return out;
}

function escapeXml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxChars, maxLines) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1] || "";
    lines[lines.length - 1] = `${last.replace(/\s+\S*$/, "")}…`.replace(/^…$/, "…");
  }
  return lines;
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function publicPathToDisk(rel) {
  if (!rel) return null;
  const clean = rel.startsWith("/") ? rel.slice(1) : rel;
  return path.join(ROOT, "public", clean);
}

function firstExistingPublic(rels) {
  for (const rel of rels) {
    if (!rel) continue;
    // Accept "public/assets/..." or "/assets/..."
    const disk = rel.startsWith("public/")
      ? path.join(ROOT, rel)
      : publicPathToDisk(rel.startsWith("/") ? rel : `/${rel}`);
    if (!disk || !fs.existsSync(disk)) continue;
    const publicRel = rel.startsWith("public/")
      ? `/${rel.slice("public/".length)}`
      : rel.startsWith("/")
        ? rel
        : `/${rel}`;
    return { rel: publicRel, disk };
  }
  return null;
}

/** Region scenic plates / overviews / wallpapers for location aura faces. */
function resolveRegionScenicArt(card) {
  const region = card.regionId || ELEMENT_TO_REGION[card.element] || "riftwild-commons";
  const candidates = [];
  if (REGION_PLATES[region]) {
    candidates.push(REGION_PLATES[region]);
  }
  candidates.push(
    `public/assets/maps/regions/${region}.png`,
    `public/assets/maps/${region}-overview.png`,
    `public/assets/maps/world-${region}-overview.png`,
  );
  if (region === "spirit-realm") {
    candidates.push(
      "public/assets/wallpapers/cosmic-aurora.png",
      "public/assets/wallpapers/rift-sky.png",
      "public/assets/maps/regions/spirit-marsh.png",
    );
  }
  const wall = WALLPAPER_FALLBACKS[card.element] || WALLPAPER_FALLBACKS.neutral;
  if (wall) candidates.push(wall);
  return firstExistingPublic(candidates);
}

function stallKindFromCard(card) {
  const m = String(card.id).match(/rotr-prop-stall-([a-z0-9-]+)/i);
  return m?.[1] || null;
}

function propKindFromCard(card) {
  const id = String(card.id);
  if (id.includes("-prop-stall-")) return "stall";
  if (id.includes("-prop-gate-")) return "gate";
  if (id.includes("-prop-bridge-")) return "bridge";
  if (id.includes("-prop-dock-")) return "dock";
  return null;
}

/** Distinct scenic wallpapers per stall trade (not shared house icons). */
const STALL_SCENIC = {
  produce: "public/assets/wallpapers/commons-plaza.png",
  fish: "public/assets/wallpapers/moonwater-harbor.png",
  cloth: "public/assets/wallpapers/festival-lanterns.png",
  tools: "public/assets/wallpapers/lantern-street.png",
  potions: "public/assets/wallpapers/circus-night.png",
  pets: "public/assets/wallpapers/riftling-meadow.png",
  books: "public/assets/wallpapers/keeper-academy.png",
  bakery: "public/assets/wallpapers/homestead-dusk.png",
};

/**
 * Soft stall accent overlay drawn atop a unique scenic wallpaper.
 * Keeps trades visually distinct without crude identical house icons.
 */
function stallAccentOverlaySvg(kind, cardId) {
  const rng = mulberry32(hashStr(`${cardId}|stall-accent|${kind}`));
  const palettes = {
    produce: { awning: "#6ecf7a", wood: "#8a5a28", accent: "#ffb84d", goods: ["#ff8a3a", "#6ecf7a", "#ffe080"] },
    fish: { awning: "#3de7ff", wood: "#4a3824", accent: "#7ec8ff", goods: ["#80e0f0", "#3de7ff", "#c0f0ff"] },
    cloth: { awning: "#d080c0", wood: "#6a4830", accent: "#f0a0d0", goods: ["#ff80a0", "#80a0ff", "#ffe080"] },
    tools: { awning: "#c0a060", wood: "#3a3020", accent: "#e0c890", goods: ["#a0a8b0", "#c0a060", "#d0b080"] },
    potions: { awning: "#a060c0", wood: "#2a1830", accent: "#d0a0e0", goods: ["#80e0f0", "#c080ff", "#6ecf7a"] },
    pets: { awning: "#ffb84d", wood: "#5a4030", accent: "#ffe9b0", goods: ["#f0c0a0", "#80d0c0", "#ffb0c0"] },
    books: { awning: "#8090c0", wood: "#4a3828", accent: "#c0d0ff", goods: ["#8a4a30", "#3a5080", "#c04040"] },
    bakery: { awning: "#ffc070", wood: "#6a4020", accent: "#ffe9b0", goods: ["#e8c090", "#d0a060", "#fff0c0"] },
  };
  const p = palettes[kind] || palettes.produce;
  const goods = [];
  for (let i = 0; i < 5; i++) {
    const x = 110 + i * 60 + rng() * 6;
    const y = 330 + rng() * 12;
    const color = p.goods[i % p.goods.length];
    if (kind === "fish") {
      goods.push(`<ellipse cx="${x}" cy="${y}" rx="20" ry="9" fill="${color}" opacity="0.92"/>`);
    } else if (kind === "cloth") {
      goods.push(`<path d="M ${x - 8} 210 Q ${x + 4} 280 ${x} 340" fill="none" stroke="${color}" stroke-width="12" opacity="0.8"/>`);
    } else if (kind === "tools") {
      goods.push(`<rect x="${x - 3}" y="${y - 34}" width="7" height="36" rx="2" fill="${color}"/>`);
    } else if (kind === "potions") {
      goods.push(`<rect x="${x - 7}" y="${y - 26}" width="14" height="26" rx="4" fill="${color}" opacity="0.88"/>`);
    } else if (kind === "books") {
      goods.push(`<rect x="${x - 10}" y="${y - 28}" width="20" height="30" rx="2" fill="${color}" opacity="0.9"/>`);
    } else if (kind === "bakery") {
      goods.push(`<ellipse cx="${x}" cy="${y}" rx="16" ry="11" fill="${color}"/>`);
    } else if (kind === "pets") {
      goods.push(`<circle cx="${x}" cy="${y - 6}" r="12" fill="${color}" opacity="0.85"/>`);
    } else {
      goods.push(`<rect x="${x - 14}" y="${y - 16}" width="28" height="22" rx="3" fill="${p.wood}" opacity="0.8"/>`);
      goods.push(`<circle cx="${x}" cy="${y - 6}" r="7" fill="${color}"/>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="stallFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061018" stop-opacity="0.15"/>
      <stop offset="55%" stop-color="#061018" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#061018" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#stallFade)"/>
  <ellipse cx="250" cy="400" rx="190" ry="36" fill="#000" opacity="0.28"/>
  <rect x="88" y="210" width="14" height="170" fill="${p.wood}" opacity="0.88"/>
  <rect x="398" y="210" width="14" height="170" fill="${p.wood}" opacity="0.88"/>
  <path d="M 70 220 L 250 140 L 430 220 Z" fill="${p.awning}" opacity="0.82"/>
  <path d="M 70 220 L 250 140 L 430 220" fill="none" stroke="${p.accent}" stroke-width="2.5" opacity="0.55"/>
  <rect x="100" y="300" width="300" height="58" rx="8" fill="${p.wood}" opacity="0.86"/>
  ${goods.join("\n")}
  <circle cx="${130 + rng() * 20}" cy="175" r="7" fill="${p.accent}" opacity="0.65"/>
  <circle cx="${360 + rng() * 20}" cy="170" r="7" fill="${p.accent}" opacity="0.6"/>
</svg>`;
}

/** Gate / bridge / dock vignettes — distinct silhouettes per prop family. */
function propVignetteSvg(kind, card) {
  const rng = mulberry32(hashStr(`${card.id}|prop|${kind}`));
  const accent = RARITY_ACCENT[card.rarity] || RARITY_ACCENT.common;
  const scene = SCENES[card.element] || SCENES.neutral;
  let motif = "";
  if (kind === "gate") {
    const archW = 160 + rng() * 40;
    const cx = W / 2;
    motif = `
      <rect x="${cx - archW / 2}" y="160" width="${archW}" height="220" rx="8" fill="${scene.mid}" opacity="0.85"/>
      <path d="M ${cx - archW / 2 + 20} 280 Q ${cx} 160 ${cx + archW / 2 - 20} 280 L ${cx + archW / 2 - 20} 380 L ${cx - archW / 2 + 20} 380 Z" fill="#0a1220" opacity="0.55"/>
      <rect x="${cx - 14}" y="300" width="28" height="80" fill="${accent}" opacity="0.5"/>
      <circle cx="${cx}" cy="200" r="16" fill="${scene.glow}" opacity="0.45"/>
    `;
  } else if (kind === "bridge") {
    motif = `
      <path d="M 40 340 Q 250 220 460 340" fill="none" stroke="${scene.mid}" stroke-width="28" opacity="0.9"/>
      <path d="M 40 340 Q 250 220 460 340" fill="none" stroke="${accent}" stroke-width="4" opacity="0.55"/>
      <rect x="60" y="280" width="12" height="100" fill="${scene.ground}" opacity="0.7"/>
      <rect x="428" y="280" width="12" height="100" fill="${scene.ground}" opacity="0.7"/>
      <ellipse cx="250" cy="400" rx="180" ry="24" fill="${scene.accent}" opacity="0.15"/>
    `;
  } else {
    // dock
    motif = `
      <rect x="40" y="300" width="420" height="36" rx="4" fill="${scene.mid}" opacity="0.9"/>
      <rect x="80" y="336" width="14" height="80" fill="${scene.ground}"/>
      <rect x="200" y="336" width="14" height="90" fill="${scene.ground}"/>
      <rect x="320" y="336" width="14" height="70" fill="${scene.ground}"/>
      <rect x="400" y="336" width="14" height="85" fill="${scene.ground}"/>
      <path d="M 0 420 Q 120 390 240 410 T 500 400" fill="none" stroke="${scene.accent}" stroke-width="3" opacity="0.4"/>
      <circle cx="${140 + rng() * 40}" cy="280" r="10" fill="${accent}" opacity="0.5"/>
    `;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="propSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${scene.sky[0]}"/>
      <stop offset="100%" stop-color="${scene.sky[2]}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#propSky)"/>
  <ellipse cx="250" cy="120" rx="90" ry="50" fill="${scene.glow}" opacity="0.25"/>
  ${motif}
</svg>`;
}

/**
 * Prefer full pet masters over thumbs when available.
 * Location/prop cards skip crude building tiles and use region scenic art
 * or unique stall/prop vignettes instead.
 */
function resolveSourceArt(assetPath, riftlingSlug, card) {
  if (card) {
    const propKind = propKindFromCard(card);
    if (propKind === "stall") {
      const kind = stallKindFromCard(card) || "produce";
      const scenic =
        firstExistingPublic([
          STALL_SCENIC[kind],
          "public/assets/wallpapers/commons-plaza.png",
          "public/assets/maps/regions/riftwild-commons.png",
        ]) || null;
      // Unique scenic wallpaper per trade — no crude shared house-icon overlay.
      if (scenic?.disk) {
        return { ...scenic, fit: "cover" };
      }
      return {
        rel: `generated:stall:${kind}`,
        disk: null,
        svg: stallAccentOverlaySvg(kind, card.id),
        fit: "cover",
      };
    }
    if (propKind === "gate" || propKind === "bridge" || propKind === "dock") {
      const scenicPrefs =
        propKind === "dock"
          ? [
              "public/assets/wallpapers/moonwater-harbor.png",
              "public/assets/maps/regions/moonwater-coast.png",
            ]
          : propKind === "bridge"
            ? [
                "public/assets/wallpapers/fountain-square.png",
                "public/assets/maps/regions/riftwild-commons.png",
              ]
            : [
                "public/assets/wallpapers/commons-plaza.png",
                "public/assets/maps/regions/riftwild-commons.png",
              ];
      const scenic = firstExistingPublic([
        ...scenicPrefs,
        REGION_PLATES[card.regionId] || null,
        "public/assets/wallpapers/commons-plaza.png",
      ]);
      // Prefer full scenic plates; fall back to silhouette vignette only if missing.
      if (scenic?.disk) {
        return { ...scenic, fit: "cover" };
      }
      return {
        rel: `generated:prop:${propKind}`,
        disk: null,
        svg: propVignetteSvg(propKind, card),
        fit: "cover",
      };
    }
    if (
      card.type === "location" ||
      card.type === "weather" ||
      String(card.id).includes("-l-")
    ) {
      const scenic = resolveRegionScenicArt(card);
      if (scenic) return { ...scenic, fit: "cover" };
    }
  }

  const candidates = [];
  if (riftlingSlug) {
    candidates.push(
      `/assets/pets/${riftlingSlug}.png`,
      `/assets/pets/${riftlingSlug}.webp`,
      `/assets/pets/thumbs/${riftlingSlug}.webp`,
      `/assets/pets/thumbs/${riftlingSlug}.png`,
    );
  }
  if (assetPath && !isPlaceholderBuildingArt(assetPath)) {
    const m = assetPath.match(/\/assets\/pets\/thumbs\/([a-z0-9-]+)\.(webp|png|svg)$/i);
    if (m) {
      const slug = m[1];
      candidates.push(
        `/assets/pets/${slug}.png`,
        `/assets/pets/${slug}.webp`,
        assetPath,
      );
    } else {
      candidates.push(assetPath);
    }
  }
  for (const rel of candidates) {
    if (isPlaceholderBuildingArt(rel)) continue;
    const disk = publicPathToDisk(rel);
    if (disk && fs.existsSync(disk) && !isTinyPlaceholderAsset(disk)) {
      return { rel, disk, fit: "contain" };
    }
  }

  // Location/weather with no pets: scenic fallback even if type missed above
  if (card && (card.type === "location" || card.type === "weather")) {
    const scenic = resolveRegionScenicArt(card);
    if (scenic) return { ...scenic, fit: "cover" };
  }

  // Prefer curated subject plates under /assets/tcg/subjects/{slug}.png
  if (card) {
    const subjectSlug = subjectSlugFromCard(card);
    const subjectRel = `/assets/tcg/subjects/${subjectSlug}.png`;
    const subjectDisk = publicPathToDisk(subjectRel);
    if (subjectDisk && fs.existsSync(subjectDisk) && !isTinyPlaceholderAsset(subjectDisk)) {
      return { rel: subjectRel, disk: subjectDisk, fit: "contain" };
    }
    // Hero cards: painted NPC portraits (full-res) when subject plate missing
    // Use contain (not cover) so wallpaper flares don't read as "scenic subject" overlays.
    if (card.type === "hero") {
      const artPath = card.art?.assetPath || card.art?.subjectPath;
      if (artPath && !isPlaceholderBuildingArt(artPath)) {
        const artDisk = publicPathToDisk(artPath);
        if (artDisk && fs.existsSync(artDisk) && !isTinyPlaceholderAsset(artDisk)) {
          return { rel: artPath, disk: artDisk, fit: "contain" };
        }
      }
      const npcHits = [
        `/assets/npcs/${subjectSlug}/portrait.png`,
        `/assets/npcs/${subjectSlug}/portrait.webp`,
        `/assets/npcs/riftwild-commons/${subjectSlug}/portrait.png`,
        `/assets/npcs/riftwild-commons/${subjectSlug}/portrait.webp`,
      ];
      for (const rel of npcHits) {
        const disk = publicPathToDisk(rel);
        if (disk && fs.existsSync(disk) && !isTinyPlaceholderAsset(disk)) {
          return { rel, disk, fit: "contain" };
        }
      }
    }
  }

  // Illustrated vignette (not geometric emblem) when no disk subject exists
  if (card) {
    return {
      rel: `generated:subject:${card.id}`,
      disk: null,
      svg: illustratedSubjectSvg(card, cardRole(card)),
      fit: "cover",
    };
  }
  return null;
}

/** Filename slug for curated subject art: pocket-spark, corrupt-whisper, … */
function subjectSlugFromCard(card) {
  const id = String(card.id || "");
  const trimmed = id
    .replace(/^rotr-(?:s|e|c|t|h|x|l|w|r|prop)-/, "")
    .replace(/^companion-/, "")
    .replace(/^legendary-/, "")
    .replace(/^artifact-/, "")
    .replace(/^quest-/, "")
    .replace(/^item-/, "")
    .replace(/^npc-/, "");
  return trimmed || id;
}

/** base | companion | ascendant | utility */
function cardRole(card) {
  if (card.type === "companion" || String(card.id).includes("-comp-")) return "companion";
  if (
    card.type === "legendary" ||
    String(card.id).includes("-evo-") ||
    /ascendant/i.test(card.localization?.name || "")
  ) {
    return "ascendant";
  }
  if (
    card.type === "creature" ||
    card.type === "hero" ||
    card.type === "token"
  ) {
    return "base";
  }
  return "utility";
}

function typeLabel(type) {
  if (
    type === "creature" ||
    type === "companion" ||
    type === "legendary" ||
    type === "token" ||
    type === "hero"
  ) {
    return "UNIT";
  }
  if (type === "weather" || type === "location") return "AURA";
  return "SPELL";
}

function resolvePlatePath(card) {
  const region = card.regionId || ELEMENT_TO_REGION[card.element] || "riftwild-commons";
  const regionPlate = REGION_PLATES[region];
  if (regionPlate && fs.existsSync(path.join(ROOT, regionPlate))) {
    return path.join(ROOT, regionPlate);
  }
  const wall = WALLPAPER_FALLBACKS[card.element] || WALLPAPER_FALLBACKS.neutral;
  if (wall && fs.existsSync(path.join(ROOT, wall))) {
    return path.join(ROOT, wall);
  }
  return null;
}

/**
 * Procedural scenic SVG — unique per cardId seed, element-themed motifs,
 * role-tinted (companion softer / ascendant dramatic).
 */
function scenicBackgroundSvg(card, role) {
  const scene = SCENES[card.element] || SCENES.neutral;
  const rng = mulberry32(hashStr(`${card.id}|${card.element}|${role}|bg`));
  const [sky0, sky1, sky2] = scene.sky;

  // Role mood shifts
  let vignette = role === "companion" ? 0.35 : role === "ascendant" ? 0.62 : 0.48;
  let glowOp = role === "companion" ? 0.28 : role === "ascendant" ? 0.55 : 0.4;
  let horizonY = role === "companion" ? 420 : role === "ascendant" ? 380 : 400;
  horizonY += Math.floor((rng() - 0.5) * 40);

  const hills = [];
  for (let i = 0; i < 3; i++) {
    const y = horizonY + 20 + i * 40 + Math.floor(rng() * 30);
    const peak = 80 + Math.floor(rng() * 120);
    const x0 = -40 + Math.floor(rng() * 80);
    hills.push(
      `<path d="M ${x0} ${H} Q ${W * 0.25 + rng() * 80} ${y - peak} ${W * 0.55} ${y} T ${W + 40} ${H} Z" fill="${scene.mid}" opacity="${0.35 + i * 0.12}"/>`,
    );
  }

  const particles = [];
  const count = role === "ascendant" ? 28 : role === "companion" ? 14 : 20;
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rng() * W);
    const y = Math.floor(rng() * (horizonY - 40));
    const r = 1 + rng() * (role === "ascendant" ? 3.5 : 2.2);
    particles.push(
      `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${scene.glow}" opacity="${(0.15 + rng() * 0.45).toFixed(2)}"/>`,
    );
  }

  let motifs = "";
  const motif = scene.motif;
  if (motif === "grove") {
    // Canopy light shafts + denser trees
    motifs += `<ellipse cx="${W * 0.3}" cy="80" rx="120" ry="60" fill="${scene.glow}" opacity="0.2"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 20 + i * 85 + Math.floor(rng() * 25);
      const h = 110 + Math.floor(rng() * 120);
      const trunk = role === "companion" ? 10 : 14;
      motifs += `<rect x="${x}" y="${horizonY - h}" width="${trunk}" height="${h}" fill="#142818" opacity="0.7"/>`;
      motifs += `<ellipse cx="${x + trunk / 2}" cy="${horizonY - h + 10}" rx="${36 + rng() * 28}" ry="${48 + rng() * 32}" fill="#2a5834" opacity="0.65"/>`;
      motifs += `<ellipse cx="${x + trunk / 2 - 10}" cy="${horizonY - h - 10}" rx="${28}" ry="${36}" fill="#3a6844" opacity="0.4"/>`;
    }
    for (let i = 0; i < 8; i++) {
      motifs += `<circle cx="${40 + rng() * (W - 80)}" cy="${horizonY - 40 - rng() * 200}" r="${1.5 + rng() * 2}" fill="${scene.glow}" opacity="0.55"/>`;
    }
  } else if (motif === "tide") {
    // Moon + reef mounds + wave bands
    motifs += `<circle cx="${100 + rng() * 80}" cy="${90 + rng() * 40}" r="${36 + rng() * 18}" fill="${scene.glow}" opacity="0.35"/>`;
    motifs += `<circle cx="${110 + rng() * 60}" cy="${95}" r="${22}" fill="#e8f4ff" opacity="0.22"/>`;
    for (let i = 0; i < 5; i++) {
      const y = horizonY + 10 + i * 26;
      motifs += `<path d="M 0 ${y} Q ${80 + rng() * 100} ${y - 22} ${240} ${y + 4} T ${W} ${y - 6}" fill="none" stroke="${scene.accent}" stroke-width="${2.5 + i * 0.3}" opacity="${0.4 + i * 0.08}"/>`;
    }
    for (let i = 0; i < 4; i++) {
      const x = 40 + i * 120 + rng() * 30;
      motifs += `<ellipse cx="${x}" cy="${horizonY + 70}" rx="${40 + rng() * 30}" ry="${18 + rng() * 10}" fill="#1a5068" opacity="0.55"/>`;
    }
  } else if (motif === "ember") {
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 80 + rng() * 20;
      motifs += `<path d="M ${x} ${horizonY + 40} L ${x + 20} ${horizonY - 40 - rng() * 60} L ${x + 45} ${horizonY + 40} Z" fill="${scene.mid}" opacity="0.45"/>`;
    }
    motifs += `<ellipse cx="${W / 2}" cy="${80 + rng() * 40}" rx="90" ry="50" fill="${scene.glow}" opacity="${glowOp * 0.5}"/>`;
  } else if (motif === "storm") {
    for (let i = 0; i < 3; i++) {
      const x = 60 + i * 140 + rng() * 40;
      const y = 60 + rng() * 80;
      motifs += `<polyline points="${x},${y} ${x + 12},${y + 40} ${x - 8},${y + 45} ${x + 18},${y + 100}" fill="none" stroke="${scene.accent}" stroke-width="2" opacity="0.35"/>`;
    }
  } else if (motif === "canyon") {
    for (let i = 0; i < 4; i++) {
      const x = i * 130 - 20;
      motifs += `<rect x="${x}" y="${horizonY - 60 - rng() * 80}" width="${100 + rng() * 40}" height="${200}" fill="${scene.mid}" opacity="0.4" rx="4"/>`;
    }
  } else if (motif === "crystal" || motif === "radiant") {
    for (let i = 0; i < 5; i++) {
      const x = 50 + i * 90 + rng() * 20;
      const h = 50 + rng() * 70;
      motifs += `<polygon points="${x},${horizonY} ${x + 18},${horizonY - h} ${x + 36},${horizonY}" fill="${scene.accent}" opacity="0.28"/>`;
    }
    motifs += `<circle cx="${W * 0.7}" cy="${100}" r="40" fill="${scene.glow}" opacity="${glowOp * 0.4}"/>`;
  } else if (motif === "void") {
    motifs += `<circle cx="${W / 2 + (rng() - 0.5) * 80}" cy="${160}" r="${50 + rng() * 30}" fill="#000" opacity="0.45"/>`;
    motifs += `<circle cx="${W / 2}" cy="${160}" r="${70}" fill="none" stroke="${scene.accent}" stroke-width="2" opacity="0.3"/>`;
  } else if (motif === "alloy") {
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 110;
      const y = horizonY - 40 - rng() * 60;
      motifs += `<circle cx="${x}" cy="${y}" r="28" fill="none" stroke="${scene.accent}" stroke-width="3" opacity="0.3"/>`;
      motifs += `<circle cx="${x}" cy="${y}" r="10" fill="${scene.mid}" opacity="0.5"/>`;
    }
  } else if (motif === "celestial" || motif === "spirit") {
    for (let i = 0; i < 3; i++) {
      const x = 80 + i * 140 + rng() * 30;
      motifs += `<path d="M ${x} 80 Q ${x + 40} 200 ${x - 20} ${horizonY}" fill="none" stroke="${scene.accent}" stroke-width="1.5" opacity="0.25"/>`;
    }
  } else {
    // commons silhouettes
    motifs += `<rect x="40" y="${horizonY - 80}" width="60" height="80" fill="${scene.mid}" opacity="0.35"/>`;
    motifs += `<rect x="360" y="${horizonY - 100}" width="50" height="100" fill="${scene.mid}" opacity="0.3"/>`;
  }

  // Ascendant rift crack / companion soft bloom
  let roleFx = "";
  if (role === "ascendant") {
    roleFx = `
      <path d="M ${W * 0.45} 0 L ${W * 0.52} ${H * 0.55} L ${W * 0.48} ${H}" fill="none" stroke="${scene.glow}" stroke-width="3" opacity="0.35"/>
      <ellipse cx="${W / 2}" cy="${H * 0.35}" rx="160" ry="120" fill="${scene.glow}" opacity="0.12"/>
    `;
  } else if (role === "companion") {
    roleFx = `
      <ellipse cx="${W / 2}" cy="${H * 0.55}" rx="200" ry="160" fill="${scene.glow}" opacity="0.1"/>
      <ellipse cx="${W / 2}" cy="${H * 0.7}" rx="180" ry="80" fill="#fff" opacity="0.04"/>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky0}"/>
      <stop offset="45%" stop-color="${sky1}"/>
      <stop offset="100%" stop-color="${sky2}"/>
    </linearGradient>
    <radialGradient id="sun" cx="70%" cy="22%" r="45%">
      <stop offset="0%" stop-color="${scene.glow}" stop-opacity="${glowOp}"/>
      <stop offset="100%" stop-color="${scene.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="45%" r="70%">
      <stop offset="50%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${vignette}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#sun)"/>
  ${particles.join("\n")}
  ${hills.join("\n")}
  <rect y="${horizonY + 60}" width="${W}" height="${H - horizonY}" fill="${scene.ground}" opacity="0.85"/>
  ${motifs}
  ${roleFx}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

/**
 * Semi-transparent HUD over full-bleed art (Riftwilds navy/cyan/amber).
 */
function overlaySvg(card, accent) {
  const name = escapeXml(card.localization?.name || card.id);
  const rules = wrapText(
    card.localization?.rulesText || card.localization?.flavorText || "",
    36,
    4,
  );
  const type = typeLabel(card.type);
  const element = ELEMENT_LABEL[card.element] || String(card.element || "").toUpperCase();
  const rarity = String(card.rarity || "common").toUpperCase();
  const cost = Number.isFinite(card.energyCost) ? card.energyCost : 0;
  const atk = card.attack == null ? "—" : String(card.attack);
  const hp = card.health == null ? "—" : String(card.health);
  const showCombat = card.attack != null || card.health != null;
  const power = String(card.attack ?? card.energyCost ?? 1);

  const typeY = 430;
  const rulesTop = 462;
  const rulesH = 148;
  const ruleLines = rules
    .map(
      (line, i) =>
        `<text x="28" y="${rulesTop + 28 + i * 22}" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="15">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const statsBlock = showCombat
    ? `<g>
        <rect x="352" y="618" width="124" height="44" rx="10" fill="#0a1220" fill-opacity="0.82" stroke="${accent}" stroke-width="1.5"/>
        <text x="414" y="647" text-anchor="middle" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${escapeXml(atk)}/${escapeXml(hp)}</text>
      </g>`
    : `<g>
        <rect x="352" y="618" width="124" height="44" rx="10" fill="#0a1220" fill-opacity="0.82" stroke="${accent}" stroke-width="1.5"/>
        <text x="414" y="636" text-anchor="middle" fill="${accent}" font-family="Georgia, 'Times New Roman', serif" font-size="10" letter-spacing="1">POWER</text>
        <text x="414" y="654" text-anchor="middle" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700">${escapeXml(power)}</text>
      </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061018" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#061018" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="botFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061018" stop-opacity="0"/>
      <stop offset="35%" stop-color="#061018" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#061018" stop-opacity="0.82"/>
    </linearGradient>
    <radialGradient id="reGem" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#ffe9b0"/>
      <stop offset="55%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#8a5a18"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="110" fill="url(#topFade)"/>
  <rect y="360" width="${W}" height="340" fill="url(#botFade)"/>

  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="18" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.55"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="14" fill="none" stroke="#ffb84d" stroke-width="0.75" opacity="0.22"/>

  <text x="22" y="42" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="700">${name}</text>

  <circle cx="458" cy="36" r="24" fill="url(#reGem)" stroke="#3a2810" stroke-width="2"/>
  <circle cx="458" cy="36" r="24" fill="none" stroke="#3de7ff" stroke-width="1" opacity="0.35"/>
  <text x="458" y="44" text-anchor="middle" fill="#1a1208" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${cost}</text>

  <rect x="16" y="${typeY}" width="${W - 32}" height="28" rx="4" fill="#0a1220" fill-opacity="0.62" stroke="${accent}" stroke-width="1" stroke-opacity="0.65"/>
  <line x1="16" y1="${typeY}" x2="${W - 16}" y2="${typeY}" stroke="#ffb84d" stroke-width="1.2" opacity="0.55"/>
  <line x1="16" y1="${typeY + 28}" x2="${W - 16}" y2="${typeY + 28}" stroke="#ffb84d" stroke-width="1.2" opacity="0.55"/>
  <text x="28" y="${typeY + 19}" fill="#e8f7ff" font-family="Georgia, 'Times New Roman', serif" font-size="13" letter-spacing="0.8">${escapeXml(`${type} · ${element}`)}</text>
  <circle cx="${W - 34}" cy="${typeY + 14}" r="7" fill="${accent}" stroke="#0a1220" stroke-width="1.5"/>
  <text x="${W - 34}" y="${typeY + 18}" text-anchor="middle" fill="#0a1220" font-family="Georgia, 'Times New Roman', serif" font-size="8" font-weight="700">${escapeXml(rarity.slice(0, 1))}</text>

  <rect x="16" y="${rulesTop}" width="${W - 32}" height="${rulesH}" rx="8" fill="#0a1220" fill-opacity="0.65" stroke="${accent}" stroke-width="1" stroke-opacity="0.4"/>
  ${ruleLines}

  ${statsBlock}

  <text x="22" y="${H - 14}" fill="#c8d0d8" font-family="Georgia, 'Times New Roman', serif" font-size="10" opacity="0.7">${escapeXml(rarity)} · Riftwilds</text>
</svg>`;
}

async function roundedCornerMask() {
  const r = 22;
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" rx="${r}" ry="${r}" fill="#fff"/>
</svg>`);
  return sharp(svg).png().toBuffer();
}

async function buildPlateLayer(card, role) {
  const platePath = resolvePlatePath(card);
  if (!platePath) return null;

  const seed = hashStr(`${card.id}|plate|${role}`);
  const rng = mulberry32(seed);
  // Unique crop offset per card so siblings don't share the same frame
  const left = Math.floor(rng() * 0.35 * 100) / 100;
  const top = Math.floor(rng() * 0.35 * 100) / 100;

  // Extract a hashed window then cover-resize
  const meta = await sharp(platePath).metadata();
  const srcW = meta.width || 1024;
  const srcH = meta.height || 1024;
  const cropW = Math.floor(srcW * (0.55 + rng() * 0.35));
  const cropH = Math.floor(srcH * (0.55 + rng() * 0.35));
  const leftPx = Math.min(Math.floor(left * (srcW - cropW)), Math.max(0, srcW - cropW));
  const topPx = Math.min(Math.floor(top * (srcH - cropH)), Math.max(0, srcH - cropH));

  let pipeline = sharp(platePath)
    .extract({
      left: leftPx,
      top: topPx,
      width: Math.max(32, cropW),
      height: Math.max(32, cropH),
    })
    .resize(W, H, { fit: "cover", position: "centre" });

  // Role color grading
  if (role === "companion") {
    pipeline = pipeline.modulate({ brightness: 1.08, saturation: 0.92 });
  } else if (role === "ascendant") {
    pipeline = pipeline.modulate({ brightness: 0.88, saturation: 1.15 });
  } else {
    pipeline = pipeline.modulate({ brightness: 0.95, saturation: 1.05 });
  }

  return pipeline.blur(role === "companion" ? 1.2 : 0.6).png().toBuffer();
}

/**
 * Illustrated subject vignette when no disk pet/item/subject art exists.
 * Replaces the old geometric crosshair emblem with element-themed fantasy scenes.
 */
function illustratedSubjectSvg(card, role) {
  const scene = SCENES[card.element] || SCENES.neutral;
  const accent = RARITY_ACCENT[card.rarity] || RARITY_ACCENT.common;
  const rng = mulberry32(hashStr(`${card.id}|subject-art`));
  const name = String(card.localization?.name || card.id || "").toLowerCase();
  const type = String(card.type || "spell");
  const cx = W / 2;
  const cy = role === "utility" ? 255 : 230;
  const [sky0, sky1, sky2] = scene.sky;

  const motes = [];
  for (let i = 0; i < 18; i++) {
    const x = 40 + rng() * (W - 80);
    const y = 60 + rng() * 320;
    motes.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + rng() * 2.4).toFixed(1)}" fill="${scene.glow}" opacity="${(0.2 + rng() * 0.45).toFixed(2)}"/>`,
    );
  }

  let subject = "";
  const motif = scene.motif;

  if (type === "companion" || type === "token" || /spark|buddy|fragment/i.test(name)) {
    // Soft floating companion spirit
    subject = `
      <ellipse cx="${cx}" cy="${cy + 70}" rx="90" ry="22" fill="#000" opacity="0.28"/>
      <ellipse cx="${cx}" cy="${cy}" rx="70" ry="58" fill="${scene.mid}" opacity="0.85"/>
      <ellipse cx="${cx - 8}" cy="${cy - 10}" rx="52" ry="42" fill="${scene.glow}" opacity="0.55"/>
      <circle cx="${cx - 14}" cy="${cy - 8}" r="7" fill="#f4efe6" opacity="0.9"/>
      <circle cx="${cx + 16}" cy="${cy - 6}" r="6" fill="#f4efe6" opacity="0.85"/>
      <circle cx="${cx - 14}" cy="${cy - 8}" r="3" fill="#0a1220"/>
      <circle cx="${cx + 16}" cy="${cy - 6}" r="2.5" fill="#0a1220"/>
      <path d="M ${cx - 40} ${cy + 10} Q ${cx - 70} ${cy - 30} ${cx - 30} ${cy - 50}" fill="none" stroke="${accent}" stroke-width="6" opacity="0.55"/>
      <path d="M ${cx + 36} ${cy + 8} Q ${cx + 68} ${cy - 28} ${cx + 28} ${cy - 48}" fill="none" stroke="${scene.glow}" stroke-width="5" opacity="0.5"/>
      <ellipse cx="${cx}" cy="${cy - 48}" rx="18" ry="22" fill="${accent}" opacity="0.65"/>
    `;
  } else if (type === "creature" || type === "legendary" || type === "hero") {
    // Creature / keeper silhouette with element body
    const bodyW = 55 + rng() * 20;
    const ear = /moth|mite|gnat|midge|spore/i.test(name);
    subject = `
      <ellipse cx="${cx}" cy="${cy + 78}" rx="100" ry="24" fill="#000" opacity="0.3"/>
      <ellipse cx="${cx}" cy="${cy + 20}" rx="${bodyW}" ry="${bodyW * 0.85}" fill="${scene.mid}" opacity="0.92"/>
      <ellipse cx="${cx - 6}" cy="${cy + 8}" rx="${bodyW * 0.72}" ry="${bodyW * 0.62}" fill="${scene.accent}" opacity="0.35"/>
      <circle cx="${cx}" cy="${cy - 40}" r="${28 + rng() * 8}" fill="${scene.mid}" opacity="0.95"/>
      <circle cx="${cx - 10}" cy="${cy - 44}" r="5" fill="#f4efe6"/>
      <circle cx="${cx + 12}" cy="${cy - 42}" r="4.5" fill="#f4efe6"/>
      <circle cx="${cx - 10}" cy="${cy - 44}" r="2" fill="#0a1220"/>
      <circle cx="${cx + 12}" cy="${cy - 42}" r="2" fill="#0a1220"/>
      ${
        ear
          ? `<ellipse cx="${cx - 34}" cy="${cy - 58}" rx="22" ry="14" fill="${scene.glow}" opacity="0.45" transform="rotate(-28 ${cx - 34} ${cy - 58})"/>
             <ellipse cx="${cx + 34}" cy="${cy - 56}" rx="22" ry="14" fill="${scene.glow}" opacity="0.4" transform="rotate(28 ${cx + 34} ${cy - 56})"/>`
          : `<path d="M ${cx - 18} ${cy - 62} L ${cx - 8} ${cy - 88} L ${cx + 2} ${cy - 62}" fill="${accent}" opacity="0.55"/>
             <path d="M ${cx + 8} ${cy - 60} L ${cx + 20} ${cy - 86} L ${cx + 28} ${cy - 58}" fill="${scene.glow}" opacity="0.45"/>`
      }
      <ellipse cx="${cx}" cy="${cy + 48}" rx="34" ry="12" fill="${scene.glow}" opacity="0.25"/>
    `;
  } else if (type === "equipment" || type === "relic" || type === "artifact") {
    // Relic / gear still-life
    subject = `
      <ellipse cx="${cx}" cy="${cy + 70}" rx="110" ry="26" fill="#000" opacity="0.28"/>
      <rect x="${cx - 70}" y="${cy + 20}" width="140" height="28" rx="8" fill="${scene.mid}" opacity="0.9"/>
      <path d="M ${cx - 40} ${cy + 20} L ${cx} ${cy - 70} L ${cx + 40} ${cy + 20} Z" fill="${scene.accent}" opacity="0.55"/>
      <circle cx="${cx}" cy="${cy - 20}" r="34" fill="#0a1220" opacity="0.55" stroke="${accent}" stroke-width="4"/>
      <circle cx="${cx}" cy="${cy - 20}" r="16" fill="${scene.glow}" opacity="0.75"/>
      <rect x="${cx - 8}" y="${cy + 48}" width="16" height="40" rx="3" fill="${accent}" opacity="0.65"/>
      <path d="M ${cx - 55} ${cy - 10} Q ${cx - 80} ${cy - 50} ${cx - 30} ${cy - 60}" fill="none" stroke="${scene.glow}" stroke-width="3" opacity="0.4"/>
      <path d="M ${cx + 55} ${cy - 8} Q ${cx + 80} ${cy - 48} ${cx + 28} ${cy - 58}" fill="none" stroke="${scene.glow}" stroke-width="3" opacity="0.35"/>
    `;
  } else {
    // Spells / events / traps / quests — magical effect burst (element-themed)
    if (motif === "ember") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 80}" rx="100" ry="22" fill="#000" opacity="0.25"/>
        <path d="M ${cx} ${cy + 50} Q ${cx - 40} ${cy} ${cx - 10} ${cy - 70} Q ${cx} ${cy - 20} ${cx + 18} ${cy - 80} Q ${cx + 50} ${cy} ${cx} ${cy + 50} Z" fill="${scene.accent}" opacity="0.85"/>
        <path d="M ${cx} ${cy + 30} Q ${cx - 18} ${cy - 10} ${cx} ${cy - 55} Q ${cx + 16} ${cy - 10} ${cx} ${cy + 30} Z" fill="${scene.glow}" opacity="0.8"/>
        <circle cx="${cx - 50}" cy="${cy - 20}" r="8" fill="${scene.glow}" opacity="0.7"/>
        <circle cx="${cx + 56}" cy="${cy - 8}" r="6" fill="${accent}" opacity="0.65"/>
        <circle cx="${cx + 30}" cy="${cy - 50}" r="5" fill="${scene.glow}" opacity="0.7"/>
      `;
    } else if (motif === "tide") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 70}" rx="120" ry="24" fill="#000" opacity="0.22"/>
        <path d="M ${cx - 90} ${cy + 20} Q ${cx - 40} ${cy - 40} ${cx} ${cy} T ${cx + 90} ${cy + 10}" fill="none" stroke="${scene.accent}" stroke-width="14" opacity="0.7"/>
        <path d="M ${cx - 80} ${cy + 40} Q ${cx - 20} ${cy - 10} ${cx + 20} ${cy + 20} T ${cx + 85} ${cy + 30}" fill="none" stroke="${scene.glow}" stroke-width="10" opacity="0.55"/>
        <circle cx="${cx + 10}" cy="${cy - 50}" r="28" fill="${scene.glow}" opacity="0.35"/>
        <circle cx="${cx - 40}" cy="${cy - 20}" r="10" fill="#e8f4ff" opacity="0.45"/>
        <circle cx="${cx + 50}" cy="${cy}" r="7" fill="#e8f4ff" opacity="0.4"/>
      `;
    } else if (motif === "grove") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 75}" rx="110" ry="22" fill="#000" opacity="0.25"/>
        <path d="M ${cx} ${cy + 50} C ${cx - 60} ${cy + 10} ${cx - 70} ${cy - 60} ${cx - 20} ${cy - 40} C ${cx - 50} ${cy - 90} ${cx + 10} ${cy - 80} ${cx} ${cy - 30} C ${cx + 40} ${cy - 90} ${cx + 70} ${cy - 40} ${cx + 30} ${cy - 20} C ${cx + 80} ${cy - 10} ${cx + 50} ${cy + 40} ${cx} ${cy + 50} Z" fill="${scene.mid}" opacity="0.9"/>
        <ellipse cx="${cx - 10}" cy="${cy - 20}" rx="40" ry="36" fill="${scene.accent}" opacity="0.45"/>
        <rect x="${cx - 6}" y="${cy + 10}" width="12" height="50" rx="3" fill="#142818" opacity="0.8"/>
        <circle cx="${cx + 24}" cy="${cy - 48}" r="6" fill="${scene.glow}" opacity="0.65"/>
      `;
    } else if (motif === "void") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 70}" rx="100" ry="22" fill="#000" opacity="0.3"/>
        <circle cx="${cx}" cy="${cy - 10}" r="70" fill="#000" opacity="0.55"/>
        <path d="M ${cx - 60} ${cy + 20} Q ${cx - 20} ${cy - 80} ${cx + 10} ${cy - 20} Q ${cx + 50} ${cy - 90} ${cx + 70} ${cy}" fill="none" stroke="${scene.accent}" stroke-width="8" opacity="0.65"/>
        <path d="M ${cx - 40} ${cy + 30} Q ${cx} ${cy - 50} ${cx + 45} ${cy + 10}" fill="none" stroke="${scene.glow}" stroke-width="5" opacity="0.45"/>
        <circle cx="${cx - 8}" cy="${cy - 18}" r="8" fill="${scene.glow}" opacity="0.55"/>
        <circle cx="${cx + 18}" cy="${cy - 12}" r="6" fill="${accent}" opacity="0.5"/>
        <ellipse cx="${cx}" cy="${cy + 35}" rx="50" ry="16" fill="${scene.accent}" opacity="0.2"/>
      `;
    } else if (motif === "storm") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 70}" rx="100" ry="20" fill="#000" opacity="0.25"/>
        <polyline points="${cx - 20},${cy - 70} ${cx + 8},${cy - 20} ${cx - 16},${cy - 12} ${cx + 30},${cy + 50}" fill="none" stroke="${scene.glow}" stroke-width="10" opacity="0.85"/>
        <polyline points="${cx + 10},${cy - 60} ${cx + 28},${cy - 10} ${cx + 6},${cy}" fill="none" stroke="${accent}" stroke-width="5" opacity="0.55"/>
        <circle cx="${cx - 40}" cy="${cy - 40}" r="16" fill="${scene.mid}" opacity="0.6"/>
        <circle cx="${cx + 50}" cy="${cy - 30}" r="12" fill="${scene.mid}" opacity="0.5"/>
      `;
    } else if (motif === "crystal" || motif === "radiant") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 72}" rx="100" ry="20" fill="#000" opacity="0.22"/>
        <polygon points="${cx},${cy - 80} ${cx + 34},${cy + 10} ${cx},${cy + 50} ${cx - 34},${cy + 10}" fill="${scene.accent}" opacity="0.7"/>
        <polygon points="${cx},${cy - 50} ${cx + 18},${cy + 5} ${cx},${cy + 30} ${cx - 18},${cy + 5}" fill="${scene.glow}" opacity="0.75"/>
        <polygon points="${cx - 50},${cy + 20} ${cx - 28},${cy - 30} ${cx - 10},${cy + 30}" fill="${scene.mid}" opacity="0.55"/>
        <polygon points="${cx + 50},${cy + 18} ${cx + 30},${cy - 28} ${cx + 12},${cy + 28}" fill="${scene.mid}" opacity="0.5"/>
        <circle cx="${cx}" cy="${cy - 10}" r="8" fill="#f4efe6" opacity="0.7"/>
      `;
    } else if (motif === "alloy") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 70}" rx="100" ry="20" fill="#000" opacity="0.25"/>
        <circle cx="${cx}" cy="${cy - 10}" r="56" fill="none" stroke="${scene.accent}" stroke-width="10" opacity="0.7"/>
        <circle cx="${cx}" cy="${cy - 10}" r="28" fill="${scene.mid}" opacity="0.85"/>
        <rect x="${cx - 8}" y="${cy - 70}" width="16" height="40" fill="${accent}" opacity="0.65"/>
        <rect x="${cx - 8}" y="${cy + 20}" width="16" height="40" fill="${accent}" opacity="0.55"/>
        <rect x="${cx - 70}" y="${cy - 18}" width="40" height="16" fill="${scene.glow}" opacity="0.45"/>
        <rect x="${cx + 30}" y="${cy - 18}" width="40" height="16" fill="${scene.glow}" opacity="0.4"/>
      `;
    } else if (motif === "celestial" || motif === "spirit") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 70}" rx="100" ry="20" fill="#000" opacity="0.22"/>
        <circle cx="${cx}" cy="${cy - 20}" r="48" fill="${scene.glow}" opacity="0.35"/>
        <path d="M ${cx} ${cy - 70} L ${cx + 14} ${cy - 24} L ${cx + 52} ${cy - 24} L ${cx + 20} ${cy} L ${cx + 32} ${cy + 40} L ${cx} ${cy + 16} L ${cx - 32} ${cy + 40} L ${cx - 20} ${cy} L ${cx - 52} ${cy - 24} L ${cx - 14} ${cy - 24} Z" fill="${accent}" opacity="0.75"/>
        <circle cx="${cx}" cy="${cy - 10}" r="10" fill="#f4efe6" opacity="0.8"/>
        <path d="M ${cx - 60} ${cy + 20} Q ${cx} ${cy - 40} ${cx + 60} ${cy + 24}" fill="none" stroke="${scene.glow}" stroke-width="3" opacity="0.4"/>
      `;
    } else if (motif === "canyon") {
      subject = `
        <ellipse cx="${cx}" cy="${cy + 72}" rx="110" ry="20" fill="#000" opacity="0.25"/>
        <rect x="${cx - 70}" y="${cy - 20}" width="50" height="90" rx="6" fill="${scene.mid}" opacity="0.85"/>
        <rect x="${cx + 20}" y="${cy - 40}" width="55" height="110" rx="6" fill="${scene.mid}" opacity="0.8"/>
        <path d="M ${cx - 20} ${cy + 50} L ${cx} ${cy - 60} L ${cx + 22} ${cy + 50}" fill="${scene.accent}" opacity="0.55"/>
        <circle cx="${cx}" cy="${cy - 20}" r="14" fill="${scene.glow}" opacity="0.55"/>
      `;
    } else {
      // commons / neutral spell burst
      subject = `
        <ellipse cx="${cx}" cy="${cy + 70}" rx="100" ry="22" fill="#000" opacity="0.25"/>
        <circle cx="${cx}" cy="${cy - 10}" r="54" fill="${scene.mid}" opacity="0.75"/>
        <circle cx="${cx}" cy="${cy - 10}" r="34" fill="${scene.glow}" opacity="0.45"/>
        <path d="M ${cx} ${cy - 70} Q ${cx + 40} ${cy - 20} ${cx} ${cy + 40} Q ${cx - 40} ${cy - 20} ${cx} ${cy - 70} Z" fill="${accent}" opacity="0.55"/>
        <circle cx="${cx}" cy="${cy - 14}" r="12" fill="#f4efe6" opacity="0.75"/>
        <circle cx="${cx - 48}" cy="${cy + 10}" r="7" fill="${scene.glow}" opacity="0.55"/>
        <circle cx="${cx + 50}" cy="${cy + 6}" r="6" fill="${accent}" opacity="0.5"/>
      `;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="subjSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky0}"/>
      <stop offset="55%" stop-color="${sky1}"/>
      <stop offset="100%" stop-color="${sky2}"/>
    </linearGradient>
    <radialGradient id="subjGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${scene.glow}" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="${scene.accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#subjSky)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="180" ry="140" fill="url(#subjGlow)"/>
  ${motes.join("\n")}
  ${subject}
  <rect width="${W}" height="${H}" fill="#000" opacity="0.12"/>
</svg>`;
}

/** Legacy name kept for any leftover references — delegates to illustrated subject. */
function scenicEmblemSvg(card, role) {
  return illustratedSubjectSvg(card, role);
}

async function compositeCard(card, source, outPath) {
  const accent = RARITY_ACCENT[card.rarity] || RARITY_ACCENT.common;
  const role = cardRole(card);
  const rng = mulberry32(hashStr(`${card.id}|layout`));
  const sourceDisk = source?.disk || null;
  const sourceSvg = source?.svg || null;
  const artOverlaySvg = source?.overlaySvg || null;
  const artFit = source?.fit === "cover" ? "cover" : "contain";
  const isScenicSubject =
    artFit === "cover" ||
    card.type === "location" ||
    card.type === "weather" ||
    Boolean(sourceSvg) ||
    Boolean(artOverlaySvg);

  // 1) Region/wallpaper plate as textured base (hashed crop)
  // 2) Procedural scenic SVG on top for clear element motifs
  const plate = await buildPlateLayer(card, role);
  const scenic = await sharp(Buffer.from(scenicBackgroundSvg(card, role))).png().toBuffer();

  const layers = [];
  if (plate) {
    const plateDim = await sharp(plate)
      .modulate({ brightness: isScenicSubject ? 0.55 : 0.72, saturation: 0.95 })
      .png()
      .toBuffer();
    layers.push({ input: plateDim, top: 0, left: 0 });
    // Scenic motifs at ~70% so plate texture still peeks through
    const scenicMix = await sharp(scenic)
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from(
            `<?xml version="1.0"?><svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#fff" fill-opacity="${isScenicSubject ? 0.45 : 0.72}"/></svg>`,
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();
    layers.push({ input: scenicMix, top: 0, left: 0, blend: "over" });
  } else {
    layers.push({ input: scenic, top: 0, left: 0 });
  }

  // 3) Creature / scenic / vignette art — or emblem when source art is missing
  let subjectInput = null;
  if (sourceSvg) {
    subjectInput = await sharp(Buffer.from(sourceSvg)).png().toBuffer();
  } else if (sourceDisk) {
    subjectInput = sourceDisk;
  }

  if (subjectInput) {
    // Stage-distinct framing so Base / Companion / Ascendant never read as the same crop.
    const artScale = isScenicSubject
      ? 0.98
      : role === "companion"
        ? 0.78
        : role === "ascendant"
          ? 0.96
          : 0.86;
    const artH = Math.floor(
      H * artScale * (isScenicSubject ? 0.58 : 0.68 + (role === "ascendant" ? 0.1 : 0.04)),
    );
    const artW = Math.floor(
      W *
        (isScenicSubject
          ? 0.94
          : role === "companion"
            ? 0.72
            : role === "ascendant"
              ? 0.94
              : 0.84),
    );
    const artTop = isScenicSubject
      ? Math.floor(H * 0.08)
      : role === "companion"
        ? Math.floor(H * 0.18)
        : role === "ascendant"
          ? Math.floor(H * 0.05)
          : Math.floor(H * 0.11);
    const artLeft = Math.floor((W - artW) / 2) + (role === "companion" ? Math.floor((rng() - 0.5) * 18) : 0);

    let artPipeline = sharp(subjectInput);
    // Mirror companion subjects so twins don't share the same silhouette direction.
    if (!isScenicSubject && role === "companion") {
      artPipeline = artPipeline.flop();
    }
    if (!isScenicSubject && role === "ascendant") {
      artPipeline = artPipeline.modulate({ brightness: 1.08, saturation: 1.18 });
    } else if (!isScenicSubject && role === "companion") {
      artPipeline = artPipeline.modulate({ brightness: 1.04, saturation: 0.92 });
    } else if (!isScenicSubject) {
      artPipeline = artPipeline.modulate({ brightness: 0.98, saturation: 1.0 });
    }
    artPipeline = artPipeline.resize(artW, artH, {
      fit: artFit,
      position: role === "ascendant" ? "centre" : role === "companion" ? "south" : "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (isScenicSubject) {
      // Soft rounded frame so scenic plates read as card art windows
      const frameMask = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${artW}" height="${artH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${artW}" height="${artH}" rx="18" ry="18" fill="#fff"/>
</svg>`);
      const framed = await artPipeline.png().toBuffer();
      artPipeline = sharp(framed).composite([
        { input: await sharp(frameMask).png().toBuffer(), blend: "dest-in" },
      ]);
    }
    let artBuf = await artPipeline.png().toBuffer();

    // Stage aura plate behind the creature (companion soft amber / ascendant rift cyan).
    if (!isScenicSubject && (role === "companion" || role === "ascendant")) {
      const auraColor = role === "ascendant" ? "#66e0ff" : "#ffb84d";
      const auraOp = role === "ascendant" ? 0.28 : 0.2;
      const aura = await sharp(
        Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${artW}" height="${artH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="${auraColor}" stop-opacity="${auraOp}"/>
      <stop offset="70%" stop-color="${auraColor}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${auraColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="${artW / 2}" cy="${artH * 0.55}" rx="${artW * 0.48}" ry="${artH * 0.42}" fill="url(#a)"/>
  ${
    role === "ascendant"
      ? `<path d="M ${artW * 0.5} ${artH * 0.08} L ${artW * 0.54} ${artH * 0.55} L ${artW * 0.48} ${artH * 0.92}" fill="none" stroke="${auraColor}" stroke-width="3" opacity="0.35"/>`
      : ""
  }
</svg>`),
      )
        .png()
        .toBuffer();
      artBuf = await sharp(aura)
        .composite([{ input: artBuf, top: 0, left: 0 }])
        .png()
        .toBuffer();
    }

    const shadow = await sharp(
      Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="${W / 2}" cy="${Math.min(H - 180, artTop + artH - 20)}" rx="${Math.floor(artW * 0.32)}" ry="28" fill="#000" opacity="0.35"/>
  ${
    isScenicSubject
      ? `<rect x="${artLeft}" y="${artTop}" width="${artW}" height="${artH}" rx="18" fill="none" stroke="${accent}" stroke-width="2" opacity="0.45"/>`
      : ""
  }
</svg>`),
    )
      .png()
      .toBuffer();

    layers.push({ input: shadow, top: 0, left: 0 });
    layers.push({ input: artBuf, top: artTop, left: artLeft });

    if (artOverlaySvg) {
      const overlayBuf = await sharp(Buffer.from(artOverlaySvg))
        .resize(artW, artH, { fit: "cover", position: "centre" })
        .png()
        .toBuffer();
      const overlayMasked = await sharp(overlayBuf)
        .composite([
          {
            input: await sharp(
              Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${artW}" height="${artH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${artW}" height="${artH}" rx="18" ry="18" fill="#fff"/>
</svg>`),
            )
              .png()
              .toBuffer(),
            blend: "dest-in",
          },
        ])
        .png()
        .toBuffer();
      layers.push({ input: overlayMasked, top: artTop, left: artLeft });
    }
  } else {
    const emblem = await sharp(Buffer.from(scenicEmblemSvg(card, role))).png().toBuffer();
    layers.push({ input: emblem, top: 0, left: 0 });
  }

  // Role edge glow ring (ascendant cyan, companion amber soft)
  if (role === "ascendant" || role === "companion") {
    const glowColor = role === "ascendant" ? "#66e0ff" : "#ffb84d";
    const rim = await sharp(
      Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="16" fill="none" stroke="${glowColor}" stroke-width="6" opacity="0.18"/>
</svg>`),
    )
      .png()
      .toBuffer();
    layers.push({ input: rim, top: 0, left: 0 });
  }

  // 4) HUD text baked into pixels
  const overlay = await sharp(Buffer.from(overlaySvg(card, accent))).png().toBuffer();
  layers.push({ input: overlay, top: 0, left: 0 });

  const mask = await roundedCornerMask();
  const flat = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 8, g: 12, b: 20, alpha: 1 } },
  })
    .png()
    .composite(layers)
    .png()
    .toBuffer();

  await sharp(flat)
    .composite([{ input: mask, blend: "dest-in" }])
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(outPath);
}

async function mapPool(items, concurrency, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const typePriority = (t) => {
    if (t === "creature" || t === "legendary" || t === "companion") return 0;
    if (t === "hero" || t === "token") return 1;
    if (t === "spell" || t === "equipment") return 2;
    return 3;
  };
  // Every card gets a face — with pet/item art when available, scenic emblem otherwise.
  let eligible = cards
    .slice()
    .sort(
      (a, b) =>
        typePriority(a.type) - typePriority(b.type) || a.collectorNumber - b.collectorNumber,
    );
  if (args.only) eligible = eligible.filter((c) => args.only.has(c.id));
  if (args.limit > 0) eligible = eligible.slice(0, args.limit);

  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : { version: 1, generatedAt: null, cards: {} };

  let generated = 0;
  let skipped = 0;
  let scenicOnly = 0;
  let failed = 0;
  const errors = [];

  await mapPool(eligible, CONCURRENCY, async (card) => {
    const outRel = `/assets/tcg/cards/${card.id}.webp`;
    const outPath = path.join(OUT_DIR, `${card.id}.webp`);
    if (!args.force && fs.existsSync(outPath) && card.art?.cardImagePath === outRel) {
      skipped++;
      manifest.cards[card.id] = outRel;
      return;
    }

    const source = resolveSourceArt(card.art?.assetPath, card.riftlingSlug, card);
    if (!source) scenicOnly++;

    try {
      await compositeCard(card, source, outPath);
      const nextArt = { ...(card.art || {}), cardImagePath: outRel };
      // Persist scenic asset paths for locations (replace crude building tiles).
      if (
        source?.rel &&
        source.rel.startsWith("/assets/") &&
        (card.type === "location" || card.type === "weather") &&
        (isPlaceholderBuildingArt(card.art?.assetPath) || !card.art?.assetPath)
      ) {
        nextArt.assetPath = source.rel;
      }
      card.art = nextArt;
      manifest.cards[card.id] = outRel;
      generated++;
    } catch (e) {
      failed++;
      errors.push(`${card.id}: ${e?.message || e}`);
    }
  });

  manifest.version = 3;
  manifest.layout = "full-art-scenic";
  manifest.generatedAt = new Date().toISOString();
  manifest.count = Object.keys(manifest.cards).length;
  manifest.outputDir = "public/assets/tcg/cards";
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  let patched = 0;
  for (const card of cards) {
    const p = manifest.cards[card.id];
    if (!p) continue;
    if (card.art?.cardImagePath !== p) {
      card.art = { ...(card.art || {}), cardImagePath: p };
      patched++;
    } else if (!card.art.cardImagePath) {
      card.art.cardImagePath = p;
      patched++;
    }
  }
  fs.writeFileSync(CARDS_PATH, `${JSON.stringify(cards, null, 2)}\n`, "utf8");

  const summary = {
    layout: "full-art-scenic",
    backgrounds: "procedural SVG + region/wallpaper plate, hashed per cardId, role-differentiated",
    eligible: eligible.length,
    generated,
    skippedExisting: skipped,
    scenicOnlyEmblem: scenicOnly,
    failed,
    patchedCardImagePath: patched,
    totalWithCardImage: Object.keys(manifest.cards).length,
    out: "public/assets/tcg/cards/{cardId}.webp",
    samples: [
      "/assets/tcg/cards/rotr-c-brinepaw.webp",
      "/assets/tcg/cards/rotr-c-ash-urchin.webp",
      "/assets/tcg/cards/rotr-s-forge-temper.webp",
      "/assets/tcg/cards/rotr-s-ember-spark.webp",
    ],
    manifest: "src/content/tcg/data/cardImages.json",
    errors: errors.slice(0, 12),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
