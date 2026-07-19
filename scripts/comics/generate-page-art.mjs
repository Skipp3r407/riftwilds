/**
 * Unique illustrated page plates per issue so the reader never ships empty
 * or recycles the same bridge image for every leaf.
 *
 * Usage:
 *   node scripts/comics/generate-page-art.mjs
 *   node scripts/comics/generate-page-art.mjs --force
 *   node scripts/comics/generate-page-art.mjs --pages=36
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "public/assets/comics/pages");
const force = process.argv.includes("--force");
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));
const PAGE_COUNT = pagesArg ? Number(pagesArg.split("=")[1]) || 36 : 36;

const ISSUES = [
  { slug: "the-first-rift", hue: [28, 55, 72], accent: [61, 231, 255], motif: "rift" },
  { slug: "sparks-journey", hue: [45, 90, 55], accent: [255, 184, 77], motif: "forest" },
  { slug: "the-traveling-circus", hue: [120, 55, 40], accent: [255, 122, 61], motif: "circus" },
  { slug: "the-lost-city", hue: [90, 75, 55], accent: [102, 224, 255], motif: "city" },
  { slug: "the-storm-king", hue: [20, 35, 70], accent: [61, 155, 255], motif: "storm" },
  { slug: "the-merchants-secret", hue: [40, 28, 22], accent: [255, 184, 77], motif: "market" },
  { slug: "the-great-hunt", hue: [35, 80, 45], accent: [90, 200, 120], motif: "forest" },
  { slug: "the-last-guardian", hue: [55, 50, 45], accent: [61, 231, 255], motif: "ruin" },
  { slug: "festival-of-lights", hue: [25, 30, 55], accent: [255, 184, 77], motif: "lantern" },
  { slug: "the-shadow-beyond", hue: [12, 18, 40], accent: [100, 80, 140], motif: "void" },
];

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

function figure(cx, cy, s, fill, accent) {
  return `
    <g opacity="0.9">
      <ellipse cx="${cx}" cy="${cy + 36 * s}" rx="${16 * s}" ry="${5 * s}" fill="#0a0806" opacity="0.3"/>
      <ellipse cx="${cx}" cy="${cy - 20 * s}" rx="${10 * s}" ry="${12 * s}" fill="${fill}"/>
      <path d="M${cx - 12 * s} ${cy - 6 * s} Q ${cx} ${cy + 26 * s} ${cx + 12 * s} ${cy - 6 * s}
               L${cx + 9 * s} ${cy + 34 * s} Q ${cx} ${cy + 40 * s} ${cx - 9 * s} ${cy + 34 * s} Z"
            fill="${fill}"/>
      <circle cx="${cx - 3 * s}" cy="${cy - 22 * s}" r="${1.4 * s}" fill="${accent}"/>
      <circle cx="${cx + 3 * s}" cy="${cy - 22 * s}" r="${1.4 * s}" fill="${accent}"/>
    </g>`;
}

function egg(cx, cy, s, shell, glow) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${9 * s}" ry="${12 * s}" fill="${shell}"/>
    <ellipse cx="${cx - 2 * s}" cy="${cy - 3 * s}" rx="${2.5 * s}" ry="${3.5 * s}" fill="${glow}" opacity="0.5"/>
  `;
}

function motifLayer(motif, t, t2, ar, ag, ab, W, H) {
  if (motif === "circus") {
    return `
      <ellipse cx="${W * (0.35 + t * 0.3)}" cy="${H * 0.7}" rx="${180 + t2 * 80}" ry="40" fill="rgba(${ar},${ag},${ab},0.25)"/>
      <path d="M${W * 0.4} ${H * 0.3} L${W * 0.5} ${H * 0.18} L${W * 0.6} ${H * 0.3} Z" fill="rgba(255,122,61,0.45)"/>
    `;
  }
  if (motif === "forest") {
    return `
      <path d="M${120 + t * 200} ${H * 0.72} L${160 + t * 200} ${H * 0.35} L${200 + t * 200} ${H * 0.72} Z" fill="rgba(20,50,30,0.7)"/>
      <path d="M${700 + t2 * 200} ${H * 0.74} L${760 + t2 * 200} ${H * 0.32} L${820 + t2 * 200} ${H * 0.74} Z" fill="rgba(30,55,35,0.65)"/>
    `;
  }
  if (motif === "city" || motif === "ruin") {
    const x0 = 100 + t * 100;
    return `
      <rect x="${x0}" y="${H * 0.3}" width="90" height="${H * 0.35}" fill="rgba(60,50,40,0.65)"/>
      <rect x="${x0 + 120}" y="${H * 0.25}" width="110" height="${H * 0.4}" fill="rgba(50,70,70,0.55)"/>
      <rect x="${x0 + 260}" y="${H * 0.32}" width="80" height="${H * 0.33}" fill="rgba(70,45,35,0.6)"/>
      <ellipse cx="${W * 0.5}" cy="${H * 0.5}" rx="70" ry="40" fill="rgba(${ar},${ag},${ab},0.35)"/>
    `;
  }
  if (motif === "storm") {
    return `
      <path d="M${W * 0.55} ${H * 0.15} L${W * 0.48} ${H * 0.38} L${W * 0.58} ${H * 0.36} L${W * 0.42} ${H * 0.6}"
            fill="none" stroke="rgba(${ar},${ag},${ab},0.7)" stroke-width="8"/>
      <ellipse cx="${W * 0.5}" cy="${H * 0.22}" rx="${220 + t * 80}" ry="60" fill="rgba(30,40,60,0.5)"/>
    `;
  }
  if (motif === "lantern") {
    return `
      <circle cx="${200 + t * 600}" cy="${200 + t2 * 200}" r="${30 + t * 40}" fill="rgba(255,184,77,0.55)"/>
      <circle cx="${400 + t2 * 500}" cy="${280 + t * 150}" r="${25 + t2 * 30}" fill="rgba(${ar},${ag},${ab},0.45)"/>
      <circle cx="${800 - t * 300}" cy="${220}" r="35" fill="rgba(255,184,77,0.5)"/>
    `;
  }
  if (motif === "market") {
    return `
      <rect x="${150 + t * 100}" y="${H * 0.45}" width="160" height="120" rx="8" fill="rgba(80,50,30,0.5)"/>
      <rect x="${500 + t2 * 200}" y="${H * 0.48}" width="140" height="100" rx="8" fill="rgba(40,50,70,0.45)"/>
      <circle cx="${350}" cy="${H * 0.35}" r="40" fill="rgba(255,184,77,0.4)"/>
    `;
  }
  if (motif === "void") {
    return `
      <ellipse cx="${W * 0.5}" cy="${H * 0.4}" rx="${160 + t * 100}" ry="${220 + t2 * 80}" fill="rgba(${ar},${ag},${ab},0.25)"/>
      <path d="M${W * 0.5} ${H * 0.2} Q ${W * 0.58} ${H * 0.42} ${W * 0.5} ${H * 0.65}
               Q ${W * 0.42} ${H * 0.42} ${W * 0.5} ${H * 0.2} Z" fill="rgba(${ar},${ag},${ab},0.45)"/>
    `;
  }
  // rift default
  return `
    <ellipse cx="${W * (0.4 + t * 0.2)}" cy="${H * (0.32 + t2 * 0.1)}" rx="${140 + t * 80}" ry="${200 + t2 * 60}"
             fill="rgba(${ar},${ag},${ab},0.2)"/>
    <path d="M${W * 0.5} ${H * 0.2} Q ${W * 0.55} ${H * 0.4} ${W * 0.5} ${H * 0.58}
             Q ${W * 0.45} ${H * 0.4} ${W * 0.5} ${H * 0.2} Z" fill="rgba(${ar},${ag},${ab},0.4)"/>
  `;
}

function svgFor(issue, pageIndex) {
  const { hue, accent, motif } = issue;
  const t = hash(pageIndex, 7);
  const t2 = hash(pageIndex, 19);
  const t3 = hash(pageIndex, 41);
  const [r, g, b] = hue;
  const [ar, ag, ab] = accent;
  const panelY = 160 + Math.floor(t * 50);
  const ink = `rgba(${clamp(r - 10, 0, 255)},${clamp(g - 15, 0, 255)},${clamp(b - 20, 0, 255)},0.5)`;
  const figScale = 1.1 + t3 * 0.3;
  const left = figure(280 + t * 80, 980 + t2 * 40, figScale, "#e8d5b0", `rgb(${ar},${ag},${ab})`);
  const right = figure(900 - t2 * 60, 960 + t * 50, figScale * 0.95, "#c4a882", `rgb(${ar},${ag},${ab})`);
  const held = egg(340 + t * 40, 1020, figScale, "#f5ead2", `rgb(${ar},${ag},${ab})`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="rgb(${clamp(r + 40, 0, 255)},${clamp(g + 35, 0, 255)},${clamp(b + 25, 0, 255)})"/>
      <stop offset="55%" stop-color="rgb(${r},${g},${b})"/>
      <stop offset="100%" stop-color="rgb(${clamp(r - 18, 0, 40)},${clamp(g - 12, 0, 35)},${clamp(b - 8, 0, 50)})"/>
    </radialGradient>
    <radialGradient id="rift" cx="${30 + t * 40}%" cy="${25 + t2 * 30}%" r="40%">
      <stop offset="0%" stop-color="rgba(${ar},${ag},${ab},0.5)"/>
      <stop offset="100%" stop-color="rgba(${ar},${ag},${ab},0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#rift)"/>
  ${motifLayer(motif, t, t2, ar, ag, ab, W, H)}
  <path d="M70 ${panelY} H1130 V${panelY + 360} H70 Z" fill="none" stroke="${ink}" stroke-width="7"/>
  <path d="M70 ${panelY + 400} H520 V${panelY + 860} H70 Z" fill="none" stroke="${ink}" stroke-width="6"/>
  <path d="M560 ${panelY + 400} H1130 V${panelY + 860} H560 Z" fill="none" stroke="${ink}" stroke-width="6"/>
  <path d="M70 ${panelY + 900} H1130 V${H - 100} H70 Z" fill="none" stroke="${ink}" stroke-width="7"/>
  ${left}
  ${held}
  ${right}
  <circle cx="${200 + t2 * 700}" cy="${400 + t * 200}" r="${28 + t3 * 40}" fill="rgba(${ar},${ag},${ab},0.35)"/>
  <text x="60" y="${H - 40}" font-family="Georgia, serif" font-size="26" fill="rgba(232,213,176,0.5)">Legends of the Rift · ${issue.slug} · p${String(pageIndex + 1).padStart(2, "0")}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let wrote = 0;
  let skipped = 0;
  for (const issue of ISSUES) {
    const dir = path.join(OUT, issue.slug);
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const file = path.join(dir, `page-${String(i + 1).padStart(2, "0")}.webp`);
      if (fs.existsSync(file) && !force) {
        skipped += 1;
        continue;
      }
      const svg = Buffer.from(svgFor(issue, i));
      await sharp(svg).webp({ quality: 84 }).toFile(file);
      wrote += 1;
    }
    console.log(`ok ${issue.slug} (${PAGE_COUNT} slots)`);
  }
  console.log(`done — wrote ${wrote}, skipped ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
