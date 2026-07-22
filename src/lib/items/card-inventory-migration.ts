/**
 * Maps legacy TCG card ids → Inventory / Companion Care catalog ids.
 * Artwork + lore stay on the card records; gameplay ownership moves here.
 */

import { getCardById, TCG_CARDS } from "@/content/tcg";
import {
  classifyCardSystem,
  type InventoryDomain,
  type CardSystemClass,
} from "@/content/tcg/framework/combat-eligibility";

export type MigratedInventoryItem = {
  cardId: string;
  name: string;
  inventoryItemId: string;
  domain: InventoryDomain;
  careActionHint?: string;
  /** Prefer existing shop/CARE catalog art when present. */
  previewPath: string;
  cardArtPath: string;
};

function cardName(cardId: string): string {
  const card = getCardById(cardId);
  return card?.localization?.name ?? cardId;
}

function previewPathFor(cls: Extract<CardSystemClass, { system: "inventory" }>): string {
  const id = cls.inventoryItemId;
  if (cls.domain === "material") {
    return `/assets/items/materials/icons/${id}.png`;
  }
  if (cls.domain === "tool") {
    return `/assets/items/tools/icons/${id}.png`;
  }
  if (cls.domain === "quest") {
    return `/assets/items/quests/icons/${id}.png`;
  }
  // Food / care / potions / medicine share potions icon tree in this codebase.
  return `/assets/items/potions/icons/${id}.png`;
}

function cardArtPath(cardId: string): string {
  const card = getCardById(cardId);
  return (
    card?.art?.cardImagePath ??
    `/assets/tcg/cards/${cardId}.webp`
  );
}

/** Every catalog card currently classified as inventory-only. */
export function listMigratedInventoryItems(): MigratedInventoryItem[] {
  const out: MigratedInventoryItem[] = [];
  for (const card of TCG_CARDS) {
    const cls = classifyCardSystem(card.id, card.type);
    if (cls.system !== "inventory") continue;
    out.push({
      cardId: card.id,
      name: cardName(card.id),
      inventoryItemId: cls.inventoryItemId,
      domain: cls.domain,
      careActionHint: cls.careActionHint,
      previewPath: previewPathFor(cls),
      cardArtPath: cardArtPath(card.id),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function migrationCountsByDomain(): Record<InventoryDomain, number> {
  const counts = {} as Record<InventoryDomain, number>;
  for (const row of listMigratedInventoryItems()) {
    counts[row.domain] = (counts[row.domain] ?? 0) + 1;
  }
  return counts;
}

/**
 * Basic Pet Meal — canonical Companion Care feed profile.
 * Used by PET_FEEDING docs + care GIVE_ITEM path.
 */
export const BASIC_PET_MEAL_CARE = {
  inventoryItemId: "basic-pet-meal",
  cardId: "rotr-s-item-basic-pet-meal",
  domain: "food" as const,
  effects: {
    hunger: 25,
    happiness: 5,
    bond: 3,
  },
  careXp: 8,
  stackMax: 50,
  description:
    "Feed Companion outside battle — restores hunger, small bond gain, and care XP. Not a combat spell.",
} as const;

export function demoInventoryTabForDomain(
  domain: InventoryDomain,
):
  | "Food"
  | "Care"
  | "Potions"
  | "Materials"
  | "Recovery"
  | "Tools"
  | "Quests"
  | "Collectibles" {
  switch (domain) {
    case "food":
      return "Food";
    case "toy":
    case "housing":
    case "care":
    case "cosmetic":
      return "Care";
    case "potion":
      return "Potions";
    case "medicine":
    case "recovery":
      return "Recovery";
    case "material":
    case "crafting":
      return "Materials";
    case "tool":
      return "Tools";
    case "quest":
      return "Quests";
    default:
      return "Collectibles";
  }
}
