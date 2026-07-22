/**
 * Safe migration: strip non-combat cards from decks into player Inventory.
 * Never deletes catalog entries or artwork — rehomes ownership only.
 */

import { getCardById } from "@/content/tcg";
import {
  classifyCard,
  INVENTORY_REJECT_MESSAGE,
  isInventoryOnlyTcgCardId,
  listInventoryOnlyTcgCardIds,
} from "@/content/tcg/framework/card-classification";
import { padUniqueToConstructedSize, uniqueCardIds } from "@/game/tcg/deck";
import { grantFromTcgMigration } from "@/lib/inventory/player-inventory-store";

export type MigratedDeckResult = {
  originalCardIds: string[];
  combatCardIds: string[];
  strippedCardIds: string[];
  inventoryGrants: { tcgCardId: string; itemId: string | null; quantity: number }[];
  padded: boolean;
};

/**
 * Split a deck list into combat-legal ids + stripped inventory-only ids.
 * Does not mutate stores — caller applies grants / binder updates.
 */
export function splitCombatFromInventory(cardIds: string[]): {
  combatCardIds: string[];
  strippedCardIds: string[];
} {
  const combatCardIds: string[] = [];
  const strippedCardIds: string[] = [];
  for (const id of cardIds) {
    const card = getCardById(id);
    if (!card) {
      strippedCardIds.push(id);
      continue;
    }
    const clf = classifyCard(card);
    if (clf.combatDeckLegal) combatCardIds.push(id);
    else strippedCardIds.push(id);
  }
  return { combatCardIds, strippedCardIds };
}

/**
 * Migrate a binder deck: strip inventory items → grant inventory stacks,
 * then pad the combat list back to constructed size with unique combat cards.
 */
export function migrateDeckToCombatOnly(
  ownerKey: string,
  cardIds: string[],
  opts?: { pad?: boolean; rng?: () => number },
): MigratedDeckResult {
  const { combatCardIds, strippedCardIds } = splitCombatFromInventory(cardIds);
  const inventoryGrants: MigratedDeckResult["inventoryGrants"] = [];

  for (const id of strippedCardIds) {
    if (!isInventoryOnlyTcgCardId(id) && !getCardById(id)) {
      inventoryGrants.push({ tcgCardId: id, itemId: null, quantity: 0 });
      continue;
    }
    const grant = grantFromTcgMigration(ownerKey, id, 1);
    inventoryGrants.push({
      tcgCardId: id,
      itemId: grant.itemId,
      quantity: grant.quantity,
    });
  }

  let next = uniqueCardIds(combatCardIds);
  let padded = false;
  if (opts?.pad !== false) {
    const before = next.length;
    next = padUniqueToConstructedSize(next, opts?.rng);
    padded = next.length !== before || strippedCardIds.length > 0;
  }

  return {
    originalCardIds: [...cardIds],
    combatCardIds: next,
    strippedCardIds,
    inventoryGrants,
    padded,
  };
}

export function inventoryRejectReason(): string {
  return INVENTORY_REJECT_MESSAGE;
}

export function migrationInventoryOnlyCount(): number {
  return listInventoryOnlyTcgCardIds().length;
}
