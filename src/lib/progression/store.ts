/**
 * In-memory progression store — Prisma-ready shape. Auto-saves after each grant.
 */

import { BASE_COMBAT_STATS } from "@/lib/progression/rewards";
import type { ProgressionState } from "@/lib/progression/types";

type Store = {
  players: Map<string, ProgressionState>;
};

const globalForProgression = globalThis as unknown as {
  __riftwildsProgression?: Store;
};

function createStore(): Store {
  return { players: new Map() };
}

function store(): Store {
  if (!globalForProgression.__riftwildsProgression) {
    globalForProgression.__riftwildsProgression = createStore();
  }
  return globalForProgression.__riftwildsProgression;
}

export function resetProgressionStoreForTests(): void {
  globalForProgression.__riftwildsProgression = createStore();
}

export function emptyProgressionState(ownerKey: string): ProgressionState {
  const now = Date.now();
  return {
    ownerKey,
    userId: null,
    level: 1,
    currentXp: 0,
    lifetimeXp: 0,
    prestige: 0,
    prestigeUnlocked: false,
    statPoints: 0,
    skillPoints: 0,
    masteryXp: 0,
    combatStats: { ...BASE_COMBAT_STATS },
    unlockedRewards: [],
    titles: [],
    cosmetics: [],
    auras: [],
    loginStreak: 0,
    lastLoginDayKey: "",
    longestLoginStreak: 0,
    restedXpPool: 0,
    lastSeenAt: now,
    comboActivities: [],
    comboWindowStartedAt: now,
    highestCombo: 0,
    battlesWon: 0,
    battlesPlayed: 0,
    questsCompleted: 0,
    hoursPlayedApprox: 0,
    opponentWinCounts: {},
    cardMastery: {},
    petMastery: {},
    weaponMastery: {},
    notifications: [],
    recentUnlocks: [],
    processedRequestIds: [],
    grantedMatchIds: [],
    version: 0,
    updatedAt: now,
  };
}

export function getProgressionState(ownerKey: string): ProgressionState {
  const s = store();
  const existing = s.players.get(ownerKey);
  if (existing) return existing;
  const fresh = emptyProgressionState(ownerKey);
  s.players.set(ownerKey, fresh);
  return fresh;
}

export function saveProgressionState(state: ProgressionState): ProgressionState {
  const next = { ...state, updatedAt: Date.now(), version: state.version + 1 };
  store().players.set(state.ownerKey, next);
  return next;
}

export function replaceProgressionState(state: ProgressionState): void {
  store().players.set(state.ownerKey, state);
}
