import type { NpcMemorySummary } from "@/game/npc-ai/types";

type Store = Map<string, NpcMemorySummary>;

const globalMem = globalThis as unknown as { __riftwildsNpcMem?: Store };

function store(): Store {
  if (!globalMem.__riftwildsNpcMem) globalMem.__riftwildsNpcMem = new Map();
  return globalMem.__riftwildsNpcMem;
}

function key(npcId: string, playerId: string): string {
  return `${npcId}::${playerId}`;
}

export function getNpcMemory(npcId: string, playerId: string): NpcMemorySummary | undefined {
  return store().get(key(npcId, playerId));
}

export function updateNpcMemory(params: {
  npcId: string;
  playerId: string;
  topic: string;
  flags?: string[];
}): NpcMemorySummary {
  const k = key(params.npcId, params.playerId);
  const prev = store().get(k);
  const lastTopics = [...(prev?.lastTopics ?? []), params.topic].slice(-5);
  const flagsMentioned = Array.from(
    new Set([...(prev?.flagsMentioned ?? []), ...(params.flags ?? [])]),
  ).slice(-12);
  const summary = `Recent topics: ${lastTopics.join("; ") || "none"}. Flags: ${
    flagsMentioned.join(", ") || "none"
  }.`;
  const next: NpcMemorySummary = {
    npcId: params.npcId,
    playerId: params.playerId,
    summary,
    flagsMentioned,
    lastTopics,
    updatedAt: new Date().toISOString(),
  };
  store().set(k, next);
  return next;
}

export function resetNpcMemoryForTests(): void {
  globalMem.__riftwildsNpcMem = new Map();
}
