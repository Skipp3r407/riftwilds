/**
 * Unified item database for Inventory / Companion Care.
 * Bridges TCG mirror cards, shop potions, and care-catalog ids.
 */

import { getCardById, resolveCardImagePath } from "@/content/tcg";
import {
  careItemIdForInventoryId,
  classifyCard,
  type ClassificationCategory,
} from "@/content/tcg/framework/card-classification";
import { getCareCatalogItem } from "@/game/creatures/care-catalog";
import type { InventoryItemDef } from "@/lib/inventory/types";
import {
  BASIC_PET_MEAL_CARE,
  listMigratedInventoryItems,
} from "@/lib/items/card-inventory-migration";
import type { ItemRarity } from "@/lib/items/types";

function tcgRarityToItem(rarity: string | undefined): ItemRarity {
  const map: Record<string, ItemRarity> = {
    common: "COMMON",
    uncommon: "UNCOMMON",
    rare: "RARE",
    epic: "EPIC",
    legendary: "LEGENDARY",
    mythic: "MYTHIC",
  };
  return map[(rarity ?? "common").toLowerCase()] ?? "COMMON";
}

function buildFromMigrated(row: {
  cardId: string;
  name: string;
  inventoryItemId: string;
  previewPath: string;
  cardArtPath: string;
}): InventoryItemDef | null {
  const card = getCardById(row.cardId);
  if (!card) return null;
  const clf = classifyCard(card);
  const careItemId = careItemIdForInventoryId(row.inventoryItemId);
  const care = careItemId ? getCareCatalogItem(careItemId) : undefined;
  const icon =
    resolveCardImagePath(card) ||
    card.art?.assetPath ||
    row.previewPath ||
    row.cardArtPath;
  const mealDefaults =
    row.inventoryItemId === BASIC_PET_MEAL_CARE.inventoryItemId
      ? {
          hunger: BASIC_PET_MEAL_CARE.effects.hunger,
          mood: BASIC_PET_MEAL_CARE.effects.happiness,
          bond: BASIC_PET_MEAL_CARE.effects.bond,
          xp: BASIC_PET_MEAL_CARE.careXp,
        }
      : undefined;
  return {
    id: row.inventoryItemId,
    name: row.name,
    description: card.localization.rulesText || card.localization.flavorText || "",
    category: clf.category,
    useLocation: clf.useLocation,
    rarity: tcgRarityToItem(card.rarity),
    stackable: true,
    maxStack: 99,
    iconPath: icon,
    tcgCardId: row.cardId,
    careItemId,
    careEffects: care
      ? {
          hunger: care.effects.hunger,
          energy: care.effects.energy,
          mood: care.effects.happiness,
          trust: care.effects.bond,
          bond: care.effects.bond,
          xp: care.kind === "meal" || care.kind === "berry" ? 8 : 4,
        }
      : mealDefaults,
  };
}

/** Canonical inventory defs derived from migrated TCG care/world items. */
export const INVENTORY_ITEM_DATABASE: InventoryItemDef[] = listMigratedInventoryItems()
  .map(buildFromMigrated)
  .filter((d): d is InventoryItemDef => Boolean(d));

const BY_ID = new Map(INVENTORY_ITEM_DATABASE.map((d) => [d.id, d]));
const BY_TCG = new Map(
  INVENTORY_ITEM_DATABASE.filter((d) => d.tcgCardId).map((d) => [d.tcgCardId!, d]),
);

export function getInventoryItemDef(id: string): InventoryItemDef | undefined {
  return BY_ID.get(id);
}

export function getInventoryItemByTcgCardId(
  tcgCardId: string,
): InventoryItemDef | undefined {
  return BY_TCG.get(tcgCardId);
}

export function listInventoryItemsByCategory(
  category: ClassificationCategory | "all",
): InventoryItemDef[] {
  if (category === "all") return [...INVENTORY_ITEM_DATABASE];
  return INVENTORY_ITEM_DATABASE.filter((d) => d.category === category);
}

/** Basic Pet Meal — primary Feed Companion example. */
export const BASIC_PET_MEAL = getInventoryItemDef("basic-pet-meal")!;
