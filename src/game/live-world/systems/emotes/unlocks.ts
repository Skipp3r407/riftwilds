/**
 * Emote unlocks + wheel favorites — cosmetic Credits unlocks only.
 */

import {
  defaultWheelSlots,
  getEmoteDef,
  STARTER_EMOTE_KEYS,
} from "@/game/live-world/systems/emotes/catalog";
import type {
  EmoteFavoritesState,
  EmoteUnlockState,
} from "@/game/live-world/systems/emotes/types";

export const UNLOCKS_STORAGE_KEY = "riftwilds-emote-unlocks-v1";
export const FAVORITES_STORAGE_KEY = "riftwilds-emote-favorites-v1";

export function defaultUnlocks(): EmoteUnlockState {
  return { unlockedKeys: [...STARTER_EMOTE_KEYS] };
}

export function loadUnlocks(): EmoteUnlockState {
  const base = defaultUnlocks();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(UNLOCKS_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<EmoteUnlockState>;
    const extra = Array.isArray(parsed.unlockedKeys)
      ? parsed.unlockedKeys.map(String)
      : [];
    return {
      unlockedKeys: [...new Set([...base.unlockedKeys, ...extra])],
    };
  } catch {
    return base;
  }
}

export function saveUnlocks(state: EmoteUnlockState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(UNLOCKS_STORAGE_KEY, JSON.stringify(state));
}

export function isEmoteUnlocked(state: EmoteUnlockState, key: string): boolean {
  const def = getEmoteDef(key);
  if (!def) return false;
  if (def.tier === "free") return true;
  return state.unlockedKeys.includes(def.key);
}

export function unlockEmoteWithCredits(
  state: EmoteUnlockState,
  key: string,
  availableCredits: number,
):
  | { ok: true; state: EmoteUnlockState; cost: number; note: string }
  | { ok: false; reason: string } {
  const def = getEmoteDef(key);
  if (!def) return { ok: false, reason: "Unknown emote" };
  if (def.tier === "free") return { ok: false, reason: "Already free" };
  if (state.unlockedKeys.includes(def.key)) {
    return { ok: false, reason: "Already unlocked" };
  }
  const cost = def.creditsCost ?? 0;
  if (availableCredits < cost) {
    return { ok: false, reason: "Not enough Credits" };
  }
  const next = {
    unlockedKeys: [...state.unlockedKeys, def.key],
  };
  return {
    ok: true,
    state: next,
    cost,
    note:
      def.tier === "premium_cosmetic"
        ? "Premium cosmetic only — no combat, economy, or SOL advantage."
        : "Cosmetic unlock only — no gameplay advantage.",
  };
}

export function defaultFavorites(): EmoteFavoritesState {
  return {
    wheelSlots: defaultWheelSlots(),
    favorites: defaultWheelSlots().filter(Boolean) as string[],
  };
}

export function loadFavorites(): EmoteFavoritesState {
  const base = defaultFavorites();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<EmoteFavoritesState>;
    const slots = Array.isArray(parsed.wheelSlots)
      ? parsed.wheelSlots.slice(0, 8).map((s) => (s ? String(s) : null))
      : base.wheelSlots;
    while (slots.length < 8) slots.push(null);
    return {
      wheelSlots: slots,
      favorites: Array.isArray(parsed.favorites)
        ? parsed.favorites.map(String)
        : base.favorites,
    };
  } catch {
    return base;
  }
}

export function saveFavorites(state: EmoteFavoritesState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state));
}

export function setWheelSlot(
  state: EmoteFavoritesState,
  index: number,
  emoteKey: string | null,
): EmoteFavoritesState {
  if (index < 0 || index > 7) return state;
  const wheelSlots = [...state.wheelSlots];
  wheelSlots[index] = emoteKey;
  const favorites = [
    ...new Set([
      ...state.favorites.filter((k) => k !== emoteKey),
      ...(emoteKey ? [emoteKey] : []),
    ]),
  ];
  return { wheelSlots, favorites };
}
