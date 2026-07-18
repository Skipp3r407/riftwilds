/**
 * Audit Commons NPC world sprites for floating-head / bust-only risk.
 * Heuristic: content aspect ratio, edge transparency, fill ratio.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const region = process.argv[2] ?? "public/assets/npcs/riftwild-commons";
const regionDir = path.resolve(ROOT, region);

async function bounds(pngPath) {
  const { data, info } = await sharp(pngPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0,
    opaque = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < 16) continue;
      opaque++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (opaque === 0) return null;
  let edgeClear = 0;
  let edgeTotal = 0;
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
    w,
    h,
    bw,
    bh,
    aspect: bh / bw,
    fill: opaque / (w * h),
    edgeClear: edgeClear / edgeTotal,
  };
}

function classify(b, opts = {}) {
  if (!b) return "missing";
  // Riftlings are squat full creatures — don't require tall human aspect
  if (opts.creature) {
    if (b.edgeClear >= 0.35 && b.fill < 0.9 && b.aspect >= 0.7) return "full_body";
    if (b.edgeClear >= 0.2 && b.fill < 0.92) return "likely_full_body";
    return "floating_head";
  }
  // Full-body sprites are taller than wide and have transparent edges
  if (b.aspect >= 1.35 && b.edgeClear >= 0.35) return "full_body";
  if (b.aspect >= 1.2 && b.edgeClear >= 0.25 && b.fill < 0.75) return "likely_full_body";
  if (b.aspect < 1.15 || b.edgeClear < 0.12 || b.fill > 0.88) return "floating_head";
  return "ambiguous";
}

const rows = [];
for (const slug of fs.readdirSync(regionDir).sort()) {
  const dir = path.join(regionDir, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const sprite = path.join(dir, "sprite.png");
  const full = path.join(dir, "full-body.png");
  const sheet = path.join(dir, "overworld-sheet.png");
  const creature = slug.startsWith("riftling-");
  const sb = fs.existsSync(sprite) ? await bounds(sprite) : null;
  const fb = fs.existsSync(full) ? await bounds(full) : null;
  const sheetOk = fs.existsSync(sheet);
  const spriteClass = classify(sb, { creature });
  const fullClass = classify(fb, { creature });
  const worldSource = spriteClass.startsWith("full") || spriteClass === "likely_full_body"
    ? "sprite"
    : fullClass.startsWith("full") || fullClass === "likely_full_body"
      ? "full-body"
      : "NONE";
  rows.push({
    slug,
    spriteClass,
    fullClass,
    worldSource,
    sheetOk,
    spriteAspect: sb?.aspect?.toFixed(2) ?? "-",
    fullAspect: fb?.aspect?.toFixed(2) ?? "-",
    spriteEdge: sb ? (sb.edgeClear * 100).toFixed(0) + "%" : "-",
  });
}

console.log(
  "slug".padEnd(28),
  "sprite".padEnd(18),
  "fullBody".padEnd(18),
  "worldSrc".padEnd(12),
  "sheet",
  "sAsp",
  "fAsp",
  "sEdge",
);
for (const r of rows) {
  console.log(
    r.slug.padEnd(28),
    r.spriteClass.padEnd(18),
    r.fullClass.padEnd(18),
    r.worldSource.padEnd(12),
    r.sheetOk ? "yes" : "no",
    r.spriteAspect,
    r.fullAspect,
    r.spriteEdge,
  );
}
const heads = rows.filter((r) => r.worldSource === "NONE");
console.log(`\nFloating-head world risk: ${heads.length}/${rows.length}`);
heads.forEach((r) => console.log(" -", r.slug));
