/**
 * Bake lightweight list/detail thumbs from pet portrait masters.
 * Out: public/assets/pets/thumbs/{slug}.webp (+ .png fallback)
 *
 * Run: node scripts/assets/generate-pet-thumbs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const petsDir = path.join(ROOT, "public/assets/pets");
const thumbsDir = path.join(petsDir, "thumbs");
const catalogPath = path.join(ROOT, "src/game/creatures/species-catalog.ts");

const catalogSrc = fs.readFileSync(catalogPath, "utf8");
const slugs = [...catalogSrc.matchAll(/\bs\(\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
const uniqueSlugs = [...new Set(slugs)];

fs.mkdirSync(thumbsDir, { recursive: true });

const SIZE = 384;
let ok = 0;
let missing = [];
let bad = [];

for (const slug of uniqueSlugs) {
  const src = path.join(petsDir, `${slug}.png`);
  if (!fs.existsSync(src)) {
    missing.push(slug);
    continue;
  }
  try {
    const img = sharp(src).resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    await img.clone().webp({ quality: 82, alphaQuality: 90 }).toFile(path.join(thumbsDir, `${slug}.webp`));
    await img.clone().png({ compressionLevel: 9 }).toFile(path.join(thumbsDir, `${slug}.png`));
    ok++;
  } catch (e) {
    bad.push(`${slug}: ${e.message}`);
  }
}

console.log(
  JSON.stringify(
    {
      species: uniqueSlugs.length,
      thumbsWritten: ok,
      missing,
      bad,
      out: "public/assets/pets/thumbs/{slug}.webp",
    },
    null,
    2,
  ),
);
if (missing.length || bad.length) process.exitCode = 1;
