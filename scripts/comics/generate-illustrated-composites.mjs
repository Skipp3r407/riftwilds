/**
 * Build premium-looking comic page plates by compositing official Riftwilds art
 * (covers, splashes, card art, NPC full-bodies) into multi-panel layouts.
 *
 * This replaces thin SVG diagram stubs (~20KB) with rich illustrated plates
 * that use real character/world art. Resume-friendly; skips plates already
 * above the illustrated size threshold unless --force.
 *
 * Usage:
 *   node scripts/comics/generate-illustrated-composites.mjs the-first-rift
 *   node scripts/comics/generate-illustrated-composites.mjs the-first-rift --force
 *   node scripts/comics/generate-illustrated-composites.mjs --all
 *   node scripts/comics/generate-illustrated-composites.mjs the-first-rift --pages=40
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "public/assets/comics/pages");
const W = 1200;
const H = 1600;
const ILLUSTRATED_MIN = 80_000;
const GUTTER = 18;

const force = process.argv.includes("--force");
const all = process.argv.includes("--all");
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));
const slugArg = process.argv.find((a) => !a.startsWith("--") && a !== process.argv[0] && a !== process.argv[1]);
// argv[1] is script path in node; find first non-flag after script
const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const slugFilter = all ? null : positional[0] || "the-first-rift";

const ISSUES = [
  {
    slug: "the-first-rift",
    pages: 40,
    cover: "public/assets/comics/covers/01-the-first-rift.png",
    splash: "public/assets/comics/splashes/rift-dawn.png",
    splashAlt: "public/assets/comics/splashes/shadow-beyond.png",
    cast: [
      "public/assets/cards/rise-of-the-rift/elara-venn/art.png",
      "public/assets/npcs/riftwild-commons/elara-venn/full-body.png",
      "public/assets/cards/rise-of-the-rift/bramblefox/art.webp",
      "public/assets/cards/rise-of-the-rift/mossprig/art.webp",
    ],
    hues: { r: 42, g: 58, b: 48, accent: [61, 231, 255] },
  },
  {
    slug: "sparks-journey",
    pages: 36,
    cover: "public/assets/comics/covers/02-sparks-journey.png",
    splash: "public/assets/comics/splashes/spark-path.png",
    splashAlt: "public/assets/comics/splashes/festival.png",
    cast: [
      "public/assets/cards/rise-of-the-rift/mossprig/art.webp",
      "public/assets/cards/rise-of-the-rift/bramblefox/art.webp",
    ],
    hues: { r: 50, g: 72, b: 40, accent: [255, 184, 77] },
  },
  {
    slug: "the-traveling-circus",
    pages: 37,
    cover: "public/assets/comics/covers/03-traveling-circus.png",
    splash: "public/assets/comics/splashes/circus-arrival.png",
    splashAlt: "public/assets/comics/splashes/festival.png",
    cast: ["public/assets/cards/rise-of-the-rift/bramblefox/art.webp"],
    hues: { r: 70, g: 40, b: 35, accent: [255, 122, 61] },
  },
  {
    slug: "the-lost-city",
    pages: 36,
    cover: "public/assets/comics/covers/04-the-lost-city.png",
    splash: "public/assets/comics/splashes/lost-city.png",
    splashAlt: "public/assets/comics/splashes/rift-dawn.png",
    cast: ["public/assets/cards/rise-of-the-rift/mossprig/art.webp"],
    hues: { r: 55, g: 60, b: 55, accent: [102, 224, 255] },
  },
  {
    slug: "the-storm-king",
    pages: 37,
    cover: "public/assets/comics/covers/05-the-storm-king.png",
    splash: "public/assets/comics/splashes/storm-king.png",
    splashAlt: "public/assets/comics/splashes/shadow-beyond.png",
    cast: ["public/assets/cards/rise-of-the-rift/ashwing/art.webp"],
    hues: { r: 28, g: 38, b: 62, accent: [61, 155, 255] },
  },
  {
    slug: "the-merchants-secret",
    pages: 36,
    cover: "public/assets/comics/covers/06-merchants-secret.png",
    splash: "public/assets/comics/splashes/merchant-night.png",
    splashAlt: "public/assets/comics/pages/page-commons-dusk.png",
    cast: ["public/assets/cards/rise-of-the-rift/elara-venn/art.png"],
    hues: { r: 40, g: 28, b: 22, accent: [255, 184, 77] },
  },
  {
    slug: "the-great-hunt",
    pages: 36,
    cover: "public/assets/comics/covers/07-the-great-hunt.png",
    splash: "public/assets/comics/splashes/great-hunt.png",
    splashAlt: "public/assets/comics/pages/key-forest.png",
    cast: [
      "public/assets/cards/rise-of-the-rift/ashwing/art.webp",
      "public/assets/cards/rise-of-the-rift/mossprig/art.webp",
      "public/assets/cards/rise-of-the-rift/thornling/art.webp",
    ],
    hues: { r: 35, g: 70, b: 40, accent: [90, 200, 120] },
  },
  {
    slug: "the-last-guardian",
    pages: 36,
    cover: "public/assets/comics/covers/08-the-last-guardian.png",
    splash: "public/assets/comics/splashes/last-guardian.png",
    splashAlt: "public/assets/comics/pages/page-layered-ruin.png",
    cast: ["public/assets/cards/rise-of-the-rift/mossprig/art.webp"],
    hues: { r: 50, g: 48, b: 42, accent: [61, 231, 255] },
  },
  {
    slug: "festival-of-lights",
    pages: 36,
    cover: "public/assets/comics/covers/09-festival-of-lights.png",
    splash: "public/assets/comics/splashes/festival.png",
    splashAlt: "public/assets/comics/pages/page-lantern-sky.png",
    cast: ["public/assets/cards/rise-of-the-rift/bramblefox/art.webp"],
    hues: { r: 30, g: 32, b: 55, accent: [255, 184, 77] },
  },
  {
    slug: "the-shadow-beyond",
    pages: 37,
    cover: "public/assets/comics/covers/10-the-shadow-beyond.png",
    splash: "public/assets/comics/splashes/shadow-beyond.png",
    splashAlt: "public/assets/comics/splashes/rift-dawn.png",
    cast: [
      "public/assets/cards/rise-of-the-rift/elara-venn/art.png",
      "public/assets/cards/rise-of-the-rift/ashwing/art.webp",
    ],
    hues: { r: 16, g: 18, b: 36, accent: [100, 80, 140] },
  },
];

/** Page role → layout recipe (panel rectangles in px). */
function layoutForPage(pageIndex) {
  const n = pageIndex + 1;
  // Front matter / end matter patterns by page number rhythm
  if (n <= 3) return "splash";
  if (n === 4 || n === 5) return "two-col";
  if (n % 11 === 0) return "splash";
  if (n % 7 === 0) return "three-stack";
  if (n % 5 === 0) return "grid-2x2";
  if (n % 3 === 0) return "two-col";
  return "narrative";
}

function panelsFor(layout) {
  const g = GUTTER;
  if (layout === "splash" || layout === "narrative") {
    return [{ x: g, y: g, w: W - g * 2, h: H - g * 2 }];
  }
  if (layout === "two-col") {
    const pw = (W - g * 3) / 2;
    return [
      { x: g, y: g, w: pw, h: H - g * 2 },
      { x: g * 2 + pw, y: g, w: pw, h: H - g * 2 },
    ];
  }
  if (layout === "three-stack") {
    const ph = (H - g * 4) / 3;
    return [
      { x: g, y: g, w: W - g * 2, h: ph },
      { x: g, y: g * 2 + ph, w: W - g * 2, h: ph },
      { x: g, y: g * 3 + ph * 2, w: W - g * 2, h: ph },
    ];
  }
  // grid-2x2
  const pw = (W - g * 3) / 2;
  const ph = (H - g * 3) / 2;
  return [
    { x: g, y: g, w: pw, h: ph },
    { x: g * 2 + pw, y: g, w: pw, h: ph },
    { x: g, y: g * 2 + ph, w: pw, h: ph },
    { x: g * 2 + pw, y: g * 2 + ph, w: pw, h: ph },
  ];
}

function abs(rel) {
  return path.join(ROOT, rel);
}

function existing(rels) {
  return rels.map(abs).filter((p) => fs.existsSync(p));
}

const POSITIONS = [
  "centre",
  "north",
  "northwest",
  "northeast",
  "west",
  "east",
  "south",
  "southwest",
  "southeast",
];

async function panelBuffer(bgPath, castPath, panel, pageIndex, panelIndex, hues) {
  const { r, g, b, accent } = hues;
  const [ar, ag, ab] = accent;
  const position = POSITIONS[(pageIndex * 3 + panelIndex) % POSITIONS.length];

  const bg = await sharp(bgPath)
    .resize(Math.round(panel.w), Math.round(panel.h), {
      fit: "cover",
      position,
    })
    .modulate({
      brightness: 0.92 + (panelIndex % 3) * 0.04,
      saturation: 1.05,
    })
    .toBuffer();

  const composites = [];
  // Soft vignette via SVG
  const vignette = Buffer.from(`<?xml version="1.0"?>
<svg width="${panel.w}" height="${panel.h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="v" cx="50%" cy="42%" r="72%">
      <stop offset="55%" stop-color="rgb(0,0,0)" stop-opacity="0"/>
      <stop offset="100%" stop-color="rgb(${Math.max(0, r - 20)},${Math.max(0, g - 20)},${Math.max(0, b - 15)})" stop-opacity="0.55"/>
    </radialGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(${ar},${ag},${ab},0.18)"/>
      <stop offset="40%" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <rect x="0" y="0" width="${panel.w}" height="${panel.h}" fill="none" stroke="rgba(12,8,6,0.85)" stroke-width="10"/>
  <rect x="4" y="4" width="${panel.w - 8}" height="${panel.h - 8}" fill="none" stroke="rgba(${ar},${ag},${ab},0.22)" stroke-width="2"/>
</svg>`);

  let base = await sharp(bg)
    .composite([{ input: vignette, top: 0, left: 0 }])
    .png()
    .toBuffer();

  if (castPath && fs.existsSync(castPath)) {
    const castH = Math.floor(panel.h * (0.55 + (panelIndex % 2) * 0.12));
    const castW = Math.floor(panel.w * (0.42 + (pageIndex % 3) * 0.06));
    const cast = await sharp(castPath)
      .resize(castW, castH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const left = Math.floor(panel.w * (0.12 + (panelIndex % 3) * 0.18));
    const top = Math.floor(panel.h * 0.32);
    base = await sharp(base)
      .composite([{ input: cast, left, top, blend: "over" }])
      .png()
      .toBuffer();
  }

  return base;
}

async function renderPage(issue, pageIndex) {
  const layout = layoutForPage(pageIndex);
  const panels = panelsFor(layout);
  const bgs = existing([issue.cover, issue.splash, issue.splashAlt].filter(Boolean));
  const casts = existing(issue.cast);
  if (!bgs.length) throw new Error(`No backgrounds for ${issue.slug}`);

  const paper = Buffer.from(`<?xml version="1.0"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgb(${issue.hues.r + 18},${issue.hues.g + 12},${issue.hues.b + 8})"/>
      <stop offset="100%" stop-color="rgb(${Math.max(8, issue.hues.r - 10)},${Math.max(8, issue.hues.g - 12)},${Math.max(8, issue.hues.b - 8)})"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#paper)"/>
</svg>`);

  const composites = [];
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const bg = bgs[(pageIndex + i) % bgs.length];
    const cast = casts.length ? casts[(pageIndex + i) % casts.length] : null;
    // Splash pages: sometimes no cast for pure vista
    const useCast = layout === "splash" && i === 0 && pageIndex % 4 === 0 ? null : cast;
    const buf = await panelBuffer(bg, useCast, p, pageIndex, i, issue.hues);
    composites.push({ input: buf, left: Math.round(p.x), top: Math.round(p.y) });
  }

  // Subtle page footer ink line (no readable text — reader overlays page #)
  const footer = Buffer.from(`<?xml version="1.0"?>
<svg width="${W}" height="36" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="36" fill="rgba(10,8,6,0.35)"/>
  <line x1="40" y1="8" x2="${W - 40}" y2="8" stroke="rgba(232,213,176,0.25)" stroke-width="1"/>
</svg>`);
  composites.push({ input: footer, left: 0, top: H - 36 });

  return sharp(paper).composite(composites).webp({ quality: 86 }).toBuffer();
}

async function main() {
  const pageCap = pagesArg ? Number(pagesArg.split("=")[1]) : null;
  const issues = slugFilter ? ISSUES.filter((i) => i.slug === slugFilter) : ISSUES;
  if (!issues.length) {
    console.error(`Unknown issue: ${slugFilter}`);
    process.exit(1);
  }

  let wrote = 0;
  let skipped = 0;
  for (const issue of issues) {
    const dir = path.join(OUT, issue.slug);
    fs.mkdirSync(dir, { recursive: true });
    const count = pageCap || issue.pages;
    for (let i = 0; i < count; i++) {
      const dest = path.join(dir, `page-${String(i + 1).padStart(2, "0")}.webp`);
      if (fs.existsSync(dest) && !force) {
        const size = fs.statSync(dest).size;
        if (size >= ILLUSTRATED_MIN) {
          skipped += 1;
          continue;
        }
      }
      const buf = await renderPage(issue, i);
      fs.writeFileSync(dest, buf);
      wrote += 1;
      if ((i + 1) % 10 === 0) console.log(`  ${issue.slug} … p${i + 1}`);
    }
    console.log(`ok ${issue.slug} (${count} slots)`);
  }
  console.log(`done — wrote ${wrote}, skipped illustrated ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
