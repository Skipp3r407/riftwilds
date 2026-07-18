/**
 * Living NPC Relationships — server deed ledger.
 * Extends game/npc-ai relationships / reputation; does not replace client memory.
 */

import { relationshipBand } from "@/game/npc-ai/relationships";
import { trackAnalytics } from "@/lib/analytics/events";

export type NpcDeedKind =
  | "talk"
  | "gift"
  | "quest_help"
  | "quest_betray"
  | "defend_in_event"
  | "attack"
  | "promise_kept"
  | "promise_broken"
  | "festival_dance"
  | "rescue";

export type NpcBondRecord = {
  userId: string;
  npcId: string;
  score: number;
  band: ReturnType<typeof relationshipBand>;
  deeds: { kind: NpcDeedKind; detail: string; at: string; delta: number }[];
  lastAt: string;
  titleStub: string | null;
};

const DEED_DELTA: Record<NpcDeedKind, number> = {
  talk: 1,
  gift: 4,
  quest_help: 8,
  quest_betray: -15,
  defend_in_event: 6,
  attack: -20,
  promise_kept: 10,
  promise_broken: -12,
  festival_dance: 3,
  rescue: 9,
};

type Store = { bonds: Map<string, NpcBondRecord> };

function store(): Store {
  const g = globalThis as unknown as { __rwNpcBonds?: Store };
  if (!g.__rwNpcBonds) g.__rwNpcBonds = { bonds: new Map() };
  return g.__rwNpcBonds;
}

function key(userId: string, npcId: string) {
  return `${userId}::${npcId}`;
}

export function resetNpcBondsForTests(): void {
  store().bonds.clear();
}

export function getNpcBond(userId: string, npcId: string): NpcBondRecord {
  const k = key(userId, npcId);
  const existing = store().bonds.get(k);
  if (existing) return existing;
  return {
    userId,
    npcId,
    score: 0,
    band: "neutral",
    deeds: [],
    lastAt: new Date(0).toISOString(),
    titleStub: null,
  };
}

function titleFor(score: number, npcId: string): string | null {
  if (score >= 60) return `Trusted of ${npcId}`;
  if (score >= 20) return `Friend of ${npcId}`;
  if (score <= -40) return `Shunned by ${npcId}`;
  return null;
}

export function recordNpcDeed(params: {
  userId: string;
  npcId: string;
  kind: NpcDeedKind;
  detail?: string;
}): NpcBondRecord {
  const prev = getNpcBond(params.userId, params.npcId);
  const delta = DEED_DELTA[params.kind];
  const score = Math.max(-100, Math.min(100, prev.score + delta));
  const deed = {
    kind: params.kind,
    detail: params.detail ?? params.kind,
    at: new Date().toISOString(),
    delta,
  };
  const next: NpcBondRecord = {
    ...prev,
    score,
    band: relationshipBand(score),
    deeds: [...prev.deeds, deed].slice(-24),
    lastAt: deed.at,
    titleStub: titleFor(score, params.npcId),
  };
  store().bonds.set(key(params.userId, params.npcId), next);
  trackAnalytics("presence_community_event", {
    npcId: params.npcId,
    deed: params.kind,
  });
  return next;
}

/** World-event participation can warm NPC bonds when defend/rescue fires. */
export function applyEventNpcWarmth(params: {
  userId: string;
  npcIds: string[];
  kind?: NpcDeedKind;
}): NpcBondRecord[] {
  return params.npcIds.map((npcId) =>
    recordNpcDeed({
      userId: params.userId,
      npcId,
      kind: params.kind ?? "defend_in_event",
      detail: "Stood with the town during a world event",
    }),
  );
}

export function listBondsForUser(userId: string): NpcBondRecord[] {
  return [...store().bonds.values()].filter((b) => b.userId === userId);
}
