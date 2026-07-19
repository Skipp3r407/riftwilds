import type { Session, TournamentList } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";

function assertTournaments(): void {
  if (!isNakamaSliceEnabled("NAKAMA_TOURNAMENTS_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_TOURNAMENTS_BRIDGE_DISABLED");
  }
}

/**
 * List Nakama tournaments (must be created server-side / console).
 * Does not touch SOL escrow or tournament Credits economy — bridge only.
 */
export async function listNakamaTournaments(
  session: Session,
  opts?: { limit?: number; categoryStart?: number; categoryEnd?: number },
): Promise<TournamentList> {
  assertTournaments();
  const client = getNakamaClient();
  return client.listTournaments(
    session,
    opts?.categoryStart,
    opts?.categoryEnd,
    undefined,
    undefined,
    opts?.limit ?? 20,
  );
}

export async function joinNakamaTournament(
  session: Session,
  tournamentId: string,
): Promise<boolean> {
  assertTournaments();
  const client = getNakamaClient();
  return client.joinTournament(session, tournamentId);
}
