/**
 * Procedural comic page / splash art (sharp SVG → PNG).
 * Complements AI covers. Draws character silhouettes + scenery so pages
 * never read as a lone cyan diamond placeholder.
 *
 * Usage:
 *   node scripts/comics/generate-comic-art.mjs
 *   node scripts/comics/generate-comic-art.mjs --force
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../public/assets/comics");
const force = process.argv.includes("--force");

const ATMOS = {
  dawn: { a: "#2a3a28", b: "#c4a882", c: "#3de7ff", d: "#ffb84d", ground: "#3a2820" },
  day: { a: "#2f5a3a", b: "#5aad62", c: "#3de7ff", d: "#ffe566", ground: "#2a2118" },
  dusk: { a: "#3a2820", b: "#8b5a3c", c: "#ffb84d", d: "#3de7ff", ground: "#1a1510" },
  night: { a: "#0a1830", b: "#1a2840", c: "#3de7ff", d: "#ffc070", ground: "#0a0c12" },
  rift: { a: "#121a28", b: "#2a2118", c: "#66e0ff", d: "#ffb84d", ground: "#14110e" },
  festival: { a: "#1a2030", b: "#3a2820", c: "#ffb84d", d: "#3de7ff", ground: "#1a1510" },
  storm: { a: "#1a2438", b: "#3d4a60", c: "#b8d4ff", d: "#ffb84d", ground: "#121820" },
  ruin: { a: "#2a2118", b: "#5c3d2e", c: "#c4a882", d: "#3de7ff", ground: "#1a1210" },
};

function figure(cx, cy, scale, fill, accent) {
  const s = scale;
  return `
    <g opacity="0.92">
      <ellipse cx="${cx}" cy="${cy + 38 * s}" rx="${18 * s}" ry="${6 * s}" fill="#0a0806" opacity="0.35"/>
      <ellipse cx="${cx}" cy="${cy - 22 * s}" rx="${11 * s}" ry="${13 * s}" fill="${fill}"/>
      <path d="M${cx - 14 * s} ${cy - 8 * s} Q ${cx} ${cy + 28 * s} ${cx + 14 * s} ${cy - 8 * s}
               L${cx + 10 * s} ${cy + 36 * s} Q ${cx} ${cy + 42 * s} ${cx - 10 * s} ${cy + 36 * s} Z"
            fill="${fill}"/>
      <circle cx="${cx - 3 * s}" cy="${cy - 24 * s}" r="${1.6 * s}" fill="${accent}" opacity="0.8"/>
      <circle cx="${cx + 3 * s}" cy="${cy - 24 * s}" r="${1.6 * s}" fill="${accent}" opacity="0.8"/>
    </g>`;
}

function egg(cx, cy, scale, shell, glow) {
  const s = scale;
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${10 * s}" ry="${13 * s}" fill="${shell}"/>
    <ellipse cx="${cx - 2 * s}" cy="${cy - 3 * s}" rx="${3 * s}" ry="${4 * s}" fill="${glow}" opacity="0.45"/>
    <ellipse cx="${cx}" cy="${cy + 14 * s}" rx="${8 * s}" ry="${2.5 * s}" fill="#0a0806" opacity="0.25"/>
  `;
}

function svgArt(w, h, colors, motif = "rift") {
  const { a, b, c, d, ground } = colors;
  const left = figure(w * 0.32, h * 0.58, w / 900, "#e8d5b0", c);
  const right = figure(w * 0.68, h * 0.56, w / 950, "#c4a882", d);
  const heldEgg = egg(w * 0.38, h * 0.62, w / 900, "#f5ead2", c);

  let motifExtra = "";
  if (motif === "circus") {
    motifExtra = `
      <ellipse cx="${w * 0.5}" cy="${h * 0.72}" rx="${w * 0.28}" ry="${h * 0.08}" fill="${d}" opacity="0.35"/>
      <rect x="${w * 0.42}" y="${h * 0.28}" width="${w * 0.16}" height="${h * 0.22}" rx="6" fill="${c}" opacity="0.35"/>
      <path d="M${w * 0.35} ${h * 0.28} L${w * 0.5} ${h * 0.18} L${w * 0.65} ${h * 0.28}" fill="${d}" opacity="0.5"/>
    `;
  } else if (motif === "forest") {
    motifExtra = `
      <path d="M${w * 0.12} ${h * 0.7} L${w * 0.18} ${h * 0.35} L${w * 0.24} ${h * 0.7} Z" fill="#1a3020" opacity="0.7"/>
      <path d="M${w * 0.78} ${h * 0.72} L${w * 0.86} ${h * 0.3} L${w * 0.94} ${h * 0.72} Z" fill="#243828" opacity="0.65"/>
      <circle cx="${w * 0.55}" cy="${h * 0.42}" r="${Math.min(w, h) * 0.04}" fill="${c}" opacity="0.35"/>
    `;
  } else {
    // Soft rift glow — not a giant diamond dominating the page
    motifExtra = `
      <ellipse cx="${w * 0.5}" cy="${h * 0.36}" rx="${w * 0.16}" ry="${h * 0.22}" fill="${c}" opacity="0.18"/>
      <path d="M${w * 0.5} ${h * 0.22} Q ${w * 0.54} ${h * 0.4} ${w * 0.5} ${h * 0.55}
               Q ${w * 0.46} ${h * 0.4} ${w * 0.5} ${h * 0.22} Z" fill="${c}" opacity="0.4"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="45%" stop-color="${b}"/>
      <stop offset="100%" stop-color="${ground}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="48%">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="${d}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <path d="M0 ${h * 0.62} Q ${w * 0.25} ${h * 0.55} ${w * 0.5} ${h * 0.6} T ${w} ${h * 0.58} V ${h} H0 Z" fill="${ground}" opacity="0.75"/>
  <path d="M0 ${h * 0.72} Q ${w * 0.3} ${h * 0.66} ${w * 0.55} ${h * 0.74} T ${w} ${h * 0.7} V ${h} H0 Z" fill="#0a0806" opacity="0.4"/>
  ${motifExtra}
  ${left}
  ${heldEgg}
  ${right}
  <circle cx="${w * 0.18}" cy="${h * 0.18}" r="${Math.min(w, h) * 0.018}" fill="${d}" opacity="0.75"/>
  <circle cx="${w * 0.84}" cy="${h * 0.15}" r="${Math.min(w, h) * 0.012}" fill="${c}" opacity="0.7"/>
  <!-- Panel border like a printed comic page -->
  <rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="none" stroke="${d}" stroke-opacity="0.35" stroke-width="4" rx="8"/>
</svg>`;
}

const jobs = [
  { file: "splashes/spark-path.png", w: 1200, h: 1600, atm: "day", motif: "forest" },
  { file: "splashes/storm-king.png", w: 1200, h: 1600, atm: "storm", motif: "rift" },
  { file: "splashes/merchant-night.png", w: 1200, h: 1600, atm: "night", motif: "rift" },
  { file: "splashes/great-hunt.png", w: 1200, h: 1600, atm: "dawn", motif: "forest" },
  { file: "splashes/last-guardian.png", w: 1200, h: 1600, atm: "ruin", motif: "rift" },
  { file: "splashes/shadow-beyond.png", w: 1200, h: 1600, atm: "rift", motif: "rift" },
  { file: "pages/key-commons.png", w: 1200, h: 1600, atm: "dusk", motif: "rift" },
  { file: "pages/key-forest.png", w: 1200, h: 1600, atm: "dawn", motif: "forest" },
  { file: "pages/key-festival.png", w: 1200, h: 1600, atm: "festival", motif: "circus" },
  { file: "pages/key-rift.png", w: 1200, h: 1600, atm: "rift", motif: "rift" },
  { file: "bonus/wallpaper-commons.png", w: 1920, h: 1080, atm: "festival", motif: "circus" },
  { file: "bonus/wallpaper-rift.png", w: 1920, h: 1080, atm: "rift", motif: "rift" },
  { file: "frames/open-book-matte.png", w: 1600, h: 1100, atm: "dusk", motif: "rift", bookMatte: true },
];

function bookMatteSvg(w, h, colors) {
  const { a, b, d, ground } = colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="leather" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3a2820"/>
      <stop offset="50%" stop-color="#2a2118"/>
      <stop offset="100%" stop-color="#1a1510"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#leather)"/>
  <rect x="40" y="36" width="${w - 80}" height="${h - 72}" rx="18" fill="${ground}" stroke="${d}" stroke-opacity="0.4" stroke-width="6"/>
  <rect x="70" y="60" width="${w - 140}" height="${h - 120}" rx="8" fill="${b}" opacity="0.15"/>
  <rect x="${w / 2 - 6}" y="50" width="12" height="${h - 100}" fill="#5c3d2e"/>
  <text x="${w / 2}" y="${h - 28}" text-anchor="middle" fill="${d}" font-family="Georgia, serif" font-size="22" opacity="0.55">Legends of the Rift</text>
  <rect width="${w}" height="${h}" fill="${a}" opacity="0.08"/>
</svg>`;
}

async function main() {
  for (const job of jobs) {
    const out = path.join(root, job.file);
    mkdirSync(path.dirname(out), { recursive: true });
    if (existsSync(out) && !force) {
      console.log("skip", job.file);
      continue;
    }
    const colors = ATMOS[job.atm];
    const svg = job.bookMatte
      ? bookMatteSvg(job.w, job.h, colors)
      : svgArt(job.w, job.h, colors, job.motif);
    await sharp(Buffer.from(svg)).png().toFile(out);
    console.log("wrote", job.file);
  }

  // Tiny manifest for audits
  writeFileSync(
    path.join(root, "GENERATION_NOTES.md"),
    `# Comics art\n\n- Covers: AI GenerateImage (original IP)\n- Extra splashes/pages: procedural sharp SVG→PNG (this script)\n- Run with \`--force\` to regenerate procedural pages (character silhouettes + scenery)\n- All PAGE_ART / SPLASH paths in src/content/comics/art.ts must exist under public/\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
