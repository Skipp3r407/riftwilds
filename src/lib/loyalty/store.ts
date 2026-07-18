/**
 * In-memory loyalty + Rift Storm store (Phase 1) — mirrors credits/inventory hot path.
 */

import { STORM_DEFAULT_MESSAGE } from "@/lib/loyalty/config";
import type {
  RiftStormState,
  StormAuditEntry,
  StormParticipantState,
  UnclaimedInboxItem,
} from "@/lib/loyalty/rift-storm-types";
import { emptyStreakState } from "@/lib/loyalty/streaks";
import type {
  LoyaltyTokenAccount,
  LoyaltyTokenLedgerEntry,
  PlayerActivityEvent,
  PlayerStreakState,
} from "@/lib/loyalty/types";

type LoyaltyMaps = {
  streaks: Map<string, PlayerStreakState>;
  activities: Map<string, PlayerActivityEvent[]>;
  tokens: Map<string, LoyaltyTokenAccount>;
  tokenLedger: LoyaltyTokenLedgerEntry[];
  claimKeys: Set<string>;
  storm: RiftStormState;
  stormParticipants: Map<string, StormParticipantState>;
  stormInbox: Map<string, UnclaimedInboxItem>;
  stormAudit: StormAuditEntry[];
  stormSolUserDay: Map<string, number>;
  /** Legacy simple roll set */
  stormClaims: Set<string>;
};

function idleStormCompat(): RiftStormState {
  return {
    id: "storm_idle",
    phase: "IDLE",
    intensity: "MINOR",
    triggerReason: "DEV",
    active: false,
    warningStartedAt: null,
    warningEndsAt: null,
    startedAt: null,
    endsAt: null,
    cancelledAt: null,
    cancelReason: null,
    worldMessage: STORM_DEFAULT_MESSAGE,
    warningMessage: "A strange energy is gathering…",
    participantCount: 0,
    winnerCount: 0,
    qualifiedCount: 0,
    publicHighlights: [],
    triggeredBy: "dev",
    eligibleRegions: [],
    regional: {
      regionIds: [],
      weather: "clear",
      empoweredEnemies: false,
      rareRiftlings: false,
      treasureNodes: false,
      npcReactions: false,
      tempQuests: false,
      mapMarkers: false,
      mustTravel: false,
      global: true,
    },
    presentation: {
      riftSkies: false,
      particles: "off",
      audioCue: "",
      tempPortals: false,
      enemySpawns: false,
      treasureSpawns: false,
      npcWarnings: false,
      a11yReducedMotion: true,
      a11yNoFlash: true,
    },
    currentWave: null,
    wavesCompleted: [],
    community: {
      objective: {
        id: "none",
        label: "—",
        description: "",
        targetScore: 500,
        personalThreshold: 10,
        rewardCredits: 0,
        rewardLoyaltyTokens: 0,
      },
      communityScore: 0,
      milestonesHit: [],
    },
    tempQuests: [],
    solPoolLamports: 0,
    solGrantedLamports: 0,
    solGrantsCount: 0,
    seedCommit: "",
    seedReveal: null,
  };
}

function maps(): LoyaltyMaps {
  const g = globalThis as unknown as { __riftwildsLoyalty?: LoyaltyMaps };
  if (!g.__riftwildsLoyalty) {
    g.__riftwildsLoyalty = {
      streaks: new Map(),
      activities: new Map(),
      tokens: new Map(),
      tokenLedger: [],
      claimKeys: new Set(),
      storm: idleStormCompat(),
      stormParticipants: new Map(),
      stormInbox: new Map(),
      stormAudit: [],
      stormSolUserDay: new Map(),
      stormClaims: new Set(),
    };
  }
  return g.__riftwildsLoyalty;
}

export function getStreakState(userId: string): PlayerStreakState {
  const m = maps();
  let state = m.streaks.get(userId);
  if (!state) {
    state = emptyStreakState(userId);
    m.streaks.set(userId, state);
  }
  return state;
}

export function saveStreakState(state: PlayerStreakState): void {
  maps().streaks.set(state.userId, state);
}

export function getActivityLog(userId: string): PlayerActivityEvent[] {
  return maps().activities.get(userId) ?? [];
}

export function saveActivityLog(userId: string, log: PlayerActivityEvent[]): void {
  maps().activities.set(userId, log);
}

export function getTokenAccount(userId: string): LoyaltyTokenAccount {
  const m = maps();
  let acc = m.tokens.get(userId);
  if (!acc) {
    acc = { userId, balance: 0, lifetimeEarned: 0, lifetimeSpent: 0, version: 0 };
    m.tokens.set(userId, acc);
  }
  return acc;
}

export function saveTokenAccount(acc: LoyaltyTokenAccount): void {
  maps().tokens.set(acc.userId, acc);
}

export function appendTokenLedger(entry: LoyaltyTokenLedgerEntry): void {
  const m = maps();
  m.tokenLedger.push(entry);
  if (m.tokenLedger.length > 5000) m.tokenLedger.splice(0, m.tokenLedger.length - 5000);
}

export function listTokenLedger(userId: string, limit = 20): LoyaltyTokenLedgerEntry[] {
  return maps()
    .tokenLedger.filter((e) => e.userId === userId)
    .slice(-limit)
    .reverse();
}

export function hasClaimKey(key: string): boolean {
  return maps().claimKeys.has(key);
}

export function markClaimKey(key: string): void {
  maps().claimKeys.add(key);
}

export function getStormState(): RiftStormState {
  return maps().storm;
}

export function saveStormState(storm: RiftStormState): void {
  maps().storm = storm;
}

export function hasStormClaim(stormId: string, userId: string): boolean {
  return maps().stormClaims.has(`${stormId}:${userId}`);
}

export function markStormClaim(stormId: string, userId: string): void {
  maps().stormClaims.add(`${stormId}:${userId}`);
}

export function participantKey(stormId: string, userId: string): string {
  return `${stormId}:${userId}`;
}

export function getStormParticipant(
  stormId: string,
  userId: string,
): StormParticipantState | undefined {
  return maps().stormParticipants.get(participantKey(stormId, userId));
}

export function saveStormParticipant(p: StormParticipantState): void {
  maps().stormParticipants.set(participantKey(p.stormId, p.userId), p);
}

export function saveStormInboxItem(item: UnclaimedInboxItem): void {
  maps().stormInbox.set(item.id, item);
}

export function getStormInbox(id: string): UnclaimedInboxItem | undefined {
  return maps().stormInbox.get(id);
}

export function listStormInboxForUser(userId: string): UnclaimedInboxItem[] {
  return [...maps().stormInbox.values()].filter((i) => i.userId === userId);
}

export function appendStormAudit(entry: StormAuditEntry): void {
  const m = maps();
  m.stormAudit.push(entry);
  if (m.stormAudit.length > 2000) m.stormAudit.splice(0, m.stormAudit.length - 2000);
}

export function getStormAudit(limit = 50): StormAuditEntry[] {
  return maps().stormAudit.slice(-limit).reverse();
}

export function getStormSolUserDayGrants(userId: string, dayKey: string): number {
  return maps().stormSolUserDay.get(`${userId}:${dayKey}`) ?? 0;
}

export function setStormSolUserDayGrants(userId: string, dayKey: string, n: number): void {
  maps().stormSolUserDay.set(`${userId}:${dayKey}`, n);
}

export function incrementStormSolUserDay(userId: string, dayKey: string): number {
  const next = getStormSolUserDayGrants(userId, dayKey) + 1;
  setStormSolUserDayGrants(userId, dayKey, next);
  return next;
}

/** Test helper */
export function resetLoyaltyStoreForTests(): void {
  const g = globalThis as unknown as { __riftwildsLoyalty?: LoyaltyMaps };
  g.__riftwildsLoyalty = undefined;
}
