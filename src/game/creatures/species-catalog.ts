/**
 * Launch species catalog for Riftwilds (Phase 1 definitions).
 * Original names only — not seeded into Prisma until migration runs.
 */

import { SPECIES_KITS } from "@/game/creatures/species-kits";
import type {
  SpeciesAbilityDef,
  SpeciesBaseStats,
  SpeciesKit,
  SpeciesTraitDef,
} from "@/game/creatures/rpg-types";

export type BodyCategory =
  | "QUADRUPED"
  | "BIPED"
  | "SERPENTINE"
  | "FLOATING"
  | "AVIAN"
  | "AQUATIC"
  | "INSECTOID"
  | "STONE_BODIED"
  | "PLANT_BODIED"
  | "SPIRIT_BODIED"
  | "MECHANICAL_ORGANIC"
  | "AMORPHOUS";

export type SpeciesDef = {
  slug: string;
  name: string;
  description: string;
  affinity: string;
  bodyType: BodyCategory;
  size: "TINY" | "SMALL" | "MEDIUM" | "LARGE";
  temperament: string;
  rarityBias: string;
  habitat: string;
  food: string;
  evolutionPaths: string[];
  /** RPG combat/care kit — always populated for launch species. */
  baseStats: SpeciesBaseStats;
  abilities: SpeciesAbilityDef[];
  traits: SpeciesTraitDef[];
};

export type { SpeciesAbilityDef, SpeciesBaseStats, SpeciesTraitDef, SpeciesKit };

type EggAffinityHint =
  | "COMMON_RIFT"
  | "EMBER"
  | "TIDE"
  | "GROVE"
  | "STORM"
  | "STONE"
  | "FROST"
  | "RADIANT"
  | "VOID"
  | "ALLOY"
  | "SPIRIT"
  | "CELESTIAL"
  | "SEASONAL"
  | "EVENT"
  | "FOUNDER";

const AFFINITY_TO_EGG: Record<string, EggAffinityHint> = {
  EMBER: "EMBER",
  TIDE: "TIDE",
  GROVE: "GROVE",
  STORM: "STORM",
  STONE: "STONE",
  FROST: "FROST",
  RADIANT: "RADIANT",
  VOID: "VOID",
  ALLOY: "ALLOY",
  SPIRIT: "SPIRIT",
};

const FALLBACK_KIT: SpeciesKit = {
  baseStats: { hp: 90, attack: 30, defense: 28, speed: 28, energy: 100 },
  abilities: [
    {
      id: "rift-strike",
      name: "Rift Strike",
      description: "A reliable physical strike.",
      category: "ATTACK",
      power: 38,
      energyCost: 0,
      cooldown: 0,
    },
  ],
  traits: [
    {
      id: "rift-born",
      name: "Rift-Born",
      description: "A generic rift survivor without a specialized kit.",
    },
  ],
};

function attachKit(base: Omit<SpeciesDef, "baseStats" | "abilities" | "traits">): SpeciesDef {
  const kit = SPECIES_KITS[base.slug] ?? FALLBACK_KIT;
  return {
    ...base,
    baseStats: kit.baseStats,
    abilities: kit.abilities,
    traits: kit.traits,
  };
}

function s(
  slug: string,
  name: string,
  affinity: string,
  bodyType: BodyCategory,
  temperament: string,
  habitat: string,
  food: string,
  description: string,
  rarityBias = "COMMON",
  size: SpeciesDef["size"] = "SMALL",
): SpeciesDef {
  return attachKit({
    slug,
    name,
    affinity,
    bodyType,
    temperament,
    habitat,
    food,
    description,
    rarityBias,
    size,
    evolutionPaths: [`${name} Adept`, `${name} Ascendant`],
  });
}

export const LAUNCH_SPECIES: SpeciesDef[] = [
  s("cindercub", "Cindercub", "EMBER", "QUADRUPED", "Brave", "Ember Crater", "Emberberry", "Warm-pelted cub that sparks when startled."),
  s("mossprig", "Mossprig", "GROVE", "PLANT_BODIED", "Gentle", "Elderwood Forest", "Groveleaf", "A sproutling wrapped in living moss."),
  s("bubbloon", "Bubbloon", "TIDE", "AQUATIC", "Playful", "Moonwater Coast", "Moonvine", "Buoyant orb creature trailing brine bubbles."),
  s("voltkit", "Voltkit", "STORM", "QUADRUPED", "Energetic", "Stormspire Peaks", "Stormbud", "Static fur crackles along ridgelines."),
  s("pebblit", "Pebblit", "STONE", "STONE_BODIED", "Calm", "Stoneheart Canyon", "Stonefruit", "Rolling stone-bodied hatchling."),
  s("wisplet", "Wisplet", "SPIRIT", "SPIRIT_BODIED", "Curious", "Spirit Marsh", "Spirit Bloom", "Lantern-soft spirit that hums at dusk."),
  s("frostnip", "Frostnip", "FROST", "QUADRUPED", "Shy", "Frostveil Basin", "Frostroot", "Powdery paws leave tiny ice prints."),
  s("luminara", "Luminara", "RADIANT", "FLOATING", "Calm", "Radiant Citadel", "Radiant Lily", "Hovering prism pet of dawn light."),
  s("hollowshade", "Hollowshade", "VOID", "AMORPHOUS", "Independent", "Void Hollow", "Voidcap", "Shadow-soft form that slips between rifts.", "EPIC"),
  s("gearling", "Gearling", "ALLOY", "MECHANICAL_ORGANIC", "Protective", "Alloy Ruins", "Alloy Moss", "Clockwork-hearted companion of scrap gardens."),
  s("bramblefox", "Bramblefox", "GROVE", "QUADRUPED", "Mischievous", "Elderwood Forest", "Groveleaf", "Thorn-tailed scout of deep thickets."),
  s("coralurge", "Coralurge", "TIDE", "AQUATIC", "Protective", "Moonwater Coast", "Moonvine", "Reef-plated guardian of tide pools.", "RARE"),
  s("ashwing", "Ashwing", "EMBER", "AVIAN", "Brave", "Ember Crater", "Emberberry", "Ash-feathered glider over lava bridges.", "RARE"),
  s("quartzhorn", "Quartzhorn", "STONE", "QUADRUPED", "Protective", "Stoneheart Canyon", "Stonefruit", "Crystal-horned canyon walker."),
  s("staticat", "Staticat", "STORM", "QUADRUPED", "Curious", "Stormspire Peaks", "Stormbud", "Spark-whiskered climber."),
  s("glimmerp", "Glimmerp", "RADIANT", "INSECTOID", "Playful", "Riftwild Commons", "Radiant Lily", "Pollen-light insectoid of the Commons."),
  s("mistwraith", "Mistwraith", "VOID", "SPIRIT_BODIED", "Shy", "Void Hollow", "Voidcap", "Mist-bodied wanderer of hollow corridors.", "LEGENDARY"),
  s("ironbloom", "Ironbloom", "ALLOY", "PLANT_BODIED", "Gentle", "Alloy Ruins", "Alloy Moss", "Metal-petaled bloom that ticks softly.", "RARE"),
  s("riftpup", "Riftpup", "SPIRIT", "QUADRUPED", "Social", "Riftwild Commons", "Spirit Bloom", "Friendly Commons pup with rift freckles."),
  s("tidewisp", "Tidewisp", "TIDE", "FLOATING", "Sleepy", "Moonwater Coast", "Moonvine", "Floating droplet that hums with surf."),
  s("embernewt", "Embernewt", "EMBER", "SERPENTINE", "Curious", "Ember Crater", "Emberberry", "Salamander-like heat seeker."),
  s("groveowl", "Groveowl", "GROVE", "AVIAN", "Calm", "Elderwood Forest", "Groveleaf", "Leaf-winged night watcher."),
  s("stormmoth", "Stormmoth", "STORM", "INSECTOID", "Energetic", "Stormspire Peaks", "Stormbud", "Lightning-dusted moth of high spires."),
  s("stonegrub", "Stonegrub", "STONE", "INSECTOID", "Sleepy", "Stoneheart Canyon", "Stonefruit", "Burrowing mineral grub."),
  s("frostfin", "Frostfin", "FROST", "AQUATIC", "Independent", "Frostveil Basin", "Frostroot", "Ice-stream swimmer with crystal fins."),
  s("radiantkit", "Radiantkit", "RADIANT", "BIPED", "Social", "Radiant Citadel", "Radiant Lily", "Upright kit that collects sunshafts."),
  s("voidling", "Voidling", "VOID", "FLOATING", "Mischievous", "Void Hollow", "Voidcap", "Tiny rift orb that blinks in and out."),
  s("cogpup", "Cogpup", "ALLOY", "QUADRUPED", "Protective", "Alloy Ruins", "Alloy Moss", "Loyal scrap-yard pup with gear ears."),
  s("lanternjay", "Lanternjay", "SPIRIT", "AVIAN", "Curious", "Spirit Marsh", "Spirit Bloom", "Marsh bird with a soft lantern crest."),
  s("craterhorn", "Craterhorn", "EMBER", "QUADRUPED", "Protective", "Ember Crater", "Emberberry", "Broad-shouldered crater sentinel.", "UNCOMMON"),
  s("moonray", "Moonray", "TIDE", "AQUATIC", "Gentle", "Moonwater Coast", "Moonvine", "Gliding ray of moonlit shallows.", "UNCOMMON"),
  s("rootling", "Rootling", "GROVE", "PLANT_BODIED", "Shy", "Elderwood Forest", "Groveleaf", "Walking root cluster with soft leaves."),
  s("spirekite", "Spirekite", "STORM", "AVIAN", "Brave", "Stormspire Peaks", "Stormbud", "Kite-winged peak rider.", "UNCOMMON"),
  s("canyonbeetle", "Canyonbeetle", "STONE", "INSECTOID", "Calm", "Stoneheart Canyon", "Stonefruit", "Armored beetle of fossil shelves."),
  s("snowpuff", "Snowpuff", "FROST", "AMORPHOUS", "Playful", "Frostveil Basin", "Frostroot", "Rolling snow fluff that squeaks."),
  s("citadelmoth", "Citadelmoth", "RADIANT", "INSECTOID", "Calm", "Radiant Citadel", "Radiant Lily", "Temple moth of pale gold dust.", "RARE"),
  s("riftslug", "Riftslug", "VOID", "SERPENTINE", "Sleepy", "Void Hollow", "Voidcap", "Slow serpentine that leaves star-trails."),
  s("scrapfinch", "Scrapfinch", "ALLOY", "AVIAN", "Mischievous", "Alloy Ruins", "Alloy Moss", "Tiny bird nesting in copper wires."),
  s("marshloom", "Marshloom", "SPIRIT", "PLANT_BODIED", "Gentle", "Spirit Marsh", "Spirit Bloom", "Blooming marsh spirit on mossy legs."),
  s("commonspark", "Commonspark", "STORM", "FLOATING", "Energetic", "Riftwild Commons", "Stormbud", "Playful spark of the social habitat."),
  s("hearthstone", "Hearthstone", "STONE", "STONE_BODIED", "Protective", "Riftwild Commons", "Stonefruit", "Warm hearth pebble pet for owner decks."),
  s("tideotter", "Tideotter", "TIDE", "QUADRUPED", "Social", "Moonwater Coast", "Moonvine", "Coast otter that juggles tideglass."),
  s("emberfox", "Emberfox", "EMBER", "QUADRUPED", "Mischievous", "Ember Crater", "Emberberry", "Foxfire-tailed crater scout.", "UNCOMMON"),
  s("elderfern", "Elderfern", "GROVE", "PLANT_BODIED", "Calm", "Elderwood Forest", "Groveleaf", "Ancient fern biped of deep roots.", "RARE"),
  s("peakibex", "Peakibex", "STORM", "QUADRUPED", "Brave", "Stormspire Peaks", "Stormbud", "Wind-horned climber of crystal ledges.", "UNCOMMON"),
  s("fossilhound", "Fossilhound", "STONE", "QUADRUPED", "Protective", "Stoneheart Canyon", "Stonefruit", "Excavation companion with fossil plates.", "RARE"),
  s("veilhare", "Veilhare", "FROST", "QUADRUPED", "Shy", "Frostveil Basin", "Frostroot", "Snow-veil hare that vanishes in flurries."),
  s("auralynx", "Auralynx", "RADIANT", "QUADRUPED", "Independent", "Radiant Citadel", "Radiant Lily", "Lynx with luminous ear tufts.", "EPIC"),
  s("hollowmoth", "Hollowmoth", "VOID", "INSECTOID", "Curious", "Void Hollow", "Voidcap", "Rift-wing moth that feeds on echoes.", "RARE"),
  s("celestora", "Celestora", "RADIANT", "FLOATING", "Calm", "Celestial Rift", "Radiant Lily", "Endgame rift floater of starlight silk.", "CELESTIAL", "MEDIUM"),
  // --- Wave-2 expansion (50) ---
  s("slagpup", "Slagpup", "EMBER", "QUADRUPED", "Brave", "Ember Crater", "Emberberry", "Molten-pawed pup that cools into tough slag."),
  s("pyrespore", "Pyrespore", "EMBER", "PLANT_BODIED", "Curious", "Ember Crater", "Emberberry", "Spore bloom that sheds warm ember pollen.", "UNCOMMON"),
  s("cinderquill", "Cinderquill", "EMBER", "AVIAN", "Independent", "Ember Crater", "Emberberry", "Ash-plumed quillbird of crater rim thermals.", "RARE"),
  s("lavaling", "Lavaling", "EMBER", "AMORPHOUS", "Playful", "Ember Crater", "Emberberry", "Soft lava blob that hardens when startled."),
  s("furnacebeetle", "Furnacebeetle", "EMBER", "INSECTOID", "Protective", "Ember Crater", "Emberberry", "Heat-chambered beetle that vents forge-warm air.", "UNCOMMON"),
  s("brinepaw", "Brinepaw", "TIDE", "QUADRUPED", "Social", "Moonwater Coast", "Moonvine", "Salt-whiskered coastal prowler with wet prints."),
  s("kelpwisp", "Kelpwisp", "TIDE", "FLOATING", "Gentle", "Moonwater Coast", "Moonvine", "Hovering kelp ribbon that tastes of moonfoam."),
  s("sprayfin", "Sprayfin", "TIDE", "AQUATIC", "Energetic", "Moonwater Coast", "Moonvine", "Surf-skimming finner that leaps through spray.", "UNCOMMON"),
  s("pearlurk", "Pearlurk", "TIDE", "AQUATIC", "Shy", "Moonwater Coast", "Moonvine", "Shell-lurking pearl guardian of tide caves.", "RARE"),
  s("tidequill", "Tidequill", "TIDE", "AVIAN", "Curious", "Moonwater Coast", "Moonvine", "Shorebird with ink-dark tide-patterned plumage."),
  s("fernfox", "Fernfox", "GROVE", "QUADRUPED", "Mischievous", "Elderwood Forest", "Groveleaf", "Fern-tailed fox that vanishes into understory."),
  s("saplingo", "Saplingo", "GROVE", "BIPED", "Gentle", "Elderwood Forest", "Groveleaf", "Upright sapling companion with sticky leaf hands."),
  s("vinepup", "Vinepup", "GROVE", "QUADRUPED", "Playful", "Elderwood Forest", "Groveleaf", "Vine-wrapped pup that braids trails as it runs.", "UNCOMMON"),
  s("thornling", "Thornling", "GROVE", "PLANT_BODIED", "Protective", "Elderwood Forest", "Groveleaf", "Spined seedling that softens for trusted keepers.", "RARE"),
  s("mossdrake", "Mossdrake", "GROVE", "SERPENTINE", "Calm", "Elderwood Forest", "Groveleaf", "Low serpentine draped in living moss armor.", "EPIC"),
  s("galekit", "Galekit", "STORM", "QUADRUPED", "Energetic", "Stormspire Peaks", "Stormbud", "Wind-ruffed kit that chases cloud shadows."),
  s("cloudleaper", "Cloudleaper", "STORM", "BIPED", "Brave", "Stormspire Peaks", "Stormbud", "Spring-legged peak hopper that rides updrafts.", "UNCOMMON"),
  s("sparkmoth", "Sparkmoth", "STORM", "INSECTOID", "Curious", "Stormspire Peaks", "Stormbud", "Tiny moth whose dust crackles like dry lightning."),
  s("windrift", "Windrift", "STORM", "FLOATING", "Independent", "Stormspire Peaks", "Stormbud", "Ribbon-bodied floater that steers on gusts alone.", "RARE"),
  s("thunderpaw", "Thunderpaw", "STORM", "QUADRUPED", "Brave", "Stormspire Peaks", "Stormbud", "Heavy-pawed ridge runner with booming steps.", "UNCOMMON"),
  s("shalehorn", "Shalehorn", "STONE", "QUADRUPED", "Protective", "Stoneheart Canyon", "Stonefruit", "Layered shale horns scrape sparks from canyon walls."),
  s("gritling", "Gritling", "STONE", "STONE_BODIED", "Sleepy", "Stoneheart Canyon", "Stonefruit", "Grit-bodied pebblekin that naps in dust bowls."),
  s("basaltpup", "Basaltpup", "STONE", "QUADRUPED", "Calm", "Stoneheart Canyon", "Stonefruit", "Columnar basalt pup with cool volcanic plates.", "UNCOMMON"),
  s("crystowl", "Crystowl", "STONE", "AVIAN", "Independent", "Stoneheart Canyon", "Stonefruit", "Crystal-eyed canyon owl that roosts on geodes.", "RARE"),
  s("rubblefin", "Rubblefin", "STONE", "AQUATIC", "Curious", "Stoneheart Canyon", "Stonefruit", "Stone-stream swimmer with gravel-scaled fins."),
  s("glazehare", "Glazehare", "FROST", "QUADRUPED", "Shy", "Frostveil Basin", "Frostroot", "Ice-glazed hare that leaves glass-thin trails."),
  s("rimewing", "Rimewing", "FROST", "AVIAN", "Calm", "Frostveil Basin", "Frostroot", "Frost-rimmed wing that sings in thin cold air.", "UNCOMMON"),
  s("iciclepup", "Iciclepup", "FROST", "QUADRUPED", "Playful", "Frostveil Basin", "Frostroot", "Icicle-whiskered pup that chews soft snow."),
  s("snowglyph", "Snowglyph", "FROST", "SPIRIT_BODIED", "Curious", "Frostveil Basin", "Frostroot", "Snow-script spirit that writes fading runes.", "RARE"),
  s("frostbloom", "Frostbloom", "FROST", "PLANT_BODIED", "Gentle", "Frostveil Basin", "Frostroot", "Ice-petaled bloom that opens only at blue dusk.", "UNCOMMON"),
  s("dawnkit", "Dawnkit", "RADIANT", "QUADRUPED", "Social", "Radiant Citadel", "Radiant Lily", "Sunrise-furred kit that warms cold stone floors."),
  s("prismoth", "Prismoth", "RADIANT", "INSECTOID", "Playful", "Radiant Citadel", "Radiant Lily", "Facet-wing moth that scatters soft prism dust."),
  s("solfinch", "Solfinch", "RADIANT", "AVIAN", "Energetic", "Radiant Citadel", "Radiant Lily", "Sunbeam finch nesting in citadel lattice light.", "UNCOMMON"),
  s("gleamhare", "Gleamhare", "RADIANT", "QUADRUPED", "Mischievous", "Radiant Citadel", "Radiant Lily", "Gleaming hare that blinks bright when startled.", "RARE"),
  s("lightspire", "Lightspire", "RADIANT", "FLOATING", "Calm", "Radiant Citadel", "Radiant Lily", "Spire of condensed dawnlight with a gentle pulse.", "EPIC"),
  s("umbralisk", "Umbralisk", "VOID", "SERPENTINE", "Independent", "Void Hollow", "Voidcap", "Shadow-coil serpent that drinks dim corridor light.", "UNCOMMON"),
  s("duskling", "Duskling", "VOID", "FLOATING", "Shy", "Void Hollow", "Voidcap", "Dusk orb that dims lanterns when nervous."),
  s("nullpaw", "Nullpaw", "VOID", "QUADRUPED", "Curious", "Void Hollow", "Voidcap", "Soft-pawed voidling that erases its own footprints."),
  s("echofig", "Echofig", "VOID", "PLANT_BODIED", "Sleepy", "Void Hollow", "Voidcap", "Fig-shaped hollow plant that whispers back sounds.", "RARE"),
  s("shadowmire", "Shadowmire", "VOID", "AMORPHOUS", "Protective", "Void Hollow", "Voidcap", "Living mire of night that shelters lost pets.", "LEGENDARY"),
  s("boltgear", "Boltgear", "ALLOY", "MECHANICAL_ORGANIC", "Energetic", "Alloy Ruins", "Alloy Moss", "Bolt-hearted gearling that spins when excited."),
  s("scrapowl", "Scrapowl", "ALLOY", "AVIAN", "Curious", "Alloy Ruins", "Alloy Moss", "Copper-feather owl nesting in scrap rafters.", "UNCOMMON"),
  s("copperfin", "Copperfin", "ALLOY", "AQUATIC", "Calm", "Alloy Ruins", "Alloy Moss", "Cooling-channel swimmer with copper scale plates."),
  s("wirefox", "Wirefox", "ALLOY", "QUADRUPED", "Mischievous", "Alloy Ruins", "Alloy Moss", "Wire-tailed fox that rewires shiny refuse into toys.", "RARE"),
  s("chronobeetle", "Chronobeetle", "ALLOY", "INSECTOID", "Protective", "Alloy Ruins", "Alloy Moss", "Clock-shelled beetle that ticks in sync with ruins.", "EPIC"),
  s("ghostbloom", "Ghostbloom", "SPIRIT", "PLANT_BODIED", "Gentle", "Spirit Marsh", "Spirit Bloom", "Pale marsh bloom that glows when keepers sing."),
  s("dreamhare", "Dreamhare", "SPIRIT", "QUADRUPED", "Sleepy", "Spirit Marsh", "Spirit Bloom", "Soft hare that naps across thin dream borders.", "UNCOMMON"),
  s("wispdeer", "Wispdeer", "SPIRIT", "QUADRUPED", "Shy", "Spirit Marsh", "Spirit Bloom", "Antlered wisp-deer leaving lantern-light prints.", "RARE"),
  s("soulmoth", "Soulmoth", "SPIRIT", "INSECTOID", "Curious", "Spirit Marsh", "Spirit Bloom", "Soul-dust moth that follows honest promises."),
  s("starveil", "Starveil", "SPIRIT", "FLOATING", "Calm", "Celestial Rift", "Spirit Bloom", "Veil of starlit silk from the Celestial Rift edge.", "CELESTIAL", "MEDIUM"),
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function pickSpeciesForEgg(
  eggType: EggAffinityHint,
  rarity: string,
  geneticsSeed: string,
): SpeciesDef {
  let pool = LAUNCH_SPECIES;
  if (eggType !== "COMMON_RIFT" && eggType !== "SEASONAL" && eggType !== "EVENT" && eggType !== "FOUNDER" && eggType !== "CELESTIAL") {
    const affinityMatch = pool.filter((sp) => AFFINITY_TO_EGG[sp.affinity] === eggType);
    if (affinityMatch.length) pool = affinityMatch;
  }
  if (eggType === "CELESTIAL") {
    const celestial = pool.filter((sp) => sp.rarityBias === "CELESTIAL" || sp.rarityBias === "MYTHIC" || sp.rarityBias === "LEGENDARY");
    if (celestial.length) pool = celestial;
  }
  const rarityPool = pool.filter((sp) => sp.rarityBias === rarity);
  const finalPool = rarityPool.length ? rarityPool : pool;
  const idx = hashSeed(geneticsSeed) % finalPool.length;
  return finalPool[idx]!;
}

export function getSpeciesBySlug(slug: string): SpeciesDef | undefined {
  return LAUNCH_SPECIES.find((sp) => sp.slug === slug);
}

/** True when every launch species has a non-empty RPG kit. */
export function assertLaunchKitsComplete(): boolean {
  return LAUNCH_SPECIES.every(
    (sp) => sp.abilities.length >= 2 && sp.traits.length >= 2 && sp.baseStats.hp > 0,
  );
}
