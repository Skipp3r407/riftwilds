import {
  applyTcgAction,
  createTcgMatch,
  toTcgClientSnapshot,
  type CreateMatchInput,
} from "@/game/tcg/match-engine";
import type { TcgMatchState, TcgPlayAction } from "@/game/tcg/types";

type SeatMap = {
  /** Side id "player" owner */
  player: string;
  /** Side id "opponent" owner (private); unused for practice AI */
  opponent: string | null;
};

type MatchRecord = {
  seats: SeatMap;
  state: TcgMatchState;
  createdAt: number;
};

/**
 * Persist matches on globalThis so Next/Turbopack route bundles share one Map.
 * Module-scoped Maps fork per route chunk — start writes then turn reads empty
 * (MATCH_NOT_FOUND after a successful MATCH_START).
 */
type MatchMaps = {
  matches: Map<string, MatchRecord>;
};

const globalForMatches = globalThis as unknown as {
  __riftwildsTcgMatches?: MatchMaps;
};

function matchMaps(): MatchMaps {
  if (!globalForMatches.__riftwildsTcgMatches) {
    globalForMatches.__riftwildsTcgMatches = {
      matches: new Map(),
    };
  }
  return globalForMatches.__riftwildsTcgMatches;
}

function publicId(): string {
  return `tcg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function sideIdForOwner(rec: MatchRecord, ownerKey: string): string | null {
  if (rec.seats.player === ownerKey) return "player";
  if (rec.seats.opponent === ownerKey) return "opponent";
  return null;
}

export function startTcgMatch(
  ownerKey: string,
  input: Omit<CreateMatchInput, "publicId"> = {},
) {
  const id = publicId();
  const state = createTcgMatch({ ...input, publicId: id });
  const rec: MatchRecord = {
    seats: { player: ownerKey, opponent: null },
    state,
    createdAt: Date.now(),
  };
  matchMaps().matches.set(id, rec);
  return rec;
}

/** Start a private (local demo) PvP match for two seated Keepers. */
export function startPrivateTcgMatch(input: {
  hostKey: string;
  guestKey: string;
  hostName?: string;
  guestName?: string;
  hostDeck: NonNullable<CreateMatchInput["playerDeck"]>;
  guestDeck: NonNullable<CreateMatchInput["playerDeck"]>;
  hostCommanderHeroId?: string | null;
  guestCommanderHeroId?: string | null;
}) {
  const id = publicId();
  const state = createTcgMatch({
    publicId: id,
    mode: "private",
    playerName: input.hostName ?? "Host",
    playerDeck: input.hostDeck,
    commanderHeroId: input.hostCommanderHeroId,
    opponent: {
      name: input.guestName ?? "Guest",
      deck: input.guestDeck,
      commanderHeroId: input.guestCommanderHeroId,
      isAi: false,
    },
  });
  const rec: MatchRecord = {
    seats: { player: input.hostKey, opponent: input.guestKey },
    state,
    createdAt: Date.now(),
  };
  matchMaps().matches.set(id, rec);
  return rec;
}

export function getTcgMatch(publicId: string, ownerKey: string): MatchRecord | null {
  const rec = matchMaps().matches.get(publicId);
  if (!rec) return null;
  if (!sideIdForOwner(rec, ownerKey)) return null;
  return rec;
}

export function submitTcgAction(
  publicId: string,
  ownerKey: string,
  action: TcgPlayAction,
) {
  const rec = getTcgMatch(publicId, ownerKey);
  if (!rec) return null;
  const actorId = sideIdForOwner(rec, ownerKey);
  if (!actorId) return null;
  applyTcgAction(rec.state, actorId, action);
  return rec;
}

export function snapshotTcgMatch(rec: MatchRecord, viewerKey?: string) {
  const viewerSideId = viewerKey ? sideIdForOwner(rec, viewerKey) : "player";
  return toTcgClientSnapshot(rec.state, viewerSideId ?? "player");
}

/** Test helper */
export function __clearTcgMatchesForTests(): void {
  matchMaps().matches.clear();
}
