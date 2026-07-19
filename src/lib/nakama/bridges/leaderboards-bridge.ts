/**
 * Bridge: demo leaderboard HUD stays; Nakama boards are optional sync targets.
 */

import type { Session } from "@heroiclabs/nakama-js";
import {
  listLeaderboardTop,
  RIFT_ARENA_LEADERBOARD_ID,
  writeLeaderboardScore,
} from "@/lib/nakama/leaderboards";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { NakamaBridgeResult } from "@/lib/nakama/types";

export type LeaderboardLocal = {
  source: "demo_hud" | "arena";
  boardId: string;
};

export async function bridgeLeaderboardRead(input: {
  session: Session | null;
  boardId?: string;
}): Promise<NakamaBridgeResult<LeaderboardLocal>> {
  const local: LeaderboardLocal = {
    source: "demo_hud",
    boardId: input.boardId ?? RIFT_ARENA_LEADERBOARD_ID,
  };

  if (!isNakamaSliceEnabled("NAKAMA_LEADERBOARDS_BRIDGE_ENABLED") || !input.session) {
    return { local, mode: "local_only" };
  }

  try {
    const records = await listLeaderboardTop(input.session, local.boardId);
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "LISTED", payload: records },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "LEADERBOARD_BRIDGE_FAILED",
      },
    };
  }
}

export async function bridgeLeaderboardWrite(input: {
  session: Session;
  score: number;
  boardId?: string;
  metadata?: Record<string, unknown>;
}): Promise<NakamaBridgeResult<{ score: number }>> {
  const local = { score: input.score };
  if (!isNakamaSliceEnabled("NAKAMA_LEADERBOARDS_BRIDGE_ENABLED")) {
    return { local, mode: "local_only" };
  }
  try {
    const record = await writeLeaderboardScore(
      input.session,
      input.boardId ?? RIFT_ARENA_LEADERBOARD_ID,
      input.score,
      input.metadata,
    );
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "WRITTEN", payload: record },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "LEADERBOARD_WRITE_FAILED",
      },
    };
  }
}
