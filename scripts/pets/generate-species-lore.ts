/**
 * Author complete species lore for every LAUNCH_SPECIES entry.
 * Run: npx tsx scripts/pets/generate-species-lore.ts
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES, type SpeciesDef } from "../../src/game/creatures/species-catalog";

const ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(ROOT, "src/content/pets/lore");

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(seed: string, items: T[], salt = ""): T {
  return items[hash(seed + salt) % items.length]!;
}

function pickN<T>(seed: string, items: T[], n: number, salt = ""): T[] {
  const copy = [...items];
  const out: T[] = [];
  let i = 0;
  while (out.length < n && copy.length) {
    const idx = hash(seed + salt + String(i++)) % copy.length;
    out.push(copy.splice(idx, 1)[0]!);
  }
  return out;
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function ensureWordRange(text: string, min: number, max: number, pad: string[]): string {
  let t = text.trim();
  let guard = 0;
  while (words(t) < min && guard < pad.length) {
    t = `${t} ${pad[guard++]}`;
  }
  if (words(t) > max) {
    const parts = t.split(/\s+/);
    t = parts.slice(0, max).join(" ");
    if (!/[.!?]$/.test(t)) t += ".";
  }
  return t;
}

const AFFINITY_VOICE: Record<string, { noun: string; verb: string; mood: string; element: string }> = {
  EMBER: { noun: "hearthlight", verb: "kindles", mood: "restless warmth", element: "ash and living coal" },
  TIDE: { noun: "mooncurrent", verb: "ebbs", mood: "shifting memory", element: "brine and tideglass" },
  GROVE: { noun: "rootwhisper", verb: "unfurls", mood: "patient growth", element: "moss and saplight" },
  STORM: { noun: "skyfracture", verb: "crackles", mood: "sudden freedom", element: "ozone and kite-silk" },
  STONE: { noun: "fossilhum", verb: "endures", mood: "quiet loyalty", element: "dust and canyon grit" },
  FROST: { noun: "aurorathread", verb: "preserves", mood: "softened stillness", element: "powder snow and thin ice" },
  RADIANT: { noun: "prismdawn", verb: "clarifies", mood: "hopeful duty", element: "sunshaft and pale gold" },
  VOID: { noun: "hollowsilence", verb: "slips", mood: "careful distance", element: "mist and echo-dust" },
  ALLOY: { noun: "gearsong", verb: "mends", mood: "inventive purpose", element: "copper bloom and oil-sweet moss" },
  SPIRIT: { noun: "lanternpromise", verb: "remembers", mood: "gentle haunting", element: "marshlight and dream-pollen" },
};

const BODY_MOVE: Record<string, string> = {
  QUADRUPED: "four-footed and sure on uneven ground",
  BIPED: "upright with expressive forelimbs",
  SERPENTINE: "sinuous and low to the terrain",
  FLOATING: "hovering with barely a shadow",
  AVIAN: "winged and wind-literate",
  AQUATIC: "streamlined for shallows and surge",
  INSECTOID: "light-framed with precise limbs",
  STONE_BODIED: "mineral-plated and deliberate",
  PLANT_BODIED: "photosynthetic and season-aware",
  SPIRIT_BODIED: "semi-tangible and lantern-soft",
  MECHANICAL_ORGANIC: "living metal with organic pulse",
  AMORPHOUS: "shape-fluid and hard to pin",
};

const SIZE_LINE: Record<string, string> = {
  TINY: "small enough to sleep in a cupped palm",
  SMALL: "companion-sized, easy to cradle",
  MEDIUM: "shoulder-high to a careful adolescent",
  LARGE: "broad enough to lean against like a living wall",
};

const INTEL = [
  "practical problem-solving intelligence",
  "emotional intelligence above tool craft",
  "spatial memory that rivals scout maps",
  "social intelligence tuned to group moods",
  "instinctive pattern recognition around Rift anomalies",
];

const COMM = [
  "soft chirps and affinity flickers",
  "body posture and scent marks",
  "harmonic hums",
  "tap-codes on stone or wood",
  "glow-pulses along crest or plates",
];

const CONSERVATION = [
  "Stable in core habitats",
  "Locally common, regionally watched",
  "Uncommon outside native ranges",
  "Rare; sensitive to Rift instability",
  "Protected by informal keeper accords",
];

const TITLES_BY_AFFINITY: Record<string, string[]> = {
  EMBER: ["Hearthback Wanderer", "Ashpath Guide", "Crater Rim Sentinel", "Cinderlane Scout"],
  TIDE: ["Tideglass Juggler", "Moonshoal Glider", "Brinepath Companion", "Surfcrest Softling"],
  GROVE: ["Rootlane Listener", "Thorntrail Trickster", "Mossveil Attendant", "Seedlight Guide"],
  STORM: ["Spirewind Rider", "Skyfracture Scout", "Thunderledge Companion", "Kitecrest Runner"],
  STONE: ["Fossilstep Guardian", "Canyon Quietpaw", "Bedrock Companion", "Shelfward Sentinel"],
  FROST: ["Snowveil Softling", "Aurora Quietpaw", "Basin Softguard", "Powderprint Walker"],
  RADIANT: ["Prismcourt Attendant", "Dawnshaft Companion", "Citadel Softlight", "Sunlane Guide"],
  VOID: ["Hollowstep Echo", "Mistcorridor Wanderer", "Echo-Dust Softling", "Rifthush Scout"],
  ALLOY: ["Scrapgarden Tinker", "Gearheart Protector", "Copperbloom Companion", "Ruinsmith Softguard"],
  SPIRIT: ["Lantern-Crest Companion", "Marshlight Keeper", "Dreamreed Guide", "Whisperpath Attendant"],
};

function pronunciation(name: string): string {
  const syllables = name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  const parts = syllables.match(/[bcdfghjklmnpqrstvwxz]*[aeiouy]+[bcdfghjklmnpqrstvwxz]*/gi) ?? [
    name.toLowerCase(),
  ];
  return parts.join("-");
}

function plural(name: string): string {
  if (name.endsWith("y") && !/[aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  if (name.endsWith("s") || name.endsWith("x") || name.endsWith("ch")) return `${name}es`;
  return `${name}s`;
}

function rivalFor(sp: SpeciesDef, all: SpeciesDef[]): string[] {
  const others = all.filter((o) => o.slug !== sp.slug && o.habitat === sp.habitat);
  const rivals = others.filter((o) => o.affinity !== sp.affinity).slice(0, 2);
  if (rivals.length) return rivals.map((r) => r.name);
  return pickN(sp.slug, all.filter((o) => o.slug !== sp.slug), 2, "rival").map((r) => r.name);
}

function alliesFor(sp: SpeciesDef, all: SpeciesDef[]): string[] {
  const same = all.filter((o) => o.slug !== sp.slug && o.affinity === sp.affinity);
  return pickN(sp.slug, same.length ? same : all.filter((o) => o.slug !== sp.slug), 2, "ally").map(
    (a) => a.name,
  );
}

function buildLore(sp: SpeciesDef, all: SpeciesDef[]) {
  const voice = AFFINITY_VOICE[sp.affinity] ?? AFFINITY_VOICE.SPIRIT!;
  const move = BODY_MOVE[sp.bodyType] ?? "nimble across mixed terrain";
  const size = SIZE_LINE[sp.size] ?? SIZE_LINE.SMALL!;
  const titlePool = TITLES_BY_AFFINITY[sp.affinity] ?? TITLES_BY_AFFINITY.SPIRIT!;
  const title = pick(sp.slug, titlePool, "title");
  const intel = pick(sp.slug, INTEL, "intel");
  const comm = pick(sp.slug, COMM, "comm");
  const cons = pick(sp.slug, CONSERVATION, "cons");
  const allies = alliesFor(sp, all);
  const rivals = rivalFor(sp, all);
  const ability = sp.abilities[0]?.name ?? "Rift Strike";
  const trait = sp.traits[0]?.name ?? "Rift-Born";

  const legendSeeds = [
    `Travelers once claimed that following a wild ${sp.name} through ${sp.habitat} would lead them past a Rift storm unharmed.`,
    `An old keeper journal swears a ${sp.name} refused to leave an injured stranger until dawn warmth returned.`,
    `Children in border camps still leave a scrap of ${sp.food} on windowsills when ${sp.name} silhouettes pass at dusk.`,
    `A collapsed survey team credited their escape to a ${sp.name} that chose the only stable ledge in a crumbling pass.`,
    `Festival stories say the first Riftkeepers learned patience by watching ${plural(sp.name)} wait out weather rather than fight it.`,
  ];
  const legend = pick(sp.slug, legendSeeds, "legend");

  const hiddenSeeds = [
    `${sp.name} plates, fur, or blooms react faintly to unstable gateways—often hours before instruments notice.`,
    `Their eggs briefly display shell-sigils that match sealed doors in ${sp.habitat}, then fade after hatching.`,
    `${plural(sp.name)} can hear micro-fractures in Riftstone as a pressure change behind the ears.`,
    `When deeply bonded, a ${sp.name} shares short dream-images of places it has never physically visited.`,
    `Their ${voice.element} scent intensifies near forgotten vaults, which may explain keeper superstitions.`,
  ];
  const hidden = pick(sp.slug, hiddenSeeds, "hidden");

  const misunderstand = pick(
    sp.slug,
    [
      `Many assume ${plural(sp.name)} are aggressive because of their ${sp.affinity.toLowerCase()} affinity; most are cautious first.`,
      `Collectors sometimes treat them as ornaments. Wild ${plural(sp.name)} are social strategists, not decorations.`,
      `Their quiet is mistaken for emptiness. In truth they are listening harder than louder species.`,
      `Some believe rarity equals destiny. ${sp.name} stories are meaningful without being prophetic.`,
    ],
    "mis",
  );

  const shortPad = [
    `In ${sp.habitat}, they favor ${sp.food} and soft routines.`,
    `Keepers note a ${sp.temperament.toLowerCase()} streak that deepens with trust.`,
    `They notice Rift weather before most instruments do.`,
  ];
  const shortCore = `${plural(sp.name)} are ${sp.affinity.toLowerCase()}-touched Riftlings of ${sp.habitat}, ${move}. Often mistaken for simple ${sp.affinity.toLowerCase()} beasts, they are ${sp.temperament.toLowerCase()} companions known for ${trait.toLowerCase()} instincts and a quiet talent for reading unstable air.`;
  const shortBio = ensureWordRange(shortCore, 40, 70, shortPad);

  const standardPad = [
    `Young ${plural(sp.name)} practice ${ability} as play long before they understand battle.`,
    `Adults teach by demonstration: where to rest, what to avoid, how to share warmth or shade.`,
    `In Live World habitats they patrol favorite circuits and greet familiar keepers with recognition flickers.`,
    `Evolution, for them, is less conquest than clarification—becoming more precisely themselves.`,
  ];
  const standardCore = [
    `${sp.name}, titled among keepers as “${title},” carries ${voice.mood} in every movement.`,
    `Native to ${sp.habitat}, the species ${voice.verb} through ${voice.element}, leaving traces that other Riftlings can follow like soft maps.`,
    `Wild groups form loose bonds rather than rigid packs; a ${sp.temperament.toLowerCase()} individual may become the emotional center of a small hearthline.`,
    `They eat ${sp.food} eagerly and dislike food that smells of neglect or spoilage.`,
    `Ancient keepers carved ${sp.name} silhouettes into travel stones, believing the species guided the lost.`,
    `Modern hatcheries record them as reliable companions; their ${intel} makes training feel like conversation.`,
    `Their signature ability, ${ability}, reflects a life shaped by ${sp.habitat} more than by arena ambition.`,
    misunderstand,
  ].join(" ");
  const standardBio = ensureWordRange(standardCore, 150, 250, standardPad);

  const fullParas = [
    `${plural(sp.name)} first condensed from residual ${voice.noun} along the living edges of ${sp.habitat} after early Rift fractures cooled into weather. Their eggs appear where ${voice.element} gathers into stillness—never in the loudest danger, always in the pocket of calm beside it. Early surveyors mistook them for ambient phenomena until a ${sp.name} returned a dropped lantern, carefully, as if returning a promise.`,

    `In ancient eras, regional peoples treated ${plural(sp.name)} as omen-bearers rather than pets. Carvings show them walking ahead of caravans, pausing at unstable ground, and curling around children during ashfall or fog. The species was never “tamed” in the old sense; it chose. That choice culture survives in modern Riftkeeper etiquette: you do not yank a ${sp.name} into a bond. You invite, wait, and keep the invitation honest.`,

    `Modern history is quieter and more practical. Hatcheries map ${sp.name} care cycles with the same seriousness given to rare lines, because common does not mean shallow. ${sp.habitat} still holds wild populations that trade soft greetings with passerby pets. After major Rift events, ${plural(sp.name)} often appear first at recovery centers—not as heroes, but as inventory clerks of comfort, counting who is cold, hungry, or afraid.`,

    `Natural behavior is ${sp.temperament.toLowerCase()} at the core and adaptable at the edges. They are ${move}, ${size}, and communicate through ${comm}. Socially, they prefer small trusted circles; strangers are assessed by scent, posture, and whether a keeper’s voice stays kind under stress. Intelligence presents as ${intel}. They sleep in ${pick(sp.slug, ["curled nests", "warm stone hollows", "moss cups", "elevated shelves", "shallow scrapes"], "sleep")} and prefer weather that matches their affinity’s comfort band.`,

    `Ecologically, ${plural(sp.name)} act as ${pick(sp.slug, ["early-warning sensors", "seed dispersers of calm", "trail markers", "cleanup foragers", "emotional ballast for mixed herds"], "eco")} within ${sp.habitat}. Allies often include ${allies.join(" and ")}; rivalries with ${rivals.join(" and ")} are usually about nesting space or shiny refuse, not blood feuds. Predators are rare—most threats come from collapsing terrain and careless machines rather than jaws.`,

    `Culture around them is affectionate and slightly superstitious. ${legend} Collectors prize unusual cosmetics, yet marketplace notes remind buyers that verified care history matters more than glitter. The common misunderstanding remains: ${misunderstand} The hidden truth keepers debate in soft rooms is simpler and stranger: ${hidden}`,

    `From egg to evolved form, their life story stays continuous. Eggs look like ${pick(sp.slug, ["glazed stones", "soft lantern pods", "frosted pearls", "copper seed-cases", "tideglass orbs"], "egg")} veined with ${sp.affinity.toLowerCase()} light. Hatchlings are clumsy with sincerity; adults become specialists of place; evolved stages sharpen instinct without erasing childhood habits. Battle tendencies favor ${pick(sp.slug, ["protective bursts", "clever disruption", "enduring defense", "swift harassment", "supportive pulses"], "battle")}, and evolution philosophy insists transformation should answer lived experience—not fashion.`,

    `For Riftkeepers, a ${sp.name} is a living chapter of ${sp.habitat}. Feed it ${sp.food}, respect its ${sp.temperament.toLowerCase()} tempo, and it will teach you the region’s quieter grammar: which winds lie, which stones remember, which silences are safe. Personal quests often begin with a shell symbol, a remembered scent, or a dream of a door that only opens when the bond is honest. That is the ${sp.name} bargain—not destiny sold at rarity price, but a life that continues because you showed up.`,
  ];

  let fullLore = fullParas.join("\n\n");
  // Ensure length band; expand with species-specific closing if short
  if (words(fullLore) < 500) {
    fullLore += `\n\nKeeper field notes add that ${plural(sp.name)} recognize individual footsteps within days, prefer ${sp.food} slightly warmed or cooled to affinity comfort, and will refuse travel through regions that contradict their emotional need for ${voice.mood}. Their Live World habits include looping favorite overlooks, checking egg-like objects twice, and sitting with injured strangers until help arrives. In story archives, they appear not as world-saviors but as the reason smaller salvations succeed: a warm back in ash, a lantern in marsh fog, a gear clicked back into place, a hush that makes listening possible again.`;
  }
  if (words(fullLore) > 900) {
    const parts = fullLore.split(/\s+/);
    fullLore = parts.slice(0, 900).join(" ");
    if (!/[.!?]$/.test(fullLore)) fullLore += ".";
  }

  const secondaryHabitats = pickN(
    sp.slug,
    [
      "Riftwild Commons",
      "recovery center gardens",
      "homestead edges",
      "travel-road shrines",
      sp.habitat,
    ].filter((h, i, a) => a.indexOf(h) === i && h !== sp.habitat),
    2,
    "sec",
  );

  return {
    slug: sp.slug,
    name: sp.name,
    pluralName: plural(sp.name),
    pronunciation: pronunciation(sp.name),
    title,
    shortBio,
    standardBio,
    fullLore,
    origin: `${plural(sp.name)} emerged along ${sp.habitat} where ${voice.element} pooled after early Rift fractures, nesting in calm pockets beside danger rather than inside it.`,
    ancientHistory: `Ancient travelers treated ${plural(sp.name)} as omen-guides. Carvings show them leading caravans and sheltering the vulnerable during regional storms of ${sp.affinity.toLowerCase()} weather.`,
    modernHistory: `Modern hatcheries and Live World habitats record ${plural(sp.name)} as dependable companions. Wild groups still greet keepers near ${sp.habitat}, especially after Rift aftershocks.`,
    nativeRegion: sp.habitat,
    secondaryHabitats,
    affinity: sp.affinity,
    secondaryAffinities: pickN(
      sp.slug,
      ["SPIRIT", "STONE", "STORM", "GROVE", "TIDE"].filter((a) => a !== sp.affinity),
      1,
      "secAff",
    ),
    naturalBehavior: `Typically ${sp.temperament.toLowerCase()}, ${move}, and attentive to micro-changes in ${voice.element}.`,
    socialBehavior: `Prefers small trusted circles; assesses strangers by scent, posture, and keeper tone.`,
    intelligenceLevel: intel,
    communicationStyle: comm,
    diet: `Omnivorous lean toward ${sp.food} and affinity-compatible forage.`,
    favoriteFoods: [sp.food, `${sp.affinity} nectar-crisp`, "shared keeper snacks"],
    foodsDisliked: ["spoiled mash", "overly metallic scraps", "food offered fearfully"],
    sleepingHabits: `Sleeps in protected nests; restless if the perimeter feels unwatched.`,
    activityCycle: pick(sp.slug, ["crepuscular", "diurnal with noon rests", "nocturnal soft-patrol", "weather-triggered bursts"], "cycle"),
    weatherPreference: pick(sp.slug, ["warmth after rain", "clear wind", "soft fog", "stable cold", "bright dawn"], "weather"),
    environmentalRole: `Acts as a living sensor and comfort ballast within ${sp.habitat}.`,
    naturalPredators: ["terrain collapse", "careless machinery", "unstable micro-rifts"],
    naturalAllies: allies,
    rivalSpecies: rivals,
    relationshipWithRiftkeepers: `Chooses bonds; thrives with keepers who invite rather than force. ${sp.temperament} individuals attach deeply once trust settles.`,
    culturalImportance: `Appears in travel charms, children’s sill-offerings, and hatchery teaching tales across ${sp.habitat}.`,
    ancientLegend: legend,
    commonMisunderstanding: misunderstand,
    hiddenTruth: hidden,
    conservationStatus: cons,
    typicalLifespan: pick(sp.slug, ["12–20 keeper-years", "18–30 keeper-years", "decades with deep care"], "life"),
    typicalSize: size,
    movementStyle: move,
    signatureSound: pick(sp.slug, ["soft chuff", "glasslike chime", "low gear-tick", "reed whistle", "ember crackle-purr"], "sound"),
    signatureScent: voice.element,
    commonPersonalityTendencies: [sp.temperament, pick(sp.slug, ["Curious", "Loyal", "Watchful"], "tend")],
    rarePersonalityTendencies: pickN(sp.slug, ["Melancholic", "Heroic", "Unpredictable", "Ceremonial"], 2, "rareTend"),
    naturalTalents: [trait, ability, pick(sp.slug, ["pathfinding", "comforting", "scouting", "mending"], "talent")],
    naturalWeaknesses: pickN(sp.slug, ["overstimulation", "prolonged isolation", "affinity drought", "sudden betrayal of routine"], 2, "weak"),
    explorationAbilities: pickN(sp.slug, ["short-range scent mapping", "ledge sense", "weather sniffing", "echo location of hollows"], 2, "explore"),
    battleTendencies: pick(sp.slug, ["Protective bursts", "Clever disruption", "Enduring defense", "Swift harassment", "Supportive pulses"], "bat"),
    evolutionPhilosophy: `Evolution clarifies lived experience; it should not erase the hatchling’s habits or the keeper’s shared memories.`,
    breedingBehavior: `Pairs form after extended trust; eggs are guarded jointly and prefer ${sp.habitat}-like incubation climates.`,
    eggAppearance: `${pick(sp.slug, ["Glazed", "Veined", "Frosted", "Copper-laced", "Tideglass"], "eggAdj")} shell with ${sp.affinity.toLowerCase()} light in thin rivers.`,
    hatchBehavior: `Hatches toward trusted warmth; first orientation is sound, then scent, then sight.`,
    youngStageBehavior: `Clumsy sincerity, intense imitation, and sudden naps mid-discovery.`,
    adultStageBehavior: `Specialist of place; teaches younger pets by demonstration and soft correction.`,
    evolvedStageBehavior: `Instincts sharpen; childhood habits remain as signature quirks rather than vanishing.`,
    liveWorldHabits: `Loops favorite overlooks in ${sp.habitat}, greets known keepers, and checks egg-like objects twice.`,
    marketplaceCollectorNote: `Value care history and temperament fit over glitter cosmetics. ${sp.name} companionship is not a financial promise.`,
    storyHooks: [
      `A shell sigil matching a sealed door in ${sp.habitat}`,
      `A dream of ${voice.noun} leading to a quiet vault`,
      `A rivalry with ${rivals[0]} over a nesting overlook`,
    ],
    regionQuestHooks: [
      `Map calm pockets in ${sp.habitat} where ${sp.name} eggs still appear`,
      `Restore a travel-stone carving of a ${sp.name} along an old caravan road`,
    ],
    petQuestPossibilities: [
      `Return to the eggplace scent`,
      `Practice ${ability} as a comfort drill rather than combat`,
      `Meet an ally ${allies[0]} and share forage`,
    ],
    historicalTimeline: [
      { era: "First Fractures", event: `Proto-${sp.name} nests recorded in ${sp.habitat}` },
      { era: "Caravan Age", event: `Travel stones carved with ${sp.name} guides` },
      { era: "Hatchery Compact", event: `${sp.name} care cycles standardized without erasing wild etiquette` },
      { era: "Present", event: `Live World populations mingle with keeper companions` },
    ],
    myths: [legend, `Some say ${plural(sp.name)} can smell lies as sour ${voice.element}.`],
    spoilerHiddenTruth: true,
    status: "COMPLETE" as const,
    version: 1,
  };
}

function toTsModule(lore: ReturnType<typeof buildLore>): string {
  return `import type { SpeciesLore } from "@/lib/pets/lore-types";

/** Auto-authored launch lore for ${lore.name}. Original Riftwilds IP. */
const lore: SpeciesLore = ${JSON.stringify(lore, null, 2)};

export default lore;
`;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const all = LAUNCH_SPECIES;
  const slugs: string[] = [];
  const report: { slug: string; short: number; standard: number; full: number }[] = [];

  for (const sp of all) {
    const lore = buildLore(sp, all);
    const short = words(lore.shortBio);
    const standard = words(lore.standardBio);
    const full = words(lore.fullLore);
    report.push({ slug: sp.slug, short, standard, full });
    writeFileSync(path.join(OUT_DIR, `${sp.slug}.ts`), toTsModule(lore), "utf8");
    slugs.push(sp.slug);
  }

  const index = `import type { SpeciesLore } from "@/lib/pets/lore-types";
${slugs.map((s) => `import ${camel(s)} from "./${s}";`).join("\n")}

function camel(s: string) { return s; }

export const SPECIES_LORE_BY_SLUG: Record<string, SpeciesLore> = {
${slugs.map((s) => `  "${s}": ${camel(s)},`).join("\n")}
};

export function getSpeciesLore(slug: string): SpeciesLore | undefined {
  return SPECIES_LORE_BY_SLUG[slug];
}

export function listSpeciesLore(): SpeciesLore[] {
  return Object.values(SPECIES_LORE_BY_SLUG);
}

export const SPECIES_LORE_SLUGS = ${JSON.stringify(slugs, null, 2)} as const;
`;

  // Fix index - can't use a fake camel function like that. Write proper imports.
  const indexProper = `import type { SpeciesLore } from "@/lib/pets/lore-types";
${slugs.map((s) => `import lore_${s.replace(/-/g, "_")} from "./${s}";`).join("\n")}

export const SPECIES_LORE_BY_SLUG: Record<string, SpeciesLore> = {
${slugs.map((s) => `  "${s}": lore_${s.replace(/-/g, "_")},`).join("\n")}
};

export function getSpeciesLore(slug: string): SpeciesLore | undefined {
  return SPECIES_LORE_BY_SLUG[slug];
}

export function listSpeciesLore(): SpeciesLore[] {
  return Object.values(SPECIES_LORE_BY_SLUG);
}

export const SPECIES_LORE_SLUGS = ${JSON.stringify(slugs, null, 2)} as const;
`;

  writeFileSync(path.join(OUT_DIR, "index.ts"), indexProper, "utf8");

  console.log(`Wrote ${slugs.length} species lore files to ${OUT_DIR}`);
  for (const r of report) {
    const ok =
      r.short >= 40 &&
      r.short <= 70 &&
      r.standard >= 150 &&
      r.standard <= 250 &&
      r.full >= 450;
    console.log(
      `${ok ? "OK" : "!!"} ${r.slug}: short=${r.short} standard=${r.standard} full=${r.full}`,
    );
  }
}

function camel(_s: string) {
  return _s;
}

main();
