/**
 * Raise near-black body pixels on dark cutouts so silhouettes read on habitat plates.
 * Preserves bright glow accents. Run: node scripts/assets/lift-dark-pet-cutouts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TARGETS = ["veilhare", "hollowshade", "noxling", "shadowmire", "nullpaw"];

async function liftSilhouette(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  for (let i = 0; i < data.length; i += ch) {
    const a = data[i + 3];
    if (a < 12) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Lift only very dark body fill — leave cyan/white frost glow alone.
    if (lum < 42 && Math.max(r, g, b) - Math.min(r, g, b) < 28) {
      data[i] = Math.min(255, Math.round(r * 0.55 + 48));
      data[i + 1] = Math.min(255, Math.round(g * 0.55 + 58));
      data[i + 2] = Math.min(255, Math.round(b * 0.55 + 78));
    } else if (lum < 70) {
      data[i] = Math.min(255, Math.round(r * 1.12 + 6));
      data[i + 1] = Math.min(255, Math.round(g * 1.12 + 8));
      data[i + 2] = Math.min(255, Math.round(b * 1.14 + 10));
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: ch } }).png().toBuffer();
}

for (const slug of TARGETS) {
  const master = path.join(ROOT, "public/assets/pets", `${slug}.png`);
  const thumbWebp = path.join(ROOT, "public/assets/pets/thumbs", `${slug}.webp`);
  const thumbPng = path.join(ROOT, "public/assets/pets/thumbs", `${slug}.png`);
  if (!fs.existsSync(master)) {
    console.log(`skip ${slug}`);
    continue;
  }
  const lifted = await liftSilhouette(master);
  await sharp(lifted).toFile(master);
  const thumb = sharp(lifted).resize(384, 384, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  await thumb.clone().webp({ quality: 84, alphaQuality: 90 }).toFile(thumbWebp);
  await thumb.clone().png({ compressionLevel: 9 }).toFile(thumbPng);
  console.log(`silhouette-lifted ${slug}`);
}
