/**
 * Generate Riftwilds 300 DPI print-ready fan printables.
 *
 * Output: public/assets/printables/
 * Run:   npm run assets:printables
 *        node scripts/assets/generate-printables.mjs
 *
 * Art tone: warm fantasy + cyan/amber rift energy — epic companion fauna,
 * living towns under threat, Keepers & Riftlings. Kid-OK adventure, not chibi stickers.
 *
 * Sizes (300 DPI):
 *   Letter 8.5×11" → 2550×3300 px
 *   A4 210×297mm   → 2480×3508 px
 *   5×7" card      → 1500×2100 px
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "public/assets/printables");
const DPI = 300;

const LETTER = { w: 2550, h: 3300, pageW: 612, pageH: 792, label: 'US Letter 8.5×11"' };
const A4 = { w: 2480, h: 3508, pageW: 595.28, pageH: 841.89, label: "A4" };
const CARD_5X7 = { w: 1500, h: 2100, pageW: 360, pageH: 504, label: '5×7"' };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/* ─── Shared defs ─────────────────────────────────────────────────── */

function sharedDefs(prefix = "") {
  const p = prefix ? `${prefix}-` : "";
  return `
  <linearGradient id="${p}parchment" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#f4e8d0"/><stop offset="0.55" stop-color="#e8d5b0"/><stop offset="1" stop-color="#d4bc8e"/>
  </linearGradient>
  <linearGradient id="${p}ink" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#1a1510"/><stop offset="0.5" stop-color="#141820"/><stop offset="1" stop-color="#0e1218"/>
  </linearGradient>
  <linearGradient id="${p}bronze" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#e8c878"/><stop offset="0.4" stop-color="#c4a882"/><stop offset="1" stop-color="#8b6914"/>
  </linearGradient>
  <linearGradient id="${p}rift" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#a8f4ff"/><stop offset="0.35" stop-color="#3de7ff"/><stop offset="0.7" stop-color="#1a8fb8"/><stop offset="1" stop-color="#0a4a68"/>
  </linearGradient>
  <linearGradient id="${p}warmSky" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#0a1018"/><stop offset="0.35" stop-color="#1a2438"/><stop offset="0.65" stop-color="#3a3028"/><stop offset="1" stop-color="#5a4030"/>
  </linearGradient>
  <linearGradient id="${p}earth" x1="0" y1="0" x2="0" y2="1">
    <stop stop-color="#3d6a42"/><stop offset="0.45" stop-color="#2f5a3a"/><stop offset="1" stop-color="#1a3020"/>
  </linearGradient>
  <radialGradient id="${p}amberGlow" cx="50%" cy="40%" r="50%">
    <stop stop-color="#ffe566" stop-opacity="0.55"/><stop offset="0.55" stop-color="#ffb84d" stop-opacity="0.2"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${p}cyanGlow" cx="50%" cy="35%" r="55%">
    <stop stop-color="#3de7ff" stop-opacity="0.45"/><stop offset="0.6" stop-color="#3de7ff" stop-opacity="0.12"/><stop offset="1" stop-color="#3de7ff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${p}emberBloom" cx="70%" cy="30%" r="45%">
    <stop stop-color="#ff7a3d" stop-opacity="0.35"/><stop offset="0.5" stop-color="#ffb84d" stop-opacity="0.12"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/>
  </radialGradient>
  <filter id="${p}soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>
  <filter id="${p}glow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

/* ─── Creatures (viewBox 0 0 200 200) — full-body, game-true silhouettes ─── */

const CHAR = {
  /** Glowpup: athletic amber guardian — flame mane + cyan crystal, stakes not stickers */
  spark: `
    <ellipse cx="100" cy="186" rx="42" ry="8" fill="#2a2118" opacity="0.35"/>
    <!-- athletic torso — longer, less balloon -->
    <ellipse cx="100" cy="138" rx="34" ry="36" fill="#d4922a"/>
    <ellipse cx="100" cy="128" rx="26" ry="28" fill="#e8a838"/>
    <ellipse cx="92" cy="116" rx="8" ry="7" fill="#fff0a8" opacity="0.4"/>
    <!-- braced hind legs -->
    <path d="M72 152 Q58 172 64 184 Q78 180 82 162 Z" fill="#b87820"/>
    <path d="M128 152 Q142 172 136 184 Q122 180 118 162 Z" fill="#b87820"/>
    <ellipse cx="64" cy="184" rx="11" ry="5" fill="#8b5a18"/>
    <ellipse cx="136" cy="184" rx="11" ry="5" fill="#8b5a18"/>
    <!-- forward-planted forelegs -->
    <path d="M58 130 Q40 148 46 168 Q62 164 70 142 Z" fill="#ffb84d"/>
    <path d="M142 130 Q160 148 154 168 Q138 164 130 142 Z" fill="#ffb84d"/>
    <ellipse cx="46" cy="168" rx="9" ry="4" fill="#d4922a"/>
    <ellipse cx="154" cy="168" rx="9" ry="4" fill="#d4922a"/>
    <!-- compact head (game-true proportions) -->
    <ellipse cx="100" cy="68" rx="28" ry="26" fill="#ffe566"/>
    <ellipse cx="100" cy="64" rx="20" ry="16" fill="#fff2a0"/>
    <!-- tall pointed ears -->
    <path d="M76 54 L62 8 L88 46 Z" fill="#ff7a3d"/>
    <path d="M76 48 L66 20 L84 44 Z" fill="#ffc84a"/>
    <path d="M124 54 L138 8 L112 46 Z" fill="#ff7a3d"/>
    <path d="M124 48 L134 20 L116 44 Z" fill="#ffc84a"/>
    <!-- fierce flame mane -->
    <path d="M80 38c-14-24-2-42 18-48 2 14 8 24 14 32-12-4-22 2-32 16Z" fill="#ff3a10"/>
    <path d="M120 38c14-24 2-42-18-48-2 14-8 24-14 32 12-4 22 2 32 16Z" fill="#ff3a10"/>
    <path d="M100 4c6 10 8 20 2 32 12-6 16-18 12-34-4 4-8 4-14 2Z" fill="#ffb84d"/>
    <path d="M100 0c4 8 5 14 1 22 8-4 10-12 8-22-2 2-5 2-9 0Z" fill="#ffe566"/>
    <!-- determined narrowed eyes -->
    <path d="M82 64 L94 62" stroke="#1a1510" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M118 64 L106 62" stroke="#1a1510" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="88" cy="70" rx="3.5" ry="4.5" fill="#1a1510"/>
    <ellipse cx="112" cy="70" rx="3.5" ry="4.5" fill="#1a1510"/>
    <circle cx="89" cy="68.5" r="1.1" fill="#3de7ff" opacity="0.95"/>
    <circle cx="113" cy="68.5" r="1.1" fill="#3de7ff" opacity="0.95"/>
    <ellipse cx="100" cy="80" rx="3.5" ry="2.5" fill="#c44820"/>
    <path d="M90 88c4 2 12 2 16 0" stroke="#1a1510" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- cyan rift crystal brow — bright focus -->
    <path d="M100 30 L112 50 L100 60 L88 50 Z" fill="#3de7ff"/>
    <path d="M100 34 L108 48 L100 56 L92 48 Z" fill="#a8f4ff" opacity="0.9"/>
    <circle cx="100" cy="44" r="3" fill="#fff" opacity="0.55"/>
    <!-- sweeping flame tail -->
    <path d="M138 118c28-8 42 14 30 38-16-10-24-4-30 12 6-18 2-32 0-50Z" fill="#ff5a20"/>
    <path d="M146 126c16-2 24 10 18 22-10-6-14-2-18 6 4-10 2-18 0-28Z" fill="#ffe566"/>
    <circle cx="40" cy="42" r="2.5" fill="#3de7ff" opacity="0.95"/>
    <circle cx="168" cy="58" r="2" fill="#ffb84d" opacity="0.9"/>
    <circle cx="52" cy="96" r="1.5" fill="#a8f4ff" opacity="0.7"/>
  `,

  /** Ember cub: compact fire-beast with ember crystals */
  cindercub: `
    <ellipse cx="100" cy="178" rx="50" ry="10" fill="#2a2118" opacity="0.28"/>
    <ellipse cx="100" cy="132" rx="52" ry="40" fill="#e85a28"/>
    <ellipse cx="100" cy="124" rx="38" ry="30" fill="#ff8a4a"/>
    <ellipse cx="86" cy="112" rx="12" ry="9" fill="#ffc090" opacity="0.5"/>
    <ellipse cx="68" cy="164" rx="13" ry="15" fill="#c44820"/>
    <ellipse cx="132" cy="164" rx="13" ry="15" fill="#c44820"/>
    <ellipse cx="66" cy="176" rx="11" ry="6" fill="#a03818"/>
    <ellipse cx="134" cy="176" rx="11" ry="6" fill="#a03818"/>
    <ellipse cx="54" cy="138" rx="11" ry="15" fill="#ff7a3d" transform="rotate(-20 54 138)"/>
    <ellipse cx="146" cy="138" rx="11" ry="15" fill="#ff7a3d" transform="rotate(20 146 138)"/>
    <ellipse cx="100" cy="82" rx="42" ry="38" fill="#ff7a3d"/>
    <ellipse cx="100" cy="76" rx="30" ry="26" fill="#ffb084"/>
    <path d="M66 62 L52 28 L78 56 Z" fill="#ffb84d"/>
    <path d="M134 62 L148 28 L122 56 Z" fill="#ffb84d"/>
    <path d="M66 56 L56 36 L74 54 Z" fill="#ffe566"/>
    <path d="M134 56 L144 36 L126 54 Z" fill="#ffe566"/>
    <ellipse cx="86" cy="80" rx="6.5" ry="7.5" fill="#2a2118"/>
    <ellipse cx="114" cy="80" rx="6.5" ry="7.5" fill="#2a2118"/>
    <circle cx="88" cy="78" r="2" fill="#fff" opacity="0.85"/>
    <circle cx="116" cy="78" r="2" fill="#fff" opacity="0.85"/>
    <ellipse cx="100" cy="94" rx="8" ry="5" fill="#ff5c7a" opacity="0.7"/>
    <path d="M90 106c6 7 14 7 20 0" stroke="#2a2118" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M100 48 L108 64 L100 72 L92 64 Z" fill="#ffe566"/>
    <path d="M78 48c-6-16 4-26 16-28 0 10 4 18 10 22-10 0-18 2-26 6Z" fill="#ffb84d" opacity="0.85"/>
    <path d="M150 120c14 2 20 14 12 26-8-6-12-4-16 2 2-10 2-18 4-28Z" fill="#ff9a5c"/>
    <circle cx="44" cy="90" r="3" fill="#ffb84d" opacity="0.7"/>
  `,

  /** Grove sprout: moss beast with vine limbs + leaf crest */
  mossprig: `
    <ellipse cx="100" cy="178" rx="48" ry="10" fill="#2a2118" opacity="0.26"/>
    <ellipse cx="100" cy="134" rx="46" ry="38" fill="#3d8a48"/>
    <ellipse cx="100" cy="126" rx="34" ry="28" fill="#5aad62"/>
    <ellipse cx="88" cy="114" rx="12" ry="9" fill="#8fd49a" opacity="0.55"/>
    <ellipse cx="70" cy="164" rx="12" ry="14" fill="#2f6a38"/>
    <ellipse cx="130" cy="164" rx="12" ry="14" fill="#2f6a38"/>
    <ellipse cx="68" cy="176" rx="10" ry="6" fill="#245030"/>
    <ellipse cx="132" cy="176" rx="10" ry="6" fill="#245030"/>
    <path d="M48 120 Q30 100 42 78 Q58 90 56 112 Z" fill="#4a9a58"/>
    <path d="M152 120 Q170 100 158 78 Q142 90 144 112 Z" fill="#4a9a58"/>
    <ellipse cx="100" cy="86" rx="38" ry="34" fill="#5aad62"/>
    <ellipse cx="100" cy="80" rx="26" ry="22" fill="#8fd49a"/>
    <ellipse cx="86" cy="82" rx="5.5" ry="6.5" fill="#2a2118"/>
    <ellipse cx="114" cy="82" rx="5.5" ry="6.5" fill="#2a2118"/>
    <circle cx="87.5" cy="80" r="1.8" fill="#fff" opacity="0.85"/>
    <circle cx="115.5" cy="80" r="1.8" fill="#fff" opacity="0.85"/>
    <path d="M90 98c6 7 14 7 20 0" stroke="#2a2118" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- leaf crest -->
    <path d="M100 28c16 22 8 40-4 56 24-6 38-24 32-52-8 6-16 6-28-4Z" fill="#3dffb0"/>
    <path d="M100 36c10 14 6 28-2 40 16-4 26-16 22-36-6 4-12 4-20-4Z" fill="#7dffc0" opacity="0.75"/>
    <path d="M72 48c-10 18 0 32 12 40-16 4-30-6-30-26 6 2 10 0 18-14Z" fill="#4a9a58"/>
    <path d="M128 48c10 18 0 32-12 40 16 4 30-6 30-26-6 2-10 0-18-14Z" fill="#4a9a58"/>
    <path d="M100 54 L106 68 L100 74 L94 68 Z" fill="#3de7ff" opacity="0.85"/>
    <ellipse cx="42" cy="150" rx="8" ry="10" fill="#3d8a48"/>
    <ellipse cx="158" cy="150" rx="8" ry="10" fill="#3d8a48"/>
  `,

  /** Tide bubble: translucent water Riftling with pearls */
  bubbloon: `
    <ellipse cx="100" cy="180" rx="46" ry="9" fill="#2a2118" opacity="0.22"/>
    <circle cx="100" cy="110" r="58" fill="#2a6eb8" opacity="0.55"/>
    <circle cx="100" cy="110" r="52" fill="#3d9bff" opacity="0.75"/>
    <circle cx="100" cy="110" r="42" fill="#7ec8ff" opacity="0.85"/>
    <ellipse cx="82" cy="92" rx="16" ry="12" fill="#fff" opacity="0.4"/>
    <ellipse cx="88" cy="118" rx="6" ry="7" fill="#1a3048"/>
    <ellipse cx="116" cy="118" rx="6" ry="7" fill="#1a3048"/>
    <circle cx="90" cy="116" r="1.8" fill="#fff" opacity="0.9"/>
    <circle cx="118" cy="116" r="1.8" fill="#fff" opacity="0.9"/>
    <path d="M90 136c6 9 14 9 20 0" stroke="#1a3048" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <circle cx="52" cy="78" r="14" fill="#a8e7ff" opacity="0.7"/>
    <circle cx="154" cy="88" r="12" fill="#a8e7ff" opacity="0.6"/>
    <circle cx="148" cy="150" r="10" fill="#3de7ff" opacity="0.5"/>
    <circle cx="56" cy="148" r="9" fill="#3de7ff" opacity="0.45"/>
    <circle cx="100" cy="58" r="6" fill="#e8d5b0" opacity="0.9"/>
    <circle cx="100" cy="58" r="3.5" fill="#3de7ff"/>
    <path d="M70 160 Q100 178 130 160" fill="none" stroke="#7ec8ff" stroke-width="3" opacity="0.5"/>
  `,
};

function wrapChar(key, x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">${CHAR[key]}</g>`;
}

/* ─── Scene pieces ────────────────────────────────────────────────── */

function riftTear(cx, cy, h = 280, w = 36) {
  return `
  <ellipse cx="${cx}" cy="${cy}" rx="${w * 3}" ry="${h * 0.6}" fill="#3de7ff" opacity="0.14" filter="url(#soft)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${w * 1.6}" ry="${h * 0.48}" fill="#1a8fb8" opacity="0.2" filter="url(#soft)"/>
  <path d="M${cx} ${cy - h / 2} Q${cx - w} ${cy} ${cx} ${cy + h / 2} Q${cx + w} ${cy} ${cx} ${cy - h / 2} Z" fill="url(#rift)" opacity="0.92"/>
  <path d="M${cx} ${cy - h / 2 + 16} Q${cx - w * 0.4} ${cy} ${cx} ${cy + h / 2 - 16} Q${cx + w * 0.4} ${cy} ${cx} ${cy - h / 2 + 16} Z" fill="#a8f4ff" opacity="0.65"/>
  <!-- lightning forks -->
  <path d="M${cx - w * 0.8} ${cy - h * 0.15} L${cx - w * 1.6} ${cy} L${cx - w * 0.9} ${cy + 8} L${cx - w * 1.8} ${cy + h * 0.2}" stroke="#a8f4ff" stroke-width="2.5" fill="none" opacity="0.75"/>
  <path d="M${cx + w * 0.7} ${cy - h * 0.1} L${cx + w * 1.8} ${cy + 20} L${cx + w * 1.1} ${cy + 28}" stroke="#ffe566" stroke-width="2" fill="none" opacity="0.55"/>
  <circle cx="${cx - 48}" cy="${cy - 50}" r="5" fill="#3de7ff" opacity="0.9"/>
  <circle cx="${cx + 56}" cy="${cy + 10}" r="3.5" fill="#ffe566" opacity="0.8"/>
  <circle cx="${cx - 24}" cy="${cy + 70}" r="2.5" fill="#fff" opacity="0.7"/>
  <circle cx="${cx + 30}" cy="${cy - 80}" r="2" fill="#a8f4ff" opacity="0.85"/>
  <circle cx="${cx - 10}" cy="${cy + 20}" r="1.5" fill="#ffb84d" opacity="0.7"/>`;
}

function stormDebris(cx, cy) {
  return `
  <g opacity="0.75">
    <rect x="${cx - 40}" y="${cy}" width="18" height="10" rx="1" fill="#8b5a3c" transform="rotate(-18 ${cx - 30} ${cy + 5})"/>
    <rect x="${cx + 20}" y="${cy - 30}" width="14" height="8" rx="1" fill="#c4a882" transform="rotate(22 ${cx + 27} ${cy - 26})"/>
    <path d="M${cx} ${cy - 50} L${cx + 12} ${cy - 38} L${cx - 2} ${cy - 34} Z" fill="#5c3d2e"/>
    <circle cx="${cx + 50}" cy="${cy - 10}" r="4" fill="#3de7ff" opacity="0.6"/>
    <circle cx="${cx - 55}" cy="${cy - 25}" r="3" fill="#ffb84d" opacity="0.55"/>
  </g>`;
}

function timberHall(x, y, scale = 1, damaged = false) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="0" y="40" width="110" height="70" fill="#6a4530"/>
    <path d="M-10 40 L55 -20 L120 40 Z" fill="${damaged ? "#4a3020" : "#8b5a3c"}"/>
    <path d="M-10 40 L55 -20 L120 40 Z" fill="none" stroke="#c4a882" stroke-width="2" opacity="0.5"/>
    <rect x="38" y="62" width="28" height="48" fill="#1a1510" opacity="0.65"/>
    <rect x="12" y="55" width="18" height="16" fill="#3de7ff" opacity="0.25"/>
    <rect x="80" y="55" width="18" height="16" fill="#ffb84d" opacity="0.2"/>
    ${damaged ? `<path d="M70 -5 L105 42" stroke="#2a2118" stroke-width="4"/><path d="M90 30 L130 80" fill="#4a3020" opacity="0.85"/><circle cx="95" cy="20" r="6" fill="#ff7a3d" opacity="0.55"/>` : ""}
    <circle cx="55" cy="28" r="4" fill="#ffb84d" opacity="0.7"/>
  </g>`;
}

function lantern(x, y, scale = 1) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="8" y="0" width="4" height="14" fill="#8b6914"/>
    <rect x="2" y="14" width="16" height="18" rx="2" fill="#c4a882"/>
    <rect x="5" y="17" width="10" height="12" rx="1" fill="#ffb84d" opacity="0.85"/>
    <ellipse cx="10" cy="40" rx="14" ry="8" fill="#ffb84d" opacity="0.25" filter="url(#soft)"/>
  </g>`;
}

function keeperSilhouette(x, y, scale = 1, cloak = "#3a5068") {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <ellipse cx="40" cy="128" rx="28" ry="7" fill="#2a2118" opacity="0.4"/>
    <!-- layered cloak -->
    <path d="M14 118 L22 52 L32 40 L40 36 L48 40 L58 52 L66 118 L52 126 L40 120 L28 126 Z" fill="${cloak}"/>
    <path d="M20 118 L26 70 L40 95 L54 70 L60 118 L50 122 L40 116 L30 122 Z" fill="#2a2118" opacity="0.28"/>
    <!-- hood + face -->
    <path d="M24 46 Q40 22 56 46 L50 58 Q40 50 30 58 Z" fill="#1a1510"/>
    <ellipse cx="40" cy="50" rx="9" ry="10" fill="#e8d5b0"/>
    <ellipse cx="37" cy="48" rx="1.5" ry="2" fill="#1a1510"/>
    <ellipse cx="43" cy="48" rx="1.5" ry="2" fill="#1a1510"/>
    <!-- bronze staff + cyan crystal -->
    <rect x="60" y="28" width="5" height="90" rx="1.5" fill="#8b6914"/>
    <path d="M54 30 L72 30 L63 14 Z" fill="#3de7ff" opacity="0.95"/>
    <circle cx="63" cy="24" r="7" fill="#66e0ff" opacity="0.45" filter="url(#soft)"/>
    <!-- amber belt + pouch -->
    <rect x="28" y="82" width="24" height="6" rx="1" fill="#c4a882"/>
    <ellipse cx="48" cy="92" rx="5" ry="6" fill="#8b5a3c"/>
  </g>`;
}

function damagedFountain(cx, cy) {
  return `
  <ellipse cx="${cx}" cy="${cy + 44}" rx="100" ry="24" fill="#4a7080" opacity="0.5"/>
  <path d="M${cx - 80} ${cy + 42} L${cx - 62} ${cy - 36} L${cx + 62} ${cy - 36} L${cx + 80} ${cy + 42} Z" fill="#c4a882"/>
  <path d="M${cx - 80} ${cy + 42} L${cx - 62} ${cy - 36} L${cx + 62} ${cy - 36} L${cx + 80} ${cy + 42} Z" fill="none" stroke="#8b6914" stroke-width="2" opacity="0.45"/>
  <path d="M${cx - 44} ${cy - 36} L${cx - 32} ${cy - 108} L${cx + 32} ${cy - 108} L${cx + 44} ${cy - 36} Z" fill="#d4c4a8"/>
  <ellipse cx="${cx}" cy="${cy - 108}" rx="42" ry="11" fill="#e8d5b0"/>
  <circle cx="${cx}" cy="${cy - 140}" r="16" fill="#3de7ff" opacity="0.92"/>
  <circle cx="${cx}" cy="${cy - 140}" r="8" fill="#a8f4ff" opacity="0.7"/>
  <path d="M${cx} ${cy - 158} Q${cx - 14} ${cy - 182} ${cx} ${cy - 200} Q${cx + 14} ${cy - 182} ${cx} ${cy - 158}" fill="#66e0ff" opacity="0.75"/>
  <!-- damage + cyan seep -->
  <path d="M${cx - 24} ${cy - 20} L${cx - 10} ${cy + 14} L${cx - 32} ${cy + 36}" stroke="#2a2118" stroke-width="3.5" fill="none" opacity="0.5"/>
  <path d="M${cx + 28} ${cy - 55} L${cx + 40} ${cy - 8}" stroke="#2a2118" stroke-width="3" fill="none" opacity="0.45"/>
  <path d="M${cx - 60} ${cy + 8} L${cx - 90} ${cy + 55}" stroke="#3de7ff" stroke-width="2.5" fill="none" opacity="0.6"/>
  <path d="M${cx + 50} ${cy} L${cx + 85} ${cy + 40}" stroke="#3de7ff" stroke-width="2" fill="none" opacity="0.45"/>
  <ellipse cx="${cx - 50}" cy="${cy + 50}" rx="18" ry="6" fill="#3de7ff" opacity="0.25"/>`;
}

function timberStall(x, y, broken = false) {
  return `<g transform="translate(${x},${y})">
    <rect x="0" y="20" width="70" height="50" rx="3" fill="#8b5a3c"/>
    <path d="M-8 20 L35 -10 L78 20 Z" fill="${broken ? "#5c3d2e" : "#c4a882"}"/>
    ${broken ? `<path d="M50 -2 L72 24" stroke="#2a2118" stroke-width="3"/><path d="M60 20 L85 55" fill="#5c3d2e" opacity="0.8"/>` : ""}
    <rect x="8" y="30" width="22" height="18" fill="#1a2744" opacity="0.5"/>
  </g>`;
}

function circusTent(cx, cy, scale = 1, damaged = false) {
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <path d="M-140 180 L0 -120 L140 180 Z" fill="#c44840"/>
    <path d="M-140 180 L0 -120 L140 180 Z" fill="none" stroke="#8b2018" stroke-width="4"/>
    <path d="M0 -120 L0 180" stroke="#ffe566" stroke-width="6"/>
    <path d="M-80 40 L80 40" stroke="#ffe566" stroke-width="4"/>
    <path d="M-50 110 L50 110" stroke="#ffe566" stroke-width="3"/>
    <path d="M0 -120 L0 -160"/><path d="M0 -160 L28 -140 L0 -128" fill="#ffb84d"/>
    ${damaged ? `
      <path d="M40 -40 L90 40 L70 50 L30 -20 Z" fill="#1a1510" opacity="0.55"/>
      <path d="M-20 60 L40 160" stroke="#3de7ff" stroke-width="3" opacity="0.6"/>
      <circle cx="60" cy="-20" r="8" fill="#ff7a3d" opacity="0.7"/>
    ` : ""}
    <path d="M-30 180 Q0 120 30 180" fill="#1a1510"/>
  </g>`;
}

function auroraBands(w, h) {
  return `
  <path d="M0 ${h * 0.15} Q${w * 0.25} ${h * 0.05} ${w * 0.5} ${h * 0.18} Q${w * 0.75} ${h * 0.28} ${w} ${h * 0.12}" fill="none" stroke="#3de7ff" stroke-width="18" opacity="0.25"/>
  <path d="M0 ${h * 0.22} Q${w * 0.3} ${h * 0.1} ${w * 0.55} ${h * 0.24} Q${w * 0.8} ${h * 0.32} ${w} ${h * 0.18}" fill="none" stroke="#7dffc0" stroke-width="14" opacity="0.2"/>
  <path d="M0 ${h * 0.28} Q${w * 0.2} ${h * 0.18} ${w * 0.45} ${h * 0.3} Q${w * 0.7} ${h * 0.38} ${w} ${h * 0.22}" fill="none" stroke="#ffb84d" stroke-width="10" opacity="0.15"/>`;
}

function ornateFrame(x, y, w, h, accent = "#c4a882") {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#12161c" stroke="url(#bronze)" stroke-width="5"/>
  <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="10" fill="none" stroke="${accent}" stroke-width="2" opacity="0.85"/>
  <rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" rx="8" fill="none" stroke="#e8d5b0" stroke-width="1" opacity="0.25"/>
  <!-- corner gems -->
  <circle cx="${x + 18}" cy="${y + 18}" r="5" fill="${accent}"/>
  <circle cx="${x + w - 18}" cy="${y + 18}" r="5" fill="${accent}"/>
  <circle cx="${x + 18}" cy="${y + h - 18}" r="5" fill="${accent}"/>
  <circle cx="${x + w - 18}" cy="${y + h - 18}" r="5" fill="${accent}"/>`;
}

function cutGuide(x, y, w, h, r = 18) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#8b6914" stroke-width="2" stroke-dasharray="8 6" opacity="0.65"/>`;
}

function footer(text, y, pageW) {
  return `<text x="${pageW / 2}" y="${y}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="#5a5044">Riftwilds · 300 DPI print · Personal use only · Not for resale</text>
  <text x="${pageW / 2}" y="${y + 26}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" fill="#7a7064">${text}</text>`;
}

function header(title, subtitle, pageW) {
  return `
  <text x="${pageW / 2}" y="72" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="#8b6914" letter-spacing="6">RIFTWILDS</text>
  <text x="${pageW / 2}" y="122" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="44" fill="#1a1510" font-weight="700">${title}</text>
  <text x="${pageW / 2}" y="158" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="#5a5044">${subtitle}</text>`;
}

function crestArt(s = 1) {
  return `<g transform="scale(${s})">
    <rect x="8" y="8" width="124" height="124" rx="18" fill="#1a1510" stroke="#c4a882" stroke-width="5"/>
    <circle cx="70" cy="56" r="26" fill="none" stroke="#3de7ff" stroke-width="4"/>
    <circle cx="70" cy="56" r="8" fill="#ffb84d"/>
    <path d="M38 96h64" stroke="#c4a882" stroke-width="5" stroke-linecap="round"/>
    <path d="M48 28l22 12 22-12" stroke="#e8d5b0" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M70 82 L78 96 L70 104 L62 96 Z" fill="#3de7ff" opacity="0.8"/>
  </g>`;
}

function eggArt(s = 1) {
  return `<g transform="scale(${s})">
    <ellipse cx="70" cy="120" rx="50" ry="12" fill="#3d8a48" opacity="0.45"/>
    <ellipse cx="70" cy="64" rx="42" ry="56" fill="#e8d5b0"/>
    <ellipse cx="70" cy="64" rx="34" ry="46" fill="#f3efe6"/>
    <path d="M48 50c16-8 32 2 40 16" stroke="#3de7ff" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M70 40 L78 56 L70 64 L62 56 Z" fill="#ffb84d"/>
    <circle cx="70" cy="78" r="6" fill="#3de7ff" opacity="0.7"/>
  </g>`;
}

function heartArt(s = 1) {
  return `<g transform="scale(${s})">
    <path d="M70 118s-48-30-62-60C-2 36 12 16 32 16c14 0 26 10 38 24C82 26 94 16 108 16c20 0 34 20 24 42-14 30-62 60-62 60Z" fill="#c44840"/>
    <path d="M70 108s-38-24-50-48c-8-16 4-32 20-32 12 0 22 8 30 20 8-12 18-20 30-20 16 0 28 16 20 32-12 24-50 48-50 48Z" fill="#e87870"/>
    <path d="M70 70 L76 82 L70 88 L64 82 Z" fill="#3de7ff" opacity="0.7"/>
  </g>`;
}

function keeperArt(s = 1) {
  return `<g transform="scale(${s})">
    <path d="M70 10l16 12 20-4 8 20 18 10-8 20 8 20-18 10-8 20-20-4-16 12-16-12-20 4-8-20-18-10 8-20-8-20 18-10 8-20 20 4 16-12Z" fill="#c4a882"/>
    <circle cx="70" cy="70" r="32" fill="#1a1510"/>
    <ellipse cx="70" cy="62" rx="13" ry="16" fill="#e8d5b0"/>
    <path d="M48 92c10-12 34-12 44 0" fill="#3de7ff" opacity="0.8"/>
    <path d="M70 36l4 10 10 2-8 7 2 10-8-5-8 5 2-10-8-7 10-2 4-10Z" fill="#ffb84d"/>
  </g>`;
}

/* ─── PDF helper ──────────────────────────────────────────────────── */

function jpegToPdf(jpegBuf, imgW, imgH, pageW, pageH) {
  const imgObjNum = 1;
  const contentObjNum = 2;
  const pageObjNum = 3;
  const pagesObjNum = 4;
  const catalogObjNum = 5;

  const imgDict =
    `${imgObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuf.length} >>\n` +
    `stream\n`;
  const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentDict =
    `${contentObjNum} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;
  const pageDict =
    `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
    `/Contents ${contentObjNum} 0 R /Resources << /XObject << /Im0 ${imgObjNum} 0 R >> >> >>\nendobj\n`;
  const pagesDict =
    `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [${pageObjNum} 0 R] /Count 1 >>\nendobj\n`;
  const catalogDict =
    `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`;

  const parts = [];
  const enc = (s) => Buffer.from(s, "latin1");
  const off = [0];
  const mark = () => {
    off.push(parts.reduce((n, b) => n + b.length, 0));
  };

  parts.push(enc("%PDF-1.4\n"));
  mark();
  parts.push(enc(imgDict), jpegBuf, enc("\nendstream\nendobj\n"));
  mark();
  parts.push(enc(contentDict));
  mark();
  parts.push(enc(pageDict));
  mark();
  parts.push(enc(pagesDict));
  mark();
  parts.push(enc(catalogDict));

  const xrefPos = parts.reduce((n, b) => n + b.length, 0);
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 6 /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  parts.push(enc(xref));
  return Buffer.concat(parts);
}

async function writePrintable({ slug, svg, size, alsoPdf = true }) {
  const pngPath = path.join(OUT, `${slug}.png`);
  const pdfPath = path.join(OUT, `${slug}.pdf`);
  const svgPath = path.join(OUT, `${slug}.svg`);
  fs.writeFileSync(svgPath, svg, "utf8");

  await sharp(Buffer.from(svg), { density: DPI })
    .resize(size.w, size.h, { fit: "fill" })
    .withMetadata({ density: DPI })
    .png({ compressionLevel: 8 })
    .toFile(pngPath);

  if (alsoPdf) {
    const jpeg = await sharp(Buffer.from(svg), { density: DPI })
      .resize(size.w, size.h, { fit: "fill" })
      .jpeg({ quality: 93, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(pdfPath, jpegToPdf(jpeg, size.w, size.h, size.pageW, size.pageH));
  }
  console.log(`  ✓ ${slug} (${size.w}×${size.h} @ ${DPI} DPI)`);
}

/* ─── Sheet builders ─────────────────────────────────────────────── */

function stickerSheetRiftlings() {
  const W = 850;
  const H = 1100;
  const stickers = [
    { key: "spark", label: "Spark", x: 70, y: 190 },
    { key: "cindercub", label: "Cindercub", x: 320, y: 190 },
    { key: "mossprig", label: "Mossprig", x: 570, y: 190 },
    { key: "bubbloon", label: "Bubbloon", x: 70, y: 470 },
  ];
  const badges = [
    { x: 360, y: 490, art: crestArt(0.9) },
    { x: 560, y: 490, art: eggArt(0.9) },
    { x: 200, y: 750, art: heartArt(0.85) },
    { x: 420, y: 750, art: keeperArt(0.85) },
  ];

  let body = "";
  for (const s of stickers) {
    body += `<rect x="${s.x}" y="${s.y}" width="210" height="240" rx="28" fill="#1a1510" opacity="0.06"/>`;
    body += cutGuide(s.x, s.y, 210, 240, 28);
    body += `<g transform="translate(${s.x + 5},${s.y + 8})">${wrapChar(s.key, 5, 5, 1)}</g>`;
    body += `<text x="${s.x + 105}" y="${s.y + 228}" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#1a1510">${s.label}</text>`;
  }
  for (const b of badges) {
    body += cutGuide(b.x, b.y, 160, 180, 24);
    body += `<g transform="translate(${b.x + 20},${b.y + 20})">${b.art}</g>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>${sharedDefs()}</defs>
  <rect width="${W}" height="${H}" fill="url(#parchment)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#8b6914" stroke-width="3" rx="12"/>
  ${header("Riftling Sticker Sheet", "Companions of the Rift · Cut on dashed guides", W)}
  ${body}
  ${footer("US Letter · Stickers", 1055, W)}
</svg>`;
}

function stickerSheetCrests() {
  const W = 850;
  const H = 1100;
  const items = [
    { label: "Commons Crest", art: crestArt(1.35), x: 80, y: 190 },
    { label: "Hatch Egg", art: eggArt(1.35), x: 320, y: 190 },
    { label: "Care Heart", art: heartArt(1.25), x: 560, y: 190 },
    { label: "Keeper Badge", art: keeperArt(1.15), x: 80, y: 470 },
    { label: "Spark Seal", art: `<g>${wrapChar("spark", 0, 0, 0.85)}</g>`, x: 320, y: 470 },
    { label: "Tide Mark", art: `<g>${wrapChar("bubbloon", 0, 0, 0.85)}</g>`, x: 560, y: 470 },
  ];
  let body = "";
  for (const it of items) {
    body += cutGuide(it.x, it.y, 210, 230, 26);
    body += `<g transform="translate(${it.x + 35},${it.y + 22})">${it.art}</g>`;
    body += `<text x="${it.x + 105}" y="${it.y + 218}" text-anchor="middle" font-family="Georgia, serif" font-size="15" fill="#1a1510">${it.label}</text>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>${sharedDefs()}</defs>
  <rect width="${W}" height="${H}" fill="url(#parchment)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#8b6914" stroke-width="3" rx="12"/>
  ${header("Crest and Badge Stickers", "Keeper seals · Hatchery marks · Commons pride", W)}
  ${body}
  ${footer("US Letter · Stickers", 1055, W)}
</svg>`;
}

/** Spark faces a cyan rift storm — epic companion warfront poster */
function posterSpark(sizeMeta, viewW, viewH) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMeta.w}" height="${sizeMeta.h}" viewBox="0 0 ${viewW} ${viewH}">
  <defs>
    ${sharedDefs()}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#060a12"/><stop offset="0.35" stop-color="#152438"/><stop offset="0.7" stop-color="#3a2c24"/><stop offset="1" stop-color="#5a4030"/>
    </linearGradient>
  </defs>
  <rect width="${viewW}" height="${viewH}" fill="url(#sky)"/>
  <rect width="${viewW}" height="${viewH}" fill="url(#amberGlow)" opacity="0.55"/>
  <rect width="${viewW}" height="${viewH}" fill="url(#emberBloom)" opacity="0.7"/>
  <!-- layered storm front -->
  <ellipse cx="${viewW * 0.18}" cy="${viewH * 0.16}" rx="180" ry="60" fill="#060c18" opacity="0.8"/>
  <ellipse cx="${viewW * 0.55}" cy="${viewH * 0.12}" rx="200" ry="50" fill="#0a1424" opacity="0.75"/>
  <ellipse cx="${viewW * 0.85}" cy="${viewH * 0.2}" rx="140" ry="55" fill="#0e1828" opacity="0.7"/>
  ${timberHall(viewW * 0.02, viewH * 0.48, 0.85, true)}
  ${timberHall(viewW * 0.78, viewH * 0.52, 0.7, true)}
  ${riftTear(viewW * 0.74, viewH * 0.36, viewH * 0.48, 34)}
  ${stormDebris(viewW * 0.55, viewH * 0.42)}
  <!-- warm earth ridge + cyan cracks -->
  <path d="M0 ${viewH * 0.7} Q${viewW * 0.25} ${viewH * 0.62} ${viewW * 0.48} ${viewH * 0.68} Q${viewW * 0.72} ${viewH * 0.76} ${viewW} ${viewH * 0.64} L${viewW} ${viewH} L0 ${viewH} Z" fill="url(#earth)"/>
  <path d="M0 ${viewH * 0.78} Q${viewW * 0.35} ${viewH * 0.72} ${viewW * 0.55} ${viewH * 0.8} Q${viewW * 0.8} ${viewH * 0.88} ${viewW} ${viewH * 0.76} L${viewW} ${viewH} L0 ${viewH} Z" fill="#1a3020" opacity="0.85"/>
  <path d="M${viewW * 0.32} ${viewH * 0.7} L${viewW * 0.4} ${viewH * 0.86} L${viewW * 0.36} ${viewH * 0.96}" stroke="#3de7ff" stroke-width="3.5" fill="none" opacity="0.65"/>
  <path d="M${viewW * 0.52} ${viewH * 0.72} L${viewW * 0.6} ${viewH * 0.92}" stroke="#2a2118" stroke-width="5" fill="none" opacity="0.45"/>
  <path d="M${viewW * 0.2} ${viewH * 0.74} L${viewW * 0.28} ${viewH * 0.9}" stroke="#3de7ff" stroke-width="2" fill="none" opacity="0.4"/>
  ${lantern(viewW * 0.08, viewH * 0.62, 1.1)}
  ${lantern(viewW * 0.88, viewH * 0.66, 0.95)}
  ${keeperSilhouette(viewW * 0.1, viewH * 0.56, 1.15, "#2a3848")}
  ${keeperSilhouette(viewW * 0.22, viewH * 0.6, 0.85, "#4a3a28")}
  <g transform="translate(${viewW / 2 - 150},${viewH * 0.28}) scale(1.5)">
    ${CHAR.spark}
  </g>
  <!-- bronze title plate -->
  <rect x="${viewW * 0.1}" y="${viewH * 0.815}" width="${viewW * 0.8}" height="${viewH * 0.13}" rx="12" fill="#12100c" opacity="0.82" stroke="#c4a882" stroke-width="2.5"/>
  <rect x="${viewW * 0.12}" y="${viewH * 0.825}" width="${viewW * 0.76}" height="${viewH * 0.11}" rx="8" fill="none" stroke="#3de7ff" stroke-width="1" opacity="0.35"/>
  <text x="${viewW / 2}" y="${viewH * 0.085}" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#ffb84d" letter-spacing="8">RIFTWILDS</text>
  <text x="${viewW / 2}" y="${viewH * 0.875}" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#f3efe6" font-weight="700">Spark's Stand</text>
  <text x="${viewW / 2}" y="${viewH * 0.915}" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#e8d5b0">Glowpup guardian · Keepers hold the line</text>
  <text x="${viewW / 2}" y="${viewH * 0.955}" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#c4a882">300 DPI print · Personal use · Not for resale</text>
</svg>`;
}

/** Commons plaza under rift storm — damaged fountain, Keepers, Riftlings */
function posterCommons() {
  const W = 850;
  const H = 1100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${sharedDefs()}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#080e18"/><stop offset="0.4" stop-color="#1a3040"/><stop offset="0.75" stop-color="#3a3028"/><stop offset="1" stop-color="#4a3828"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#cyanGlow)" opacity="0.55"/>
  <rect width="${W}" height="${H}" fill="url(#emberBloom)" opacity="0.4"/>
  <ellipse cx="160" cy="140" rx="180" ry="58" fill="#060c14" opacity="0.75"/>
  <ellipse cx="520" cy="100" rx="200" ry="50" fill="#0a1220" opacity="0.7"/>
  <ellipse cx="720" cy="160" rx="140" ry="48" fill="#0e1828" opacity="0.65"/>
  ${timberHall(20, 480, 0.95, true)}
  ${timberHall(700, 500, 0.8, true)}
  ${riftTear(640, 300, 380, 36)}
  ${stormDebris(480, 280)}
  <!-- hills / plaza -->
  <path d="M0 600 Q200 520 380 560 Q560 480 720 540 Q800 510 850 560 L850 1100 L0 1100 Z" fill="#3d6a42"/>
  <path d="M0 700 Q240 640 450 700 Q650 760 850 680 L850 1100 L0 1100 Z" fill="#2f5a3a"/>
  <ellipse cx="400" cy="690" rx="240" ry="55" fill="#c4a882" opacity="0.5"/>
  <ellipse cx="400" cy="690" rx="180" ry="35" fill="#a89068" opacity="0.35"/>
  ${damagedFountain(400, 600)}
  ${timberStall(70, 560, true)}
  ${timberStall(690, 540, true)}
  ${lantern(50, 620, 1)}
  ${lantern(780, 610, 0.9)}
  ${keeperSilhouette(90, 620, 1, "#2a3848")}
  ${keeperSilhouette(640, 630, 0.95, "#4a3a28")}
  ${keeperSilhouette(720, 650, 0.75, "#3a4858")}
  <g transform="translate(180,700) scale(0.62)">${CHAR.spark}</g>
  <g transform="translate(480,720) scale(0.55)">${CHAR.mossprig}</g>
  <g transform="translate(300,740) scale(0.42)">${CHAR.cindercub}</g>
  <rect x="70" y="890" width="710" height="130" rx="12" fill="#12100c" opacity="0.84" stroke="#c4a882" stroke-width="2.5"/>
  <rect x="85" y="902" width="680" height="106" rx="8" fill="none" stroke="#3de7ff" stroke-width="1" opacity="0.3"/>
  <text x="425" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#ffb84d" letter-spacing="7">RIFTWILDS</text>
  <text x="425" y="945" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#f3efe6" font-weight="700">Commons Under Threat</text>
  <text x="425" y="985" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#e8d5b0">Keepers &amp; Riftlings hold the cracked plaza</text>
  <text x="425" y="1050" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#c4a882">300 DPI print · US Letter · Personal use · Not for resale</text>
</svg>`;
}

/** Hatchery nest under cyan-amber aurora */
function posterHatchery() {
  const W = 850;
  const H = 1100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${sharedDefs()}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#060e1c"/><stop offset="0.45" stop-color="#1a3048"/><stop offset="0.8" stop-color="#2a4030"/><stop offset="1" stop-color="#3a3828"/>
    </linearGradient>
    <radialGradient id="nestglow" cx="50%" cy="52%" r="42%">
      <stop stop-color="#3de7ff" stop-opacity="0.45"/><stop offset="0.5" stop-color="#ffb84d" stop-opacity="0.2"/><stop offset="1" stop-color="#3de7ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${auroraBands(W, H)}
  <rect width="${W}" height="${H}" fill="url(#nestglow)"/>
  <ellipse cx="200" cy="150" rx="120" ry="40" fill="#060c18" opacity="0.5"/>
  <ellipse cx="650" cy="130" rx="140" ry="45" fill="#0a1424" opacity="0.45"/>
  <!-- timber hatchery arch with bronze trim -->
  <path d="M160 800 Q160 400 425 360 Q690 400 690 800" fill="none" stroke="#6a4530" stroke-width="22"/>
  <path d="M180 800 Q180 420 425 385 Q670 420 670 800" fill="none" stroke="#c4a882" stroke-width="7" opacity="0.7"/>
  <path d="M200 800 Q200 440 425 405 Q650 440 650 800" fill="none" stroke="#8b6914" stroke-width="2" opacity="0.4"/>
  ${lantern(175, 520, 1.05)}
  ${lantern(650, 520, 1.05)}
  <!-- nest -->
  <ellipse cx="425" cy="750" rx="220" ry="60" fill="#3d6a42" opacity="0.75"/>
  <path d="M220 730 Q320 640 400 730 Q425 680 450 730 Q530 640 630 730" fill="#5aad62" opacity="0.55"/>
  <path d="M250 760 Q340 690 425 765 Q510 690 600 760" fill="#2f5a3a" opacity="0.7"/>
  <!-- eggs with rift markings -->
  <ellipse cx="350" cy="620" rx="52" ry="72" fill="#e8d5b0"/>
  <ellipse cx="350" cy="620" rx="40" ry="56" fill="#f3efe6"/>
  <path d="M328 585c16-8 32 2 38 16" stroke="#3de7ff" stroke-width="4.5" fill="none"/>
  <path d="M350 555 L360 576 L350 586 L340 576 Z" fill="#ffb84d"/>
  <ellipse cx="500" cy="640" rx="44" ry="60" fill="#d4bc8e"/>
  <ellipse cx="500" cy="640" rx="34" ry="48" fill="#e8d5b0"/>
  <path d="M482 612c12-5 24 2 28 14" stroke="#3de7ff" stroke-width="3.5" fill="none"/>
  <ellipse cx="425" cy="680" rx="28" ry="38" fill="#c4a882"/>
  <path d="M425 650 L432 664 L425 670 L418 664 Z" fill="#3de7ff"/>
  <g transform="translate(540,690) scale(0.48)">${CHAR.spark}</g>
  ${keeperSilhouette(120, 680, 0.95, "#2a3848")}
  ${keeperSilhouette(680, 700, 0.8, "#4a3a28")}
  <circle cx="180" cy="180" r="2.5" fill="#fff" opacity="0.85"/>
  <circle cx="620" cy="160" r="2" fill="#3de7ff" opacity="0.95"/>
  <circle cx="740" cy="240" r="2.5" fill="#ffb84d" opacity="0.85"/>
  <circle cx="120" cy="260" r="2" fill="#7dffc0" opacity="0.8"/>
  <circle cx="400" cy="200" r="1.5" fill="#a8f4ff" opacity="0.7"/>
  <rect x="70" y="890" width="710" height="130" rx="12" fill="#12100c" opacity="0.84" stroke="#c4a882" stroke-width="2.5"/>
  <rect x="85" y="902" width="680" height="106" rx="8" fill="none" stroke="#3de7ff" stroke-width="1" opacity="0.3"/>
  <text x="425" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#3de7ff" letter-spacing="7">RIFTWILDS</text>
  <text x="425" y="945" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#f3efe6" font-weight="700">Hatchery Aurora</text>
  <text x="425" y="985" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#e8d5b0">Nest eggs under riftlight — care before the storm</text>
  <text x="425" y="1050" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#c4a882">300 DPI print · US Letter · Personal use · Not for resale</text>
</svg>`;
}

function bookmarksSheet() {
  const W = 850;
  const H = 1100;
  const marks = [
    {
      title: "Spark",
      accent: "#ffb84d",
      art: wrapChar("spark", 15, 20, 0.9),
      quote: "Stand with the light",
    },
    {
      title: "Circus",
      accent: "#ff7a3d",
      art: `<g transform="translate(40,40) scale(0.55)">${circusTent(110, 120, 1, true)}</g>`,
      quote: "Defend the big top",
    },
    {
      title: "Keeper",
      accent: "#3de7ff",
      art: `<g transform="translate(20,30) scale(1.1)">${keeperArt(1)}</g>
        <g transform="translate(40,160) scale(0.55)">${CHAR.mossprig}</g>`,
      quote: "Care · Explore · Protect",
    },
  ];
  let body = "";
  marks.forEach((m, i) => {
    const x = 70 + i * 260;
    body += `
    <rect x="${x}" y="185" width="220" height="790" rx="10" fill="#141210"/>
    <rect x="${x}" y="185" width="220" height="790" rx="10" fill="none" stroke="${m.accent}" stroke-width="4"/>
    <rect x="${x + 10}" y="195" width="200" height="770" rx="6" fill="none" stroke="#c4a882" stroke-opacity="0.4" stroke-width="1.5"/>
    <text x="${x + 110}" y="245" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="${m.accent}" letter-spacing="3">RIFTWILDS</text>
    <g transform="translate(${x + 10}, 270)">${m.art}</g>
    <text x="${x + 110}" y="780" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#f3efe6">${m.title}</text>
    <text x="${x + 110}" y="820" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#e8d5b0">${m.quote}</text>
    <text x="${x + 110}" y="920" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#7a7064" transform="rotate(-90 ${x + 110} 920)">300 DPI · Cut along edge</text>
    `;
    body += cutGuide(x, 185, 220, 790, 10);
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>${sharedDefs()}</defs>
  <rect width="${W}" height="${H}" fill="url(#parchment)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#8b6914" stroke-width="3" rx="12"/>
  ${header("Adventure Bookmark Trio", "Cut out · Laminate optional · ~2×7\" each", W)}
  ${body}
  ${footer("US Letter · Bookmarks", 1055, W)}
</svg>`;
}

function tradingCard(name, subtitle, affinity, rarity, charKey, accent) {
  const windowFill =
    charKey === "spark"
      ? "#2a2010"
      : charKey === "cindercub"
        ? "#2a1410"
        : charKey === "mossprig"
          ? "#102018"
          : "#102028";
  return `
  ${ornateFrame(0, 0, 240, 336, accent)}
  <!-- art window — affinity atmosphere -->
  <rect x="22" y="22" width="196" height="168" rx="8" fill="${windowFill}"/>
  <rect x="22" y="22" width="196" height="168" rx="8" fill="url(#cyanGlow)" opacity="0.35"/>
  <ellipse cx="120" cy="160" rx="70" ry="18" fill="#1a1510" opacity="0.45"/>
  <path d="M30 140 Q80 110 120 130 Q170 100 210 135 L210 185 L30 185 Z" fill="#2f5a3a" opacity="0.55"/>
  ${charKey === "spark" || charKey === "bubbloon" ? `<ellipse cx="180" cy="60" rx="28" ry="40" fill="#3de7ff" opacity="0.18"/>` : ""}
  <g transform="translate(22, 8) scale(0.95)">${CHAR[charKey]}</g>
  <!-- rarity gem bar -->
  <rect x="22" y="198" width="196" height="18" rx="4" fill="#1a1510"/>
  <text x="120" y="211" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="${accent}" letter-spacing="2">${rarity}</text>
  <text x="120" y="238" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#c4a882" letter-spacing="2">RIFTWILDS</text>
  <text x="120" y="268" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#f3efe6" font-weight="700">${name}</text>
  <text x="120" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#e8d5b0">${subtitle}</text>
  <rect x="48" y="300" width="144" height="22" rx="4" fill="${accent}" opacity="0.92"/>
  <text x="120" y="315" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#0c0e12" font-weight="700">${affinity}</text>
  `;
}

function tradingCardsSheet() {
  const W = 850;
  const H = 1100;
  const cards = [
    { name: "Spark", sub: "Glowpup", aff: "Radiant", rarity: "★★★ COMPANION", key: "spark", accent: "#ffb84d", x: 90, y: 190 },
    { name: "Cindercub", sub: "Ember Cub", aff: "Ember", rarity: "★★ UNCOMMON", key: "cindercub", accent: "#ff7a3d", x: 440, y: 190 },
    { name: "Mossprig", sub: "Grove Sprout", aff: "Grove", rarity: "★★ UNCOMMON", key: "mossprig", accent: "#5aad62", x: 90, y: 570 },
    { name: "Bubbloon", sub: "Tide Bubble", aff: "Tide", rarity: "★★ UNCOMMON", key: "bubbloon", accent: "#3d9bff", x: 440, y: 570 },
  ];
  let body = "";
  for (const c of cards) {
    body += `<g transform="translate(${c.x},${c.y})">${tradingCard(c.name, c.sub, c.aff, c.rarity, c.key, c.accent)}</g>`;
    body += cutGuide(c.x - 4, c.y - 4, 248, 344, 16);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>${sharedDefs()}</defs>
  <rect width="${W}" height="${H}" fill="url(#parchment)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#8b6914" stroke-width="3" rx="12"/>
  ${header("Riftling Trading Cards", "Fantasy collectibles · Cut · Trade · Battle lore", W)}
  ${body}
  ${footer("US Letter · ~2.5×3.5\" cards", 1055, W)}
</svg>`;
}

function card5x7(name, subtitle, blurb, sceneFn) {
  const W = 500;
  const H = 700;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_5X7.w}" height="${CARD_5X7.h}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${sharedDefs("c")}
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#1a1510"/><stop offset="0.45" stop-color="#121a28"/><stop offset="1" stop-color="#2a2018"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${sceneFn(W, H)}
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="12" fill="none" stroke="#c4a882" stroke-width="3"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="8" fill="none" stroke="#3de7ff" stroke-width="1" opacity="0.35"/>
  <text x="250" y="58" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#ffb84d" letter-spacing="5">RIFTWILDS</text>
  <rect x="40" y="520" width="420" height="120" rx="8" fill="#1a1510" opacity="0.78" stroke="#c4a882" stroke-width="1.5"/>
  <text x="250" y="565" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#f3efe6" font-weight="700">${name}</text>
  <text x="250" y="598" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#e8d5b0">${subtitle}</text>
  <text x="250" y="625" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#a89b86">${blurb}</text>
  <text x="250" y="670" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#7a7064">5×7" · 300 DPI · Personal use · Not for resale</text>
</svg>`;
}

function sparkCardScene(W, H) {
  return `
  <rect width="${W}" height="${H}" fill="url(#c-amberGlow)" opacity="0.75"/>
  <rect width="${W}" height="${H}" fill="url(#c-emberBloom)" opacity="0.6"/>
  <ellipse cx="100" cy="80" rx="90" ry="35" fill="#060c14" opacity="0.55"/>
  ${timberHall(-20, 300, 0.55, true)}
  ${riftTear(380, 200, 280, 24)}
  ${stormDebris(260, 180)}
  <path d="M0 470 Q200 410 350 450 Q450 490 500 430 L500 700 L0 700 Z" fill="#2f5a3a"/>
  <path d="M120 480 L160 560 L140 620" stroke="#3de7ff" stroke-width="2.5" fill="none" opacity="0.55"/>
  ${lantern(20, 400, 0.8)}
  <g transform="translate(100, 70) scale(1.4)">${CHAR.spark}</g>
  ${keeperSilhouette(30, 370, 0.75)}
  ${keeperSilhouette(400, 390, 0.55, "#4a3a28")}`;
}

function circusCardScene(W, H) {
  return `
  <rect width="${W}" height="${H}" fill="url(#c-cyanGlow)" opacity="0.45"/>
  <rect width="${W}" height="${H}" fill="url(#c-emberBloom)" opacity="0.55"/>
  <ellipse cx="120" cy="90" rx="100" ry="40" fill="#0a0a12" opacity="0.5"/>
  ${circusTent(250, 260, 0.9, true)}
  ${riftTear(420, 160, 180, 16)}
  ${stormDebris(180, 200)}
  <g transform="translate(50, 390) scale(0.55)">${CHAR.bubbloon}</g>
  <g transform="translate(300, 400) scale(0.52)">${CHAR.spark}</g>
  ${keeperSilhouette(40, 360, 0.7, "#2a3848")}
  ${keeperSilhouette(400, 350, 0.7, "#4a3020")}`;
}

function circusInvite() {
  const W = 850;
  const H = 1100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${sharedDefs()}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#0a0810"/><stop offset="0.45" stop-color="#2a2018"/><stop offset="1" stop-color="#5a3020"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#amberGlow)" opacity="0.5"/>
  <rect width="${W}" height="${H}" fill="url(#emberBloom)" opacity="0.55"/>
  <ellipse cx="200" cy="120" rx="160" ry="50" fill="#06080e" opacity="0.6"/>
  <ellipse cx="650" cy="100" rx="180" ry="55" fill="#0c0a14" opacity="0.55"/>
  ${timberHall(40, 420, 0.7, true)}
  ${timberHall(720, 440, 0.6, true)}
  ${circusTent(425, 360, 1.2, true)}
  ${riftTear(700, 260, 240, 24)}
  ${stormDebris(280, 240)}
  ${lantern(100, 560, 1)}
  ${lantern(730, 550, 0.95)}
  <ellipse cx="140" cy="320" rx="22" ry="28" fill="#3de7ff" opacity="0.75"/>
  <ellipse cx="740" cy="280" rx="20" ry="26" fill="#ffe566" opacity="0.8"/>
  <g transform="translate(280,700) scale(0.7)">${CHAR.spark}</g>
  <g transform="translate(480,730) scale(0.45)">${CHAR.cindercub}</g>
  ${keeperSilhouette(140, 680, 0.9)}
  ${keeperSilhouette(640, 690, 0.85, "#4a3028")}
  <text x="425" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#ffb84d" letter-spacing="6">YOU'RE INVITED</text>
  <text x="425" y="118" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#f3efe6" font-weight="700">Traveling Circus</text>
  <text x="425" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="17" fill="#e8d5b0">Celebrate under the big top — Keepers welcome</text>
  <rect x="150" y="890" width="550" height="120" rx="12" fill="rgba(18,16,12,0.82)" stroke="#c4a882" stroke-width="2.5"/>
  <rect x="165" y="902" width="520" height="96" rx="8" fill="none" stroke="#ffb84d" stroke-width="1" opacity="0.35"/>
  <text x="425" y="940" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#e8d5b0">Date: ____________________</text>
  <text x="425" y="980" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#e8d5b0">Place: ____________________</text>
  <text x="425" y="1055" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#c4a882">300 DPI · US Letter · Personal / party use · Not for resale · riftwilds.com</text>
</svg>`;
}

function standeeSpark() {
  const W = 850;
  const H = 1100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>${sharedDefs()}</defs>
  <rect width="${W}" height="${H}" fill="url(#parchment)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#8b6914" stroke-width="3" rx="12"/>
  ${header("Spark Paper Standee", "Cut solid outline · Fold dashed base tab", W)}
  <g transform="translate(260,180) scale(1.55)">
    <ellipse cx="100" cy="118" rx="72" ry="68" fill="#ffffff"/>
    ${CHAR.spark}
  </g>
  <path d="M290 720 L560 720 L590 910 L260 910 Z" fill="#ffb84d" stroke="#2a2118" stroke-width="2.5"/>
  <line x1="290" y1="720" x2="560" y2="720" stroke="#2a2118" stroke-width="2" stroke-dasharray="10 8"/>
  <text x="425" y="820" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#2a2118">FOLD TAB</text>
  <text x="425" y="860" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#5a5044">Cut character · Fold tab under · Desk companion</text>
  <text x="120" y="400" font-family="Georgia, serif" font-size="14" fill="#7a7064" transform="rotate(-90 120 400)">Cut outside edge</text>
  ${footer("US Letter · Paper craft standee", 1055, W)}
</svg>`;
}

async function main() {
  ensureDir(OUT);
  console.log(`Generating Riftwilds printables → ${path.relative(ROOT, OUT)}`);
  console.log(`Target density: ${DPI} DPI\n`);

  const jobs = [
    { slug: "sticker-sheet-riftlings", svg: stickerSheetRiftlings(), size: LETTER },
    { slug: "sticker-sheet-crests", svg: stickerSheetCrests(), size: LETTER },
    { slug: "poster-spark", svg: posterSpark(LETTER, 850, 1100), size: LETTER },
    { slug: "poster-spark-a4", svg: posterSpark(A4, 794, 1123), size: A4 },
    { slug: "poster-commons", svg: posterCommons(), size: LETTER },
    { slug: "poster-hatchery", svg: posterHatchery(), size: LETTER },
    { slug: "bookmarks-sheet", svg: bookmarksSheet(), size: LETTER },
    { slug: "trading-cards-sheet", svg: tradingCardsSheet(), size: LETTER },
    {
      slug: "card-spark-5x7",
      svg: card5x7("Spark's Stand", "Heroic Glowpup", "Cyan rift vs amber courage", sparkCardScene),
      size: CARD_5X7,
    },
    {
      slug: "card-circus-5x7",
      svg: card5x7("Circus Under Fire", "Traveling Circus", "Keepers defend the big top", circusCardScene),
      size: CARD_5X7,
    },
    { slug: "circus-party-invite", svg: circusInvite(), size: LETTER },
    { slug: "standee-spark", svg: standeeSpark(), size: LETTER },
  ];

  for (const job of jobs) {
    await writePrintable(job);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    dpi: DPI,
    count: jobs.length,
    theme: "riftwilds-epic-warm-fantasy-v3",
    sizes: {
      letter: LETTER,
      a4: A4,
      card5x7: CARD_5X7,
    },
    files: jobs.map((j) => ({
      slug: j.slug,
      png: `${j.slug}.png`,
      pdf: `${j.slug}.pdf`,
      svg: `${j.slug}.svg`,
      pixels: `${j.size.w}×${j.size.h}`,
      paper: j.size.label,
    })),
  };
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone. ${jobs.length} printables @ ${DPI} DPI.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
