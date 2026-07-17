/** Phase 3 — gathering nodes (flag: LIVE_WORLD_GATHERING_ENABLED). */

export type GatherNodeStub = {
  id: string;
  resource: string;
  x: number;
  y: number;
};

export function listGatherNodes(): GatherNodeStub[] {
  // TODO Phase 3: server-spawned nodes with cooldowns
  return [];
}

export function tryGather(_nodeId: string): { ok: false; reason: string } {
  return { ok: false, reason: "Gathering ships in Phase 3" };
}
