/**
 * Build 4-frame overworld sprite sheets from masked full-body / sprite sources.
 * Frame layout (horizontal): idle0 | walk1 | walk2 | walk3
 * Each frame is FRAME x FRAME with the character bottom-centered.
 *
 * Prefer full-body.png when it looks like a full figure; refuse portrait busts.
 *
 * Usage:
 *   node scripts/npcs/build-npc-overworld-sheets.mjs [regionDir]
 * Default: public/assets/npcs/riftwild-commons
 *
 * Writes: <npcDir>/overworld-sheet.png (FRAME*4 x FRAME)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const FRAME = 128;
const PAD = 8;

async function contentBounds(pngBuf) {
  const { data, info } = await sharp(pngBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  let found = false;
  let opaque = 0;
  let edgeClear = 0;
  let edgeTotal = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < 16) continue;
      found = true;
      opaque++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!found) return null;
  for (let x = 0; x < w; x++) {
    edgeTotal += 2;
    if (data[x * 4 + 3] < 16) edgeClear++;
    if (data[((h - 1) * w + x) * 4 + 3] < 16) edgeClear++;
  }
  for (let y = 0; y < h; y++) {
    edgeTotal += 2;
    if (data[y * w * 4 + 3] < 16) edgeClear++;
    if (data[(y * w + w - 1) * 4 + 3] < 16) edgeClear++;
  }
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  return {
    left: minX,
    top: minY,
    width: bw,
    height: bh,
    aspect: bh / bw,
    fill: opaque / (w * h),
    edgeClear: edgeClear / edgeTotal,
  };
}

/** Reject portrait busts used as world actors (floating heads). */
function isWorldWorthy(bounds, opts = {}) {
  if (!bounds) return false;
  const creature = opts.creature === true;
  if (creature) {
    // Riftlings are squat — require transparency + opaque content, not tall aspect
    return bounds.edgeClear >= 0.2 && bounds.fill < 0.92 && bounds.aspect >= 0.7;
  }
  // Humans: need taller-than-wide silhouette OR clearly masked figure with limbs
  if (bounds.aspect >= 1.25 && bounds.edgeClear >= 0.2) return true;
  if (bounds.aspect >= 1.15 && bounds.edgeClear >= 0.35 && bounds.fill < 0.7) return true;
  return false;
}

async function scoreSource(filePath, opts) {
  if (!fs.existsSync(filePath)) return null;
  const buf = await sharp(filePath).ensureAlpha().png().toBuffer();
  const bounds = await contentBounds(buf);
  if (!isWorldWorthy(bounds, opts)) return null;
  return { path: filePath, bounds, buf };
}

async function pickSource(dir) {
  const slug = path.basename(dir);
  const creature = slug.startsWith("riftling-");
  const full = path.join(dir, "full-body.png");
  const sprite = path.join(dir, "sprite.png");
  // Prefer dedicated full-body, then sprite
  const candidates = [];
  for (const p of [full, sprite]) {
    const scored = await scoreSource(p, { creature });
    if (scored) candidates.push(scored);
  }
  if (candidates.length === 0) return null;
  // Prefer taller aspect (more body) then more edge clearance
  candidates.sort((a, b) => {
    const score = (c) => c.bounds.aspect * 2 + c.bounds.edgeClear;
    return score(b) - score(a);
  });
  return candidates[0];
}

async function buildSheet(srcBuf, outPath) {
  const bounds = await contentBounds(srcBuf);
  if (!bounds) throw new Error("no opaque pixels");

  const cropped = await sharp(srcBuf)
    .extract({
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    })
    .resize({
      width: FRAME - PAD * 2,
      height: FRAME - PAD * 2,
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.75, m1: 0.55, m2: 0.35 })
    .png()
    .toBuffer();

  const meta = await sharp(cropped).metadata();
  const cw = meta.width ?? FRAME;
  const ch = meta.height ?? FRAME;

  // Idle bob + walk sway / contact (procedural from a single pose)
  const poses = [
    { dx: 0, dy: 0 }, // idle
    { dx: -4, dy: -5 }, // walk lift L
    { dx: 0, dy: 1 }, // contact
    { dx: 4, dy: -5 }, // walk lift R
  ];

  const frames = [];
  for (const pose of poses) {
    const left = Math.round((FRAME - cw) / 2 + pose.dx);
    const top = Math.round(FRAME - PAD - ch + pose.dy);
    const frame = await sharp({
      create: {
        width: FRAME,
        height: FRAME,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: cropped, left: Math.max(0, left), top: Math.max(0, top) }])
      .png()
      .toBuffer();
    frames.push(frame);
  }

  await sharp({
    create: {
      width: FRAME * 4,
      height: FRAME,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      frames.map((input, i) => ({
        input,
        left: i * FRAME,
        top: 0,
      })),
    )
    .png()
    .toFile(outPath);

  return { frame: FRAME, frames: 4, char: `${cw}x${ch}`, aspect: bounds.aspect };
}

async function main() {
  const regionRel = process.argv[2] ?? "public/assets/npcs/riftwild-commons";
  const regionDir = path.resolve(root, regionRel);
  if (!fs.existsSync(regionDir)) {
    console.error("Missing region dir:", regionDir);
    process.exit(1);
  }

  const dirs = fs
    .readdirSync(regionDir)
    .map((n) => path.join(regionDir, n))
    .filter((p) => fs.statSync(p).isDirectory())
    .sort();

  let ok = 0;
  let skipped = 0;
  for (const dir of dirs) {
    const picked = await pickSource(dir);
    if (!picked) {
      console.warn(
        "skip (no world-worthy full-body/sprite — refusing portrait bust)",
        path.basename(dir),
      );
      skipped++;
      continue;
    }
    const out = path.join(dir, "overworld-sheet.png");
    try {
      const info = await buildSheet(picked.buf, out);
      console.log(
        `ok ${path.basename(dir)} ← ${path.basename(picked.path)} → overworld-sheet.png (${info.frames}×${info.frame}, char ${info.char}, aspect ${info.aspect.toFixed(2)})`,
      );
      ok++;
    } catch (e) {
      console.error(`FAIL ${path.basename(dir)}:`, e.message ?? e);
    }
  }
  console.log(`Built ${ok}/${dirs.length} sheets in ${regionRel} (skipped busts: ${skipped})`);
  if (skipped > 0) process.exitCode = 0; // warn-only; tests enforce Commons
}

main();
