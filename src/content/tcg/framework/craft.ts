/**
 * Crafting economy — Gold / Rift Shards / Ancient Fragments / duplicates.
 * Competitive decks MUST remain fully craftable without crypto / SOL.
 */

import type { TcgCard, TcgCraftCost, TcgRarity } from "@/content/tcg/types";

export const CRAFT_POLICY = {
  cryptoRequired: false as const,
  solRequired: false as const,
  wageringAllowed: false as const,
  competitivePath:
    "Every competitive card is craftable with soft currencies and/or duplicates. No SOL, no crypto, no NFT mint required for ladder decks.",
} as const;

/** Default craft tables by rarity (Gold = legacy craftCost units). */
export const CRAFT_TABLE: Record<
  string,
  { gold: number; riftShards: number; ancientFragments: number; duplicateCopies: number }
> = {
  common: { gold: 40, riftShards: 10, ancientFragments: 0, duplicateCopies: 2 },
  uncommon: { gold: 100, riftShards: 25, ancientFragments: 0, duplicateCopies: 2 },
  rare: { gold: 250, riftShards: 60, ancientFragments: 0, duplicateCopies: 2 },
  epic: { gold: 600, riftShards: 150, ancientFragments: 1, duplicateCopies: 1 },
  legendary: { gold: 1200, riftShards: 300, ancientFragments: 3, duplicateCopies: 1 },
  mythic: { gold: 2000, riftShards: 500, ancientFragments: 5, duplicateCopies: 1 },
  founder: { gold: 0, riftShards: 0, ancientFragments: 0, duplicateCopies: 0 },
  seasonal: { gold: 400, riftShards: 100, ancientFragments: 1, duplicateCopies: 1 },
  holiday: { gold: 400, riftShards: 100, ancientFragments: 1, duplicateCopies: 1 },
  animated: { gold: 0, riftShards: 80, ancientFragments: 0, duplicateCopies: 0 },
  foil: { gold: 0, riftShards: 40, ancientFragments: 0, duplicateCopies: 0 },
  signed: { gold: 0, riftShards: 0, ancientFragments: 2, duplicateCopies: 0 },
  collector: { gold: 0, riftShards: 200, ancientFragments: 2, duplicateCopies: 0 },
};

export const DUST_TABLE: Record<string, Partial<TcgCraftCost>> = {
  common: { gold: 10, riftShards: 5 },
  uncommon: { gold: 25, riftShards: 12 },
  rare: { gold: 60, riftShards: 30 },
  epic: { gold: 150, riftShards: 75, ancientFragments: 0 },
  legendary: { gold: 300, riftShards: 150, ancientFragments: 1 },
  mythic: { gold: 500, riftShards: 250, ancientFragments: 2 },
};

export function defaultCraftCost(
  rarity: TcgRarity | string,
  legacyGold?: number,
): TcgCraftCost {
  const row = CRAFT_TABLE[rarity] ?? CRAFT_TABLE.common!;
  return {
    gold: legacyGold && legacyGold > 0 ? legacyGold : row.gold,
    riftShards: row.riftShards,
    ancientFragments: row.ancientFragments,
    duplicateCopies: row.duplicateCopies,
  };
}

export function craftCostForCard(card: TcgCard): TcgCraftCost {
  if (card.craftCosts) return { ...card.craftCosts };
  return defaultCraftCost(card.rarity, card.craftCost);
}

export type CraftWallet = {
  gold: number;
  riftShards: number;
  ancientFragments: number;
};

export type CraftQuote =
  | {
      ok: true;
      cardId: string;
      cost: TcgCraftCost;
      path: "soft_currency" | "duplicates" | "mixed";
      note: string;
    }
  | { ok: false; reason: string };

export function quoteCraft(
  card: TcgCard,
  wallet: CraftWallet,
  ownedCopies: number,
): CraftQuote {
  if (card.finish && card.finish !== "standard" && card.baseCardId) {
    return {
      ok: false,
      reason:
        "Cosmetic finishes craft from the base card + shard finishes — never change stats.",
    };
  }
  if (card.rarity === "founder") {
    return { ok: false, reason: "Founder cards are grant-only (not craftable)." };
  }

  const cost = craftCostForCard(card);
  const canSoft =
    wallet.gold >= cost.gold &&
    wallet.riftShards >= cost.riftShards &&
    wallet.ancientFragments >= cost.ancientFragments;
  const canDupe = ownedCopies >= cost.duplicateCopies + 1; // keep 1 playable

  if (!canSoft && !canDupe) {
    return {
      ok: false,
      reason:
        "Need more Gold / Rift Shards / Ancient Fragments, or extra duplicates. Crypto is never required.",
    };
  }

  const path =
    canSoft && canDupe ? "mixed" : canSoft ? "soft_currency" : "duplicates";

  return {
    ok: true,
    cardId: card.id,
    cost,
    path,
    note: CRAFT_POLICY.competitivePath,
  };
}
