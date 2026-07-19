import type { LeaderboardRecord, LeaderboardRecordList, Session } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";

/** Default board id — create via Nakama console / runtime before writing in prod. */
export const RIFT_ARENA_LEADERBOARD_ID = "rift_arena_free";

function assertBoards(): void {
  if (!isNakamaSliceEnabled("NAKAMA_LEADERBOARDS_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_LEADERBOARDS_BRIDGE_DISABLED");
  }
}

export async function writeLeaderboardScore(
  session: Session,
  leaderboardId: string,
  score: number,
  metadata?: Record<string, unknown>,
): Promise<LeaderboardRecord> {
  assertBoards();
  const client = getNakamaClient();
  return client.writeLeaderboardRecord(session, leaderboardId, {
    score: String(Math.max(0, Math.floor(score))),
    metadata,
  });
}

export async function listLeaderboardTop(
  session: Session,
  leaderboardId = RIFT_ARENA_LEADERBOARD_ID,
  limit = 25,
): Promise<LeaderboardRecordList> {
  assertBoards();
  const client = getNakamaClient();
  return client.listLeaderboardRecords(session, leaderboardId, undefined, limit);
}
