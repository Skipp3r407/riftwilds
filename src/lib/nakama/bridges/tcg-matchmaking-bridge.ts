/**
 * Bridge: existing TCG invite lobbies ↔ Nakama matchmaker.
 * Local invite-store remains the gameplay path; Nakama ticket is additive metadata.
 */

import type { Session } from "@heroiclabs/nakama-js";
import { addMatchmakerTicket } from "@/lib/nakama/matchmaking";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { NakamaBridgeResult } from "@/lib/nakama/types";

export type TcgInviteLocal = {
  code: string;
  invitePath: string;
  hostKey: string;
};

export async function bridgeTcgInviteToNakama(input: {
  session: Session | null;
  lobby: TcgInviteLocal;
}): Promise<NakamaBridgeResult<TcgInviteLocal>> {
  const local = input.lobby;

  if (!isNakamaSliceEnabled("NAKAMA_MATCHMAKING_BRIDGE_ENABLED") || !input.session) {
    return { local, mode: "local_only" };
  }

  try {
    const ticket = await addMatchmakerTicket(input.session, {
      minCount: 2,
      maxCount: 2,
      query: "+properties.mode:tcg_invite",
      stringProperties: {
        mode: "tcg_invite",
        lobbyCode: local.code,
        hostKey: local.hostKey,
      },
    });
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: true,
        detail: "MATCHMAKER_TICKET",
        payload: ticket,
      },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "MATCHMAKING_BRIDGE_FAILED",
      },
    };
  }
}
