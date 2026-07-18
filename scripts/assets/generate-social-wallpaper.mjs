/**
 * Social Hub atmospheric wallpaper — Commons plaza / gathering / rift lanterns.
 * Local procedural SVG → PNG/WebP. No API keys.
 *
 * Run: node scripts/assets/generate-social-wallpaper.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = path.join(ROOT, "public/assets/ui/wallpapers");
const W = 1920;
const H = 1080;

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

function hangingLanterns(id, amber, cyan) {
  let out = "";
  const xs = [220, 420, 680, 960, 1240, 1500, 1700];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i] + ((hash(`${id}-lan-${i}`) % 36) - 18);
    const drop = 90 + (hash(`${id}-drop-${i}`) % 100);
    const tone = i % 3 === 1 ? cyan : amber;
    out += `
      <line x1="${x}" y1="0" x2="${x}" y2="${drop}" stroke="#1a2233" stroke-width="2.5" opacity="0.7"/>
      <ellipse cx="${x}" cy="${drop + 26}" rx="16" ry="24" fill="#1a1410" stroke="${tone}" stroke-width="2" opacity="0.92"/>
      <ellipse cx="${x}" cy="${drop + 26}" rx="9" ry="13" fill="${tone}" opacity="0.55"/>
      <circle cx="${x}" cy="${drop + 26}" r="42" fill="${tone}" opacity="0.11"/>
    `;
  }
  return out;
}

function crowdSilhouettes() {
  // Soft keeper silhouettes along the plaza — reading as gathering, not characters.
  const spots = [
    [280, 780],
    [360, 790],
    [520, 770],
    [700, 785],
    [860, 775],
    [1020, 788],
    [1180, 772],
    [1340, 790],
    [1520, 778],
    [1640, 785],
  ];
  return spots
    .map(([x, y], i) => {
      const h = 48 + (i % 4) * 6;
      return `
      <ellipse cx="${x}" cy="${y}" rx="14" ry="8" fill="#050810" opacity="0.55"/>
      <rect x="${x - 8}" y="${y - h}" width="16" height="${h}" rx="7" fill="#0a1220" opacity="0.72"/>
      <circle cx="${x}" cy="${y - h - 6}" r="9" fill="#0c1628" opacity="0.75"/>
      <circle cx="${x + 2}" cy="${y - h - 4}" r="2" fill="${i % 2 ? "#3de7ff" : "#ffb84d"}" opacity="0.35"/>
    `;
    })
    .join("");
}

function sceneCommonsPlaza() {
  const cyan = "#3de7ff";
  const amber = "#ffb84d";
  const navy = "#070b16";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a1428"/>
      <stop offset="45%" stop-color="#0c1830"/>
      <stop offset="100%" stop-color="${navy}"/>
    </linearGradient>
    <radialGradient id="rift" cx="72%" cy="18%" r="38%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.55"/>
      <stop offset="40%" stop-color="#2a7dff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="amberGlow" cx="28%" cy="22%" r="32%">
      <stop offset="0%" stop-color="${amber}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="plaza" cx="50%" cy="78%" r="42%">
      <stop offset="0%" stop-color="${cyan}" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="${amber}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="stone" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#121c30" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0a101c" stop-opacity="0.85"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M32 28 V36 M28 32 H36" stroke="#e8f0ff" stroke-opacity="0.045" stroke-width="1.4"/>
    </pattern>
    <radialGradient id="ui-hole" cx="50%" cy="40%" r="62%">
      <stop offset="0%" stop-color="${navy}" stop-opacity="0.2"/>
      <stop offset="55%" stop-color="${navy}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0.42"/>
    </radialGradient>
    <linearGradient id="ui-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${navy}" stop-opacity="0.05"/>
      <stop offset="65%" stop-color="${navy}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0.52"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#sky)"/>
  <rect width="100%" height="100%" fill="url(#rift)" filter="url(#soft)"/>
  <rect width="100%" height="100%" fill="url(#amberGlow)" filter="url(#soft)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>

  <!-- Distant arcade / hall silhouettes -->
  <path d="M0 520 L180 360 L320 520 Z" fill="#101828" opacity="0.7"/>
  <path d="M1600 510 L1760 340 L1920 520 Z" fill="#101828" opacity="0.7"/>
  <rect x="360" y="300" width="90" height="280" fill="#142033" opacity="0.65"/>
  <rect x="480" y="260" width="70" height="320" fill="#152438" opacity="0.6"/>
  <rect x="1370" y="270" width="80" height="310" fill="#142033" opacity="0.62"/>
  <rect x="1480" y="300" width="95" height="280" fill="#152438" opacity="0.58"/>

  <!-- Soft arch suggestions -->
  <path d="M200 540 Q480 380 760 540" fill="none" stroke="${cyan}" stroke-width="3" opacity="0.16"/>
  <path d="M1160 540 Q1440 370 1720 540" fill="none" stroke="${amber}" stroke-width="3" opacity="0.14"/>

  ${hangingLanterns("social", amber, cyan)}

  <!-- Plaza floor -->
  <path d="M0 680 Q480 620 960 660 T1920 640 L1920 1080 L0 1080 Z" fill="url(#stone)"/>
  <ellipse cx="960" cy="780" rx="620" ry="160" fill="url(#plaza)" filter="url(#soft)"/>
  <ellipse cx="960" cy="790" rx="280" ry="70" fill="none" stroke="${cyan}" stroke-width="2" opacity="0.22"/>
  <ellipse cx="960" cy="790" rx="140" ry="34" fill="${amber}" opacity="0.1"/>

  <!-- Central fountain hint -->
  <ellipse cx="960" cy="760" rx="70" ry="22" fill="#0e1a28" opacity="0.85"/>
  <rect x="948" y="680" width="24" height="80" rx="8" fill="#162438" opacity="0.8"/>
  <circle cx="960" cy="668" r="18" fill="${cyan}" opacity="0.28"/>
  <circle cx="960" cy="668" r="8" fill="${amber}" opacity="0.4"/>

  ${crowdSilhouettes()}
  ${dust("social", 70, cyan, 0.32)}
  ${dust("social-a", 40, amber, 0.26)}

  <!-- UI readability scrims -->
  <rect width="100%" height="100%" fill="url(#ui-hole)"/>
  <rect width="100%" height="100%" fill="url(#ui-bottom)"/>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svg = sceneCommonsPlaza();
  const svgPath = path.join(OUT_DIR, "social.svg");
  const pngPath = path.join(OUT_DIR, "social.png");
  const webpPath = path.join(OUT_DIR, "social.webp");

  fs.writeFileSync(svgPath, svg);
  const buf = Buffer.from(svg);
  await sharp(buf).png().toFile(pngPath);
  await sharp(buf).webp({ quality: 90 }).toFile(webpPath);
  console.log(`wrote ${svgPath}`);
  console.log(`wrote ${pngPath}`);
  console.log(`wrote ${webpPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
