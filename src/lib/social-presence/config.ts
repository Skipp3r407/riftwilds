/**
 * Living World social presence tuning.
 * Caps keep soft rewards tiny; never SOL; never combat power.
 */

import type {
  PresenceActionKind,
  RestZoneKind,
  SocialAchievementDef,
  TownFeaturedTitle,
} from "@/lib/social-presence/types";

/** Idle → AFK thresholds (ms). Resting can stay connected longer. */
export const IDLE_THRESHOLD_MS = 3 * 60_000;
export const AFK_THRESHOLD_MS = 8 * 60_000;

/** Presence XP / Community Token caps. */
export const PRESENCE_XP_HOUR_CAP = 180;
export const PRESENCE_XP_DAY_CAP = 900;
export const COMMUNITY_TOKENS_DAY_CAP = 40;
export const COMMUNITY_TOKENS_WEEK_CAP = 180;
export const HELPER_REWARDS_DAY_CAP = 25;
export const RIFTLING_BOND_SOCIAL_DAY_CAP = 30;

/** Max Presence XP from a single action (before bonuses). */
export const PRESENCE_XP_BASE: Record<PresenceActionKind, number> = {
  TOWN_VISIT: 4,
  MARKET_BROWSE: 3,
  NPC_TALK: 5,
  CHAT: 3,
  EMOTE: 4,
  PET_CARE: 5,
  HOME_VISIT: 6,
  HOME_LIKE: 3,
  FISH: 4,
  CAMPFIRE_REST: 5,
  PUBLIC_EVENT: 8,
  MUSIC_LISTEN: 3,
  TRADE: 6,
  HELP_NEWBIE: 10,
  FESTIVAL: 8,
  SIT: 2,
  WAVE: 3,
  DANCE: 4,
  GUESTBOOK: 4,
  COMMUNITY_EVENT: 7,
  READ_LORE: 3,
  GARDEN: 4,
  COOK: 4,
  CRAFT_SOCIAL: 4,
  PHOTO: 3,
  DECORATE: 4,
  WELCOME_NEWBIE: 12,
  GROUP_EMOTE: 5,
  PERFORMANCE: 6,
  MINIGAME: 5,
  INSTRUMENT: 4,
  DAILY_TASK: 8,
};

/** Rest hub bonus as percent of base XP (capped globally). */
export const REST_ZONE_BONUS_PERCENT: Record<RestZoneKind, number> = {
  safe_zone: 10,
  town_plaza: 15,
  inn: 20,
  campfire: 18,
  homestead: 12,
  fishing_dock: 10,
  festival_grounds: 22,
  market_square: 12,
  logout_rest: 15,
  tavern: 18,
  park: 12,
  library: 14,
  guild_hall: 12,
  music_stage: 16,
  riftling_park: 15,
  welcome_center: 20,
  crafting_plaza: 12,
  beach: 12,
  port: 10,
  sanctuary: 16,
  public_farm: 12,
  arena_viewing: 10,
};

/** Max total bonus % from rest + density combined. */
export const MAX_COMBINED_BONUS_PERCENT = 40;

/** Social density tiers — nearby keepers in hub (estimate or stub). */
export const DENSITY_BONUS_TIERS: { minNearby: number; bonusPercent: number }[] = [
  { minNearby: 2, bonusPercent: 5 },
  { minNearby: 5, bonusPercent: 10 },
  { minNearby: 10, bonusPercent: 15 },
  { minNearby: 20, bonusPercent: 20 },
];

/** Must have a real input signal within this window to earn Presence XP. */
export const ANTI_AFK_SIGNAL_WINDOW_MS = 90_000;

/** Motionless standing longer than this earns nothing. */
export const MOTIONLESS_BLOCK_MS = 120_000;

/** Detect scripted repetition: same action kind this many times in window. */
export const SCRIPTED_REPEAT_THRESHOLD = 12;
export const SCRIPTED_REPEAT_WINDOW_MS = 60_000;

/** Idle participation: genuine activity window before soft claim. */
export const IDLE_CLAIM_MIN_MS = 15 * 60_000;
export const IDLE_CLAIM_MAX_MS = 30 * 60_000;
export const IDLE_CLAIM_CREDITS_MIN = 5;
export const IDLE_CLAIM_CREDITS_MAX = 18;
export const IDLE_CLAIMS_PER_DAY = 8;
export const IDLE_GENUINE_ACTIVE_RATIO = 0.35;

/** Town featured titles rotate every hour (cosmetic only). */
export const FEATURED_HOUR_MS = 60 * 60_000;
export const FEATURED_TITLES: TownFeaturedTitle[] = [
  "Town Hero",
  "Master Merchant",
  "Community Favorite",
  "Friendly Neighbor",
  "Riftling Caregiver",
  "Helpful Explorer",
  "Festival Star",
  "Home Designer",
  "Campfire Host",
  "Musical Performer",
  "Newcomer Guide",
  "Social Butterfly",
];

/** Hourly featured slots still prioritize the three primary cosmetics. */
export const FEATURED_PRIMARY_TITLES: TownFeaturedTitle[] = [
  "Town Hero",
  "Master Merchant",
  "Community Favorite",
];

/** Multi-account farming guard: same fingerprint soft-share XP across accounts. */
export const MULTI_ACCOUNT_XP_SHARE = 0.25;

export const MAX_INPUT_LOG = 80;
export const MAX_ACTION_LOG = 120;

export const SOCIAL_ACHIEVEMENTS: SocialAchievementDef[] = [
  {
    id: "first_waves",
    label: "First Waves",
    description: "Wave or emote with nearby keepers.",
    threshold: 10,
    metric: "emotes",
    cosmeticReward: "title:Friendly Wave",
  },
  {
    id: "plaza_regular",
    label: "Plaza Regular",
    description: "Earn Presence XP in town hubs.",
    threshold: 250,
    metric: "presenceXp",
    cosmeticReward: "decor:plaza-banner-stub",
  },
  {
    id: "hearth_host",
    label: "Hearth Host",
    description: "Visit other keepers' homes.",
    threshold: 5,
    metric: "homeVisits",
    cosmeticReward: "guestbook:ribbon-stub",
  },
  {
    id: "campfire_soul",
    label: "Campfire Soul",
    description: "Rest meaningfully at campfires and inns.",
    threshold: 30,
    metric: "restMinutes",
    cosmeticReward: "emote:warm-glow-stub",
  },
  {
    id: "town_legend",
    label: "Town Legend",
    description: "Earn hourly featured recognition.",
    threshold: 1,
    metric: "featuredHours",
    cosmeticReward: "profile:featured-frame",
  },
  {
    id: "mentor_spark",
    label: "Mentor Spark",
    description: "Help new keepers in hubs.",
    threshold: 3,
    metric: "helps",
    cosmeticReward: "badge:mentor-spark",
  },
];

/** Catalog of rest / logout-friendly hubs (reuse safe_zone semantics). */
export const REST_HUB_CATALOG: {
  id: string;
  label: string;
  regionSlug: string;
  kind: RestZoneKind;
  popularSeed: number;
}[] = [
  {
    id: "commons-plaza",
    label: "Hatchery Plaza",
    regionSlug: "riftwild-commons",
    kind: "town_plaza",
    popularSeed: 92,
  },
  {
    id: "commons-inn",
    label: "Keeper's Rest Inn",
    regionSlug: "riftwild-commons",
    kind: "inn",
    popularSeed: 78,
  },
  {
    id: "commons-market",
    label: "Plaza Market Square",
    regionSlug: "riftwild-commons",
    kind: "market_square",
    popularSeed: 88,
  },
  {
    id: "commons-campfire",
    label: "Plaza Campfire",
    regionSlug: "riftwild-commons",
    kind: "campfire",
    popularSeed: 70,
  },
  {
    id: "commons-safe",
    label: "Plaza Safe Zone",
    regionSlug: "riftwild-commons",
    kind: "safe_zone",
    popularSeed: 85,
  },
  {
    id: "commons-logout",
    label: "Quiet Logout Bench",
    regionSlug: "riftwild-commons",
    kind: "logout_rest",
    popularSeed: 55,
  },
  {
    id: "elderwood-campfire",
    label: "Mossglow Campfire",
    regionSlug: "elderwood-forest",
    kind: "campfire",
    popularSeed: 64,
  },
  {
    id: "elderwood-dock",
    label: "Creek Fishing Dock",
    regionSlug: "elderwood-forest",
    kind: "fishing_dock",
    popularSeed: 58,
  },
  {
    id: "ember-festival",
    label: "Ember Festival Grounds",
    regionSlug: "ember-crater",
    kind: "festival_grounds",
    popularSeed: 72,
  },
  {
    id: "homestead-hearth",
    label: "Homestead Hearth",
    regionSlug: "riftwild-commons",
    kind: "homestead",
    popularSeed: 60,
  },
  {
    id: "commons-tavern",
    label: "Amber Lantern Tavern",
    regionSlug: "riftwild-commons",
    kind: "tavern",
    popularSeed: 74,
  },
  {
    id: "commons-park",
    label: "Keeper's Green Park",
    regionSlug: "riftwild-commons",
    kind: "park",
    popularSeed: 68,
  },
  {
    id: "commons-library",
    label: "Archivist Library",
    regionSlug: "riftwild-commons",
    kind: "library",
    popularSeed: 52,
  },
  {
    id: "commons-guild",
    label: "Guild Hall Steps",
    regionSlug: "riftwild-commons",
    kind: "guild_hall",
    popularSeed: 61,
  },
  {
    id: "commons-stage",
    label: "Plaza Music Stage",
    regionSlug: "riftwild-commons",
    kind: "music_stage",
    popularSeed: 66,
  },
  {
    id: "commons-riftling-park",
    label: "Riftling Play Park",
    regionSlug: "riftwild-commons",
    kind: "riftling_park",
    popularSeed: 77,
  },
  {
    id: "commons-welcome",
    label: "Newkeeper Welcome Center",
    regionSlug: "riftwild-commons",
    kind: "welcome_center",
    popularSeed: 90,
  },
  {
    id: "commons-craft",
    label: "Crafting Plaza",
    regionSlug: "riftwild-commons",
    kind: "crafting_plaza",
    popularSeed: 63,
  },
  {
    id: "tide-beach",
    label: "Tideglass Beach",
    regionSlug: "tideglass-shore",
    kind: "beach",
    popularSeed: 59,
  },
  {
    id: "commons-port",
    label: "Commons Port",
    regionSlug: "riftwild-commons",
    kind: "port",
    popularSeed: 54,
  },
  {
    id: "commons-sanctuary",
    label: "Quiet Sanctuary",
    regionSlug: "riftwild-commons",
    kind: "sanctuary",
    popularSeed: 50,
  },
  {
    id: "commons-farm",
    label: "Public Community Farm",
    regionSlug: "riftwild-commons",
    kind: "public_farm",
    popularSeed: 57,
  },
  {
    id: "commons-arena-view",
    label: "Arena Viewing Terrace",
    regionSlug: "riftwild-commons",
    kind: "arena_viewing",
    popularSeed: 65,
  },
];

export const SOCIAL_PROMPT_POOL: { text: string; suggestedAction: PresenceActionKind }[] = [
  { text: "Wave to a nearby keeper — towns feel alive when people notice each other.", suggestedAction: "WAVE" },
  { text: "Sit by the campfire and let your Riftling settle.", suggestedAction: "CAMPFIRE_REST" },
  { text: "Leave a kind guestbook note on a popular home.", suggestedAction: "GUESTBOOK" },
  { text: "Help a newkeeper find the market square.", suggestedAction: "HELP_NEWBIE" },
  { text: "Browse the market and chat with a merchant.", suggestedAction: "MARKET_BROWSE" },
  { text: "Dance during a street musician set.", suggestedAction: "DANCE" },
  { text: "Talk with a plaza NPC — they remember faces.", suggestedAction: "NPC_TALK" },
  { text: "Cast a line at the fishing dock while friends rest nearby.", suggestedAction: "FISH" },
];

export const COSMETIC_IDLE_STUBS = [
  "cosmetic:plaza-pin-stub",
  "cosmetic:campfire-ember-stub",
  "cosmetic:market-ribbon-stub",
  "decor:window-lantern-stub",
  "emote:content-sigh-stub",
] as const;
