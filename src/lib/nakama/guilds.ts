import type { Group, GroupUserList, Session } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";

function assertGuilds(): void {
  if (!isNakamaSliceEnabled("NAKAMA_GUILDS_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_GUILDS_BRIDGE_DISABLED");
  }
}

/** Create a Nakama group representing a Riftbound guild shell. */
export async function createGuildGroup(
  session: Session,
  input: {
    name: string;
    description?: string;
    open?: boolean;
    maxCount?: number;
  },
): Promise<Group> {
  assertGuilds();
  const client = getNakamaClient();
  return client.createGroup(session, {
    name: input.name,
    description: input.description ?? "Riftbound guild",
    lang_tag: "en",
    open: input.open ?? true,
    max_count: input.maxCount ?? 100,
  });
}

export async function listGuildGroups(
  session: Session,
  nameFilter?: string,
  limit = 20,
): Promise<Group[]> {
  assertGuilds();
  const client = getNakamaClient();
  const result = await client.listGroups(session, nameFilter, undefined, limit);
  return result.groups ?? [];
}

export async function joinGuildGroup(session: Session, groupId: string): Promise<void> {
  assertGuilds();
  const client = getNakamaClient();
  await client.joinGroup(session, groupId);
}

export async function listGuildMembers(
  session: Session,
  groupId: string,
  limit = 50,
): Promise<GroupUserList> {
  assertGuilds();
  const client = getNakamaClient();
  return client.listGroupUsers(session, groupId, undefined, limit);
}
