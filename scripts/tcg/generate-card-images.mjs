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
  "celestial-rift": "public/assets/maps/regions/celestial-rift.png",
  "riftwild-commons": "public/assets/maps/regions/riftwild-commons.png",
};

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

/** Prefer full pet masters over thumbs when available. */
function resolveSourceArt(assetPath, riftlingSlug) {
  const candidates = [];
  if (riftlingSlug) {
    candidates.push(
      `/assets/pets/${riftlingSlug}.png`,
      `/assets/pets/${riftlingSlug}.webp`,
      `/assets/pets/thumbs/${riftlingSlug}.webp`,
      `/assets/pets/thumbs/${riftlingSlug}.png`,
    );
  }
  if (assetPath) {
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
    const disk = publicPathToDisk(rel);
    if (disk && fs.existsSync(disk)) return { rel, disk };
  }
  return null;
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

async function compositeCard(card, sourceDisk, outPath) {
  const accent = RARITY_ACCENT[card.rarity] || RARITY_ACCENT.common;
  const role = cardRole(card);
  const rng = mulberry32(hashStr(`${card.id}|layout`));

  // 1) Region/wallpaper plate as textured base (hashed crop)
  // 2) Procedural scenic SVG on top for clear element motifs
  const plate = await buildPlateLayer(card, role);
  const scenic = await sharp(Buffer.from(scenicBackgroundSvg(card, role))).png().toBuffer();

  const layers = [];
  if (plate) {
    const plateDim = await sharp(plate)
      .modulate({ brightness: 0.72, saturation: 0.95 })
      .png()
      .toBuffer();
    layers.push({ input: plateDim, top: 0, left: 0 });
    // Scenic motifs at ~70% so plate texture still peeks through
    const scenicMix = await sharp(scenic)
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from(
            `<?xml version="1.0"?><svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#fff" fill-opacity="0.72"/></svg>`,
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

  // 3) Creature / item art — contain so scenic BG shows around silhouette
  const artScale =
    role === "companion" ? 0.92 : role === "ascendant" ? 0.88 : 0.84;
  const artH = Math.floor(H * artScale * (0.72 + rng() * 0.08));
  const artW = Math.floor(W * (0.88 + rng() * 0.08));
  const artBuf = await sharp(sourceDisk)
    .resize(artW, artH, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Vertical placement: companions sit lower/cozier; ascendants slightly higher/heroic
  const artTop =
    role === "companion"
      ? Math.floor(H * 0.14)
      : role === "ascendant"
        ? Math.floor(H * 0.08)
        : Math.floor(H * 0.1);
  const artLeft = Math.floor((W - artW) / 2);

  // Soft ground shadow under creature
  const shadow = await sharp(
    Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="${W / 2}" cy="${Math.min(H - 180, artTop + artH - 20)}" rx="${Math.floor(artW * 0.32)}" ry="28" fill="#000" opacity="0.35"/>
</svg>`),
  )
    .png()
    .toBuffer();

  layers.push({ input: shadow, top: 0, left: 0 });
  layers.push({ input: artBuf, top: artTop, left: artLeft });

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
  let eligible = cards
    .filter((c) => c.art?.assetPath || c.riftlingSlug)
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
  let missingSource = 0;
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

    const source = resolveSourceArt(card.art?.assetPath, card.riftlingSlug);
    if (!source) {
      missingSource++;
      return;
    }

    try {
      await compositeCard(card, source.disk, outPath);
      card.art = { ...card.art, cardImagePath: outRel };
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
    missingSource,
    failed,
    patchedCardImagePath: patched,
    totalWithCardImage: Object.keys(manifest.cards).length,
    out: "public/assets/tcg/cards/{cardId}.webp",
    samples: [
      "/assets/tcg/cards/rotr-c-brinepaw.webp",
      "/assets/tcg/cards/rotr-comp-brinepaw.webp",
      "/assets/tcg/cards/rotr-evo-brinepaw.webp",
      "/assets/tcg/cards/rotr-c-bramblefox.webp",
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
