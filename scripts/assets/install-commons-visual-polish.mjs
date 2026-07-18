/**
 * Commons Live World visual polish pass:
 * - Install cutout building facades (market / arena / academy / portal)
 * - Upgrade soil terrain tiles + commons tileset masters
 * - Slice sharper prop sheets (basics + landmarks / watchtower)
 * - Mask studio plates → true RGBA
 * - Rebuild NPC overworld sheets from full-body sources
 *
 * Usage: node scripts/assets/install-commons-visual-polish.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const CURSOR_ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);
const GEN = [path.join(ROOT, "public/assets/game/_sources"), CURSOR_ASSETS];
const OUT_TERRAIN = path.join(ROOT, "public/assets/game/terrain");
const OUT_PROPS = path.join(ROOT, "public/assets/game/props");
const OUT_BUILDINGS = path.join(ROOT, "public/assets/game/buildings");
const OUT_TILESETS = path.join(ROOT, "public/assets/tilesets");

function resolveSrc(file) {
  for (const dir of GEN) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function writePng(buf, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(buf).png().toFile(dest);
  console.log("wrote", path.relative(ROOT, dest));
}

async function installBuildingCutout(srcFile, destName, size = 768) {
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing building", srcFile);
    return false;
  }
  // Keep a high-res copy in _sources for re-runs
  const archive = path.join(ROOT, "public/assets/game/_sources", path.basename(srcFile));
  if (path.resolve(src) !== path.resolve(archive)) {
    fs.mkdirSync(path.dirname(archive), { recursive: true });
    fs.copyFileSync(src, archive);
  }
  const buf = await sharp(src)
    .ensureAlpha()
    .resize(size, size, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .sharpen({ sigma: 0.7, m1: 0.5, m2: 0.35 })
    .png()
    .toBuffer();
  await writePng(buf, path.join(OUT_BUILDINGS, `${destName}.png`));
  return true;
}

async function sliceStrip(srcFile, names, outDir, size = 128) {
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing strip", srcFile);
    return;
  }
  const meta = await sharp(src).metadata();
  const tw = Math.floor(meta.width / names.length);
  const th = meta.height;
  for (let i = 0; i < names.length; i++) {
    const buf = await sharp(src)
      .extract({ left: i * tw, top: 0, width: tw, height: th })
      .resize(size, size, { fit: "cover" })
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.3 })
      .png()
      .toBuffer();
    await writePng(buf, path.join(outDir, `${names[i]}.png`));
  }
}

async function sliceGridInset(srcFile, names, cols, rows, outDir, size = 128, insetPct = 0.04) {
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing grid", srcFile);
    return;
  }
  const meta = await sharp(src).metadata();
  const tw = Math.floor(meta.width / cols);
  const th = Math.floor(meta.height / rows);
  const insetX = Math.floor(tw * insetPct);
  const insetY = Math.floor(th * insetPct);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const name = names[i++];
      if (!name) continue;
      const buf = await sharp(src)
        .extract({
          left: c * tw + insetX,
          top: r * th + insetY,
          width: tw - insetX * 2,
          height: th - insetY * 2,
        })
        .resize(size, size, { fit: "cover" })
        .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.3 })
        .png()
        .toBuffer();
      await writePng(buf, path.join(outDir, `${name}.png`));
    }
  }
}

async function slicePropSheet(srcFile, names, size = 176) {
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing prop sheet", srcFile);
    return;
  }
  const meta = await sharp(src).metadata();
  const tw = Math.floor(meta.width / 2);
  const th = Math.floor(meta.height / 2);
  let i = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const name = names[i++];
      if (!name) continue;
      const buf = await sharp(src)
        .extract({ left: c * tw, top: r * th, width: tw, height: th })
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .sharpen({ sigma: 0.7, m1: 0.55, m2: 0.35 })
        .png()
        .toBuffer();
      await writePng(buf, path.join(OUT_PROPS, `${name}.png`));
    }
  }
}

async function installTilesetMaster(srcFile) {
  const src = resolveSrc(srcFile);
  if (!src) return;
  fs.mkdirSync(OUT_TILESETS, { recursive: true });
  const dest = path.join(OUT_TILESETS, "commons-tileset.png");
  // Crop white gutters: take content with slight inset, normalize to 512x256 (4x2)
  const meta = await sharp(src).metadata();
  const inset = Math.floor(Math.min(meta.width, meta.height) * 0.02);
  const buf = await sharp(src)
    .extract({
      left: inset,
      top: inset,
      width: meta.width - inset * 2,
      height: meta.height - inset * 2,
    })
    .resize(512, 256, { fit: "fill" })
    .sharpen({ sigma: 0.5, m1: 0.45, m2: 0.3 })
    .png()
    .toBuffer();
  await writePng(buf, dest);
}

function runMask(targets) {
  const maskScript = path.join(ROOT, "scripts/assets/mask-npc-black.mjs");
  const existing = targets.filter((p) => fs.existsSync(p));
  if (!existing.length) return;
  const r = spawnSync(
    process.execPath,
    [maskScript, "--all-png", ...existing],
    { stdio: "inherit" },
  );
  if (r.status !== 0) console.warn("mask exited", r.status);
}

function rebuildNpcSheets() {
  const sheetScript = path.join(ROOT, "scripts/npcs/build-npc-overworld-sheets.mjs");
  const r = spawnSync(process.execPath, [sheetScript, "public/assets/npcs/riftwild-commons"], {
    stdio: "inherit",
  });
  if (r.status !== 0) console.warn("npc sheets exited", r.status);
}

async function main() {
  for (const d of [OUT_TERRAIN, OUT_PROPS, OUT_BUILDINGS, OUT_TILESETS]) {
    fs.mkdirSync(d, { recursive: true });
  }

  // Building cutouts (replace opaque scenic plates)
  await installBuildingCutout("building-market-cutout.png", "market", 768);
  await installBuildingCutout("building-arena-cutout.png", "arena", 768);
  await installBuildingCutout("building-academy-cutout.png", "academy", 768);
  await installBuildingCutout("building-portal-circle-cutout.png", "portal-circle", 640);

  // Terrain soil / packed dirt upgrades
  await sliceStrip(
    "terrain-soil-variants-strip.png",
    ["farm-soil", "settlement-soil", "training-dirt", "grass-dense"],
    OUT_TERRAIN,
    128,
  );

  // Tileset master + derived grass/plaza/path/water variants
  await installTilesetMaster("commons-tileset-v2.png");
  await sliceGridInset(
    "commons-tileset-v2.png",
    [
      "grass-lush",
      "plaza-stone",
      "path-worn",
      "water-master",
      "cliff-edge",
      "grass-dry",
      "settlement-soil",
      "grass-flowers-blue",
    ],
    4,
    2,
    OUT_TERRAIN,
    128,
    0.05,
  );
  // Keep farm/training from soil strip (re-apply after grid overwrote settlement)
  await sliceStrip(
    "terrain-soil-variants-strip.png",
    ["farm-soil", "settlement-soil", "training-dirt", "grass-dense"],
    OUT_TERRAIN,
    128,
  );

  // Sharper props
  await slicePropSheet("props-sheet-basics-v2.png", [
    "barrel",
    "crate",
    "signpost",
    "rift-crystal",
  ]);
  await slicePropSheet("props-sheet-landmarks-v2.png", [
    "watchtower",
    "banner-pole",
    "ruin-arch",
    "market-stall",
  ]);

  // Mask studio plates on new buildings + props
  runMask([
    OUT_PROPS,
    path.join(OUT_BUILDINGS, "market.png"),
    path.join(OUT_BUILDINGS, "arena.png"),
    path.join(OUT_BUILDINGS, "academy.png"),
    path.join(OUT_BUILDINGS, "portal-circle.png"),
  ]);

  // Also remask existing foliage/ambient props that already had alpha (safe)
  runMask([
    path.join(OUT_PROPS, "flowers.png"),
    path.join(OUT_PROPS, "lantern-post.png"),
    path.join(OUT_PROPS, "tree-small.png"),
    path.join(OUT_PROPS, "campfire.png"),
    path.join(OUT_PROPS, "bench.png"),
    path.join(OUT_PROPS, "anvil-forge.png"),
    path.join(OUT_PROPS, "bridge.png"),
    path.join(OUT_PROPS, "bush-berry.png"),
    path.join(OUT_PROPS, "rock-moss.png"),
  ]);

  rebuildNpcSheets();
  console.log("commons visual polish install complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
