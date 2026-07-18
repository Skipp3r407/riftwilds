/**
 * Procedural comic splash / key-page art (sharp SVG → PNG).
 * Complements AI covers already in public/assets/comics/covers.
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../public/assets/comics");

const ATMOS = {
  dawn: { a: "#2a3a28", b: "#c4a882", c: "#3de7ff", d: "#ffb84d" },
  day: { a: "#2f5a3a", b: "#5aad62", c: "#3de7ff", d: "#ffe566" },
  dusk: { a: "#3a2820", b: "#8b5a3c", c: "#ffb84d", d: "#3de7ff" },
  night: { a: "#0a1830", b: "#1a2840", c: "#3de7ff", d: "#ffc070" },
  rift: { a: "#121a28", b: "#2a2118", c: "#66e0ff", d: "#ffb84d" },
  festival: { a: "#1a2030", b: "#3a2820", c: "#ffb84d", d: "#3de7ff" },
  storm: { a: "#1a2438", b: "#3d4a60", c: "#b8d4ff", d: "#ffb84d" },
  ruin: { a: "#2a2118", b: "#5c3d2e", c: "#c4a882", d: "#3de7ff" },
};

function svgArt(w, h, colors, motif = "rift") {
  const { a, b, c, d } = colors;
  const crystal =
    motif === "circus"
      ? `<ellipse cx="${w * 0.5}" cy="${h * 0.72}" rx="${w * 0.28}" ry="${h * 0.08}" fill="${d}" opacity="0.35"/>
         <rect x="${w * 0.35}" y="${h * 0.4}" width="${w * 0.08}" height="${h * 0.32}" rx="4" fill="${c}" opacity="0.5"/>
         <rect x="${w * 0.55}" y="${h * 0.38}" width="${w * 0.08}" height="${h * 0.34}" rx="4" fill="${d}" opacity="0.45"/>`
      : `<polygon points="${w * 0.5},${h * 0.28} ${w * 0.62},${h * 0.55} ${w * 0.5},${h * 0.72} ${w * 0.38},${h * 0.55}" fill="${c}" opacity="0.55"/>
         <ellipse cx="${w * 0.5}" cy="${h * 0.78}" rx="${w * 0.22}" ry="${h * 0.06}" fill="${d}" opacity="0.3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="55%" stop-color="${b}"/>
      <stop offset="100%" stop-color="${a}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.55"/>
      <stop offset="70%" stop-color="${d}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <path d="M0 ${h * 0.7} Q ${w * 0.25} ${h * 0.62} ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.65} V ${h} H0 Z" fill="#2a2118" opacity="0.55"/>
  <path d="M0 ${h * 0.78} Q ${w * 0.3} ${h * 0.72} ${w * 0.55} ${h * 0.8} T ${w} ${h * 0.76} V ${h} H0 Z" fill="#1a1510" opacity="0.45"/>
  ${crystal}
  <circle cx="${w * 0.18}" cy="${h * 0.22}" r="${Math.min(w, h) * 0.03}" fill="${d}" opacity="0.7"/>
  <circle cx="${w * 0.82}" cy="${h * 0.18}" r="${Math.min(w, h) * 0.02}" fill="${c}" opacity="0.65"/>
</svg>`;
}

const jobs = [
  { file: "splashes/spark-path.png", w: 1600, h: 900, atm: "day", motif: "rift" },
  { file: "splashes/storm-king.png", w: 1600, h: 900, atm: "storm", motif: "rift" },
  { file: "splashes/merchant-night.png", w: 1600, h: 900, atm: "night", motif: "rift" },
  { file: "splashes/great-hunt.png", w: 1600, h: 900, atm: "dawn", motif: "rift" },
  { file: "splashes/last-guardian.png", w: 1600, h: 900, atm: "ruin", motif: "rift" },
  { file: "splashes/shadow-beyond.png", w: 1600, h: 900, atm: "rift", motif: "rift" },
  { file: "pages/key-commons.png", w: 1200, h: 1600, atm: "day", motif: "rift" },
  { file: "pages/key-forest.png", w: 1200, h: 1600, atm: "dawn", motif: "rift" },
  { file: "pages/key-festival.png", w: 1200, h: 1600, atm: "festival", motif: "circus" },
  { file: "pages/key-rift.png", w: 1200, h: 1600, atm: "rift", motif: "rift" },
  { file: "bonus/wallpaper-commons.png", w: 1920, h: 1080, atm: "festival", motif: "circus" },
  { file: "bonus/wallpaper-rift.png", w: 1920, h: 1080, atm: "rift", motif: "rift" },
];

async function main() {
  for (const job of jobs) {
    const out = path.join(root, job.file);
    mkdirSync(path.dirname(out), { recursive: true });
    if (existsSync(out)) {
      console.log("skip", job.file);
      continue;
    }
    const svg = svgArt(job.w, job.h, ATMOS[job.atm], job.motif);
    await sharp(Buffer.from(svg)).png().toFile(out);
    console.log("wrote", job.file);
  }
  writeFileSync(
    path.join(root, "GENERATION_NOTES.md"),
    `# Comics art\n\n- Covers: AI GenerateImage (original IP)\n- Extra splashes/pages: procedural sharp SVG→PNG (this script)\n- Reuses region/story art as additional page backgrounds in content\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
