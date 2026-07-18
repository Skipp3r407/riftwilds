import type { BattleType } from "@/game/arena/battle-types";

/**
 * Matchmaking stubs — Phase 2 will wire realtime queues.
 * Inputs documented for future dedicated battle process.
 */

export type MatchmakingTicket = {
  ticketId: string;
  battleType: BattleType;
  rating: number;
  level: number;
  powerBracket: number;
  latencyMs: number;
  equipMode: "OPEN" | "NORMALIZED";
  enqueuedAt: string;
  trustScore: number;
};

export type MatchProposal = {
  matchId: string;
  battleType: BattleType;
  tickets: [MatchmakingTicket, MatchmakingTicket];
  estimatedStartMs: number;
};

const queue = new Map<string, MatchmakingTicket>();

export function enqueueMatchmaking(
  ticket: Omit<MatchmakingTicket, "ticketId" | "enqueuedAt">,
): MatchmakingTicket {
  const full: MatchmakingTicket = {
    ...ticket,
    ticketId: `mm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    enqueuedAt: new Date().toISOString(),
  };
  queue.set(full.ticketId, full);
  return full;
}

export function cancelMatchmaking(ticketId: string): boolean {
  return queue.delete(ticketId);
}

/** Naive same-type pairer — stub only. */
export function tryFindMatch(battleType: BattleType): MatchProposal | null {
  const candidates = [...queue.values()].filter((t) => t.battleType === battleType);
  if (candidates.length < 2) return null;
  const a = candidates[0]!;
  const b = candidates[1]!;
  queue.delete(a.ticketId);
  queue.delete(b.ticketId);
  return {
    matchId: `match_${Date.now().toString(36)}`,
    battleType,
    tickets: [a, b],
    estimatedStartMs: 1500,
  };
}

export function listQueueDepth(): Record<string, number> {
  const depth: Record<string, number> = {};
  for (const t of queue.values()) {
    depth[t.battleType] = (depth[t.battleType] ?? 0) + 1;
  }
  return depth;
}
