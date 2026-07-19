/**
 * Build Codex habitat card plates (4:3 webp).
 *
 * Source priority:
 * 1. public/assets/habitats/_masters/{slug}.png (optional painted masters)
 * 2. public/assets/maps/regions/{slug}.png (scenic map fallback)
 *
 * Usage: node scripts/assets/build-habitat-plates.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MASTER_DIR = path.join(ROOT, "public/assets/habitats/_masters");
const MAP_DIR = path.join(ROOT, "public/assets/maps/regions");
const OUT_DIR = path.join(ROOT, "public/assets/habitats");

const REGIONS = [
  "riftwild-commons",
  "ember-crater",
  "moonwater-coast",
  "elderwood-forest",
  "stormspire-peaks",
  "stoneheart-canyon",
  "frostveil-basin",
  "radiant-citadel",
  "void-hollow",
  "alloy-ruins",
  "spirit-marsh",
  "celestial-rift",
];

const WIDTH = 960;
const HEIGHT = 720; // 4:3 — matches Codex card wells

function resolveSource(slug) {
  const master = path.join(MASTER_DIR, `${slug}.png`);
  if (fs.existsSync(master)) return { src: master, kind: "master" };
  const map = path.join(MAP_DIR, `${slug}.png`);
  if (fs.existsSync(map)) return { src: map, kind: "map" };
  return null;
}

async function buildOne(slug) {
  const resolved = resolveSource(slug);
  if (!resolved) {
    console.warn(`skip missing source: ${slug}`);
    return false;
  }
  const out = path.join(OUT_DIR, `${slug}.webp`);
  await sharp(resolved.src)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .webp({ quality: 84, effort: 5 })
    .toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`ok ${slug}.webp (${kb}KB, ${resolved.kind})`);
  return true;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let ok = 0;
for (const slug of REGIONS) {
  if (await buildOne(slug)) ok += 1;
}
console.log(`Built ${ok}/${REGIONS.length} habitat plates → public/assets/habitats/`);
