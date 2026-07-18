/**
 * Server-side owned-item ledger for Phase 1 demo.
 * Shop grants + starter kits seed ownership; equip APIs never trust the client.
 */

import { DEMO_STARTER_INVENTORY } from "@/lib/shop/demo-inventory";
import { getCatalogItem } from "@/lib/items/catalog";
import type { OwnedItemRef } from "@/lib/equipment/types";

type InventoryMaps = {
  byOwner: Map<string, Map<string, OwnedItemRef>>;
};

function maps(): InventoryMaps {
  const g = globalThis as unknown as { __riftwildsEquipInventory?: InventoryMaps };
  if (!g.__riftwildsEquipInventory) {
    g.__riftwildsEquipInventory = { byOwner: new Map() };
  }
  return g.__riftwildsEquipInventory;
}

function ensureOwnerBag(ownerKey: string): Map<string, OwnedItemRef> {
  const m = maps();
  let bag = m.byOwner.get(ownerKey);
  if (!bag) {
    bag = new Map();
    for (const row of DEMO_STARTER_INVENTORY) {
      bag.set(row.id, {
        itemId: row.id,
        quantity: row.quantity,
        bound: false,
        boundToPetId: null,
      });
    }
    m.byOwner.set(ownerKey, bag);
  }
  return bag;
}

export function listOwnedItems(ownerKey: string): OwnedItemRef[] {
  return [...ensureOwnerBag(ownerKey).values()].filter((r) => r.quantity > 0);
}

export function getOwnedQuantity(ownerKey: string, itemId: string): number {
  return ensureOwnerBag(ownerKey).get(itemId)?.quantity ?? 0;
}

export function ownsItem(ownerKey: string, itemId: string): boolean {
  return getOwnedQuantity(ownerKey, itemId) > 0;
}

/**
 * Grant a catalog item after a validated shop purchase (or demo grant).
 * Rejects unknown catalog ids — never invents items from client strings alone.
 */
export function grantOwnedItem(
  ownerKey: string,
  itemId: string,
  quantity = 1,
): { ok: true; row: OwnedItemRef } | { ok: false; message: string } {
  const catalog = getCatalogItem(itemId);
  if (!catalog) {
    return { ok: false, message: "Unknown catalog item — grant rejected." };
  }
  const qty = Math.max(1, Math.floor(quantity));
  const bag = ensureOwnerBag(ownerKey);
  const existing = bag.get(itemId);
  const next: OwnedItemRef = existing
    ? { ...existing, quantity: existing.quantity + qty }
    : { itemId, quantity: qty, bound: false, boundToPetId: null };
  bag.set(itemId, next);
  return { ok: true, row: next };
}

export function bindItemToPet(
  ownerKey: string,
  itemId: string,
  publicPetId: string,
): boolean {
  const bag = ensureOwnerBag(ownerKey);
  const row = bag.get(itemId);
  if (!row || row.quantity < 1) return false;
  bag.set(itemId, { ...row, bound: true, boundToPetId: publicPetId });
  return true;
}

/** Test helper — wipe owner bag. */
export function __resetInventoryForTests(ownerKey?: string): void {
  const m = maps();
  if (ownerKey) m.byOwner.delete(ownerKey);
  else m.byOwner.clear();
}
