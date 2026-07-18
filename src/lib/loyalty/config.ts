/**
 * Admin-adjustable loyalty / airdrop / streak config.
 * Tables & odds are stubs — mutate via admin config API (or this file).
 * SOL airdrops stay hard-off; Credits + loyalty cosmetics only by default.
 */

import type {
  AirdropRewardDef,
  LoyaltyShopItem,
  LoyaltyTier,
  MilestoneDef,
  RewardRarity,
} from "@/lib/loyalty/types";
import { LOYALTY_TIERS } from "@/lib/loyalty/types";

export const LOYALTY_CONFIG_VERSION = 1;

export const LOYALTY_FRAMING =
  "Streak rewards and Rift Storm airdrops come from Community Reward Treasury framing — never from buying the launch coin. Credits are soft currency; Loyalty Tokens buy cosmetics only.";

/** Consecutive daily streak thresholds → tier. */
export const TIER_THRESHOLDS: { tier: LoyaltyTier; minDailyStreak: number }[] = [
  { tier: "BRONZE", minDailyStreak: 0 },
  { tier: "SILVER", minDailyStreak: 3 },
  { tier: "GOLD", minDailyStreak: 7 },
  { tier: "PLATINUM", minDailyStreak: 14 },
  { tier: "DIAMOND", minDailyStreak: 30 },
  { tier: "MYTHIC", minDailyStreak: 60 },
  { tier: "LEGEND", minDailyStreak: 100 },
];

export const TIER_LABELS: Record<LoyaltyTier, string> = {
  BRONZE: "Bronze Riftwalker",
  SILVER: "Silver Pathfinder",
  GOLD: "Gold Trailblazer",
  PLATINUM: "Platinum Warden",
  DIAMOND: "Diamond Luminary",
  MYTHIC: "Mythic Stormcaller",
  LEGEND: "Legend of the Rift",
};

export const TIER_BADGES: Record<LoyaltyTier, string> = {
  BRONZE: "tier_bronze",
  SILVER: "tier_silver",
  GOLD: "tier_gold",
  PLATINUM: "tier_platinum",
  DIAMOND: "tier_diamond",
  MYTHIC: "tier_mythic",
  LEGEND: "tier_legend",
};

/** Odds multipliers for rare+ entries by tier (COMMON stays base). */
export const TIER_RARITY_MULTIPLIERS: Record<LoyaltyTier, Partial<Record<RewardRarity, number>>> = {
  BRONZE: { COMMON: 1, UNCOMMON: 1, RARE: 0.7, EPIC: 0.4, LEGENDARY: 0.2, MYTHIC: 0.05 },
  SILVER: { COMMON: 1, UNCOMMON: 1.1, RARE: 0.9, EPIC: 0.55, LEGENDARY: 0.3, MYTHIC: 0.08 },
  GOLD: { COMMON: 0.95, UNCOMMON: 1.15, RARE: 1.1, EPIC: 0.75, LEGENDARY: 0.45, MYTHIC: 0.12 },
  PLATINUM: { COMMON: 0.9, UNCOMMON: 1.2, RARE: 1.25, EPIC: 1, LEGENDARY: 0.65, MYTHIC: 0.2 },
  DIAMOND: { COMMON: 0.85, UNCOMMON: 1.2, RARE: 1.35, EPIC: 1.2, LEGENDARY: 0.9, MYTHIC: 0.35 },
  MYTHIC: { COMMON: 0.8, UNCOMMON: 1.15, RARE: 1.4, EPIC: 1.4, LEGENDARY: 1.15, MYTHIC: 0.55 },
  LEGEND: { COMMON: 0.75, UNCOMMON: 1.1, RARE: 1.5, EPIC: 1.6, LEGENDARY: 1.4, MYTHIC: 0.85 },
};

/** Rift Storm: base win chance by tier (special drop). */
export const STORM_WIN_CHANCE: Record<LoyaltyTier, number> = {
  BRONZE: 0.08,
  SILVER: 0.12,
  GOLD: 0.18,
  PLATINUM: 0.25,
  DIAMOND: 0.34,
  MYTHIC: 0.45,
  LEGEND: 0.58,
};

export const ACTIVITY_WINDOW_MS = 24 * 60 * 60 * 1000;
export const MIN_ACTIVITIES_FOR_CLAIM = 1;
export const MAX_ACTIVITY_LOG = 100;

/** Failed rare pulls before pity forces UNCOMMON+ (admin stub). */
export const PITY_THRESHOLD = 8;
export const PITY_MIN_RARITY: RewardRarity = "UNCOMMON";

export const STORM_DURATION_MS = 15 * 60 * 1000;
export const STORM_DEFAULT_MESSAGE =
  "⚡ A Rift Storm sweeps Aeryndra! Active keepers may receive special airdrops. Odds rise with loyalty tier — recipients stay private unless they choose to share.";

/** Guaranteed milestone rewards — claimable once per account. */
export const STREAK_MILESTONES: MilestoneDef[] = [
  {
    days: 7,
    title: "Weekward Flame",
    badgeId: "loyalty_streak_7",
    cosmeticId: "cosmetic_weekward_ember",
    loyaltyTokens: 25,
    creditsAmount: 75,
    description: "Seven consecutive days — ember trail cosmetic.",
  },
  {
    days: 30,
    title: "Moonlit Keeper",
    badgeId: "loyalty_streak_30",
    cosmeticId: "cosmetic_moonlit_halo",
    loyaltyTokens: 80,
    creditsAmount: 200,
    description: "Thirty days — moonlit halo.",
  },
  {
    days: 60,
    title: "Riftbound Adept",
    badgeId: "loyalty_streak_60",
    cosmeticId: "cosmetic_riftbound_cloak",
    loyaltyTokens: 150,
    creditsAmount: 350,
    description: "Sixty days — riftbound cloak cosmetic.",
  },
  {
    days: 90,
    title: "Season Sentinel",
    badgeId: "loyalty_streak_90",
    cosmeticId: "cosmetic_season_banner",
    loyaltyTokens: 220,
    creditsAmount: 500,
    description: "Ninety days — seasonal banner housing accent.",
  },
  {
    days: 180,
    title: "Half-Year Luminary",
    badgeId: "loyalty_streak_180",
    cosmeticId: "cosmetic_luminary_crown",
    loyaltyTokens: 400,
    creditsAmount: 800,
    description: "Half a year — luminary crown.",
  },
  {
    days: 365,
    title: "Year of the Rift",
    badgeId: "loyalty_streak_365",
    cosmeticId: "cosmetic_year_of_rift",
    loyaltyTokens: 800,
    creditsAmount: 1500,
    description: "A full year — legendary yearmark cosmetic.",
  },
  {
    days: 500,
    title: "Eternal Pathwalker",
    badgeId: "loyalty_streak_500",
    cosmeticId: "cosmetic_eternal_path",
    loyaltyTokens: 1200,
    creditsAmount: 2000,
    description: "Five hundred days — eternal path housing plot accent.",
  },
  {
    days: 1000,
    title: "Legend Unbroken",
    badgeId: "loyalty_streak_1000",
    cosmeticId: "cosmetic_legend_unbroken",
    loyaltyTokens: 2500,
    creditsAmount: 4000,
    description: "One thousand days — legend title & unique housing crest.",
  },
];

/** Daily airdrop weighted table (configurable stub). */
export const DAILY_AIRDROP_TABLE: AirdropRewardDef[] = [
  {
    id: "daily_credits_sm",
    kind: "CREDITS",
    label: "Small Credit pouch",
    rarity: "COMMON",
    creditsAmount: 25,
    weight: 40,
  },
  {
    id: "daily_credits_md",
    kind: "CREDITS",
    label: "Credit satchel",
    rarity: "UNCOMMON",
    creditsAmount: 60,
    weight: 22,
  },
  {
    id: "daily_lt_sm",
    kind: "LOYALTY_TOKENS",
    label: "Loyalty token shard",
    rarity: "COMMON",
    loyaltyTokens: 5,
    weight: 28,
  },
  {
    id: "daily_lt_md",
    kind: "LOYALTY_TOKENS",
    label: "Loyalty token cache",
    rarity: "RARE",
    loyaltyTokens: 20,
    weight: 10,
    minTier: "SILVER",
  },
  {
    id: "daily_cosmetic_spark",
    kind: "COSMETIC",
    label: "Rift spark aura",
    rarity: "RARE",
    assetId: "cosmetic_rift_spark",
    weight: 8,
    minTier: "GOLD",
  },
  {
    id: "daily_title_wanderer",
    kind: "TITLE",
    label: "Title: Rift Wanderer",
    rarity: "EPIC",
    assetId: "title_rift_wanderer",
    weight: 4,
    minTier: "PLATINUM",
  },
  {
    id: "daily_housing_lantern",
    kind: "HOUSING",
    label: "Homestead lantern accent",
    rarity: "EPIC",
    assetId: "housing_lantern_accent",
    weight: 3,
    minTier: "DIAMOND",
  },
  {
    id: "daily_mythic_veil",
    kind: "COSMETIC",
    label: "Mythic storm veil",
    rarity: "MYTHIC",
    assetId: "cosmetic_mythic_storm_veil",
    weight: 1,
    minTier: "MYTHIC",
    exclusiveOnly: true,
  },
];

/** Rift Storm special table — rarer, tier-gated exclusives. */
export const RIFT_STORM_TABLE: AirdropRewardDef[] = [
  {
    id: "storm_credits",
    kind: "CREDITS",
    label: "Storm Credit surge",
    rarity: "UNCOMMON",
    creditsAmount: 100,
    weight: 30,
  },
  {
    id: "storm_lt",
    kind: "LOYALTY_TOKENS",
    label: "Storm loyalty cache",
    rarity: "RARE",
    loyaltyTokens: 40,
    weight: 22,
  },
  {
    id: "storm_badge",
    kind: "BADGE",
    label: "Badge: Storm Touched",
    rarity: "RARE",
    assetId: "badge_storm_touched",
    weight: 18,
  },
  {
    id: "storm_cosmetic",
    kind: "COSMETIC",
    label: "Tempest ribbon trail",
    rarity: "EPIC",
    assetId: "cosmetic_tempest_ribbon",
    weight: 12,
    minTier: "GOLD",
  },
  {
    id: "storm_title",
    kind: "TITLE",
    label: "Title: Storm Rider",
    rarity: "LEGENDARY",
    assetId: "title_storm_rider",
    weight: 6,
    minTier: "DIAMOND",
  },
  {
    id: "storm_housing",
    kind: "HOUSING",
    label: "Storm-glass window pane",
    rarity: "LEGENDARY",
    assetId: "housing_storm_glass",
    weight: 4,
    minTier: "MYTHIC",
  },
  {
    id: "storm_legend_crest",
    kind: "COSMETIC",
    label: "Legend stormcrest",
    rarity: "MYTHIC",
    assetId: "cosmetic_legend_stormcrest",
    weight: 2,
    minTier: "LEGEND",
    exclusiveOnly: true,
  },
];

export const LOYALTY_SHOP_CATALOG: LoyaltyShopItem[] = [
  {
    id: "shop_aura_moss",
    label: "Mossglow Aura",
    description: "Soft green aura for your Riftling — purely cosmetic.",
    category: "cosmetic",
    costLoyaltyTokens: 40,
    assetId: "cosmetic_mossglow_aura",
    imagePath: "/assets/loyalty/mossglow-aura.png",
    gameplayAdvantage: false,
  },
  {
    id: "shop_title_loyal",
    label: "Title: Loyal Keeper",
    description: "Display title for your profile.",
    category: "title",
    costLoyaltyTokens: 60,
    assetId: "title_loyal_keeper",
    imagePath: "/assets/loyalty/title-loyal-keeper.png",
    minTier: "SILVER",
    gameplayAdvantage: false,
  },
  {
    id: "shop_badge_heart",
    label: "Badge: Heart of the Nest",
    description: "Profile badge — no combat stats.",
    category: "badge",
    costLoyaltyTokens: 50,
    assetId: "badge_heart_nest",
    imagePath: "/assets/loyalty/badge-heart-of-the-nest.png",
    gameplayAdvantage: false,
  },
  {
    id: "shop_housing_rug",
    label: "Homestead woven rug",
    description: "Decorative housing accent.",
    category: "housing",
    costLoyaltyTokens: 120,
    assetId: "housing_woven_rug",
    imagePath: "/assets/loyalty/homestead-woven-rug.png",
    minTier: "GOLD",
    gameplayAdvantage: false,
  },
  {
    id: "shop_cosmetic_crown",
    label: "Dawnpetal Crown",
    description: "Cosmetic crown for parade / homestead photos.",
    category: "cosmetic",
    costLoyaltyTokens: 200,
    assetId: "cosmetic_dawnpetal_crown",
    imagePath: "/assets/loyalty/dawnpetal-crown.png",
    minTier: "PLATINUM",
    gameplayAdvantage: false,
  },
  {
    id: "shop_title_storm",
    label: "Title: Quiet Storm",
    description: "Exclusive title for Diamond+ keepers.",
    category: "title",
    costLoyaltyTokens: 300,
    assetId: "title_quiet_storm",
    imagePath: "/assets/loyalty/title-quiet-storm.png",
    minTier: "DIAMOND",
    gameplayAdvantage: false,
  },
];

export function tierIndex(tier: LoyaltyTier): number {
  return LOYALTY_TIERS.indexOf(tier);
}

export function rarityIndex(rarity: RewardRarity): number {
  const order: RewardRarity[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];
  return order.indexOf(rarity);
}

export function getAdminConfigSnapshot() {
  return {
    configVersion: LOYALTY_CONFIG_VERSION,
    tiers: LOYALTY_TIERS,
    milestoneDays: STREAK_MILESTONES.map((m) => m.days),
    airdropTableIds: ["daily", "rift_storm"],
    pityThreshold: PITY_THRESHOLD,
    activityWindowMs: ACTIVITY_WINDOW_MS,
    minActivitiesForClaim: MIN_ACTIVITIES_FOR_CLAIM,
    stormDurationMs: STORM_DURATION_MS,
    solAirdropsEnabled: false as const,
    framing: LOYALTY_FRAMING,
  };
}
