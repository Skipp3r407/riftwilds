/**
 * Admin-configurable Rift Storm tables, odds, frequency, participation, SOL caps.
 * SOL stays optional / flagged off by default — never required, never promised ROI.
 */

import type { AirdropRewardDef, LoyaltyTier } from "@/lib/loyalty/types";
import type {
  CommunityObjectiveDef,
  StormIntensityTier,
  StormParticipationAction,
  StormWaveDef,
  StormWorldPresentation,
} from "@/lib/loyalty/rift-storm-types";

export const RIFT_STORM_CONFIG_VERSION = 1;

export const STORM_WARNING_MESSAGE =
  "A strange energy is gathering across the Rift… Keepers who play meaningfully may share in what comes.";

export const STORM_ACTIVE_MESSAGE =
  "⚡ A Rift Storm is live! Meaningful play earns participation. Odds rise with loyalty tier — winners stay private unless they share.";

/** Warning countdown defaults by intensity. */
export const STORM_WARNING_MS: Record<StormIntensityTier, number> = {
  MINOR: 60_000,
  GREATER: 90_000,
  LEGENDARY: 120_000,
  SEASONAL: 180_000,
  CATACLYSM: 300_000,
};

export const STORM_ACTIVE_MS: Record<StormIntensityTier, number> = {
  MINOR: 10 * 60_000,
  GREATER: 15 * 60_000,
  LEGENDARY: 20 * 60_000,
  SEASONAL: 30 * 60_000,
  CATACLYSM: 45 * 60_000,
};

/** Approximate frequency hints (admin stubs — not a hard scheduler). */
export const STORM_FREQUENCY_HINT: Record<StormIntensityTier, string> = {
  MINOR: "Several per day during active hours",
  GREATER: "A few per week",
  LEGENDARY: "Rare — bosses / milestones",
  SEASONAL: "Season calendar",
  CATACLYSM: "Emergency / anniversary only",
};

/**
 * Streak-tier reward weight boosts (spec):
 * Bronze base, Silver +5%, Gold +10%, Platinum +18%, Diamond +25%, Legend +35%.
 * MYTHIC sits between Diamond and Legend.
 */
export const STORM_TIER_WEIGHT_BOOST: Record<LoyaltyTier, number> = {
  BRONZE: 0,
  SILVER: 0.05,
  GOLD: 0.1,
  PLATINUM: 0.18,
  DIAMOND: 0.25,
  MYTHIC: 0.3,
  LEGEND: 0.35,
};

/** Base selection score needed to qualify (before tier/pity modifiers). */
export const STORM_QUALIFY_SCORE: Record<StormIntensityTier, number> = {
  MINOR: 8,
  GREATER: 12,
  LEGENDARY: 18,
  SEASONAL: 15,
  CATACLYSM: 25,
};

/** Participation point values — diminishing returns applied in scoring. */
export const STORM_ACTION_POINTS: Record<StormParticipationAction, number> = {
  QUEST_OBJECTIVE: 5,
  QUEST_COMPLETE: 8,
  COMBAT: 2,
  BOSS_PARTICIPATE: 15,
  BOSS_DEFEAT: 25,
  GATHER: 2,
  CRAFT: 3,
  FISH: 2,
  EXPLORE: 3,
  PUBLIC_EVENT: 10,
  PARTY_HELP: 4,
  HEAL_SUPPORT: 4,
  APPROVED_TRADE: 1,
  RIFTLING_CARE: 3,
  PUZZLE: 5,
  TREASURE: 10,
  RARE_DISCOVERY: 20,
  TEMP_QUEST: 8,
  REGION_TRAVEL: 2,
};

/** After N of the same action, each extra grants points * decay^extra. */
export const STORM_DIMINISHING_AFTER = 3;
export const STORM_DIMINISHING_DECAY = 0.55;

/** Disconnect grace — keep score if reconnect within window. */
export const STORM_DISCONNECT_GRACE_MS = 5 * 60_000;

/** Inbox expiry for unclaimed wave rewards. */
export const STORM_INBOX_TTL_MS = 72 * 60 * 60_000;

/** Optional SOL promotional pool — hard-gated; never financial advice. */
export const STORM_SOL = {
  /** Feature still requires REAL_SOL flags + this admin arm. */
  enabledByDefault: false,
  maxLamportsPerGrant: 50_000, // 0.00005 SOL stub cap
  maxLamportsPerStorm: 500_000,
  maxGrantsPerStorm: 10,
  maxGrantsPerUserPerDay: 1,
  substituteRewardId: "storm_sol_substitute_credits",
  disclaimer:
    "Optional promotional SOL from Community Reward Treasury / promo pool only. Never promised. No financial return. Fails safely to non-SOL substitutes when pool empty or flags off.",
} as const;

export const DEFAULT_COMMUNITY_OBJECTIVE: CommunityObjectiveDef = {
  id: "storm_community_default",
  label: "Seal the Rift Together",
  description: "Community participation score unlocks a shared bonus for qualified keepers.",
  targetScore: 500,
  personalThreshold: 10,
  rewardCredits: 50,
  rewardLoyaltyTokens: 15,
  cosmeticId: "cosmetic_community_storm_pin",
};

export const STORM_WAVES: StormWaveDef[] = [
  {
    id: "WAVE_1",
    label: "First gust — small drops",
    startsAfterMs: 0,
    durationMs: 4 * 60_000,
    minScore: 5,
    tableId: "storm_wave_1",
  },
  {
    id: "WAVE_2",
    label: "Rising winds — rare gifts",
    startsAfterMs: 4 * 60_000,
    durationMs: 4 * 60_000,
    minScore: 12,
    tableId: "storm_wave_2",
    rarityFloor: "UNCOMMON",
  },
  {
    id: "WAVE_3",
    label: "Eye of the storm — major prizes",
    startsAfterMs: 8 * 60_000,
    durationMs: 4 * 60_000,
    minScore: 20,
    tableId: "storm_wave_3",
    rarityFloor: "RARE",
  },
  {
    id: "FINAL",
    label: "Afterglow — participation gift",
    startsAfterMs: 12 * 60_000,
    durationMs: 3 * 60_000,
    minScore: 8,
    tableId: "storm_wave_final",
    guaranteedParticipation: true,
  },
];

export const STORM_WAVE_TABLES: Record<string, AirdropRewardDef[]> = {
  storm_wave_1: [
    { id: "w1_credits", kind: "CREDITS", label: "Storm Credits puff", rarity: "COMMON", creditsAmount: 30, weight: 40 },
    { id: "w1_lt", kind: "LOYALTY_TOKENS", label: "Loyalty spark", rarity: "COMMON", loyaltyTokens: 8, weight: 30 },
    { id: "w1_mat", kind: "ITEM", label: "Rift dust (mat)", rarity: "COMMON", assetId: "mat_rift_dust", quantity: 2, weight: 20 },
    { id: "w1_badge", kind: "BADGE", label: "Badge: Gust Touched", rarity: "UNCOMMON", assetId: "badge_gust_touched", weight: 10 },
  ],
  storm_wave_2: [
    { id: "w2_credits", kind: "CREDITS", label: "Storm Credit pouch", rarity: "UNCOMMON", creditsAmount: 80, weight: 28 },
    { id: "w2_lt", kind: "LOYALTY_TOKENS", label: "Loyalty cache", rarity: "UNCOMMON", loyaltyTokens: 25, weight: 22 },
    { id: "w2_map", kind: "ITEM", label: "Fragment map scrap", rarity: "RARE", assetId: "map_fragment_scrap", quantity: 1, weight: 16 },
    { id: "w2_cosmetic", kind: "COSMETIC", label: "Tempest ribbon", rarity: "RARE", assetId: "cosmetic_tempest_ribbon", weight: 14, minTier: "GOLD" },
    { id: "w2_emote", kind: "ITEM", label: "Emote: Storm Wave", rarity: "RARE", assetId: "emote_storm_wave", quantity: 1, weight: 12 },
    { id: "w2_coupon", kind: "ITEM", label: "Marketplace fee coupon", rarity: "EPIC", assetId: "coupon_marketplace_fee", quantity: 1, weight: 8, minTier: "PLATINUM" },
  ],
  storm_wave_3: [
    { id: "w3_credits", kind: "CREDITS", label: "Major Credit surge", rarity: "RARE", creditsAmount: 200, weight: 22 },
    { id: "w3_lt", kind: "LOYALTY_TOKENS", label: "Major loyalty vault", rarity: "RARE", loyaltyTokens: 60, weight: 18 },
    { id: "w3_title", kind: "TITLE", label: "Title: Storm Rider", rarity: "EPIC", assetId: "title_storm_rider", weight: 14, minTier: "DIAMOND" },
    { id: "w3_housing", kind: "HOUSING", label: "Storm-glass pane", rarity: "EPIC", assetId: "housing_storm_glass", weight: 12, minTier: "DIAMOND" },
    { id: "w3_skin", kind: "COSMETIC", label: "Seasonal storm skin", rarity: "LEGENDARY", assetId: "skin_seasonal_storm", weight: 8, minTier: "MYTHIC" },
    { id: "w3_egg", kind: "ITEM", label: "Rare storm egg voucher", rarity: "LEGENDARY", assetId: "egg_voucher_storm", quantity: 1, weight: 5, minTier: "MYTHIC" },
    { id: "w3_riftling", kind: "ITEM", label: "Extremely rare Riftling claim stub", rarity: "MYTHIC", assetId: "riftling_claim_storm", quantity: 1, weight: 2, minTier: "LEGEND", exclusiveOnly: true },
    {
      id: "w3_sol_promo",
      kind: "ITEM",
      label: "Optional SOL promo ticket (flagged)",
      rarity: "MYTHIC",
      assetId: "sol_promo_ticket",
      quantity: 1,
      weight: 1,
      minTier: "LEGEND",
      exclusiveOnly: true,
    },
  ],
  storm_wave_final: [
    { id: "wf_credits", kind: "CREDITS", label: "Participation Credits", rarity: "COMMON", creditsAmount: 40, weight: 50 },
    { id: "wf_lt", kind: "LOYALTY_TOKENS", label: "Participation tokens", rarity: "COMMON", loyaltyTokens: 10, weight: 35 },
    { id: "wf_badge", kind: "BADGE", label: "Badge: Storm Participant", rarity: "UNCOMMON", assetId: "badge_storm_participant", weight: 15 },
  ],
  /** Legacy single-table fallback used by simple roll path. */
  rift_storm: [
    { id: "storm_credits", kind: "CREDITS", label: "Storm Credit surge", rarity: "UNCOMMON", creditsAmount: 100, weight: 30 },
    { id: "storm_lt", kind: "LOYALTY_TOKENS", label: "Storm loyalty cache", rarity: "RARE", loyaltyTokens: 40, weight: 22 },
    { id: "storm_badge", kind: "BADGE", label: "Badge: Storm Touched", rarity: "RARE", assetId: "badge_storm_touched", weight: 18 },
    { id: "storm_cosmetic", kind: "COSMETIC", label: "Tempest ribbon trail", rarity: "EPIC", assetId: "cosmetic_tempest_ribbon", weight: 12, minTier: "GOLD" },
    { id: "storm_title", kind: "TITLE", label: "Title: Storm Rider", rarity: "LEGENDARY", assetId: "title_storm_rider", weight: 6, minTier: "DIAMOND" },
    { id: "storm_housing", kind: "HOUSING", label: "Storm-glass window pane", rarity: "LEGENDARY", assetId: "housing_storm_glass", weight: 4, minTier: "MYTHIC" },
    { id: "storm_legend_crest", kind: "COSMETIC", label: "Legend stormcrest", rarity: "MYTHIC", assetId: "cosmetic_legend_stormcrest", weight: 2, minTier: "LEGEND", exclusiveOnly: true },
  ],
};

export const STORM_SOL_SUBSTITUTE: AirdropRewardDef = {
  id: "storm_sol_substitute_credits",
  kind: "CREDITS",
  label: "Promo Credits (SOL pool unavailable)",
  rarity: "RARE",
  creditsAmount: 150,
  weight: 1,
};

export const DEFAULT_PRESENTATION: StormWorldPresentation = {
  riftSkies: true,
  particles: "reduced",
  audioCue: "sfx.rift_storm_rumble",
  tempPortals: true,
  enemySpawns: true,
  treasureSpawns: true,
  npcWarnings: true,
  a11yReducedMotion: true,
  a11yNoFlash: true,
};

export const STORM_REWARD_CATEGORIES = [
  "Credits",
  "Loyalty Tokens",
  "Materials / fragments / maps",
  "Cosmetics / accessories / skins / emotes",
  "Titles / badges / housing",
  "Seasonal & rare eggs (scarce)",
  "Marketplace coupons",
  "Optional SOL promo (flagged off by default)",
  "Extremely rare Riftling stubs (scarce)",
];

export const STORM_PARTICIPATION_REQUIREMENTS = [
  "Meaningful gameplay during the storm (not login alone)",
  "Reach the wave / qualify score for your storm intensity",
  "Anti-AFK verified actions with diminishing returns",
  "Regional storms require travel unless marked global",
  "Fraud / duplicate / claim-key protection on every grant",
];

/** Active-hour window UTC for random scheduler stub. */
export const STORM_ACTIVE_HOURS_UTC = { start: 14, end: 23 };

export function intensityWeightBoost(intensity: StormIntensityTier): number {
  switch (intensity) {
    case "MINOR":
      return 1;
    case "GREATER":
      return 1.15;
    case "LEGENDARY":
      return 1.35;
    case "SEASONAL":
      return 1.4;
    case "CATACLYSM":
      return 1.6;
  }
}
