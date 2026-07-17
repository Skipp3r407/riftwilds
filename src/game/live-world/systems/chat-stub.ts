/** Phase 2 — proximity / party / whisper chat (flag: LIVE_WORLD_CHAT_ENABLED). */

export type ChatChannel = "nearby" | "party" | "whisper" | "system";

export type ChatMessage = {
  id: string;
  channel: ChatChannel;
  from: string;
  body: string;
  at: number;
};

export function createChatStub() {
  const messages: ChatMessage[] = [];
  return {
    list: () => messages.slice(),
    send: (_channel: ChatChannel, _body: string) => {
      // TODO Phase 2: server-moderated chat
      return { ok: false as const, reason: "Chat ships in Phase 2" };
    },
  };
}
