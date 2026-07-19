import type { RiftArenaHistoryEntry } from "@/game/rift-arena/types";

type HistoryMaps = {
  byOwner: Map<string, RiftArenaHistoryEntry[]>;
};

const globalForHistory = globalThis as unknown as {
  __riftwildsRiftArenaHistory?: HistoryMaps;
};

function maps(): HistoryMaps {
  if (!globalForHistory.__riftwildsRiftArenaHistory) {
    globalForHistory.__riftwildsRiftArenaHistory = { byOwner: new Map() };
  }
  return globalForHistory.__riftwildsRiftArenaHistory;
}

export function recordArenaHistory(
  ownerKey: string,
  entry: Omit<RiftArenaHistoryEntry, "id">,
): RiftArenaHistoryEntry {
  const full: RiftArenaHistoryEntry = {
    ...entry,
    id: `ah_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`,
  };
  const list = maps().byOwner.get(ownerKey) ?? [];
  list.unshift(full);
  if (list.length > 40) list.length = 40;
  maps().byOwner.set(ownerKey, list);
  return full;
}

export function listArenaHistory(ownerKey: string, limit = 12): RiftArenaHistoryEntry[] {
  return (maps().byOwner.get(ownerKey) ?? []).slice(0, limit);
}

/** Demo rows when a keeper has no history yet. */
export function demoHistoryIfEmpty(ownerKey: string): RiftArenaHistoryEntry[] {
  const existing = listArenaHistory(ownerKey);
  if (existing.length) return existing;
  return [
    {
      id: "demo_1",
      matchType: "TRAINING",
      opponentName: "Kael",
      result: "WIN",
      playedAt: new Date(Date.now() - 86_400_000).toISOString(),
      replayHookId: null,
    },
    {
      id: "demo_2",
      matchType: "FREE",
      opponentName: "Waiting queue",
      result: "ABORT",
      playedAt: new Date(Date.now() - 172_800_000).toISOString(),
      replayHookId: null,
    },
  ];
}
