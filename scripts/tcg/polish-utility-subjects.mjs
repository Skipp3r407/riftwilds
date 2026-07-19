/**
 * Replace geometric pawn overlays on utility subjects with scenic still-life plates.
 * No circle-head / trapezoid body motifs.
 *
 * Usage: node scripts/tcg/polish-utility-subjects.mjs
 * Then:  node scripts/tcg/generate-card-images.mjs --force --only <ids>
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const SUBJECTS_DIR = path.join(ROOT, "public/assets/tcg/subjects");
const REPORT_PATH = path.join(ROOT, "artifacts/tcg-utility-polish.json");
const W = 1024;
const H = 1024;

const ELEMENT_PLATE = {
  fire: "public/assets/wallpapers/spark-glow.png",
  water: "public/assets/wallpapers/moonwater-harbor.png",
  nature: "public/assets/wallpapers/elderwood-forest.png",
  poison: "public/assets/wallpapers/elderwood-forest.png",
  earth: "public/assets/wallpapers/homestead-dusk.png",
  storm: "public/assets/wallpapers/stormspire.png",
  crystal: "public/assets/wallpapers/rift-sky.png",
  light: "public/assets/wallpapers/radiant-castle.png",
  celestial: "public/assets/wallpapers/cosmic-aurora.png",
  shadow: "public/assets/wallpapers/circus-night.png",
  void: "public/assets/wallpapers/circus-night.png",
  metal: "public/assets/wallpapers/lantern-street.png",
  spirit: "public/assets/wallpapers/riftling-meadow.png",
  arcane: "public/assets/wallpapers/cosmic-aurora.png",
  neutral: "public/assets/wallpapers/commons-plaza.png",
};

const ACCENTS = {
  fire: "#ff8a3a",
  water: "#3de7ff",
  nature: "#6ecf7a",
  poison: "#8fd96a",
  earth: "#c4a574",
  storm: "#7ec8ff",
  crystal: "#a8e0ff",
  light: "#ffe566",
  celestial: "#d4a0ff",
  shadow: "#a070ff",
  void: "#8860cc",
  metal: "#c0c8d0",
  spirit: "#b8a0e0",
  arcane: "#9b7dff",
  neutral: "#e8d5b0",
};

const POLISH_TYPES = new Set([
  "equipment",
  "relic",
  "artifact",
  "event",
  "trap",
  "quest",
  "token",
  "creature",
  "legendary",
  "spell",
]);

function subjectSlugFromCard(card) {
  const id = String(card.id || "");
  return (
    id
      .replace(/^rotr-(?:s|e|c|t|h|x|l|w|r|prop)-/, "")
      .replace(/^companion-/, "")
      .replace(/^legendary-/, "")
      .replace(/^artifact-/, "")
      .replace(/^quest-/, "")
      .replace(/^item-/, "")
      .replace(/^npc-/, "") || id
  );
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Soft color wash only — no orbs/eyes/pawns that read as UI flares. */
function stillLifeSvg(_card, accent) {
  return `
      <defs>
        <radialGradient id="tint" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
          <stop offset="55%" stop-color="${accent}" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#tint)"/>
      <ellipse cx="512" cy="920" rx="320" ry="60" fill="#000" opacity="0.22"/>
  `;
}

async function polishSubject(card) {
  const el = card.element || "neutral";
  const plateRel = ELEMENT_PLATE[el] || ELEMENT_PLATE.neutral;
  const plateDisk = path.join(ROOT, plateRel);
  const accent = ACCENTS[el] || ACCENTS.neutral;
  const seed = hashStr(`${card.id}|polish`);
  const left = 20 + (seed % 120);
  const top = 20 + ((seed >>> 8) % 100);

  const base = fs.existsSync(plateDisk)
    ? await sharp(plateDisk)
        .resize(1400, 1400, { fit: "cover", position: "centre" })
        .extract({ left, top, width: 1024, height: 1024 })
        .modulate({ brightness: 0.88, saturation: 1.12 })
        .sharpen({ sigma: 0.6 })
        .png()
        .toBuffer()
    : await sharp({
        create: { width: W, height: H, channels: 3, background: { r: 12, g: 18, b: 32 } },
      })
        .png()
        .toBuffer();

  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="42%" r="68%">
      <stop offset="35%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  ${stillLifeSvg(card, accent)}
</svg>`);

  const slug = subjectSlugFromCard(card);
  const out = path.join(SUBJECTS_DIR, `${slug}.png`);
  await sharp(base)
    .composite([
      { input: await sharp(overlay).png().toBuffer(), blend: "over" },
    ])
    .png({ compressionLevel: 8 })
    .toFile(out);
  return { id: card.id, slug, rel: `/assets/tcg/subjects/${slug}.png` };
}

async function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  // Skip heroes (painted) and pet-backed creatures/companions/evos
  const targets = cards.filter((c) => {
    if (c.type === "hero") return false;
    if (c.type === "location" || c.type === "weather") return false;
    if (String(c.id).includes("-prop-")) return false;
    if (/rotr-(?:c|comp|evo)-/.test(c.id)) {
      // keep pet species with real pet thumbs
      const m = String(c.id).match(/rotr-(?:c|comp|evo)-([a-z0-9-]+)/);
      if (m) {
        const thumb = path.join(ROOT, `public/assets/pets/thumbs/${m[1]}.webp`);
        if (fs.existsSync(thumb) && fs.statSync(thumb).size > 5000) return false;
      }
    }
    // Only polish cards we previously stamped as utility subjects OR types that need it
    if (!POLISH_TYPES.has(c.type) && !/rotr-(?:e|x|t|s|r)-/.test(c.id)) return false;
    // Skip curated spell subjects that already look painted (large unique files older curated set)
    const slug = subjectSlugFromCard(c);
    const curated = [
      "pocket-spark", "corrupt-whisper", "ember-spark", "tide-mend", "root-snare",
      "storm-sip", "crystal-ping", "shade-tax", "arc-latch", "bloom-draft",
      "forge-temper", "harbor-fog", "lantern-lift", "null-veil", "pebble-guard",
      "quake-tap", "rift-pulse", "rust-bite", "spirit-echo", "spirit-moth",
      "star-dust", "static-mite", "stone-brace", "twig-sprite", "moss-buddy",
      "ash-urchin", "dusk-mote", "festival-cheer", "puddle-imp",
    ];
    if (curated.includes(slug)) return false;
    return true;
  });

  const report = { polished: [] };
  for (const card of targets) {
    const hit = await polishSubject(card);
    report.polished.push(hit);
    console.log(`OK ${hit.id}`);
  }
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nPolished ${report.polished.length} subjects`);
  const ids = report.polished.map((x) => x.id);
  fs.writeFileSync(
    path.join(ROOT, "artifacts/tcg-utility-polish-ids.txt"),
    ids.join(","),
  );
  console.log("IDs written to artifacts/tcg-utility-polish-ids.txt");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
