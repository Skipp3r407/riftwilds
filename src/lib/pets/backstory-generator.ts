/**
 * Deterministic personal biography generator for Riftlings.
 * Uses pet seed + approved templates — never LLM on page load.
 */

import {
  AFFINITY_THEME_TEMPLATES,
  BOND_STAGE_PARAGRAPHS,
  DREAM_TEMPLATES,
  FAMILY_STORY_TEMPLATES,
  FEAR_TEMPLATES,
  FIRST_MEMORY_TEMPLATES,
  HABIT_TEMPLATES,
  MYSTERY_TEMPLATES,
  ORIGIN_TEMPLATES,
  OWNER_BOND_TEMPLATES,
  RARITY_ORDER,
  RARITY_THEME_TEMPLATES,
  REGION_THEME_TEMPLATES,
  TALENT_TEMPLATES,
} from "@/content/pets/backstories";
import {
  BIOGRAPHY_GENERATOR_VERSION,
  type BackstoryGenerationInput,
  type PetBiography,
  type StoryTemplate,
} from "@/lib/pets/lore-types";
import { createSeededRng, fillTemplate, pickOne } from "@/lib/pets/seed-rng";

const RARITY_RANK: Record<string, number> = Object.fromEntries(
  RARITY_ORDER.map((r, i) => [r, i]),
);

function rarityOk(template: StoryTemplate, rarity: string): boolean {
  if (!template.minimumRarity) return true;
  const need = RARITY_RANK[template.minimumRarity.toUpperCase()] ?? 0;
  const have = RARITY_RANK[rarity.toUpperCase()] ?? 0;
  return have >= need;
}

function sourceTag(source: BackstoryGenerationInput["eggOriginSource"]): string {
  return source;
}

function filterTemplates(
  templates: StoryTemplate[],
  input: BackstoryGenerationInput,
  opts?: { requireBred?: boolean; forbidBred?: boolean },
): StoryTemplate[] {
  const affinity = input.affinity.toUpperCase();
  const region = input.nativeRegion;
  const temperament = input.temperament;
  const source = sourceTag(input.eggOriginSource);
  const isBred = source === "BREEDING";

  return templates.filter((t) => {
    if (opts?.requireBred && !t.tags?.includes("bred")) return false;
    if (opts?.forbidBred && t.tags?.includes("bred")) return false;
    if (t.incompatibleSources?.includes(source)) return false;
    if (t.compatibleAffinities?.length && !t.compatibleAffinities.map((a) => a.toUpperCase()).includes(affinity)) {
      return false;
    }
    if (t.compatibleRegions?.length && !t.compatibleRegions.includes(region)) {
      return false;
    }
    if (
      t.compatibleTemperaments?.length &&
      !t.compatibleTemperaments.includes(temperament)
    ) {
      return false;
    }
    if (!rarityOk(t, input.rarity)) return false;
    if (isBred && t.tags?.includes("shop")) return false;
    if (!isBred && t.tags?.includes("bred")) return false;
    if (source === "STARTER_CLAIM" && t.tags && !t.tags.includes("starter") && t.id !== "starter-hatchery") {
      // prefer starter-tagged when available; don't hard-fail others unless incompatible
    }
    if (source === "EVENT" && t.tags?.includes("shop")) return false;
    if (source === "SHOP" && t.tags?.includes("starter")) return false;
    return true;
  });
}

function pickTemplate(
  rng: () => number,
  templates: StoryTemplate[],
  input: BackstoryGenerationInput,
  opts?: { requireBred?: boolean; forbidBred?: boolean },
): StoryTemplate {
  const filtered = filterTemplates(templates, input, opts);
  const pool = filtered.length ? filtered : templates.filter((t) => !t.tags?.includes("bred") || input.eggOriginSource === "BREEDING");
  return pickOne(rng, pool.length ? pool : templates);
}

function temperamentFlavor(temperament: string): {
  activity: string;
  instinct: string;
  social: string;
  danger: string;
  strangers: string;
  otherPets: string;
  owner: string;
  victory: string;
  defeat: string;
  emotionalNeed: string;
  comfort: string;
  disliked: string;
  friendship: string;
  rivalry: string;
  signature: string;
  sleep: string;
  weather: string;
  toy: string;
} {
  const t = temperament.toLowerCase();
  const table: Record<string, ReturnType<typeof temperamentFlavor>> = {
    playful: {
      activity: "inventing tiny games with anything that rolls",
      instinct: "chase-and-share",
      social: "interrupts solemn moments with invitations to play",
      danger: "barks a warning then tries to turn threat into a chase away from friends",
      strangers: "sniffs first, then offers a toy as diplomacy",
      otherPets: "recruits them into games within minutes",
      owner: "circles excitedly, then settles only when acknowledged",
      victory: "celebrates with a victory lap and a shared treat ritual",
      defeat: "shakes it off quickly and invents a rematch game",
      emotionalNeed: "regular play and laughter",
      comfort: "a familiar toy placed near its bed",
      disliked: "rooms where nothing is allowed to move",
      friendship: "pets that will chase and be chased",
      rivalry: "playful contests that end in shared snacks",
      signature: "hides and reveals objects like a magician",
      sleep: "wherever the last game ended",
      weather: "bright breezy days",
      toy: "a rolling spark-ball",
    },
    curious: {
      activity: "investigating seams, drawers, and forbidden corners",
      instinct: "investigate-before-retreat",
      social: "asks questions with stares and gentle taps",
      danger: "freezes to gather information, then chooses a clever exit",
      strangers: "watches from cover until patterns make sense",
      otherPets: "studies their habits before joining",
      owner: "brings found objects as unfinished reports",
      victory: "catalogs what worked for next time",
      defeat: "replays the moment until a lesson appears",
      emotionalNeed: "new safe mysteries to explore",
      comfort: "being allowed to inspect a new room first",
      disliked: "locked boxes it is forbidden to open forever",
      friendship: "fellow explorers and careful archivists",
      rivalry: "competes over who finds the oddest clue",
      signature: "maps rooms with tiny scratch notes",
      sleep: "near windows and door thresholds",
      weather: "changing weather that brings new scents",
      toy: "a puzzle shell with shifting panels",
    },
    calm: {
      activity: "quiet observation beside water or warm stone",
      instinct: "steady the room",
      social: "offers presence more than noise",
      danger: "moves others to safety before confronting",
      strangers: "greets with measured stillness",
      otherPets: "becomes a resting place for nervous companions",
      owner: "matches breathing and waits without demand",
      victory: "nods once, then checks that everyone is whole",
      defeat: "absorbs the loss without spreading panic",
      emotionalNeed: "uninterrupted quiet hours",
      comfort: "shared silence and gentle grooming",
      disliked: "chaotic crowds with no exit path",
      friendship: "patient companions who understand stillness",
      rivalry: "rarely rivals; prefers measured contests",
      signature: "low hums that settle tense rooms",
      sleep: "near still water or warm masonry",
      weather: "mild overcast afternoons",
      toy: "a smooth worry-stone",
    },
    shy: {
      activity: "soft exploration from safe edges",
      instinct: "find cover, then peek",
      social: "bonds deeply with few",
      danger: "vanishes into cover and warns with a thin cry",
      strangers: "needs introduction through a trusted keeper",
      otherPets: "warms slowly, then becomes fiercely loyal",
      owner: "presses close and mirrors mood carefully",
      victory: "celebrates privately with its keeper",
      defeat: "seeks a hidden nest and quiet reassurance",
      emotionalNeed: "predictable routines and soft voices",
      comfort: "being wrapped in a familiar blanket scent",
      disliked: "loud plazas and sudden applause",
      friendship: "one or two gentle companions",
      rivalry: "avoids rivalry unless protecting its nest",
      signature: "sleeps in unlikely hidden alcoves",
      sleep: "under furniture or behind curtains of moss",
      weather: "gentle rain and mist",
      toy: "a soft lantern plush",
    },
    social: {
      activity: "greeting circles and shared meals",
      instinct: "include everyone",
      social: "treats strangers as friends-in-progress",
      danger: "herds friends together before facing threat",
      strangers: "offers an immediate friendly chirp",
      otherPets: "builds friend-groups like festivals",
      owner: "introduces them proudly to every new face",
      victory: "throws a tiny celebration for the whole party",
      defeat: "comforts others first, then itself",
      emotionalNeed: "company and conversation-like chirps",
      comfort: "group rest after adventures",
      disliked: "long isolation without news of friends",
      friendship: "almost any willing companion",
      rivalry: "turns rivalry into team practice",
      signature: "remembers every pet’s greeting sound",
      sleep: "in communal nests when allowed",
      weather: "festival-clear evenings",
      toy: "a shared toss-ring",
    },
    brave: {
      activity: "patrolling edges and testing new paths first",
      instinct: "stand between threat and friend",
      social: "leads with example rather than chatter",
      danger: "plants itself and refuses easy retreat",
      strangers: "evaluates threat level before warmth",
      otherPets: "takes the forward position on walks",
      owner: "walks slightly ahead on dangerous ground",
      victory: "stands tall, then checks the wounded",
      defeat: "learns the blow and returns sooner",
      emotionalNeed: "trust that courage is appreciated, not exploited",
      comfort: "a firm hand on the shoulder-plate",
      disliked: "being held back from helping",
      friendship: "loyal guardians and steady healers",
      rivalry: "honorable contests with clear rules",
      signature: "faces storms with ears forward",
      sleep: "near doorways and camp perimeters",
      weather: "dramatic skies before rain",
      toy: "a practice shield-disc",
    },
    mischievous: {
      activity: "harmless rearranging of belongings",
      instinct: "test limits with humor",
      social: "connects through tricks and shared laughs",
      danger: "creates distractions to help friends escape",
      strangers: "steals a hat-ribbon if trust is missing",
      otherPets: "recruits co-conspirators",
      owner: "hides keys then returns them with flair",
      victory: "smug little dance, then a gift of a found trinket",
      defeat: "blames the universe with theatrical flair",
      emotionalNeed: "an audience that understands jokes",
      comfort: "forgiveness after a prank",
      disliked: "humorless rules with no wiggle room",
      friendship: "fellow tricksters and patient adults",
      rivalry: "prank wars that never truly hurt",
      signature: "triggers harmless mechanisms for drama",
      sleep: "on shelves it was told to avoid",
      weather: "windy days that rattle shutters",
      toy: "a clicky gear-toy",
    },
    sleepy: {
      activity: "finding perfect nap geometry",
      instinct: "conserve, then burst",
      social: "affectionate in short warm waves",
      danger: "wakes fully in a sudden protective flurry",
      strangers: "opens one eye and postpones judgment",
      otherPets: "allows them to use its fluff as a pillow",
      owner: "follows to the softest available surface",
      victory: "celebrates with an immediate victory nap",
      defeat: "sleeps on the lesson until morning clarity",
      emotionalNeed: "uninterrupted rest and soft nesting",
      comfort: "being sung to at half-volume",
      disliked: "forced early mornings without snacks",
      friendship: "calm nappers and gentle guardians",
      rivalry: "rarely bothers; prefers dream contests",
      signature: "naps in improbable elevated places",
      sleep: "sunbeams, coat piles, and hatchery towels",
      weather: "drowsy warm drizzle",
      toy: "a weighted dream-cushion",
    },
    energetic: {
      activity: "racing, climbing, and training circuits",
      instinct: "burn energy into usefulness",
      social: "invites everyone into motion",
      danger: "charges to create space for retreat",
      strangers: "greets with zoomies that may overwhelm",
      otherPets: "turns walks into relays",
      owner: "bounces until a mission is assigned",
      victory: "immediate rematch energy",
      defeat: "channels frustration into sprint drills",
      emotionalNeed: "daily vigorous activity",
      comfort: "a long run followed by water",
      disliked: "tiny rooms with nowhere to leap",
      friendship: "fast friends and trainers",
      rivalry: "loves racing rivals",
      signature: "leaves spark trails when excited",
      sleep: "only after collapsing mid-play",
      weather: "electric pre-storm air",
      toy: "a bouncing charge-orb",
    },
    gentle: {
      activity: "comforting smaller creatures and tending nests",
      instinct: "heal and hold",
      social: "soft approaches and careful touches",
      danger: "shields others and seeks non-harm exits",
      strangers: "offers calm before trust is earned either way",
      otherPets: "mothers the anxious without smothering",
      owner: "leans in during hard days without demand",
      victory: "shares credit and snacks",
      defeat: "consoles the team as if the loss were weather",
      emotionalNeed: "kindness returned without spectacle",
      comfort: "slow grooming and warm food",
      disliked: "needless cruelty or loud threats",
      friendship: "the vulnerable and the kind",
      rivalry: "soft competition, quick forgiveness",
      signature: "tucks blankets around sleeping friends",
      sleep: "curled around smaller companions",
      weather: "mild golden evenings",
      toy: "a soft weave-ball",
    },
    protective: {
      activity: "watching over eggs, doors, and sleeping friends",
      instinct: "guard the circle",
      social: "warms after safety is established",
      danger: "intercepts first and asks later",
      strangers: "blocks approach until the keeper approves",
      otherPets: "assigns itself as night watch",
      owner: "positions itself between them and exits",
      victory: "checks the perimeter before celebrating",
      defeat: "doubles vigilance rather than sulking",
      emotionalNeed: "clear roles and trusted boundaries",
      comfort: "being thanked for guarding",
      disliked: "chaos that endangers nestlings",
      friendship: "loyal defenders and careful scouts",
      rivalry: "territorial but fair",
      signature: "three-circle patrol before sleep",
      sleep: "across thresholds",
      weather: "clear nights with long sightlines",
      toy: "a practice sentry-bell",
    },
    independent: {
      activity: "solo routes and personal routines",
      instinct: "self-directed problem solving",
      social: "chooses company; never begs it",
      danger: "escapes cleverly, returns on its own terms",
      strangers: "indifferent until usefulness is proven",
      otherPets: "tolerates, then selectively allies",
      owner: "walks beside, not behind—partnership of equals",
      victory: "quiet satisfaction, little display",
      defeat: "withdraws to recalibrate alone",
      emotionalNeed: "autonomy within a trusted bond",
      comfort: "space without abandonment",
      disliked: "micromanaged schedules",
      friendship: "other independents who respect silence",
      rivalry: "competes inwardly more than outwardly",
      signature: "vanishes for an hour and returns with a useful find",
      sleep: "high shelves and private alcoves",
      weather: "crisp solitary mornings",
      toy: "a self-winding curiosity cube",
    },
  };

  return (
    table[t] ?? {
      activity: "exploring with its keeper",
      instinct: "stay near trusted warmth",
      social: "learns the household’s tempo",
      danger: "alerts and seeks the safest path",
      strangers: "cautious until introduced",
      otherPets: "curious and polite",
      owner: "checks in often with soft sounds",
      victory: "shares a bright look of pride",
      defeat: "leans close for reassurance",
      emotionalNeed: "consistent care",
      comfort: "feeding and quiet praise",
      disliked: "harsh sudden noise",
      friendship: "kind companions",
      rivalry: "mild competitive spark",
      signature: "tilts its head when listening closely",
      sleep: "near its keeper’s belongings",
      weather: "mild days",
      toy: "a simple chase-ball",
    }
  );
}

function titleFor(input: BackstoryGenerationInput, rng: () => number): string {
  const titles = [
    `The ${input.temperament} ${input.speciesName}`,
    `${input.speciesName} of ${input.nativeRegion}`,
    `Shellborn ${input.speciesName}`,
    `${input.affinity}-Touched ${input.speciesName}`,
    `Keeper’s ${input.speciesName}`,
  ];
  if (input.founderStatus) titles.push(`Founder-Line ${input.speciesName}`);
  if (input.generation === 0) titles.push(`First-Gen ${input.speciesName}`);
  return pickOne(rng, titles);
}

export function generatePetBiography(input: BackstoryGenerationInput): PetBiography {
  const seed = [
    input.geneticsSeed,
    input.petPublicId,
    input.speciesSlug,
    input.affinity,
    input.rarity,
    input.temperament,
    input.eggOriginSource,
    String(input.generation),
    `v${BIOGRAPHY_GENERATOR_VERSION}`,
  ].join("|");

  const rng = createSeededRng(seed);
  const flavor = temperamentFlavor(input.temperament);
  const food = input.favoriteFoodHint ?? `${input.affinity} forage`;

  const isBred = input.eggOriginSource === "BREEDING";
  let originTpl = pickTemplate(rng, ORIGIN_TEMPLATES, input, {
    requireBred: isBred,
    forbidBred: !isBred,
  });
  // Extra safety: never allow wild discovery language for bred pets
  if (isBred && !originTpl.tags?.includes("bred")) {
    const bredOnly = ORIGIN_TEMPLATES.filter((t) => t.tags?.includes("bred"));
    originTpl = pickOne(rng, bredOnly);
  }

  const memoryTpl = pickTemplate(rng, FIRST_MEMORY_TEMPLATES, input);
  const habitTpl = pickTemplate(rng, HABIT_TEMPLATES, input);
  const fearTpl = pickTemplate(rng, FEAR_TEMPLATES, input);
  const talentTpl = pickTemplate(rng, TALENT_TEMPLATES, input);
  const dreamTpl = pickTemplate(rng, DREAM_TEMPLATES, input);
  const mysteryTpl = pickTemplate(rng, MYSTERY_TEMPLATES, input);
  const bondTpl = pickTemplate(rng, OWNER_BOND_TEMPLATES, input);
  const affinityTpl = pickTemplate(rng, AFFINITY_THEME_TEMPLATES, input);
  const regionTpl = pickTemplate(rng, REGION_THEME_TEMPLATES, input);

  const rarityPool = RARITY_THEME_TEMPLATES.filter(
    (t) => !t.tags?.length || t.tags.includes(input.rarity.toUpperCase()) || rarityOk(t, input.rarity),
  );
  const rarityTpl = pickOne(
    rng,
    rarityPool.length ? rarityPool : RARITY_THEME_TEMPLATES,
  );

  const vars: Record<string, string> = {
    region: input.nativeRegion,
    affinity: input.affinity,
    food,
    species: input.speciesName,
    temperament: input.temperament,
    parentA: input.parentLabels?.[0] ?? "one parent",
    parentB: input.parentLabels?.[1] ?? "the other parent",
    mutation: input.mutationTraits?.[0] ?? "an unexpected shimmer",
    generation: String(input.generation),
  };

  const originStory = fillTemplate(originTpl.text, vars);
  const firstMemory = fillTemplate(memoryTpl.text, vars);
  const uniqueHabit = fillTemplate(habitTpl.text, vars);
  const greatestFear = fillTemplate(fearTpl.text, vars);
  const hiddenTalent = fillTemplate(talentTpl.text, vars);
  const personalDream = fillTemplate(dreamTpl.text, vars);
  const mysteryClue = fillTemplate(mysteryTpl.text, vars);
  const bondStyle = fillTemplate(bondTpl.text, vars);

  let familyHistory: string | null = null;
  if (isBred) {
    const fam = pickTemplate(rng, FAMILY_STORY_TEMPLATES, input, { requireBred: true });
    familyHistory = fillTemplate(fam.text, vars);
    if (input.mutationTraits?.length) {
      const mut = FAMILY_STORY_TEMPLATES.find((t) => t.id === "mutation-soft");
      if (mut) familyHistory += " " + fillTemplate(mut.text, vars);
    }
  }

  const personalBio = [
    `${originStory}`,
    `Since hatching, this ${input.speciesName} has shown a ${input.temperament.toLowerCase()} temperament: ${flavor.signature}.`,
    fillTemplate(affinityTpl.text, vars),
    fillTemplate(regionTpl.text, vars),
    fillTemplate(rarityTpl.text, vars),
    `Its first memory was ${firstMemory.charAt(0).toLowerCase()}${firstMemory.slice(1)}`,
    `Unique habit: ${uniqueHabit}`,
    `It fears ${greatestFear.charAt(0).toLowerCase()}${greatestFear.slice(1)} yet dreams ${personalDream.charAt(0).toLowerCase()}${personalDream.slice(1)}`,
    bondStyle,
    BOND_STAGE_PARAGRAPHS.NEWLY_BONDED,
    familyHistory,
  ]
    .filter(Boolean)
    .join(" ");

  const questHook = `Investigate: ${mysteryClue}`;
  const personalQuestHooks = [
    {
      id: `quest-origin-${originTpl.id}`,
      title: "Return to the Eggplace",
      summary: `Visit the place tied to its origin: ${originStory}`,
      category: "ORIGIN",
    },
    {
      id: `quest-mystery-${mysteryTpl.id}`,
      title: "Shell Symbol Inquiry",
      summary: mysteryClue,
      category: "MYSTERY",
    },
    {
      id: `quest-fear-${fearTpl.id}`,
      title: "Face a Soft Fear",
      summary: `Gently confront its fear of ${greatestFear.charAt(0).toLowerCase()}${greatestFear.slice(1)} with its keeper’s support.`,
      category: "FEAR",
    },
    {
      id: `quest-talent-${talentTpl.id}`,
      title: "Awaken a Hidden Talent",
      summary: `Practice ${hiddenTalent.charAt(0).toLowerCase()}${hiddenTalent.slice(1)}`,
      category: "TALENT",
    },
    {
      id: `quest-dream-${dreamTpl.id}`,
      title: "Dreamtrail",
      summary: personalDream,
      category: "DREAM",
    },
  ];

  const mottos = [
    "Warmth shared is never wasted.",
    "Every shell remembers a sky.",
    "Walk beside, not above.",
    "Curiosity keeps the Rift honest.",
    "Quiet courage counts.",
    "Find the path, then leave it kinder.",
  ];

  return {
    version: 1,
    generatorVersion: BIOGRAPHY_GENERATOR_VERSION,
    title: titleFor(input, rng),
    personalBio,
    originStory,
    firstMemory,
    temperamentSummary: `A ${input.temperament.toLowerCase()} ${input.speciesName} whose days revolve around ${flavor.activity}.`,
    favoriteFood: food,
    favoriteActivity: flavor.activity,
    favoriteRegion: input.nativeRegion,
    favoriteWeather: flavor.weather,
    preferredSleepLocation: flavor.sleep,
    favoriteToy: flavor.toy,
    greatestFear,
    strongestInstinct: flavor.instinct,
    socialStyle: flavor.social,
    bondStyle,
    uniqueHabit,
    hiddenTalent,
    personalDream,
    motto: pickOne(rng, mottos),
    signatureBehavior: flavor.signature,
    mysteryClue,
    questHook,
    emotionalNeed: flavor.emotionalNeed,
    comfortAction: flavor.comfort,
    dislikedEnvironment: flavor.disliked,
    friendshipPreference: flavor.friendship,
    rivalryTendency: flavor.rivalry,
    reactionToDanger: flavor.danger,
    reactionToStrangers: flavor.strangers,
    reactionToOtherPets: flavor.otherPets,
    reactionToOwner: flavor.owner,
    reactionToVictory: flavor.victory,
    reactionToDefeat: flavor.defeat,
    eggOriginId: originTpl.id,
    firstMemoryId: memoryTpl.id,
    bondStage: "NEWLY_BONDED",
    familyHistory,
    personalQuestHooks,
    generationSeed: seed,
    generatedAt: input.hatchTimeIso ?? new Date().toISOString(),
    locked: false,
  };
}

/** Append evolution chapter without regenerating the base biography. */
export function appendEvolutionChapter(
  bio: PetBiography,
  affinity: string,
  chapterText: string,
): PetBiography {
  return {
    ...bio,
    version: bio.version + 1,
    personalBio: `${bio.personalBio}\n\nEvolution chapter: ${chapterText}`,
    personalDream: bio.personalDream,
    questHook: `${bio.questHook} After evolving, new instincts stir around ${affinity.toLowerCase()} resonance.`,
  };
}
