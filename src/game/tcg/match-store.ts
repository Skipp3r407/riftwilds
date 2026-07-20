import fs from "node:fs";
import path from "node:path";
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
 * Persist matches on globalThis + local disk so Next/Turbopack route workers
 * share one store. Module-scoped Maps fork per route chunk; bare globalThis
 * still forks across some dev workers — that caused MATCH_NOT_FOUND after a
 * successful MATCH_START while the client kept the snapshot.
 */
type MatchMaps = {
  matches: Map<string, MatchRecord>;
};

const globalForMatches = globalThis as unknown as {
  __riftwildsTcgMatches?: MatchMaps;
};

const DISK_RELATIVE = path.join(".data", "tcg", "matches.json");
const MATCH_TTL_MS = 1000 * 60 * 60 * 2; // 2h practice / private lobbies

function diskPath(): string {
  return path.join(process.cwd(), DISK_RELATIVE);
}

function canUseFs(): boolean {
  try {
    return typeof process !== "undefined" && Boolean(process.cwd?.());
  } catch {
    return false;
  }
}

function pruneStale(matches: Map<string, MatchRecord>): void {
  const cutoff = Date.now() - MATCH_TTL_MS;
  for (const [id, rec] of matches) {
    if (rec.createdAt < cutoff) matches.delete(id);
  }
}

function readDiskInto(matches: Map<string, MatchRecord>): void {
  if (!canUseFs()) return;
  try {
    const p = diskPath();
    if (!fs.existsSync(p)) return;
    const raw = fs.readFileSync(p, "utf8");
    const parsed = JSON.parse(raw) as Record<string, MatchRecord>;
    for (const [id, rec] of Object.entries(parsed)) {
      if (!rec?.state?.publicId || !rec.seats?.player) continue;
      if (!matches.has(id)) matches.set(id, rec);
    }
    pruneStale(matches);
  } catch {
    /* demo-safe: memory remains usable */
  }
}

function writeDisk(matches: Map<string, MatchRecord>): void {
  if (!canUseFs()) return;
  try {
    pruneStale(matches);
    const p = diskPath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const obj: Record<string, MatchRecord> = {};
    for (const [id, rec] of matches) obj[id] = rec;
    fs.writeFileSync(p, JSON.stringify(obj), "utf8");
  } catch {
    /* demo-safe */
  }
}

function matchMaps(): MatchMaps {
  if (!globalForMatches.__riftwildsTcgMatches) {
    const matches = new Map<string, MatchRecord>();
    readDiskInto(matches);
    globalForMatches.__riftwildsTcgMatches = { matches };
  }
  return globalForMatches.__riftwildsTcgMatches;
}

/** Ensure a match id is visible even if this worker's memory was empty. */
function hydrateMatch(publicId: string): MatchRecord | undefined {
  const maps = matchMaps();
  const hit = maps.matches.get(publicId);
  if (hit) return hit;
  readDiskInto(maps.matches);
  return maps.matches.get(publicId);
}

function publicId(): string {
  return `tcg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function sideIdForOwner(rec: MatchRecord, ownerKey: string): string | null {
  if (rec.seats.player === ownerKey) return "player";
  if (rec.seats.opponent === ownerKey) return "opponent";
  return null;
}

function persist(rec: MatchRecord): void {
  matchMaps().matches.set(rec.state.publicId, rec);
  writeDisk(matchMaps().matches);
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
  persist(rec);
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
  persist(rec);
  return rec;
}

export function getTcgMatch(publicId: string, ownerKey: string): MatchRecord | null {
  const rec = hydrateMatch(publicId);
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
  persist(rec);
  return rec;
}

export function snapshotTcgMatch(rec: MatchRecord, viewerKey?: string) {
  const viewerSideId = viewerKey ? sideIdForOwner(rec, viewerKey) : "player";
  return toTcgClientSnapshot(rec.state, viewerSideId ?? "player");
}

/** Test helper */
export function __clearTcgMatchesForTests(): void {
  matchMaps().matches.clear();
  if (!canUseFs()) return;
  try {
    const p = diskPath();
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
}
