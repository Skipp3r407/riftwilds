/**
 * Phase 6 — Guild Economy (Credits bank + role gates).
 */

import { settleCredit, settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type GuildRole = "LEADER" | "OFFICER" | "MEMBER";

export type GuildState = {
  publicId: string;
  name: string;
  founderId: string;
  bankCredits: number;
  members: { userId: string; role: GuildRole }[];
  audit: { at: string; userId: string; action: string; amount?: number; reason: string }[];
};

type Store = { guilds: Map<string, GuildState>; byUser: Map<string, string> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsGuildBank?: Store };
  if (!g.__riftwildsGuildBank) {
    g.__riftwildsGuildBank = { guilds: new Map(), byUser: new Map() };
  }
  return g.__riftwildsGuildBank;
}

/** Test helper */
export function resetGuildBankForTests(): void {
  const g = globalThis as unknown as { __riftwildsGuildBank?: Store };
  g.__riftwildsGuildBank = { guilds: new Map(), byUser: new Map() };
}

export const GUILD_CREATE_CREDITS = 200;

export function getGuildForUser(userId: string): GuildState | null {
  const id = store().byUser.get(userId);
  return id ? store().guilds.get(id) ?? null : null;
}

export function createGuild(params: {
  userId: string;
  name: string;
  requestId: string;
}): { ok: true; guild: GuildState } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("GUILD_ECONOMY_ENABLED")) {
    return { ok: false, error: "disabled", message: "Guild economy disabled" };
  }
  if (store().byUser.has(params.userId)) {
    return { ok: false, error: "already_in_guild", message: "Already in a guild" };
  }
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: GUILD_CREATE_CREDITS,
    reason: "GUILD_DUES",
    requestId: params.requestId,
    metadata: { action: "create_guild" },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };

  const publicId = `guild_${Date.now().toString(36)}`;
  const guild: GuildState = {
    publicId,
    name: params.name.slice(0, 32),
    founderId: params.userId,
    bankCredits: GUILD_CREATE_CREDITS,
    members: [{ userId: params.userId, role: "LEADER" }],
    audit: [
      {
        at: new Date().toISOString(),
        userId: params.userId,
        action: "CREATE",
        amount: GUILD_CREATE_CREDITS,
        reason: "Founding deposit",
      },
    ],
  };
  store().guilds.set(publicId, guild);
  store().byUser.set(params.userId, publicId);
  return { ok: true, guild };
}

export function contributeToGuild(params: {
  userId: string;
  amount: number;
  requestId: string;
}): { ok: true; guild: GuildState } | { ok: false; error: string; message: string } {
  const guild = getGuildForUser(params.userId);
  if (!guild) return { ok: false, error: "no_guild", message: "Not in a guild" };
  if (!Number.isInteger(params.amount) || params.amount < 1) {
    return { ok: false, error: "invalid_amount", message: "Invalid amount" };
  }
  const debit = settleDebit({
    userId: params.userId,
    amount: params.amount,
    reason: "GUILD_DUES",
    requestId: params.requestId,
    metadata: { guildId: guild.publicId },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  guild.bankCredits += params.amount;
  guild.audit.push({
    at: new Date().toISOString(),
    userId: params.userId,
    action: "CONTRIBUTE",
    amount: params.amount,
    reason: "Member contribution",
  });
  store().guilds.set(guild.publicId, guild);
  return { ok: true, guild };
}

export function guildPayout(params: {
  officerUserId: string;
  toUserId: string;
  amount: number;
  requestId: string;
  reason: string;
}): { ok: true; guild: GuildState } | { ok: false; error: string; message: string } {
  const guild = getGuildForUser(params.officerUserId);
  if (!guild) return { ok: false, error: "no_guild", message: "Not in a guild" };
  const officer = guild.members.find((m) => m.userId === params.officerUserId);
  if (!officer || (officer.role !== "LEADER" && officer.role !== "OFFICER")) {
    return { ok: false, error: "forbidden", message: "Officer role required" };
  }
  if (params.amount < 1 || params.amount > guild.bankCredits) {
    return { ok: false, error: "insufficient_bank", message: "Guild bank insufficient" };
  }
  const credit = settleCredit({
    userId: params.toUserId,
    amount: params.amount,
    reason: "GUILD_PAYOUT",
    requestId: params.requestId,
    metadata: { guildId: guild.publicId, reason: params.reason },
  });
  if (!credit.ok) return { ok: false, error: credit.error, message: credit.message };
  guild.bankCredits -= params.amount;
  guild.audit.push({
    at: new Date().toISOString(),
    userId: params.officerUserId,
    action: "PAYOUT",
    amount: params.amount,
    reason: params.reason.slice(0, 120),
  });
  store().guilds.set(guild.publicId, guild);
  return { ok: true, guild };
}
