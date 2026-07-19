/**
 * Replay event-log hooks — Phase 1 captures lightweight server events for future replay UI.
 * Not a full deterministic replay store yet.
 */

export type ReplayHookKind = "MATCH_CREATED" | "ACTION" | "MATCH_ENDED" | "SPECTATE_STUB";

export type ReplayHook = {
  id: string;
  matchPublicId: string;
  kind: ReplayHookKind;
  mode: string;
  actorKey: string;
  payload: Record<string, unknown>;
  at: string;
};

type ReplayMaps = {
  byMatch: Map<string, ReplayHook[]>;
  recent: ReplayHook[];
};

const globalForReplay = globalThis as unknown as {
  __riftwildsRiftArenaReplays?: ReplayMaps;
};

function maps(): ReplayMaps {
  if (!globalForReplay.__riftwildsRiftArenaReplays) {
    globalForReplay.__riftwildsRiftArenaReplays = {
      byMatch: new Map(),
      recent: [],
    };
  }
  return globalForReplay.__riftwildsRiftArenaReplays;
}

export function appendReplayHook(input: {
  matchPublicId: string;
  kind: ReplayHookKind;
  mode: string;
  actorKey: string;
  payload?: Record<string, unknown>;
}): ReplayHook {
  const hook: ReplayHook = {
    id: `rp_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    matchPublicId: input.matchPublicId,
    kind: input.kind,
    mode: input.mode,
    actorKey: input.actorKey,
    payload: input.payload ?? {},
    at: new Date().toISOString(),
  };
  const m = maps();
  const list = m.byMatch.get(input.matchPublicId) ?? [];
  list.push(hook);
  if (list.length > 200) list.splice(0, list.length - 200);
  m.byMatch.set(input.matchPublicId, list);
  m.recent.unshift(hook);
  if (m.recent.length > 100) m.recent.length = 100;
  return hook;
}

export function listReplayHooksForMatch(matchPublicId: string): ReplayHook[] {
  return [...(maps().byMatch.get(matchPublicId) ?? [])];
}

export function listRecentReplayHooks(limit = 24): ReplayHook[] {
  return maps().recent.slice(0, limit);
}

export function __clearReplayHooksForTests(): void {
  maps().byMatch.clear();
  maps().recent.length = 0;
}
