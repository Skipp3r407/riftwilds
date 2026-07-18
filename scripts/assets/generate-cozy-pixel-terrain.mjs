/**
 * Original-IP cozy 16-bit style terrain tiles for Live World Commons.
 * Procedural nearest-neighbor pixel art → 128px PNG. No third-party packs.
 *
 * Usage: node scripts/assets/generate-cozy-pixel-terrain.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "public/assets/game/terrain");
const CELL = 16; // source pixel grid
const OUT_SIZE = 128;

function hash2(x, y, salt = 0) {
  let n = x * 374761393 + y * 668265263 + salt * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function setPx(data, x, y, rgb) {
  if (x < 0 || y < 0 || x >= CELL || y >= CELL) return;
  const i = (y * CELL + x) * 4;
  data[i] = rgb[0];
  data[i + 1] = rgb[1];
  data[i + 2] = rgb[2];
  data[i + 3] = 255;
}

function fillBase(data, rgb) {
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      setPx(data, x, y, rgb);
    }
  }
}

function dither(data, seed, a, b, threshold = 0.55) {
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      if (hash2(x, y, seed) > threshold) setPx(data, x, y, b);
      else if (hash2(x, y, seed + 3) > 0.82) setPx(data, x, y, a);
    }
  }
}

function speckles(data, seed, colors, chance = 0.08) {
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      if (hash2(x, y, seed) < chance) {
        const c = colors[Math.floor(hash2(x, y, seed + 9) * colors.length) % colors.length];
        setPx(data, x, y, c);
      }
    }
  }
}

function tuft(data, cx, cy, rgb) {
  setPx(data, cx, cy, rgb);
  setPx(data, cx + 1, cy, rgb);
  setPx(data, cx, cy - 1, rgb);
}

const C = {
  grassDeep: [47, 110, 52],
  grassMid: [74, 158, 74],
  grassLight: [106, 186, 92],
  grassHi: [140, 205, 110],
  pathDeep: [140, 108, 68],
  pathMid: [186, 148, 96],
  pathLight: [214, 180, 122],
  pathHi: [230, 200, 150],
  plaza: [196, 168, 130],
  plazaMoss: [150, 160, 100],
  waterDeep: [45, 130, 190],
  waterMid: [70, 170, 220],
  waterLight: [140, 220, 245],
  waterSpark: [230, 250, 255],
  flowerBlue: [110, 150, 230],
  flowerWhite: [245, 245, 235],
  flowerPink: [230, 140, 180],
  flowerAmber: [255, 200, 90],
  fern: [58, 120, 62],
  dry: [150, 140, 70],
  cliff: [110, 100, 80],
  farm: [120, 90, 55],
  cyan: [61, 231, 255],
};

async function writeTile(name, paint) {
  const data = Buffer.alloc(CELL * CELL * 4);
  paint(data);
  const buf = await sharp(data, {
    raw: { width: CELL, height: CELL, channels: 4 },
  })
    .resize(OUT_SIZE, OUT_SIZE, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  const dest = path.join(OUT, `${name}.png`);
  await sharp(buf).png().toFile(dest);
  console.log("wrote", path.relative(ROOT, dest));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  await writeTile("grass-master", (d) => {
    fillBase(d, C.grassMid);
    dither(d, 1, C.grassDeep, C.grassLight, 0.5);
    speckles(d, 11, [C.grassHi, C.fern], 0.1);
    for (let i = 0; i < 5; i++) {
      tuft(d, 2 + Math.floor(hash2(i, 1, 2) * 12), 3 + Math.floor(hash2(i, 2, 3) * 11), C.grassDeep);
    }
  });

  await writeTile("grass-lush", (d) => {
    fillBase(d, C.grassLight);
    dither(d, 2, C.grassMid, C.grassHi, 0.48);
    speckles(d, 12, [C.grassDeep, C.flowerAmber], 0.09);
  });

  await writeTile("grass-dense", (d) => {
    fillBase(d, C.grassDeep);
    dither(d, 3, C.grassMid, C.fern, 0.52);
    speckles(d, 13, [C.grassLight], 0.12);
  });

  await writeTile("grass-fern", (d) => {
    fillBase(d, C.grassMid);
    dither(d, 4, C.fern, C.grassDeep, 0.5);
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(hash2(i, 4, 1) * 14) + 1;
      const y = Math.floor(hash2(i, 5, 2) * 13) + 2;
      setPx(d, x, y, C.fern);
      setPx(d, x, y - 1, C.grassLight);
    }
  });

  await writeTile("grass-flowers-blue", (d) => {
    fillBase(d, C.grassMid);
    dither(d, 5, C.grassLight, C.grassDeep, 0.55);
    speckles(d, 15, [C.flowerBlue, C.flowerWhite, C.grassHi], 0.14);
  });

  await writeTile("grass-flowers-white", (d) => {
    fillBase(d, C.grassLight);
    dither(d, 6, C.grassMid, C.grassHi, 0.55);
    speckles(d, 16, [C.flowerWhite, C.flowerPink, C.flowerAmber], 0.13);
  });

  await writeTile("grass-dry", (d) => {
    fillBase(d, C.dry);
    dither(d, 7, C.pathMid, C.grassMid, 0.6);
    speckles(d, 17, [C.pathDeep], 0.08);
  });

  await writeTile("path-master", (d) => {
    fillBase(d, C.pathMid);
    dither(d, 8, C.pathDeep, C.pathLight, 0.5);
    speckles(d, 18, [C.pathHi, C.plazaMoss], 0.07);
  });

  await writeTile("path-worn", (d) => {
    fillBase(d, C.pathDeep);
    dither(d, 9, C.pathMid, C.pathLight, 0.48);
    speckles(d, 19, [C.pathHi], 0.1);
  });

  await writeTile("path-rocky", (d) => {
    fillBase(d, C.pathMid);
    dither(d, 10, C.cliff, C.pathDeep, 0.55);
    speckles(d, 20, [C.pathLight, C.plaza], 0.12);
  });

  await writeTile("path-bloom", (d) => {
    fillBase(d, C.pathLight);
    dither(d, 21, C.pathMid, C.grassLight, 0.62);
    speckles(d, 22, [C.flowerPink, C.flowerWhite, C.flowerAmber], 0.1);
  });

  await writeTile("path-to-stone", (d) => {
    fillBase(d, C.plaza);
    dither(d, 23, C.pathMid, C.pathLight, 0.5);
    speckles(d, 24, [C.plazaMoss, C.cliff], 0.09);
  });

  await writeTile("path-curve", (d) => {
    fillBase(d, C.pathMid);
    dither(d, 25, C.pathDeep, C.pathLight, 0.5);
  });

  await writeTile("path-vertical", (d) => {
    fillBase(d, C.pathMid);
    for (let y = 0; y < CELL; y++) {
      for (let x = 5; x < 11; x++) setPx(d, x, y, y % 2 ? C.pathLight : C.pathDeep);
    }
    dither(d, 48, C.grassMid, C.pathLight, 0.72);
  });

  await writeTile("path-corner", (d) => {
    fillBase(d, C.grassMid);
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL; x++) {
        if (x >= 5 && y >= 5) setPx(d, x, y, hash2(x, y, 49) > 0.5 ? C.pathMid : C.pathLight);
      }
    }
  });

  await writeTile("path-roots", (d) => {
    fillBase(d, C.pathDeep);
    dither(d, 26, C.grassDeep, C.pathMid, 0.55);
    for (let i = 0; i < 6; i++) {
      setPx(d, Math.floor(hash2(i, 1, 26) * 15), Math.floor(hash2(i, 2, 27) * 15), [90, 60, 35]);
    }
  });

  await writeTile("path-ruined", (d) => {
    fillBase(d, C.cliff);
    dither(d, 27, C.pathDeep, C.plazaMoss, 0.55);
  });

  await writeTile("plaza-stone", (d) => {
    fillBase(d, C.plaza);
    dither(d, 28, C.pathLight, [170, 145, 110], 0.5);
    speckles(d, 29, [C.plazaMoss], 0.06);
  });

  await writeTile("plaza-street", (d) => {
    fillBase(d, C.pathLight);
    dither(d, 30, C.plaza, C.pathMid, 0.5);
  });

  await writeTile("plaza-moss", (d) => {
    fillBase(d, C.plaza);
    dither(d, 31, C.plazaMoss, C.grassMid, 0.55);
    speckles(d, 32, [C.grassLight], 0.08);
  });

  await writeTile("plaza-diamond", (d) => {
    fillBase(d, C.plaza);
    dither(d, 33, C.pathLight, C.pathMid, 0.5);
    for (let i = 4; i < 12; i++) {
      setPx(d, i, i, C.cyan);
      setPx(d, 15 - i, i, C.cyan);
    }
  });

  await writeTile("plaza-medallion", (d) => {
    fillBase(d, C.pathLight);
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL; x++) {
        const dist = Math.hypot(x - 7.5, y - 7.5);
        if (dist < 3.2) setPx(d, x, y, C.cyan);
        else if (dist < 5.5) setPx(d, x, y, C.plaza);
        else if (dist < 7) setPx(d, x, y, C.pathMid);
      }
    }
  });

  await writeTile("water-master", (d) => {
    fillBase(d, C.waterMid);
    dither(d, 40, C.waterDeep, C.waterLight, 0.5);
    speckles(d, 41, [C.waterSpark, C.cyan], 0.08);
  });

  await writeTile("water-stream", (d) => {
    fillBase(d, C.waterLight);
    dither(d, 42, C.waterMid, C.waterDeep, 0.52);
    for (let x = 0; x < CELL; x++) {
      if (x % 3 === 0) setPx(d, x, 4 + (x % 5), C.waterSpark);
      if (x % 4 === 1) setPx(d, x, 10 + (x % 3), C.waterSpark);
    }
  });

  await writeTile("farm-soil", (d) => {
    fillBase(d, C.farm);
    dither(d, 43, C.pathDeep, [100, 75, 45], 0.5);
    for (let y = 2; y < CELL; y += 3) {
      for (let x = 0; x < CELL; x++) setPx(d, x, y, [90, 65, 40]);
    }
  });

  await writeTile("cliff-edge", (d) => {
    fillBase(d, C.cliff);
    dither(d, 44, C.pathDeep, [130, 120, 95], 0.5);
  });

  await writeTile("settlement-soil", (d) => {
    fillBase(d, C.pathMid);
    dither(d, 45, C.farm, C.grassMid, 0.6);
    speckles(d, 46, [C.pathLight], 0.07);
  });

  await writeTile("training-dirt", (d) => {
    fillBase(d, C.pathDeep);
    dither(d, 47, C.farm, C.pathMid, 0.5);
  });

  console.log("cozy pixel terrain pass complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
