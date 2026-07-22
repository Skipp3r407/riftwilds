/**
 * In-memory player inventory quantities (world / care items).
 * Combat binder stays in collection-store; this ledger holds Feed/Play goods.
 */

import type {
  PlayerInventorySnapshot,
  PlayerInventoryStack,
} from "@/lib/inventory/types";
import {
  getInventoryItemByTcgCardId,
  getInventoryItemDef,
} from "@/lib/inventory/item-database";
import { DEMO_STARTER_INVENTORY } from "@/lib/shop/demo-inventory";

type Bag = {
  ownerKey: string;
  stacks: Map<string, number>;
  updatedAt: string;
};

const globalForBags = globalThis as unknown as {
  __riftwildsPlayerInventory?: Map<string, Bag>;
};

function bags(): Map<string, Bag> {
  if (!globalForBags.__riftwildsPlayerInventory) {
    globalForBags.__riftwildsPlayerInventory = new Map();
  }
  return globalForBags.__riftwildsPlayerInventory;
}

function nowIso(): string {
  return new Date().toISOString();
}

function ensure(ownerKey: string): Bag {
  let bag = bags().get(ownerKey);
  if (!bag) {
    const stacks = new Map<string, number>();
    for (const row of DEMO_STARTER_INVENTORY) {
      stacks.set(row.id, row.quantity);
    }
    bag = { ownerKey, stacks, updatedAt: nowIso() };
    bags().set(ownerKey, bag);
  }
  return bag;
}

export function getPlayerInventory(ownerKey: string): PlayerInventorySnapshot {
  const bag = ensure(ownerKey);
  const stacks: PlayerInventoryStack[] = [...bag.stacks.entries()]
    .filter(([, qty]) => qty > 0)
    .map(([itemId, quantity]) => ({ itemId, quantity }))
    .sort((a, b) => a.itemId.localeCompare(b.itemId));
  return { ownerKey, stacks, updatedAt: bag.updatedAt };
}

export function getInventoryQuantity(ownerKey: string, itemId: string): number {
  return ensure(ownerKey).stacks.get(itemId) ?? 0;
}

export function grantInventoryItem(
  ownerKey: string,
  itemId: string,
  amount = 1,
): { ok: boolean; itemId: string; quantity: number } {
  if (amount <= 0) {
    return { ok: false, itemId, quantity: getInventoryQuantity(ownerKey, itemId) };
  }
  const bag = ensure(ownerKey);
  const def = getInventoryItemDef(itemId);
  const max = def?.maxStack ?? 99;
  const next = Math.min(max, (bag.stacks.get(itemId) ?? 0) + Math.floor(amount));
  bag.stacks.set(itemId, next);
  bag.updatedAt = nowIso();
  return { ok: true, itemId, quantity: next };
}

export function consumeInventoryItem(
  ownerKey: string,
  itemId: string,
  amount = 1,
): { ok: boolean; itemId: string; quantity: number; reason?: string } {
  const bag = ensure(ownerKey);
  const have = bag.stacks.get(itemId) ?? 0;
  if (have < amount) {
    return { ok: false, itemId, quantity: have, reason: "NOT_ENOUGH" };
  }
  const next = have - Math.floor(amount);
  if (next <= 0) bag.stacks.delete(itemId);
  else bag.stacks.set(itemId, next);
  bag.updatedAt = nowIso();
  return { ok: true, itemId, quantity: next };
}

/** Grant stacks from TCG deck migration (inventory-only card ids). */
export function grantFromTcgMigration(
  ownerKey: string,
  tcgCardId: string,
  amount = 1,
): { ok: boolean; itemId: string | null; quantity: number } {
  const def = getInventoryItemByTcgCardId(tcgCardId);
  if (!def) return { ok: false, itemId: null, quantity: 0 };
  const r = grantInventoryItem(ownerKey, def.id, amount);
  return { ok: r.ok, itemId: def.id, quantity: r.quantity };
}

export function __clearPlayerInventoryForTests(): void {
  bags().clear();
}
