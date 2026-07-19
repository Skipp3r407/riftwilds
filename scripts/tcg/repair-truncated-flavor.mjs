/**
 * Repair creature card flavorText truncated at 160 chars (+ ellipsis)
 * by restoring full shortBio from species lore modules.
 *
 * Usage: node scripts/tcg/repair-truncated-flavor.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadSpeciesFromLore } from "./content-sources.mjs";

const DATA = path.join(ROOT, "src/content/tcg/data");
const CARDS_PATH = path.join(DATA, "cards.json");
const BUNDLE_PATH = path.join(DATA, "bundle.json");
const FAMILIES_PATH = path.join(DATA, "card-families.json");

function isTruncatedFlavor(text) {
  const t = (text || "").trim();
  return t.includes("…") || t.endsWith("...");
}

function endsComplete(text) {
  const t = (text || "").trim();
  return t.length > 0 && /[.!?]"?$/.test(t);
}

function repairCardList(cards, bySlug, label) {
  let repaired = 0;
  let skippedMissingLore = 0;
  const samples = [];

  for (const card of cards) {
    if (card.type !== "creature") continue;
    const flavor = card.localization?.flavorText || "";
    if (!isTruncatedFlavor(flavor)) continue;

    const slug = card.riftlingSlug;
    const sp = slug ? bySlug.get(slug) : null;
    if (!sp?.shortBio || !endsComplete(sp.shortBio)) {
      skippedMissingLore++;
      console.warn(`[${label}] skip ${card.id}: no complete shortBio for slug=${slug}`);
      continue;
    }

    card.localization.flavorText = sp.shortBio;
    repaired++;
    if (samples.length < 3 || slug === "lavaling") {
      samples.push({ id: card.id, slug, flavor: sp.shortBio });
    }
  }

  return { repaired, skippedMissingLore, samples };
}

const species = loadSpeciesFromLore();
const bySlug = new Map(species.map((s) => [s.slug, s]));

const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
const cardsResult = repairCardList(cards, bySlug, "cards.json");
fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2) + "\n", "utf8");

const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, "utf8"));
const bundleCards = Array.isArray(bundle.cards) ? bundle.cards : [];
const bundleResult = repairCardList(bundleCards, bySlug, "bundle.json");
fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundle, null, 2) + "\n", "utf8");

let familyRepaired = 0;
if (fs.existsSync(FAMILIES_PATH)) {
  const familyBundle = JSON.parse(fs.readFileSync(FAMILIES_PATH, "utf8"));
  const families = Array.isArray(familyBundle)
    ? familyBundle
    : familyBundle.families || [];
  for (const fam of families) {
    const slug = fam.speciesSlug || fam.riftlingSlug || fam.slug;
    for (const stage of fam.stages || []) {
      if (!isTruncatedFlavor(stage.flavorText)) continue;
      const sp = slug ? bySlug.get(slug) : null;
      const card = cards.find((c) => c.id === stage.cardId);
      const next = card?.localization?.flavorText || sp?.shortBio;
      if (next && endsComplete(next)) {
        stage.flavorText = next;
        familyRepaired++;
      }
    }
  }
  fs.writeFileSync(FAMILIES_PATH, JSON.stringify(familyBundle, null, 2) + "\n", "utf8");
}

console.log("cards.json repaired:", cardsResult.repaired, "skipped:", cardsResult.skippedMissingLore);
console.log("bundle.json repaired:", bundleResult.repaired, "skipped:", bundleResult.skippedMissingLore);
console.log("card-families stages repaired:", familyRepaired);
console.log("samples:");
for (const s of cardsResult.samples) {
  console.log(`- ${s.id} (${s.slug}): ${s.flavor}`);
}

const stillCards = cards.filter(
  (c) => c.type === "creature" && isTruncatedFlavor(c.localization?.flavorText),
);
const stillBundle = bundleCards.filter(
  (c) => c.type === "creature" && isTruncatedFlavor(c.localization?.flavorText),
);
console.log("remaining truncated (cards/bundle):", stillCards.length, stillBundle.length);
