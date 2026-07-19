import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const cards = JSON.parse(
  fs.readFileSync(path.join(root, "src/content/tcg/data/cards.json"), "utf8"),
);

const SPECIES = [
  { slug: "ashwing", factionId: "ember-forge", signature: "Riftbond aerial pressure", strengths: ["tempo", "riftbond"], weaknesses: ["ward walls"] },
  { slug: "cindercub", factionId: "ember-forge", signature: "Hearthlink midrange", strengths: ["synergy", "sustain"], weaknesses: ["fast aggro"] },
  { slug: "craterhorn", factionId: "ember-forge", signature: "Molten guardian beatdown", strengths: ["high power", "board presence"], weaknesses: ["removal"] },
  { slug: "emberfox", factionId: "ember-forge", signature: "Ember skirmish", strengths: ["curve", "charge lanes"], weaknesses: ["late game"] },
  { slug: "brinepaw", factionId: "tideward-coast", signature: "Tide ward attrition", strengths: ["ward", "control"], weaknesses: ["burn races"] },
  { slug: "bubbloon", factionId: "tideward-coast", signature: "Soft bubble tempo", strengths: ["tempo", "ward"], weaknesses: ["silence"] },
  { slug: "coralurge", factionId: "tideward-coast", signature: "Coastal early curve", strengths: ["early board"], weaknesses: ["overrun"] },
  { slug: "bramblefox", factionId: "grove-circle", signature: "Bloom midrange", strengths: ["bloom", "riftbond"], weaknesses: ["hate cards"] },
  { slug: "elderfern", factionId: "grove-circle", signature: "Ancient bloom wall", strengths: ["health", "bloom"], weaknesses: ["evasion"] },
  { slug: "mossprig", factionId: "grove-circle", signature: "Commons care engine", strengths: ["synergy", "heal lines"], weaknesses: ["tempo loss"] },
  { slug: "galekit", factionId: "stormspire", signature: "Charge opener", strengths: ["charge", "speed"], weaknesses: ["fatigued boards"] },
  { slug: "cloudleaper", factionId: "stormspire", signature: "Spirewind tempo", strengths: ["tempo", "mobility"], weaknesses: ["ground locks"] },
];

const STAGE_DEFS = [
  { id: "shellseed", label: "Shellseed", order: 0 },
  { id: "softling", label: "Softling", order: 1 },
  { id: "companion", label: "Bond Companion", order: 2, prefix: "comp" },
  { id: "keeper", label: "Keeper Form", order: 3, prefix: "c" },
  { id: "riftmarked", label: "Riftmarked", order: 4 },
  { id: "awaken", label: "Awakened", order: 5, prefix: "evo" },
  { id: "ascendant", label: "Ascendant", order: 6 },
];

const FACTION_AFFINITY = {
  "ember-forge": "EMBER",
  "tideward-coast": "TIDE",
  "grove-circle": "GROVE",
  stormspire: "STORM",
};

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function findCard(slug, prefix) {
  const id = `rotr-${prefix}-${slug}`;
  return cards.find((c) => c.id === id) || null;
}

const families = SPECIES.map((spec) => {
  const name = titleCase(spec.slug);
  const stages = STAGE_DEFS.map((st) => {
    if (st.prefix) {
      const card = findCard(spec.slug, st.prefix);
      if (card) {
        return {
          stageId: st.id,
          label: st.label,
          order: st.order,
          status: "released",
          cardId: card.id,
          displayName: card.localization.name,
          rarityHint: card.rarity,
          animationHook: card.animation?.idle || `anim/${card.id}/idle`,
          loreUnlock: card.localization.loreBlurb || card.localization.flavorText,
          flavorText: card.localization.flavorText,
          branchIds: st.id === "awaken" ? [`${spec.slug}-skyline`, `${spec.slug}-hearthline`] : [],
        };
      }
    }
    return {
      stageId: st.id,
      label: st.label,
      order: st.order,
      status: "planned",
      cardId: null,
      displayName: `${name} ${st.label}`,
      rarityHint:
        st.id === "ascendant" ? "mythic" : st.id === "shellseed" ? "common" : "rare",
      animationHook: `anim/${spec.slug}/${st.id}`,
      loreUnlock: `Discover the ${st.label} chapter of the ${name} line.`,
      flavorText: "Shell memory — not yet drawn into the binder.",
      branchIds: [],
    };
  });

  return {
    id: `family-${spec.slug}`,
    speciesSlug: spec.slug,
    name,
    title: `${name} Line`,
    factionId: spec.factionId,
    affinity: FACTION_AFFINITY[spec.factionId],
    identity: `${name} keepers walk a single bond-line from Shellseed to Ascendant.`,
    strengths: spec.strengths,
    weaknesses: spec.weaknesses,
    signatureMechanic: spec.signature,
    portraitArtPath: `/assets/pets/thumbs/${spec.slug}.webp`,
    stages,
    branches: [
      {
        id: `${spec.slug}-skyline`,
        name: `${name} Skyline`,
        fromStageId: "awaken",
        description: "Chooses the open road — tempo and mobility over bulk.",
        status: "planned",
        tipCardIds: [],
        cosmeticOnly: false,
      },
      {
        id: `${spec.slug}-hearthline`,
        name: `${name} Hearthline`,
        fromStageId: "awaken",
        description: "Chooses the nest — sustain and guardian presence.",
        status: "planned",
        tipCardIds: [],
        cosmeticOnly: false,
      },
    ],
    finishesSupported: ["standard", "foil", "gold", "crystal", "animated"],
    completionReward: {
      id: `reward-${spec.slug}-line`,
      label: `${name} Line Codex Seal`,
      kind: "cosmetic",
      notes: "Binder seal + Codex page frame. No competitive power.",
    },
    loreChapters: [
      {
        id: "origin",
        title: "Origin",
        unlockStageId: "companion",
        body: `The ${name} line begins where affinity weather cools into a shell.`,
      },
      {
        id: "bond",
        title: "First Bond",
        unlockStageId: "keeper",
        body: `Keepers learn ${name}'s tempo through honest invitation, not force.`,
      },
      {
        id: "awaken",
        title: "Awakening",
        unlockStageId: "awaken",
        body: `Awakened ${name} remembers every Softling habit — sharpened, not erased.`,
      },
    ],
  };
});

const out = {
  version: 1,
  stageLabels: STAGE_DEFS.map((s) => ({ id: s.id, label: s.label, order: s.order })),
  finishes: [
    { id: "standard", label: "Standard", cosmetic: true },
    { id: "foil", label: "Foil", cosmetic: true },
    { id: "gold", label: "Goldleaf", cosmetic: true },
    { id: "crystal", label: "Crystal", cosmetic: true },
    { id: "animated", label: "Animated", cosmetic: true },
  ],
  families,
};

const dest = path.join(root, "src/content/tcg/data/card-families.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
const released = families.reduce(
  (n, f) => n + f.stages.filter((s) => s.status === "released").length,
  0,
);
console.log(`wrote ${dest} · families ${families.length} · released stages ${released}`);
