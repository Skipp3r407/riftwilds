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
    <stop stop-color="#66e0ff"/><stop offset="0.5" stop-color="#3de7ff"/><stop offset="1" stop-color="#1a8fb8"/>
  </linearGradient>
  <radialGradient id="${p}amberGlow" cx="50%" cy="40%" r="50%">
    <stop stop-color="#ffe566" stop-opacity="0.55"/><stop offset="0.55" stop-color="#ffb84d" stop-opacity="0.2"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${p}cyanGlow" cx="50%" cy="35%" r="55%">
    <stop stop-color="#3de7ff" stop-opacity="0.45"/><stop offset="0.6" stop-color="#3de7ff" stop-opacity="0.12"/><stop offset="1" stop-color="#3de7ff" stop-opacity="0"/>
  </radialGradient>
  <filter id="${p}soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>`;
}

/* ─── Creatures (viewBox 0 0 200 200) — full-body, game-true silhouettes ─── */

const CHAR = {
  /** Glowpup: athletic amber pup — flame mane + cyan crystal, heroic not chibi */
  spark: `
    <ellipse cx="100" cy="182" rx="48" ry="9" fill="#2a2118" opacity="0.3"/>
    <!-- leaner body -->
    <ellipse cx="100" cy="132" rx="40" ry="38" fill="#e8a838"/>
    <ellipse cx="100" cy="124" rx="30" ry="28" fill="#ffc84a"/>
    <ellipse cx="90" cy="112" rx="10" ry="8" fill="#fff0a8" opacity="0.45"/>
    <!-- hind legs -->
    <path d="M70 150 Q62 168 68 178 Q78 176 80 160 Z" fill="#d4922a"/>
    <path d="M130 150 Q138 168 132 178 Q122 176 120 160 Z" fill="#d4922a"/>
    <ellipse cx="68" cy="178" rx="10" ry="5" fill="#b87820"/>
    <ellipse cx="132" cy="178" rx="10" ry="5" fill="#b87820"/>
    <!-- forelegs -->
    <path d="M62 128 Q48 145 52 160 Q64 158 70 140 Z" fill="#ffb84d"/>
    <path d="M138 128 Q152 145 148 160 Q136 158 130 140 Z" fill="#ffb84d"/>
    <!-- head (smaller vs body) -->
    <ellipse cx="100" cy="72" rx="34" ry="32" fill="#ffe566"/>
    <ellipse cx="100" cy="68" rx="24" ry="20" fill="#fff2a0"/>
    <!-- pointed ears -->
    <path d="M72 58 L60 18 L84 50 Z" fill="#ff9a2a"/>
    <path d="M72 52 L64 28 L80 48 Z" fill="#ffc84a"/>
    <path d="M128 58 L140 18 L116 50 Z" fill="#ff9a2a"/>
    <path d="M128 52 L136 28 L120 48 Z" fill="#ffc84a"/>
    <!-- flame mane crest -->
    <path d="M82 42c-10-20 0-34 16-38 0 12 6 20 12 26-10-2-18 2-28 12Z" fill="#ff5a20"/>
    <path d="M118 42c10-20 0-34-16-38 0 12-6 20-12 26 10-2 18 2 28 12Z" fill="#ff5a20"/>
    <path d="M100 12c5 8 7 16 3 26 9-5 12-14 9-26-3 3-7 3-12 0Z" fill="#ffb84d"/>
    <!-- determined face — smaller eyes -->
    <ellipse cx="88" cy="70" rx="4.5" ry="5.5" fill="#1a1510"/>
    <ellipse cx="112" cy="70" rx="4.5" ry="5.5" fill="#1a1510"/>
    <circle cx="89.5" cy="68.5" r="1.4" fill="#fff" opacity="0.85"/>
    <circle cx="113.5" cy="68.5" r="1.4" fill="#fff" opacity="0.85"/>
    <ellipse cx="100" cy="80" rx="4" ry="3" fill="#e85a28"/>
    <path d="M92 90c5 5 11 5 16 0" stroke="#1a1510" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <!-- cyan rift crystal brow -->
    <path d="M100 36 L110 54 L100 62 L90 54 Z" fill="#3de7ff"/>
    <path d="M100 40 L106 52 L100 58 L94 52 Z" fill="#a8f4ff" opacity="0.8"/>
    <!-- flame tail -->
    <path d="M142 120c22-2 32 12 24 32-12-8-18-4-24 8 4-14 2-26 0-40Z" fill="#ff7a3d"/>
    <path d="M148 128c12 0 18 8 14 18-7-4-11-2-14 4 2-8 0-14 0-22Z" fill="#ffe566"/>
    <circle cx="46" cy="48" r="2.5" fill="#3de7ff" opacity="0.9"/>
    <circle cx="162" cy="64" r="2" fill="#ffb84d" opacity="0.85"/>
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
  <ellipse cx="${cx}" cy="${cy}" rx="${w * 2.2}" ry="${h * 0.55}" fill="#3de7ff" opacity="0.12" filter="url(#soft)"/>
  <path d="M${cx} ${cy - h / 2} Q${cx - w} ${cy} ${cx} ${cy + h / 2} Q${cx + w} ${cy} ${cx} ${cy - h / 2} Z" fill="url(#rift)" opacity="0.85"/>
  <path d="M${cx} ${cy - h / 2 + 20} Q${cx - w * 0.45} ${cy} ${cx} ${cy + h / 2 - 20} Q${cx + w * 0.45} ${cy} ${cx} ${cy - h / 2 + 20} Z" fill="#a8f4ff" opacity="0.55"/>
  <circle cx="${cx - 40}" cy="${cy - 40}" r="4" fill="#3de7ff" opacity="0.8"/>
  <circle cx="${cx + 50}" cy="${cy + 20}" r="3" fill="#ffe566" opacity="0.7"/>
  <circle cx="${cx - 20}" cy="${cy + 60}" r="2.5" fill="#fff" opacity="0.6"/>`;
}

function keeperSilhouette(x, y, scale = 1, cloak = "#3a5068") {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <ellipse cx="40" cy="122" rx="26" ry="7" fill="#2a2118" opacity="0.35"/>
    <!-- cloak -->
    <path d="M18 112 L24 58 L32 48 L40 44 L48 48 L56 58 L62 112 L50 118 L40 114 L30 118 Z" fill="${cloak}"/>
    <path d="M28 70 L40 90 L52 70" fill="#2a2118" opacity="0.25"/>
    <!-- hood -->
    <path d="M26 48 Q40 28 54 48 L48 58 Q40 52 32 58 Z" fill="#2a2118"/>
    <ellipse cx="40" cy="52" rx="10" ry="11" fill="#e8d5b0"/>
    <!-- staff -->
    <rect x="58" y="40" width="4" height="72" rx="1" fill="#8b6914"/>
    <path d="M54 38 L66 38 L60 28 Z" fill="#3de7ff" opacity="0.9"/>
    <circle cx="60" cy="34" r="5" fill="#66e0ff" opacity="0.55"/>
    <!-- belt amber -->
    <rect x="30" y="78" width="20" height="5" rx="1" fill="#c4a882"/>
  </g>`;
}

function damagedFountain(cx, cy) {
  return `
  <ellipse cx="${cx}" cy="${cy + 40}" rx="90" ry="22" fill="#5a8a9a" opacity="0.55"/>
  <path d="M${cx - 70} ${cy + 40} L${cx - 55} ${cy - 40} L${cx + 55} ${cy - 40} L${cx + 70} ${cy + 40} Z" fill="#c4a882"/>
  <path d="M${cx - 40} ${cy - 40} L${cx - 30} ${cy - 100} L${cx + 30} ${cy - 100} L${cx + 40} ${cy - 40} Z" fill="#d4c4a8"/>
  <ellipse cx="${cx}" cy="${cy - 100}" rx="38" ry="10" fill="#e8d5b0"/>
  <circle cx="${cx}" cy="${cy - 130}" r="14" fill="#3de7ff" opacity="0.9"/>
  <path d="M${cx} ${cy - 145} Q${cx - 12} ${cy - 165} ${cx} ${cy - 180} Q${cx + 12} ${cy - 165} ${cx} ${cy - 145}" fill="#66e0ff" opacity="0.7"/>
  <!-- cracks -->
  <path d="M${cx - 20} ${cy - 20} L${cx - 8} ${cy + 10} L${cx - 28} ${cy + 30}" stroke="#2a2118" stroke-width="3" fill="none" opacity="0.45"/>
  <path d="M${cx + 25} ${cy - 50} L${cx + 35} ${cy - 10}" stroke="#2a2118" stroke-width="2.5" fill="none" opacity="0.4"/>
  <path d="M${cx - 55} ${cy + 10} L${cx - 80} ${cy + 50}" stroke="#3de7ff" stroke-width="2" fill="none" opacity="0.5"/>`;
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

/** Spark faces a cyan rift storm — heroic companion poster */
function posterSpark(sizeMeta, viewW, viewH) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sizeMeta.w}" height="${sizeMeta.h}" viewBox="0 0 ${viewW} ${viewH}">
  <defs>
    ${sharedDefs()}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#0a1220"/><stop offset="0.4" stop-color="#1a2840"/><stop offset="0.75" stop-color="#3a3028"/><stop offset="1" stop-color="#5a4030"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#2f5a3a"/><stop offset="1" stop-color="#1a3020"/>
    </linearGradient>
  </defs>
  <rect width="${viewW}" height="${viewH}" fill="url(#sky)"/>
  <rect width="${viewW}" height="${viewH}" fill="url(#amberGlow)" opacity="0.7"/>
  <!-- storm clouds -->
  <ellipse cx="${viewW * 0.2}" cy="${viewH * 0.18}" rx="140" ry="50" fill="#0e1828" opacity="0.7"/>
  <ellipse cx="${viewW * 0.75}" cy="${viewH * 0.14}" rx="160" ry="55" fill="#121c30" opacity="0.75"/>
  ${riftTear(viewW * 0.72, viewH * 0.38, viewH * 0.42, 28)}
  <!-- cracked ground -->
  <path d="M0 ${viewH * 0.72} Q${viewW * 0.3} ${viewH * 0.65} ${viewW * 0.5} ${viewH * 0.7} Q${viewW * 0.75} ${viewH * 0.78} ${viewW} ${viewH * 0.68} L${viewW} ${viewH} L0 ${viewH} Z" fill="url(#ground)"/>
  <path d="M${viewW * 0.35} ${viewH * 0.72} L${viewW * 0.42} ${viewH * 0.85} L${viewW * 0.38} ${viewH * 0.95}" stroke="#3de7ff" stroke-width="3" fill="none" opacity="0.55"/>
  <path d="M${viewW * 0.55} ${viewH * 0.74} L${viewW * 0.62} ${viewH * 0.9}" stroke="#2a2118" stroke-width="4" fill="none" opacity="0.4"/>
  ${keeperSilhouette(viewW * 0.12, viewH * 0.58, 1.1, "#3a4858")}
  <g transform="translate(${viewW / 2 - 160},${viewH * 0.32}) scale(1.55)">
    ${CHAR.spark}
  </g>
  <!-- bronze title plate -->
  <rect x="${viewW * 0.12}" y="${viewH * 0.82}" width="${viewW * 0.76}" height="${viewH * 0.12}" rx="10" fill="#1a1510" opacity="0.72" stroke="#c4a882" stroke-width="2"/>
  <text x="${viewW / 2}" y="${viewH * 0.1}" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#ffb84d" letter-spacing="8">RIFTWILDS</text>
  <text x="${viewW / 2}" y="${viewH * 0.875}" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#f3efe6" font-weight="700">Spark's Stand</text>
  <text x="${viewW / 2}" y="${viewH * 0.915}" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#e8d5b0">Glowpup · Heroic companion against the rift</text>
  <text x="${viewW / 2}" y="${viewH * 0.96}" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#c4a882">300 DPI print · Personal use · Not for resale</text>
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
      <stop stop-color="#0c1524"/><stop offset="0.45" stop-color="#243848"/><stop offset="1" stop-color="#4a3828"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#cyanGlow)" opacity="0.6"/>
  <ellipse cx="180" cy="160" rx="160" ry="55" fill="#0a1220" opacity="0.65"/>
  <ellipse cx="680" cy="120" rx="180" ry="60" fill="#0e1828" opacity="0.7"/>
  ${riftTear(620, 320, 340, 32)}
  <!-- hills / plaza -->
  <path d="M0 620 Q200 540 380 580 Q560 500 720 560 Q800 530 850 580 L850 1100 L0 1100 Z" fill="#3d6a42"/>
  <path d="M0 720 Q240 660 450 720 Q650 780 850 700 L850 1100 L0 1100 Z" fill="#2f5a3a"/>
  <!-- sandstone plaza floor -->
  <ellipse cx="400" cy="700" rx="220" ry="50" fill="#c4a882" opacity="0.55"/>
  ${damagedFountain(400, 620)}
  ${timberStall(80, 580, true)}
  ${timberStall(680, 560, true)}
  ${keeperSilhouette(100, 640, 0.95, "#3a5068")}
  ${keeperSilhouette(620, 650, 0.9, "#4a3a28")}
  <g transform="translate(200,720) scale(0.58)">${CHAR.spark}</g>
  <g transform="translate(500,730) scale(0.52)">${CHAR.mossprig}</g>
  <rect x="80" y="900" width="690" height="120" rx="10" fill="#1a1510" opacity="0.75" stroke="#c4a882" stroke-width="2"/>
  <text x="425" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#ffb84d" letter-spacing="7">RIFTWILDS</text>
  <text x="425" y="950" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#f3efe6" font-weight="700">Commons Under Threat</text>
  <text x="425" y="990" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#e8d5b0">Keepers hold the plaza as the rift cracks stone</text>
  <text x="425" y="1055" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#c4a882">300 DPI print · US Letter · Personal use · Not for resale</text>
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
      <stop stop-color="#0a1830"/><stop offset="0.5" stop-color="#1a3048"/><stop offset="1" stop-color="#2a4030"/>
    </linearGradient>
    <radialGradient id="nestglow" cx="50%" cy="52%" r="40%">
      <stop stop-color="#3de7ff" stop-opacity="0.4"/><stop offset="0.6" stop-color="#ffb84d" stop-opacity="0.15"/><stop offset="1" stop-color="#3de7ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${auroraBands(W, H)}
  <rect width="${W}" height="${H}" fill="url(#nestglow)"/>
  <!-- timber hatchery arch -->
  <path d="M180 780 Q180 420 425 380 Q670 420 670 780" fill="none" stroke="#8b5a3c" stroke-width="18"/>
  <path d="M200 780 Q200 440 425 405 Q650 440 650 780" fill="none" stroke="#c4a882" stroke-width="6" opacity="0.6"/>
  <!-- nest -->
  <ellipse cx="425" cy="740" rx="200" ry="55" fill="#3d6a42" opacity="0.7"/>
  <path d="M240 720 Q320 640 400 720 Q425 680 450 720 Q530 640 610 720" fill="#5aad62" opacity="0.55"/>
  <path d="M260 750 Q340 690 425 755 Q510 690 590 750" fill="#2f5a3a" opacity="0.65"/>
  <!-- eggs -->
  <ellipse cx="360" cy="620" rx="48" ry="68" fill="#e8d5b0"/>
  <ellipse cx="360" cy="620" rx="38" ry="54" fill="#f3efe6"/>
  <path d="M340 590c14-6 28 2 34 14" stroke="#3de7ff" stroke-width="4" fill="none"/>
  <path d="M360 560 L368 578 L360 586 L352 578 Z" fill="#ffb84d"/>
  <ellipse cx="490" cy="640" rx="40" ry="56" fill="#d4bc8e"/>
  <ellipse cx="490" cy="640" rx="32" ry="44" fill="#e8d5b0"/>
  <path d="M475 615c10-4 22 2 26 12" stroke="#3de7ff" stroke-width="3" fill="none"/>
  <g transform="translate(520,680) scale(0.45)">${CHAR.spark}</g>
  ${keeperSilhouette(140, 680, 0.85, "#3a4858")}
  <circle cx="200" cy="200" r="2.5" fill="#fff" opacity="0.8"/>
  <circle cx="620" cy="180" r="2" fill="#3de7ff" opacity="0.9"/>
  <circle cx="720" cy="260" r="2.5" fill="#ffb84d" opacity="0.8"/>
  <circle cx="140" cy="280" r="2" fill="#7dffc0" opacity="0.75"/>
  <rect x="80" y="900" width="690" height="120" rx="10" fill="#1a1510" opacity="0.75" stroke="#c4a882" stroke-width="2"/>
  <text x="425" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#3de7ff" letter-spacing="7">RIFTWILDS</text>
  <text x="425" y="950" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#f3efe6" font-weight="700">Hatchery Aurora</text>
  <text x="425" y="990" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#e8d5b0">Eggs wait under riftlight — care before the storm</text>
  <text x="425" y="1055" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#c4a882">300 DPI print · US Letter · Personal use · Not for resale</text>
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
  return `
  ${ornateFrame(0, 0, 240, 336, accent)}
  <!-- art window -->
  <rect x="22" y="22" width="196" height="168" rx="8" fill="#1a2744"/>
  <rect x="22" y="22" width="196" height="168" rx="8" fill="url(#cyanGlow)" opacity="0.5"/>
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
  <rect width="${W}" height="${H}" fill="url(#c-amberGlow)" opacity="0.8"/>
  ${riftTear(380, 220, 260, 22)}
  <path d="M0 480 Q200 420 350 460 Q450 500 500 440 L500 700 L0 700 Z" fill="#2f5a3a"/>
  <g transform="translate(110, 80) scale(1.35)">${CHAR.spark}</g>
  ${keeperSilhouette(40, 380, 0.7)}`;
}

function circusCardScene(W, H) {
  return `
  <rect width="${W}" height="${H}" fill="url(#c-cyanGlow)" opacity="0.5"/>
  ${circusTent(250, 280, 0.85, true)}
  <g transform="translate(60, 380) scale(0.55)">${CHAR.bubbloon}</g>
  <g transform="translate(320, 390) scale(0.5)">${CHAR.spark}</g>
  ${keeperSilhouette(400, 360, 0.65, "#4a3020")}`;
}

function circusInvite() {
  const W = 850;
  const H = 1100;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER.w}" height="${LETTER.h}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${sharedDefs()}
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop stop-color="#121018"/><stop offset="0.5" stop-color="#2a2018"/><stop offset="1" stop-color="#5a3020"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#amberGlow)" opacity="0.45"/>
  ${circusTent(425, 380, 1.15, true)}
  ${riftTear(680, 280, 220, 22)}
  <ellipse cx="140" cy="340" rx="22" ry="28" fill="#3de7ff" opacity="0.75"/>
  <ellipse cx="720" cy="300" rx="20" ry="26" fill="#ffe566" opacity="0.8"/>
  <g transform="translate(300,720) scale(0.65)">${CHAR.spark}</g>
  ${keeperSilhouette(160, 700, 0.85)}
  ${keeperSilhouette(620, 710, 0.8, "#4a3028")}
  <text x="425" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#ffb84d" letter-spacing="6">YOU'RE INVITED</text>
  <text x="425" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="#f3efe6" font-weight="700">Traveling Circus</text>
  <text x="425" y="158" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#e8d5b0">Celebrate under the big top — Keepers welcome</text>
  <rect x="160" y="900" width="530" height="110" rx="10" fill="rgba(18,16,12,0.75)" stroke="#c4a882" stroke-width="2"/>
  <text x="425" y="942" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#e8d5b0">Date: ____________________</text>
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
    theme: "warm-fantasy-rift-energy",
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
