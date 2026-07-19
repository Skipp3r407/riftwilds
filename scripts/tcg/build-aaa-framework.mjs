/**
 * Build AAA TCG framework artifacts:
 * - Expand card families for every creature species
 * - Curate ~330 competitive launch-pool ids
 * - Append placeholder gameplay cards only if pool is short
 * - Never strip existing art paths / lore from migrated cards
 *
 * Usage: node scripts/tcg/build-aaa-framework.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const dataDir = path.join(root, "src/content/tcg/data");

const TARGET_LAUNCH = 330;
const PLACEHOLDER_EXPANSION = "rise-of-the-rift";

const ELEMENT_FACTION = {
  fire: "ember-forge",
  metal: "ember-forge",
  water: "tideward-coast",
  crystal: "tideward-coast",
  nature: "grove-circle",
  poison: "grove-circle",
  earth: "grove-circle",
  storm: "stormspire",
  arcane: "stormspire",
  light: "stormspire",
  shadow: "stormspire",
  spirit: "grove-circle",
  celestial: "stormspire",
  void: "stormspire",
  neutral: "grove-circle",
};

const FACTION_AFFINITY = {
  "ember-forge": "EMBER",
  "tideward-coast": "TIDE",
  "grove-circle": "GROVE",
  stormspire: "STORM",
};

const STAGE_DEFS = [
  { id: "shellseed", label: "Shellseed", order: 0 },
  { id: "softling", label: "Softling", order: 1 },
  { id: "companion", label: "Bond Companion", order: 2, prefix: "comp" },
  { id: "keeper", label: "Keeper Form", order: 3, prefix: "c" },
  { id: "riftmarked", label: "Riftmarked", order: 4 },
  { id: "awaken", label: "Awakened", order: 5, prefix: "evo" },
  { id: "ascendant", label: "Ascendant", order: 6 },
];

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, rel), "utf8"));
}

function writeJson(rel, data) {
  const dest = path.join(dataDir, rel);
  fs.writeFileSync(dest, JSON.stringify(data, null, 2) + "\n");
  return dest;
}

function isCompetitive(card) {
  if (card.isToken) return false;
  if (card.finish && card.finish !== "standard") return false;
  if (
    card.type === "weather" ||
    card.type === "quest" ||
    card.type === "event" ||
    card.id.includes("-prop-") ||
    card.id.includes("-npc-")
  ) {
    return false;
  }
  return true;
}

function buildFamilies(cards) {
  const creatures = cards.filter((c) => c.type === "creature" && c.riftlingSlug);
  const bySlug = new Map();
  for (const c of creatures) {
    if (!bySlug.has(c.riftlingSlug)) bySlug.set(c.riftlingSlug, c);
  }

  const families = [...bySlug.entries()].map(([slug, creature]) => {
    const name = creature.localization?.name || titleCase(slug);
    const factionId = ELEMENT_FACTION[creature.element] || "grove-circle";
    const findCard = (prefix) =>
      cards.find((c) => c.id === `rotr-${prefix}-${slug}`) || null;

    const stages = STAGE_DEFS.map((st) => {
      if (st.prefix) {
        const card = findCard(st.prefix);
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
            loreUnlock:
              card.localization.loreBlurb || card.localization.flavorText,
            flavorText: card.localization.flavorText,
            branchIds:
              st.id === "awaken"
                ? [`${slug}-skyline`, `${slug}-hearthline`]
                : [],
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
          st.id === "ascendant"
            ? "mythic"
            : st.id === "shellseed"
              ? "common"
              : "rare",
        animationHook: `anim/${slug}/${st.id}`,
        loreUnlock: `Discover the ${st.label} chapter of the ${name} line.`,
        flavorText: "Shell memory — not yet drawn into the binder.",
        branchIds: [],
      };
    });

    return {
      id: `family-${slug}`,
      speciesSlug: slug,
      name,
      title: `${name} Line`,
      factionId,
      affinity: FACTION_AFFINITY[factionId],
      identity: `${name} keepers walk a single bond-line from Shellseed to Ascendant.`,
      strengths: [creature.element, "bond"],
      weaknesses: ["hate cards"],
      signatureMechanic: `${titleCase(creature.element)} bond-line`,
      portraitArtPath:
        creature.art?.assetPath || `/assets/pets/thumbs/${slug}.webp`,
      stages,
      branches: [
        {
          id: `${slug}-skyline`,
          name: `${name} Skyline`,
          fromStageId: "awaken",
          description: "Chooses the open road — tempo and mobility over bulk.",
          status: "planned",
          tipCardIds: [],
          cosmeticOnly: false,
        },
        {
          id: `${slug}-hearthline`,
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
        id: `reward-${slug}-line`,
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

  families.sort((a, b) => a.speciesSlug.localeCompare(b.speciesSlug));

  return {
    version: 2,
    stageLabels: STAGE_DEFS.map((s) => ({
      id: s.id,
      label: s.label,
      order: s.order,
    })),
    finishes: [
      { id: "standard", label: "Standard", cosmetic: true },
      { id: "foil", label: "Foil", cosmetic: true },
      { id: "gold", label: "Goldleaf", cosmetic: true },
      { id: "crystal", label: "Crystal", cosmetic: true },
      { id: "animated", label: "Animated", cosmetic: true },
    ],
    families,
  };
}

function pickLaunchPool(cards) {
  const competitive = cards.filter(isCompetitive);
  const priorityType = new Set([
    "creature",
    "companion",
    "legendary",
    "spell",
    "equipment",
    "relic",
    "artifact",
    "trap",
    "hero",
  ]);
  const scored = competitive
    .filter((c) => priorityType.has(c.type))
    .map((c) => {
      let score = 0;
      if (c.type === "creature") score += 50;
      if (c.type === "companion") score += 35;
      if (c.type === "legendary") score += 40;
      if (c.type === "spell") score += 30;
      if (c.type === "equipment") score += 25;
      if (c.riftlingSlug) score += 20;
      if (c.art?.cardImagePath || c.art?.assetPath) score += 10;
      if (c.isPlaceholder) score -= 40;
      score += Math.max(0, 10 - (c.energyCost ?? 0));
      return { id: c.id, score };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const ids = scored.slice(0, TARGET_LAUNCH).map((x) => x.id);
  return ids;
}

function makePlaceholder(index, collectorNumber) {
  const elements = [
    "fire",
    "water",
    "nature",
    "earth",
    "storm",
    "crystal",
    "shadow",
    "light",
    "spirit",
  ];
  const roles = ["striker", "tank", "support", "controller", "skirmisher"];
  const element = elements[index % elements.length];
  const role = roles[index % roles.length];
  const cost = 1 + (index % 7);
  const atk = 1 + (index % 6);
  const hp = 1 + ((index + 2) % 7);
  const id = `rotr-ph-launch-${String(index + 1).padStart(3, "0")}`;
  const name = `Rift Prospect ${index + 1}`;
  return {
    id,
    setId: PLACEHOLDER_EXPANSION,
    collectorNumber,
    type: "creature",
    element,
    rarity: index % 11 === 0 ? "rare" : "common",
    energyCost: cost,
    attack: atk,
    health: hp,
    defense: Math.max(0, Math.round(hp * 0.45)),
    speed: Math.max(1, 8 - cost),
    role,
    familyId: null,
    evolutionStage: "keeper",
    keywords: [],
    abilities: [
      {
        id: `${id}-spark`,
        name: "Prospect Spark",
        timing: "battlecry",
        text: "Placeholder unit for launch-pool scale tests.",
        effects: [{ op: "custom", notes: "placeholder" }],
      },
    ],
    passive: null,
    localization: {
      name,
      typeLine: `common creature — ${element}`,
      rulesText: "Placeholder unit for launch-pool scale tests.",
      flavorText:
        "A Prospect shell waiting for a true Riftling bond — architecture only.",
      loreBlurb: "AAA framework placeholder — replace with designed card.",
    },
    art: {
      promptId: `art-${id}`,
      prompt: `Create an original fantasy trading card illustration for Riftwilds named ${name}. Soft placeholder silhouette, ${element} element, painterly fantasy, no text, no logos.`,
      negativePrompt:
        "no Pokémon resemblance, no Digimon, no existing TCG mascot, no photorealism, no text, no watermark, no logo",
      assetPath: "/assets/tcg/placeholders/prospect.webp",
    },
    animation: {
      idle: `anim/${id}/idle`,
      play: `anim/${id}/play`,
      attack: `anim/${id}/attack`,
      death: `anim/${id}/death`,
    },
    sound: {
      play: "sfx/tcg/play_neutral",
      hit: "sfx/tcg/hit_soft",
      death: "sfx/tcg/death_soft",
    },
    particles: ["vfx/soft_motes"],
    voiceDirection: "Soft keeper narration",
    craftCost: 40,
    craftCosts: {
      gold: 40,
      riftShards: 10,
      ancientFragments: 0,
      duplicateCopies: 2,
    },
    sellValue: 10,
    unlockMethod: "placeholder",
    collectionTags: ["placeholder", "launch-pool", element],
    expansionId: PLACEHOLDER_EXPANSION,
    relatedNpcs: [],
    relatedQuests: [],
    relatedRiftlings: [],
    isPlaceholder: true,
    competitiveEligible: true,
    balanceNotes: "Placeholder — balance before competitive release.",
  };
}

function expandShowcase(cards, launchIds) {
  const starterPath = path.join(dataDir, "starter-set-20.json");
  const starter = JSON.parse(fs.readFileSync(starterPath, "utf8"));
  const ids = [...starter.cardIds];
  for (const id of launchIds) {
    if (ids.length >= 30) break;
    if (!ids.includes(id)) ids.push(id);
  }
  starter.cardIds = ids.slice(0, 30);
  starter.deckSize = 30;
  starter.notes = [
    ...(starter.notes || []).filter((n) => !String(n).includes("20-card")),
    "Constructed showcase: exactly 30 cards + separate Commander.",
    "F2P competitive — craft path never requires crypto/SOL.",
  ];
  fs.writeFileSync(starterPath, JSON.stringify(starter, null, 2) + "\n");
  return starter.cardIds.length;
}

function main() {
  const cards = readJson("cards.json");
  const maxCollector = cards.reduce(
    (m, c) => Math.max(m, c.collectorNumber || 0),
    0,
  );

  // Remove prior placeholders so rebuild is idempotent
  const kept = cards.filter((c) => !c.isPlaceholder);
  let nextCollector = maxCollector + 1;

  let launchIds = pickLaunchPool(kept);
  const placeholders = [];
  while (launchIds.length < TARGET_LAUNCH) {
    const ph = makePlaceholder(placeholders.length, nextCollector++);
    placeholders.push(ph);
    launchIds.push(ph.id);
  }

  const merged = [...kept, ...placeholders];
  // Preserve collector uniqueness
  const seenNums = new Set();
  for (const c of merged) {
    if (seenNums.has(c.collectorNumber)) {
      c.collectorNumber = nextCollector++;
    }
    seenNums.add(c.collectorNumber);
  }

  writeJson("cards.json", merged);

  const families = buildFamilies(merged);
  writeJson("card-families.json", families);

  // Re-pick after placeholders so pool hits target with real priority first
  launchIds = pickLaunchPool(merged).slice(0, TARGET_LAUNCH);
  writeJson("launch-pool.json", {
    version: 1,
    targetCount: TARGET_LAUNCH,
    description:
      "Curated competitive launch pool (~330). Regenerated by scripts/tcg/build-aaa-framework.mjs. Placeholders fill gaps without destroying art/lore cards.",
    generatedAt: new Date().toISOString(),
    cardIds: launchIds,
    counts: {
      totalCards: merged.length,
      placeholders: placeholders.length,
      families: families.families.length,
      competitiveEligible: merged.filter(isCompetitive).length,
      launchPool: launchIds.length,
    },
  });

  const showcaseSize = expandShowcase(merged, launchIds);

  console.log(
    JSON.stringify(
      {
        totalCards: merged.length,
        placeholdersAdded: placeholders.length,
        families: families.families.length,
        launchPool: launchIds.length,
        showcaseSize,
        note: "Art/lore cards preserved; placeholders only fill launch-pool gaps.",
      },
      null,
      2,
    ),
  );
}

main();
