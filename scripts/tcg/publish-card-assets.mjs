/**
 * Publish clean art plates into /public/assets/cards/{expansion}/{slug}/
 * Does NOT delete legacy /assets/tcg/cards/{id}.webp faces.
 * Does NOT bake stats into art.
 *
 *   node scripts/tcg/publish-card-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const CARD_IMAGES_PATH = path.join(
  ROOT,
  "src/content/tcg/data/cardImages.json",
);
const OUT_INDEX = path.join(
  ROOT,
  "src/content/tcg/data/migrations/card-asset-paths-v1.json",
);
const PUBLIC = path.join(ROOT, "public");

function slugFor(card) {
  if (card.riftlingSlug) return String(card.riftlingSlug);
  const fromId = String(card.id)
    .replace(/^rotr-(c|comp|evo|e|s|r|l|h|t|w|q|a)-/, "")
    .replace(/^rotr-/, "");
  return fromId || card.id;
}

function expansionFor(card) {
  return String(card.expansionId || card.setId || "rise-of-the-rift")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function resolveSource(card, cardImages) {
  const candidates = [
    card.art?.assetPath,
    card.art?.subjectPath,
    cardImages.cards?.[card.id],
    card.art?.cardImagePath,
    `/assets/tcg/cards/${card.id}.webp`,
  ].filter(Boolean);

  for (const rel of candidates) {
    const abs = path.join(PUBLIC, rel.replace(/^\//, ""));
    if (fs.existsSync(abs)) return { rel, abs };
  }
  return null;
}

function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  const cardImages = JSON.parse(fs.readFileSync(CARD_IMAGES_PATH, "utf8"));
  const index = {
    version: 1,
    schema: "riftwilds.tcg.card-assets.v1",
    generatedAt: new Date().toISOString(),
    description:
      "Canonical clean art paths under /assets/cards/{expansion}/{slug}/. Stats stay in data.",
    paths: {},
  };

  let published = 0;
  let missing = 0;
  const missingIds = [];

  for (const card of cards) {
    const expansion = expansionFor(card);
    const slug = slugFor(card);
    const destDirRel = `/assets/cards/${expansion}/${slug}`;
    const destDirAbs = path.join(PUBLIC, "assets", "cards", expansion, slug);
    fs.mkdirSync(destDirAbs, { recursive: true });

    const src = resolveSource(card, cardImages);
    if (!src) {
      missing += 1;
      missingIds.push(card.id);
      index.paths[card.id] = {
        expansion,
        slug,
        art: null,
        thumb: null,
        missing: true,
      };
      continue;
    }

    const ext = path.extname(src.abs).toLowerCase() || ".webp";
    const artName = `art${ext === ".png" ? ".png" : ".webp"}`;
    const thumbName = `thumb${ext === ".png" ? ".png" : ".webp"}`;
    const artAbs = path.join(destDirAbs, artName);
    const thumbAbs = path.join(destDirAbs, thumbName);

    if (!fs.existsSync(artAbs)) {
      fs.copyFileSync(src.abs, artAbs);
    }
    if (!fs.existsSync(thumbAbs)) {
      fs.copyFileSync(src.abs, thumbAbs);
    }

    index.paths[card.id] = {
      expansion,
      slug,
      art: `${destDirRel}/${artName}`,
      thumb: `${destDirRel}/${thumbName}`,
      source: src.rel,
      missing: false,
    };
    published += 1;
  }

  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
  fs.writeFileSync(OUT_INDEX, JSON.stringify(index, null, 2) + "\n", "utf8");

  console.log(`Published ${published}/${cards.length} card asset folders`);
  console.log(`Missing sources: ${missing}`);
  if (missingIds.length) {
    console.log(`Sample missing: ${missingIds.slice(0, 12).join(", ")}`);
  }
  console.log(`Index → ${path.relative(ROOT, OUT_INDEX)}`);
}

main();
