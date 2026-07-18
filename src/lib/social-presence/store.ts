/**
 * In-memory Presence player state — Prisma-ready shape.
 */

import { DEFAULT_PRIVACY } from "@/lib/social-presence/privacy";
import type { PresencePlayerState } from "@/lib/social-presence/types";

type Store = {
  players: Map<string, PresencePlayerState>;
  fingerprints: Map<string, Set<string>>;
  sessionStartedAt: Map<string, number>;
};

const globalForPresence = globalThis as unknown as {
  __riftwildsSocialPresence?: Store;
};

function createStore(): Store {
  return {
    players: new Map(),
    fingerprints: new Map(),
    sessionStartedAt: new Map(),
  };
}

function store(): Store {
  if (!globalForPresence.__riftwildsSocialPresence) {
    globalForPresence.__riftwildsSocialPresence = createStore();
  }
  return globalForPresence.__riftwildsSocialPresence;
}

export function resetSocialPresenceStoreForTests(): void {
  globalForPresence.__riftwildsSocialPresence = createStore();
}

export function emptyPresenceState(userId: string): PresencePlayerState {
  return {
    userId,
    presenceXp: 0,
    lifetimePresenceXp: 0,
    presenceLevel: "wanderer",
    communityTokenBalance: 0,
    communityTokensEarnedToday: 0,
    communityTokenDayKey: "",
    activityScore: 0,
    engagementTier: 0,
    serverPresenceState: "IDLE",
    status: "Exploring",
    statusSetAt: null,
    currentRegionSlug: null,
    currentLocationId: null,
    currentHubId: null,
    inRestZone: false,
    restZoneKind: null,
    inputs: [],
    actions: [],
    lastMeaningfulAt: null,
    genuineActiveMs: 0,
    qualifiedActiveMs: 0,
    lastIdleClaimAt: null,
    idleClaimsToday: 0,
    idleClaimDayKey: "",
    presenceXpEarnedHour: 0,
    presenceXpHourKey: "",
    presenceXpEarnedDay: 0,
    presenceXpDayKey: "",
    categoryCounts: {},
    categoryWindowStartedAt: Date.now(),
    achievementsUnlocked: [],
    featuredTitles: [],
    activeFeaturedTitle: null,
    homeLikesGiven: [],
    fingerprintHash: null,
    helperOptIn: false,
    helperEligible: false,
    riskScore: 0,
    socialRewardRestrictedUntil: null,
    privacy: { ...DEFAULT_PRIVACY },
    socialStreakDays: 0,
    lastSocialStreakDayKey: "",
    sessionMilestonesClaimed: [],
    dailyTaskProgress: {},
    dailyTaskDayKey: "",
    dailyTasksClaimed: [],
    version: 0,
  };
}

export function getPresenceState(userId: string): PresencePlayerState {
  const s = store();
  const existing = s.players.get(userId);
  if (existing) {
    // Migrate older in-memory shapes if hot-reloaded mid-dev
    if (existing.presenceLevel == null) {
      const merged = { ...emptyPresenceState(userId), ...existing };
      s.players.set(userId, merged);
      return merged;
    }
    return existing;
  }
  const created = emptyPresenceState(userId);
  s.players.set(userId, created);
  if (!s.sessionStartedAt.has(userId)) s.sessionStartedAt.set(userId, Date.now());
  return created;
}

export function savePresenceState(state: PresencePlayerState): PresencePlayerState {
  const next = { ...state, version: state.version + 1 };
  store().players.set(state.userId, next);
  return next;
}

export function registerFingerprint(userId: string, fingerprintHash: string | null): number {
  if (!fingerprintHash) return 0;
  const s = store();
  const set = s.fingerprints.get(fingerprintHash) ?? new Set();
  set.add(userId);
  s.fingerprints.set(fingerprintHash, set);
  return Math.max(0, set.size - 1);
}

export function otherAccountsForFingerprint(
  fingerprintHash: string | null,
  userId: string,
): number {
  if (!fingerprintHash) return 0;
  const set = store().fingerprints.get(fingerprintHash);
  if (!set) return 0;
  return Math.max(0, [...set].filter((id) => id !== userId).length);
}

export function getSessionStartedAt(userId: string): number | null {
  return store().sessionStartedAt.get(userId) ?? null;
}

export function touchSessionStart(userId: string, now = Date.now()): void {
  const s = store();
  if (!s.sessionStartedAt.has(userId)) s.sessionStartedAt.set(userId, now);
}
