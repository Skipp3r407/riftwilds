/**
 * Build seam-safe Codex/list thumbs at public/assets/pets/thumbs/{slug}.plate.webp
 * Trims a 2px left fringe (common encode artifact), then contain-pads to 384².
 * Run: node scripts/assets/trim-pet-thumb-seams.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const thumbsDir = path.join(ROOT, "public/assets/pets/thumbs");
const petsDir = path.join(ROOT, "public/assets/pets");
const SIZE = 384;

fs.mkdirSync(thumbsDir, { recursive: true });

const masters = fs
  .readdirSync(petsDir)
  .filter((f) => f.endsWith(".png") && !f.includes("-"))
  .map((f) => f.replace(/\.png$/, ""));

let ok = 0;
const bad = [];

for (const slug of masters) {
  const masterPath = path.join(petsDir, `${slug}.png`);
  const outWebp = path.join(thumbsDir, `${slug}.plate.webp`);
  const outPng = path.join(thumbsDir, `${slug}.plate.png`);
  try {
    const meta = await sharp(masterPath).metadata();
    const w = meta.width ?? SIZE;
    const h = meta.height ?? SIZE;
    const left = Math.min(2, Math.max(1, Math.floor(w * 0.002) || 1));
    const pipeline = sharp(masterPath)
      .ensureAlpha()
      .extract({ left, top: 0, width: w - left, height: h })
      .resize(SIZE, SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    await pipeline.clone().webp({ quality: 84, alphaQuality: 90 }).toFile(outWebp);
    await pipeline.clone().png({ compressionLevel: 9 }).toFile(outPng);
    ok++;
  } catch (e) {
    bad.push(`${slug}: ${e.message}`);
  }
}

console.log(JSON.stringify({ masters: masters.length, platesWritten: ok, bad }, null, 2));
if (bad.length) process.exitCode = 1;
