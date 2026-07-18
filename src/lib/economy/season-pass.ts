/**
 * Phase 10 — Season Pass (Credits premium track; cosmetics only).
 */

import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export const SEASON_PASS_CREDITS_PRICE = 500;
export const SEASON_PASS_XP_PER_TIER = 100;
export const SEASON_PASS_MAX_TIER = 20;

export type SeasonPassState = {
  userId: string;
  seasonKey: string;
  premium: boolean;
  xp: number;
  claimedFree: number[];
  claimedPremium: number[];
};

type Store = { byKey: Map<string, SeasonPassState> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsSeasonPass?: Store };
  if (!g.__riftwildsSeasonPass) g.__riftwildsSeasonPass = { byKey: new Map() };
  return g.__riftwildsSeasonPass;
}

function key(userId: string, seasonKey: string) {
  return `${userId}:${seasonKey}`;
}

export function getSeasonPass(userId: string, seasonKey = "season-0"): SeasonPassState {
  const k = key(userId, seasonKey);
  let s = store().byKey.get(k);
  if (!s) {
    s = {
      userId,
      seasonKey,
      premium: false,
      xp: 0,
      claimedFree: [],
      claimedPremium: [],
    };
    store().byKey.set(k, s);
  }
  return s;
}

export function addSeasonPassXp(userId: string, xp: number, seasonKey = "season-0"): SeasonPassState {
  const s = getSeasonPass(userId, seasonKey);
  s.xp = Math.min(SEASON_PASS_MAX_TIER * SEASON_PASS_XP_PER_TIER, s.xp + Math.max(0, Math.floor(xp)));
  store().byKey.set(key(userId, seasonKey), s);
  return s;
}

export function unlockSeasonPassPremium(params: {
  userId: string;
  requestId: string;
  seasonKey?: string;
}): { ok: true; pass: SeasonPassState } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("SEASON_PASS_ENABLED")) {
    return { ok: false, error: "disabled", message: "Season pass disabled" };
  }
  const seasonKey = params.seasonKey ?? "season-0";
  const s = getSeasonPass(params.userId, seasonKey);
  if (s.premium) return { ok: true, pass: s };
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: SEASON_PASS_CREDITS_PRICE,
    reason: "SEASON_PASS",
    requestId: params.requestId,
    metadata: { seasonKey },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  s.premium = true;
  store().byKey.set(key(params.userId, seasonKey), s);
  return { ok: true, pass: s };
}

export function seasonPassTier(pass: SeasonPassState): number {
  return Math.min(SEASON_PASS_MAX_TIER, Math.floor(pass.xp / SEASON_PASS_XP_PER_TIER));
}

/** Cosmetic reward keys — never combat power. */
export function claimSeasonPassReward(params: {
  userId: string;
  tier: number;
  track: "free" | "premium";
  seasonKey?: string;
}): { ok: true; rewardKey: string; pass: SeasonPassState } | { ok: false; error: string; message: string } {
  const seasonKey = params.seasonKey ?? "season-0";
  const s = getSeasonPass(params.userId, seasonKey);
  const tier = Math.floor(params.tier);
  if (tier < 1 || tier > seasonPassTier(s)) {
    return { ok: false, error: "tier_locked", message: "Tier not reached" };
  }
  if (params.track === "premium" && !s.premium) {
    return { ok: false, error: "premium_required", message: "Unlock premium track with Credits" };
  }
  const claimed = params.track === "free" ? s.claimedFree : s.claimedPremium;
  if (claimed.includes(tier)) {
    return { ok: false, error: "already_claimed", message: "Already claimed" };
  }
  claimed.push(tier);
  store().byKey.set(key(params.userId, seasonKey), s);
  return {
    ok: true,
    rewardKey: `cosmetic_${params.track}_t${tier}_${seasonKey}`,
    pass: s,
  };
}
