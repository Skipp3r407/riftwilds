/**
 * Phase 5 — Housing / Homestead Credits economy.
 */

import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { HOMESTEAD_ROOMS } from "@/game/housing/catalog";

export type HomesteadState = {
  userId: string;
  publicId: string;
  name: string;
  themeKey: string;
  unlockedRooms: string[];
  furniture: { key: string; roomKey: string; costCredits: number }[];
  createdAt: string;
};

type Store = { byUser: Map<string, HomesteadState> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsHousing?: Store };
  if (!g.__riftwildsHousing) g.__riftwildsHousing = { byUser: new Map() };
  return g.__riftwildsHousing;
}

/** Test helper */
export function resetHousingForTests(): void {
  const g = globalThis as unknown as { __riftwildsHousing?: Store };
  g.__riftwildsHousing = { byUser: new Map() };
}

export const HOUSING_CREATE_CREDITS = 100;
export const ROOM_UNLOCK_CREDITS = 75;
export const FURNITURE_CATALOG: { key: string; name: string; costCredits: number; roomKey: string }[] = [
  { key: "moss-rug", name: "Moss Rug", costCredits: 40, roomKey: "pet-house" },
  { key: "ember-lantern", name: "Ember Lantern", costCredits: 55, roomKey: "pet-house" },
  { key: "tide-fountain", name: "Tide Fountain", costCredits: 90, roomKey: "garden" },
  { key: "training-dummy", name: "Training Dummy", costCredits: 70, roomKey: "training-yard" },
];

export function getHomestead(userId: string): HomesteadState | null {
  return store().byUser.get(userId) ?? null;
}

export function createHomestead(params: {
  userId: string;
  name: string;
  requestId: string;
}): { ok: true; homestead: HomesteadState } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("HOUSING_ECONOMY_ENABLED")) {
    return { ok: false, error: "disabled", message: "Housing economy disabled" };
  }
  if (store().byUser.has(params.userId)) {
    return { ok: false, error: "exists", message: "Homestead already exists" };
  }
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: HOUSING_CREATE_CREDITS,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "create_homestead" },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };

  const starterRoom = HOMESTEAD_ROOMS[0]?.roomKey ?? "pet-house";
  const homestead: HomesteadState = {
    userId: params.userId,
    publicId: `hs_${params.userId.slice(0, 12)}`,
    name: params.name.slice(0, 40) || "Homestead",
    themeKey: "commons-grove",
    unlockedRooms: [starterRoom],
    furniture: [],
    createdAt: new Date().toISOString(),
  };
  store().byUser.set(params.userId, homestead);
  return { ok: true, homestead };
}

export function unlockHomesteadRoom(params: {
  userId: string;
  roomKey: string;
  requestId: string;
}): { ok: true; homestead: HomesteadState } | { ok: false; error: string; message: string } {
  const hs = store().byUser.get(params.userId);
  if (!hs) return { ok: false, error: "no_homestead", message: "Create a homestead first" };
  if (hs.unlockedRooms.includes(params.roomKey)) {
    return { ok: false, error: "already_unlocked", message: "Room already unlocked" };
  }
  const debit = settleDebit({
    userId: params.userId,
    amount: ROOM_UNLOCK_CREDITS,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "unlock_room", roomKey: params.roomKey },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  hs.unlockedRooms.push(params.roomKey);
  store().byUser.set(params.userId, hs);
  return { ok: true, homestead: hs };
}

export function buyFurniture(params: {
  userId: string;
  furnitureKey: string;
  requestId: string;
}): { ok: true; homestead: HomesteadState } | { ok: false; error: string; message: string } {
  const hs = store().byUser.get(params.userId);
  if (!hs) return { ok: false, error: "no_homestead", message: "Create a homestead first" };
  const item = FURNITURE_CATALOG.find((f) => f.key === params.furnitureKey);
  if (!item) return { ok: false, error: "unknown_item", message: "Unknown furniture" };
  if (!hs.unlockedRooms.includes(item.roomKey)) {
    return { ok: false, error: "room_locked", message: "Unlock the room first" };
  }
  const debit = settleDebit({
    userId: params.userId,
    amount: item.costCredits,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { action: "buy_furniture", furnitureKey: item.key },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  hs.furniture.push({ key: item.key, roomKey: item.roomKey, costCredits: item.costCredits });
  store().byUser.set(params.userId, hs);
  return { ok: true, homestead: hs };
}
