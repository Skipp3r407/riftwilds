/**
 * Original-IP cozy 16-bit Live World pack (Riftwilds theme).
 * Terrain, cottages, props, keeper + Riftling actors — procedural pixel buffers.
 * Never copies third-party packs. No API key.
 *
 * Usage: node scripts/assets/generate-cozy-pixel-world.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_TERRAIN = path.join(ROOT, "public/assets/game/terrain");
const OUT_PROPS = path.join(ROOT, "public/assets/game/props");
const OUT_BUILDINGS = path.join(ROOT, "public/assets/game/buildings");
const OUT_ACTORS = path.join(ROOT, "public/assets/game/actors");

const C = {
  ink: [42, 34, 24],
  grass1: [74, 168, 74],
  grass2: [58, 140, 62],
  grass3: [106, 196, 92],
  grassHi: [140, 214, 118],
  flowerP: [220, 130, 180],
  flowerW: [245, 245, 235],
  flowerB: [120, 150, 230],
  flowerA: [255, 200, 90],
  path1: [196, 152, 96],
  path2: [168, 124, 74],
  path3: [222, 186, 130],
  pathEdge: [140, 108, 68],
  water1: [70, 170, 220],
  water2: [45, 130, 190],
  water3: [150, 225, 245],
  waterDeep: [30, 100, 160],
  lily: [70, 160, 80],
  wood: [150, 96, 52],
  woodDk: [96, 58, 30],
  woodLt: [196, 140, 88],
  roof: [168, 78, 58],
  roofLt: [200, 110, 78],
  roofDk: [120, 52, 40],
  plaster: [232, 214, 180],
  stone: [160, 150, 130],
  stoneDk: [110, 100, 85],
  cream: [244, 234, 212],
  amber: [255, 184, 77],
  cyan: [61, 231, 255],
  cyanDk: [30, 160, 180],
  leaf1: [74, 168, 74],
  leaf2: [48, 120, 56],
  leaf3: [120, 200, 100],
  bark: [110, 70, 40],
  barkW: [220, 220, 210],
  shadow: [40, 50, 30, 90],
  skin: [240, 200, 160],
  hair: [90, 60, 40],
  tunic: [70, 140, 190],
  tunicDk: [40, 90, 130],
};

function hash2(x, y, salt = 0) {
  let n = x * 374761393 + y * 668265263 + salt * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function makeCanvas(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}

function set(c, x, y, rgba) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  c.data[i] = rgba[0];
  c.data[i + 1] = rgba[1];
  c.data[i + 2] = rgba[2];
  c.data[i + 3] = rgba[3] ?? 255;
}

function getA(c, x, y) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return 0;
  return c.data[(y * c.w + x) * 4 + 3];
}

function fill(c, rgba) {
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) set(c, x, y, rgba);
}

function fillRect(c, x0, y0, w, h, rgba) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(c, x, y, rgba);
}

function fillEllipse(c, cx, cy, rx, ry, rgba) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) set(c, x, y, rgba);
    }
  }
}

function outlineOpaque(c, ink = C.ink) {
  const copy = Buffer.from(c.data);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const a = copy[(y * c.w + x) * 4 + 3];
      if (a < 8) continue;
      const edge =
        getA({ ...c, data: copy }, x - 1, y) < 8 ||
        getA({ ...c, data: copy }, x + 1, y) < 8 ||
        getA({ ...c, data: copy }, x, y - 1) < 8 ||
        getA({ ...c, data: copy }, x, y + 1) < 8;
      if (edge) set(c, x, y, ink);
    }
  }
}

async function writeUpscaled(c, dest, scale = 4) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const buf = await sharp(c.data, { raw: { width: c.w, height: c.h, channels: 4 } })
    .resize(c.w * scale, c.h * scale, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  await sharp(buf).png().toFile(dest);
  console.log("wrote", path.relative(ROOT, dest));
}

function paintGrass(c, seed, flowers = true) {
  fill(c, C.grass1);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const h = hash2(x, y, seed);
      if (h < 0.22) set(c, x, y, C.grass2);
      else if (h > 0.78) set(c, x, y, C.grass3);
      else if (h > 0.92) set(c, x, y, C.grassHi);
      if (flowers && hash2(x, y, seed + 9) < 0.04) {
        const f = [C.flowerP, C.flowerW, C.flowerB, C.flowerA][
          Math.floor(hash2(x, y, seed + 11) * 4) % 4
        ];
        set(c, x, y, f);
      }
      // tufts
      if (hash2(x, y, seed + 21) < 0.03 && y > 1) {
        set(c, x, y, C.grass2);
        set(c, x, y - 1, C.grass3);
      }
    }
  }
}

function paintPath(c, seed, worn = false) {
  fill(c, worn ? C.path2 : C.path1);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const h = hash2(x, y, seed);
      if (h < 0.25) set(c, x, y, C.path2);
      else if (h > 0.8) set(c, x, y, C.path3);
      if (hash2(x, y, seed + 4) < 0.05) set(c, x, y, C.stone);
    }
  }
}

function paintPathBorder(c, seed) {
  paintGrass(c, seed, false);
  // soft dirt oval center with jagged edge
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const dx = (x - c.w / 2) / (c.w * 0.42);
      const dy = (y - c.h / 2) / (c.h * 0.38);
      const edgeNoise = (hash2(x, y, seed) - 0.5) * 0.35;
      if (dx * dx + dy * dy + edgeNoise < 1) {
        const h = hash2(x, y, seed + 2);
        set(c, x, y, h < 0.3 ? C.path2 : h > 0.75 ? C.path3 : C.path1);
      } else if (dx * dx + dy * dy + edgeNoise < 1.15) {
        set(c, x, y, C.pathEdge);
      }
    }
  }
}

/** Directional path↔grass seam. dir: n|s|e|w — grass on that side, dirt on the other. */
function paintPathEdgeDir(c, seed, dir) {
  paintGrass(c, seed, true);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const n = (hash2(x, y, seed) - 0.5) * 3.2;
      let onPath = false;
      if (dir === "n") onPath = y > c.h * 0.42 + n;
      else if (dir === "s") onPath = y < c.h * 0.58 + n;
      else if (dir === "e") onPath = x < c.w * 0.58 + n;
      else if (dir === "w") onPath = x > c.w * 0.42 + n;
      if (!onPath) continue;
      const edge =
        (dir === "n" && y < c.h * 0.42 + n + 2.2) ||
        (dir === "s" && y > c.h * 0.58 + n - 2.2) ||
        (dir === "e" && x > c.w * 0.58 + n - 2.2) ||
        (dir === "w" && x < c.w * 0.42 + n + 2.2);
      if (edge) set(c, x, y, C.pathEdge);
      else {
        const h = hash2(x, y, seed + 2);
        set(c, x, y, h < 0.28 ? C.path2 : h > 0.78 ? C.path3 : C.path1);
      }
    }
  }
}

/** Path corner: dirt fills the opposite quadrant from grass (dir like "ne" = grass NE). */
function paintPathCorner(c, seed, dir) {
  paintGrass(c, seed, true);
  const grassN = dir.includes("n");
  const grassE = dir.includes("e");
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const nx = (hash2(x, y, seed) - 0.5) * 2.8;
      const ny = (hash2(x, y, seed + 1) - 0.5) * 2.8;
      const midX = c.w * 0.5 + nx;
      const midY = c.h * 0.5 + ny;
      const inGrassX = grassE ? x > midX : x < midX;
      const inGrassY = grassN ? y < midY : y > midY;
      if (inGrassX && inGrassY) continue;
      const near =
        Math.abs(x - midX) < 2.4 || Math.abs(y - midY) < 2.4 || (inGrassX !== inGrassY);
      const h = hash2(x, y, seed + 2);
      if (near && !(inGrassX && inGrassY)) set(c, x, y, C.pathEdge);
      else set(c, x, y, h < 0.28 ? C.path2 : h > 0.78 ? C.path3 : C.path1);
    }
  }
}

function paintWater(c, seed, lily = false) {
  fill(c, C.water1);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const h = hash2(x, y, seed);
      if (h < 0.2) set(c, x, y, C.water2);
      else if (h > 0.85) set(c, x, y, C.water3);
      if ((x + y * 2 + seed) % 11 === 0) set(c, x, y, C.water3);
    }
  }
  if (lily) {
    fillEllipse(c, 10, 10, 3, 2, C.lily);
    fillEllipse(c, 22, 18, 2, 2, C.lily);
    set(c, 10, 10, C.flowerW);
  }
}

function paintWaterEdge(c, seed) {
  paintGrass(c, seed, true);
  for (let y = c.h / 2; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const shore = y < c.h / 2 + 2 + Math.floor(hash2(x, y, seed) * 3);
      if (!shore) {
        const h = hash2(x, y, seed + 3);
        set(c, x, y, h < 0.25 ? C.water2 : C.water1);
      } else if (y >= c.h / 2) {
        set(c, x, y, C.stoneDk);
      }
    }
  }
  fillEllipse(c, 8, 22, 2, 1, C.lily);
}

/** Directional pond shore — grass on `dir` side, water opposite, pebbled seam. */
function paintWaterEdgeDir(c, seed, dir) {
  paintGrass(c, seed, true);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const n = (hash2(x, y, seed) - 0.5) * 2.6;
      let onWater = false;
      if (dir === "n") onWater = y > c.h * 0.48 + n;
      else if (dir === "s") onWater = y < c.h * 0.52 + n;
      else if (dir === "e") onWater = x < c.w * 0.52 + n;
      else if (dir === "w") onWater = x > c.w * 0.48 + n;
      if (!onWater) continue;
      const shoreBand =
        (dir === "n" && y < c.h * 0.48 + n + 2.5) ||
        (dir === "s" && y > c.h * 0.52 + n - 2.5) ||
        (dir === "e" && x > c.w * 0.52 + n - 2.5) ||
        (dir === "w" && x < c.w * 0.48 + n + 2.5);
      if (shoreBand) {
        set(c, x, y, hash2(x, y, seed + 4) > 0.55 ? C.stoneDk : C.stone);
      } else {
        const h = hash2(x, y, seed + 3);
        set(c, x, y, h < 0.2 ? C.waterDeep : h > 0.82 ? C.water3 : C.water1);
        if ((x + y + seed) % 13 === 0) set(c, x, y, C.water3);
      }
    }
  }
  if (dir === "s" || dir === "n") fillEllipse(c, 10, dir === "s" ? 10 : 22, 2, 1, C.lily);
}

function paintWaterCorner(c, seed, dir) {
  paintGrass(c, seed, true);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const nx = (hash2(x, y, seed) - 0.5) * 2.4;
      const ny = (hash2(x, y, seed + 1) - 0.5) * 2.4;
      const midX = c.w * 0.5 + nx;
      const midY = c.h * 0.5 + ny;
      // grass occupies the named corner; water fills the rest
      const onWater =
        dir === "ne"
          ? x < midX || y > midY
          : dir === "nw"
            ? x > midX || y > midY
            : dir === "se"
              ? x < midX || y < midY
              : x > midX || y < midY;
      if (!onWater) continue;
      const shore = Math.abs(x - midX) < 2.2 || Math.abs(y - midY) < 2.2;
      if (shore) set(c, x, y, C.stoneDk);
      else {
        const h = hash2(x, y, seed + 3);
        set(c, x, y, h < 0.22 ? C.waterDeep : C.water1);
      }
    }
  }
}

function paintPlaza(c, seed, medallion = false) {
  fill(c, C.stone);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if ((x % 8 === 0 || y % 8 === 0) && hash2(x, y, seed) > 0.2) set(c, x, y, C.stoneDk);
      else if (hash2(x, y, seed + 1) > 0.85) set(c, x, y, C.path3);
      else if (hash2(x, y, seed + 2) < 0.08) set(c, x, y, C.leaf1);
    }
  }
  if (medallion) {
    fillEllipse(c, c.w / 2, c.h / 2, 6, 6, C.cyanDk);
    fillEllipse(c, c.w / 2, c.h / 2, 3, 3, C.cyan);
  }
}

function paintFarm(c, seed) {
  fill(c, C.path2);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (y % 4 === 0) set(c, x, y, C.woodDk);
      else if (hash2(x, y, seed) < 0.15) set(c, x, y, C.path1);
      if (y % 4 === 2 && hash2(x, y, seed + 5) < 0.25) set(c, x, y, C.leaf1);
    }
  }
}

async function genTerrain() {
  const tiles = [
    ["grass-master", (c) => paintGrass(c, 1, true)],
    ["grass-lush", (c) => paintGrass(c, 2, true)],
    ["grass-dense", (c) => paintGrass(c, 3, false)],
    ["grass-fern", (c) => {
      paintGrass(c, 4, false);
      for (let i = 0; i < 10; i++) {
        const x = 2 + Math.floor(hash2(i, 1, 4) * 28);
        const y = 4 + Math.floor(hash2(i, 2, 5) * 24);
        set(c, x, y, C.leaf2);
        set(c, x, y - 1, C.leaf3);
      }
    }],
    ["grass-flowers-blue", (c) => {
      paintGrass(c, 5, false);
      for (let y = 0; y < c.h; y++)
        for (let x = 0; x < c.w; x++)
          if (hash2(x, y, 15) < 0.08) set(c, x, y, C.flowerB);
    }],
    ["grass-flowers-white", (c) => {
      paintGrass(c, 6, false);
      for (let y = 0; y < c.h; y++)
        for (let x = 0; x < c.w; x++)
          if (hash2(x, y, 16) < 0.08) set(c, x, y, hash2(x, y, 17) > 0.5 ? C.flowerW : C.flowerP);
    }],
    ["grass-dry", (c) => {
      fill(c, [150, 140, 70]);
      for (let y = 0; y < c.h; y++)
        for (let x = 0; x < c.w; x++)
          if (hash2(x, y, 7) < 0.3) set(c, x, y, C.path1);
    }],
    ["path-master", (c) => paintPath(c, 8)],
    ["path-worn", (c) => paintPath(c, 9, true)],
    ["path-rocky", (c) => {
      paintPath(c, 10);
      for (let i = 0; i < 12; i++)
        set(c, Math.floor(hash2(i, 1, 10) * 31), Math.floor(hash2(i, 2, 11) * 31), C.stoneDk);
    }],
    ["path-bloom", (c) => {
      paintPathBorder(c, 11);
      for (let i = 0; i < 8; i++)
        set(c, 2 + Math.floor(hash2(i, 1, 12) * 28), 2 + Math.floor(hash2(i, 2, 13) * 28), C.flowerP);
    }],
    ["path-to-stone", (c) => paintPlaza(c, 12)],
    ["path-curve", (c) => paintPathBorder(c, 13)],
    ["path-vertical", (c) => {
      paintGrass(c, 14, false);
      for (let y = 0; y < c.h; y++)
        for (let x = 10; x < 22; x++) set(c, x, y, hash2(x, y, 14) > 0.5 ? C.path1 : C.path2);
    }],
    ["path-corner", (c) => paintPathBorder(c, 15)],
    ["path-edge-n", (c) => paintPathEdgeDir(c, 50, "n")],
    ["path-edge-s", (c) => paintPathEdgeDir(c, 51, "s")],
    ["path-edge-e", (c) => paintPathEdgeDir(c, 52, "e")],
    ["path-edge-w", (c) => paintPathEdgeDir(c, 53, "w")],
    ["path-corner-ne", (c) => paintPathCorner(c, 54, "ne")],
    ["path-corner-nw", (c) => paintPathCorner(c, 55, "nw")],
    ["path-corner-se", (c) => paintPathCorner(c, 56, "se")],
    ["path-corner-sw", (c) => paintPathCorner(c, 57, "sw")],
    ["path-roots", (c) => {
      paintPath(c, 16, true);
      for (let i = 0; i < 8; i++) {
        const x = Math.floor(hash2(i, 1, 16) * 30);
        const y = Math.floor(hash2(i, 2, 17) * 30);
        set(c, x, y, C.bark);
        set(c, x + 1, y, C.bark);
      }
    }],
    ["path-ruined", (c) => {
      paintPlaza(c, 17);
      for (let i = 0; i < 10; i++)
        set(c, Math.floor(hash2(i, 1, 18) * 31), Math.floor(hash2(i, 2, 19) * 31), C.grass1);
    }],
    ["plaza-stone", (c) => paintPlaza(c, 20)],
    ["plaza-street", (c) => paintPath(c, 21)],
    ["plaza-moss", (c) => {
      paintPlaza(c, 22);
      for (let y = 0; y < c.h; y++)
        for (let x = 0; x < c.w; x++) if (hash2(x, y, 22) < 0.12) set(c, x, y, C.leaf1);
    }],
    ["plaza-diamond", (c) => {
      paintPlaza(c, 23);
      for (let i = 4; i < 28; i++) {
        set(c, i, i, C.cyan);
        set(c, 31 - i, i, C.cyan);
      }
    }],
    ["plaza-medallion", (c) => paintPlaza(c, 24, true)],
    ["water-master", (c) => paintWater(c, 30, false)],
    ["water-stream", (c) => paintWater(c, 31, true)],
    ["water-edge", (c) => paintWaterEdge(c, 32)],
    ["water-edge-n", (c) => paintWaterEdgeDir(c, 60, "n")],
    ["water-edge-s", (c) => paintWaterEdgeDir(c, 61, "s")],
    ["water-edge-e", (c) => paintWaterEdgeDir(c, 62, "e")],
    ["water-edge-w", (c) => paintWaterEdgeDir(c, 63, "w")],
    ["water-corner-ne", (c) => paintWaterCorner(c, 64, "ne")],
    ["water-corner-nw", (c) => paintWaterCorner(c, 65, "nw")],
    ["water-corner-se", (c) => paintWaterCorner(c, 66, "se")],
    ["water-corner-sw", (c) => paintWaterCorner(c, 67, "sw")],
    ["water-lily", (c) => paintWater(c, 33, true)],
    ["farm-soil", (c) => paintFarm(c, 40)],
    ["cliff-edge", (c) => {
      fill(c, C.stoneDk);
      for (let y = 0; y < c.h; y++)
        for (let x = 0; x < c.w; x++) if (hash2(x, y, 44) > 0.6) set(c, x, y, C.stone);
    }],
    ["settlement-soil", (c) => {
      paintPath(c, 45, true);
      for (let y = 0; y < c.h; y++)
        for (let x = 0; x < c.w; x++) if (hash2(x, y, 45) < 0.1) set(c, x, y, C.grass1);
    }],
    ["training-dirt", (c) => paintPath(c, 46, true)],
  ];

  for (const [name, paint] of tiles) {
    const c = makeCanvas(32, 32);
    paint(c);
    await writeUpscaled(c, path.join(OUT_TERRAIN, `${name}.png`), 4);
  }
}

function drawCottage(c, opts = {}) {
  const {
    wall = C.wood,
    wallDk = C.woodDk,
    roof = C.roof,
    roofLt = C.roofLt,
    accent = C.amber,
    cyanGlass = false,
    wide = false,
    timber = false,
    shed = false,
    peek = false,
    chimney = "stone", // stone | brick | none | twin
    flowerBoxes = true,
    doorOffset = 0,
  } = opts;
  for (let i = 0; i < c.data.length; i++) c.data[i] = 0;

  const footY = c.h - 4;
  const bodyW = shed ? 34 : wide ? 52 : 40;
  const bodyH = shed ? 22 : peek ? 30 : 28;
  const bx = Math.floor((c.w - bodyW) / 2);
  const by = footY - bodyH;

  // soft contact shadow
  fillEllipse(c, c.w / 2 + 1, footY + 1, bodyW / 2 + 3, 3.5, C.shadow);

  if (peek) {
    // interior floor peek under open cutaway
    fillRect(c, bx + 4, by + 10, bodyW - 8, bodyH - 10, [210, 170, 120]);
    for (let y = by + 12; y < footY - 2; y += 3)
      for (let x = bx + 5; x < bx + bodyW - 5; x++)
        if (y % 6 === 0) set(c, x, y, C.woodDk);
    // bed + chest
    fillRect(c, bx + 6, by + 16, 10, 6, C.roof);
    fillRect(c, bx + bodyW - 14, by + 18, 6, 5, C.wood);
  }

  // walls — plank or plaster/timber
  fillRect(c, bx, by, bodyW, bodyH, wall);
  if (timber) {
    fillRect(c, bx, by, 3, bodyH, wallDk);
    fillRect(c, bx + bodyW - 3, by, 3, bodyH, wallDk);
    fillRect(c, bx, by + Math.floor(bodyH / 2), bodyW, 2, wallDk);
    fillRect(c, bx + Math.floor(bodyW / 2) - 1, by, 2, bodyH, wallDk);
  } else {
    for (let y = by; y < by + bodyH; y += 3) {
      for (let x = bx; x < bx + bodyW; x++) if (hash2(x, y, 1) > 0.4) set(c, x, y, wallDk);
    }
  }

  // stone foundation
  fillRect(c, bx - 1, footY - 4, bodyW + 2, 4, C.stoneDk);
  for (let x = bx; x < bx + bodyW; x += 4) set(c, x, footY - 2, C.stone);

  // roof
  const roofH = shed ? 12 : 18;
  for (let row = 0; row < roofH; row++) {
    const half = Math.floor((bodyW / 2 + (shed ? 3 : 6)) * (1 - row / roofH)) + 2;
    const y = by - roofH + row;
    for (let x = c.w / 2 - half; x <= c.w / 2 + half; x++) {
      set(c, Math.floor(x), y, row < 3 ? roofLt : row > roofH - 3 ? C.roofDk : roof);
    }
  }

  // chimney variety
  if (chimney === "stone" || chimney === "brick") {
    const chx = chimney === "brick" ? bx + 4 : bx + bodyW - 10;
    const brick = chimney === "brick";
    fillRect(c, chx, by - roofH - 4, 6, 12, brick ? C.roof : C.stone);
    fillRect(c, chx - 1, by - roofH - 5, 8, 3, brick ? C.roofDk : C.stoneDk);
    set(c, chx + 2, by - roofH - 7, [200, 200, 200]);
  } else if (chimney === "twin") {
    fillRect(c, bx + 3, by - roofH - 3, 5, 10, C.stone);
    fillRect(c, bx + bodyW - 8, by - roofH - 4, 5, 11, C.stoneDk);
    set(c, bx + 5, by - roofH - 5, [210, 210, 210]);
  }

  // door
  const dx = bx + Math.floor(bodyW / 2) - 4 + doorOffset;
  fillRect(c, dx, by + (shed ? 8 : 12), shed ? 7 : 8, shed ? 14 : 16, wallDk);
  fillRect(c, dx + 1, by + (shed ? 9 : 13), shed ? 5 : 6, shed ? 12 : 14, C.woodLt);
  set(c, dx + (shed ? 5 : 6), by + (shed ? 14 : 20), accent);

  // windows
  const win = cyanGlass ? C.cyan : C.cream;
  if (!shed) {
    fillRect(c, bx + 6, by + 8, 7, 7, C.ink);
    fillRect(c, bx + 7, by + 9, 5, 5, win);
    fillRect(c, bx + bodyW - 13, by + 8, 7, 7, C.ink);
    fillRect(c, bx + bodyW - 12, by + 9, 5, 5, win);
  } else {
    fillRect(c, bx + bodyW - 12, by + 6, 6, 5, C.ink);
    fillRect(c, bx + bodyW - 11, by + 7, 4, 3, win);
  }

  if (flowerBoxes && !shed) {
    fillRect(c, bx + 5, by + 15, 9, 3, wallDk);
    set(c, bx + 7, by + 14, C.flowerP);
    set(c, bx + 9, by + 14, C.flowerW);
    fillRect(c, bx + bodyW - 14, by + 15, 9, 3, wallDk);
    set(c, bx + bodyW - 12, by + 14, C.flowerA);
    set(c, bx + bodyW - 10, by + 14, C.leaf3);
  }

  // porch lantern
  if (!shed) {
    fillRect(c, bx + bodyW + 1, by + 10, 2, 8, wallDk);
    fillRect(c, bx + bodyW, by + 8, 4, 4, accent);
  }

  outlineOpaque(c);
}

async function genBuildings() {
  const specs = {
    hatchery: { wall: C.plaster, roof: C.roof, cyanGlass: true, accent: C.cyan, chimney: "twin" },
    arena: { wall: C.stone, wallDk: C.stoneDk, roof: C.roofDk, wide: true, chimney: "none", flowerBoxes: false },
    market: { wall: C.woodLt, roof: [200, 90, 70], accent: C.amber, wide: true, chimney: "none" },
    guild: { wall: C.plaster, roof: [90, 110, 160], accent: C.amber, timber: true, chimney: "brick" },
    workshop: { wall: C.wood, roof: C.roofDk, accent: C.amber, chimney: "brick" },
    library: { wall: C.plaster, roof: [120, 80, 60], cyanGlass: true, timber: true },
    academy: { wall: C.plaster, roof: [140, 90, 50], wide: true, accent: C.cyan, timber: true, chimney: "twin" },
    "recovery-center": { wall: C.cream, roof: [100, 160, 120], cyanGlass: true, chimney: "stone" },
    "homestead-path": { wall: C.wood, roof: C.roof, accent: C.amber, chimney: "stone" },
    "cottage-north": { wall: C.plaster, roof: [180, 70, 55], timber: true, chimney: "brick", accent: C.amber },
    "cottage-south": { wall: C.woodLt, roof: C.roof, chimney: "stone", doorOffset: -2, accent: C.cyan },
    "cottage-timber": { wall: C.cream, roof: [160, 85, 50], timber: true, chimney: "twin", cyanGlass: true },
    "farm-shed": { wall: C.wood, wallDk: C.woodDk, roof: C.roofDk, shed: true, chimney: "none", flowerBoxes: false },
    "tavern-tankard": { wall: C.wood, roof: [190, 80, 50], wide: true, chimney: "brick", accent: C.amber },
    "cottage-peek": { wall: C.woodLt, roof: C.roof, peek: true, chimney: "stone", accent: C.amber },
    "portal-circle": { wall: C.stone, roof: C.cyanDk, cyanGlass: true, accent: C.cyan, chimney: "none", flowerBoxes: false },
  };

  for (const [name, opts] of Object.entries(specs)) {
    const c = makeCanvas(64, 64);
    drawCottage(c, opts);
    await writeUpscaled(c, path.join(OUT_BUILDINGS, `${name}.png`), 3);
  }
}

function drawTree(c, kind = "oak") {
  for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
  const cx = Math.floor(c.w / 2);
  const foot = c.h - 3;
  // layered ground shadow (afternoon bias)
  fillEllipse(c, cx + 2, foot, 11, 3.5, [40, 50, 30, 110]);
  fillEllipse(c, cx, foot, 8, 2, C.shadow);
  const pine = kind === "pine";
  const birch = kind === "birch";
  const rift = kind === "rift";
  const flowering = kind === "flowering" || kind === "orchard";
  fillRect(c, cx - 2, foot - 18, 4, 18, birch ? C.barkW : C.bark);
  if (birch) {
    set(c, cx - 1, foot - 12, C.ink);
    set(c, cx, foot - 8, C.ink);
  }
  if (pine) {
    for (let i = 0; i < 4; i++) {
      const y = foot - 20 - i * 6;
      const half = 10 - i * 2;
      for (let x = cx - half; x <= cx + half; x++) {
        for (let yy = y; yy < y + 5; yy++) {
          if (Math.abs(x - cx) + (yy - y) < half + 2) set(c, x, yy, i % 2 ? C.leaf2 : C.leaf1);
        }
      }
    }
  } else {
    // stacked canopy lobes for readable depth
    fillEllipse(c, cx + 1, foot - 24, 15, 13, C.leaf2);
    fillEllipse(c, cx, foot - 26, 14, 12, C.leaf1);
    fillEllipse(c, cx - 8, foot - 22, 9, 8, C.leaf2);
    fillEllipse(c, cx + 8, foot - 22, 9, 8, C.leaf1);
    fillEllipse(c, cx, foot - 32, 10, 8, C.leaf3);
    fillEllipse(c, cx - 4, foot - 34, 4, 2, [255, 255, 255, 70]);
    fillEllipse(c, cx + 3, foot - 20, 5, 3, C.leaf2); // underside shade
  }
  if (flowering) {
    for (const [x, y] of [
      [cx - 6, foot - 28],
      [cx + 5, foot - 30],
      [cx, foot - 22],
      [cx + 8, foot - 24],
    ]) {
      set(c, x, y, kind === "orchard" ? C.flowerA : C.flowerP);
      set(c, x + 1, y, kind === "orchard" ? C.flowerA : C.flowerW);
    }
  }
  if (rift) {
    fillEllipse(c, cx, foot - 28, 4, 4, C.cyan);
    fillEllipse(c, cx, foot - 28, 7, 7, [...C.cyan, 80]);
  }
  outlineOpaque(c);
}

function drawBush(c) {
  for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
  const cx = c.w / 2;
  const foot = c.h - 2;
  fillEllipse(c, cx + 1, foot, 9, 2.5, [40, 50, 30, 100]);
  fillEllipse(c, cx, foot, 8, 2, C.shadow);
  fillEllipse(c, cx, foot - 8, 10, 8, C.leaf1);
  fillEllipse(c, cx - 5, foot - 6, 6, 5, C.leaf2);
  fillEllipse(c, cx + 5, foot - 6, 6, 5, C.leaf2);
  fillEllipse(c, cx, foot - 11, 6, 4, C.leaf3);
  set(c, cx - 3, foot - 9, C.flowerP);
  set(c, cx + 2, foot - 8, C.flowerW);
  outlineOpaque(c);
}

function drawProp(c, kind) {
  for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
  const cx = Math.floor(c.w / 2);
  const foot = c.h - 2;
  fillEllipse(c, cx, foot, 6, 2, C.shadow);
  if (kind === "barrel") {
    fillEllipse(c, cx, foot - 10, 8, 10, C.wood);
    fillRect(c, cx - 7, foot - 14, 14, 3, C.woodDk);
    fillRect(c, cx - 7, foot - 6, 14, 3, C.woodDk);
    set(c, cx + 3, foot - 10, C.amber);
  } else if (kind === "crate") {
    fillRect(c, cx - 8, foot - 14, 16, 14, C.woodLt);
    fillRect(c, cx - 8, foot - 14, 16, 3, C.woodDk);
    fillRect(c, cx - 1, foot - 14, 2, 14, C.woodDk);
  } else if (kind === "bench") {
    fillRect(c, cx - 10, foot - 6, 20, 3, C.wood);
    fillRect(c, cx - 9, foot - 3, 3, 3, C.woodDk);
    fillRect(c, cx + 6, foot - 3, 3, 3, C.woodDk);
  } else if (kind === "fence" || kind === "lib-fence-post") {
    fillRect(c, cx - 10, foot - 14, 3, 14, C.cream);
    fillRect(c, cx - 1, foot - 14, 3, 14, C.cream);
    fillRect(c, cx + 8, foot - 14, 3, 14, C.cream);
    fillRect(c, cx - 10, foot - 10, 21, 2, C.wood);
    fillRect(c, cx - 10, foot - 5, 21, 2, C.wood);
  } else if (kind === "picket-fence") {
    for (let i = -12; i <= 12; i += 4) {
      fillRect(c, cx + i, foot - 14, 2, 14, C.cream);
      set(c, cx + i, foot - 15, C.cream);
      set(c, cx + i + 1, foot - 15, C.cream);
    }
    fillRect(c, cx - 12, foot - 10, 26, 2, C.woodLt);
    fillRect(c, cx - 12, foot - 5, 26, 2, C.woodLt);
  } else if (kind === "picket-fence-gate") {
    fillRect(c, cx - 12, foot - 14, 2, 14, C.cream);
    fillRect(c, cx + 10, foot - 14, 2, 14, C.cream);
    fillRect(c, cx - 8, foot - 12, 16, 10, C.cream);
    fillRect(c, cx - 7, foot - 11, 14, 2, C.wood);
    fillRect(c, cx - 7, foot - 6, 14, 2, C.wood);
    set(c, cx + 5, foot - 8, C.amber);
  } else if (kind === "yard-fence-corner") {
    fillRect(c, cx - 2, foot - 14, 3, 14, C.cream);
    fillRect(c, cx - 2, foot - 14, 14, 2, C.cream);
    fillRect(c, cx - 10, foot - 10, 12, 2, C.woodLt);
    fillRect(c, cx, foot - 10, 2, 10, C.woodLt);
  } else if (kind === "critter-sparkmoth") {
    // Original-IP yard critter (not a chicken) — tiny rift moth
    fillEllipse(c, cx, foot - 6, 4, 3, [255, 230, 140]);
    set(c, cx - 2, foot - 7, C.ink);
    set(c, cx + 1, foot - 7, C.ink);
    set(c, cx - 5, foot - 8, [...C.cyan, 180]);
    set(c, cx + 4, foot - 8, [...C.cyan, 180]);
    set(c, cx, foot - 4, C.amber);
  } else if (kind === "critter-mossbun-kit") {
    fillEllipse(c, cx, foot - 5, 5, 4, [110, 180, 100]);
    fillEllipse(c, cx, foot - 4, 3, 2, [240, 230, 200]);
    set(c, cx - 2, foot - 6, C.ink);
    set(c, cx + 1, foot - 6, C.ink);
    fillRect(c, cx - 3, foot - 9, 2, 3, [90, 150, 80]);
    fillRect(c, cx + 2, foot - 9, 2, 3, [90, 150, 80]);
  } else if (kind === "signpost") {
    fillRect(c, cx - 1, foot - 20, 2, 20, C.woodDk);
    fillRect(c, cx - 8, foot - 20, 16, 8, C.woodLt);
  } else if (kind === "lantern-post" || kind === "lib-lantern-rift") {
    fillRect(c, cx - 1, foot - 22, 2, 22, C.woodDk);
    fillRect(c, cx - 4, foot - 26, 8, 7, C.ink);
    fillRect(c, cx - 3, foot - 25, 6, 5, kind.includes("rift") ? C.cyan : C.amber);
  } else if (kind === "flowers") {
    for (let i = 0; i < 5; i++) {
      const x = cx - 8 + i * 4;
      fillRect(c, x, foot - 8, 1, 8, C.leaf2);
      set(c, x, foot - 9, [C.flowerP, C.flowerW, C.flowerB, C.flowerA, C.cyan][i]);
    }
  } else if (kind === "rock-moss") {
    fillEllipse(c, cx, foot - 5, 9, 6, C.stone);
    set(c, cx - 2, foot - 7, C.leaf1);
    set(c, cx + 3, foot - 6, C.leaf2);
  } else if (kind === "market-stall") {
    fillRect(c, cx - 12, foot - 10, 24, 10, C.wood);
    for (let x = cx - 14; x <= cx + 14; x++) {
      const y = foot - 22 + Math.abs(x - cx) * 0.15;
      set(c, x, Math.floor(y), x % 3 === 0 ? C.roof : C.cream);
      set(c, x, Math.floor(y) + 1, C.roofLt);
    }
    fillRect(c, cx - 12, foot - 12, 2, 12, C.woodDk);
    fillRect(c, cx + 10, foot - 12, 2, 12, C.woodDk);
  } else if (kind === "bridge") {
    fillRect(c, cx - 14, foot - 8, 28, 6, C.wood);
    fillRect(c, cx - 14, foot - 14, 2, 10, C.woodDk);
    fillRect(c, cx + 12, foot - 14, 2, 10, C.woodDk);
  } else if (kind === "campfire") {
    fillEllipse(c, cx, foot - 3, 6, 2, C.stoneDk);
    set(c, cx, foot - 6, C.amber);
    set(c, cx - 1, foot - 7, C.roofLt);
    set(c, cx + 1, foot - 7, C.roof);
  } else if (kind === "rift-crystal" || kind === "riftstone-monument") {
    fillEllipse(c, cx, foot - 10, 5, 10, C.cyanDk);
    fillEllipse(c, cx, foot - 12, 3, 6, C.cyan);
    set(c, cx - 1, foot - 14, [255, 255, 255]);
  } else if (kind === "banner-pole") {
    fillRect(c, cx - 1, foot - 24, 2, 24, C.woodDk);
    fillRect(c, cx + 1, foot - 22, 10, 8, C.cyanDk);
    set(c, cx + 3, foot - 20, C.amber);
  } else if (kind === "watchtower") {
    fillRect(c, cx - 6, foot - 28, 12, 28, C.wood);
    fillRect(c, cx - 8, foot - 32, 16, 6, C.roof);
    fillRect(c, cx - 3, foot - 20, 6, 5, C.cream);
  } else if (kind === "anvil-forge") {
    fillRect(c, cx - 8, foot - 6, 16, 6, C.stoneDk);
    fillRect(c, cx - 6, foot - 10, 12, 5, C.stone);
    set(c, cx, foot - 12, C.amber);
  } else if (kind === "stump") {
    fillEllipse(c, cx, foot - 4, 7, 4, C.bark);
    fillEllipse(c, cx, foot - 6, 5, 2, C.woodLt);
  } else {
    // generic clutter
    fillRect(c, cx - 4, foot - 8, 8, 8, C.wood);
  }
  outlineOpaque(c);
}

function drawKeeper(c, frame = 0) {
  for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
  const cx = 16;
  const foot = 30;
  // walk cycle: 0 idle, 1–3 stride
  const stride = frame === 0 ? 0 : frame === 1 ? -2 : frame === 2 ? 0 : 2;
  const bob = frame === 2 ? -1 : 0;
  fillEllipse(c, cx + 1, foot, 7, 2, C.shadow);
  fillRect(c, cx - 4 + stride, foot - 4, 3, 4, C.woodDk);
  fillRect(c, cx + 2 - stride, foot - 3, 3, 3, C.woodDk);
  fillRect(c, cx - 3 + Math.floor(stride / 2), foot - 9 + bob, 2, 5, C.tunicDk);
  fillRect(c, cx + 2 - Math.floor(stride / 2), foot - 8 + bob, 2, 5, C.tunicDk);
  fillRect(c, cx - 5, foot - 16 + bob, 10, 8, C.tunic);
  fillRect(c, cx - 5, foot - 16 + bob, 10, 2, C.amber);
  fillRect(c, cx - 6, foot - 14 + bob, 2, 5, C.tunic);
  fillRect(c, cx + 4, foot - 14 + bob, 2, 5, C.tunic);
  fillEllipse(c, cx, foot - 20 + bob, 6, 6, C.skin);
  fillRect(c, cx - 5, foot - 25 + bob, 10, 5, C.hair);
  fillRect(c, cx - 6, foot - 23 + bob, 2, 4, C.hair);
  fillRect(c, cx + 4, foot - 23 + bob, 2, 4, C.hair);
  set(c, cx - 2, foot - 20 + bob, C.ink);
  set(c, cx + 2, foot - 20 + bob, C.ink);
  set(c, cx, foot - 18 + bob, [220, 120, 100]);
  set(c, cx, foot - 12 + bob, C.cyan);
  fillRect(c, cx + 3, foot - 13 + bob, 3, 4, C.wood);
  outlineOpaque(c);
}

const RIFTLING_PALETTES = {
  spark: { body: [255, 210, 90], accent: C.cyan, tip: C.cyan },
  moss: { body: [90, 170, 90], accent: C.cyan, tip: C.cyan },
  ember: { body: [230, 120, 70], accent: C.amber, tip: [255, 140, 60] },
  frost: { body: [160, 210, 240], accent: C.amber, tip: [200, 230, 255] },
  tide: { body: [70, 150, 210], accent: C.amber, tip: [100, 200, 230] },
  stone: { body: [150, 140, 130], accent: C.amber, tip: [180, 170, 150] },
  storm: { body: [120, 140, 220], accent: C.cyan, tip: [200, 220, 255] },
  spirit: { body: [200, 180, 230], accent: C.cyan, tip: [230, 210, 255] },
  void: { body: [70, 55, 95], accent: [180, 120, 255], tip: [120, 80, 180] },
  alloy: { body: [150, 155, 165], accent: C.amber, tip: [90, 200, 210] },
  radiant: { body: [255, 235, 160], accent: C.amber, tip: [255, 250, 200] },
};

function drawRiftling(c, palette = "spark", frame = 0) {
  for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
  const cx = 12;
  const foot = 22;
  const pal = RIFTLING_PALETTES[palette] ?? RIFTLING_PALETTES.spark;
  const body = pal.body;
  const belly = [255, 240, 210];
  const accent = pal.accent;
  const tip = pal.tip;
  const hop = frame === 0 ? 0 : frame === 1 ? -1 : frame === 2 ? 0 : -2;
  const paw = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  fillEllipse(c, cx + 1, foot, 6, 2, C.shadow);
  fillEllipse(c, cx, foot - 7 + hop, 7, 6, body);
  fillEllipse(c, cx, foot - 13 + hop, 8, 7, body);
  fillEllipse(c, cx, foot - 6 + hop, 4, 3, belly);
  fillRect(c, cx - 6, foot - 18 + hop, 3, 5, body);
  fillRect(c, cx + 4, foot - 18 + hop, 3, 5, body);
  set(c, cx - 5, foot - 18 + hop, accent);
  set(c, cx + 5, foot - 18 + hop, accent);
  set(c, cx - 2, foot - 13 + hop, C.ink);
  set(c, cx + 2, foot - 13 + hop, C.ink);
  set(c, cx, foot - 11 + hop, accent);
  fillRect(c, cx - 4 + paw, foot - 3, 2, 2, body);
  fillRect(c, cx + 2 - paw, foot - 3, 2, 2, body);
  set(c, cx + 6, foot - 16 + hop, tip);
  // Alloybit gear ear tip — distinct from sparklet cyan freckle
  if (palette === "alloy") {
    set(c, cx - 6, foot - 19 + hop, tip);
    set(c, cx + 6, foot - 19 + hop, tip);
  }
  outlineOpaque(c);
}

async function writeActorSheet(drawFrame, dest, frameW, frameH, frames, scale = 3) {
  const sheet = makeCanvas(frameW * frames, frameH);
  for (let f = 0; f < frames; f++) {
    const cell = makeCanvas(frameW, frameH);
    drawFrame(cell, f);
    for (let y = 0; y < frameH; y++) {
      for (let x = 0; x < frameW; x++) {
        const si = (y * frameW + x) * 4;
        const di = (y * sheet.w + f * frameW + x) * 4;
        sheet.data[di] = cell.data[si];
        sheet.data[di + 1] = cell.data[si + 1];
        sheet.data[di + 2] = cell.data[si + 2];
        sheet.data[di + 3] = cell.data[si + 3];
      }
    }
  }
  await writeUpscaled(sheet, dest, scale);
}

async function genProps() {
  const classic = [
    "barrel",
    "crate",
    "bench",
    "signpost",
    "lantern-post",
    "flowers",
    "rock-moss",
    "market-stall",
    "bridge",
    "campfire",
    "rift-crystal",
    "riftstone-monument",
    "banner-pole",
    "watchtower",
    "anvil-forge",
    "bush-berry",
    "lib-fence-post",
    "picket-fence",
    "picket-fence-gate",
    "yard-fence-corner",
    "critter-sparkmoth",
    "critter-mossbun-kit",
    "lib-lantern-rift",
    "lib-crate-market",
    "lib-flower-riftlily",
    "lib-mushroom-amber",
    "lib-bush-moss",
    "ruin-arch",
    "training-dummy",
    "resource-berry",
    "resource-herb",
    "resource-fish",
  ];

  for (const name of classic) {
    const c = makeCanvas(32, 32);
    if (name === "bush-berry" || name === "lib-bush-moss") drawBush(c);
    else if (name === "lib-flower-riftlily" || name === "flowers") drawProp(c, "flowers");
    else if (name === "lib-crate-market") drawProp(c, "crate");
    else if (name === "lib-mushroom-amber") {
      for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
      fillEllipse(c, 16, 28, 4, 2, C.shadow);
      fillRect(c, 14, 18, 4, 10, C.cream);
      fillEllipse(c, 16, 16, 8, 5, C.amber);
      outlineOpaque(c);
    } else if (name === "ruin-arch") {
      for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
      fillRect(c, 6, 8, 4, 22, C.stone);
      fillRect(c, 22, 8, 4, 22, C.stone);
      fillRect(c, 6, 6, 20, 4, C.stoneDk);
      outlineOpaque(c);
    } else if (name === "training-dummy") {
      for (let i = 0; i < c.data.length; i++) c.data[i] = 0;
      fillRect(c, 15, 10, 2, 20, C.woodDk);
      fillEllipse(c, 16, 12, 5, 5, C.wood);
      outlineOpaque(c);
    } else if (name.startsWith("resource-")) drawProp(c, "flowers");
    else drawProp(c, name);
    await writeUpscaled(c, path.join(OUT_PROPS, `${name}.png`), 3);
  }

  // stump as extra prop file used by scatter if present
  {
    const c = makeCanvas(32, 32);
    drawProp(c, "stump");
    await writeUpscaled(c, path.join(OUT_PROPS, "stump.png"), 3);
  }

  const trees = [
    ["tree-small", "oak"],
    ["tree-oak", "oak"],
    ["tree-pine", "pine"],
    ["tree-birch", "birch"],
    ["tree-flowering", "flowering"],
    ["tree-rift", "rift"],
    ["tree-orchard", "orchard"],
    ["lib-tree-oak-summer", "oak"],
  ];
  for (const [name, kind] of trees) {
    const c = makeCanvas(48, 48);
    drawTree(c, kind);
    await writeUpscaled(c, path.join(OUT_PROPS, `${name}.png`), 3);
  }
}

async function genActors() {
  {
    const c = makeCanvas(32, 32);
    drawKeeper(c, 0);
    await writeUpscaled(c, path.join(OUT_ACTORS, "player-keeper.png"), 3);
  }
  await writeActorSheet(
    (cell, f) => drawKeeper(cell, f),
    path.join(OUT_ACTORS, "player-keeper-sheet.png"),
    32,
    32,
    4,
    3,
  );
  {
    const c = makeCanvas(24, 24);
    drawRiftling(c, "spark", 0);
    await writeUpscaled(c, path.join(OUT_ACTORS, "pet-riftling.png"), 3);
  }
  await writeActorSheet(
    (cell, f) => drawRiftling(cell, "spark", f),
    path.join(OUT_ACTORS, "pet-riftling-sheet.png"),
    24,
    24,
    4,
    3,
  );
  const pals = [
    ["riftling-sparklet", "spark"],
    ["riftling-mossbun", "moss"],
    ["riftling-emberpup", "ember"],
    ["riftling-frostnip", "frost"],
    ["riftling-tideling", "tide"],
    ["riftling-stoneling", "stone"],
    ["riftling-stormkit", "storm"],
    ["riftling-spiritwisp", "spirit"],
    ["riftling-voidling", "void"],
    ["riftling-alloybit", "alloy"],
    ["riftling-radiantpup", "radiant"],
  ];
  for (const [name, pal] of pals) {
    const c = makeCanvas(24, 24);
    drawRiftling(c, pal, 0);
    await writeUpscaled(c, path.join(OUT_ACTORS, `${name}.png`), 3);
    await writeUpscaled(c, path.join(OUT_PROPS, `ambient-${name}.png`), 3);
    await writeActorSheet(
      (cell, f) => drawRiftling(cell, pal, f),
      path.join(OUT_ACTORS, `${name}-sheet.png`),
      24,
      24,
      4,
      3,
    );
  }
}

async function main() {
  for (const d of [OUT_TERRAIN, OUT_PROPS, OUT_BUILDINGS, OUT_ACTORS]) {
    fs.mkdirSync(d, { recursive: true });
  }
  console.log("Generating cozy pixel world pack (original IP)…");
  await genTerrain();
  await genBuildings();
  await genProps();
  await genActors();
  // Also run legacy terrain script name coverage via package
  console.log("cozy pixel world pack complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
