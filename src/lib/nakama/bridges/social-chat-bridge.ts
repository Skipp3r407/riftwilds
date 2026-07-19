/**
 * Bridge: in-memory friends/PM stay primary; Nakama room chat is optional overlay.
 */

import type { Session } from "@heroiclabs/nakama-js";
import { joinRoomChat } from "@/lib/nakama/chat";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { NakamaBridgeResult } from "@/lib/nakama/types";

export type SocialChatLocal = {
  room: string;
  /** Existing social PM path remains available. */
  friendsPmEnabled: boolean;
};

export async function bridgeSocialRoomChat(input: {
  session: Session | null;
  room: string;
  friendsPmEnabled: boolean;
}): Promise<NakamaBridgeResult<SocialChatLocal>> {
  const local: SocialChatLocal = {
    room: input.room,
    friendsPmEnabled: input.friendsPmEnabled,
  };

  if (!isNakamaSliceEnabled("NAKAMA_CHAT_BRIDGE_ENABLED") || !input.session) {
    return { local, mode: "local_only" };
  }

  try {
    const joined = await joinRoomChat(input.session, input.room);
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: true,
        detail: "ROOM_JOINED",
        payload: joined.room,
      },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "CHAT_BRIDGE_FAILED",
      },
    };
  }
}
