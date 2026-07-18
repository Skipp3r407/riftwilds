/**
 * Relationship + memory stubs — localStorage, Phase 1.
 * Extended with structured events for reputation / forgiveness.
 */

export const NPC_RELATIONSHIP_KEY = "riftwilds-npc-relationships-v1";

export type NpcMemoryEventRef = {
  kind: string;
  detail: string;
  at: number;
  regionId?: string;
};

export type NpcRelationshipEntry = {
  score: number; // -100 .. 100
  memories: string[];
  /** Structured deed memory (helped / attacked / quests / promises…). */
  events?: NpcMemoryEventRef[];
  lastInteractionAt: number;
  talkedCount: number;
  killerNoticed: boolean;
  /** Broader social reaction already fired. */
  socialNoticed?: boolean;
};

export type NpcRelationshipStore = {
  byNpc: Record<string, NpcRelationshipEntry>;
  updatedAt: number;
};

export function createEmptyRelationships(): NpcRelationshipStore {
  return { byNpc: {}, updatedAt: Date.now() };
}

export function loadRelationships(): NpcRelationshipStore {
  if (typeof window === "undefined") return createEmptyRelationships();
  try {
    const raw = localStorage.getItem(NPC_RELATIONSHIP_KEY);
    if (!raw) return createEmptyRelationships();
    const parsed = JSON.parse(raw) as NpcRelationshipStore;
    return {
      ...createEmptyRelationships(),
      ...parsed,
      byNpc: parsed.byNpc ?? {},
    };
  } catch {
    return createEmptyRelationships();
  }
}

export function saveRelationships(store: NpcRelationshipStore): void {
  if (typeof window === "undefined") return;
  try {
    store.updatedAt = Date.now();
    localStorage.setItem(NPC_RELATIONSHIP_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

function ensureEntry(
  store: NpcRelationshipStore,
  npcSlug: string,
): NpcRelationshipEntry {
  if (!store.byNpc[npcSlug]) {
    store.byNpc[npcSlug] = {
      score: 0,
      memories: [],
      events: [],
      lastInteractionAt: 0,
      talkedCount: 0,
      killerNoticed: false,
      socialNoticed: false,
    };
  }
  const entry = store.byNpc[npcSlug]!;
  if (!entry.events) entry.events = [];
  return entry;
}

/** Ensure entry exists for memory helpers (exported). */
export function ensureMemoryHelpers(
  store: NpcRelationshipStore,
  npcSlug: string,
): NpcRelationshipEntry {
  return ensureEntry(store, npcSlug);
}

export function clampScore(n: number): number {
  return Math.max(-100, Math.min(100, Math.round(n)));
}

export function adjustRelationship(
  store: NpcRelationshipStore,
  npcSlug: string,
  delta: number,
  memory?: string,
): NpcRelationshipStore {
  const entry = ensureEntry(store, npcSlug);
  entry.score = clampScore(entry.score + delta);
  entry.lastInteractionAt = Date.now();
  if (memory) {
    entry.memories = [...entry.memories, memory].slice(-8);
  }
  return store;
}

export function recordTalk(
  store: NpcRelationshipStore,
  npcSlug: string,
  memory = "spoke",
): NpcRelationshipStore {
  const entry = ensureEntry(store, npcSlug);
  entry.talkedCount += 1;
  entry.lastInteractionAt = Date.now();
  entry.score = clampScore(entry.score + 1);
  entry.memories = [...entry.memories, memory].slice(-8);
  return store;
}

export function getRelationshipScore(
  store: NpcRelationshipStore,
  npcSlug: string,
): number {
  return store.byNpc[npcSlug]?.score ?? 0;
}

export function relationshipBand(score: number): "hostile" | "wary" | "neutral" | "friendly" | "trusted" {
  if (score <= -40) return "hostile";
  if (score <= -10) return "wary";
  if (score < 20) return "neutral";
  if (score < 60) return "friendly";
  return "trusted";
}
