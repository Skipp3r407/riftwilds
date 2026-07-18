/**
 * Server-side loyalty orchestration — eligibility, weighted rolls, milestones, shop, storm.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { creditCredits } from "@/lib/credits/ledger";
import {
  appendActivity,
  hasMeaningfulActivity,
  isValidActivityKind,
} from "@/lib/loyalty/activity";
import {
  DAILY_AIRDROP_TABLE,
  LOYALTY_FRAMING,
  LOYALTY_SHOP_CATALOG,
  STORM_WIN_CHANCE,
  STREAK_MILESTONES,
  getAdminConfigSnapshot,
} from "@/lib/loyalty/config";
import {
  activateRiftStorm,
  cancelRiftStorm,
  endRiftStormEngine,
  ensureStormState,
  getStormPlayerView,
  maybeRandomActivate,
  recordStormParticipation,
  rollStormWave,
  syncStormPhase,
} from "@/lib/loyalty/rift-storm-engine";
import type { StormIntensityTier, StormTriggerReason } from "@/lib/loyalty/rift-storm-types";
import { nextPityCount } from "@/lib/loyalty/pity";
import {
  applyDailyCheckIn,
  newlyReachedLoyaltyMilestones,
  recordHoursPlayed,
  recordSeasonalParticipation,
  unclaimedMilestones,
  utcDayKey,
} from "@/lib/loyalty/streaks";
import {
  getActivityLog,
  getStreakState,
  getTokenAccount,
  hasClaimKey,
  listTokenLedger,
  markClaimKey,
  saveActivityLog,
  saveStreakState,
} from "@/lib/loyalty/store";
import { tierDisplay, tierFromDailyStreak, tierMeetsMinimum, nextTierProgress } from "@/lib/loyalty/tiers";
import { creditLoyaltyTokens, debitLoyaltyTokens } from "@/lib/loyalty/tokens";
import type { RiftStormState } from "@/lib/loyalty/rift-storm-types";
import type {
  ActivityKind,
  AirdropRewardDef,
  ClaimedRewardRecord,
  EligibilityResult,
  PlayerStreakState,
  WeightedRollResult,
} from "@/lib/loyalty/types";
import { rollAirdrop } from "@/lib/loyalty/weights";

function featureOn(): boolean {
  return isFeatureEnabled("LOYALTY_SYSTEM_ENABLED");
}

function grantRewardSideEffects(
  userId: string,
  reward: AirdropRewardDef,
  requestId: string,
): void {
  if (reward.kind === "CREDITS" && reward.creditsAmount && reward.creditsAmount > 0) {
    creditCredits({
      userId,
      amount: reward.creditsAmount,
      reason: "STREAK_AIRDROP",
      requestId: `streak-airdrop:${requestId}`,
      metadata: { rewardId: reward.id, source: "loyalty" },
    });
  }
  if (reward.kind === "LOYALTY_TOKENS" && reward.loyaltyTokens && reward.loyaltyTokens > 0) {
    creditLoyaltyTokens({
      userId,
      amount: reward.loyaltyTokens,
      reason: "AIRDROP",
      requestId: `lt-airdrop:${requestId}`,
      metadata: { rewardId: reward.id },
    });
  }
}

function applyCosmeticUnlocks(
  state: PlayerStreakState,
  reward: AirdropRewardDef,
): PlayerStreakState {
  const titles = [...state.titles];
  const badges = [...state.badges];
  const cosmetics = [...state.cosmetics];
  const housingUnlocks = [...state.housingUnlocks];
  if (reward.kind === "TITLE" && reward.assetId && !titles.includes(reward.label)) {
    titles.push(reward.label);
  }
  if (reward.kind === "BADGE" && reward.assetId && !badges.includes(reward.assetId)) {
    badges.push(reward.assetId);
  }
  if (reward.kind === "COSMETIC" && reward.assetId && !cosmetics.includes(reward.assetId)) {
    cosmetics.push(reward.assetId);
  }
  if (reward.kind === "HOUSING" && reward.assetId && !housingUnlocks.includes(reward.assetId)) {
    housingUnlocks.push(reward.assetId);
  }
  return { ...state, titles, badges, cosmetics, housingUnlocks };
}

function toClaimRecord(
  source: ClaimedRewardRecord["source"],
  claimKey: string,
  reward: AirdropRewardDef,
  now: number,
): ClaimedRewardRecord {
  return {
    id: `claim_${now}_${Math.random().toString(36).slice(2, 8)}`,
    claimKey,
    source,
    rewardId: reward.id,
    label: reward.label,
    rarity: reward.rarity,
    kind: reward.kind,
    creditsAmount: reward.creditsAmount,
    loyaltyTokens: reward.loyaltyTokens,
    assetId: reward.assetId,
    claimedAt: new Date(now).toISOString(),
  };
}

export function getLoyaltyStatus(userId: string) {
  const state = getStreakState(userId);
  const tier = tierFromDailyStreak(state.dailyStreak);
  const tokens = getTokenAccount(userId);
  const stormView = getStormPlayerView(userId);
  const storm = stormView.storm;
  const activities = getActivityLog(userId);
  const activityCheck = hasMeaningfulActivity(activities);
  const dayKey = utcDayKey();
  const dailyClaimKey = `daily:${userId}:${dayKey}`;
  const dailyClaimed = hasClaimKey(dailyClaimKey);

  return {
    enabled: featureOn(),
    framing: LOYALTY_FRAMING,
    userId,
    streak: {
      daily: state.dailyStreak,
      longestDaily: state.longestDailyStreak,
      weekly: state.weeklyStreak,
      monthly: state.monthlyStreak,
      hoursPlayed: state.hoursPlayed,
      seasonalParticipation: state.seasonalParticipation,
      eventParticipation: state.eventParticipation,
      lastCheckInDayKey: state.lastCheckInDayKey,
    },
    tier: tierDisplay(tier),
    tierProgress: nextTierProgress(state.dailyStreak),
    loyaltyTokens: tokens.balance,
    lifetimeTokensEarned: tokens.lifetimeEarned,
    titles: state.titles,
    badges: state.badges,
    cosmetics: state.cosmetics,
    housingUnlocks: state.housingUnlocks,
    collection: state.collection,
    unclaimedMilestones: unclaimedMilestones(state),
    pity: state.pityCounters,
    socialAnnounceOptOut: state.socialAnnounceOptOut,
    dailyAirdrop: {
      dayKey,
      claimed: dailyClaimed,
      eligible: activityCheck.ok && !dailyClaimed,
      activityOk: activityCheck.ok,
      activityCount: activityCheck.count,
      activityMessage: activityCheck.ok ? undefined : activityCheck.message,
    },
    storm: {
      ...stormView,
      active: Boolean(storm?.active),
      id: storm?.id ?? null,
      phase: storm?.phase ?? "IDLE",
      intensity: storm?.intensity ?? null,
      endsAt: storm?.endsAt ?? null,
      worldMessage: storm?.worldMessage ?? null,
      warningMessage: storm?.warningMessage ?? null,
      participantCount: storm?.participantCount ?? 0,
      winnerCount: storm?.winnerCount ?? 0,
      publicHighlights: storm?.publicHighlights ?? [],
      winChance: STORM_WIN_CHANCE[tier],
      tierBoostPercent: stormView.tierBoostPercent,
    },
    shop: LOYALTY_SHOP_CATALOG,
    adminConfig: getAdminConfigSnapshot(),
    tokenLedger: listTokenLedger(userId, 10),
  };
}

export function recordPlayerActivity(params: {
  userId: string;
  kind: ActivityKind;
  detail?: string;
  minutesPlayed?: number;
}): { ok: true; count: number } | { ok: false; message: string } {
  if (!featureOn()) return { ok: false, message: "Loyalty system disabled." };
  if (!isValidActivityKind(params.kind)) {
    return { ok: false, message: "Invalid activity kind." };
  }
  const log = appendActivity(getActivityLog(params.userId), params.kind, params.detail);
  saveActivityLog(params.userId, log);

  if (params.minutesPlayed && params.minutesPlayed > 0) {
    saveStreakState(recordHoursPlayed(getStreakState(params.userId), params.minutesPlayed));
  }

  trackAnalytics("loyalty_activity", {
    kind: params.kind,
    user: params.userId.slice(0, 12),
  });

  return { ok: true, count: log.length };
}

export function checkInDaily(params: {
  userId: string;
  now?: number;
}): {
  ok: boolean;
  advanced: boolean;
  resetDaily: boolean;
  state: PlayerStreakState;
  tier: ReturnType<typeof tierDisplay>;
  newMilestoneDays: number[];
  message: string;
} {
  if (!featureOn()) {
    const state = getStreakState(params.userId);
    return {
      ok: false,
      advanced: false,
      resetDaily: false,
      state,
      tier: tierDisplay(tierFromDailyStreak(state.dailyStreak)),
      newMilestoneDays: [],
      message: "Loyalty system disabled.",
    };
  }

  const now = params.now ?? Date.now();
  const prev = getStreakState(params.userId);
  const { state, advanced, resetDaily } = applyDailyCheckIn(prev, now);
  saveStreakState(state);

  const milestones = newlyReachedLoyaltyMilestones(prev.dailyStreak, state.dailyStreak);
  if (advanced) {
    trackAnalytics("loyalty_check_in", {
      dailyStreak: state.dailyStreak,
      resetDaily,
      tier: tierFromDailyStreak(state.dailyStreak),
    });
  }

  return {
    ok: true,
    advanced,
    resetDaily,
    state,
    tier: tierDisplay(tierFromDailyStreak(state.dailyStreak)),
    newMilestoneDays: milestones.map((m) => m.days),
    message: advanced
      ? resetDaily
        ? `Daily streak restarted at ${state.dailyStreak}. Weekly/monthly progress kept.`
        : `Day ${state.dailyStreak} streak — keep going!`
      : "Already checked in today.",
  };
}

function ensureEligibleForDaily(
  userId: string,
  now: number,
): EligibilityResult {
  if (!featureOn()) {
    return { ok: false, error: "feature_disabled", message: "Loyalty system disabled." };
  }
  const dayKey = utcDayKey(now);
  const claimKey = `daily:${userId}:${dayKey}`;
  if (hasClaimKey(claimKey)) {
    return { ok: false, error: "already_claimed", message: "Daily airdrop already claimed." };
  }
  const activity = hasMeaningfulActivity(getActivityLog(userId), now);
  if (!activity.ok) {
    return { ok: false, error: "afk_denied", message: activity.message };
  }
  const state = getStreakState(userId);
  const tier = tierFromDailyStreak(state.dailyStreak);
  return { ok: true, tier, dayKey, activityCount: activity.count };
}

export function claimDailyAirdrop(params: {
  userId: string;
  now?: number;
  rng?: () => number;
  share?: boolean;
}):
  | {
      ok: true;
      claim: ClaimedRewardRecord;
      roll: WeightedRollResult;
      state: PlayerStreakState;
      announce?: string | null;
    }
  | { ok: false; error: string; message: string } {
  const now = params.now ?? Date.now();
  const elig = ensureEligibleForDaily(params.userId, now);
  if (!elig.ok) return { ok: false, error: elig.error, message: elig.message };

  // Ensure check-in advanced for today
  checkInDaily({ userId: params.userId, now });

  const claimKey = `daily:${params.userId}:${elig.dayKey}`;
  if (hasClaimKey(claimKey)) {
    return { ok: false, error: "already_claimed", message: "Daily airdrop already claimed." };
  }

  let state = getStreakState(params.userId);
  const pityKey = "daily";
  const pityCount = state.pityCounters[pityKey] ?? 0;
  const roll = rollAirdrop(DAILY_AIRDROP_TABLE, elig.tier, pityCount, params.rng);
  if (!roll) {
    return { ok: false, error: "invalid", message: "Airdrop table empty for your tier." };
  }

  markClaimKey(claimKey);
  grantRewardSideEffects(params.userId, roll.reward, claimKey);
  state = applyCosmeticUnlocks(state, roll.reward);
  const claim = toClaimRecord("DAILY_AIRDROP", claimKey, roll.reward, now);
  if (params.share) claim.shared = true;

  state = {
    ...state,
    pityCounters: {
      ...state.pityCounters,
      [pityKey]: nextPityCount(pityCount, roll.reward.rarity),
    },
    collection: [claim, ...state.collection].slice(0, 200),
    updatedAt: new Date(now).toISOString(),
  };
  saveStreakState(state);

  trackAnalytics("loyalty_airdrop_claim", {
    rarity: roll.reward.rarity,
    kind: roll.reward.kind,
    pity: roll.pityApplied,
    tier: elig.tier,
  });

  const announce =
    params.share && !state.socialAnnounceOptOut
      ? `A keeper claimed a ${roll.reward.rarity.toLowerCase()} loyalty reward.`
      : null;

  return { ok: true, claim, roll, state, announce };
}

export function claimMilestone(params: {
  userId: string;
  days: number;
  now?: number;
}):
  | { ok: true; claim: ClaimedRewardRecord; milestone: (typeof STREAK_MILESTONES)[number]; state: PlayerStreakState }
  | { ok: false; error: string; message: string } {
  if (!featureOn()) {
    return { ok: false, error: "feature_disabled", message: "Loyalty system disabled." };
  }
  const now = params.now ?? Date.now();
  const milestone = STREAK_MILESTONES.find((m) => m.days === params.days);
  if (!milestone) {
    return { ok: false, error: "invalid", message: "Unknown milestone." };
  }

  let state = getStreakState(params.userId);
  if (state.dailyStreak < milestone.days) {
    return { ok: false, error: "invalid", message: "Streak not high enough for this milestone." };
  }
  if (state.claimedMilestones.includes(milestone.days)) {
    return { ok: false, error: "duplicate", message: "Milestone already claimed." };
  }

  const claimKey = `milestone:${params.userId}:${milestone.days}`;
  if (hasClaimKey(claimKey)) {
    return { ok: false, error: "duplicate", message: "Milestone already claimed." };
  }

  markClaimKey(claimKey);

  if (milestone.creditsAmount > 0) {
    creditCredits({
      userId: params.userId,
      amount: milestone.creditsAmount,
      reason: "LOYALTY_MILESTONE",
      requestId: `loyalty-milestone:${params.userId}:${milestone.days}`,
      metadata: { days: milestone.days },
    });
  }
  if (milestone.loyaltyTokens > 0) {
    creditLoyaltyTokens({
      userId: params.userId,
      amount: milestone.loyaltyTokens,
      reason: "MILESTONE",
      requestId: `lt-milestone:${params.userId}:${milestone.days}`,
    });
  }

  const titles = state.titles.includes(milestone.title)
    ? state.titles
    : [...state.titles, milestone.title];
  const badges = state.badges.includes(milestone.badgeId)
    ? state.badges
    : [...state.badges, milestone.badgeId];
  const cosmetics = state.cosmetics.includes(milestone.cosmeticId)
    ? state.cosmetics
    : [...state.cosmetics, milestone.cosmeticId];

  const claim: ClaimedRewardRecord = {
    id: `ms_${now}`,
    claimKey,
    source: "MILESTONE",
    rewardId: `milestone_${milestone.days}`,
    label: milestone.title,
    rarity: milestone.days >= 365 ? "LEGENDARY" : milestone.days >= 90 ? "EPIC" : "RARE",
    kind: "TITLE",
    creditsAmount: milestone.creditsAmount,
    loyaltyTokens: milestone.loyaltyTokens,
    assetId: milestone.cosmeticId,
    claimedAt: new Date(now).toISOString(),
  };

  state = {
    ...state,
    claimedMilestones: [...state.claimedMilestones, milestone.days].sort((a, b) => a - b),
    titles,
    badges,
    cosmetics,
    collection: [claim, ...state.collection].slice(0, 200),
    updatedAt: new Date(now).toISOString(),
  };
  saveStreakState(state);

  trackAnalytics("loyalty_milestone_claim", { days: milestone.days });

  return { ok: true, claim, milestone, state };
}

export function purchaseLoyaltyShopItem(params: {
  userId: string;
  itemId: string;
}):
  | { ok: true; item: (typeof LOYALTY_SHOP_CATALOG)[number]; claim: ClaimedRewardRecord; tokenBalance: number }
  | { ok: false; error: string; message: string } {
  if (!featureOn()) {
    return { ok: false, error: "feature_disabled", message: "Loyalty system disabled." };
  }
  const item = LOYALTY_SHOP_CATALOG.find((i) => i.id === params.itemId);
  if (!item) return { ok: false, error: "invalid", message: "Unknown shop item." };
  if (item.gameplayAdvantage !== false) {
    return { ok: false, error: "invalid", message: "Gameplay advantages cannot be sold in Loyalty Shop." };
  }
  if (!["cosmetic", "title", "badge", "housing"].includes(item.category)) {
    return { ok: false, error: "invalid", message: "Loyalty Shop sells cosmetics/titles/housing only." };
  }

  const state = getStreakState(params.userId);
  const tier = tierFromDailyStreak(state.dailyStreak);
  if (item.minTier && !tierMeetsMinimum(tier, item.minTier)) {
    return { ok: false, error: "min_tier", message: `Requires ${item.minTier} tier.` };
  }

  const purchaseKey = `shop:${params.userId}:${item.id}`;
  if (hasClaimKey(purchaseKey) && (item.category === "title" || item.category === "badge")) {
    return { ok: false, error: "duplicate", message: "Already own this exclusive item." };
  }

  const debit = debitLoyaltyTokens({
    userId: params.userId,
    amount: item.costLoyaltyTokens,
    reason: "SHOP_PURCHASE",
    requestId: `${purchaseKey}:${Date.now()}`,
    metadata: { itemId: item.id, category: item.category },
  });
  if (!debit.ok) {
    return { ok: false, error: debit.error, message: debit.message };
  }

  markClaimKey(purchaseKey);

  let next = getStreakState(params.userId);
  if (item.category === "title" && !next.titles.includes(item.label)) {
    next = { ...next, titles: [...next.titles, item.label] };
  }
  if (item.category === "badge" && !next.badges.includes(item.assetId)) {
    next = { ...next, badges: [...next.badges, item.assetId] };
  }
  if (item.category === "cosmetic" && !next.cosmetics.includes(item.assetId)) {
    next = { ...next, cosmetics: [...next.cosmetics, item.assetId] };
  }
  if (item.category === "housing" && !next.housingUnlocks.includes(item.assetId)) {
    next = { ...next, housingUnlocks: [...next.housingUnlocks, item.assetId] };
  }

  const claim: ClaimedRewardRecord = {
    id: `shop_${Date.now()}`,
    claimKey: purchaseKey,
    source: "SHOP",
    rewardId: item.id,
    label: item.label,
    rarity: "RARE",
    kind:
      item.category === "title"
        ? "TITLE"
        : item.category === "badge"
          ? "BADGE"
          : item.category === "housing"
            ? "HOUSING"
            : "COSMETIC",
    loyaltyTokens: item.costLoyaltyTokens,
    assetId: item.assetId,
    claimedAt: new Date().toISOString(),
  };
  next = {
    ...next,
    collection: [claim, ...next.collection].slice(0, 200),
    updatedAt: new Date().toISOString(),
  };
  saveStreakState(next);

  trackAnalytics("loyalty_shop_purchase", { itemId: item.id, category: item.category });

  return { ok: true, item, claim, tokenBalance: debit.account.balance };
}

export function setSocialOptOut(userId: string, optOut: boolean): PlayerStreakState {
  const state = { ...getStreakState(userId), socialAnnounceOptOut: optOut };
  saveStreakState(state);
  return state;
}

export function getActiveStorm(): RiftStormState {
  return syncStormPhase(ensureStormState());
}


export function triggerRiftStorm(params: {
  triggeredBy?: "admin" | "scheduled" | "dev";
  durationMs?: number;
  message?: string;
  now?: number;
  intensity?: StormIntensityTier;
  triggerReason?: StormTriggerReason;
  skipWarning?: boolean;
  regionIds?: string[];
  global?: boolean;
  solPoolLamports?: number;
}): RiftStormState {
  return activateRiftStorm({
    triggeredBy: params.triggeredBy ?? "admin",
    activeMs: params.durationMs,
    message: params.message,
    now: params.now,
    intensity: params.intensity,
    triggerReason: params.triggerReason ?? "ADMIN",
    skipWarning: params.skipWarning ?? true,
    regionIds: params.regionIds,
    global: params.global,
    solPoolLamports: params.solPoolLamports,
  });
}

export function endRiftStorm(): RiftStormState {
  return endRiftStormEngine();
}

export function emergencyCancelStorm(reason?: string): RiftStormState {
  return cancelRiftStorm(reason);
}

export function tryScheduledStorm(force = false) {
  return maybeRandomActivate({ force });
}

export function participateInStorm(params: {
  userId: string;
  action: string;
  regionId?: string;
  accountAgeDays?: number;
}) {
  return recordStormParticipation(params);
}

export function rollRiftStorm(params: {
  userId: string;
  now?: number;
  rng?: () => number;
  shareWin?: boolean;
  waveId?: "WAVE_1" | "WAVE_2" | "WAVE_3" | "FINAL";
  walletAddress?: string | null;
}):
  | {
      ok: true;
      won: boolean;
      claim?: ClaimedRewardRecord;
      roll?: WeightedRollResult;
      storm: RiftStormState;
      privacyNote: string;
    }
  | { ok: false; error: string; message: string } {
  const result = rollStormWave({
    userId: params.userId,
    now: params.now,
    rng: params.rng,
    shareWin: params.shareWin,
    waveId: params.waveId,
    walletAddress: params.walletAddress,
  });
  if (!result.ok) return result;
  return {
    ok: true,
    won: result.won,
    claim: result.claim,
    roll: result.reward
      ? {
          reward: result.reward,
          roll: 0,
          totalWeight: 0,
          pityApplied: false,
          tier: tierFromDailyStreak(getStreakState(params.userId).dailyStreak),
        }
      : undefined,
    storm: result.storm,
    privacyNote: result.privacyNote,
  };
}

export { getStormPlayerView, cancelRiftStorm, activateRiftStorm };

export function recordSeasonal(userId: string): PlayerStreakState {
  const state = recordSeasonalParticipation(getStreakState(userId));
  saveStreakState(state);
  return state;
}
