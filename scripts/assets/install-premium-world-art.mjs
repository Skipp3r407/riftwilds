/**
 * Slice tilesets + generated prop sheets into public/assets/game/*
 * Also derives terrain variants from existing masters.
 *
 * Usage: node scripts/assets/install-premium-world-art.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT_TERRAIN = path.join(ROOT, "public/assets/game/terrain");
const OUT_PROPS = path.join(ROOT, "public/assets/game/props");
const OUT_BUILDINGS = path.join(ROOT, "public/assets/game/buildings");
const GEN_CANDIDATES = [
  path.join(ROOT, "public/assets/game/_sources"),
  path.join(
    process.env.USERPROFILE || "",
    ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
  ),
];
function resolveGen(file) {
  for (const dir of GEN_CANDIDATES) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) return p;
  }
  return path.join(GEN_CANDIDATES[0], file);
}

for (const d of [OUT_TERRAIN, OUT_PROPS, OUT_BUILDINGS]) {
  fs.mkdirSync(d, { recursive: true });
}

async function writePng(buf, dest) {
  await sharp(buf).png().toFile(dest);
  console.log("wrote", path.relative(ROOT, dest));
}

async function sliceGrid(src, outDir, names, cols, rows) {
  if (!fs.existsSync(src)) {
    console.warn("missing", src);
    return;
  }
  const meta = await sharp(src).metadata();
  const tw = Math.floor(meta.width / cols);
  const th = Math.floor(meta.height / rows);
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const name = names[i++];
      if (!name) continue;
      const buf = await sharp(src)
        .extract({ left: c * tw, top: r * th, width: tw, height: th })
        .resize(128, 128, { fit: "cover" })
        .png()
        .toBuffer();
      await writePng(buf, path.join(outDir, `${name}.png`));
    }
  }
}

async function sliceStrip(src, outDir, names) {
  if (!fs.existsSync(src)) {
    console.warn("missing", src);
    return;
  }
  const meta = await sharp(src).metadata();
  const tw = Math.floor(meta.width / names.length);
  const th = meta.height;
  for (let i = 0; i < names.length; i++) {
    const buf = await sharp(src)
      .extract({ left: i * tw, top: 0, width: tw, height: th })
      .resize(128, 128, { fit: "cover" })
      .png()
      .toBuffer();
    await writePng(buf, path.join(outDir, `${names[i]}.png`));
  }
}

/** Soft circular alpha so props aren't full opaque rectangles. */
async function softMaskProp(src, dest, size = 128) {
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}"><defs><radialGradient id="g" cx="50%" cy="55%" r="48%"><stop offset="70%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#g)"/></svg>`,
  );
  const buf = await sharp(src)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
  await writePng(buf, dest);
}

async function deriveTerrainFromMaster(src, dest, size = 128) {
  if (!fs.existsSync(src)) return;
  const buf = await sharp(src)
    .resize(size, size, { fit: "cover" })
    .modulate({ brightness: 1.02, saturation: 1.05 })
    .png()
    .toBuffer();
  await writePng(buf, dest);
}

/** Procedural painterly tile when we need extras. */
async function paintTile(dest, baseRgb, opts = {}) {
  const size = 128;
  const { data } = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: {
        r: baseRgb[0],
        g: baseRgb[1],
        b: baseRgb[2],
        alpha: 255,
      },
    },
  })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const seed = opts.seed ?? 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n =
        Math.sin((x + seed) * 0.17) * Math.cos((y + seed * 3) * 0.13) * 18 +
        Math.sin(x * 0.41 + y * 0.29) * 10;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n * 0.9));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n * 0.7));
      // speckles (flowers / pebbles)
      if (opts.speckle && ((x * 17 + y * 31 + seed) % 97) === 0) {
        data[i] = opts.speckle[0];
        data[i + 1] = opts.speckle[1];
        data[i + 2] = opts.speckle[2];
      }
    }
  }
  const buf = await sharp(data, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toBuffer();
  await writePng(buf, dest);
}

async function copyBuilding(src, destName) {
  if (!fs.existsSync(src)) return;
  const buf = await sharp(src)
    .resize(384, 256, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writePng(buf, path.join(OUT_BUILDINGS, `${destName}.png`));
}

async function main() {
  // Slice existing commons tileset (4x4)
  await sliceGrid(
    path.join(ROOT, "public/assets/tilesets/commons-tileset.png"),
    OUT_TERRAIN,
    [
      "grass-lush",
      "grass-flowers-blue",
      "grass-fern",
      "grass-flowers-white",
      "plaza-stone",
      "plaza-medallion",
      "plaza-street",
      "plaza-diamond",
      "path-curve",
      "path-rocky",
      "path-vertical",
      "path-roots",
      "path-bloom",
      "path-to-stone",
      "path-corner",
      "path-ruined",
    ],
    4,
    4,
  );

  // Masters → compact terrain keys
  await deriveTerrainFromMaster(
    path.join(ROOT, "public/assets/terrain/terrain-grass.png"),
    path.join(OUT_TERRAIN, "grass-master.png"),
  );
  await deriveTerrainFromMaster(
    path.join(ROOT, "public/assets/terrain/terrain-path.png"),
    path.join(OUT_TERRAIN, "path-master.png"),
  );
  await deriveTerrainFromMaster(
    path.join(ROOT, "public/assets/terrain/terrain-water.png"),
    path.join(OUT_TERRAIN, "water-master.png"),
  );

  // Generated strip
  await sliceStrip(resolveGen("terrain-variants-strip.png"), OUT_TERRAIN, [
    "path-worn",
    "plaza-moss",
    "water-stream",
    "cliff-edge",
  ]);

  // Prop sheets (2x2)
  const propSheets = [
    [
      "props-sheet-basics.png",
      ["barrel", "crate", "rift-crystal", "lantern-post"],
    ],
    [
      "props-sheet-foliage.png",
      ["bush-berry", "tree-small", "rock-moss", "flowers"],
    ],
    [
      "props-sheet-settlement.png",
      ["market-stall", "anvil-forge", "bench", "signpost"],
    ],
    [
      "props-sheet-ambient.png",
      ["campfire", "bridge", "ruin-arch", "banner-pole"],
    ],
  ];

  for (const [sheet, names] of propSheets) {
    const src = resolveGen(sheet);
    if (!fs.existsSync(src)) {
      console.warn("skip prop sheet", sheet);
      continue;
    }
    const meta = await sharp(src).metadata();
    const tw = Math.floor(meta.width / 2);
    const th = Math.floor(meta.height / 2);
    let i = 0;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const name = names[i++];
        const raw = await sharp(src)
          .extract({ left: c * tw, top: r * th, width: tw, height: th })
          .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        await writePng(raw, path.join(OUT_PROPS, `${name}.png`));
      }
    }
  }

  // Procedural fallbacks if sheets missing
  const fallbacks = [
    ["grass-dense", [34, 72, 42], { seed: 3, speckle: [180, 200, 90] }],
    ["grass-dry", [70, 90, 40], { seed: 7 }],
    ["settlement-soil", [90, 78, 52], { seed: 11 }],
    ["farm-soil", [96, 70, 40], { seed: 13, speckle: [60, 120, 50] }],
    ["training-dirt", [110, 88, 55], { seed: 17 }],
  ];
  for (const [name, rgb, opts] of fallbacks) {
    const dest = path.join(OUT_TERRAIN, `${name}.png`);
    if (!fs.existsSync(dest)) await paintTile(dest, rgb, opts);
  }

  // Buildings — copy commons + generated
  const commonsMap = {
    hatchery: "hatchery.png",
    arena: "arena.png",
    market: "marketplace.png",
    guild: "guild-hall.png",
    "portal-circle": "portal-circle.png",
  };
  for (const [key, file] of Object.entries(commonsMap)) {
    await copyBuilding(
      path.join(ROOT, "public/assets/buildings/commons", file),
      key,
    );
  }
  {
    const forge = resolveGen("building-forge.png");
    if (fs.existsSync(forge)) await copyBuilding(forge, "workshop");
  }
  {
    const lib = resolveGen("building-library.png");
    if (fs.existsSync(lib)) await copyBuilding(lib, "library");
  }
  // Recovery / homestead reuse tinted workshop if missing
  for (const key of ["recovery-center", "homestead-path"]) {
    const dest = path.join(OUT_BUILDINGS, `${key}.png`);
    if (!fs.existsSync(dest)) {
      const src = path.join(OUT_BUILDINGS, "workshop.png");
      if (fs.existsSync(src)) {
        const buf = await sharp(src)
          .modulate({ hue: key === "recovery-center" ? 40 : -20, saturation: 0.9 })
          .png()
          .toBuffer();
        await writePng(buf, dest);
      }
    }
  }

  // Key out white/black studio plates so Phaser props aren't opaque rectangles.
  const maskScript = path.join(ROOT, "scripts/assets/mask-npc-black.mjs");
  const maskTargets = [
    OUT_PROPS,
    path.join(OUT_BUILDINGS, "library.png"),
    path.join(OUT_BUILDINGS, "workshop.png"),
    path.join(OUT_BUILDINGS, "recovery-center.png"),
    path.join(OUT_BUILDINGS, "homestead-path.png"),
  ].filter((p) => fs.existsSync(p));
  if (maskTargets.length) {
    const r = spawnSync(
      process.execPath,
      [maskScript, "--all-png", ...maskTargets],
      { stdio: "inherit" },
    );
    if (r.status !== 0) {
      console.warn("mask-npc-black exited", r.status);
    }
  }

  console.log("premium world art install complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
