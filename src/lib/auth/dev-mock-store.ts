/**
 * Local mock gameplay state for Development Override when DB is unavailable.
 * Persists to localStorage (client) — never a production database.
 */

import {
  DEV_KEEPER_PROFILE,
  DEV_MOCK_STORAGE_KEY,
  type DevKeeperProfile,
} from "@/lib/auth/dev-override";

export type DevMockWorldState = {
  version: 1;
  profile: DevKeeperProfile;
  inventory: Array<{ id: string; itemKey: string; qty: number }>;
  cards: Array<{ id: string; cardKey: string; qty: number }>;
  companions: Array<{ id: string; species: string; name: string; level: number }>;
  decks: Array<{ id: string; name: string; cardIds: string[] }>;
  quests: Array<{ id: string; key: string; status: "active" | "complete" }>;
  friends: Array<{ id: string; displayName: string }>;
  guild: { id: string; name: string; rank: string } | null;
  marketplace: { listingsOwned: number; sales: number };
  achievements: Array<{ key: string; unlockedAt: string }>;
  stats: { battlesWon: number; eggsHatched: number; distanceWalked: number };
  world: { region: string; x: number; y: number; weather: string; timeOfDay: string };
  housing: { homesteadUnlocked: true; plotId: string };
  companionCare: { hunger: number; mood: number; energy: number };
  godMode: boolean;
  collisionDisabled: boolean;
  tutorialReset: boolean;
};

export function createDefaultDevMockState(): DevMockWorldState {
  return {
    version: 1,
    profile: { ...DEV_KEEPER_PROFILE },
    inventory: [
      { id: "inv-1", itemKey: "rift_shard", qty: 9999 },
      { id: "inv-2", itemKey: "care_treat", qty: 500 },
      { id: "inv-3", itemKey: "starter_egg", qty: 10 },
    ],
    cards: [
      { id: "card-1", cardKey: "ember_spark", qty: 4 },
      { id: "card-2", cardKey: "tide_guard", qty: 4 },
      { id: "card-3", cardKey: "rift_bolt", qty: 4 },
    ],
    companions: [
      {
        id: "comp-1",
        species: "emberling",
        name: "Dev Ember",
        level: 50,
      },
      {
        id: "comp-2",
        species: "tideling",
        name: "Dev Tide",
        level: 50,
      },
    ],
    decks: [
      {
        id: "deck-1",
        name: "Dev Starter",
        cardIds: ["card-1", "card-2", "card-3"],
      },
    ],
    quests: [
      { id: "q-1", key: "tutorial_welcome", status: "complete" },
      { id: "q-2", key: "explore_commons", status: "active" },
    ],
    friends: [
      { id: "friend-1", displayName: "Test Ranger" },
      { id: "friend-2", displayName: "Mock Warden" },
    ],
    guild: { id: "guild-dev", name: "Dev Keepers", rank: "leader" },
    marketplace: { listingsOwned: 3, sales: 12 },
    achievements: [
      { key: "first_hatch", unlockedAt: new Date().toISOString() },
      { key: "dev_override", unlockedAt: new Date().toISOString() },
    ],
    stats: { battlesWon: 42, eggsHatched: 18, distanceWalked: 12000 },
    world: {
      region: "riftwild_commons",
      x: 512,
      y: 384,
      weather: "clear",
      timeOfDay: "day",
    },
    housing: { homesteadUnlocked: true, plotId: "plot-dev-1" },
    companionCare: { hunger: 100, mood: 100, energy: 100 },
    godMode: false,
    collisionDisabled: false,
    tutorialReset: false,
  };
}

export function readDevMockState(): DevMockWorldState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEV_MOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevMockWorldState;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDevMockState(state: DevMockWorldState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DEV_MOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota / private mode — ignore; session cookie still works.
  }
}

export function ensureDevMockState(): DevMockWorldState {
  const existing = readDevMockState();
  if (existing) return existing;
  const fresh = createDefaultDevMockState();
  writeDevMockState(fresh);
  return fresh;
}

export function resetDevMockState(): DevMockWorldState {
  const fresh = createDefaultDevMockState();
  writeDevMockState(fresh);
  return fresh;
}

export function patchDevMockState(
  patch: Partial<DevMockWorldState>,
): DevMockWorldState {
  const next = { ...ensureDevMockState(), ...patch };
  writeDevMockState(next);
  return next;
}
