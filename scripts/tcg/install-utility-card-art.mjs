/**
 * Install high-res subject plates for non-hero cards still on SVG silhouettes.
 * Composites unique still-life vignettes from region wallpapers + accent motifs
 * (local sharp — no external API).
 *
 * Usage: node scripts/tcg/install-utility-card-art.mjs
 * Then:  node scripts/tcg/generate-card-images.mjs --force --only <ids>
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const SUBJECTS_DIR = path.join(ROOT, "public/assets/tcg/subjects");
const REPORT_PATH = path.join(ROOT, "artifacts/tcg-utility-art-install.json");
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

function motifSvg(card, accent) {
  const type = String(card.type || "spell");
  const name = String(card.localization?.name || card.id).toLowerCase();
  const seed = hashStr(card.id);
  const cx = 512;
  const cy = 480;
  const r1 = 120 + (seed % 40);
  const r2 = 60 + (seed % 30);

  if (type === "equipment" || /cloak|mantle|badge|charm|whistle|lens|satchel/i.test(name)) {
    return `
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#0a1220" stop-opacity="0.2"/>
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy + 180}" rx="220" ry="48" fill="#000" opacity="0.35"/>
      <path d="M ${cx - 160} ${cy + 40} Q ${cx} ${cy - 220} ${cx + 160} ${cy + 40} L ${cx + 120} ${cy + 120} Q ${cx} ${cy + 40} ${cx - 120} ${cy + 120} Z" fill="url(#g)" opacity="0.9"/>
      <circle cx="${cx}" cy="${cy - 40}" r="${r2}" fill="${accent}" opacity="0.55"/>
      <circle cx="${cx}" cy="${cy - 40}" r="${Math.floor(r2 * 0.45)}" fill="#f4efe6" opacity="0.75"/>
      <rect x="${cx - 18}" y="${cy + 40}" width="36" height="140" rx="8" fill="${accent}" opacity="0.5"/>
    `;
  }
  if (type === "relic" || type === "artifact") {
    return `
      <ellipse cx="${cx}" cy="${cy + 200}" rx="240" ry="50" fill="#000" opacity="0.35"/>
      <polygon points="${cx},${cy - 220} ${cx + 140},${cy + 40} ${cx},${cy + 160} ${cx - 140},${cy + 40}" fill="${accent}" opacity="0.55"/>
      <polygon points="${cx},${cy - 120} ${cx + 70},${cy + 20} ${cx},${cy + 100} ${cx - 70},${cy + 20}" fill="#f4efe6" opacity="0.35"/>
      <circle cx="${cx}" cy="${cy - 20}" r="48" fill="${accent}" opacity="0.8"/>
      <circle cx="${cx}" cy="${cy - 20}" r="22" fill="#0a1220" opacity="0.7"/>
    `;
  }
  if (type === "trap" || type === "event" || type === "quest") {
    return `
      <ellipse cx="${cx}" cy="${cy + 200}" rx="260" ry="52" fill="#000" opacity="0.3"/>
      <circle cx="${cx}" cy="${cy - 40}" r="${r1}" fill="none" stroke="${accent}" stroke-width="18" opacity="0.7"/>
      <circle cx="${cx}" cy="${cy - 40}" r="${Math.floor(r1 * 0.55)}" fill="${accent}" opacity="0.35"/>
      <path d="M ${cx - 40} ${cy - 180} L ${cx + 10} ${cy - 40} L ${cx - 30} ${cy - 20} L ${cx + 50} ${cy + 140}" fill="none" stroke="#f4efe6" stroke-width="14" opacity="0.55"/>
      <circle cx="${cx + 160}" cy="${cy - 120}" r="18" fill="${accent}" opacity="0.65"/>
      <circle cx="${cx - 170}" cy="${cy + 40}" r="14" fill="#f4efe6" opacity="0.45"/>
    `;
  }
  if (type === "token" || type === "creature" || type === "legendary") {
    return `
      <ellipse cx="${cx}" cy="${cy + 200}" rx="240" ry="50" fill="#000" opacity="0.35"/>
      <ellipse cx="${cx}" cy="${cy + 20}" rx="${r1}" ry="${Math.floor(r1 * 0.85)}" fill="${accent}" opacity="0.55"/>
      <circle cx="${cx}" cy="${cy - 120}" r="${r2 + 20}" fill="${accent}" opacity="0.75"/>
      <circle cx="${cx - 22}" cy="${cy - 128}" r="10" fill="#f4efe6"/>
      <circle cx="${cx + 26}" cy="${cy - 124}" r="9" fill="#f4efe6"/>
      <circle cx="${cx - 22}" cy="${cy - 128}" r="4" fill="#0a1220"/>
      <circle cx="${cx + 26}" cy="${cy - 124}" r="4" fill="#0a1220"/>
      <path d="M ${cx - 40} ${cy - 170} L ${cx - 10} ${cy - 230} L ${cx + 10} ${cy - 168}" fill="${accent}" opacity="0.6"/>
      <path d="M ${cx + 20} ${cy - 165} L ${cx + 48} ${cy - 225} L ${cx + 60} ${cy - 160}" fill="#f4efe6" opacity="0.35"/>
    `;
  }
  // generic spell burst
  return `
    <ellipse cx="${cx}" cy="${cy + 200}" rx="250" ry="50" fill="#000" opacity="0.3"/>
    <circle cx="${cx}" cy="${cy - 40}" r="${r1}" fill="${accent}" opacity="0.4"/>
    <circle cx="${cx}" cy="${cy - 40}" r="${Math.floor(r1 * 0.55)}" fill="#f4efe6" opacity="0.35"/>
    <path d="M ${cx} ${cy - 220} Q ${cx + 120} ${cy - 40} ${cx} ${cy + 140} Q ${cx - 120} ${cy - 40} ${cx} ${cy - 220} Z" fill="${accent}" opacity="0.65"/>
  `;
}

async function makeSubject(card) {
  const el = card.element || "neutral";
  const plateRel = ELEMENT_PLATE[el] || ELEMENT_PLATE.neutral;
  const plateDisk = path.join(ROOT, plateRel);
  const accent = ACCENTS[el] || ACCENTS.neutral;
  const seed = hashStr(card.id);
  const left = seed % 180;
  const top = (seed >>> 8) % 160;

  const base = fs.existsSync(plateDisk)
    ? await sharp(plateDisk)
        .extract({
          left: Math.min(left, 40),
          top: Math.min(top, 40),
          width: Math.min(900, 800),
          height: Math.min(900, 800),
        })
        .resize(W, H, { fit: "cover" })
        .modulate({ brightness: 0.72, saturation: 1.1 })
        .png()
        .toBuffer()
    : await sharp({
        create: {
          width: W,
          height: H,
          channels: 3,
          background: { r: 12, g: 18, b: 32 },
        },
      })
        .png()
        .toBuffer();

  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="45%" r="65%">
      <stop offset="40%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  ${motifSvg(card, accent)}
</svg>`);

  const slug = subjectSlugFromCard(card);
  const out = path.join(SUBJECTS_DIR, `${slug}.png`);
  await sharp(base)
    .composite([{ input: await sharp(overlay).png().toBuffer(), blend: "over" }])
    .png({ compressionLevel: 8 })
    .toFile(out);
  return { slug, out, rel: `/assets/tcg/subjects/${slug}.png` };
}

async function main() {
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  fs.mkdirSync(SUBJECTS_DIR, { recursive: true });

  const targets = cards.filter((c) => {
    if (c.type === "hero") return false;
    const slug = subjectSlugFromCard(c);
    const subject = path.join(SUBJECTS_DIR, `${slug}.png`);
    if (fs.existsSync(subject) && fs.statSync(subject).size > 20_000) return false;
    // skip creatures that already have pet art
    const pet = String(c.id).match(/rotr-(?:c|comp|evo)-([a-z0-9-]+)/);
    if (pet) {
      const thumb = path.join(ROOT, `public/assets/pets/thumbs/${pet[1]}.webp`);
      if (fs.existsSync(thumb) && fs.statSync(thumb).size > 5_000) return false;
    }
    return true;
  });

  const report = { installed: [], count: targets.length };
  for (const card of targets) {
    const hit = await makeSubject(card);
    if (!card.art) card.art = {};
    card.art.subjectPath = hit.rel;
    card.art.cardImagePath = `/assets/tcg/cards/${card.id}.webp`;
    report.installed.push({ id: card.id, name: card.localization?.name, ...hit });
    console.log(`OK ${card.id} -> ${hit.rel}`);
  }

  fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2) + "\n");
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nInstalled ${report.installed.length} utility subjects`);
  if (report.installed.length) {
    console.log(
      `Regen: node scripts/tcg/generate-card-images.mjs --force --only ${report.installed.map((x) => x.id).join(",")}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
