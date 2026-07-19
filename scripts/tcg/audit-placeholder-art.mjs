/**
 * Audit which TCG cards fall back to generated SVG subject silhouettes.
 * Usage: node scripts/tcg/audit-placeholder-art.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const SUBJECTS_DIR = path.join(ROOT, "public/assets/tcg/subjects");
const OUT_PATH = path.join(ROOT, "artifacts/tcg-placeholder-audit.json");

function subjectSlugFromCard(card) {
  const id = String(card.id || "");
  const trimmed = id
    .replace(/^rotr-(?:s|e|c|t|h|x|l|w|r|prop)-/, "")
    .replace(/^companion-/, "")
    .replace(/^legendary-/, "")
    .replace(/^artifact-/, "")
    .replace(/^quest-/, "")
    .replace(/^item-/, "")
    .replace(/^npc-/, "");
  return trimmed || id;
}

function publicPathToDisk(rel) {
  if (!rel || !String(rel).startsWith("/")) return null;
  return path.join(ROOT, "public", String(rel).replace(/^\//, ""));
}

function existsPublic(rel) {
  const disk = publicPathToDisk(rel);
  return Boolean(disk && fs.existsSync(disk));
}

function isPlaceholderBuildingArt(assetPath) {
  if (!assetPath) return true;
  return /\/assets\/game\/library\/buildings\//i.test(assetPath);
}

const subjectFiles = new Set(
  fs.existsSync(SUBJECTS_DIR)
    ? fs
        .readdirSync(SUBJECTS_DIR)
        .filter((f) => f.endsWith(".png"))
        .map((f) => f.replace(/\.png$/, ""))
    : [],
);

const raw = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
const list = Array.isArray(raw) ? raw : raw.cards || [];

const placeholders = [];
const withArt = [];

for (const card of list) {
  const slug = subjectSlugFromCard(card);
  let hit = null;

  if (subjectFiles.has(slug)) {
    hit = { kind: "subject", slug };
  }

  if (!hit) {
    const petMatch = String(card.id).match(/rotr-(?:c|comp|evo)-([a-z0-9-]+)/);
    if (petMatch) {
      const pet = petMatch[1];
      for (const c of [
        `/assets/pets/thumbs/${pet}.webp`,
        `/assets/pets/portraits/${pet}.png`,
        `/assets/pets/${pet}/portrait.png`,
        `/assets/pets/full/${pet}.png`,
      ]) {
        if (existsPublic(c)) {
          hit = { kind: "pet", path: c };
          break;
        }
      }
    }
  }

  if (!hit) {
    const art =
      card.art?.assetPath ||
      card.artPath ||
      card.localization?.artPath ||
      card.assets?.artPath;
    if (art && !isPlaceholderBuildingArt(art) && existsPublic(art)) {
      hit = { kind: "cardArt", path: art };
    }
  }

  // Item / equipment icon paths commonly used by resolveSourceArt
  if (!hit && (card.type === "equipment" || card.type === "relic" || /item|mat/i.test(card.id))) {
    const candidates = [
      card.art?.iconPath,
      card.iconPath,
      `/assets/items/icons/${slug}.png`,
      `/assets/items/thumbs/${slug}.webp`,
    ].filter(Boolean);
    for (const c of candidates) {
      if (existsPublic(c) && !isPlaceholderBuildingArt(c)) {
        hit = { kind: "item", path: c };
        break;
      }
    }
  }

  const row = {
    id: card.id,
    name: card.localization?.name || card.name || card.id,
    type: card.type || "unknown",
    element: card.element || "neutral",
    regionId: card.regionId || null,
    slug,
    rarity: card.rarity || "common",
  };

  if (hit) withArt.push({ ...row, ...hit });
  else placeholders.push(row);
}

const byType = {};
for (const p of placeholders) byType[p.type] = (byType[p.type] || 0) + 1;

const report = {
  total: list.length,
  withArt: withArt.length,
  placeholders: placeholders.length,
  placeholderByType: byType,
  subjectsOnDisk: subjectFiles.size,
  placeholderIds: placeholders.map((p) => p.id),
  placeholders,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  total: report.total,
  withArt: report.withArt,
  placeholders: report.placeholders,
  placeholderByType: report.placeholderByType,
  subjectsOnDisk: report.subjectsOnDisk,
  out: OUT_PATH,
}, null, 2));
console.log("\nHero placeholders:");
for (const p of placeholders.filter((x) => x.type === "hero").slice(0, 60)) {
  console.log(`  ${p.id} | ${p.name}`);
}
