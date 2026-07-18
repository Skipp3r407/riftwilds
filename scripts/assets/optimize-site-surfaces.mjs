/**
 * Compress heavy marketing / terrain / empty-state / map PNGs for delivery.
 * Writes optimized PNG + WebP companions where helpful.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");

const JOBS = [
  { rel: "public/assets/marketing/og-default.png", maxW: 1200, maxH: 675, webp: true },
  { rel: "public/assets/brand/og-default.png", maxW: 1200, maxH: 675, webp: true },
  { rel: "public/assets/maps/world-overview.png", maxW: 1600, maxH: 900, webp: true },
  { rel: "public/assets/ui/empty-states/inventory.png", maxW: 512, maxH: 512, webp: true },
  { rel: "public/assets/ui/empty-states/pets.png", maxW: 512, maxH: 512, webp: true },
  { rel: "public/assets/ui/empty-states/quests.png", maxW: 512, maxH: 512, webp: true },
  { rel: "public/assets/terrain/terrain-grass.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/terrain-path.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/terrain-water.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/terrain-lava.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/terrain-cliff.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/terrain-safe.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/terrain-hazard.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/ground.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/path.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/water.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/lava.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/cliff.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/safe.png", maxW: 512, maxH: 512, webp: false },
  { rel: "public/assets/terrain/hazard.png", maxW: 512, maxH: 512, webp: false },
];

async function optimizeOne(job) {
  const full = path.join(ROOT, job.rel);
  if (!fs.existsSync(full)) {
    console.log(`skip missing ${job.rel}`);
    return 0;
  }
  const before = fs.statSync(full).size;
  const tmp = full + ".tmp";
  await sharp(full)
    .rotate()
    .resize(job.maxW, job.maxH, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, effort: 8 })
    .toFile(tmp);
  fs.renameSync(tmp, full);
  if (job.webp) {
    const webpPath = full.replace(/\.png$/i, ".webp");
    await sharp(full).webp({ quality: 80 }).toFile(webpPath);
  }
  const after = fs.statSync(full).size;
  console.log(
    `${job.rel}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`,
  );
  return Math.max(0, before - after);
}

async function buildTileset() {
  const outDir = path.join(ROOT, "public/assets/tilesets");
  fs.mkdirSync(outDir, { recursive: true });
  const tiles = [
    "terrain-grass",
    "terrain-path",
    "terrain-water",
    "terrain-lava",
    "terrain-cliff",
    "terrain-safe",
    "terrain-hazard",
    "terrain-path", // pad to 8
  ];
  const size = 64;
  const cols = 4;
  const rows = 2;
  const composites = [];
  for (let i = 0; i < tiles.length; i++) {
    const src = path.join(ROOT, "public/assets/terrain", `${tiles[i]}.png`);
    if (!fs.existsSync(src)) continue;
    const buf = await sharp(src)
      .resize(size, size, { fit: "cover" })
      .png()
      .toBuffer();
    composites.push({
      input: buf,
      left: (i % cols) * size,
      top: Math.floor(i / cols) * size,
    });
  }
  const out = path.join(outDir, "commons-tileset.png");
  await sharp({
    create: {
      width: cols * size,
      height: rows * size,
      channels: 4,
      background: { r: 20, g: 24, b: 32, alpha: 1 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`tileset → ${out} (${fs.statSync(out).size} bytes)`);
}

async function main() {
  let saved = 0;
  for (const job of JOBS) saved += await optimizeOne(job);
  await buildTileset();
  console.log(`Saved ~${Math.round(saved / 1024)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
