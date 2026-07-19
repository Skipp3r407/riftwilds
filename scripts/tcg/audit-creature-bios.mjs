/**
 * Audit creature lore + card flavor for incompleteness / truncation.
 * Usage: node scripts/tcg/audit-creature-bios.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadSpeciesFromLore } from "./content-sources.mjs";

const LORE_DIR = path.join(ROOT, "src/content/pets/lore");
const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const BIO_DIR = path.join(ROOT, "public/assets/tcg/bio");
const THUMBS = path.join(ROOT, "public/assets/pets/thumbs");
const PET_ROOT = path.join(ROOT, "public/assets/pets");

const JOURNAL_FIELDS = [
  "shortBio",
  "origin",
  "naturalBehavior",
  "socialBehavior",
  "diet",
  "battleTendencies",
  "evolvedStageBehavior",
  "standardBio",
  "fullLore",
];

function firstString(src, key) {
  const m = src.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "m"));
  return m ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
}

function endsComplete(text) {
  const t = (text || "").trim();
  return t.length > 0 && /[.!?]"?$/.test(t);
}

function isTruncated(text) {
  const t = (text || "").trim();
  if (!t) return true;
  if (t.includes("…") || t.endsWith("...")) return true;
  if (/\b(and|or|the|a|an|to|of|for|with|known|favor|soft|are|is)\s*$/i.test(t)) return true;
  if (!endsComplete(t) && t.length > 20) return true;
  return false;
}

function isGenericTemplate(text) {
  return /quiet talent for reading unstable air|soft routines|Often mistaken for simple/i.test(
    text || "",
  );
}

const speciesFiles = fs
  .readdirSync(LORE_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts");

const loreIssues = [];
let loreOk = 0;
const genericShortBios = [];

for (const file of speciesFiles) {
  const src = fs.readFileSync(path.join(LORE_DIR, file), "utf8");
  const slug = firstString(src, "slug") || file.replace(/\.ts$/, "");
  const problems = [];
  for (const field of JOURNAL_FIELDS) {
    const v = firstString(src, field);
    if (!v.trim()) problems.push(`${field}:EMPTY`);
    else if (isTruncated(v)) problems.push(`${field}:INCOMPLETE`);
  }
  const foods = src.match(/"favoriteFoods"\s*:\s*\[([\s\S]*?)\]/);
  if (!foods || !foods[1].replace(/[\s,]/g, "").length) {
    problems.push("favoriteFoods:EMPTY");
  }
  const shortBio = firstString(src, "shortBio");
  if (isGenericTemplate(shortBio)) genericShortBios.push(slug);
  if (problems.length) loreIssues.push({ slug, problems });
  else loreOk++;
}

const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
const creatureCards = cards.filter((c) => c.type === "creature");
const truncatedFlavor = [];
const incompleteFlavor = [];
for (const card of creatureCards) {
  const flavor = card.localization?.flavorText || "";
  if (flavor.includes("…") || flavor.endsWith("...")) {
    truncatedFlavor.push(card.id);
  } else if (flavor.trim() && !endsComplete(flavor) && !flavor.startsWith("Shell memory")) {
    incompleteFlavor.push({ id: card.id, tail: flavor.slice(-48) });
  }
}

const affinities = [
  "ember",
  "tide",
  "grove",
  "storm",
  "stone",
  "frost",
  "radiant",
  "void",
  "alloy",
  "spirit",
  "celestial",
];
const missingVignettes = [];
const tinyVignettes = [];
let pngVignettes = 0;
for (const a of affinities) {
  for (const section of ["diet", "behavior"]) {
    const svg = path.join(BIO_DIR, `${section}-${a}.svg`);
    const png = path.join(BIO_DIR, `${section}-${a}.png`);
    if (!fs.existsSync(svg) && !fs.existsSync(png)) {
      missingVignettes.push(`${section}-${a}`);
    } else {
      const p = fs.existsSync(png) ? png : svg;
      if (fs.existsSync(png)) pngVignettes++;
      const size = fs.statSync(p).size;
      // SVG placeholders are ~1kb; painted PNGs are multi-MB.
      if (size < 50_000 && path.extname(p) === ".png") {
        tinyVignettes.push({ file: path.basename(p), size });
      }
      if (!fs.existsSync(png)) {
        tinyVignettes.push({ file: `${section}-${a}.svg (no png)`, size });
      }
    }
  }
}

const loaded = loadSpeciesFromLore();
const missingThumbs = [];
const missingPortraits = [];
for (const sp of loaded) {
  const thumbWebp = path.join(THUMBS, `${sp.slug}.webp`);
  const thumbPng = path.join(THUMBS, `${sp.slug}.png`);
  const portraitPng = path.join(PET_ROOT, `${sp.slug}.png`);
  if (!fs.existsSync(thumbWebp) && !fs.existsSync(thumbPng)) {
    missingThumbs.push(sp.slug);
  }
  if (!fs.existsSync(portraitPng)) missingPortraits.push(sp.slug);
}

console.log("=== LORE JOURNAL FIELDS ===");
console.log("species files:", speciesFiles.length);
console.log("fully complete (no trunc/empty):", loreOk);
console.log("with incompleteness:", loreIssues.length);
for (const i of loreIssues.slice(0, 50)) {
  console.log(`- ${i.slug}: ${i.problems.join(", ")}`);
}
if (loreIssues.length > 50) console.log(`... +${loreIssues.length - 50} more`);
console.log("generic template shortBios:", genericShortBios.length);
console.log("generic sample:", genericShortBios.slice(0, 15).join(", "));

console.log("\n=== CARD FLAVOR ===");
console.log("creature cards:", creatureCards.length);
console.log("ellipsis-truncated flavor:", truncatedFlavor.length);
console.log("incomplete sentences:", incompleteFlavor.length);
if (truncatedFlavor.length) console.log("truncated ids:", truncatedFlavor.slice(0, 20));
if (incompleteFlavor.length) {
  for (const x of incompleteFlavor.slice(0, 15)) {
    console.log(`- ${x.id}: …${x.tail}`);
  }
}

console.log("\n=== BIO VIGNETTES ===");
console.log("painted png masters:", pngVignettes);
console.log("missing:", missingVignettes.length, missingVignettes.join(", ") || "(none)");
console.log("tiny/placeholder-sized:", tinyVignettes.length);
for (const t of tinyVignettes) console.log(`- ${t.file} (${t.size}b)`);

console.log("\n=== CREATURE ART ===");
console.log("missing thumbs:", missingThumbs.length, missingThumbs.slice(0, 20).join(", "));
console.log(
  "missing portraits:",
  missingPortraits.length,
  missingPortraits.slice(0, 20).join(", "),
);
