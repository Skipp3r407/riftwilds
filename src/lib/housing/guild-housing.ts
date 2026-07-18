/**
 * Guild hall housing stub — extends guild bank / economy, does not rebuild guilds.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { getGuildForUser } from "@/lib/economy/guild-bank";

export type GuildHallStub = {
  guildId: string;
  hallName: string;
  neighborhoodId: string | null;
  publicBuildingKey: "guild_hall";
  interiorInstanceKey: string;
  access: "guild_members";
  decorBudget: number;
  upgraded: boolean;
};

type Store = { halls: Map<string, GuildHallStub> };

function store(): Store {
  const g = globalThis as unknown as { __rwGuildHalls?: Store };
  if (!g.__rwGuildHalls) g.__rwGuildHalls = { halls: new Map() };
  return g.__rwGuildHalls;
}

export function resetGuildHallsForTests(): void {
  store().halls.clear();
}

export function ensureGuildHall(params: {
  userId: string;
  neighborhoodId?: string | null;
}): { ok: true; hall: GuildHallStub } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("GUILD_ECONOMY_ENABLED") && !isFeatureEnabled("GUILDS_ENABLED")) {
    // Soft allow when player housing is on — stub for future guilds flag
    if (!isFeatureEnabled("PLAYER_HOUSING_ENABLED")) {
      return { ok: false, error: "disabled", message: "Guild housing requires guild flags." };
    }
  }
  const guild = getGuildForUser(params.userId);
  if (!guild) {
    return { ok: false, error: "no_guild", message: "Join or create a guild first." };
  }
  const existing = store().halls.get(guild.publicId);
  if (existing) return { ok: true, hall: existing };

  const hall: GuildHallStub = {
    guildId: guild.publicId,
    hallName: `${guild.name} Hall`,
    neighborhoodId: params.neighborhoodId ?? null,
    publicBuildingKey: "guild_hall",
    interiorInstanceKey: `guild_inst_${guild.publicId}`,
    access: "guild_members",
    decorBudget: 200,
    upgraded: false,
  };
  store().halls.set(guild.publicId, hall);
  return { ok: true, hall };
}

export function getGuildHall(guildId: string): GuildHallStub | null {
  return store().halls.get(guildId) ?? null;
}
