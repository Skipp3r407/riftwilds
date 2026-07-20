/**
 * Bake comic lettering (caption boxes, speech balloons, SFX) into page plates.
 * Always composites from a clean base copy so re-runs do not double-letter.
 *
 *   node scripts/comics/bake-comic-lettering.mjs the-first-rift
 *   node scripts/comics/bake-comic-lettering.mjs the-first-rift --pages=14
 *   node scripts/comics/bake-comic-lettering.mjs --all
 *   node scripts/comics/bake-comic-lettering.mjs the-first-rift --force
 *
 * Requires lettering jobs:
 *   npx tsx scripts/comics/dump-lettering-jobs.mts [slug]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const JOBS_DIR = path.join(ROOT, "artifacts/comics/lettering");
const BASE_DIR = path.join(ROOT, "artifacts/comics/plates-base");
const W = 1200;
const H = 1600;

const force = process.argv.includes("--force");
const all = process.argv.includes("--all");
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));
const pageFilter = pagesArg
  ? new Set(
      pagesArg
        .split("=")[1]
        .split(",")
        .map((n) => Number(n.trim()))
        .filter(Boolean),
    )
  : null;
const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const slugFilter = all ? null : positional[0] || "the-first-rift";

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapWords(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function ensureBase(plateAbs, slug, pageNumber) {
  const base = path.join(
    BASE_DIR,
    slug,
    `page-${String(pageNumber).padStart(2, "0")}.webp`,
  );
  fs.mkdirSync(path.dirname(base), { recursive: true });
  if (!fs.existsSync(base)) {
    if (!fs.existsSync(plateAbs)) {
      throw new Error(`Missing plate: ${plateAbs}`);
    }
    fs.copyFileSync(plateAbs, base);
  }
  return base;
}

function balloonPath(kind, x, y, bw, bh, tail) {
  const left = x - bw / 2;
  const top = y - bh / 2;
  const r = kind === "thought" || kind === "telepathy" ? Math.min(28, bh / 2) : 18;
  // Simple rounded rect; tail as triangle below/above
  let tailSvg = "";
  const cx = x;
  const midY = y;
  if (!["narration", "caption", "sfx", "magic"].includes(kind)) {
    const tw = 16;
    const th = 18;
    if (tail?.startsWith("up")) {
      tailSvg = `<polygon points="${cx - tw},${top + 4} ${cx + tw},${top + 4} ${cx},${top - th}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else if (tail === "left") {
      tailSvg = `<polygon points="${left + 4},${midY - tw} ${left + 4},${midY + tw} ${left - th},${midY}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else if (tail === "right") {
      tailSvg = `<polygon points="${left + bw - 4},${midY - tw} ${left + bw - 4},${midY + tw} ${left + bw + th},${midY}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else {
      // down / default
      tailSvg = `<polygon points="${cx - tw},${top + bh - 4} ${cx + tw},${top + bh - 4} ${cx},${top + bh + th}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    }
  }
  return { left, top, r, tailSvg };
}

function renderBubbleSvg(b) {
  const kind = b.kind;
  const maxW = Math.round((W * (b.maxWidthPct || 34)) / 100);
  const cx = Math.round((b.x / 100) * W);
  const cy = Math.round((b.y / 100) * H);

  if (kind === "sfx") {
    const lines = wrapWords(String(b.text).toUpperCase(), 18);
    const fontSize = 42;
    const lineH = 48;
    const blockH = lines.length * lineH;
    const startY = cy - blockH / 2 + fontSize;
    const tspans = lines
      .map(
        (line, i) =>
          `<tspan x="${cx}" y="${startY + i * lineH}" text-anchor="middle">${escapeXml(line)}</tspan>`,
      )
      .join("");
    return `
      <text font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700"
            fill="#ffb84d" stroke="rgba(20,14,10,0.75)" stroke-width="3" paint-order="stroke"
            letter-spacing="0.12em">${tspans}</text>`;
  }

  if (kind === "narration" || kind === "caption") {
    const lines = wrapWords(b.text, 42);
    const fontSize = kind === "caption" ? 22 : 24;
    const lineH = fontSize + 8;
    const padX = 22;
    const padY = 14;
    const textW = Math.min(maxW, 620);
    const bw = textW;
    const bh = padY * 2 + lines.length * lineH + (kind === "caption" ? 0 : 0);
    const left = Math.max(24, Math.min(W - bw - 24, cx - bw / 2));
    const top = Math.max(24, Math.min(H - bh - 48, cy - bh / 2));
    const tspans = lines
      .map(
        (line, i) =>
          `<tspan x="${left + padX}" y="${top + padY + fontSize + i * lineH}">${escapeXml(line)}</tspan>`,
      )
      .join("");
    return `
      <rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="4" ry="4"
            fill="rgba(20,14,10,0.86)" stroke="rgba(232,213,176,0.45)" stroke-width="2"/>
      <text font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}"
            fill="#f5ead2" font-style="${kind === "narration" ? "italic" : "normal"}">${tspans}</text>`;
  }

  // speech / thought / shout / whisper / creature / magic / telepathy
  const speaker = b.speaker ? String(b.speaker).toUpperCase() : "";
  const bodyLines = wrapWords(b.text, 28);
  const fontSize = kind === "shout" ? 24 : 22;
  const lineH = fontSize + 7;
  const padX = 20;
  const padY = 14;
  const speakerH = speaker ? 18 : 0;
  const bw = Math.min(maxW, 400);
  const bh = padY * 2 + speakerH + bodyLines.length * lineH;
  const { left, top, r, tailSvg } = balloonPath(kind, cx, cy, bw, bh, b.tail);

  const fill =
    kind === "shout"
      ? "rgba(255,236,200,0.96)"
      : kind === "creature"
        ? "rgba(236,252,240,0.95)"
        : kind === "magic"
          ? "rgba(18,40,28,0.88)"
          : kind === "telepathy"
            ? "rgba(230,240,255,0.95)"
            : "rgba(255,252,245,0.96)";
  const stroke =
    kind === "thought" || kind === "telepathy" || kind === "whisper"
      ? "rgba(42,33,24,0.4)"
      : "rgba(42,33,24,0.5)";
  const dash =
    kind === "thought" || kind === "telepathy"
      ? `stroke-dasharray="6 4"`
      : kind === "creature"
        ? `stroke-dasharray="3 3"`
        : "";
  const textFill = kind === "magic" ? "#d8ffe8" : "#2a2118";

  let yCursor = top + padY + (speaker ? 14 : fontSize);
  const parts = [];
  if (speaker) {
    parts.push(
      `<text x="${left + padX}" y="${yCursor}" font-family="Georgia, serif" font-size="13"
             fill="#8b5a3c" letter-spacing="0.12em">${escapeXml(speaker)}</text>`,
    );
    yCursor += 18;
  }
  bodyLines.forEach((line, i) => {
    parts.push(
      `<text x="${left + padX}" y="${yCursor + i * lineH}" font-family="Georgia, 'Times New Roman', serif"
             font-size="${fontSize}" fill="${textFill}"
             font-weight="${kind === "shout" ? "700" : "400"}"
             font-style="${kind === "whisper" ? "italic" : "normal"}">${escapeXml(line)}</text>`,
    );
  });

  return `
    ${tailSvg}
    <rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="${r}" ry="${r}"
          fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${dash}/>
    ${parts.join("\n")}`;
}

function renderOverlay(job) {
  const parts = [];

  if (job.title) {
    const lines = wrapWords(job.title, 28);
    const fontSize = 36;
    const lineH = 42;
    lines.forEach((line, i) => {
      parts.push(`
        <text x="48" y="${56 + i * lineH}" font-family="Georgia, 'Times New Roman', serif"
              font-size="${fontSize}" font-weight="700" fill="#f5ead2"
              stroke="rgba(10,8,6,0.65)" stroke-width="3" paint-order="stroke">${escapeXml(line)}</text>`);
    });
  }

  if (job.caption) {
    parts.push(`
      <text x="48" y="${job.title ? 110 : 56}" font-family="Georgia, serif" font-size="18"
            fill="#e8d5b0" letter-spacing="0.14em">${escapeXml(String(job.caption).toUpperCase())}</text>`);
  }

  for (const b of job.bubbles || []) {
    if (!b.text?.trim()) continue;
    parts.push(renderBubbleSvg(b));
  }

  if (job.loreSidebar?.title) {
    const bodyLines = wrapWords(job.loreSidebar.body || "", 36);
    const boxW = 480;
    const boxH = 36 + bodyLines.length * 22 + 28;
    const left = W - boxW - 36;
    const top = H - boxH - 56;
    parts.push(`
      <rect x="${left}" y="${top}" width="${boxW}" height="${boxH}" rx="8"
            fill="rgba(20,14,10,0.82)" stroke="rgba(139,90,60,0.55)" stroke-width="2"/>
      <text x="${left + 16}" y="${top + 22}" font-family="Georgia, serif" font-size="12"
            fill="#ffb84d" letter-spacing="0.16em">LORE</text>
      <text x="${left + 16}" y="${top + 44}" font-family="Georgia, serif" font-size="20"
            fill="#f5ead2">${escapeXml(job.loreSidebar.title)}</text>
      ${bodyLines
        .map(
          (line, i) =>
            `<text x="${left + 16}" y="${top + 70 + i * 22}" font-family="Georgia, serif" font-size="15" fill="#f5ead2" opacity="0.92">${escapeXml(line)}</text>`,
        )
        .join("")}
    `);
  }

  if (!parts.length) return null;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${parts.join("\n")}
</svg>`);
}

async function bakeJob(job) {
  const plateAbs = path.join(ROOT, job.plateRel);
  const hasLettering =
    (job.bubbles && job.bubbles.length > 0) ||
    job.title ||
    job.caption ||
    job.loreSidebar;
  if (!hasLettering) return { skipped: true, reason: "no-text" };

  const base = ensureBase(plateAbs, job.issueSlug, job.pageNumber);
  const marker = path.join(
    BASE_DIR,
    job.issueSlug,
    `page-${String(job.pageNumber).padStart(2, "0")}.lettered`,
  );
  if (fs.existsSync(marker) && !force) {
    return { skipped: true, reason: "already-lettered" };
  }

  const overlay = renderOverlay(job);
  if (!overlay) return { skipped: true, reason: "empty-overlay" };

  const resizedBase = await sharp(base)
    .resize(W, H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  await sharp(resizedBase)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .webp({ quality: 88 })
    .toFile(plateAbs);

  fs.writeFileSync(marker, new Date().toISOString(), "utf8");
  return { skipped: false };
}

async function main() {
  const files = slugFilter
    ? [path.join(JOBS_DIR, `${slugFilter}.json`)]
    : fs
        .readdirSync(JOBS_DIR)
        .filter((f) => f.endsWith(".json") && f !== "all.json")
        .map((f) => path.join(JOBS_DIR, f));

  let baked = 0;
  let skipped = 0;
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`Missing jobs file: ${file} — run dump-lettering-jobs.mts first`);
      process.exit(1);
    }
    const jobs = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const job of jobs) {
      if (pageFilter && !pageFilter.has(job.pageNumber)) continue;
      const result = await bakeJob(job);
      if (result.skipped) {
        skipped += 1;
      } else {
        baked += 1;
        if (baked % 20 === 0) console.log(`  baked ${baked}…`);
      }
    }
    console.log(`ok ${path.basename(file)}`);
  }
  console.log(`done — baked ${baked}, skipped ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
