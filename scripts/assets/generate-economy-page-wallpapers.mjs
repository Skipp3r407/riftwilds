/**
 * Economy / treasury / care page wallpapers.
 *
 * Strategy:
 *  1. When a strong cinematic PNG already exists, grade it for UI readability
 *     (preserve art, darken mid for glass panels, keep cyan/amber edges).
 *  2. Otherwise (or for brand-new slots like care.png), paint an original
 *     procedural SVG cavern scene via sharp — no API keys, original IP.
 *
 * Run: node scripts/assets/generate-economy-page-wallpapers.mjs
 * Force procedural only: FORCE_PROCEDURAL=1 node scripts/assets/generate-economy-page-wallpapers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const W = 1920;
const H = 1080;
const FORCE = process.env.FORCE_PROCEDURAL === "1";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dust(id, count, color, opacity = 0.35) {
  let out = "";
  let seed = hash(id);
  for (let i = 0; i < count; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const x = seed % W;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const y = seed % H;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const r = 1 + (seed % 3);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity * (0.35 + (seed % 50) / 100)}"/>`;
  }
  return out;
}

function pillars(id, x0, gap, count, top, bottom, fill, stroke) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = x0 + i * gap;
    const wobble = ((hash(`${id}-${i}`) % 21) - 10) * 0.6;
    out += `
      <rect x="${x + wobble}" y="${top}" width="54" height="${bottom - top}" fill="${fill}" opacity="0.72"/>
      <rect x="${x + 8 + wobble}" y="${top}" width="10" height="${bottom - top}" fill="${stroke}" opacity="0.18"/>
      <rect x="${x - 6 + wobble}" y="${top - 18}" width="66" height="22" rx="3" fill="${fill}" opacity="0.85"/>
      <rect x="${x - 6 + wobble}" y="${bottom - 28}" width="66" height="28" rx="2" fill="${fill}" opacity="0.9"/>
    `;
  }
  return out;
}

function arches(y, color) {
  return `
    <path d="M120 ${y} Q300 ${y - 120} 480 ${y}" fill="none" stroke="${color}" stroke-width="10" opacity="0.22"/>
    <path d="M720 ${y + 20} Q960 ${y - 140} 1200 ${y + 20}" fill="none" stroke="${color}" stroke-width="12" opacity="0.2"/>
    <path d="M1400 ${y} Q1620 ${y - 110} 1800 ${y}" fill="none" stroke="${color}" stroke-width="10" opacity="0.22"/>
  `;
}

function hangingLanterns(id, amber) {
  let out = "";
  const xs = [260, 520, 1400, 1660, 980];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i] + ((hash(`${id}-lan-${i}`) % 40) - 20);
    const drop = 110 + (hash(`${id}-drop-${i}`) % 80);
    out += `
      <line x1="${x}" y1="0" x2="${x}" y2="${drop}" stroke="#1a2233" stroke-width="3" opacity="0.75"/>
      <ellipse cx="${x}" cy="${drop + 28}" rx="18" ry="26" fill="#1a1410" stroke="${amber}" stroke-width="2" opacity="0.9"/>
      <ellipse cx="${x}" cy="${drop + 28}" rx="10" ry="14" fill="${amber}" opacity="0.55"/>
      <circle cx="${x}" cy="${drop + 28}" r="36" fill="${amber}" opacity="0.12"/>
    `;
  }
  return out;
}

function uiReadableScrim() {
  return `
    <radialGradient id="ui-hole" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="#070b16" stop-opacity="0.18"/>
      <stop offset="55%" stop-color="#070b16" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0.38"/>
    </radialGradient>
    <linearGradient id="ui-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#070b16" stop-opacity="0.04"/>
      <stop offset="70%" stop-color="#070b16" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0.48"/>
    </linearGradient>
    <rect width="100%" height="100%" fill="url(#ui-hole)"/>
    <rect width="100%" height="100%" fill="url(#ui-bottom)"/>
  `;
}

function sceneTreasuryVault() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="cave" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1224"/>
      <stop offset="45%" stop-color="#0c182c"/>
      <stop offset="100%" stop-color="#060910"/>
    </linearGradient>
    <radialGradient id="beam" cx="58%" cy="35%" r="38%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="${cyan}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${cyan}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beam-core" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0"/>
      <stop offset="15%" stop-color="${cyan}" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#9ef6ff" stop-opacity="0.75"/>
      <stop offset="85%" stop-color="${cyan}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${cyan}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="amber-glow" cx="22%" cy="70%" r="28%">
      <stop offset="0%" stop-color="${amber}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${amber}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="amber-glow-2" cx="82%" cy="68%" r="26%">
      <stop offset="0%" stop-color="${amber}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${amber}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#121a2a" stop-opacity="0"/>
      <stop offset="40%" stop-color="#0e1624" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#070b12"/>
    </linearGradient>
    <filter id="blur8" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <filter id="blur3" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#cave)"/>
  <path d="M0 0 L420 0 L280 1080 L0 1080 Z" fill="#0a101c" opacity="0.85"/>
  <path d="M1920 0 L1480 0 L1620 1080 L1920 1080 Z" fill="#0a101c" opacity="0.85"/>
  <path d="M0 0 Q960 80 1920 0 L1920 220 Q960 140 0 220 Z" fill="#0d1524" opacity="0.7"/>
  ${arches(420, cyan)}
  ${pillars("vault", 160, 220, 3, 180, 820, "#151d2e", cyan)}
  ${pillars("vault-r", 1180, 220, 3, 190, 840, "#151d2e", amber)}
  <path d="M420 520 L900 480 L940 500 L460 540 Z" fill="#1a2438" opacity="0.55"/>
  <path d="M1000 500 L1500 540 L1480 560 L980 520 Z" fill="#1a2438" opacity="0.5"/>
  <ellipse cx="1120" cy="380" rx="220" ry="320" fill="url(#beam)" filter="url(#blur8)"/>
  <rect x="1095" y="120" width="50" height="720" fill="url(#beam-core)" filter="url(#blur3)"/>
  <rect x="1108" y="100" width="14" height="760" fill="#e8ffff" opacity="0.55"/>
  <ellipse cx="1120" cy="820" rx="160" ry="36" fill="${cyan}" opacity="0.25" filter="url(#blur8)"/>
  <ellipse cx="1120" cy="830" rx="240" ry="48" fill="#121a28" opacity="0.8"/>
  <ellipse cx="1120" cy="830" rx="180" ry="28" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.35"/>
  <rect width="100%" height="100%" fill="url(#amber-glow)"/>
  <rect width="100%" height="100%" fill="url(#amber-glow-2)"/>
  <rect x="280" y="760" width="70" height="90" rx="6" fill="#1a1620"/>
  <ellipse cx="315" cy="750" rx="28" ry="18" fill="${amber}" opacity="0.7"/>
  <circle cx="315" cy="750" r="50" fill="${amber}" opacity="0.15" filter="url(#blur8)"/>
  <rect x="1580" y="770" width="70" height="90" rx="6" fill="#1a1620"/>
  <ellipse cx="1615" cy="760" rx="28" ry="18" fill="${amber}" opacity="0.65"/>
  <circle cx="1615" cy="760" r="50" fill="${amber}" opacity="0.14" filter="url(#blur8)"/>
  <path d="M80 200 L140 340 L90 520 L160 700" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.25"/>
  <path d="M1800 180 L1740 360 L1820 540 L1700 760" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.22"/>
  <rect y="700" width="100%" height="380" fill="url(#floor)"/>
  ${dust("vault", 70, cyan, 0.4)}
  ${dust("vault-a", 40, amber, 0.3)}
  ${uiReadableScrim()}
</svg>`;
}

function sceneCareCavern() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  const teal = "#1a8a8a";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="grotto" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#12242c"/>
      <stop offset="55%" stop-color="#0c161c"/>
      <stop offset="100%" stop-color="#060a10"/>
    </radialGradient>
    <radialGradient id="nest-glow" cx="50%" cy="62%" r="35%">
      <stop offset="0%" stop-color="${amber}" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="${teal}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ceiling-rift" cx="48%" cy="18%" r="40%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.4"/>
      <stop offset="50%" stop-color="${cyan}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${cyan}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#grotto)"/>
  <rect width="100%" height="100%" fill="url(#ceiling-rift)" filter="url(#soft)"/>
  <ellipse cx="240" cy="520" rx="160" ry="260" fill="#0e1a20" opacity="0.85"/>
  <ellipse cx="240" cy="560" rx="70" ry="110" fill="${amber}" opacity="0.12"/>
  <ellipse cx="1680" cy="500" rx="170" ry="270" fill="#0e1a20" opacity="0.85"/>
  <ellipse cx="1680" cy="540" rx="72" ry="115" fill="${amber}" opacity="0.11"/>
  <ellipse cx="480" cy="480" rx="110" ry="200" fill="#101c24" opacity="0.75"/>
  <ellipse cx="1440" cy="470" rx="110" ry="200" fill="#101c24" opacity="0.75"/>
  <path d="M200 40 Q480 180 700 60 T1200 90 T1700 40" fill="none" stroke="${cyan}" stroke-width="3" opacity="0.35"/>
  <path d="M300 80 Q600 200 900 100 T1600 70" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.22"/>
  <path d="M400 20 L460 160 L420 280" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.2"/>
  <path d="M1500 30 L1460 180 L1520 300" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.2"/>
  ${hangingLanterns("care", amber)}
  <ellipse cx="960" cy="780" rx="520" ry="140" fill="#0a1218" opacity="0.9"/>
  <ellipse cx="960" cy="760" rx="380" ry="90" fill="url(#nest-glow)"/>
  <ellipse cx="960" cy="750" rx="220" ry="48" fill="none" stroke="${amber}" stroke-width="2" opacity="0.25"/>
  <ellipse cx="960" cy="750" rx="120" ry="28" fill="${amber}" opacity="0.12"/>
  <path d="M80 900 L140 720 L160 900 Z" fill="#121820" opacity="0.8"/>
  <path d="M1760 920 L1820 700 L1880 920 Z" fill="#121820" opacity="0.8"/>
  <path d="M200 980 L260 820 L290 980 Z" fill="#151c24" opacity="0.7"/>
  <path d="M1640 990 L1700 830 L1740 990 Z" fill="#151c24" opacity="0.7"/>
  <ellipse cx="960" cy="640" rx="600" ry="80" fill="#3de7ff" opacity="0.04" filter="url(#soft)"/>
  ${dust("care", 60, cyan, 0.35)}
  ${dust("care-a", 35, amber, 0.28)}
  ${uiReadableScrim()}
</svg>`;
}

function sceneTokenNexus() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="nx" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#081018"/>
      <stop offset="50%" stop-color="#0c1a2c"/>
      <stop offset="100%" stop-color="#070b14"/>
    </linearGradient>
    <radialGradient id="seal" cx="50%" cy="48%" r="32%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="${amber}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#nx)"/>
  ${pillars("tok", 200, 280, 6, 160, 860, "#142033", cyan)}
  <circle cx="960" cy="500" r="220" fill="url(#seal)" filter="url(#b)"/>
  <circle cx="960" cy="500" r="140" fill="none" stroke="${cyan}" stroke-width="3" opacity="0.35"/>
  <circle cx="960" cy="500" r="90" fill="none" stroke="${amber}" stroke-width="2" opacity="0.4"/>
  <polygon points="960,390 1010,500 960,610 910,500" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.3"/>
  <rect y="820" width="100%" height="260" fill="#060a12" opacity="0.75"/>
  ${dust("tok", 50, cyan, 0.35)}
  ${uiReadableScrim()}
</svg>`;
}

function sceneTransparencyHall() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="hall" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b1422"/>
      <stop offset="100%" stop-color="#060910"/>
    </linearGradient>
    <linearGradient id="aisle" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${cyan}" stop-opacity="0"/>
    </linearGradient>
    <filter id="b2"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#hall)"/>
  ${pillars("tr", 140, 180, 5, 120, 900, "#152030", cyan)}
  ${pillars("tr2", 1100, 180, 5, 120, 900, "#152030", amber)}
  <rect x="880" y="100" width="160" height="780" fill="url(#aisle)" filter="url(#b2)"/>
  <ellipse cx="960" cy="900" rx="400" ry="60" fill="${cyan}" opacity="0.08" filter="url(#b2)"/>
  <rect x="180" y="280" width="120" height="8" fill="${amber}" opacity="0.25"/>
  <rect x="180" y="340" width="120" height="8" fill="${amber}" opacity="0.2"/>
  <rect x="180" y="400" width="120" height="8" fill="${cyan}" opacity="0.2"/>
  <rect x="1620" y="280" width="120" height="8" fill="${amber}" opacity="0.25"/>
  <rect x="1620" y="340" width="120" height="8" fill="${cyan}" opacity="0.2"/>
  ${dust("tr", 45, cyan, 0.3)}
  ${uiReadableScrim()}
</svg>`;
}

function sceneRewardsPool() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="pool-bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#102030"/>
      <stop offset="100%" stop-color="#060a12"/>
    </radialGradient>
    <radialGradient id="pool" cx="50%" cy="68%" r="30%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.55"/>
      <stop offset="40%" stop-color="${amber}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <filter id="bp"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#pool-bg)"/>
  ${arches(380, cyan)}
  ${pillars("rw", 220, 300, 5, 160, 780, "#142030", cyan)}
  <ellipse cx="960" cy="720" rx="420" ry="140" fill="url(#pool)" filter="url(#bp)"/>
  <ellipse cx="960" cy="720" rx="300" ry="80" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.35"/>
  <ellipse cx="960" cy="720" rx="180" ry="44" fill="${cyan}" opacity="0.15"/>
  <circle cx="820" cy="700" r="6" fill="${amber}" opacity="0.5"/>
  <circle cx="1100" cy="710" r="5" fill="${amber}" opacity="0.45"/>
  <circle cx="960" cy="690" r="7" fill="${cyan}" opacity="0.4"/>
  ${hangingLanterns("rw", amber)}
  ${dust("rw", 55, cyan, 0.35)}
  ${uiReadableScrim()}
</svg>`;
}

function sceneFairnessCourt() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="court" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0c1524"/>
      <stop offset="100%" stop-color="#060910"/>
    </linearGradient>
    <radialGradient id="scales" cx="50%" cy="42%" r="35%">
      <stop offset="0%" stop-color="${amber}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <filter id="bc"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#court)"/>
  ${pillars("fair", 280, 340, 5, 140, 860, "#162234", amber)}
  <ellipse cx="960" cy="420" rx="280" ry="200" fill="url(#scales)" filter="url(#bc)"/>
  <path d="M760 420 L960 300 L1160 420" fill="none" stroke="${amber}" stroke-width="4" opacity="0.45"/>
  <circle cx="800" cy="460" r="40" fill="none" stroke="${cyan}" stroke-width="3" opacity="0.4"/>
  <circle cx="1120" cy="460" r="40" fill="none" stroke="${cyan}" stroke-width="3" opacity="0.4"/>
  <line x1="960" y1="300" x2="960" y2="620" stroke="${amber}" stroke-width="3" opacity="0.35"/>
  <ellipse cx="960" cy="880" rx="500" ry="70" fill="#070b12" opacity="0.8"/>
  ${dust("fair", 40, amber, 0.3)}
  ${uiReadableScrim()}
</svg>`;
}

/** Soft UI grade overlay composited onto cinematic photo art. */
function gradeOverlaySvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="mid" cx="50%" cy="42%" r="58%">
      <stop offset="0%" stop-color="#070b16" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#070b16" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0.2"/>
    </radialGradient>
    <linearGradient id="bot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#070b16" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0.42"/>
    </linearGradient>
    <radialGradient id="cyanEdge" cx="70%" cy="35%" r="45%">
      <stop offset="0%" stop-color="#3de7ff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#3de7ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="amberEdge" cx="20%" cy="75%" r="35%">
      <stop offset="0%" stop-color="#ffb84d" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#ffb84d" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#mid)"/>
  <rect width="100%" height="100%" fill="url(#bot)"/>
  <rect width="100%" height="100%" fill="url(#cyanEdge)"/>
  <rect width="100%" height="100%" fill="url(#amberEdge)"/>
</svg>`);
}

async function writeFromProcedural(dest, svgFn) {
  await sharp(Buffer.from(svgFn()))
    .resize(W, H, { fit: "fill" })
    .png({ compressionLevel: 8 })
    .toFile(dest);
}

async function writeGradedFromSource(dest, sourceRel) {
  const source = path.join(ROOT, sourceRel);
  if (!fs.existsSync(source)) return false;
  const base = await sharp(source)
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 1.08 })
    .png()
    .toBuffer();
  const overlay = await sharp(gradeOverlaySvg()).png().toBuffer();
  await sharp(base)
    .composite([{ input: overlay, blend: "over" }])
    .png({ compressionLevel: 8 })
    .toFile(dest);
  return true;
}

/**
 * Jobs:
 * - dest: output path relative to ROOT
 * - scene: procedural SVG builder (fallback / FORCE_PROCEDURAL)
 * - gradeFrom: optional existing cinematic PNG to grade instead of painting
 * - alwaysProcedural: skip grading even when source exists (new distinct art)
 */
const JOBS = [
  // Keep existing cinematic route wallpapers unless FORCE_PROCEDURAL=1
  {
    dest: "public/assets/ui/wallpapers/economy.png",
    scene: sceneTreasuryVault,
    label: "economy vault wallpaper",
    keepIfExists: true,
  },
  {
    dest: "public/assets/economy/purchase-flow-banner.png",
    scene: sceneTreasuryVault,
    gradeFrom: "public/assets/ui/wallpapers/economy.png",
    label: "economy purchase banner",
  },
  {
    dest: "public/assets/treasury/hero.png",
    scene: sceneTreasuryVault,
    label: "treasury hero",
    keepIfExists: true,
  },
  {
    dest: "public/assets/ui/wallpapers/rewards.png",
    scene: sceneRewardsPool,
    label: "rewards pool wallpaper",
    keepIfExists: true,
  },
  {
    dest: "public/assets/ui/wallpapers/token.png",
    scene: sceneTokenNexus,
    label: "token nexus wallpaper",
    keepIfExists: true,
  },
  {
    dest: "public/assets/ui/wallpapers/transparency.png",
    scene: sceneTransparencyHall,
    label: "transparency hall wallpaper",
    keepIfExists: true,
  },
  {
    dest: "public/assets/ui/wallpapers/fairness.png",
    scene: sceneFairnessCourt,
    label: "fairness court wallpaper",
    keepIfExists: true,
  },
  // New dedicated care wallpaper + section accents for /economy
  {
    dest: "public/assets/ui/wallpapers/care.png",
    scene: sceneCareCavern,
    gradeFrom: "public/assets/ui/wallpapers/hatchery.png",
    label: "care cavern wallpaper",
  },
  {
    dest: "public/assets/economy/section-treasury-bg.png",
    scene: sceneTreasuryVault,
    gradeFrom: "public/assets/treasury/hero.png",
    label: "economy section treasury bg",
  },
  {
    dest: "public/assets/economy/section-care-bg.png",
    scene: sceneCareCavern,
    gradeFrom: "public/assets/ui/wallpapers/hatchery.png",
    label: "economy section care bg",
  },
];

async function runJob(job) {
  const dest = path.join(ROOT, job.dest);
  ensureDir(path.dirname(dest));
  const tmpDest = `${dest}.tmp.png`;

  if (!FORCE && job.keepIfExists && fs.existsSync(dest) && fs.statSync(dest).size > 50_000) {
    console.log(`  · ${job.label} [kept existing]`);
    return;
  }

  if (!FORCE && job.gradeFrom) {
    const sourceAbs = path.join(ROOT, job.gradeFrom);
    // Never grade a file onto itself (compound darkening)
    if (fs.existsSync(sourceAbs) && path.resolve(sourceAbs) !== path.resolve(dest)) {
      const ok = await writeGradedFromSource(tmpDest, job.gradeFrom);
      if (ok) {
        fs.renameSync(tmpDest, dest);
        const stat = fs.statSync(dest);
        console.log(
          `  ✓ ${job.label} [graded←${job.gradeFrom}] (${Math.round(stat.size / 1024)} KB)`,
        );
        return;
      }
    }
  }

  await writeFromProcedural(tmpDest, job.scene);
  fs.renameSync(tmpDest, dest);
  const stat = fs.statSync(dest);
  console.log(`  ✓ ${job.label} [procedural] (${Math.round(stat.size / 1024)} KB)`);
}

async function main() {
  console.log(
    FORCE
      ? "Generating economy page wallpapers (FORCE procedural)…"
      : "Generating economy page wallpapers (grade cinematic sources when present)…",
  );
  for (const job of JOBS) {
    await runJob(job);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
