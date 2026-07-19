import type {
  Channel,
  ChannelMessage,
  ChannelMessageAck,
  ChannelMessageList,
  Session,
} from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";

export type RoomChatJoin = {
  channelId: string;
  roomName: string;
};

function assertChat(): void {
  if (!isNakamaSliceEnabled("NAKAMA_CHAT_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_CHAT_BRIDGE_DISABLED");
  }
}

/** Join a named room channel (e.g. live-world hub chat). */
export async function joinRoomChat(
  session: Session,
  roomName: string,
): Promise<{ channel: Channel; room: RoomChatJoin }> {
  assertChat();
  const client = getNakamaClient();
  const socket = client.createSocket();
  await socket.connect(session, true);
  const channel = await socket.joinChat(roomName, 1, true, false);
  return {
    channel,
    room: { channelId: channel.id, roomName },
  };
}

export async function sendRoomChatMessage(
  session: Session,
  channelId: string,
  content: Record<string, unknown>,
): Promise<ChannelMessageAck> {
  assertChat();
  const client = getNakamaClient();
  const socket = client.createSocket();
  await socket.connect(session, true);
  return socket.writeChatMessage(channelId, content);
}

/** List recent room history via REST (does not replace friends/PM store). */
export async function listRoomChatHistory(
  session: Session,
  channelId: string,
  limit = 50,
): Promise<ChannelMessageList> {
  assertChat();
  const client = getNakamaClient();
  return client.listChannelMessages(session, channelId, limit, true);
}

export type { ChannelMessage };
