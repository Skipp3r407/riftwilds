/**
 * Canonical XP amounts by source key. Clients never supply amounts.
 */

import type { XpSourceCategory, XpSourceKey } from "@/lib/progression/types";

export const XP_SOURCE_AMOUNTS: Record<XpSourceKey, number> = {
  BATTLE_LOSS: 10,
  BATTLE_WIN: 50,
  BATTLE_PERFECT: 25,
  BATTLE_NO_CARDS_LOST: 30,
  BATTLE_HIGHER_RANK: 75,
  BATTLE_TOURNAMENT_WIN: 500,

  QUEST_SMALL: 100,
  QUEST_MEDIUM: 350,
  QUEST_LARGE: 750,
  QUEST_EPIC: 2000,
  QUEST_LEGENDARY: 5000,

  EXPLORE_NEW_AREA: 50,
  EXPLORE_TOWN: 200,
  EXPLORE_SECRET: 500,
  EXPLORE_DUNGEON: 750,

  RIFT_HATCH: 100,
  RIFT_FEED: 10,
  RIFT_PLAY: 10,
  RIFT_EVOLUTION: 250,
  RIFT_RARE_EVOLUTION: 500,

  CRAFT_ITEM: 25,
  CRAFT_RARE: 100,
  CRAFT_LEGENDARY: 500,
  CRAFT_UPGRADE: 75,

  MARKET_SELL: 10,
  MARKET_RARE_SALE: 40,
  MARKET_AUCTION_WIN: 50,
  MARKET_FIRST_SALE: 100,

  DAILY_LOGIN: 25,
  WEEKLY_CHALLENGE: 2000,
  MONTHLY_CHALLENGE: 10000,
};

export const XP_SOURCE_CATEGORY: Record<XpSourceKey, XpSourceCategory> = {
  BATTLE_LOSS: "BATTLE",
  BATTLE_WIN: "BATTLE",
  BATTLE_PERFECT: "BATTLE",
  BATTLE_NO_CARDS_LOST: "BATTLE",
  BATTLE_HIGHER_RANK: "BATTLE",
  BATTLE_TOURNAMENT_WIN: "BATTLE",

  QUEST_SMALL: "QUEST",
  QUEST_MEDIUM: "QUEST",
  QUEST_LARGE: "QUEST",
  QUEST_EPIC: "QUEST",
  QUEST_LEGENDARY: "QUEST",

  EXPLORE_NEW_AREA: "EXPLORATION",
  EXPLORE_TOWN: "EXPLORATION",
  EXPLORE_SECRET: "EXPLORATION",
  EXPLORE_DUNGEON: "EXPLORATION",

  RIFT_HATCH: "RIFTLING",
  RIFT_FEED: "RIFTLING",
  RIFT_PLAY: "RIFTLING",
  RIFT_EVOLUTION: "RIFTLING",
  RIFT_RARE_EVOLUTION: "RIFTLING",

  CRAFT_ITEM: "CRAFTING",
  CRAFT_RARE: "CRAFTING",
  CRAFT_LEGENDARY: "CRAFTING",
  CRAFT_UPGRADE: "CRAFTING",

  MARKET_SELL: "MARKETPLACE",
  MARKET_RARE_SALE: "MARKETPLACE",
  MARKET_AUCTION_WIN: "MARKETPLACE",
  MARKET_FIRST_SALE: "MARKETPLACE",

  DAILY_LOGIN: "DAILY",
  WEEKLY_CHALLENGE: "DAILY",
  MONTHLY_CHALLENGE: "DAILY",
};

const SOURCE_KEYS = new Set<string>(Object.keys(XP_SOURCE_AMOUNTS));

export function isXpSourceKey(value: unknown): value is XpSourceKey {
  return typeof value === "string" && SOURCE_KEYS.has(value);
}

export function getBaseXpForSource(key: XpSourceKey): number {
  return XP_SOURCE_AMOUNTS[key] ?? 0;
}

/** Map quest difficulty / catalog XP into a grant key. */
export function questXpSourceFromReward(params: {
  difficulty?: "easy" | "medium" | "hard" | null;
  catalogXp?: number | null;
}): XpSourceKey {
  const amount = params.catalogXp ?? null;
  if (amount != null) {
    if (amount >= 5000) return "QUEST_LEGENDARY";
    if (amount >= 2000) return "QUEST_EPIC";
    if (amount >= 750) return "QUEST_LARGE";
    if (amount >= 350) return "QUEST_MEDIUM";
    return "QUEST_SMALL";
  }
  if (params.difficulty === "hard") return "QUEST_LARGE";
  if (params.difficulty === "medium") return "QUEST_MEDIUM";
  return "QUEST_SMALL";
}
