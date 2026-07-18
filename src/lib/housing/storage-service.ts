import { createHash, randomUUID } from "crypto";
import { assertNoPermissionAbuse } from "@/lib/housing/permissions";
import type { HomeStorageSlot, PlayerHome } from "@/lib/housing/types";

/** Used deposit tokens — prevents replay / double-credit of same deposit. */
type TokenStore = { used: Set<string> };

function tokenStore(): TokenStore {
  const g = globalThis as unknown as { __rwHomeStorageTokens?: TokenStore };
  if (!g.__rwHomeStorageTokens) g.__rwHomeStorageTokens = { used: new Set() };
  return g.__rwHomeStorageTokens;
}

export function resetHomeStorageTokensForTests(): void {
  tokenStore().used.clear();
}

function makeDepositToken(userId: string, itemKey: string, qty: number, requestId: string): string {
  return createHash("sha256")
    .update(`${userId}|${itemKey}|${qty}|${requestId}`)
    .digest("hex")
    .slice(0, 32);
}

const MAX_SLOTS = 120;
const MAX_STACK = 999;

export function listHomeStorage(home: PlayerHome, category?: string): HomeStorageSlot[] {
  if (!category) return home.storage;
  return home.storage.filter((s) => s.category === category);
}

export function depositToHomeStorage(params: {
  home: PlayerHome;
  userId: string;
  itemKey: string;
  qty: number;
  category: string;
  requestId: string;
}): { ok: true; home: PlayerHome; slot: HomeStorageSlot } | { ok: false; error: string; message: string } {
  const gate = assertNoPermissionAbuse(params.home, params.userId, "storage_deposit");
  if (!gate.ok) return gate;
  if (params.qty < 1 || params.qty > MAX_STACK) {
    return { ok: false, error: "bad_qty", message: "Invalid quantity." };
  }

  const depositToken = makeDepositToken(
    params.userId,
    params.itemKey,
    params.qty,
    params.requestId,
  );
  if (tokenStore().used.has(depositToken)) {
    return { ok: false, error: "dupe", message: "Duplicate deposit blocked." };
  }

  const existing = params.home.storage.find(
    (s) => s.itemKey === params.itemKey && s.category === params.category,
  );
  if (existing) {
    if (existing.qty + params.qty > MAX_STACK) {
      return { ok: false, error: "stack_cap", message: "Stack capacity exceeded." };
    }
    existing.qty += params.qty;
    existing.depositToken = depositToken;
    tokenStore().used.add(depositToken);
    params.home.revision += 1;
    return { ok: true, home: params.home, slot: existing };
  }

  if (params.home.storage.length >= MAX_SLOTS) {
    return { ok: false, error: "full", message: "Home storage is full." };
  }

  const slot: HomeStorageSlot = {
    slotId: `hs_${randomUUID().slice(0, 12)}`,
    category: params.category.slice(0, 32),
    itemKey: params.itemKey.slice(0, 64),
    qty: params.qty,
    depositToken,
  };
  params.home.storage.push(slot);
  tokenStore().used.add(depositToken);
  params.home.revision += 1;
  params.home.updatedAt = new Date().toISOString();
  return { ok: true, home: params.home, slot };
}

export function withdrawFromHomeStorage(params: {
  home: PlayerHome;
  userId: string;
  slotId: string;
  qty: number;
  requestId: string;
}): { ok: true; home: PlayerHome; itemKey: string; qty: number } | { ok: false; error: string; message: string } {
  const gate = assertNoPermissionAbuse(params.home, params.userId, "storage_take");
  if (!gate.ok) return gate;

  const withdrawToken = makeDepositToken(
    params.userId,
    `withdraw:${params.slotId}`,
    params.qty,
    params.requestId,
  );
  if (tokenStore().used.has(withdrawToken)) {
    return { ok: false, error: "dupe", message: "Duplicate withdraw blocked." };
  }

  const idx = params.home.storage.findIndex((s) => s.slotId === params.slotId);
  if (idx < 0) return { ok: false, error: "missing", message: "Slot not found." };
  const slot = params.home.storage[idx]!;
  if (params.qty < 1 || params.qty > slot.qty) {
    return { ok: false, error: "bad_qty", message: "Invalid withdraw quantity." };
  }

  slot.qty -= params.qty;
  tokenStore().used.add(withdrawToken);
  const itemKey = slot.itemKey;
  if (slot.qty <= 0) params.home.storage.splice(idx, 1);
  params.home.revision += 1;
  params.home.updatedAt = new Date().toISOString();
  return { ok: true, home: params.home, itemKey, qty: params.qty };
}
