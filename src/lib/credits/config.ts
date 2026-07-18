/**
 * Admin-adjustable Credits economy config.
 * Extreme auto-tuning is forbidden — only admin (or config edits) change caps.
 * Credits ≠ SOL / token profit.
 */

import type { FaucetRule, SinkRule } from "@/lib/credits/types";

export const CREDITS_CONFIG_VERSION = 1;

/** Starter grant for new demo accounts (one-time, idempotent). */
export const STARTER_CREDITS = 200;

/** Global soft ceiling warning — not a hard ban; alerts admin. */
export const CIRCULATION_WARN_THRESHOLD = 50_000_000;

/** Riftling passive bonus — hard caps (no unlimited passive Credits). */
export const RIFTLING_BONUS = {
  maxPerPetPerDay: 5,
  maxPetsCounted: 3,
  maxPerUserPerDay: 15,
  cooldownMs: 4 * 60 * 60 * 1000,
  grantAmount: 5,
} as const;

/** Marketplace fee sink BPS (of listing price in Credits). */
export const MARKETPLACE_CREDIT_FEE_BPS = 250; // 2.5%

/** NPC shop sell-back ratio — prevents infinite buy-sell loops. */
export const NPC_SELL_BACK_BPS = 3500; // 35% of buy price

export const FAUCET_RULES: Record<string, FaucetRule> = {
  QUEST_REWARD: {
    reason: "QUEST_REWARD",
    maxPerGrant: 200,
    dailyCap: 800,
    cooldownMs: 0,
    dailyGrantCount: 40,
    label: "Quest rewards",
    pairedSinks: ["NPC_SHOP_BUY", "REPAIR", "TRAVEL_FEE", "RESTORATION_DONATION", "EGG_PURCHASE"],
  },
  DAILY_GOAL: {
    reason: "DAILY_GOAL",
    maxPerGrant: 50,
    dailyCap: 150,
    cooldownMs: 0,
    dailyGrantCount: 5,
    label: "Daily goals",
    pairedSinks: ["NPC_SHOP_BUY", "CRAFT_FEE", "SERVICE_FEE"],
  },
  WEEKLY_GOAL: {
    reason: "WEEKLY_GOAL",
    maxPerGrant: 200,
    dailyCap: 200,
    cooldownMs: 0,
    dailyGrantCount: 3,
    label: "Weekly goals",
    pairedSinks: ["HOUSING_FEE", "RESTORATION_DONATION", "MARKETPLACE_FEE"],
  },
  GATHER: {
    reason: "GATHER",
    maxPerGrant: 15,
    dailyCap: 120,
    cooldownMs: 20_000,
    dailyGrantCount: 40,
    label: "Gathering",
    pairedSinks: ["CRAFT_FEE", "REPAIR", "NPC_SHOP_BUY"],
  },
  CRAFT: {
    reason: "CRAFT",
    maxPerGrant: 40,
    dailyCap: 200,
    cooldownMs: 30_000,
    dailyGrantCount: 20,
    label: "Crafting completion",
    pairedSinks: ["NPC_SHOP_BUY", "MARKETPLACE_LISTING_FEE", "REPAIR"],
  },
  EVENT_REWARD: {
    reason: "EVENT_REWARD",
    maxPerGrant: 100,
    dailyCap: 300,
    cooldownMs: 60_000,
    dailyGrantCount: 8,
    label: "Public events",
    pairedSinks: ["RESTORATION_DONATION", "TRAVEL_FEE", "SERVICE_FEE"],
  },
  JOB_BOARD: {
    reason: "JOB_BOARD",
    maxPerGrant: 75,
    dailyCap: 300,
    cooldownMs: 45_000,
    dailyGrantCount: 12,
    label: "Job board",
    pairedSinks: ["NPC_SHOP_BUY", "TRAVEL_FEE", "CRAFT_FEE"],
  },
  ACHIEVEMENT: {
    reason: "ACHIEVEMENT",
    maxPerGrant: 100,
    dailyCap: 200,
    cooldownMs: 0,
    dailyGrantCount: 10,
    label: "Achievements (one-time)",
    pairedSinks: ["HOUSING_FEE", "RESTORATION_DONATION"],
  },
  RIFTLING_BONUS: {
    reason: "RIFTLING_BONUS",
    maxPerGrant: RIFTLING_BONUS.grantAmount,
    dailyCap: RIFTLING_BONUS.maxPerUserPerDay,
    cooldownMs: RIFTLING_BONUS.cooldownMs,
    dailyGrantCount: RIFTLING_BONUS.maxPetsCounted * 2,
    label: "Riftling care bonus (capped)",
    pairedSinks: ["NPC_SHOP_BUY", "SERVICE_FEE", "CARE_ACTION", "CARE_ITEM"],
  },
  RESTORATION_PARTICIPATION: {
    reason: "RESTORATION_PARTICIPATION",
    maxPerGrant: 30,
    dailyCap: 90,
    cooldownMs: 120_000,
    dailyGrantCount: 6,
    label: "Restoration participation",
    pairedSinks: ["RESTORATION_DONATION"],
  },
  STARTER_GRANT: {
    reason: "STARTER_GRANT",
    maxPerGrant: STARTER_CREDITS,
    dailyCap: STARTER_CREDITS,
    cooldownMs: 0,
    dailyGrantCount: 1,
    label: "Starter Credits",
    pairedSinks: ["NPC_SHOP_BUY", "TRAVEL_FEE"],
  },
  NPC_SELL_BACK: {
    reason: "NPC_SELL_BACK",
    maxPerGrant: 500,
    dailyCap: 200,
    cooldownMs: 5_000,
    dailyGrantCount: 30,
    label: "NPC shop sell-back (discounted)",
    pairedSinks: ["NPC_SHOP_BUY"],
  },
  STREAK_AIRDROP: {
    reason: "STREAK_AIRDROP",
    maxPerGrant: 500,
    dailyCap: 800,
    cooldownMs: 0,
    dailyGrantCount: 12,
    label: "Loyalty / Rift Storm airdrop Credits",
    pairedSinks: ["NPC_SHOP_BUY", "HOUSING_FEE", "RESTORATION_DONATION"],
  },
  LOYALTY_MILESTONE: {
    reason: "LOYALTY_MILESTONE",
    maxPerGrant: 4_000,
    dailyCap: 4_000,
    cooldownMs: 0,
    dailyGrantCount: 3,
    label: "Loyalty streak milestone Credits",
    pairedSinks: ["HOUSING_FEE", "RESTORATION_DONATION"],
  },
  PRESENCE_IDLE: {
    reason: "PRESENCE_IDLE",
    maxPerGrant: 18,
    dailyCap: 120,
    cooldownMs: 15 * 60_000,
    dailyGrantCount: 8,
    label: "Social presence idle participation (never SOL)",
    pairedSinks: ["HOUSING_FEE", "NPC_SHOP_BUY", "RESTORATION_DONATION"],
  },
  ADMIN_ADJUST: {
    reason: "ADMIN_ADJUST",
    maxPerGrant: 1_000_000,
    dailyCap: 1_000_000,
    cooldownMs: 0,
    dailyGrantCount: 100,
    label: "Admin adjust (credit)",
    pairedSinks: [],
  },
  MARKETPLACE_SALE: {
    reason: "MARKETPLACE_SALE",
    maxPerGrant: 500_000,
    dailyCap: 2_000_000,
    cooldownMs: 0,
    dailyGrantCount: 500,
    label: "Marketplace sale proceeds",
    pairedSinks: ["MARKETPLACE_PURCHASE", "MARKETPLACE_FEE"],
  },
  GUILD_PAYOUT: {
    reason: "GUILD_PAYOUT",
    maxPerGrant: 50_000,
    dailyCap: 200_000,
    cooldownMs: 0,
    dailyGrantCount: 50,
    label: "Guild bank payout",
    pairedSinks: ["GUILD_DUES"],
  },
  TOURNAMENT_PRIZE: {
    reason: "TOURNAMENT_PRIZE",
    maxPerGrant: 25_000,
    dailyCap: 100_000,
    cooldownMs: 0,
    dailyGrantCount: 20,
    label: "Tournament prize (Credits)",
    pairedSinks: ["TOURNAMENT_ENTRY"],
  },
  SEASON_PASS_REFUND: {
    reason: "SEASON_PASS_REFUND",
    maxPerGrant: 5_000,
    dailyCap: 5_000,
    cooldownMs: 0,
    dailyGrantCount: 5,
    label: "Season pass refund",
    pairedSinks: ["SEASON_PASS"],
  },
  LAND_SALE: {
    reason: "LAND_SALE",
    maxPerGrant: 100_000,
    dailyCap: 500_000,
    cooldownMs: 0,
    dailyGrantCount: 50,
    label: "Land parcel sale",
    pairedSinks: ["LAND_CLAIM"],
  },
  PLAYER_SHOP_SALE: {
    reason: "PLAYER_SHOP_SALE",
    maxPerGrant: 100_000,
    dailyCap: 500_000,
    cooldownMs: 0,
    dailyGrantCount: 200,
    label: "Player shop sale",
    pairedSinks: ["PLAYER_SHOP_FEE", "SHOP_BUY"],
  },
  CREATOR_ROYALTY: {
    reason: "CREATOR_ROYALTY",
    maxPerGrant: 50_000,
    dailyCap: 200_000,
    cooldownMs: 0,
    dailyGrantCount: 100,
    label: "Creator marketplace royalty",
    pairedSinks: ["MARKETPLACE_PURCHASE"],
  },
};

export const SINK_RULES: Record<string, SinkRule> = {
  SHOP_BUY: {
    reason: "SHOP_BUY",
    minAmount: 1,
    maxPerAction: 50_000,
    leavesCirculation: true,
    label: "Global shop purchase",
  },
  NPC_SHOP_BUY: {
    reason: "NPC_SHOP_BUY",
    minAmount: 1,
    maxPerAction: 10_000,
    leavesCirculation: true,
    label: "NPC shop purchase",
  },
  REPAIR: {
    reason: "REPAIR",
    minAmount: 5,
    maxPerAction: 500,
    leavesCirculation: true,
    label: "Gear / marker repair",
  },
  TRAVEL_FEE: {
    reason: "TRAVEL_FEE",
    minAmount: 5,
    maxPerAction: 200,
    leavesCirculation: true,
    label: "Region travel fee",
  },
  HOUSING_FEE: {
    reason: "HOUSING_FEE",
    minAmount: 25,
    maxPerAction: 25_000,
    leavesCirculation: true,
    label: "Housing / homestead fee",
  },
  MARKETPLACE_FEE: {
    reason: "MARKETPLACE_FEE",
    minAmount: 1,
    maxPerAction: 100_000,
    leavesCirculation: true,
    label: "Marketplace sale fee",
  },
  MARKETPLACE_LISTING_FEE: {
    reason: "MARKETPLACE_LISTING_FEE",
    minAmount: 5,
    maxPerAction: 5_000,
    leavesCirculation: true,
    label: "Marketplace listing fee",
  },
  RESTORATION_DONATION: {
    reason: "RESTORATION_DONATION",
    minAmount: 10,
    maxPerAction: 100_000,
    leavesCirculation: true,
    label: "World restoration donation (burn)",
  },
  CRAFT_FEE: {
    reason: "CRAFT_FEE",
    minAmount: 5,
    maxPerAction: 2_000,
    leavesCirculation: true,
    label: "Crafting station fee",
  },
  JOB_BOARD_FEE: {
    reason: "JOB_BOARD_FEE",
    minAmount: 1,
    maxPerAction: 100,
    leavesCirculation: true,
    label: "Job board posting fee",
  },
  SERVICE_FEE: {
    reason: "SERVICE_FEE",
    minAmount: 5,
    maxPerAction: 1_000,
    leavesCirculation: true,
    label: "NPC service fee",
  },
  CARE_ACTION: {
    reason: "CARE_ACTION",
    minAmount: 1,
    maxPerAction: 500,
    leavesCirculation: true,
    label: "Pet care action",
  },
  CARE_ITEM: {
    reason: "CARE_ITEM",
    minAmount: 1,
    maxPerAction: 2_000,
    leavesCirculation: true,
    label: "Pet care item / shop",
  },
  EGG_PURCHASE: {
    reason: "EGG_PURCHASE",
    minAmount: 1,
    maxPerAction: 50_000,
    leavesCirculation: true,
    label: "Premium hatchery egg",
  },
  MARKETPLACE_PURCHASE: {
    reason: "MARKETPLACE_PURCHASE",
    minAmount: 1,
    maxPerAction: 500_000,
    leavesCirculation: false,
    label: "Marketplace purchase (gross to seller+fee)",
  },
  BREEDING_FEE: {
    reason: "BREEDING_FEE",
    minAmount: 50,
    maxPerAction: 25_000,
    leavesCirculation: true,
    label: "Riftling breeding fee",
  },
  GUILD_DUES: {
    reason: "GUILD_DUES",
    minAmount: 1,
    maxPerAction: 50_000,
    leavesCirculation: false,
    label: "Guild dues / contribution",
  },
  SEASON_PASS: {
    reason: "SEASON_PASS",
    minAmount: 100,
    maxPerAction: 10_000,
    leavesCirculation: true,
    label: "Season pass unlock",
  },
  TOURNAMENT_ENTRY: {
    reason: "TOURNAMENT_ENTRY",
    minAmount: 10,
    maxPerAction: 5_000,
    leavesCirculation: false,
    label: "Tournament entry fee",
  },
  LAND_CLAIM: {
    reason: "LAND_CLAIM",
    minAmount: 100,
    maxPerAction: 100_000,
    leavesCirculation: true,
    label: "Land parcel claim / purchase",
  },
  PREMIUM_STORE: {
    reason: "PREMIUM_STORE",
    minAmount: 1,
    maxPerAction: 50_000,
    leavesCirculation: true,
    label: "Premium store purchase",
  },
  COLLECTIBLE_BUY: {
    reason: "COLLECTIBLE_BUY",
    minAmount: 1,
    maxPerAction: 50_000,
    leavesCirculation: true,
    label: "Collectible purchase",
  },
  PLAYER_SHOP_FEE: {
    reason: "PLAYER_SHOP_FEE",
    minAmount: 1,
    maxPerAction: 25_000,
    leavesCirculation: true,
    label: "Player shop fee",
  },
  SPIRIT_RECOVERY: {
    reason: "SPIRIT_RECOVERY",
    minAmount: 1,
    maxPerAction: 10_000,
    leavesCirculation: true,
    label: "Spirit recovery service",
  },
  ADMIN_ADJUST: {
    reason: "ADMIN_ADJUST",
    minAmount: 1,
    maxPerAction: 1_000_000,
    leavesCirculation: false,
    label: "Admin adjust (debit)",
  },
};

/** Canonical faucet→sink pairing for balance audits. */
export const FAUCET_SINK_PAIRINGS: {
  faucet: string;
  sinks: string[];
  note: string;
}[] = [
  {
    faucet: "QUEST_REWARD",
    sinks: ["NPC_SHOP_BUY", "REPAIR", "TRAVEL_FEE", "RESTORATION_DONATION"],
    note: "Quest Credits fund shops, repairs, travel, and restoration.",
  },
  {
    faucet: "GATHER",
    sinks: ["CRAFT_FEE", "REPAIR", "NPC_SHOP_BUY"],
    note: "Gathering feeds crafting fees and gear upkeep.",
  },
  {
    faucet: "CRAFT",
    sinks: ["MARKETPLACE_LISTING_FEE", "NPC_SHOP_BUY"],
    note: "Craft rewards encourage listing fees and supply restocks.",
  },
  {
    faucet: "EVENT_REWARD",
    sinks: ["RESTORATION_DONATION", "TRAVEL_FEE"],
    note: "Events push collective restoration burns.",
  },
  {
    faucet: "JOB_BOARD",
    sinks: ["TRAVEL_FEE", "CRAFT_FEE", "NPC_SHOP_BUY"],
    note: "Jobs require travel and materials.",
  },
  {
    faucet: "RIFTLING_BONUS",
    sinks: ["NPC_SHOP_BUY", "SERVICE_FEE", "CARE_ACTION", "CARE_ITEM"],
    note: "Small care bonuses fund care actions / items — never unlimited.",
  },
  {
    faucet: "ACHIEVEMENT",
    sinks: ["HOUSING_FEE", "RESTORATION_DONATION"],
    note: "One-time achievement Credits sink into housing / restoration.",
  },
  {
    faucet: "QUEST_REWARD",
    sinks: ["EGG_PURCHASE"],
    note: "Late keepers burn quest Credits on premium eggs after the free pool is gone.",
  },
  {
    faucet: "PRESENCE_IDLE",
    sinks: ["HOUSING_FEE", "NPC_SHOP_BUY", "RESTORATION_DONATION"],
    note: "Tiny social-presence idle Credits (never SOL) sink into housing / shops / restoration.",
  },
];

export const CREDITS_DISCLAIMER =
  "Credits are in-game soft currency for Riftwilds gameplay. They are not SOL, not a cryptocurrency, not an investment, and never convert to guaranteed token or SOL profit.";
