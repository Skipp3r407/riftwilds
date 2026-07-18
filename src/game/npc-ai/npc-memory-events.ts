/**
 * Structured NPC memory of player deeds — helped / attacked / family / quests / promises.
 * Extends relationship stubs without replacing them.
 */

import {
  adjustRelationship,
  ensureMemoryHelpers,
  type NpcRelationshipStore,
} from "@/game/npc-ai/relationships";

export type NpcMemoryKind =
  | "helped"
  | "attacked"
  | "family"
  | "quest"
  | "promise"
  | "witnessed_crime"
  | "forgave"
  | "traded"
  | "spoke";

export type NpcMemoryEvent = {
  kind: NpcMemoryKind;
  detail: string;
  at: number;
  regionId?: string;
};

const KIND_DELTA: Record<NpcMemoryKind, number> = {
  helped: 12,
  attacked: -25,
  family: 8,
  quest: 6,
  promise: 4,
  witnessed_crime: -10,
  forgave: 8,
  traded: 3,
  spoke: 1,
};

/** Record a structured memory and bump relationship. */
export function recordNpcMemoryEvent(
  store: NpcRelationshipStore,
  npcSlug: string,
  event: Omit<NpcMemoryEvent, "at"> & { at?: number },
): NpcRelationshipStore {
  ensureMemoryHelpers(store, npcSlug);
  const entry = store.byNpc[npcSlug]!;
  const full: NpcMemoryEvent = {
    kind: event.kind,
    detail: event.detail,
    at: event.at ?? Date.now(),
    regionId: event.regionId,
  };
  entry.events = [...(entry.events ?? []), full].slice(-16);
  const tag = `${event.kind}:${event.detail}`.slice(0, 64);
  return adjustRelationship(store, npcSlug, KIND_DELTA[event.kind], tag);
}

export function memoriesOfKind(
  store: NpcRelationshipStore,
  npcSlug: string,
  kind: NpcMemoryKind,
): NpcMemoryEvent[] {
  return (store.byNpc[npcSlug]?.events ?? [])
    .filter((e) => e.kind === kind)
    .map((e) => ({
      kind: e.kind as NpcMemoryKind,
      detail: e.detail,
      at: e.at,
      regionId: e.regionId,
    }));
}

export function hasMemory(
  store: NpcRelationshipStore,
  npcSlug: string,
  kind: NpcMemoryKind,
): boolean {
  return memoriesOfKind(store, npcSlug, kind).length > 0;
}

/** Personal memory can override gossip — e.g. you attacked *this* NPC. */
export function personalHostility(
  store: NpcRelationshipStore,
  npcSlug: string,
): boolean {
  return hasMemory(store, npcSlug, "attacked") || hasMemory(store, npcSlug, "witnessed_crime");
}

export function personalGratitude(
  store: NpcRelationshipStore,
  npcSlug: string,
): boolean {
  return (
    hasMemory(store, npcSlug, "helped") ||
    hasMemory(store, npcSlug, "forgave") ||
    hasMemory(store, npcSlug, "quest")
  );
}
