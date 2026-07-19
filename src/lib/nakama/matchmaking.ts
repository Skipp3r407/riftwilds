import type { Session } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";

export type MatchmakerTicketResult = {
  ticket: string;
  query: string;
  minCount: number;
  maxCount: number;
};

/**
 * Add a matchmaker ticket for free PvP (2p TCG-style).
 * Does not replace `/api/tcg/match/invite` — use the bridge for dual-path.
 */
export async function addMatchmakerTicket(
  session: Session,
  opts?: {
    minCount?: number;
    maxCount?: number;
    query?: string;
    stringProperties?: Record<string, string>;
    numericProperties?: Record<string, number>;
  },
): Promise<MatchmakerTicketResult> {
  if (!isNakamaSliceEnabled("NAKAMA_MATCHMAKING_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_MATCHMAKING_BRIDGE_DISABLED");
  }
  const client = getNakamaClient();
  const socket = client.createSocket();
  await socket.connect(session, true);

  const minCount = opts?.minCount ?? 2;
  const maxCount = opts?.maxCount ?? 2;
  const query = opts?.query ?? "*";
  const ticket = await socket.addMatchmaker(
    query,
    minCount,
    maxCount,
    opts?.stringProperties,
    opts?.numericProperties,
  );

  return {
    ticket: ticket.ticket,
    query,
    minCount,
    maxCount,
  };
}

/** Create an authoritative match (empty module → Nakama open match). */
export async function createNakamaMatch(session: Session): Promise<{ matchId: string }> {
  if (!isNakamaSliceEnabled("NAKAMA_MATCHMAKING_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_MATCHMAKING_BRIDGE_DISABLED");
  }
  const client = getNakamaClient();
  const socket = client.createSocket();
  await socket.connect(session, true);
  const match = await socket.createMatch();
  return { matchId: match.match_id };
}
