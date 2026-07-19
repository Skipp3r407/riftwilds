/**
 * Bridge: /guilds shell + guild economy stay local; Nakama groups are optional.
 */

import type { Session } from "@heroiclabs/nakama-js";
import { createGuildGroup, listGuildGroups } from "@/lib/nakama/guilds";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import type { NakamaBridgeResult } from "@/lib/nakama/types";

export type GuildsShellLocal = {
  shellEnabled: boolean;
  note: string;
};

export async function bridgeListGuilds(input: {
  session: Session | null;
  shellEnabled: boolean;
  nameFilter?: string;
}): Promise<NakamaBridgeResult<GuildsShellLocal>> {
  const local: GuildsShellLocal = {
    shellEnabled: input.shellEnabled,
    note: "Local guild habitats / bank remain separate from Nakama groups.",
  };

  if (!isNakamaSliceEnabled("NAKAMA_GUILDS_BRIDGE_ENABLED") || !input.session) {
    return { local, mode: "local_only" };
  }

  try {
    const groups = await listGuildGroups(input.session, input.nameFilter);
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "LISTED", payload: groups },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "GUILDS_BRIDGE_FAILED",
      },
    };
  }
}

export async function bridgeCreateGuild(input: {
  session: Session;
  name: string;
  description?: string;
}): Promise<NakamaBridgeResult<{ name: string }>> {
  const local = { name: input.name };
  if (!isNakamaSliceEnabled("NAKAMA_GUILDS_BRIDGE_ENABLED")) {
    return { local, mode: "local_only" };
  }
  try {
    const group = await createGuildGroup(input.session, {
      name: input.name,
      description: input.description,
    });
    return {
      local,
      mode: "bridged",
      nakama: { ok: true, detail: "CREATED", payload: group },
    };
  } catch (err) {
    return {
      local,
      mode: "bridged",
      nakama: {
        ok: false,
        detail: err instanceof Error ? err.message : "GUILD_CREATE_FAILED",
      },
    };
  }
}
