/**
 * Bridge: Credits tournament economy stays; Nakama tournaments are optional listing.
 * Never enables SOL escrow / P2W.
 */

import type { Session } from "@heroiclabs/nakama-js";
import { joinNakamaTournament, listNakamaTournaments } from "@/lib/nakama/tournaments";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { NakamaBridgeResult } from "@/lib/nakama/types";

export type TournamentLocal = {
  economyPath: "credits_or_ap";
  solEscrow: false;
};

export async function bridgeListTournaments(input: {
  session: Session | null;
}): Promise<NakamaBridgeResult<TournamentLocal>> {
  const local: TournamentLocal = {
    economyPath: "credits_or_ap",
    solEscrow: false,
  };

  if (!isNakamaSliceEnabled("NAKAMA_TOURNAMENTS_BRIDGE_ENABLED") || !input.session) {
    return { local, mode: "local_only" };
  }

  try {
    const list = await listNakamaTournaments(input.session);
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "LISTED", payload: list },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "TOURNAMENT_BRIDGE_FAILED",
      },
    };
  }
}

export async function bridgeJoinTournament(input: {
  session: Session;
  tournamentId: string;
}): Promise<NakamaBridgeResult<{ tournamentId: string }>> {
  const local = { tournamentId: input.tournamentId };
  if (!isNakamaSliceEnabled("NAKAMA_TOURNAMENTS_BRIDGE_ENABLED")) {
    return { local, mode: "local_only" };
  }
  try {
    const ok = await joinNakamaTournament(input.session, input.tournamentId);
    return {
      local,
      mode: "bridged",
      nakama: { ok, detail: ok ? "JOINED" : "JOIN_REJECTED" },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "TOURNAMENT_JOIN_FAILED",
      },
    };
  }
}
