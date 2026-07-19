/**
 * Free matchmaking queue — Phase 1 local pairing stub.
 * Pairs two free-queue tickets into a private lobby code for TCG battle.
 */

import { createTcgLobby } from "@/game/tcg/invite-store";

export type FreeQueueTicket = {
  ticketId: string;
  ownerKey: string;
  displayName: string;
  enqueuedAt: number;
};

type QueueMaps = {
  tickets: Map<string, FreeQueueTicket>;
};

const globalForQueue = globalThis as unknown as {
  __riftwildsRiftArenaFreeQueue?: QueueMaps;
};

function maps(): QueueMaps {
  if (!globalForQueue.__riftwildsRiftArenaFreeQueue) {
    globalForQueue.__riftwildsRiftArenaFreeQueue = { tickets: new Map() };
  }
  return globalForQueue.__riftwildsRiftArenaFreeQueue;
}

export function enqueueFreePlay(input: {
  ownerKey: string;
  displayName?: string;
}): FreeQueueTicket {
  // Replace prior ticket for same owner.
  for (const [id, t] of maps().tickets) {
    if (t.ownerKey === input.ownerKey) maps().tickets.delete(id);
  }
  const ticket: FreeQueueTicket = {
    ticketId: `fq_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`,
    ownerKey: input.ownerKey,
    displayName: input.displayName?.trim() || "Keeper",
    enqueuedAt: Date.now(),
  };
  maps().tickets.set(ticket.ticketId, ticket);
  return ticket;
}

export function cancelFreePlay(ticketId: string): boolean {
  return maps().tickets.delete(ticketId);
}

export function freeQueueSize(): number {
  return maps().tickets.size;
}

export type FreePairResult = {
  lobbyCode: string;
  hostKey: string;
  guestKey: string;
  hostName: string;
  guestName: string;
};

/** Naive FIFO pairer for local demo. */
export function tryPairFreePlay(): FreePairResult | null {
  const list = [...maps().tickets.values()].sort(
    (a, b) => a.enqueuedAt - b.enqueuedAt,
  );
  if (list.length < 2) return null;
  const a = list[0]!;
  const b = list[1]!;
  if (a.ownerKey === b.ownerKey) return null;
  maps().tickets.delete(a.ticketId);
  maps().tickets.delete(b.ticketId);
  const lobby = createTcgLobby({ hostKey: a.ownerKey, hostName: a.displayName });
  // Seat guest without starting match — join API / host poll completes start.
  lobby.guestKey = b.ownerKey;
  lobby.guestName = b.displayName;
  return {
    lobbyCode: lobby.code,
    hostKey: a.ownerKey,
    guestKey: b.ownerKey,
    hostName: a.displayName,
    guestName: b.displayName,
  };
}

export function __clearFreeQueueForTests(): void {
  maps().tickets.clear();
}
