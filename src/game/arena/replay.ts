import type { ArenaEvent } from "@/game/arena/types";

/**
 * Spectator / replay stubs — event log is the source of truth for animation replay.
 * Phase 2+ persists these to BattleReplay rows.
 */

export type ReplayFrame = {
  seq: number;
  atMs: number;
  event: ArenaEvent;
};

export type BattleReplayStub = {
  publicId: string;
  seed: string;
  frames: ReplayFrame[];
  spectatorCount: number;
  createdAt: string;
};

export function buildReplayFromEvents(params: {
  publicId: string;
  seed: string;
  events: ArenaEvent[];
  msPerEvent?: number;
}): BattleReplayStub {
  const step = params.msPerEvent ?? 450;
  return {
    publicId: params.publicId,
    seed: params.seed,
    frames: params.events.map((event, i) => ({
      seq: i,
      atMs: i * step,
      event,
    })),
    spectatorCount: 0,
    createdAt: new Date().toISOString(),
  };
}

export function spectatorJoinStub(replay: BattleReplayStub): BattleReplayStub {
  return { ...replay, spectatorCount: replay.spectatorCount + 1 };
}

/** Sync stub: clients request snapshot by seq — server would stream from here. */
export function framesSince(replay: BattleReplayStub, afterSeq: number): ReplayFrame[] {
  return replay.frames.filter((f) => f.seq > afterSeq);
}
