/**
 * Quest catalog for Riftwilds UI — mirrors the seed definitions in `prisma/seed.ts`,
 * enriched with difficulty, multi-step objectives, and display rewards (care / XP / Arena Points).
 * No guaranteed SOL profit language.
 */

import { QUEST_CATALOG_EXPANSION } from "./quest-catalog-expansion";
import { STARTER_QUEST_CHAIN } from "@/game/npcs/starter-quests";
import type {
  QuestBoardTab,
  QuestCategory,
  QuestDef,
  QuestDifficulty,
  QuestReward,
  QuestStatus,
} from "./quest-types";

export type {
  QuestBoardTab,
  QuestCategory,
  QuestDifficulty,
  QuestStatus,
  QuestReward,
  QuestObjectiveDef,
  QuestDef,
} from "./quest-types";

const REGION_NAMES: Record<string, string> = {
  "sproutfall-grove": "Sproutfall Grove",
  "cindercrag-basin": "Cindercrag Basin",
  "riftwild-commons": "Riftwild Commons",
  "ember-crater": "Ember Crater",
  "moonwater-coast": "Moonwater Coast",
  "elderwood-forest": "Elderwood Forest",
  "stormspire-peaks": "Stormspire Peaks",
  "stoneheart-canyon": "Stoneheart Canyon",
  "frostveil-basin": "Frostveil Basin",
  "radiant-citadel": "Radiant Citadel",
  "void-hollow": "Void Hollow",
  "alloy-ruins": "Alloy Ruins",
  "spirit-marsh": "Spirit Marsh",
  "celestial-rift": "Celestial Rift",
};

/** Seed-aligned catalog + expansion. */
const QUEST_CATALOG_SEED: QuestDef[] = [
  {
    key: "story-first-steps",
    name: "First Steps in the Grove",
    description: "Learn the basics of keeper life in Sproutfall Grove.",
    category: "STORY",
    boardTab: "story",
    difficulty: "easy",
    regionKey: "sproutfall-grove",
    regionName: REGION_NAMES["sproutfall-grove"],
    chainKey: "main",
    repeatable: false,
    objectives: [
      { key: "visit-grove", description: "Visit Sproutfall Grove", metric: "region_visit", target: 1 },
      { key: "meet-keeper", description: "Speak with the Grove Keeper", metric: "npc_talk", target: 1 },
      { key: "claim-starter-care", description: "Claim a starter care pack", metric: "item_claim", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 100 },
      { kind: "care_item", itemKey: "mossmeal", label: "Mossmeal", quantity: 3 },
    ],
    sortOrder: 10,
  },
  {
    key: "story-ember-call",
    name: "Ember's Call",
    description: "Venture into Cindercrag Basin.",
    category: "STORY",
    boardTab: "story",
    difficulty: "medium",
    regionKey: "cindercrag-basin",
    regionName: REGION_NAMES["cindercrag-basin"],
    chainKey: "main",
    repeatable: false,
    requires: ["story-first-steps"],
    objectives: [
      { key: "visit-basin", description: "Reach Cindercrag Basin", metric: "region_visit", target: 1 },
      { key: "scout-ember", description: "Scout an Ember landmark", metric: "landmark_discover", target: 1 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "emberberry", label: "Emberberry", quantity: 5 },
      { kind: "xp", amount: 150 },
    ],
    sortOrder: 20,
  },
  {
    key: "story-rift-compass",
    name: "Calibrated Path",
    description: "Obtain a Rift Compass.",
    category: "STORY",
    boardTab: "story",
    difficulty: "medium",
    chainKey: "main",
    repeatable: false,
    requires: ["story-ember-call"],
    objectives: [
      { key: "get-compass", description: "Own a Rift Compass", metric: "item_owned", target: 1 },
      { key: "calibrate", description: "Calibrate the compass once", metric: "compass_calibrate", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 175 },
      { kind: "arena_points", amount: 25 },
    ],
    sortOrder: 30,
  },
  {
    key: "daily-feed-riftling",
    name: "Daily Feeding",
    description: "Feed a Riftling once today.",
    category: "DAILY",
    boardTab: "daily",
    difficulty: "easy",
    repeatable: true,
    objectives: [
      { key: "feed-once", description: "Feed any Riftling", metric: "care_feed", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 50 },
      { kind: "care_item", itemKey: "basic-pet-meal", label: "Basic Pet Meal", quantity: 1 },
    ],
    sortOrder: 40,
  },
  {
    key: "daily-hygiene",
    name: "Sparkling Clean",
    description: "Perform hygiene care today.",
    category: "DAILY",
    boardTab: "daily",
    difficulty: "easy",
    repeatable: true,
    objectives: [
      { key: "hygiene-once", description: "Clean a Riftling", metric: "care_hygiene", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 50 },
      { kind: "care_item", itemKey: "spark-ribbon", label: "Spark Ribbon", quantity: 1 },
    ],
    sortOrder: 50,
  },
  {
    key: "daily-play-session",
    name: "Daily Check-In (Demo)",
    description: "Complete a demo play session.",
    category: "DAILY",
    boardTab: "daily",
    difficulty: "easy",
    repeatable: true,
    objectives: [
      { key: "demo-session", description: "Play a demo session", metric: "demo_session", target: 1 },
    ],
    rewards: [{ kind: "xp", amount: 25 }],
    sortOrder: 60,
  },
  {
    key: "weekly-hatch",
    name: "Weekly Hatchling",
    description: "Hatch an egg this week.",
    category: "WEEKLY",
    boardTab: "daily",
    difficulty: "medium",
    repeatable: true,
    objectives: [
      { key: "hatch-one", description: "Hatch 1 egg", metric: "hatch_count", target: 1 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "demo-snack-pack", label: "Demo Snack Pack", quantity: 1 },
      { kind: "xp", amount: 120 },
    ],
    sortOrder: 70,
  },
  {
    key: "weekly-bond",
    name: "Bond Builder",
    description: "Raise bond with a Riftling 5 times.",
    category: "WEEKLY",
    boardTab: "daily",
    difficulty: "medium",
    repeatable: true,
    objectives: [
      { key: "bond-five", description: "Bond actions ×5", metric: "care_bond", target: 5 },
    ],
    rewards: [
      { kind: "xp", amount: 200 },
      { kind: "care_item", itemKey: "dreamnest-cushion", label: "Dreamnest Cushion", quantity: 1 },
    ],
    sortOrder: 80,
  },
  {
    key: "explore-grove-trail",
    name: "Grove Trail Scout",
    description: "Discover grove landmarks.",
    category: "EXPLORATION",
    boardTab: "exploration",
    difficulty: "medium",
    regionKey: "sproutfall-grove",
    regionName: REGION_NAMES["sproutfall-grove"],
    repeatable: false,
    objectives: [
      { key: "discover-grove", description: "Discover 3 landmarks", metric: "landmark_discover", target: 3 },
      { key: "trail-mark", description: "Mark the trail on your map", metric: "map_mark", target: 1 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "rift-compass", label: "Rift Compass", quantity: 1 },
      { kind: "xp", amount: 180 },
    ],
    sortOrder: 90,
  },
  {
    key: "explore-basin-ridge",
    name: "Basin Ridge Walk",
    description: "Traverse the cindercrag ridge path.",
    category: "EXPLORATION",
    boardTab: "exploration",
    difficulty: "medium",
    regionKey: "cindercrag-basin",
    regionName: REGION_NAMES["cindercrag-basin"],
    repeatable: false,
    requires: ["story-ember-call"],
    objectives: [
      { key: "walk-ridge", description: "Complete the ridge path", metric: "path_complete", target: 1 },
      { key: "ember-sample", description: "Collect a heat sample", metric: "gather_heat", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 150 },
      { kind: "arena_points", amount: 40 },
    ],
    sortOrder: 100,
  },
  {
    key: "care-rest-cycle",
    name: "Rest Cycle",
    description: "Let a Riftling rest fully.",
    category: "CARE",
    boardTab: "daily",
    difficulty: "easy",
    repeatable: false,
    objectives: [
      { key: "rest-full", description: "Complete rest care", metric: "care_rest", target: 1 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "dreamnest-cushion", label: "Dreamnest Cushion", quantity: 1 },
      { kind: "xp", amount: 80 },
    ],
    sortOrder: 110,
  },
  {
    key: "care-happy-streak",
    name: "Happy Streak",
    description: "Keep happiness above 80 for 3 days.",
    category: "CARE",
    boardTab: "daily",
    difficulty: "hard",
    repeatable: false,
    objectives: [
      { key: "happy-streak", description: "3-day happiness streak", metric: "happiness_streak", target: 3 },
    ],
    rewards: [
      { kind: "xp", amount: 300 },
      { kind: "care_item", itemKey: "mossmeal", label: "Mossmeal", quantity: 8 },
    ],
    sortOrder: 120,
  },
  {
    key: "battle-training",
    name: "Training Grounds",
    description: "Complete a training session.",
    category: "BATTLE",
    boardTab: "exploration",
    difficulty: "easy",
    repeatable: false,
    objectives: [
      { key: "train-once", description: "Finish training", metric: "training_complete", target: 1 },
    ],
    rewards: [
      { kind: "arena_points", amount: 50 },
      { kind: "care_item", itemKey: "spark-ribbon", label: "Spark Ribbon", quantity: 1 },
      { kind: "xp", amount: 90 },
    ],
    sortOrder: 130,
  },
  {
    key: "battle-spar",
    name: "Friendly Spar",
    description: "Win a practice spar.",
    category: "BATTLE",
    boardTab: "exploration",
    difficulty: "medium",
    repeatable: false,
    requires: ["battle-training"],
    objectives: [
      { key: "spar-win", description: "Win 1 spar", metric: "spar_win", target: 1 },
    ],
    rewards: [
      { kind: "arena_points", amount: 80 },
      { kind: "xp", amount: 120 },
    ],
    sortOrder: 140,
  },
  {
    key: "collect-ember-species",
    name: "Ember Collector",
    description: "Own an Ember affinity Riftling.",
    category: "COLLECTION",
    boardTab: "exploration",
    difficulty: "medium",
    repeatable: false,
    objectives: [
      { key: "own-ember", description: "Own an Ember Riftling", metric: "species_affinity", target: 1 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "emberberry", label: "Emberberry", quantity: 10 },
      { kind: "xp", amount: 140 },
    ],
    sortOrder: 150,
  },
  {
    key: "collect-grove-species",
    name: "Grove Collector",
    description: "Own a Grove affinity Riftling.",
    category: "COLLECTION",
    boardTab: "exploration",
    difficulty: "medium",
    repeatable: false,
    objectives: [
      { key: "own-grove", description: "Own a Grove Riftling", metric: "species_affinity", target: 1 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "mossmeal", label: "Mossmeal", quantity: 10 },
      { kind: "xp", amount: 140 },
    ],
    sortOrder: 160,
  },
  {
    key: "collect-rare",
    name: "Rare Discovery",
    description: "Hatch a Rare or higher Riftling.",
    category: "COLLECTION",
    boardTab: "exploration",
    difficulty: "hard",
    repeatable: false,
    objectives: [
      { key: "hatch-rare", description: "Hatch Rare+", metric: "hatch_rarity", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 500 },
      { kind: "arena_points", amount: 100 },
    ],
    sortOrder: 170,
  },
  {
    key: "community-gather",
    name: "Community Gathering",
    description: "Participate in a community event.",
    category: "COMMUNITY",
    boardTab: "exploration",
    difficulty: "medium",
    repeatable: false,
    objectives: [
      { key: "event-participate", description: "Join a community event", metric: "event_participate", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 250 },
      { kind: "care_item", itemKey: "event-sparkler", label: "Event Sparkler", quantity: 1 },
    ],
    sortOrder: 180,
  },
  {
    key: "community-boss-hit",
    name: "Boss Strike",
    description: "Deal damage to the community boss.",
    category: "COMMUNITY",
    boardTab: "exploration",
    difficulty: "hard",
    repeatable: false,
    requires: ["community-gather"],
    objectives: [
      { key: "boss-damage", description: "Deal 100 boss damage", metric: "boss_damage", target: 100 },
    ],
    rewards: [
      { kind: "care_item", itemKey: "event-sparkler", label: "Event Sparkler", quantity: 1 },
      { kind: "arena_points", amount: 120 },
      { kind: "xp", amount: 220 },
    ],
    sortOrder: 190,
  },
  {
    key: "event-seasonal",
    name: "Season Opener",
    description: "Log in during the active season.",
    category: "EVENT",
    boardTab: "daily",
    difficulty: "easy",
    repeatable: false,
    objectives: [
      { key: "season-login", description: "Season login", metric: "season_login", target: 1 },
    ],
    rewards: [
      { kind: "xp", amount: 100 },
      { kind: "arena_points", amount: 15 },
    ],
    sortOrder: 200,
  },
];

/** Full board catalog (starter Live World chain + seed + expansion). */
export const QUEST_CATALOG: QuestDef[] = [
  ...STARTER_QUEST_CHAIN,
  ...QUEST_CATALOG_SEED,
  ...QUEST_CATALOG_EXPANSION,
];

export const QUEST_TAB_LABELS: Record<QuestBoardTab, string> = {
  all: "All",
  story: "Story",
  daily: "Daily",
  exploration: "Exploration",
};

export const QUEST_CATEGORY_LABELS: Record<QuestCategory, string> = {
  STORY: "Story",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  EXPLORATION: "Exploration",
  CARE: "Care",
  BATTLE: "Battle",
  COLLECTION: "Collection",
  COMMUNITY: "Community",
  EVENT: "Event",
};

export const QUEST_DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  available: "Available",
  active: "Active",
  completed: "Completed",
  locked: "Locked",
};

export const QUEST_TAB_THUMB: Record<QuestBoardTab, string> = {
  all: "/assets/ui/quests/tab-all.svg",
  story: "/assets/ui/quests/tab-story.svg",
  daily: "/assets/ui/quests/tab-daily.svg",
  exploration: "/assets/ui/quests/tab-exploration.svg",
};

export { QUEST_ART_V, questImagePath as questArtPath } from "@/lib/assets/paths";

export function getQuestByKey(key: string): QuestDef | undefined {
  return QUEST_CATALOG.find((q) => q.key === key);
}

export function formatQuestReward(reward: QuestReward): string {
  if (reward.kind === "xp") return `${reward.amount} XP`;
  if (reward.kind === "arena_points") return `${reward.amount} Arena Points`;
  if (reward.kind === "soft_currency") {
    return `${reward.amount} ${reward.label ?? "Credits"}`;
  }
  return `${reward.label} ×${reward.quantity}`;
}

export function questObjectiveProgressPercent(
  quest: QuestDef,
  progress: Record<string, number>,
): number {
  if (quest.objectives.length === 0) return 0;
  let sum = 0;
  for (const obj of quest.objectives) {
    const current = Math.min(progress[obj.key] ?? 0, obj.target);
    sum += current / obj.target;
  }
  return Math.round((sum / quest.objectives.length) * 100);
}
