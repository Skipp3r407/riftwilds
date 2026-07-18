/**
 * Procedural comic page atmospheres (original IP, warm fantasy + cyan/amber).
 * Generates unique illustrated page plates per issue so the reader never ships empty.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "public/assets/comics/pages");

const ISSUES = [
  { slug: "the-first-rift", hue: [28, 55, 72], accent: [61, 231, 255] },
  { slug: "sparks-journey", hue: [45, 90, 55], accent: [255, 184, 77] },
  { slug: "the-traveling-circus", hue: [120, 55, 40], accent: [255, 122, 61] },
  { slug: "the-lost-city", hue: [90, 75, 55], accent: [102, 224, 255] },
  { slug: "the-storm-king", hue: [20, 35, 70], accent: [61, 155, 255] },
  { slug: "the-merchants-secret", hue: [40, 28, 22], accent: [255, 184, 77] },
  { slug: "the-great-hunt", hue: [35, 80, 45], accent: [90, 200, 120] },
  { slug: "the-last-guardian", hue: [55, 50, 45], accent: [61, 231, 255] },
  { slug: "festival-of-lights", hue: [25, 30, 55], accent: [255, 184, 77] },
  { slug: "the-shadow-beyond", hue: [12, 18, 40], accent: [100, 80, 140] },
];

const PAGE_COUNT = 24;
const W = 1200;
const H = 1600;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function hash(i, salt) {
  let x = (i * 374761393 + salt * 668265263) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return (x >>> 0) / 4294967296;
}

function svgFor(issue, pageIndex) {
  const { hue, accent } = issue;
  const t = hash(pageIndex, 7);
  const t2 = hash(pageIndex, 19);
  const t3 = hash(pageIndex, 41);
  const [r, g, b] = hue;
  const [ar, ag, ab] = accent;
  const cx = 200 + t * 800;
  const cy = 300 + t2 * 1000;
  const r1 = 280 + t3 * 420;
  const panelY = 180 + Math.floor(t * 40);
  const ink = `rgba(${clamp(r - 10, 0, 255)},${clamp(g - 15, 0, 255)},${clamp(b - 20, 0, 255)},0.55)`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="rgb(${clamp(r + 40, 0, 255)},${clamp(g + 35, 0, 255)},${clamp(b + 25, 0, 255)})"/>
      <stop offset="55%" stop-color="rgb(${r},${g},${b})"/>
      <stop offset="100%" stop-color="rgb(${clamp(r - 18, 0, 40)},${clamp(g - 12, 0, 35)},${clamp(b - 8, 0, 50)})"/>
    </radialGradient>
    <radialGradient id="rift" cx="${(cx / W) * 100}%" cy="${(cy / H) * 100}%" r="35%">
      <stop offset="0%" stop-color="rgba(${ar},${ag},${ab},0.55)"/>
      <stop offset="100%" stop-color="rgba(${ar},${ag},${ab},0)"/>
    </radialGradient>
    <linearGradient id="hearth" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(255,184,77,0.25)"/>
      <stop offset="100%" stop-color="rgba(255,184,77,0)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#rift)"/>
  <rect width="${W}" height="${H}" fill="url(#hearth)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${r1}" ry="${r1 * 0.55}" fill="rgba(${ar},${ag},${ab},0.12)"/>
  <path d="M80 ${panelY} H1120 V${panelY + 380} H80 Z" fill="none" stroke="${ink}" stroke-width="8"/>
  <path d="M80 ${panelY + 420} H540 V${panelY + 900} H80 Z" fill="none" stroke="${ink}" stroke-width="7"/>
  <path d="M580 ${panelY + 420} H1120 V${panelY + 900} H580 Z" fill="none" stroke="${ink}" stroke-width="7"/>
  <path d="M80 ${panelY + 940} H1120 V${H - 120} H80 Z" fill="none" stroke="${ink}" stroke-width="8"/>
  <circle cx="${200 + t2 * 800}" cy="${1200 + t * 200}" r="${40 + t3 * 50}" fill="rgba(255,184,77,0.35)"/>
  <circle cx="${900 - t * 400}" cy="${500 + t2 * 200}" r="${30 + t * 40}" fill="rgba(${ar},${ag},${ab},0.4)"/>
  <text x="60" y="${H - 48}" font-family="Georgia, serif" font-size="28" fill="rgba(232,213,176,0.45)">Legends of the Rift · p${String(pageIndex + 1).padStart(2, "0")}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const issue of ISSUES) {
    const dir = path.join(OUT, issue.slug);
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const svg = Buffer.from(svgFor(issue, i));
      const file = path.join(dir, `page-${String(i + 1).padStart(2, "0")}.webp`);
      await sharp(svg).webp({ quality: 82 }).toFile(file);
    }
    console.log(`wrote ${PAGE_COUNT} pages for ${issue.slug}`);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
