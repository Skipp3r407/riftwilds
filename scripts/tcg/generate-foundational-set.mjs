/**
 * Riftwilds TCG — foundational content generator (data-first).
 * Original IP only. Expands existing lore/regions/Riftlings — does not overwrite them.
 *
 * Usage: node scripts/tcg/generate-foundational-set.mjs
 *
 * Sources (read-only): pet lore, region packs, item catalogs, game-library assets.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT,
  loadSpeciesFromLore,
  loadRegions,
  loadAllCatalogItems,
  loadGameLibrary,
  resolvePetAssetPath,
  resolveItemAssetPath,
  resolveLibraryAsset,
  itemRarityToTcg,
} from "./content-sources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "src/content/tcg/data");

const NEG =
  "no Pokémon resemblance, no Digimon, no existing TCG mascot, no photorealism, no text, no watermark, no logo, no copyrighted franchise characters, no extra limbs, no cropped feet";

const KEYWORDS = [
  {
    id: "ward",
    name: "Ward",
    shortText: "Blocks the next hostile spell or ability.",
    rules: "While Ward is active, the next spell or activated ability that would affect this unit is prevented, then Ward is removed. Attack damage ignores Ward.",
    interactions: ["Shatter removes Ward", "Echo copies do not inherit spent Ward"],
    counterplay: ["Attack instead of casting", "Shatter", "Silence before casting"],
    animationHint: "Cyan glass shell fractures once",
  },
  {
    id: "corrupt",
    name: "Corrupt",
    shortText: "Drain 1 from a target; store as Void residue.",
    rules: "When you Corrupt a target, deal 1 damage or reduce a buff by 1 (controller chooses legal mode). Gain 1 Void Residue (max 3) usable for Void cards.",
    interactions: ["Soulbind shares Residue", "Light cards purge Residue"],
    counterplay: ["Ward", "Heal", "Leave board empty"],
    animationHint: "Violet tendril siphon",
  },
  {
    id: "awaken",
    name: "Awaken",
    shortText: "Transforms after a condition is met.",
    rules: "When Awaken condition is met, replace this card with its awakened form (same board slot). Awaken is once per card instance.",
    interactions: ["Ancient may delay Awaken", "Tokens cannot Awaken unless specified"],
    counterplay: ["Destroy before condition", "Silence"],
    animationHint: "Rift-crack silhouette rebuild",
  },
  {
    id: "overflow",
    name: "Overflow",
    shortText: "Excess healing or damage spills to neighbors.",
    rules: "Healing beyond max HP becomes 1 damage to a random enemy. Damage beyond lethal becomes 1 damage to an adjacent enemy.",
    interactions: ["Guardian redirects Overflow damage", "Bloom converts Overflow heal to +1/+1"],
    counterplay: ["Space units apart", "Guardian"],
    animationHint: "Ripple splash between tiles",
  },
  {
    id: "riftbond",
    name: "Riftbond",
    shortText: "Links to your active Riftling companion.",
    rules: "While Riftbond is active, this card gains +1/+1 if your companion shares its element. If companion is absent, draw a Companion token once.",
    interactions: ["Harmony doubles the bonus", "Soulbind can pair two Riftbond units"],
    counterplay: ["Silence", "Kill companion card first"],
    animationHint: "Cyan thread to companion portrait",
  },
  {
    id: "echo",
    name: "Echo",
    shortText: "May replay a cheap spell this turn.",
    rules: "After you cast a spell costing 2 or less, you may Echo it once this turn at +1 energy (cannot Echo an Echo).",
    interactions: ["Arcane cards reduce Echo surcharge", "Trap spells cannot Echo"],
    counterplay: ["Tax energy", "Counter the first cast"],
    animationHint: "Afterimage of the spell glyph",
  },
  {
    id: "bloom",
    name: "Bloom",
    shortText: "Grows +1/+1 at dawn of your turn.",
    rules: "At the start of your turn, this unit gains +1/+1. Bloom stacks. Silence removes future Bloom ticks.",
    interactions: ["Overflow heal becomes Bloom stacks", "Nature locations accelerate Bloom"],
    counterplay: ["Silence", "Hard removal"],
    animationHint: "Moss rings expand under feet",
  },
  {
    id: "shatter",
    name: "Shatter",
    shortText: "Destroys Ward and deals 1.",
    rules: "Shatter removes Ward from the target, then deals 1 damage. If no Ward, deal 2 instead.",
    interactions: ["Crystal cards may Shatter for free once", "Equipment can grant Shatter"],
    counterplay: ["Recast Ward after", "Buff HP"],
    animationHint: "Glass crack burst",
  },
  {
    id: "guardian",
    name: "Guardian",
    shortText: "Must be attacked first.",
    rules: "Enemy attacks must target a Guardian if one is present (owner's side). Spells may ignore unless they say otherwise.",
    interactions: ["Charge can ignore Guardian once", "Overflow damage still hits neighbors"],
    counterplay: ["Removal spells", "Charge", "Corrupt over time"],
    animationHint: "Shield stance, amber rim",
  },
  {
    id: "soulbind",
    name: "Soulbind",
    shortText: "Pair two allies; share a keyword.",
    rules: "Choose two allied units. They share one keyword you control until either leaves. If one dies, the other takes 1.",
    interactions: ["Riftbond + Soulbind", "Spirit cards reduce death ping"],
    counterplay: ["Kill one to ping the other", "Silence"],
    animationHint: "Soft violet tether",
  },
  {
    id: "harmony",
    name: "Harmony",
    shortText: "Buffs escalate when elements match.",
    rules: "If you control 2+ units of the same element, Harmony effects resolve twice.",
    interactions: ["Locations can grant temporary element", "Celestial counts as any for Harmony once/game"],
    counterplay: ["Split board diversity", "Silence aura"],
    animationHint: "Chord-ring pulse",
  },
  {
    id: "charge",
    name: "Charge",
    shortText: "Can attack the turn it arrives.",
    rules: "This unit may attack on the turn it enters play. Still subject to Guardian rules unless it also has a ignore clause.",
    interactions: ["Fire aggro staples", "Empower scales Charge damage"],
    counterplay: ["Guardian walls", "Traps"],
    animationHint: "Dust streak dash-in",
  },
  {
    id: "empower",
    name: "Empower",
    shortText: "Scales with spent Rift Energy this turn.",
    rules: "Effects with Empower gain +1 for every 2 Rift Energy already spent this turn (after paying this card).",
    interactions: ["Ramp enablers", "Storm Overflow"],
    counterplay: ["Keep opponent under curve", "Drain energy"],
    animationHint: "Amber numerals climb",
  },
  {
    id: "ancient",
    name: "Ancient",
    shortText: "Once-per-game powerful clause.",
    rules: "An Ancient effect can resolve only once per player per game for that card name.",
    interactions: ["Mythic heroes", "Quest completion cards"],
    counterplay: ["Force early Ancient", "Deny setup"],
    animationHint: "Stone glyph ignition",
  },
];

const EXPANSIONS = [
  {
    id: "rise-of-the-rift",
    name: "Rise of the Rift",
    code: "ROTR",
    status: "foundational",
    story:
      "After the Fracture, Keepers gather in Riftwild Commons. The first formal Rift Duels teach that every conflict can be settled with Rift Energy rather than blades.",
    newRegion: "riftwild-commons",
    estimatedCardCount: 400,
    themes: ["keepers", "commons", "first bond", "rift energy", "full riftling roster"],
    releaseOrder: 1,
  },
  {
    id: "frozen-kingdom",
    name: "Frozen Kingdom",
    code: "FRZN",
    status: "planned",
    story: "Frostveil Basin seals thaw — ice courts demand tribute in duels.",
    newRegion: "frostveil-basin",
    estimatedCardCount: 100,
    themes: ["ice", "oaths", "silence"],
    releaseOrder: 2,
  },
  {
    id: "pirates-of-azure-bay",
    name: "Pirates of Azure Bay",
    code: "AZURE",
    status: "planned",
    story: "Moonwater Coast privateers wager packs on tide decks.",
    newRegion: "moonwater-coast",
    estimatedCardCount: 100,
    themes: ["water", "plunder", "traps"],
    releaseOrder: 3,
  },
  {
    id: "shadow-eclipse",
    name: "Shadow Eclipse",
    code: "ECLS",
    status: "planned",
    story: "Void Hollow swallows daylight; Corrupt strategies peak.",
    newRegion: "void-hollow",
    estimatedCardCount: 110,
    themes: ["shadow", "void", "corrupt"],
    releaseOrder: 4,
  },
  {
    id: "ancient-titans",
    name: "Ancient Titans",
    code: "TITN",
    status: "planned",
    story: "Stoneheart Canyon wakes colossi that play as Locations.",
    newRegion: "stoneheart-canyon",
    estimatedCardCount: 90,
    themes: ["earth", "ancient", "locations"],
    releaseOrder: 5,
  },
  {
    id: "festival-of-lanterns",
    name: "Festival of Lanterns",
    code: "LANN",
    status: "planned",
    story: "Commons festival season — holiday frames and Harmony decks.",
    newRegion: "riftwild-commons",
    estimatedCardCount: 80,
    themes: ["festival", "light", "holiday"],
    releaseOrder: 6,
  },
  {
    id: "crystal-wars",
    name: "Crystal Wars",
    code: "CRYS",
    status: "planned",
    story: "Radiant Citadel and Alloy Ruins contest Shatter protocols.",
    newRegion: "radiant-citadel",
    estimatedCardCount: 100,
    themes: ["crystal", "metal", "shatter"],
    releaseOrder: 7,
  },
  {
    id: "dragon-rebellion",
    name: "Dragon Rebellion",
    code: "DRGN",
    status: "planned",
    story: "Miniature Riftwyrms refuse cages; legendary Awaken lines.",
    newRegion: "ember-crater",
    estimatedCardCount: 100,
    themes: ["fire", "legendary", "awaken"],
    releaseOrder: 8,
  },
];

/** Hand-authored spell staples (kept for starter-deck ID stability). */
const SPELL_SEEDS = [
  ["Ember Spark", "fire", 1, "deal_damage", 2, "Tiny hearth-flare taught to every Commons keeper."],
  ["Tide Mend", "water", 2, "heal", 3, "Moonwater salve woven into a spell ribbon."],
  ["Root Snare", "nature", 2, "apply_keyword", 0, "Elderwood vines hold a foe for the Ward lesson."],
  ["Stone Brace", "earth", 1, "buff_hp", 2, "Stoneheart dust stiffens a companion's stance."],
  ["Storm Sip", "storm", 1, "draw", 1, "A peak breeze flips the next page of fate."],
  ["Crystal Ping", "crystal", 2, "shatter_armor", 1, "Citadel tuning-fork crack."],
  ["Shade Tax", "shadow", 2, "corrupt_drain", 1, "Void Hollow toll on bright hearts."],
  ["Lantern Lift", "light", 2, "heal", 2, "Plaza lanterns bless the wounded."],
  ["Spirit Echo", "spirit", 3, "echo_replay", 0, "Marsh memory repeats a soft spell."],
  ["Arc Latch", "arcane", 3, "draw", 2, "Gateway-fragment logic sorted mid-duel."],
  ["Rust Bite", "metal", 2, "deal_damage", 3, "Alloy scrap that still remembers teeth."],
  ["Star Dust", "celestial", 4, "gain_energy", 1, "Celestial Rift glitter for the curve."],
  ["Null Veil", "void", 3, "silence", 0, "Quiet that eats keywords."],
  ["Bloom Draft", "nature", 3, "buff_atk", 1, "Spring in the Commons square."],
  ["Forge Temper", "fire", 3, "empower_scale", 1, "Blacksmith's breath on steel and spirit."],
  ["Harbor Fog", "water", 2, "apply_keyword", 0, "Azure mist that grants Ward once."],
  ["Quake Tap", "earth", 4, "deal_damage", 2, "Canyon knuckle-rap to all enemies."],
  ["Rift Pulse", "arcane", 5, "deal_damage", 3, "Commons Heart answers a keeper's call."],
  ["Festival Cheer", "light", 1, "heal", 1, "Lantern week kindness — small but stacking."],
  ["Corrupt Whisper", "shadow", 1, "corrupt_drain", 1, "A polite threat from the Hollow."],
];

/** Hand-authored equipment staples (starter-deck ID stability). */
const EQUIP_SEEDS = [
  ["Keeper's Satchel", "neutral", 2, "Draw a card when the bearer survives damage."],
  ["Ember Collar", "fire", 2, "Bearer gains Charge while you control a Fire unit."],
  ["Tide Charm", "water", 1, "Bearer heals 1 at turn start."],
  ["Moss Cloak", "nature", 2, "Bearer has Bloom."],
  ["Storm Whistle", "storm", 3, "Once/turn: deal 1 to a random enemy."],
  ["Crystal Lens", "crystal", 2, "Bearer spells cost 1 less once/turn."],
  ["Shade Mantle", "shadow", 3, "Bearer has Corrupt on attack."],
  ["Lantern Badge", "light", 1, "Bearer has Ward when played."],
];

/** Named plaza locations kept for starter-deck ID stability. */
const LOCATION_SEEDS = [
  ["Riftwild Plaza", "neutral", "riftwild-commons", "Allied Commonspark cards cost 1 less."],
  ["Ember Hearthline", "fire", "ember-crater", "Fire units enter with +1 HP."],
  ["Moonwater Pier", "water", "moonwater-coast", "The first heal each turn Overflows."],
  ["Elderwood Path", "nature", "elderwood-forest", "Bloom ticks happen twice here."],
  ["Stormspire Landing", "storm", "stormspire-peaks", "Charge units deal +1 on arrival."],
  ["Stoneheart Gate", "earth", "stoneheart-canyon", "Guardians gain +0/+2."],
  ["Citadel Choir", "light", "radiant-citadel", "Ward refreshes at dawn once."],
  ["Void Threshold", "void", "void-hollow", "Corrupt Residue cap becomes 4."],
];

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableCost(seed, min, max) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const span = max - min + 1;
  return min + (Math.abs(h) % span);
}

function withArtAssets(art, resolved) {
  if (resolved?.assetPath) art.assetPath = resolved.assetPath;
  if (resolved?.libraryAssetId) art.libraryAssetId = resolved.libraryAssetId;
  return art;
}

const CRAFT = {
  common: 40,
  uncommon: 100,
  rare: 200,
  epic: 400,
  legendary: 800,
  mythic: 1200,
};

function artPrompt(name, element, type, region) {
  return {
    promptId: `art-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    prompt: `Create an original fantasy trading card illustration for Riftwilds named ${name}. It is a ${type} of the ${element} element tied to ${region || "the Riftwilds"}. Painterly fantasy, beautiful lighting, soft magical atmosphere, readable silhouette, high detail, original character, no text, no logos. Three-quarter elevated perspective, consistent lighting from the upper left, cyan and amber rift accents used sparingly.`,
    negativePrompt: NEG,
    camera: "three-quarter elevated",
    lighting: "upper-left soft key, cyan rim sparingly",
    palette: ["#2f5a3a", "#3de7ff", "#ffb84d", "#0a1830", "#e8d5b0"],
    mood: "adventurous wonder",
    pose: type === "creature" || type === "companion" ? "alert companion stance" : "iconic still-life of power",
    background: region ? `${region} atmosphere, soft bokeh` : "rift-lit fantasy haze",
  };
}

function abilityFromOp(op, value, element) {
  const map = {
    deal_damage: {
      name: "Strike",
      text: `Deal ${value} damage.`,
      effects: [{ op, value, target: value >= 2 && op ? "enemy" : "enemy", aiHint: "prefer damaged enemies" }],
    },
    heal: {
      name: "Mend",
      text: `Heal ${value}.`,
      effects: [{ op, value, target: "self", aiHint: "heal lowest ally" }],
    },
    draw: {
      name: "Insight",
      text: `Draw ${value}.`,
      effects: [{ op, value, target: "self", aiHint: "value when behind on cards" }],
    },
    gain_energy: {
      name: "Rift Surge",
      text: `Gain ${value} Rift Energy.`,
      effects: [{ op, value, target: "self", aiHint: "ramp before big turn" }],
    },
    buff_atk: {
      name: "Kindle",
      text: `Give an ally +${value} Attack.`,
      effects: [{ op, value, target: "self", aiHint: "buff attacker" }],
    },
    buff_hp: {
      name: "Brace",
      text: `Give an ally +${value} Health.`,
      effects: [{ op, value, target: "self", aiHint: "buff guardian" }],
    },
    shatter_armor: {
      name: "Shatter",
      text: "Shatter a target (remove Ward, then damage).",
      effects: [{ op: "shatter_armor", value: 1, target: "enemy", keyword: "shatter" }],
    },
    corrupt_drain: {
      name: "Corrupt",
      text: "Corrupt a target.",
      effects: [{ op: "corrupt_drain", value: 1, target: "enemy", keyword: "corrupt" }],
    },
    echo_replay: {
      name: "Echo",
      text: "Gain Echo this turn.",
      effects: [{ op: "echo_replay", keyword: "echo", aiHint: "cast cheap spell first" }],
    },
    silence: {
      name: "Null",
      text: "Silence a unit.",
      effects: [{ op: "silence", target: "enemy" }],
    },
    apply_keyword: {
      name: "Blessing",
      text: element === "water" ? "Grant Ward." : "Grant Guardian.",
      effects: [
        {
          op: "apply_keyword",
          keyword: element === "water" ? "ward" : "guardian",
          target: "self",
        },
      ],
    },
    empower_scale: {
      name: "Empower",
      text: "Empower — scale with energy spent.",
      effects: [{ op: "empower_scale", value: 1, keyword: "empower" }],
    },
  };
  return map[op] || map.deal_damage;
}

let collector = 1;

function makeCard(partial) {
  const rarity = partial.rarity || "common";
  const id = partial.id;
  const name = partial.localization?.name || partial.name;
  const element = partial.element;
  const type = partial.type;
  let art = partial.art || artPrompt(name, element, type, partial.regionId);
  if (partial.assetPath || partial.libraryAssetId) {
    art = withArtAssets({ ...art }, { assetPath: partial.assetPath, libraryAssetId: partial.libraryAssetId });
  }
  const card = {
    id,
    setId: "rise-of-the-rift",
    collectorNumber: collector++,
    type,
    element,
    rarity,
    energyCost: partial.energyCost,
    attack: partial.attack ?? null,
    health: partial.health ?? null,
    keywords: partial.keywords || [],
    abilities: partial.abilities || [],
    passive: partial.passive ?? null,
    localization: {
      name,
      typeLine: `${rarity} ${type} — ${element}`,
      rulesText: partial.rulesText || partial.abilities?.map((a) => a.text).join(" ") || "",
      flavorText: partial.flavorText || "",
      loreBlurb: partial.loreBlurb || "",
    },
    art,
    animation: partial.animation || {
      idle: `anim/${id}/idle`,
      play: `anim/${id}/play`,
      attack: type === "creature" || type === "companion" ? `anim/${id}/attack` : undefined,
      death: `anim/${id}/death`,
    },
    sound: partial.sound || {
      play: `sfx/tcg/play_${element}`,
      hit: `sfx/tcg/hit_${element}`,
      death: `sfx/tcg/death_soft`,
    },
    particles: partial.particles || [`vfx/${element}_motes`],
    voiceDirection: partial.voiceDirection || "Soft keeper narration, hopeful",
    upgradePath: partial.upgradePath || [],
    craftCost: CRAFT[rarity] ?? 40,
    sellValue: Math.floor((CRAFT[rarity] ?? 40) / 4),
    collectionTags: partial.collectionTags || [element, type, "rotr"],
    expansionId: "rise-of-the-rift",
    relatedNpcs: partial.relatedNpcs || [],
    relatedQuests: partial.relatedQuests || [],
    relatedRiftlings: partial.relatedRiftlings || [],
    riftlingSlug: partial.riftlingSlug,
    regionId: partial.regionId,
    isToken: partial.isToken || false,
    balanceNotes: partial.balanceNotes,
  };
  return card;
}

function elementKeywords(element, cost, slug) {
  const kws = [];
  if (element === "fire" && cost <= 3) kws.push("charge");
  if (element === "earth" || element === "metal") kws.push("guardian");
  if (element === "nature") kws.push("bloom");
  if (element === "water") kws.push("ward");
  if (element === "shadow" || element === "void") kws.push("corrupt");
  if (element === "crystal") kws.push("shatter");
  if (element === "storm" && cost <= 2) kws.push("charge");
  if (element === "spirit") kws.push("echo");
  if (element === "light") kws.push("ward");
  if (slug === "commonspark" || slug === "riftpup") kws.push("riftbond");
  return [...new Set(kws)];
}

function locationAuraText(region) {
  const map = {
    "riftwild-commons": "Neutral and Commonspark cards cost 1 less.",
    "ember-crater": "Fire units enter with +1 HP.",
    "moonwater-coast": "The first heal each turn Overflows.",
    "elderwood-forest": "Bloom ticks happen twice here.",
    "stormspire-peaks": "Charge units deal +1 on arrival.",
    "stoneheart-canyon": "Guardians gain +0/+2.",
    "frostveil-basin": "Enemy Charge units enter exhausted.",
    "radiant-citadel": "Ward refreshes at dawn once.",
    "void-hollow": "Corrupt Residue cap becomes 4.",
    "alloy-ruins": "Equipment costs 1 less.",
    "spirit-marsh": "Echo surcharge is waived once per turn.",
    "celestial-rift": "Once/game: Celestial counts as any element for Harmony.",
    "spirit-realm": "Spirit units have +0/+1 while this is in play.",
  };
  return map[region.regionId] || `Units matching ${region.regionName} gain +0/+1.`;
}

function potionSpellOp(item) {
  const text = `${item.effect || item.description}`.toLowerCase();
  if (/heal|salve|mend|restore/.test(text)) return { op: "heal", value: 2 };
  if (/draw|insight|scroll/.test(text)) return { op: "draw", value: 1 };
  if (/energy|rift/.test(text)) return { op: "gain_energy", value: 1 };
  if (/silence|null|purge/.test(text)) return { op: "silence", value: 0 };
  if (/corrupt|drain|void/.test(text)) return { op: "corrupt_drain", value: 1 };
  if (/shatter|ward break/.test(text)) return { op: "shatter_armor", value: 1 };
  if (/buff|strength|attack/.test(text)) return { op: "buff_atk", value: 1 };
  if (/shield|armor|brace|defense/.test(text)) return { op: "buff_hp", value: 2 };
  return { op: "deal_damage", value: 2 };
}

function buildCards() {
  const cards = [];
  const species = loadSpeciesFromLore();
  const regions = loadRegions();
  const catalogs = loadAllCatalogItems();
  const library = loadGameLibrary();
  const usedIds = new Set();

  const push = (card) => {
    if (usedIds.has(card.id)) return null;
    usedIds.add(card.id);
    cards.push(card);
    return card;
  };

  // —— Every lore Riftling → creature (+ companion / evolution stubs) ——
  for (const sp of species) {
    const cost = Math.min(6, stableCost(sp.slug, 1, 5));
    const atk = Math.max(1, cost - 1 + (sp.element === "fire" ? 1 : 0));
    const hp = Math.max(1, cost + (sp.element === "earth" || sp.element === "nature" ? 1 : 0));
    const petArt = resolvePetAssetPath(sp.slug, library);
    const talent = sp.talents[0] || "Keeper's Choice";
    const rarity =
      sp.slug === "celestora" || sp.slug === "luminara" || sp.slug === "starveil"
        ? "epic"
        : cost >= 5
          ? "rare"
          : cost >= 3
            ? "uncommon"
            : "common";

    const creatureId = `rotr-c-${sp.slug}`;
    const companionId = `rotr-comp-${sp.slug}`;
    const evoId = `rotr-evo-${sp.slug}`;

    push(
      makeCard({
        id: creatureId,
        name: sp.name,
        type: "creature",
        element: sp.element,
        rarity,
        energyCost: cost,
        attack: atk,
        health: hp,
        keywords: elementKeywords(sp.element, cost, sp.slug),
        abilities: [
          {
            id: `${sp.slug}-bond`,
            name: talent,
            timing: "battlecry",
            text: "Riftbond — sync with your companion if elements match.",
            effects: [{ op: "riftbond_link", keyword: "riftbond", aiHint: "play when companion matches" }],
          },
        ],
        // Full shortBio for inspect/journal; card-face art truncates visually at render time.
        flavorText: sp.shortBio
          ? sp.shortBio
          : `${sp.name} chose a keeper once — the duel remembers that choice.`,
        loreBlurb: sp.title
          ? `${sp.name}, “${sp.title}”, native to ${sp.nativeRegion || sp.regionId}.`
          : `Card form of the living Riftling ${sp.name}.`,
        riftlingSlug: sp.slug,
        relatedRiftlings: [sp.slug],
        regionId: sp.regionId,
        collectionTags: [sp.element, "riftling", "creature", "rotr", sp.regionId],
        relatedQuests: sp.regionId === "riftwild-commons" ? ["starter-q4-new-bond"] : [],
        relatedNpcs: sp.regionId === "riftwild-commons" ? ["mira"] : [],
        upgradePath: sp.hasEvolutionStub ? [companionId, evoId] : [companionId],
        assetPath: petArt.assetPath || undefined,
        libraryAssetId: petArt.libraryAssetId || undefined,
        balanceNotes: "Statline ~ cost curve; keywords by element identity.",
      }),
    );

    // Companion hatchling stub for every species
    push(
      makeCard({
        id: companionId,
        name: `${sp.name} Companion`,
        type: "companion",
        element: sp.element,
        rarity: "common",
        energyCost: 1,
        attack: 1,
        health: sp.element === "nature" || sp.element === "earth" ? 2 : 1,
        keywords: ["riftbond"],
        abilities: [
          {
            id: `${sp.slug}-comp`,
            name: "Pocket Bond",
            timing: "passive",
            text: "Riftbond friendly. Counts as your active companion for matching-element bonuses.",
            effects: [{ op: "riftbond_link", keyword: "riftbond" }],
          },
        ],
        flavorText: `A pocket-sized ${sp.name} that rides in a keeper satchel between duels.`,
        loreBlurb: `Companion stub for ${sp.name}.`,
        riftlingSlug: sp.slug,
        relatedRiftlings: [sp.slug],
        regionId: sp.regionId,
        collectionTags: [sp.element, "riftling", "companion", "rotr"],
        assetPath: petArt.assetPath || undefined,
        libraryAssetId: petArt.libraryAssetId || undefined,
      }),
    );

    if (sp.hasEvolutionStub) {
      push(
        makeCard({
          id: evoId,
          name: `${sp.name} Ascendant`,
          type: "legendary",
          element: sp.element,
          rarity: "legendary",
          energyCost: Math.min(7, cost + 2),
          attack: atk + 2,
          health: hp + 2,
          keywords: ["awaken", "ancient", ...elementKeywords(sp.element, cost + 2, sp.slug)].slice(0, 4),
          abilities: [
            {
              id: `${sp.slug}-evo`,
              name: "Lived Evolution",
              timing: "battlecry",
              text: "Awaken — enter as the evolved form of your bonded Riftling.",
              effects: [{ op: "awaken_transform", keyword: "awaken" }],
            },
          ],
          flavorText: sp.evolvedStageBehavior ||
            "Instincts sharpen; childhood habits remain as signature quirks rather than vanishing.",
          loreBlurb: `Evolution stub for ${sp.name}.`,
          riftlingSlug: sp.slug,
          relatedRiftlings: [sp.slug],
          regionId: sp.regionId,
          collectionTags: [sp.element, "riftling", "evolution", "legendary", "rotr"],
          upgradePath: [creatureId],
          assetPath: petArt.assetPath || undefined,
          libraryAssetId: petArt.libraryAssetId || undefined,
        }),
      );
    }
  }

  // —— Hand-authored spell staples ——
  for (const [name, element, cost, op, value, flavor] of SPELL_SEEDS) {
    const ab = abilityFromOp(op, value, element);
    push(
      makeCard({
        id: `rotr-s-${slugify(name)}`,
        name,
        type: "spell",
        element,
        rarity: cost >= 5 ? "rare" : cost >= 3 ? "uncommon" : "common",
        energyCost: cost,
        attack: null,
        health: null,
        keywords: op === "echo_replay" ? ["echo"] : op === "corrupt_drain" ? ["corrupt"] : op === "shatter_armor" ? ["shatter"] : [],
        abilities: [
          {
            id: `spell-${slugify(name)}`,
            name: ab.name,
            timing: "activated",
            text: ab.text,
            effects: ab.effects,
          },
        ],
        flavorText: flavor,
        rulesText: ab.text,
        collectionTags: [element, "spell", "rotr"],
      }),
    );
  }

  // —— Potions + ability scrolls → spells ——
  for (const item of [...catalogs.potions, ...catalogs.abilities]) {
    const { op, value } = potionSpellOp(item);
    const ab = abilityFromOp(op, value, item.element);
    const art = resolveItemAssetPath(item, library);
    push(
      makeCard({
        id: `rotr-s-item-${item.id}`,
        name: item.name,
        type: "spell",
        element: item.element,
        rarity: itemRarityToTcg(item.rarity),
        energyCost: stableCost(item.id, 1, 4),
        abilities: [
          {
            id: `spell-item-${item.id}`,
            name: ab.name,
            timing: "activated",
            text: item.effect || ab.text,
            effects: ab.effects,
          },
        ],
        flavorText: item.description || `${item.name} adapted for Rift Duels.`,
        rulesText: item.effect || ab.text,
        collectionTags: [item.element, "spell", "catalog-item", "rotr"],
        assetPath: art.assetPath || undefined,
        libraryAssetId: art.libraryAssetId || undefined,
      }),
    );
  }

  // —— Hand-authored equipment staples ——
  for (const [name, element, cost, text] of EQUIP_SEEDS) {
    push(
      makeCard({
        id: `rotr-e-${slugify(name)}`,
        name,
        type: "equipment",
        element,
        rarity: cost >= 3 ? "uncommon" : "common",
        energyCost: cost,
        abilities: [
          {
            id: `eq-${slugify(name)}`,
            name: "Equip",
            timing: "passive",
            text,
            effects: [{ op: "custom", notes: text, aiHint: "equip on sticky unit" }],
          },
        ],
        flavorText: `Forged or woven for Keepers who duel as they live.`,
        rulesText: text,
        relatedNpcs: name.includes("Keeper") ? ["mira"] : name.includes("Forge") ? ["forge-npc"] : [],
      }),
    );
  }

  // —— Weapons + armor → equipment ——
  for (const item of [...catalogs.weapons, ...catalogs.armor]) {
    const art = resolveItemAssetPath(item, library);
    const text =
      item.family === "ARMOR"
        ? `Equip: bearer gains Guardian or +0/+2 (armor). ${item.description}`
        : `Equip: bearer gains +1 Attack. ${item.description}`;
    push(
      makeCard({
        id: `rotr-e-item-${item.id}`,
        name: item.name,
        type: "equipment",
        element: item.element,
        rarity: itemRarityToTcg(item.rarity),
        energyCost: stableCost(item.id, 1, 4),
        keywords: item.family === "ARMOR" ? ["guardian"] : item.element === "fire" ? ["empower"] : [],
        abilities: [
          {
            id: `eq-item-${item.id}`,
            name: "Equip",
            timing: "passive",
            text: text.slice(0, 220),
            effects: [
              {
                op: item.family === "ARMOR" ? "buff_hp" : "buff_atk",
                value: 1,
                target: "self",
                notes: item.description,
              },
            ],
          },
        ],
        flavorText: item.description || `${item.name} from the Living World shops.`,
        rulesText: text.slice(0, 220),
        collectionTags: [item.element, "equipment", "catalog-item", "rotr"],
        assetPath: art.assetPath || undefined,
        libraryAssetId: art.libraryAssetId || undefined,
      }),
    );
  }

  // —— Materials → relics (capped for set size) ——
  for (const item of catalogs.materials.slice(0, 40)) {
    const art = resolveItemAssetPath(item, library);
    const text = `Relic: while held, ${item.description || "gain a minor affinity bonus."}`;
    push(
      makeCard({
        id: `rotr-r-mat-${item.id}`,
        name: item.name,
        type: "relic",
        element: item.element,
        rarity: itemRarityToTcg(item.rarity),
        energyCost: stableCost(item.id, 2, 4),
        abilities: [
          {
            id: `relic-${item.id}`,
            name: "Cache",
            timing: "passive",
            text: text.slice(0, 220),
            effects: [{ op: "custom", notes: text }],
          },
        ],
        flavorText: item.description || `A crafting reagent remembered as a duel relic.`,
        rulesText: text.slice(0, 220),
        collectionTags: [item.element, "relic", "material", "rotr"],
        assetPath: art.assetPath || undefined,
        libraryAssetId: art.libraryAssetId || undefined,
      }),
    );
  }

  // —— Hand-authored location staples ——
  for (const [name, element, region, text] of LOCATION_SEEDS) {
    push(
      makeCard({
        id: `rotr-l-${slugify(name)}`,
        name,
        type: "location",
        element,
        rarity: "rare",
        energyCost: 3,
        abilities: [
          {
            id: `loc-${slugify(name)}`,
            name: "Place Memory",
            timing: "aura",
            text,
            effects: [{ op: "custom", notes: text, aiHint: "play when archetype matches" }],
          },
        ],
        flavorText: `A board that remembers ${region}.`,
        rulesText: text,
        regionId: region,
        collectionTags: [element, "location", region, "rotr"],
      }),
    );
  }

  // —— Every region pack → location card ——
  for (const region of regions) {
    const text = locationAuraText(region);
    const building = (library.byCategory["buildings-walls"] || [])[stableCost(region.regionId, 0, 19)];
    const art = building ? resolveLibraryAsset(building) : { assetPath: null, libraryAssetId: null };
    push(
      makeCard({
        id: `rotr-l-region-${region.regionId}`,
        name: region.regionName,
        type: "location",
        element: region.element,
        rarity: "rare",
        energyCost: 3,
        abilities: [
          {
            id: `loc-region-${region.regionId}`,
            name: "Region Memory",
            timing: "aura",
            text,
            effects: [{ op: "custom", notes: text }],
          },
        ],
        flavorText: region.blurb || `Duel board drawn from ${region.regionName}.`,
        rulesText: text,
        regionId: region.regionId,
        collectionTags: [region.element, "location", "region", region.regionId, "rotr"],
        assetPath: art.assetPath || undefined,
        libraryAssetId: art.libraryAssetId || undefined,
      }),
    );
  }

  // —— Buildings / gates / stalls → location or relic flavor ——
  const propCats = [
    ["stalls", "location"],
    ["gates", "location"],
    ["bridges", "location"],
    ["docks", "location"],
    ["props-lanterns", "relic"],
    ["props-signs", "relic"],
    ["props-tools", "equipment"],
  ];
  for (const [cat, type] of propCats) {
    const entries = library.byCategory[cat] || [];
    for (const entry of entries.slice(0, 8)) {
      const art = resolveLibraryAsset(entry);
      const name = (entry.label || entry.id)
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/-/g, " ");
      const element =
        /ember|ash|forge/i.test(entry.id + entry.biome)
          ? "fire"
          : /tide|dock|water/i.test(entry.id + (entry.biome || ""))
            ? "water"
            : /grove|elder|moss/i.test(entry.id + (entry.biome || ""))
              ? "nature"
              : entry.biome === "void"
                ? "void"
                : "neutral";
      const text =
        type === "location"
          ? `Place: ${name} — allied units gain a minor board bonus.`
          : type === "equipment"
            ? `Equip: bearer recalls ${name}.`
            : `Relic: ${name} watches the duel.`;
      push(
        makeCard({
          id: `rotr-prop-${entry.id}`,
          name,
          type,
          element,
          rarity: "uncommon",
          energyCost: type === "location" ? 3 : 2,
          abilities: [
            {
              id: `prop-${entry.id}`,
              name: name,
              timing: type === "location" ? "aura" : "passive",
              text,
              effects: [{ op: "custom", notes: text }],
            },
          ],
          flavorText: `Living World ${cat.replace(/-/g, " ")} remembered as a card.`,
          rulesText: text,
          regionId: entry.biome ? regionNameFromBiome(entry.biome) : undefined,
          collectionTags: [element, type, "library-prop", "rotr"],
          assetPath: art.assetPath || undefined,
          libraryAssetId: art.libraryAssetId || undefined,
        }),
      );
    }
  }

  // —— Library NPCs / keepers → hero cards ——
  const npcPool = [...(library.byCategory.keepers || []), ...(library.byCategory.npcs || [])];
  for (const npc of npcPool) {
    const art = resolveLibraryAsset(npc);
    const name = (npc.label || npc.id).replace(/\b\w/g, (c) => c.toUpperCase()).replace(/Npc |keeper /gi, "").trim();
    const element =
      /forge|ember|smith/i.test(npc.id + name)
        ? "fire"
        : /fisher|tide|brine/i.test(npc.id + name)
          ? "water"
          : /garden|grove/i.test(npc.id + name)
            ? "nature"
            : /guard|stone/i.test(npc.id + name)
              ? "earth"
              : /merchant|courier/i.test(npc.id + name)
                ? "neutral"
                : "arcane";
    push(
      makeCard({
        id: `rotr-h-npc-${npc.id}`,
        name,
        type: "hero",
        element,
        rarity: "legendary",
        energyCost: 0,
        attack: null,
        health: 30,
        keywords: ["ancient"],
        abilities: [
          {
            id: `${npc.id}-passive`,
            name: "Living World Presence",
            timing: "passive",
            text: "Your first Companion each game costs 1 less.",
            effects: [{ op: "custom", notes: "companion discount" }],
          },
          {
            id: `${npc.id}-ult`,
            name: "Keeper Call",
            timing: "ultimate",
            text: "Ancient: reshape the board once per game.",
            energyCost: 8,
            effects: [{ op: "ancient_once", keyword: "ancient", value: 3 }],
          },
        ],
        flavorText: `${name} still walks the Living World between duels.`,
        relatedNpcs: [npc.id],
        collectionTags: [element, "hero", "npc", "legendary", "rotr"],
        assetPath: art.assetPath || undefined,
        libraryAssetId: art.libraryAssetId || undefined,
      }),
    );
  }

  // —— Named hero staples (starter / biography continuity) ——
  const heroCardSeeds = [
    ["Elara Venn", "nature", "The First Road", "riftwild-commons"],
    ["Mira of Care", "light", "Satchel of Soft Victories", "riftwild-commons"],
    ["Captain Brine", "water", "Tide Warrant", "moonwater-coast"],
    ["Forge-Warden Kael", "fire", "Temper the Heart", "ember-crater"],
    ["Archivist Solen", "arcane", "Catalog of Fractures", "radiant-citadel"],
  ];
  for (const [name, element, ult, region] of heroCardSeeds) {
    push(
      makeCard({
        id: `rotr-h-${slugify(name)}`,
        name,
        type: "hero",
        element,
        rarity: "legendary",
        energyCost: 0,
        attack: null,
        health: 30,
        keywords: ["ancient"],
        abilities: [
          {
            id: `${slugify(name)}-passive`,
            name: "Keeper Presence",
            timing: "passive",
            text: "Your first Companion each game costs 1 less.",
            effects: [{ op: "custom", notes: "companion discount", aiHint: "curve companion early" }],
          },
          {
            id: `${slugify(name)}-ult`,
            name: ult,
            timing: "ultimate",
            text: `Ultimate — ${ult}: reshape the board once per game.`,
            energyCost: 8,
            effects: [{ op: "ancient_once", keyword: "ancient", value: 3, aiHint: "save for lethal or stabilize" }],
          },
        ],
        flavorText: `${name} still walks the Living World between duels.`,
        regionId: region,
        relatedNpcs: [name.toLowerCase().includes("mira") ? "mira" : "elara"],
        collectionTags: [element, "hero", "legendary", "rotr"],
      }),
    );
  }

  // Tokens
  push(
    makeCard({
      id: "rotr-t-spark-fragment",
      name: "Spark Fragment",
      type: "token",
      element: "neutral",
      rarity: "common",
      energyCost: 0,
      attack: 1,
      health: 1,
      keywords: ["charge"],
      abilities: [],
      flavorText: "A mote that wanted to be a Riftling.",
      isToken: true,
      collectionTags: ["token", "neutral"],
    }),
  );

  // Weather / events / traps / relics staples
  const fillers = [
    ["Ashfall Sky", "weather", "fire", 2, "All Fire units have Overflow this turn."],
    ["Harbor Squall", "weather", "water", 2, "Enemy Charge is blanked this turn."],
    ["Canopy Drip", "weather", "nature", 1, "Bloom units heal 1."],
    ["Dust Devil", "weather", "earth", 2, "Guardians cannot be charged over."],
    ["Static Veil", "weather", "storm", 2, "The first spell this turn costs 1 less."],
    ["Prism Noon", "weather", "crystal", 2, "Shatter deals +1."],
    ["False Dusk", "weather", "shadow", 2, "Corrupt may target heroes."],
    ["Choir Dawn", "weather", "light", 2, "Ward refreshes on one ally."],
    ["Lantern Night", "event", "light", 3, "Heal all allies 1; draw 1."],
    ["Market Panic", "event", "neutral", 2, "Both players draw 1."],
    ["Pack Opening", "event", "arcane", 1, "Discover a common from ROTR."],
    ["Guild Horn", "event", "neutral", 3, "Give all allies +1 Attack this turn."],
    ["Hidden Snare", "trap", "nature", 2, "When an enemy attacks, deal 2 and Ward yourself."],
    ["Void Latch", "trap", "void", 3, "When opponent gains energy, Corrupt them."],
    ["Tripwire Coil", "trap", "metal", 2, "When a Charge unit enters, deal 2 to it."],
    ["Tideglass", "trap", "water", 2, "When you are dealt 3+ damage, heal 3."],
    ["Heart Relic", "relic", "arcane", 4, "At dawn: gain 1 energy if you control a Location."],
    ["Forge Relic", "relic", "metal", 3, "Equipment costs 1 less."],
    ["Moss Relic", "relic", "nature", 3, "Bloom ticks also grant +0/+1 once."],
    ["Storm Relic", "relic", "storm", 4, "Your first Charge each turn draws 1."],
    ["Quest: First Bond", "quest", "neutral", 1, "Play 3 Companions — reward: draw 2."],
    ["Quest: Plaza Sweep", "quest", "neutral", 1, "Win a duel in Commons — craft discount."],
    ["Quest: Ember Trial", "quest", "fire", 1, "Deal 10 damage in one game — gain Ember Collar."],
    ["Quest: Quiet Study", "quest", "arcane", 1, "Cast 5 spells — Echo once free."],
    ["Artifact: Gate Key", "artifact", "celestial", 5, "Ancient: awaken a Riftbond unit."],
    ["Artifact: Moss Codex", "artifact", "nature", 4, "Your Bloom ticks grant Ward once."],
    ["Artifact: Tide Sextant", "artifact", "water", 4, "Overflow heals hit your hero too."],
    ["Artifact: Void Ledger", "artifact", "void", 5, "Residue cap +1 while held."],
    ["Companion: Pocket Spark", "companion", "neutral", 1, "1/1 Charge token-friend; Riftbond friendly."],
    ["Companion: Moss Buddy", "companion", "nature", 2, "1/3 Bloom; cannot attack heroes."],
    ["Legendary: Heart Witness", "legendary", "arcane", 6, "Ancient: copy a spell in your grave."],
    ["Legendary: Crater Tyrant", "legendary", "fire", 7, "Charge. Empower. Battlecry: deal 2."],
  ];
  for (const [name, type, element, cost, text] of fillers) {
    const isCreatureish = type === "companion" || type === "legendary";
    push(
      makeCard({
        id: `rotr-x-${slugify(name)}`,
        name,
        type,
        element,
        rarity:
          type === "legendary"
            ? "legendary"
            : type === "artifact" || type === "relic"
              ? "epic"
              : type === "companion"
                ? "common"
                : "uncommon",
        energyCost: cost,
        attack: isCreatureish ? (type === "legendary" ? 5 : 1) : null,
        health: isCreatureish ? (type === "legendary" ? 5 : type === "companion" && element === "nature" ? 3 : 1) : null,
        keywords:
          type === "legendary" && element === "fire"
            ? ["charge", "empower", "ancient"]
            : type === "companion"
              ? ["riftbond"]
              : [],
        abilities: [
          {
            id: `fill-${slugify(name)}`,
            name,
            timing: type === "trap" ? "trigger" : isCreatureish ? "battlecry" : "activated",
            text,
            effects: [{ op: "custom", notes: text }],
          },
        ],
        flavorText: text,
        rulesText: text,
      }),
    );
  }

  // Weather from library effects
  for (const entry of (library.byCategory["effects-weather"] || []).slice(0, 12)) {
    const art = resolveLibraryAsset(entry);
    const name = (entry.label || entry.id).replace(/\b\w/g, (c) => c.toUpperCase()).replace(/-/g, " ");
    push(
      makeCard({
        id: `rotr-w-${entry.id}`,
        name,
        type: "weather",
        element: "neutral",
        rarity: "uncommon",
        energyCost: 2,
        abilities: [
          {
            id: `weather-${entry.id}`,
            name,
            timing: "activated",
            text: `Weather: alter the board with ${name}.`,
            effects: [{ op: "custom", notes: name }],
          },
        ],
        flavorText: `Sky memory from the Living World.`,
        rulesText: `Weather: alter the board with ${name}.`,
        assetPath: art.assetPath || undefined,
        libraryAssetId: art.libraryAssetId || undefined,
        collectionTags: ["weather", "library", "rotr"],
      }),
    );
  }

  // Generic commons for curve density
  const commonsFill = [
    ["Plaza Scout", "neutral", 1, 1, 1, "charge"],
    ["Market Runner", "neutral", 2, 2, 2, ""],
    ["Lantern Acolyte", "light", 2, 1, 3, "ward"],
    ["Ash Urchin", "fire", 1, 2, 1, ""],
    ["Puddle Imp", "water", 1, 1, 2, ""],
    ["Twig Sprite", "nature", 1, 1, 1, "bloom"],
    ["Pebble Guard", "earth", 2, 1, 4, "guardian"],
    ["Static Mite", "storm", 1, 1, 1, "charge"],
    ["Shard Bit", "crystal", 2, 2, 2, ""],
    ["Dusk Mote", "shadow", 1, 1, 1, "corrupt"],
    ["Gear Tick", "metal", 2, 2, 3, ""],
    ["Star Midge", "celestial", 2, 1, 2, ""],
    ["Null Gnat", "void", 1, 1, 1, ""],
    ["Spirit Moth", "spirit", 2, 1, 3, ""],
    ["Poison Spore", "poison", 2, 2, 1, ""],
    ["Arc Scribe", "arcane", 3, 2, 3, ""],
  ];
  for (const [name, element, cost, atk, hp, kw] of commonsFill) {
    push(
      makeCard({
        id: `rotr-c-${slugify(name)}`,
        name,
        type: "creature",
        element,
        rarity: "common",
        energyCost: cost,
        attack: atk,
        health: hp,
        keywords: kw ? [kw] : [],
        abilities: [],
        flavorText: `A small presence of the ${element} Rift, common in keeper drills.`,
        rulesText: kw ? kw.charAt(0).toUpperCase() + kw.slice(1) : "",
        collectionTags: [element, "creature", "common", "rotr"],
      }),
    );
  }

  return cards;
}

function regionNameFromBiome(biome) {
  const map = {
    commons: "riftwild-commons",
    ember: "ember-crater",
    moonwater: "moonwater-coast",
    elderwood: "elderwood-forest",
    stormspire: "stormspire-peaks",
    stoneheart: "stoneheart-canyon",
    frostveil: "frostveil-basin",
    citadel: "radiant-citadel",
    void: "void-hollow",
    alloy: "alloy-ruins",
    marsh: "spirit-marsh",
    celestial: "celestial-rift",
  };
  return map[biome] || "riftwild-commons";
}

function buildHeroes() {
  const heroes = [
    {
      id: "hero-elara-venn",
      name: "Elara Venn",
      title: "Road-Warden of the First Bond",
      element: "nature",
      biography: "Walked deserts that had never met forests, carrying an egg that would teach the Commons its name.",
      personality: ["steadfast", "curious", "protective"],
      voice: "Warm alto, travel-worn, never cruel",
      passive: {
        id: "elara-p",
        name: "Honest Invitation",
        timing: "passive",
        text: "Companions you play gain +0/+1.",
        effects: [{ op: "buff_hp", value: 1, target: "self" }],
      },
      ultimate: {
        id: "elara-u",
        name: "The First Road",
        timing: "ultimate",
        text: "Ancient: put a Riftling from your deck into play exhausted.",
        energyCost: 8,
        effects: [{ op: "ancient_once", value: 1 }],
      },
      deckPreference: ["nature", "riftbond", "companions"],
      startingCardIds: ["rotr-c-mossprig", "rotr-c-commonspark", "rotr-s-bloom-draft"],
      difficulty: "easy",
      visualIdentity: "Travel cloak, satchel, egg-warm amber accents",
      portraitPromptId: "art-elara-venn",
      relatedRegion: "riftwild-commons",
      relatedNpc: "elara",
    },
    {
      id: "hero-mira-care",
      name: "Mira",
      title: "Care-Warden of the Plaza",
      element: "light",
      biography: "Runs the softest shop in the hardest storms — teaches that survival is a deck you rebuild daily.",
      personality: ["kind", "practical", "sharp when needed"],
      voice: "Bright midrange, shop-bell cadence",
      passive: {
        id: "mira-p",
        name: "Satchel Ready",
        timing: "passive",
        text: "The first heal each turn also draws if you are behind on life.",
        effects: [{ op: "heal", value: 0, aiHint: "conditional draw" }],
      },
      ultimate: {
        id: "mira-u",
        name: "Soft Victory",
        timing: "ultimate",
        text: "Ancient: fully heal your hero and grant Ward to all allies.",
        energyCost: 9,
        effects: [{ op: "ancient_once" }, { op: "ward_grant", target: "all_allies" }],
      },
      deckPreference: ["light", "heal", "ward"],
      startingCardIds: ["rotr-s-lantern-lift", "rotr-s-tide-mend", "rotr-e-lantern-badge"],
      difficulty: "easy",
      visualIdentity: "Apron, care badges, cyan vials",
      portraitPromptId: "art-mira-care",
      relatedRegion: "riftwild-commons",
      relatedNpc: "mira",
    },
    {
      id: "hero-kael-forge",
      name: "Kael",
      title: "Forge-Warden",
      element: "fire",
      biography: "Believes every blade should be a promise; every duel a tempering.",
      personality: ["blunt", "loyal", "perfectionist"],
      voice: "Gravel baritone, hammer rhythm",
      passive: {
        id: "kael-p",
        name: "Temper Line",
        timing: "passive",
        text: "Equipment you play grants +1 Attack.",
        effects: [{ op: "buff_atk", value: 1 }],
      },
      ultimate: {
        id: "kael-u",
        name: "White Heat",
        timing: "ultimate",
        text: "Ancient: Empower your board — +2 Attack this turn.",
        energyCost: 8,
        effects: [{ op: "empower_scale", value: 2, keyword: "empower" }],
      },
      deckPreference: ["fire", "equipment", "empower"],
      startingCardIds: ["rotr-c-cindercub", "rotr-s-forge-temper", "rotr-e-ember-collar"],
      difficulty: "medium",
      visualIdentity: "Scorched apron, ember eyes, iron shoulders",
      portraitPromptId: "art-kael-forge",
      relatedRegion: "ember-crater",
    },
    {
      id: "hero-brine",
      name: "Captain Brine",
      title: "Tide Warrant",
      element: "water",
      biography: "Privateer who only steals unfair advantages — keeps the rest for the crew.",
      personality: ["wry", "brave", "greedy for stories"],
      voice: "Salt-rough tenor",
      passive: {
        id: "brine-p",
        name: "Fair Plunder",
        timing: "passive",
        text: "When you Overflow, draw a card once/turn.",
        effects: [{ op: "draw", value: 1, keyword: "overflow" }],
      },
      ultimate: {
        id: "brine-u",
        name: "Azure Claim",
        timing: "ultimate",
        text: "Ancient: fill your board edges with 1/1 Spark Fragments.",
        energyCost: 7,
        effects: [{ op: "summon_token", tokenId: "rotr-t-spark-fragment", value: 3 }],
      },
      deckPreference: ["water", "overflow", "tokens"],
      startingCardIds: ["rotr-c-bubbloon", "rotr-s-harbor-fog", "rotr-l-moonwater-pier"],
      difficulty: "medium",
      visualIdentity: "Coat with tide-cyan trim, crooked grin",
      portraitPromptId: "art-captain-brine",
      relatedRegion: "moonwater-coast",
    },
    {
      id: "hero-solen",
      name: "Archivist Solen",
      title: "Catalog of Fractures",
      element: "arcane",
      biography: "Maps every Rift event so no Keeper fights the same mistake twice.",
      personality: ["precise", "curious", "dry humor"],
      voice: "Quiet scholarly",
      passive: {
        id: "solen-p",
        name: "Index",
        timing: "passive",
        text: "Spells cost 1 less for each Location you control (max 2).",
        effects: [{ op: "custom", notes: "spell discount" }],
      },
      ultimate: {
        id: "solen-u",
        name: "Reprint Memory",
        timing: "ultimate",
        text: "Ancient: Echo your last spell without surcharge.",
        energyCost: 8,
        effects: [{ op: "echo_replay", keyword: "echo" }],
      },
      deckPreference: ["arcane", "echo", "locations"],
      startingCardIds: ["rotr-s-spirit-echo", "rotr-s-arc-latch", "rotr-l-riftwild-plaza"],
      difficulty: "hard",
      visualIdentity: "Spectacles, floating index cards, citadel gold",
      portraitPromptId: "art-archivist-solen",
      relatedRegion: "radiant-citadel",
    },
    {
      id: "hero-nyx-hollow",
      name: "Nyx",
      title: "Threshold Speaker",
      element: "void",
      biography: "Bargains with silence; teaches Corrupt as a language, not a crime.",
      personality: ["calm", "unnerving", "fair"],
      voice: "Near-whisper, exact words",
      passive: {
        id: "nyx-p",
        name: "Residue Well",
        timing: "passive",
        text: "Corrupt Residue starts at 1.",
        effects: [{ op: "corrupt_drain", value: 0 }],
      },
      ultimate: {
        id: "nyx-u",
        name: "Eclipse Ledger",
        timing: "ultimate",
        text: "Ancient: Silence the board, then deal 1 to all enemies.",
        energyCost: 9,
        effects: [{ op: "silence", target: "board" }, { op: "deal_damage", value: 1, target: "all_enemies" }],
      },
      deckPreference: ["void", "shadow", "corrupt"],
      startingCardIds: ["rotr-c-voidling", "rotr-s-shade-tax", "rotr-s-corrupt-whisper"],
      difficulty: "hard",
      visualIdentity: "Veil of ink, polite smile",
      portraitPromptId: "art-nyx-hollow",
      relatedRegion: "void-hollow",
    },
    {
      id: "hero-thorn",
      name: "Thorn Keeper",
      title: "Elderwood Warden",
      element: "nature",
      biography: "Talks to moss like neighbors; Bloom decks are just gardening with stakes.",
      personality: ["patient", "stern", "gentle"],
      voice: "Low forest hush",
      passive: {
        id: "thorn-p",
        name: "Canopy",
        timing: "passive",
        text: "Bloom units enter with Ward.",
        effects: [{ op: "ward_grant", keyword: "bloom" }],
      },
      ultimate: {
        id: "thorn-u",
        name: "Season Turn",
        timing: "ultimate",
        text: "Ancient: double Bloom stacks on your board.",
        energyCost: 8,
        effects: [{ op: "bloom_grow", value: 2 }],
      },
      deckPreference: ["nature", "bloom", "guardian"],
      startingCardIds: ["rotr-c-mossprig", "rotr-c-bramblefox", "rotr-l-elderwood-path"],
      difficulty: "medium",
      visualIdentity: "Antler-crown twigs, green cloak",
      portraitPromptId: "art-thorn-keeper",
      relatedRegion: "elderwood-forest",
    },
    {
      id: "hero-volta",
      name: "Volta",
      title: "Peak Ledger",
      element: "storm",
      biography: "Counts lightning strikes for fun; Charge is just honesty about impatience.",
      personality: ["manic", "brilliant", "loyal"],
      voice: "Fast, crackling",
      passive: {
        id: "volta-p",
        name: "Static Index",
        timing: "passive",
        text: "Charge units you play deal 1 on entry.",
        effects: [{ op: "deal_damage", value: 1, keyword: "charge" }],
      },
      ultimate: {
        id: "volta-u",
        name: "Sky Writ",
        timing: "ultimate",
        text: "Ancient: give Charge to your whole board.",
        energyCost: 7,
        effects: [{ op: "charge_ready", target: "all_allies" }],
      },
      deckPreference: ["storm", "charge", "empower"],
      startingCardIds: ["rotr-c-voltkit", "rotr-c-galekit", "rotr-s-storm-sip"],
      difficulty: "medium",
      visualIdentity: "Wind-torn scarf, spark gloves",
      portraitPromptId: "art-volta",
      relatedRegion: "stormspire-peaks",
    },
    {
      id: "hero-basalt",
      name: "Basalt",
      title: "Gate of Stoneheart",
      element: "earth",
      biography: "Moves like geology — slow until it isn't.",
      personality: ["stoic", "protective", "dry jokes"],
      voice: "Rumbling slow",
      passive: {
        id: "basalt-p",
        name: "Keystone",
        timing: "passive",
        text: "Guardians have +0/+1.",
        effects: [{ op: "buff_hp", value: 1, keyword: "guardian" }],
      },
      ultimate: {
        id: "basalt-u",
        name: "Lock the Pass",
        timing: "ultimate",
        text: "Ancient: summon two Guardian Pebblit tokens.",
        energyCost: 8,
        effects: [{ op: "summon_token", tokenId: "rotr-c-pebblit", value: 2 }],
      },
      deckPreference: ["earth", "guardian", "locations"],
      startingCardIds: ["rotr-c-pebblit", "rotr-c-shalehorn", "rotr-l-stoneheart-gate"],
      difficulty: "easy",
      visualIdentity: "Stone pauldrons, canyon ochre",
      portraitPromptId: "art-basalt",
      relatedRegion: "stoneheart-canyon",
    },
    {
      id: "hero-lumen",
      name: "Lumen",
      title: "Choir Lead",
      element: "light",
      biography: "Believes Harmony is not sameness — it is listening.",
      personality: ["empathetic", "disciplined", "hopeful"],
      voice: "Clear soprano speaking voice",
      passive: {
        id: "lumen-p",
        name: "Resonance",
        timing: "passive",
        text: "Harmony triggers an extra heal 1.",
        effects: [{ op: "heal", value: 1, keyword: "harmony" }],
      },
      ultimate: {
        id: "lumen-u",
        name: "Full Choir",
        timing: "ultimate",
        text: "Ancient: set all ally elements to Light this turn for Harmony.",
        energyCost: 9,
        effects: [{ op: "harmony_buff", value: 1 }],
      },
      deckPreference: ["light", "harmony", "ward"],
      startingCardIds: ["rotr-c-luminara", "rotr-c-dawnkit", "rotr-l-citadel-choir"],
      difficulty: "hard",
      visualIdentity: "White-gold vestments, soft halo motes",
      portraitPromptId: "art-lumen",
      relatedRegion: "radiant-citadel",
    },
    {
      id: "hero-cog",
      name: "Cogmother",
      title: "Alloy Tender",
      element: "metal",
      biography: "Oils Gearlings like grandchildren; builds decks like machines that forgive.",
      personality: ["inventive", "nurturing", "stubborn"],
      voice: "Warm with metallic consonants",
      passive: {
        id: "cog-p",
        name: "Spare Parts",
        timing: "passive",
        text: "When a Metal unit dies, gain a Spark Fragment.",
        effects: [{ op: "summon_token", tokenId: "rotr-t-spark-fragment" }],
      },
      ultimate: {
        id: "cog-u",
        name: "Assembly Hymn",
        timing: "ultimate",
        text: "Ancient: equip all allies with a temporary +1/+1.",
        energyCost: 8,
        effects: [{ op: "buff_atk", value: 1 }, { op: "buff_hp", value: 1 }],
      },
      deckPreference: ["metal", "equipment", "tokens"],
      startingCardIds: ["rotr-c-gearling", "rotr-c-cogpup", "rotr-r-forge-relic"],
      difficulty: "medium",
      visualIdentity: "Goggles, brass vines, kind eyes",
      portraitPromptId: "art-cogmother",
      relatedRegion: "alloy-ruins",
    },
    {
      id: "hero-astral",
      name: "Astral",
      title: "Rift Astronomer",
      element: "celestial",
      biography: "Charts Celestial Rift openings like tides; mythic lines are just math with wonder.",
      personality: ["aloof", "kind", "obsessive"],
      voice: "Soft, distant",
      passive: {
        id: "astral-p",
        name: "Orbit",
        timing: "passive",
        text: "Once/game, Celestial counts as any element for Harmony.",
        effects: [{ op: "harmony_buff", notes: "once" }],
      },
      ultimate: {
        id: "astral-u",
        name: "Open Gate",
        timing: "ultimate",
        text: "Ancient: gain 3 energy and Awaken a unit.",
        energyCost: 10,
        effects: [{ op: "gain_energy", value: 3 }, { op: "awaken_transform" }],
      },
      deckPreference: ["celestial", "awaken", "ramp"],
      startingCardIds: ["rotr-c-celestora", "rotr-s-star-dust", "rotr-a-artifact-gate-key"],
      difficulty: "expert",
      visualIdentity: "Star-map cloak, calm eyes",
      portraitPromptId: "art-astral",
      relatedRegion: "celestial-rift",
    },
  ];
  return heroes;
}

function pickIds(cards, preds, n) {
  return cards.filter(preds).slice(0, n).map((c) => c.id);
}

function buildDecks(cards) {
  const byEl = (el) => (c) => c.element === el && !c.isToken;
  const creatures = (el) => (c) => c.element === el && c.type === "creature";
  const decks = [];

  const archetypes = [
    ["starter-nature", "Nature Starter", "nature", "Grow Bloom threats, stabilize with Guardian.", "easy", "elara", "Riftbond midrange"],
    ["starter-fire", "Fire Aggro", "fire", "Charge early, Empower finishers.", "easy", "kael", "Aggro"],
    ["starter-water", "Water Healing", "water", "Ward, Overflow heals, sticky board.", "easy", "brine", "Control-heal"],
    ["starter-storm", "Storm Control", "storm", "Tempo Charge into card advantage.", "medium", "volta", "Tempo"],
    ["starter-earth", "Earth Guardian", "earth", "Walls and Locations; win long.", "easy", "basalt", "Control"],
    ["starter-crystal", "Crystal Mage", "crystal", "Shatter interaction and spell density.", "medium", "solen", "Spell midrange"],
    ["starter-shadow", "Shadow Corruption", "shadow", "Corrupt Residue into void finishers.", "hard", "nyx", "Attrition"],
    ["starter-light", "Light Protection", "light", "Ward walls and Harmony heals.", "medium", "lumen", "Midrange"],
    ["starter-spirit", "Spirit Combo", "spirit", "Echo loops with soft engines.", "hard", "solen", "Combo"],
    ["starter-celestial", "Celestial Legends", "celestial", "Ramp to Ancient Awaken payoffs.", "expert", "astral", "Ramp"],
    ["npc-mira", "Mira's Care Deck", "light", "Teaching deck for new Keepers.", "easy", "mira", "Teach"],
    ["npc-blacksmith", "Kael's Temper Deck", "fire", "Equipment-forward forge lesson.", "medium", "kael", "Equipment"],
  ];

  for (const [id, name, el, strategy, difficulty, npc, archetype] of archetypes) {
    const list = {};
    const pool = cards.filter(
      (c) => !c.isToken && c.type !== "hero" && (c.element === el || c.element === "neutral" || c.type === "quest"),
    );
    const creaturesEl = [
      ...cards.filter((c) => creatures(el)(c) && c.riftlingSlug),
      ...cards.filter((c) => creatures(el)(c) && !c.riftlingSlug),
    ].slice(0, 12);
    const spells = cards
      .filter((c) => c.type === "spell" && (c.element === el || c.element === "neutral") && !c.id.startsWith("rotr-s-item-"))
      .slice(0, 6);
    const itemSpells = cards
      .filter((c) => c.type === "spell" && c.element === el && c.id.startsWith("rotr-s-item-"))
      .slice(0, 4);
    const extras = pool
      .filter((c) =>
        ["equipment", "location", "relic", "trap", "event", "weather", "companion", "artifact", "quest"].includes(c.type),
      )
      .slice(0, 16);
    for (const c of [...creaturesEl, ...spells, ...itemSpells, ...extras]) {
      list[c.id] = c.rarity === "legendary" || c.type === "location" || c.type === "artifact" ? 1 : 2;
    }
    // ensure ~30 cards — pad with neutrals / same element
    const pad = () => Object.values(list).reduce((a, b) => a + b, 0);
    let count = pad();
    for (const c of cards) {
      if (count >= 30) break;
      if (list[c.id] || c.isToken || c.type === "hero") continue;
      if (c.element !== el && c.element !== "neutral") continue;
      const add = Math.min(2, 30 - count);
      list[c.id] = add;
      count += add;
    }
    // last resort: any non-token
    for (const c of cards) {
      if (count >= 30) break;
      if (list[c.id] || c.isToken || c.type === "hero") continue;
      list[c.id] = 1;
      count += 1;
    }
    decks.push({
      id,
      name,
      strategy,
      difficulty,
      strengths: el === "fire" ? ["fast pressure"] : el === "earth" ? ["survivability"] : ["synergy"],
      weaknesses: el === "fire" ? ["late game"] : el === "earth" ? ["slow starts"] : ["hate cards"],
      cards: list,
      recommendedUpgrades: pickIds(cards, byEl(el), 3),
      npcOwner: npc,
      lore: `${name} is taught in the Living World before Keepers chase mythic hunts.`,
      archetype,
      kind: id.startsWith("npc") ? "npc" : "starter",
    });
  }

  return decks;
}

function buildBoards() {
  return [
    {
      id: "board-forest",
      name: "Elderwood Clearing",
      regionHint: "elderwood-forest",
      ambientAnimation: "sway leaves",
      weather: "soft pollen",
      particles: ["leaf_motes", "fireflies"],
      musicCue: "music/zones/elderwood",
      interactiveProps: ["stump table", "moss bench"],
      artPrompt: "Top-down fantasy duel board in elder forest, painterly, no UI text",
    },
    {
      id: "board-castle",
      name: "Citadel Steps",
      regionHint: "radiant-citadel",
      ambientAnimation: "banner flutter",
      weather: "clear gold light",
      particles: ["dust_gold"],
      musicCue: "music/zones/citadel",
      interactiveProps: ["banner poles"],
      artPrompt: "Marble courtyard duel board, radiant fantasy, no text",
    },
    {
      id: "board-volcano",
      name: "Ember Crater Rim",
      regionHint: "ember-crater",
      ambientAnimation: "heat shimmer",
      weather: "ash drift",
      particles: ["embers"],
      musicCue: "music/zones/ember",
      interactiveProps: ["cooling stones"],
      artPrompt: "Volcanic overlook duel board, warm painterly fantasy",
    },
    {
      id: "board-frozen",
      name: "Frostveil Mirror",
      regionHint: "frostveil-basin",
      ambientAnimation: "ice crackle",
      weather: "light snow",
      particles: ["snow"],
      musicCue: "music/zones/frostveil",
      interactiveProps: ["ice lanterns"],
      artPrompt: "Frozen lake duel board, soft blues, fantasy",
    },
    {
      id: "board-ruins",
      name: "Alloy Ruin Floor",
      regionHint: "alloy-ruins",
      ambientAnimation: "gear ticks",
      weather: "dry wind",
      particles: ["sparks"],
      musicCue: "music/zones/alloy",
      interactiveProps: ["broken gears"],
      artPrompt: "Ancient metal ruins duel board, teal accents",
    },
    {
      id: "board-sky",
      name: "Stormspire Perch",
      regionHint: "stormspire-peaks",
      ambientAnimation: "cloud scroll",
      weather: "distant lightning",
      particles: ["wind_streaks"],
      musicCue: "music/zones/stormspire",
      interactiveProps: ["anchored flags"],
      artPrompt: "Sky temple platform duel board, stormy fantasy",
    },
    {
      id: "board-ship",
      name: "Azure Deck",
      regionHint: "moonwater-coast",
      ambientAnimation: "ship sway",
      weather: "sea mist",
      particles: ["spray"],
      musicCue: "music/zones/moonwater",
      interactiveProps: ["ropes", "barrels"],
      artPrompt: "Pirate ship deck duel board, fantasy coast",
    },
    {
      id: "board-crystal",
      name: "Crystal Cavern",
      regionHint: "radiant-citadel",
      ambientAnimation: "prism pulse",
      weather: "still air",
      particles: ["crystal_dust"],
      musicCue: "music/zones/crystal",
      interactiveProps: ["resonant pillars"],
      artPrompt: "Crystal cavern duel board, cyan refract light",
    },
    {
      id: "board-festival",
      name: "Lantern Plaza",
      regionHint: "riftwild-commons",
      ambientAnimation: "lantern bob",
      weather: "clear evening",
      particles: ["lantern_glow"],
      musicCue: "music/festivals/lanterns",
      interactiveProps: ["food stalls"],
      artPrompt: "Festival plaza duel board, warm lanterns, commons",
    },
    {
      id: "board-haunted",
      name: "Hollow Lane",
      regionHint: "void-hollow",
      ambientAnimation: "shadow crawl",
      weather: "false night",
      particles: ["void_wisps"],
      musicCue: "music/zones/void",
      interactiveProps: ["tilted lamps"],
      artPrompt: "Haunted village lane duel board, void teal, fantasy",
    },
  ];
}

function buildFrames() {
  return [
    { id: "frame-common", name: "Commons Timber", appliesTo: ["common"], layers: ["wood", "ink-rule", "parchment-inset"], accentColor: "#8b5a3c", notes: "Quiet default" },
    { id: "frame-rare", name: "Cyan Inlay", appliesTo: ["rare", "uncommon"], layers: ["stone", "cyan-filigree"], accentColor: "#3de7ff", notes: "Rift accent corners" },
    { id: "frame-epic", name: "Amber Vault", appliesTo: ["epic"], layers: ["metal", "amber-gems"], accentColor: "#ffb84d", notes: "Heavier bezel" },
    { id: "frame-legendary", name: "Gateway Heart", appliesTo: ["legendary", "mythic"], layers: ["crystal", "animated-sheen"], accentColor: "#66e0ff", notes: "Soft pulse, not neon spam" },
    { id: "frame-elemental", name: "Element Halo", appliesTo: ["all"], layers: ["element-ring"], accentColor: "per-element", notes: "Outer ring recolors by element" },
    { id: "frame-holiday", name: "Lantern Lace", appliesTo: ["holiday", "seasonal"], layers: ["lantern-motifs"], accentColor: "#ffc070", notes: "Festival only" },
    { id: "frame-animated", name: "Living Edge", appliesTo: ["animated"], layers: ["particle-edge"], accentColor: "#3de7ff", notes: "Requires reduced-motion fallback" },
    { id: "frame-founder", name: "Founder Seal", appliesTo: ["founder"], layers: ["wax-seal", "signature-plate"], accentColor: "#ffe566", notes: "Cosmetic prestige" },
    { id: "frame-champion", name: "Tournament Laurel", appliesTo: ["collector"], layers: ["laurel", "rank-pip"], accentColor: "#ffb84d", notes: "Earned in events" },
    { id: "frame-tournament", name: "Arena Bracket", appliesTo: ["tournament"], layers: ["bracket-corners"], accentColor: "#3d9bff", notes: "PvP seasonal" },
  ];
}

function balanceReport(cards, decks) {
  const costs = cards.filter((c) => !c.isToken && c.type !== "hero").map((c) => c.energyCost);
  const avg = costs.reduce((a, b) => a + b, 0) / costs.length;
  const hist = {};
  for (const c of costs) hist[c] = (hist[c] || 0) + 1;
  const byRarity = {};
  for (const c of cards) byRarity[c.rarity] = (byRarity[c.rarity] || 0) + 1;

  return `# Foundational Set Balance Notes (ROTR)

Generated with the content pipeline — **validate in playtests**. Sources: full pet lore roster, item catalogs, region packs, game-library props.

## Macro
- Cards (incl. tokens/heroes): **${cards.length}**
- Average non-hero energy cost: **${avg.toFixed(2)}**
- Cost histogram: ${JSON.stringify(hist)}
- Rarity mix: ${JSON.stringify(byRarity)}
- Cards with \`art.assetPath\`: **${cards.filter((c) => c.art?.assetPath).length}**
- Riftling creature cards: **${cards.filter((c) => c.type === "creature" && c.riftlingSlug).length}**

## Rift Energy model
- Start **1**, gain **+1** each turn, cap **10**
- Empower cares about energy spent this turn — keep 5+ drops rare
- Ramp (Star Dust) is uncommon/rare gated

## Archetype health (hypothesis)
| Deck | Risk | Note |
|------|------|------|
| Fire Aggro | High early | Needs Guardian hate later |
| Earth Guardian | Slow | Locations must matter by turn 4 |
| Spirit Combo | Echo loops | Cap Echo once; no infinite without Ancient |
| Shadow Corrupt | Attrition | Residue cap 3 (4 only on Void board) |
| Celestial | Ramp | Ultimate cost 10 — gate carefully |

## Flagged combinations to watch
1. Echo + Arc Latch + cheap draws — watch hand flooding
2. Bloom + Elderwood Path double tick — may need half-stacks
3. Charge + Stormspire Landing + Volta passive — burst damage
4. Soulbind + Corrupt Residue sharing — delay Soulbind to rare

## Recommended next balance pass
- Play 50 AI mirrors per starter deck
- Track turn-of-death distribution
- Adjust only JSON \`attack\`/\`health\`/\`energyCost\` — keep keywords stable
`;
}

function soundManifest(cards) {
  const set = new Set();
  for (const c of cards) {
    if (c.sound.play) set.add(c.sound.play);
    if (c.sound.hit) set.add(c.sound.hit);
    if (c.sound.death) set.add(c.sound.death);
  }
  return {
    version: "1.0.0",
    notes: "Cue IDs only — wire to audio bus later. Prefer original/procedural SFX.",
    cues: [...set].sort().map((id) => ({ id, bus: "combat", status: "placeholder" })),
  };
}

function animationManifest(cards) {
  return {
    version: "1.0.0",
    notes: "Animation clip IDs referenced by cards — art team fills sheets later.",
    clips: cards.flatMap((c) =>
      Object.entries(c.animation)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ id: v, cardId: c.id, kind: k })),
    ),
  };
}

function artPromptsFile(cards, heroes) {
  const prompts = [];
  for (const c of cards) {
    prompts.push({
      id: c.art.promptId,
      cardId: c.id,
      assetPath: c.art.assetPath || null,
      libraryAssetId: c.art.libraryAssetId || null,
      ...c.art,
    });
  }
  for (const h of heroes) {
    prompts.push({
      id: h.portraitPromptId,
      heroId: h.id,
      prompt: `Portrait of ${h.name}, ${h.visualIdentity}, painterly fantasy trading card portrait, soft magical light, no text, no logo, original character`,
      negativePrompt: NEG,
    });
  }
  return { version: "1.0.0", prompts };
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  collector = 1;
  const cards = buildCards();
  const heroes = buildHeroes();
  // fix cogmother starting card id if relic id differs
  const relic = cards.find((c) => c.name === "Forge Relic");
  const gate = cards.find((c) => c.name === "Artifact: Gate Key");
  for (const h of heroes) {
    h.startingCardIds = h.startingCardIds.map((id) => {
      if (id.startsWith("rotr-r-") && relic) return relic.id;
      if (id.startsWith("rotr-a-") && gate) return gate.id;
      return id;
    });
  }
  const decks = buildDecks(cards);
  const boards = buildBoards();
  const frames = buildFrames();
  const bundle = {
    version: "0.1.0-foundational",
    generatedAt: new Date().toISOString(),
    expansionId: "rise-of-the-rift",
    riftEnergy: {
      start: 1,
      maxCap: 10,
      perTurnGain: 1,
      notes: "Replaces mana. Ramp/drain/store supported via effects. Gameplay never requires SOL.",
    },
    keywords: KEYWORDS,
    cards,
    heroes,
    decks,
    expansions: EXPANSIONS,
    boardThemes: boards,
    cardFrames: frames,
  };

  const writes = {
    "keywords.json": KEYWORDS,
    "cards.json": cards,
    "heroes.json": heroes,
    "decks.json": decks,
    "expansions.json": EXPANSIONS,
    "boardThemes.json": boards,
    "cardFrames.json": frames,
    "soundManifest.json": soundManifest(cards),
    "animationManifest.json": animationManifest(cards),
    "artPrompts.json": artPromptsFile(cards, heroes),
    "bundle.json": bundle,
  };

  for (const [file, data] of Object.entries(writes)) {
    fs.writeFileSync(path.join(OUT, file), JSON.stringify(data, null, 2) + "\n", "utf8");
  }

  const bal = balanceReport(cards, decks);
  fs.mkdirSync(path.join(OUT, "balance"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "balance/foundational-report.md"), bal, "utf8");

  const species = loadSpeciesFromLore();
  const withSlug = cards.filter((c) => c.riftlingSlug && c.type === "creature");
  const withArt = cards.filter((c) => c.art?.assetPath);
  const byType = {};
  for (const c of cards) byType[c.type] = (byType[c.type] || 0) + 1;
  console.log(`Wrote ${cards.length} cards, ${heroes.length} heroes, ${decks.length} decks → ${OUT}`);
  console.log(`Species creature coverage: ${withSlug.length}/${species.length}`);
  console.log(`Cards with art.assetPath: ${withArt.length}`);
  console.log(`By type: ${JSON.stringify(byType)}`);
}

main();
