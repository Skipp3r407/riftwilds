/**
 * Pet care economy catalog — Credit costs, catalogs, streaks, XP, need copy.
 * Basic care is Credits-only (never SOL). Adventure spends energy, not Credits.
 */

import type { CareAction, CareStats } from "@/game/creatures/care";
export {
  CARE_DISCOVERY_BONUS_CAP,
  CARE_STRESS_PENALTY_CAP,
} from "@/game/creatures/care";

export type CareStatDelta = Partial<Record<keyof CareStats, number>>;

export type CareActionDef = {
  action: CareAction;
  label: string;
  description: string;
  /** Integer Credits; 0 = free. */
  creditCost: number;
  /** Energy spent (Adventure etc.). */
  energyCost: number;
  cooldownMs: number;
  /** Approximate duration label for tooltips. */
  durationLabel: string;
  /** Expected deltas for preview tooltips (display only; engine may clamp). */
  expectedDeltas: CareStatDelta;
  /** Care XP granted on success. */
  careXp: number;
  /** Animation key for CSS particles. */
  animation: "feed" | "play" | "clean" | "sleep" | "heal" | "bond" | "train" | "none";
  /** SFX event id suffix under pets.* */
  sfx: "care" | "feed" | "play" | "clean" | "sleep" | "heal" | "bond";
  category: "basic" | "bond" | "training" | "medical" | "adventure" | "lifestyle";
};

/** Canonical player-facing action definitions with Credits sinks. */
export const CARE_ACTION_DEFS: Record<CareAction, CareActionDef> = {
  PET: {
    action: "PET",
    label: "Pet",
    description: "A gentle free affection — no Credits required.",
    creditCost: 0,
    energyCost: 0,
    cooldownMs: 8_000,
    durationLabel: "instant",
    expectedDeltas: { happiness: 8, bond: 4, stress: -5 },
    careXp: 4,
    animation: "bond",
    sfx: "bond",
    category: "bond",
  },
  REST: {
    action: "REST",
    label: "Rest",
    description: "Free downtime to recover energy.",
    creditCost: 0,
    energyCost: 0,
    cooldownMs: 20_000,
    durationLabel: "2 min",
    expectedDeltas: { energy: 35, health: 5, stress: -10 },
    careXp: 6,
    animation: "sleep",
    sfx: "sleep",
    category: "basic",
  },
  SLEEP: {
    action: "SLEEP",
    label: "Sleep",
    description: "Deep free rest — bigger energy recovery.",
    creditCost: 0,
    energyCost: 0,
    cooldownMs: 45_000,
    durationLabel: "5 min",
    expectedDeltas: { energy: 50, health: 8, stress: -18, happiness: 4 },
    careXp: 10,
    animation: "sleep",
    sfx: "sleep",
    category: "basic",
  },
  GIVE_WATER: {
    action: "GIVE_WATER",
    label: "Water",
    description: "Fresh sip to quench thirst.",
    creditCost: 20,
    energyCost: 0,
    cooldownMs: 12_000,
    durationLabel: "instant",
    expectedDeltas: { thirst: 32, happiness: 2, stress: -3 },
    careXp: 5,
    animation: "feed",
    sfx: "feed",
    category: "basic",
  },
  FEED: {
    action: "FEED",
    label: "Feed",
    description: "A simple meal for hunger.",
    creditCost: 35,
    energyCost: 0,
    cooldownMs: 15_000,
    durationLabel: "instant",
    expectedDeltas: { hunger: 28, happiness: 4, stress: -4 },
    careXp: 8,
    animation: "feed",
    sfx: "feed",
    category: "basic",
  },
  BRUSH: {
    action: "BRUSH",
    label: "Brush",
    description: "Soft brushing for coat and calm.",
    creditCost: 30,
    energyCost: 0,
    cooldownMs: 18_000,
    durationLabel: "30s",
    expectedDeltas: { hygiene: 18, happiness: 10, bond: 5, stress: -8 },
    careXp: 7,
    animation: "clean",
    sfx: "clean",
    category: "basic",
  },
  PLAY: {
    action: "PLAY",
    label: "Play",
    description: "Active play session — burns some energy.",
    creditCost: 40,
    energyCost: 0,
    cooldownMs: 20_000,
    durationLabel: "1 min",
    expectedDeltas: { happiness: 22, energy: -10, bond: 6, stress: -8 },
    careXp: 10,
    animation: "play",
    sfx: "play",
    category: "bond",
  },
  WALK: {
    action: "WALK",
    label: "Walk",
    description: "A short stroll to stretch legs and bond.",
    creditCost: 35,
    energyCost: 0,
    cooldownMs: 25_000,
    durationLabel: "2 min",
    expectedDeltas: { happiness: 14, energy: -8, bond: 8, stress: -10, hygiene: -4 },
    careXp: 9,
    animation: "play",
    sfx: "play",
    category: "bond",
  },
  CLEAN: {
    action: "CLEAN",
    label: "Clean",
    description: "Bath and nest tidy-up.",
    creditCost: 45,
    energyCost: 0,
    cooldownMs: 22_000,
    durationLabel: "1 min",
    expectedDeltas: { hygiene: 30, happiness: 3, stress: -5 },
    careXp: 8,
    animation: "clean",
    sfx: "clean",
    category: "basic",
  },
  GROOM: {
    action: "GROOM",
    label: "Groom",
    description: "Full grooming — hygiene and pride.",
    creditCost: 70,
    energyCost: 0,
    cooldownMs: 35_000,
    durationLabel: "2 min",
    expectedDeltas: { hygiene: 40, happiness: 12, bond: 6, stress: -10 },
    careXp: 12,
    animation: "clean",
    sfx: "clean",
    category: "lifestyle",
  },
  TRAIN: {
    action: "TRAIN",
    label: "Train",
    description: "Focused training — tiring but bonding.",
    creditCost: 55,
    energyCost: 0,
    cooldownMs: 30_000,
    durationLabel: "3 min",
    expectedDeltas: { energy: -15, happiness: 8, bond: 4, stress: 5 },
    careXp: 14,
    animation: "train",
    sfx: "care",
    category: "training",
  },
  EXERCISE: {
    action: "EXERCISE",
    label: "Exercise",
    description: "Vigorous workout for stamina.",
    creditCost: 50,
    energyCost: 0,
    cooldownMs: 28_000,
    durationLabel: "3 min",
    expectedDeltas: { energy: -20, happiness: 10, health: 6, stress: 4, hunger: -6 },
    careXp: 12,
    animation: "train",
    sfx: "care",
    category: "training",
  },
  LEARN_TRICK: {
    action: "LEARN_TRICK",
    label: "Learn Trick",
    description: "Teach a small trick — curiosity and bond.",
    creditCost: 65,
    energyCost: 0,
    cooldownMs: 40_000,
    durationLabel: "4 min",
    expectedDeltas: { energy: -12, happiness: 14, bond: 10, stress: 3 },
    careXp: 16,
    animation: "train",
    sfx: "care",
    category: "training",
  },
  COOK_MEAL: {
    action: "COOK_MEAL",
    label: "Cook Meal",
    description: "Home-cooked feast — hunger and happiness.",
    creditCost: 80,
    energyCost: 0,
    cooldownMs: 35_000,
    durationLabel: "2 min",
    expectedDeltas: { hunger: 42, happiness: 14, bond: 6, stress: -8, thirst: -4 },
    careXp: 14,
    animation: "feed",
    sfx: "feed",
    category: "lifestyle",
  },
  TREAT: {
    action: "TREAT",
    label: "Treat",
    description: "A special snack for joy.",
    creditCost: 45,
    energyCost: 0,
    cooldownMs: 18_000,
    durationLabel: "instant",
    expectedDeltas: { hunger: 12, happiness: 18, bond: 5, stress: -6 },
    careXp: 8,
    animation: "feed",
    sfx: "feed",
    category: "lifestyle",
  },
  MEDITATE: {
    action: "MEDITATE",
    label: "Meditate",
    description: "Quiet focus to ease stress.",
    creditCost: 40,
    energyCost: 0,
    cooldownMs: 30_000,
    durationLabel: "3 min",
    expectedDeltas: { stress: -22, happiness: 8, bond: 4, energy: 6 },
    careXp: 10,
    animation: "bond",
    sfx: "bond",
    category: "bond",
  },
  SOCIALIZE: {
    action: "SOCIALIZE",
    label: "Socialize",
    description: "Meet other Riftlings — happiness boost.",
    creditCost: 50,
    energyCost: 0,
    cooldownMs: 35_000,
    durationLabel: "3 min",
    expectedDeltas: { happiness: 20, bond: 6, energy: -6, stress: -4 },
    careXp: 11,
    animation: "play",
    sfx: "play",
    category: "lifestyle",
  },
  DECORATE: {
    action: "DECORATE",
    label: "Decorate",
    description: "Nest décor for comfort and pride.",
    creditCost: 60,
    energyCost: 0,
    cooldownMs: 40_000,
    durationLabel: "2 min",
    expectedDeltas: { happiness: 16, stress: -12, bond: 3 },
    careXp: 10,
    animation: "bond",
    sfx: "bond",
    category: "lifestyle",
  },
  ENCOURAGE: {
    action: "ENCOURAGE",
    label: "Encourage",
    description: "Warm words that deepen the bond.",
    creditCost: 25,
    energyCost: 0,
    cooldownMs: 15_000,
    durationLabel: "instant",
    expectedDeltas: { happiness: 12, bond: 10, stress: -8 },
    careXp: 7,
    animation: "bond",
    sfx: "bond",
    category: "bond",
  },
  HEAL: {
    action: "HEAL",
    label: "Heal",
    description: "Basic field healing.",
    creditCost: 80,
    energyCost: 0,
    cooldownMs: 30_000,
    durationLabel: "1 min",
    expectedDeltas: { health: 25, stress: -6 },
    careXp: 12,
    animation: "heal",
    sfx: "heal",
    category: "medical",
  },
  MEDICINE: {
    action: "MEDICINE",
    label: "Medicine",
    description: "Potent tonic for illness.",
    creditCost: 120,
    energyCost: 0,
    cooldownMs: 45_000,
    durationLabel: "2 min",
    expectedDeltas: { health: 40, stress: -12, happiness: 4 },
    careXp: 16,
    animation: "heal",
    sfx: "heal",
    category: "medical",
  },
  VET: {
    action: "VET",
    label: "Vet",
    description: "Clinic visit — thorough recovery.",
    creditCost: 150,
    energyCost: 0,
    cooldownMs: 60_000,
    durationLabel: "4 min",
    expectedDeltas: { health: 45, stress: -16, happiness: 6, energy: 10 },
    careXp: 18,
    animation: "heal",
    sfx: "heal",
    category: "medical",
  },
  RECOVERY_CENTER: {
    action: "RECOVERY_CENTER",
    label: "Recovery",
    description: "Full recovery suite for critical pets.",
    creditCost: 200,
    energyCost: 0,
    cooldownMs: 90_000,
    durationLabel: "5 min",
    expectedDeltas: {
      hunger: 20,
      thirst: 20,
      hygiene: 20,
      energy: 25,
      health: 30,
      stress: -20,
    },
    careXp: 22,
    animation: "heal",
    sfx: "heal",
    category: "medical",
  },
  ADVENTURE: {
    action: "ADVENTURE",
    label: "Adventure",
    description: "Explore nearby — costs energy, not Credits.",
    creditCost: 0,
    energyCost: 18,
    cooldownMs: 50_000,
    durationLabel: "4 min",
    expectedDeltas: {
      energy: -18,
      happiness: 16,
      bond: 8,
      hunger: -8,
      thirst: -6,
      stress: -4,
      hygiene: -6,
    },
    careXp: 15,
    animation: "play",
    sfx: "play",
    category: "adventure",
  },
  GIVE_ITEM: {
    action: "GIVE_ITEM",
    label: "Give Item",
    description: "Use an inventory care item.",
    creditCost: 0,
    energyCost: 0,
    cooldownMs: 5_000,
    durationLabel: "instant",
    expectedDeltas: { happiness: 10, bond: 5 },
    careXp: 6,
    animation: "feed",
    sfx: "feed",
    category: "basic",
  },
};

export const CARE_ACTION_LIST = Object.values(CARE_ACTION_DEFS);

export const CARE_ACTIONS = Object.keys(CARE_ACTION_DEFS) as CareAction[];

/** Food / drink / tonic catalogs with shop + craft hooks. */
export type CareCatalogItem = {
  id: string;
  name: string;
  kind: "berry" | "meal" | "water" | "tonic" | "toy" | "accessory" | "medicine";
  description: string;
  /** Shop price in Credits (integer). */
  shopPriceCredits: number;
  /** Crafting station recipe hook (null = shop-only). */
  craftRecipeId: string | null;
  /** Maps to care action when used from inventory. */
  useAction: CareAction;
  effects: CareStatDelta;
  rarity: "common" | "uncommon" | "rare" | "epic";
};

export const CARE_FOOD_CATALOG: CareCatalogItem[] = [
  {
    id: "basic-pet-meal",
    name: "Basic Pet Meal",
    kind: "meal",
    description:
      "Inventory Food — restores hunger, small bond, and care XP. Not a combat spell.",
    shopPriceCredits: 35,
    craftRecipeId: null,
    useAction: "FEED",
    effects: { hunger: 25, happiness: 5, bond: 3 },
    rarity: "common",
  },
  {
    id: "premium-pet-meal",
    name: "Premium Pet Meal",
    kind: "meal",
    description: "Larger Inventory Food meal for hunger and happiness.",
    shopPriceCredits: 80,
    craftRecipeId: null,
    useAction: "FEED",
    effects: { hunger: 40, happiness: 15, bond: 5 },
    rarity: "uncommon",
  },
  {
    id: "riftberry",
    name: "Riftberry",
    kind: "berry",
    description: "Sweet wild berry — light snack.",
    shopPriceCredits: 25,
    craftRecipeId: null,
    useAction: "TREAT",
    effects: { hunger: 12, happiness: 10 },
    rarity: "common",
  },
  {
    id: "glowberry-cluster",
    name: "Glowberry Cluster",
    kind: "berry",
    description: "Luminous berries that cheer a tired companion.",
    shopPriceCredits: 55,
    craftRecipeId: "craft_glowberry_cluster",
    useAction: "TREAT",
    effects: { hunger: 16, happiness: 16, stress: -6 },
    rarity: "uncommon",
  },
  {
    id: "basic-meal",
    name: "Basic Meal",
    kind: "meal",
    description: "Reliable camp meal.",
    shopPriceCredits: 50,
    craftRecipeId: "craft_basic_meal",
    useAction: "FEED",
    effects: { hunger: 28, happiness: 4 },
    rarity: "common",
  },
  {
    id: "premium-meal",
    name: "Premium Meal",
    kind: "meal",
    description: "Hearty feast with comfort spices.",
    shopPriceCredits: 120,
    craftRecipeId: "craft_premium_meal",
    useAction: "COOK_MEAL",
    effects: { hunger: 42, happiness: 14, bond: 6 },
    rarity: "uncommon",
  },
  {
    id: "hearth-stew",
    name: "Hearth Stew",
    kind: "meal",
    description: "Slow-cooked stew — craftable at campfire.",
    shopPriceCredits: 95,
    craftRecipeId: "craft_hearth_stew",
    useAction: "COOK_MEAL",
    effects: { hunger: 38, happiness: 12, stress: -8 },
    rarity: "uncommon",
  },
];

export const CARE_DRINK_CATALOG: CareCatalogItem[] = [
  {
    id: "fresh-water",
    name: "Fresh Water",
    kind: "water",
    description: "Clean spring water.",
    shopPriceCredits: 20,
    craftRecipeId: null,
    useAction: "GIVE_WATER",
    effects: { thirst: 32, happiness: 2 },
    rarity: "common",
  },
  {
    id: "mineral-spring",
    name: "Mineral Spring Flask",
    kind: "water",
    description: "Mineral-rich water with a calm aftertaste.",
    shopPriceCredits: 45,
    craftRecipeId: "craft_mineral_flask",
    useAction: "GIVE_WATER",
    effects: { thirst: 40, stress: -6, health: 4 },
    rarity: "uncommon",
  },
  {
    id: "calm-tonic",
    name: "Calm Tonic",
    kind: "tonic",
    description: "Herbal tonic that eases stress.",
    shopPriceCredits: 75,
    craftRecipeId: "craft_calm_tonic",
    useAction: "MEDITATE",
    effects: { stress: -20, happiness: 8 },
    rarity: "uncommon",
  },
  {
    id: "vitality-tonic",
    name: "Vitality Tonic",
    kind: "tonic",
    description: "Restorative brew for weary Riftlings.",
    shopPriceCredits: 110,
    craftRecipeId: "craft_vitality_tonic",
    useAction: "HEAL",
    effects: { health: 22, energy: 12, stress: -8 },
    rarity: "rare",
  },
];

export const CARE_ITEM_CATALOG: CareCatalogItem[] = [
  ...CARE_FOOD_CATALOG,
  ...CARE_DRINK_CATALOG,
  {
    id: "cleaning-kit",
    name: "Cleaning Kit",
    kind: "accessory",
    description: "Soap, brush, and nest cloths.",
    shopPriceCredits: 60,
    craftRecipeId: "craft_cleaning_kit",
    useAction: "CLEAN",
    effects: { hygiene: 30 },
    rarity: "common",
  },
  {
    id: "rift-toy",
    name: "Rift Toy",
    kind: "toy",
    description: "Squeaky toy for playtime.",
    shopPriceCredits: 90,
    craftRecipeId: null,
    useAction: "PLAY",
    effects: { happiness: 22, bond: 6 },
    rarity: "uncommon",
  },
  {
    id: "field-medicine",
    name: "Field Medicine",
    kind: "medicine",
    description: "Pocket medicine kit.",
    shopPriceCredits: 150,
    craftRecipeId: "craft_field_medicine",
    useAction: "MEDICINE",
    effects: { health: 40, stress: -12 },
    rarity: "rare",
  },
  {
    id: "dreamnest-charm",
    name: "Dreamnest Charm",
    kind: "accessory",
    description: "Nest charm that deepens rest.",
    shopPriceCredits: 110,
    craftRecipeId: "craft_dreamnest_charm",
    useAction: "SLEEP",
    effects: { energy: 20, stress: -10 },
    rarity: "uncommon",
  },
  {
    id: "ripple-ball",
    name: "Ripple Ball",
    kind: "toy",
    description: "Bouncy tide toy with soft ripple trails.",
    shopPriceCredits: 85,
    craftRecipeId: null,
    useAction: "PLAY",
    effects: { happiness: 24, bond: 5, energy: -6 },
    rarity: "common",
  },
  {
    id: "whisper-bell",
    name: "Whisper Bell",
    kind: "toy",
    description: "Tiny spirit bell for gentle play.",
    shopPriceCredits: 100,
    craftRecipeId: "craft_whisper_bell",
    useAction: "PLAY",
    effects: { happiness: 20, bond: 10, stress: -6 },
    rarity: "uncommon",
  },
  {
    id: "moss-chew-stick",
    name: "Moss Chew Stick",
    kind: "toy",
    description: "Glowmoss stick for chewing and calm.",
    shopPriceCredits: 70,
    craftRecipeId: "craft_moss_chew",
    useAction: "PLAY",
    effects: { happiness: 16, hygiene: 4, stress: -4 },
    rarity: "common",
  },
  {
    id: "aurora-ribbon",
    name: "Aurora Ribbon",
    kind: "accessory",
    description: "Shimmer ribbon worn during bonding.",
    shopPriceCredits: 140,
    craftRecipeId: "craft_aurora_ribbon",
    useAction: "PET",
    effects: { bond: 14, happiness: 12, stress: -8 },
    rarity: "rare",
  },
  {
    id: "nest-fluff",
    name: "Nest Fluff",
    kind: "accessory",
    description: "Extra fluff for nest pillows.",
    shopPriceCredits: 95,
    craftRecipeId: "craft_nest_fluff",
    useAction: "SLEEP",
    effects: { energy: 22, happiness: 10, stress: -8 },
    rarity: "uncommon",
  },
  {
    id: "grooming-comb",
    name: "Grooming Comb",
    kind: "accessory",
    description: "Fine comb for coat and calm.",
    shopPriceCredits: 65,
    craftRecipeId: null,
    useAction: "BRUSH",
    effects: { hygiene: 28, happiness: 8, bond: 4 },
    rarity: "common",
  },
];

export function getCareCatalogItem(id: string): CareCatalogItem | undefined {
  return CARE_ITEM_CATALOG.find((item) => item.id === id);
}

/** Streak milestones — titles / cosmetics / badges only (never unlimited Credits). */
export type CareStreakMilestone = {
  days: number;
  title: string;
  badgeId: string;
  cosmeticId: string;
  description: string;
};

export const CARE_STREAK_MILESTONES: CareStreakMilestone[] = [
  {
    days: 7,
    title: "Steady Keeper",
    badgeId: "care_streak_7",
    cosmeticId: "aura_soft_moss",
    description: "Seven days of care — a soft moss aura.",
  },
  {
    days: 14,
    title: "Devoted Companion",
    badgeId: "care_streak_14",
    cosmeticId: "collar_woven_vine",
    description: "Two weeks — woven vine collar cosmetic.",
  },
  {
    days: 30,
    title: "Nest Guardian",
    badgeId: "care_streak_30",
    cosmeticId: "nest_lantern_glow",
    description: "A month of devotion — nest lantern glow.",
  },
  {
    days: 90,
    title: "Bondweaver",
    badgeId: "care_streak_90",
    cosmeticId: "trail_starlit_paw",
    description: "Ninety days — starlit paw trail.",
  },
  {
    days: 365,
    title: "Lifetime Ally",
    badgeId: "care_streak_365",
    cosmeticId: "crown_evercare",
    description: "A full year — Evercare crown cosmetic.",
  },
];

export function streakMilestoneFor(days: number): CareStreakMilestone | null {
  let found: CareStreakMilestone | null = null;
  for (const m of CARE_STREAK_MILESTONES) {
    if (days >= m.days) found = m;
  }
  return found;
}

export function newlyReachedMilestones(
  prevDays: number,
  nextDays: number,
): CareStreakMilestone[] {
  return CARE_STREAK_MILESTONES.filter((m) => prevDays < m.days && nextDays >= m.days);
}

export type CareJournalEntry = {
  id: string;
  at: string;
  action: CareAction;
  label: string;
  creditCost: number;
  careXpGained: number;
  note: string;
  deltas?: CareStatDelta;
};

export type PetInventorySlot = {
  itemId: string;
  qty: number;
};

export type PetCareProgress = {
  careXp: number;
  careLevel: number;
  careStreak: number;
  longestCareStreak: number;
  lastCareDayKey: string | null;
  titles: string[];
  badges: string[];
  cosmetics: string[];
  journal: CareJournalEntry[];
  inventory: PetInventorySlot[];
  /** action → last success epoch ms */
  cooldowns: Partial<Record<CareAction, number>>;
};

export const DEFAULT_CARE_PROGRESS: PetCareProgress = {
  careXp: 0,
  careLevel: 1,
  careStreak: 0,
  longestCareStreak: 0,
  lastCareDayKey: null,
  titles: [],
  badges: [],
  cosmetics: [],
  journal: [],
  inventory: [
    { itemId: "basic-meal", qty: 5 },
    { itemId: "riftberry", qty: 2 },
    { itemId: "fresh-water", qty: 2 },
  ],
  cooldowns: {},
};

export function careLevelFromXp(xp: number): number {
  return Math.max(1, 1 + Math.floor(Math.max(0, xp) / 100));
}

export function utcDayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Advance streak if cared today after yesterday (or start streak). */
export function advanceCareStreak(
  progress: PetCareProgress,
  now = Date.now(),
): { progress: PetCareProgress; newMilestones: CareStreakMilestone[] } {
  const day = utcDayKey(now);
  if (progress.lastCareDayKey === day) {
    return { progress, newMilestones: [] };
  }
  const yesterday = utcDayKey(now - 24 * 60 * 60 * 1000);
  const nextStreak =
    progress.lastCareDayKey === yesterday ? progress.careStreak + 1 : 1;
  const newMilestones = newlyReachedMilestones(progress.careStreak, nextStreak);
  const titles = [...progress.titles];
  const badges = [...progress.badges];
  const cosmetics = [...progress.cosmetics];
  for (const m of newMilestones) {
    if (!titles.includes(m.title)) titles.push(m.title);
    if (!badges.includes(m.badgeId)) badges.push(m.badgeId);
    if (!cosmetics.includes(m.cosmeticId)) cosmetics.push(m.cosmeticId);
  }
  return {
    progress: {
      ...progress,
      careStreak: nextStreak,
      longestCareStreak: Math.max(progress.longestCareStreak, nextStreak),
      lastCareDayKey: day,
      titles,
      badges,
      cosmetics,
    },
    newMilestones,
  };
}

export type NeedMessage = {
  id: string;
  tone: "thirsty" | "hungry" | "tired" | "dirty" | "stressed" | "lonely" | "content";
  text: string;
};

/** Light AI-style need lines — caller must rate-limit. */
export function pickNeedMessage(stats: CareStats, petName: string): NeedMessage | null {
  if (stats.thirst < 28) {
    return {
      id: "need_thirst",
      tone: "thirsty",
      text: `${petName} glances at the water bowl… a little thirsty.`,
    };
  }
  if (stats.hunger < 28) {
    return {
      id: "need_hunger",
      tone: "hungry",
      text: `${petName}'s tummy rumbles. A snack would help.`,
    };
  }
  if (stats.energy < 28) {
    return {
      id: "need_tired",
      tone: "tired",
      text: `${petName} yawns wide — ready for a nap.`,
    };
  }
  if (stats.hygiene < 28) {
    return {
      id: "need_dirty",
      tone: "dirty",
      text: `${petName} looks a bit dusty. Time for a clean?`,
    };
  }
  if (stats.stress > 70) {
    return {
      id: "need_stress",
      tone: "stressed",
      text: `${petName} seems tense. Petting or meditation might help.`,
    };
  }
  if (stats.happiness < 35 || stats.bond < 25) {
    return {
      id: "need_lonely",
      tone: "lonely",
      text: `${petName} watches you hopefully — some attention would mean a lot.`,
    };
  }
  if (stats.happiness >= 80 && stats.bond >= 60) {
    return {
      id: "need_content",
      tone: "content",
      text: `${petName} looks content and ready for anything.`,
    };
  }
  return null;
}

export const NEED_MESSAGE_COOLDOWN_MS = 45_000;
