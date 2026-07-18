/**
 * Install AI game-sketch coloring pages into public/assets/coloring.
 * Sources: Cursor GenerateImage outputs (detailed Riftwilds concept linework).
 *
 * Run: node scripts/assets/install-coloring-sketches.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const COLORING_DIR = path.join(ROOT, "public/assets/coloring");
const CURSOR_SKETCH_DIR = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);
const REPO_SKETCH_DIR = path.join(ROOT, "artifacts/coloring-sketches");

function resolveSketchDir() {
  if (process.env.COLORING_SKETCH_DIR) return process.env.COLORING_SKETCH_DIR;
  // Prefer repo archive so reinstall works without Cursor asset cache
  if (fs.existsSync(path.join(REPO_SKETCH_DIR, "coloring-spark-sketch.png"))) {
    return REPO_SKETCH_DIR;
  }
  return CURSOR_SKETCH_DIR;
}

const SKETCH_DIR = resolveSketchDir();

const LETTER_W = 2550;
const LETTER_H = 3300;
const MARGIN = 120;
const HEADER_H = 220;
const FOOTER_H = 140;

const SHEETS = [
  { slug: "spark", title: "Spark the Glowpup", file: "coloring-spark-sketch.png" },
  { slug: "riftwild-commons", title: "Riftwild Commons", file: "coloring-commons-sketch.png" },
  { slug: "traveling-circus", title: "Traveling Circus", file: "coloring-circus-sketch.png" },
  { slug: "hatchery-egg", title: "Hatchery Egg", file: "coloring-egg-sketch.png" },
  { slug: "riftling-friends", title: "Riftling Friends", file: "coloring-friends-sketch.png" },
  { slug: "elara-venn", title: "Elara Venn", file: "coloring-elara-sketch.png" },
  { slug: "gateway-stones", title: "Gateway Stones", file: "coloring-gateway-sketch.png" },
  { slug: "elderwood-path", title: "Elderwood Path", file: "coloring-elderwood-sketch.png" },
  // Batch 2 — 20 new game-sketch sheets
  { slug: "keeper-guide", title: "Keeper & Companion", file: "coloring-keeper-guide-sketch.png" },
  { slug: "commons-arena", title: "Commons Arena", file: "coloring-commons-arena-sketch.png" },
  { slug: "player-academy", title: "Player Academy", file: "coloring-player-academy-sketch.png" },
  { slug: "moonwater-harbor", title: "Moonwater Harbor", file: "coloring-moonwater-harbor-sketch.png" },
  { slug: "hatchery-care", title: "Hatchery Care", file: "coloring-hatchery-care-sketch.png" },
  { slug: "ember-forge", title: "Ember Forge", file: "coloring-ember-forge-sketch.png" },
  { slug: "riftling-species", title: "Riftling Species", file: "coloring-riftling-species-sketch.png" },
  { slug: "glowpup-den", title: "Glowpup Den", file: "coloring-glowpup-den-sketch.png" },
  { slug: "emberkit-scout", title: "Emberkit Scout", file: "coloring-emberkit-scout-sketch.png" },
  { slug: "pouchling-market", title: "Pouchling Market", file: "coloring-pouchling-market-sketch.png" },
  { slug: "stone-guardian", title: "Stone Guardian", file: "coloring-stone-guardian-sketch.png" },
  { slug: "rift-serpent", title: "Rift Serpent", file: "coloring-rift-serpent-sketch.png" },
  { slug: "circus-acrobat", title: "Circus Acrobat", file: "coloring-circus-acrobat-sketch.png" },
  { slug: "gateway-awaken", title: "Gateway Awakening", file: "coloring-gateway-awaken-sketch.png" },
  { slug: "elderwood-camp", title: "Elderwood Camp", file: "coloring-elderwood-camp-sketch.png" },
  { slug: "market-day", title: "Market Day", file: "coloring-market-day-sketch.png" },
  { slug: "homestead-garden", title: "Homestead Garden", file: "coloring-homestead-garden-sketch.png" },
  { slug: "riftstone-plaza", title: "Riftstone Plaza", file: "coloring-riftstone-plaza-sketch.png" },
  { slug: "first-bond", title: "First Bond", file: "coloring-first-bond-sketch.png" },
  { slug: "lantern-night", title: "Lantern Night", file: "coloring-lantern-night-sketch.png" },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Push mid-grays toward white so crayons have open fill areas; keep near-black lines. */
async function toPrintableLineArt(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = info.channels === 4 ? data[i + 3] : 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // Soft threshold: dark ink stays black; midtones bleach for coloring
    let v;
    if (a < 20) {
      v = 255;
    } else if (lum < 95) {
      v = 0;
    } else if (lum < 160) {
      // light hatching stays as thin gray→black for sketch feel, but keep printable
      v = lum < 130 ? 40 : 255;
    } else {
      v = 255;
    }
    out[i] = v;
    out[i + 1] = v;
    out[i + 2] = v;
    if (info.channels === 4) out[i + 3] = 255;
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer();
}

function pageChromeSvg(title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER_W}" height="${LETTER_H}" viewBox="0 0 ${LETTER_W} ${LETTER_H}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="48" y="48" width="${LETTER_W - 96}" height="${LETTER_H - 96}" fill="none" stroke="#1a1a1a" stroke-width="6" rx="16"/>
  <text x="${LETTER_W / 2}" y="130" text-anchor="middle" font-family="Georgia, serif" font-size="72" fill="#1a1a1a">${escapeXml(title)}</text>
  <text x="${LETTER_W / 2}" y="190" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#444444">Riftwilds · Kids coloring page</text>
  <text x="${LETTER_W / 2}" y="${LETTER_H - 80}" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#555555">Free for personal &amp; kids use · Not for resale · riftwilds.com</text>
</svg>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Minimal one-page PDF embedding a RGB JPEG at letter size. */
function jpegToPdf(jpegBuf, imgW, imgH) {
  const pageW = 612;
  const pageH = 792;
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

  const bodyLen = parts.reduce((n, b) => n + b.length, 0);
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 6 /Root ${catalogObjNum} 0 R >>\nstartxref\n${bodyLen}\n%%EOF\n`;
  parts.push(enc(xref));
  return Buffer.concat(parts);
}

function previewSvg(slug, title) {
  // Lightweight SVG pointer page for catalog svgSrc (PNG is the real print asset)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="850" height="1100" viewBox="0 0 850 1100">
  <rect width="850" height="1100" fill="#ffffff"/>
  <rect x="28" y="28" width="794" height="1044" fill="none" stroke="#1a1a1a" stroke-width="3" rx="8"/>
  <text x="425" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#1a1a1a">${escapeXml(title)}</text>
  <text x="425" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#444444">Riftwilds · Kids coloring page · game sketch</text>
  <image x="60" y="130" width="730" height="880" preserveAspectRatio="xMidYMid meet" xlink:href="${slug}.png"/>
  <text x="425" y="1068" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#555555">Free for personal &amp; kids use · Not for resale · riftwilds.com</text>
</svg>`;
}

async function installSheet({ slug, title, file }) {
  const src = path.join(SKETCH_DIR, file);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing sketch: ${src}`);
  }

  const artBuf = await toPrintableLineArt(src);
  const artMeta = await sharp(artBuf).metadata();
  const artW = LETTER_W - MARGIN * 2;
  const artH = LETTER_H - HEADER_H - FOOTER_H;
  const fitted = await sharp(artBuf)
    .resize(artW, artH, { fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();
  const fittedMeta = await sharp(fitted).metadata();
  const left = Math.round((LETTER_W - fittedMeta.width) / 2);
  const top = HEADER_H + Math.round((artH - fittedMeta.height) / 2);

  const chrome = Buffer.from(pageChromeSvg(title));
  const page = await sharp(chrome)
    .composite([{ input: fitted, left, top }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  const pngPath = path.join(COLORING_DIR, `${slug}.png`);
  const pdfPath = path.join(COLORING_DIR, `${slug}.pdf`);
  const svgPath = path.join(COLORING_DIR, `${slug}.svg`);

  fs.writeFileSync(pngPath, page);
  fs.writeFileSync(svgPath, previewSvg(slug, title), "utf8");

  const jpeg = await sharp(page).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  fs.writeFileSync(pdfPath, jpegToPdf(jpeg, LETTER_W, LETTER_H));

  console.log(`  installed ${slug} (${Math.round(page.length / 1024)} KB png)`);
}

async function main() {
  ensureDir(COLORING_DIR);
  console.log("Installing game-sketch coloring sheets…");
  console.log(`  sketch dir: ${SKETCH_DIR}`);
  for (const sheet of SHEETS) {
    await installSheet(sheet);
  }
  console.log(`Done. ${SHEETS.length} sheets → ${COLORING_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
