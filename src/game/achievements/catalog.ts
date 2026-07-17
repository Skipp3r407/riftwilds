/**
 * Achievement Universe catalog — substantial seed; evaluator is pure metric matching.
 */

export type AchievementTier = "bronze" | "silver" | "gold" | "mythic";

export type AchievementCategory =
  | "hatchery"
  | "care"
  | "exploration"
  | "arena"
  | "story"
  | "social"
  | "civilization"
  | "housing"
  | "seasonal"
  | "endgame"
  | "collection"
  | "economy";

export type AchievementDef = {
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  criteria: { metric: string; target: number };
  hidden?: boolean;
  featureFlag?: string;
};

function a(
  partial: Omit<AchievementDef, "points"> & { points?: number },
): AchievementDef {
  const tierPoints = { bronze: 10, silver: 25, gold: 50, mythic: 100 };
  return { points: partial.points ?? tierPoints[partial.tier], ...partial };
}

export const ACHIEVEMENT_CATALOG: AchievementDef[] = [
  a({
    key: "first_claim",
    name: "Egg Claimed",
    description: "Claim your first Rift Egg from the Hatchery.",
    category: "hatchery",
    tier: "bronze",
    criteria: { metric: "egg_claim_count", target: 1 },
  }),
  a({
    key: "first_hatch",
    name: "First Hatch",
    description: "Hatch a companion into The Riftwilds.",
    category: "hatchery",
    tier: "bronze",
    criteria: { metric: "hatch_count", target: 1 },
  }),
  a({
    key: "hatch_ten",
    name: "Keeper of Ten",
    description: "Hatch 10 Riftlings over your career.",
    category: "hatchery",
    tier: "silver",
    criteria: { metric: "hatch_count", target: 10 },
  }),
  a({
    key: "care_streak_7",
    name: "Week of Warmth",
    description: "Maintain a 7-day care streak on any pet.",
    category: "care",
    tier: "silver",
    criteria: { metric: "care_streak_days", target: 7 },
  }),
  a({
    key: "feed_100",
    name: "Plenty at the Bowl",
    description: "Feed companions 100 times.",
    category: "care",
    tier: "silver",
    criteria: { metric: "feed_count", target: 100 },
  }),
  a({
    key: "region_discovery_3",
    name: "Pathfinder",
    description: "Discover 3 regions.",
    category: "exploration",
    tier: "bronze",
    criteria: { metric: "region_discovery", target: 3 },
  }),
  a({
    key: "region_discovery_12",
    name: "Cartographer of the Rift",
    description: "Discover all 12 launch regions.",
    category: "exploration",
    tier: "gold",
    criteria: { metric: "region_discovery", target: 12 },
  }),
  a({
    key: "live_world_enter",
    name: "Step Into the Wilds",
    description: "Enter the playable Live World.",
    category: "exploration",
    tier: "bronze",
    criteria: { metric: "live_world_enters", target: 1 },
  }),
  a({
    key: "expedition_first",
    name: "First Expedition",
    description: "Complete a procedural expedition.",
    category: "exploration",
    tier: "bronze",
    criteria: { metric: "expedition_complete", target: 1 },
  }),
  a({
    key: "expedition_25",
    name: "Infinite Horizon",
    description: "Complete 25 expeditions.",
    category: "exploration",
    tier: "gold",
    criteria: { metric: "expedition_complete", target: 25 },
  }),
  a({
    key: "arena_training_1",
    name: "Sparring Start",
    description: "Finish an Arena training bout.",
    category: "arena",
    tier: "bronze",
    criteria: { metric: "arena_training_wins", target: 1 },
  }),
  a({
    key: "arena_training_50",
    name: "Yard Veteran",
    description: "Win 50 Arena training bouts.",
    category: "arena",
    tier: "gold",
    criteria: { metric: "arena_training_wins", target: 50 },
  }),
  a({
    key: "story_first_choice",
    name: "Branching Path",
    description: "Make your first story engine choice.",
    category: "story",
    tier: "bronze",
    criteria: { metric: "story_choices", target: 1 },
  }),
  a({
    key: "seasonal_bloom_witness",
    name: "Bloomtide Witness",
    description: "Complete the Bloomtide Gathering arc.",
    category: "seasonal",
    tier: "silver",
    criteria: { metric: "story_arc_complete_bloomtide_gathering", target: 1 },
  }),
  a({
    key: "civ_contribute",
    name: "Stone on the Cairn",
    description: "Contribute to a civilization milestone.",
    category: "civilization",
    tier: "bronze",
    criteria: { metric: "civ_contributions", target: 1 },
  }),
  a({
    key: "civ_milestone_unlock",
    name: "Era Witness",
    description: "Be present when a civilization milestone unlocks.",
    category: "civilization",
    tier: "silver",
    criteria: { metric: "civ_milestones_witnessed", target: 1 },
  }),
  a({
    key: "homestead_first_room",
    name: "Threshold Crossed",
    description: "Unlock your first homestead room.",
    category: "housing",
    tier: "bronze",
    criteria: { metric: "homestead_rooms_unlocked", target: 1 },
  }),
  a({
    key: "homestead_furnish",
    name: "Settled Hearth",
    description: "Place 10 furniture pieces.",
    category: "housing",
    tier: "silver",
    criteria: { metric: "furniture_placed", target: 10 },
  }),
  a({
    key: "friend_visit",
    name: "Open Door",
    description: "Host a friend visit at your homestead.",
    category: "social",
    tier: "bronze",
    criteria: { metric: "homestead_visits_hosted", target: 1 },
  }),
  a({
    key: "guild_join",
    name: "Banner Raised",
    description: "Join a guild.",
    category: "social",
    tier: "bronze",
    criteria: { metric: "guild_joins", target: 1 },
  }),
  a({
    key: "trade_complete",
    name: "Fair Exchange",
    description: "Complete a peer trade (stub).",
    category: "economy",
    tier: "bronze",
    criteria: { metric: "trades_completed", target: 1 },
  }),
  a({
    key: "marketplace_browse",
    name: "Window Shopper",
    description: "Browse the marketplace catalog.",
    category: "economy",
    tier: "bronze",
    criteria: { metric: "marketplace_views", target: 1 },
  }),
  a({
    key: "species_codex_10",
    name: "Codex Student",
    description: "Unlock 10 species Codex entries.",
    category: "collection",
    tier: "silver",
    criteria: { metric: "codex_species_unlocked", target: 10 },
  }),
  a({
    key: "species_codex_50",
    name: "Living Lexicon",
    description: "Unlock all launch species in the Codex.",
    category: "collection",
    tier: "mythic",
    criteria: { metric: "codex_species_unlocked", target: 50 },
  }),
  a({
    key: "festival_attend",
    name: "Festival Lantern",
    description: "Attend a recurring festival event.",
    category: "seasonal",
    tier: "bronze",
    criteria: { metric: "festivals_attended", target: 1 },
  }),
  a({
    key: "photo_mode_shot",
    name: "Rift Snapshot",
    description: "Capture a photo-mode shot.",
    category: "social",
    tier: "bronze",
    criteria: { metric: "photo_shots", target: 1 },
  }),
  a({
    key: "boss_attempt",
    name: "Colossus Shadow",
    description: "Attempt a world or raid boss encounter.",
    category: "endgame",
    tier: "silver",
    criteria: { metric: "boss_attempts", target: 1 },
  }),
  a({
    key: "endless_rift_floor_10",
    name: "Tenth Threshold",
    description: "Reach floor 10 in the Endless Rift.",
    category: "endgame",
    tier: "gold",
    criteria: { metric: "endless_rift_floor", target: 10 },
  }),
  a({
    key: "pet_friendship",
    name: "Bonded Pair",
    description: "Raise a pet friendship to bonded.",
    category: "care",
    tier: "silver",
    criteria: { metric: "pet_friendships_bonded", target: 1 },
  }),
  a({
    key: "genetics_reveal",
    name: "Bloodline Reader",
    description: "Reveal a Genetics 2.0 trait summary on a pet.",
    category: "collection",
    tier: "bronze",
    criteria: { metric: "genetics_reveals", target: 1 },
  }),
  a({
    key: "archivist_consult",
    name: "Ask the Echo",
    description: "Consult the AI Archivist companion.",
    category: "story",
    tier: "bronze",
    criteria: { metric: "archivist_consults", target: 1 },
  }),
  a({
    key: "timeline_milestone",
    name: "Living Chronicle",
    description: "Record 25 living timeline events.",
    category: "story",
    tier: "silver",
    criteria: { metric: "timeline_events", target: 25 },
  }),
  a({
    key: "disaster_survive",
    name: "Weather the Surge",
    description: "Play during an active world disaster.",
    category: "exploration",
    tier: "silver",
    criteria: { metric: "disasters_witnessed", target: 1 },
  }),
  a({
    key: "hidden_void_whisper",
    name: "Void Whisper",
    description: "Hear something you were not meant to.",
    category: "story",
    tier: "mythic",
    hidden: true,
    criteria: { metric: "void_whisper_heard", target: 1 },
  }),
];

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENT_CATALOG.find((x) => x.key === key);
}

export function achievementsByCategory(
  category: AchievementCategory,
): AchievementDef[] {
  return ACHIEVEMENT_CATALOG.filter((x) => x.category === category);
}
