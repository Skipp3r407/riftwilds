/**
 * Install Cursor-generated cover PNGs into public/assets/comics/covers/
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const assets = path.join(
  os.homedir(),
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);
const covers = path.join(ROOT, "public/assets/comics/covers");

const map = [
  ["cover-02-sparks-journey.png", "02-sparks-journey.png"],
  ["cover-03-traveling-circus.png", "03-traveling-circus.png"],
  ["cover-04-the-lost-city.png", "04-the-lost-city.png"],
  ["cover-05-the-storm-king.png", "05-the-storm-king.png"],
  ["cover-06-merchants-secret.png", "06-merchants-secret.png"],
  ["cover-07-the-traitors-gate.png", "07-the-traitors-gate.png"],
  ["cover-08-the-forge-of-rifts.png", "08-the-forge-of-rifts.png"],
  ["cover-09-the-riftwright.png", "09-the-riftwright.png"],
  ["cover-10-the-shattered-star.png", "10-the-shattered-star.png"],
];

let ok = 0;
for (const [srcName, destName] of map) {
  const src = path.join(assets, srcName);
  if (!fs.existsSync(src)) {
    console.error("missing", srcName);
    continue;
  }
  const dest = path.join(covers, destName);
  await sharp(src).resize(1200, 1600, { fit: "cover" }).png().toFile(dest);
  console.log("ok", destName, fs.statSync(dest).size);
  ok += 1;
}
console.log(`installed ${ok}/${map.length} covers`);
