/**
 * Install AI-enhanced printable gear + fan-kit die-cut stickers @ 300 DPI.
 *
 * Sources: Cursor GenerateImage outputs (project assets/ or printables/_sources/)
 * Run:     node scripts/assets/install-enhanced-printables.mjs
 *
 * LOCAL ONLY — does not commit/push.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DPI = 300;
const OUT = path.join(ROOT, "public/assets/printables");
const SRC = path.join(OUT, "_sources");
const STICKER_OUT = path.join(ROOT, "public/assets/fan-kit/stickers");
const CURSOR_ASSETS = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);

const LETTER = { w: 2550, h: 3300, pageW: 612, pageH: 792, label: 'US Letter 8.5×11"' };
const A4 = { w: 2480, h: 3508, pageW: 595.28, pageH: 841.89, label: "A4" };
const CARD_5X7 = { w: 1500, h: 2100, pageW: 360, pageH: 504, label: '5×7"' };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resolveSource(name) {
  const candidates = [
    path.join(SRC, name),
    path.join(CURSOR_ASSETS, name),
    path.join(ROOT, "assets", name),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

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

async function writePngPdf(slug, pngBuffer, size) {
  const pngPath = path.join(OUT, `${slug}.png`);
  const pdfPath = path.join(OUT, `${slug}.pdf`);

  await sharp(pngBuffer)
    .withMetadata({ density: DPI })
    .png({ compressionLevel: 8 })
    .toFile(pngPath);

  const jpeg = await sharp(pngBuffer).jpeg({ quality: 93, mozjpeg: true }).toBuffer();
  fs.writeFileSync(pdfPath, jpegToPdf(jpeg, size.w, size.h, size.pageW, size.pageH));
  console.log(`  ✓ ${slug} (${size.w}×${size.h} @ ${DPI} DPI)`);
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function posterOverlay({ w, h, brand = "RIFTWILDS", title, subtitle }) {
  const boxY = Math.round(h * 0.78);
  const boxH = Math.round(h * 0.16);
  const boxX = Math.round(w * 0.07);
  const boxW = Math.round(w * 0.86);
  const titleSize = Math.round(w * 0.055);
  const subSize = Math.round(w * 0.022);
  const brandSize = Math.round(w * 0.018);
  const footSize = Math.round(w * 0.014);
  const brandSafe = escapeXml(brand);
  const titleSafe = escapeXml(title);
  const subtitleSafe = escapeXml(subtitle);

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a0c10" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#0a0c10" stop-opacity="0"/>
      <stop offset="1" stop-color="#0a0c10" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#scrim)"/>
  <text x="${w / 2}" y="${Math.round(h * 0.045)}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${brandSize}"
    fill="#e8c878" letter-spacing="${Math.round(brandSize * 0.35)}">${brandSafe}</text>
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${Math.round(w * 0.012)}"
    fill="rgba(12,14,18,0.78)" stroke="#3de7ff" stroke-width="${Math.max(2, Math.round(w * 0.002))}"/>
  <text x="${w / 2}" y="${boxY + Math.round(boxH * 0.42)}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" font-weight="700"
    fill="#f3efe6">${titleSafe}</text>
  <text x="${w / 2}" y="${boxY + Math.round(boxH * 0.68)}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${subSize}"
    fill="#e8d5b0">${subtitleSafe}</text>
  <text x="${w / 2}" y="${Math.round(h * 0.975)}" text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif" font-size="${footSize}"
    fill="#a89b86">300 DPI print · Personal use · Not for resale</text>
</svg>`);
}

async function installPoster(slug, sourceName, size, title, subtitle) {
  const src = resolveSource(sourceName);
  if (!src) throw new Error(`Missing source: ${sourceName}`);
  const staged = path.join(SRC, sourceName);
  if (path.resolve(src) !== path.resolve(staged)) {
    fs.copyFileSync(src, staged);
  }

  const base = await sharp(staged)
    .resize(size.w, size.h, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .png()
    .toBuffer();

  const overlay = posterOverlay({ w: size.w, h: size.h, title, subtitle });
  const composed = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();

  await writePngPdf(slug, composed, size);
}

async function installSheet(slug, sourceName, size) {
  const src = resolveSource(sourceName);
  if (!src) throw new Error(`Missing source: ${sourceName}`);
  const staged = path.join(SRC, sourceName);
  if (path.resolve(src) !== path.resolve(staged)) {
    fs.copyFileSync(src, staged);
  }

  const buf = await sharp(staged)
    .resize(size.w, size.h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
  await writePngPdf(slug, buf, size);
}

async function installCardFromPoster(slug, posterSourceName, size, title, subtitle) {
  const src = resolveSource(posterSourceName);
  if (!src) throw new Error(`Missing source: ${posterSourceName}`);

  const base = await sharp(src)
    .resize(size.w, size.h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const overlay = posterOverlay({
    w: size.w,
    h: size.h,
    title,
    subtitle,
  });
  const composed = await sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toBuffer();
  await writePngPdf(slug, composed, size);
}

async function installFanKitSticker(name, sourceName) {
  const src = resolveSource(sourceName);
  if (!src) throw new Error(`Missing sticker source: ${sourceName}`);
  const staged = path.join(SRC, sourceName);
  if (path.resolve(src) !== path.resolve(staged)) {
    fs.copyFileSync(src, staged);
  }

  const outPng = path.join(STICKER_OUT, `${name}.png`);
  // Normalize to square sticker master before masking.
  await sharp(staged)
    .resize(1024, 1024, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: "#ffffff" })
    .png()
    .toFile(outPng);
  return outPng;
}

async function main() {
  ensureDir(OUT);
  ensureDir(SRC);
  ensureDir(STICKER_OUT);

  console.log("Installing enhanced printables…\n");

  // Stage Cursor GenerateImage outputs into _sources when present.
  const stageNames = [
    "poster-spark-source.png",
    "poster-commons-source.png",
    "poster-hatchery-source.png",
    "trading-cards-sheet-source.png",
    "bookmarks-sheet-source.png",
    "sticker-sheet-riftlings-source.png",
    "sticker-sheet-crests-source.png",
    "sticker-spark-source.png",
    "sticker-cindercub-source.png",
    "sticker-mossprig-source.png",
    "sticker-bubbloon-source.png",
    "sticker-crests-source.png",
    "sticker-commons-crest-source.png",
    "sticker-hatch-egg-source.png",
    "sticker-care-heart-source.png",
    "sticker-keeper-badge-source.png",
    "card-circus-source.png",
  ];
  for (const name of stageNames) {
    const found = resolveSource(name);
    if (found && path.resolve(found) !== path.resolve(path.join(SRC, name))) {
      fs.copyFileSync(found, path.join(SRC, name));
      console.log(`  staged ${name}`);
    }
  }

  await installPoster(
    "poster-spark",
    "poster-spark-source.png",
    LETTER,
    "Spark's Stand",
    "Glowpup guardian · Keepers hold the line",
  );
  await installPoster(
    "poster-spark-a4",
    "poster-spark-source.png",
    A4,
    "Spark's Stand",
    "Glowpup guardian · Keepers hold the line",
  );
  await installPoster(
    "poster-commons",
    "poster-commons-source.png",
    LETTER,
    "Commons Under Threat",
    "Keepers & Riftlings hold the plaza",
  );
  await installPoster(
    "poster-hatchery",
    "poster-hatchery-source.png",
    LETTER,
    "Hatchery Aurora",
    "Care & wonder before the aftershock",
  );

  await installSheet("trading-cards-sheet", "trading-cards-sheet-source.png", LETTER);
  await installSheet("bookmarks-sheet", "bookmarks-sheet-source.png", LETTER);
  await installSheet("sticker-sheet-riftlings", "sticker-sheet-riftlings-source.png", LETTER);
  await installSheet("sticker-sheet-crests", "sticker-sheet-crests-source.png", LETTER);

  // Bonus: refresh related gear from the same poster masters.
  await installCardFromPoster(
    "card-spark-5x7",
    "poster-spark-source.png",
    CARD_5X7,
    "Spark's Stand",
    "Heroic Glowpup · cyan rift vs amber courage",
  );
  if (resolveSource("card-circus-source.png")) {
    await installCardFromPoster(
      "card-circus-5x7",
      "card-circus-source.png",
      CARD_5X7,
      "Circus Under Fire",
      "Traveling Circus · Keepers defend the big top",
    );
  }

  console.log("\nInstalling fan-kit die-cut stickers…");
  const stickerMap = [
    ["spark", "sticker-spark-source.png"],
    ["cindercub", "sticker-cindercub-source.png"],
    ["mossprig", "sticker-mossprig-source.png"],
    ["bubbloon", "sticker-bubbloon-source.png"],
    ["commons-crest", "sticker-commons-crest-source.png"],
    ["hatch-egg", "sticker-hatch-egg-source.png"],
    ["care-heart", "sticker-care-heart-source.png"],
    ["keeper-badge", "sticker-keeper-badge-source.png"],
  ];
  const maskTargets = [];
  for (const [name, source] of stickerMap) {
    const out = await installFanKitSticker(name, source);
    maskTargets.push(out);
    console.log(`  ✓ fan-kit/stickers/${name}.png`);
  }

  const maskScript = path.join(ROOT, "scripts/assets/mask-npc-black.mjs");
  console.log("\nMasking sticker backgrounds…");
  const mask = spawnSync(process.execPath, [maskScript, "--all-png", ...maskTargets], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (mask.status !== 0) {
    console.warn(mask.stdout || "");
    console.warn(mask.stderr || "");
    console.warn("Mask step finished with warnings — stickers may still have white plates.");
  } else {
    console.log(mask.stdout || "  masked");
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    dpi: DPI,
    theme: "riftwilds-enhanced-painterly-v4",
    count: 10,
    note: "AI-enhanced masters installed via install-enhanced-printables.mjs",
    files: [
      "poster-spark",
      "poster-spark-a4",
      "poster-commons",
      "poster-hatchery",
      "trading-cards-sheet",
      "bookmarks-sheet",
      "sticker-sheet-riftlings",
      "sticker-sheet-crests",
      "card-spark-5x7",
      "card-circus-5x7",
    ].map((slug) => {
      const size =
        slug === "poster-spark-a4"
          ? A4
          : slug === "card-spark-5x7" || slug === "card-circus-5x7"
            ? CARD_5X7
            : LETTER;
      return {
        slug,
        png: `${slug}.png`,
        pdf: `${slug}.pdf`,
        pixels: `${size.w}×${size.h}`,
        paper: size.label,
      };
    }),
  };
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("\nDone. Enhanced printables + fan-kit stickers installed locally.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
