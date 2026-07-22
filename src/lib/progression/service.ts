/**
 * Server-authoritative progression service.
 * Clients never award themselves XP — only validated source keys + context.
 */

import { battleBonusSources, calculateXpGrant } from "@/lib/progression/calc";
import { comboMultiplierLabel } from "@/lib/progression/combo";
import { applyXpGain, getXPForLevel, xpProgressPercent } from "@/lib/progression/formula";
import {
  emptyCardMastery,
  emptyPetMastery,
  emptyWeaponMastery,
  grantCardMasteryXp,
  grantPetMasteryXp,
  grantWeaponMasteryXp,
} from "@/lib/progression/mastery";
import {
  makeNotification,
  notificationsForLevelRewards,
  trimNotifications,
} from "@/lib/progression/notifications";
import { persistProgressionBestEffort } from "@/lib/progression/persist";
import { applyPrestigeReset, canPrestige, PRESTIGE_XP_BONUS_PERCENT } from "@/lib/progression/prestige";
import {
  applyPerLevelStats,
  previewNextMilestoneRewards,
  rewardsForLevelRange,
} from "@/lib/progression/rewards";
import { computeRestedPoolGain } from "@/lib/progression/rested";
import { isXpSourceKey, questXpSourceFromReward } from "@/lib/progression/sources";
import { getProgressionState, saveProgressionState } from "@/lib/progression/store";
import type {
  GrantXpContext,
  LevelReward,
  ProgressionSnapshot,
  ProgressionState,
  XpGrantBreakdown,
  XpGrantResult,
  XpSourceKey,
} from "@/lib/progression/types";

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function touchRested(state: ProgressionState, now: number): ProgressionState {
  const gain = computeRestedPoolGain({
    lastSeenAt: state.lastSeenAt,
    now,
    currentPool: state.restedXpPool,
  });
  return {
    ...state,
    restedXpPool: state.restedXpPool + gain,
    lastSeenAt: now,
  };
}

function applyLevelRewards(
  state: ProgressionState,
  fromLevel: number,
  toLevel: number,
): { state: ProgressionState; rewards: LevelReward[] } {
  const rewards = rewardsForLevelRange(fromLevel, toLevel);
  const levels = Math.max(0, toLevel - fromLevel);
  let next: ProgressionState = {
    ...state,
    combatStats: applyPerLevelStats(state.combatStats, levels),
    statPoints: state.statPoints + levels,
  };
  const unlocked = new Set(next.unlockedRewards);
  const titles = new Set(next.titles);
  const cosmetics = new Set(next.cosmetics);
  const auras = new Set(next.auras);
  const recent = [...next.recentUnlocks];

  for (const r of rewards) {
    if (r.kind === "skill_point") next = { ...next, skillPoints: next.skillPoints + 1 };
    if (r.kind === "prestige_unlock") next = { ...next, prestigeUnlocked: true };
    const id =
      (typeof r.payload?.id === "string" && r.payload.id) || `${r.kind}:${r.level}`;
    unlocked.add(id);
    recent.unshift(r.label);
    if (r.kind === "title") titles.add(id);
    if (r.kind === "cosmetic") cosmetics.add(id);
    if (r.kind === "rift_aura") auras.add(id);
  }

  next = {
    ...next,
    unlockedRewards: [...unlocked],
    titles: [...titles],
    cosmetics: [...cosmetics],
    auras: [...auras],
    recentUnlocks: recent.slice(0, 24),
  };
  return { state: next, rewards };
}

function emptyBreakdown(denied: string | null): XpGrantBreakdown {
  return {
    base: 0,
    comboPercent: 0,
    comboBonus: 0,
    restedApplied: 0,
    boostPercent: 0,
    boostBonus: 0,
    prestigePercent: 0,
    prestigeBonus: 0,
    antiFarmMultiplier: 1,
    total: 0,
    deniedReason: denied,
  };
}

function grantOneSource(
  state: ProgressionState,
  source: XpSourceKey,
  context: GrantXpContext | undefined,
): {
  state: ProgressionState;
  granted: number;
  levelsGained: number;
  rewards: LevelReward[];
  notifications: ProgressionState["notifications"];
  breakdown: XpGrantBreakdown;
  denied: string | null;
} {
  const now = context?.now ?? Date.now();
  let working = touchRested(state, now);
  const beforeLevel = working.level;

  const calc = calculateXpGrant({ source, state: working, context: { ...context, now } });
  working = {
    ...working,
    comboActivities: calc.comboActivities,
    comboWindowStartedAt: calc.comboWindowStartedAt,
    restedXpPool: calc.restedXpPool,
    highestCombo: Math.max(working.highestCombo, calc.comboActivities.length),
  };

  if (calc.breakdown.deniedReason || calc.breakdown.total <= 0) {
    return {
      state: working,
      granted: 0,
      levelsGained: 0,
      rewards: [],
      notifications: [],
      breakdown: calc.breakdown,
      denied: calc.breakdown.deniedReason ?? "ZERO_GRANT",
    };
  }

  const leveled = applyXpGain(working, calc.breakdown.total);
  working = {
    ...working,
    level: leveled.level,
    currentXp: leveled.currentXp,
    lifetimeXp: leveled.lifetimeXp,
  };

  const applied = applyLevelRewards(working, beforeLevel, leveled.level);
  working = applied.state;

  const notifications = [
    makeNotification(
      source.startsWith("QUEST")
        ? "QUEST_XP"
        : source === "DAILY_LOGIN"
          ? "DAILY_BONUS"
          : "XP_GAIN",
      `+${calc.breakdown.total} XP`,
      source.replace(/_/g, " "),
      { source, breakdown: calc.breakdown },
    ),
    ...notificationsForLevelRewards(leveled.levelsGained, leveled.level, applied.rewards),
  ];

  if (calc.breakdown.comboPercent >= 50) {
    notifications.push(
      makeNotification(
        "COMBO",
        `🔥 Combo XP ${comboMultiplierLabel(calc.breakdown.comboPercent)}`,
        `${calc.comboActivities.length} activities this hour`,
        { percent: calc.breakdown.comboPercent },
      ),
    );
  }

  working = {
    ...working,
    notifications: trimNotifications([...notifications, ...working.notifications]),
  };

  return {
    state: working,
    granted: calc.breakdown.total,
    levelsGained: leveled.levelsGained,
    rewards: applied.rewards,
    notifications,
    breakdown: calc.breakdown,
    denied: null,
  };
}

export function grantXp(params: {
  ownerKey: string;
  source: XpSourceKey;
  context?: GrantXpContext;
  requestId?: string | null;
  userId?: string | null;
}): XpGrantResult {
  if (!params.ownerKey) {
    return { ok: false, error: "NO_OWNER", message: "Missing owner key." };
  }
  if (!isXpSourceKey(params.source)) {
    return { ok: false, error: "INVALID_SOURCE", message: "Unknown XP source." };
  }

  let state = getProgressionState(params.ownerKey);
  if (params.userId) state = { ...state, userId: params.userId };

  if (params.requestId && state.processedRequestIds.includes(params.requestId)) {
    return {
      ok: true,
      granted: 0,
      breakdown: emptyBreakdown("IDEMPOTENT"),
      before: {
        level: state.level,
        currentXp: state.currentXp,
        lifetimeXp: state.lifetimeXp,
      },
      after: {
        level: state.level,
        currentXp: state.currentXp,
        lifetimeXp: state.lifetimeXp,
        xpToNextLevel: getXPForLevel(state.level),
      },
      levelsGained: 0,
      rewards: [],
      notifications: [],
      state,
      idempotentReplay: true,
    };
  }

  const sources: XpSourceKey[] = [params.source];
  if (params.source === "BATTLE_WIN") {
    sources.push(...battleBonusSources(params.context));
  }

  const before = {
    level: state.level,
    currentXp: state.currentXp,
    lifetimeXp: state.lifetimeXp,
  };

  let totalGranted = 0;
  let levelsGained = 0;
  const allRewards: LevelReward[] = [];
  const allNotifications: ProgressionState["notifications"] = [];
  let lastBreakdown = emptyBreakdown(null);

  for (const src of sources) {
    const step = grantOneSource(state, src, params.context);
    state = step.state;
    lastBreakdown = step.breakdown;
    if (step.denied && sources.length === 1) {
      const saved = saveProgressionState(state);
      void persistProgressionBestEffort(saved);
      return {
        ok: false,
        error: step.denied,
        message: `XP denied: ${step.denied}`,
        state: saved,
      };
    }
    totalGranted += step.granted;
    levelsGained += step.levelsGained;
    allRewards.push(...step.rewards);
    allNotifications.push(...step.notifications);
  }

  if (params.source === "BATTLE_WIN" || params.source === "BATTLE_LOSS") {
    state = {
      ...state,
      battlesPlayed: state.battlesPlayed + 1,
      battlesWon: params.source === "BATTLE_WIN" ? state.battlesWon + 1 : state.battlesWon,
    };
    if (params.source === "BATTLE_WIN" && params.context?.opponentId) {
      const oid = params.context.opponentId;
      state = {
        ...state,
        opponentWinCounts: {
          ...state.opponentWinCounts,
          [oid]: (state.opponentWinCounts[oid] ?? 0) + 1,
        },
      };
    }
  }
  if (params.source.startsWith("QUEST_")) {
    state = { ...state, questsCompleted: state.questsCompleted + 1 };
  }

  if (params.context?.matchId) {
    state = {
      ...state,
      grantedMatchIds: [...state.grantedMatchIds, params.context.matchId].slice(-200),
    };
  }
  if (params.requestId) {
    state = {
      ...state,
      processedRequestIds: [...state.processedRequestIds, params.requestId].slice(-400),
    };
  }

  if (params.context?.cardId && totalGranted > 0) {
    const cardId = params.context.cardId;
    const prev = state.cardMastery[cardId] ?? emptyCardMastery(cardId);
    const masteryGain = Math.max(5, Math.floor(totalGranted / 4));
    const { state: card, rankUp, newUnlocks } = grantCardMasteryXp(prev, masteryGain);
    state = {
      ...state,
      cardMastery: { ...state.cardMastery, [cardId]: card },
      masteryXp: state.masteryXp + masteryGain,
    };
    if (rankUp) {
      const n = makeNotification("MASTERY_UP", "Card Mastery", `${cardId} → ${card.rank}`, {
        cardId,
        unlocks: newUnlocks,
      });
      allNotifications.push(n);
      state = { ...state, notifications: trimNotifications([n, ...state.notifications]) };
    }
  }
  if (params.context?.petId && totalGranted > 0) {
    const petId = params.context.petId;
    const prev = state.petMastery[petId] ?? emptyPetMastery(petId);
    state = {
      ...state,
      petMastery: {
        ...state.petMastery,
        [petId]: grantPetMasteryXp(prev, Math.max(5, totalGranted), {
          affinity: params.source === "RIFT_FEED" || params.source === "RIFT_PLAY" ? 1 : 0,
          evolutionXp:
            params.source === "RIFT_EVOLUTION" || params.source === "RIFT_RARE_EVOLUTION"
              ? totalGranted
              : 0,
        }),
      },
    };
  }
  if (params.context?.weaponId && totalGranted > 0) {
    const weaponId = params.context.weaponId;
    const prev = state.weaponMastery[weaponId] ?? emptyWeaponMastery(weaponId);
    state = {
      ...state,
      weaponMastery: {
        ...state.weaponMastery,
        [weaponId]: grantWeaponMasteryXp(prev, Math.max(5, totalGranted)),
      },
    };
  }

  state = saveProgressionState(state);
  void persistProgressionBestEffort(state);

  if (totalGranted <= 0) {
    return {
      ok: false,
      error: lastBreakdown.deniedReason ?? "ZERO_GRANT",
      message: "No XP granted.",
      state,
    };
  }

  return {
    ok: true,
    granted: totalGranted,
    breakdown: { ...lastBreakdown, total: totalGranted },
    before,
    after: {
      level: state.level,
      currentXp: state.currentXp,
      lifetimeXp: state.lifetimeXp,
      xpToNextLevel: getXPForLevel(state.level),
    },
    levelsGained,
    rewards: allRewards,
    notifications: allNotifications,
    state,
  };
}

export function grantQuestXp(params: {
  ownerKey: string;
  questKey: string;
  difficulty?: "easy" | "medium" | "hard" | null;
  catalogXp?: number | null;
  requestId?: string;
  userId?: string | null;
}): XpGrantResult {
  const source = questXpSourceFromReward({
    difficulty: params.difficulty,
    catalogXp: params.catalogXp,
  });
  return grantXp({
    ownerKey: params.ownerKey,
    source,
    requestId: params.requestId ?? `quest:${params.questKey}`,
    userId: params.userId,
    context: {
      questKey: params.questKey,
      questDifficulty: params.difficulty,
      catalogXp: params.catalogXp,
    },
  });
}

export function grantBattleXp(params: {
  ownerKey: string;
  won: boolean;
  matchId: string;
  opponentId?: string | null;
  surrendered?: boolean;
  afk?: boolean;
  botMatch?: boolean;
  perfectVictory?: boolean;
  noCardsLost?: boolean;
  higherRanked?: boolean;
  tournament?: boolean;
  userId?: string | null;
}): XpGrantResult {
  const state = getProgressionState(params.ownerKey);
  if (state.grantedMatchIds.includes(params.matchId)) {
    return {
      ok: true,
      granted: 0,
      breakdown: emptyBreakdown("MATCH_ALREADY_GRANTED"),
      before: {
        level: state.level,
        currentXp: state.currentXp,
        lifetimeXp: state.lifetimeXp,
      },
      after: {
        level: state.level,
        currentXp: state.currentXp,
        lifetimeXp: state.lifetimeXp,
        xpToNextLevel: getXPForLevel(state.level),
      },
      levelsGained: 0,
      rewards: [],
      notifications: [],
      state,
      idempotentReplay: true,
    };
  }

  if (params.tournament && params.won) {
    return grantXp({
      ownerKey: params.ownerKey,
      source: "BATTLE_TOURNAMENT_WIN",
      userId: params.userId,
      requestId: `match:${params.matchId}`,
      context: {
        matchId: params.matchId,
        opponentId: params.opponentId,
        surrendered: params.surrendered,
        afk: params.afk,
        botMatch: params.botMatch,
      },
    });
  }

  return grantXp({
    ownerKey: params.ownerKey,
    source: params.won ? "BATTLE_WIN" : "BATTLE_LOSS",
    userId: params.userId,
    requestId: `match:${params.matchId}`,
    context: {
      matchId: params.matchId,
      opponentId: params.opponentId,
      surrendered: params.surrendered,
      afk: params.afk,
      botMatch: params.botMatch,
      perfectVictory: params.perfectVictory,
      noCardsLost: params.noCardsLost,
      higherRanked: params.higherRanked,
    },
  });
}

export function claimDailyLogin(params: {
  ownerKey: string;
  userId?: string | null;
}): XpGrantResult & { streak?: number } {
  const now = Date.now();
  let state = touchRested(getProgressionState(params.ownerKey), now);
  if (params.userId) state = { ...state, userId: params.userId };
  const today = dayKey(now);
  if (state.lastLoginDayKey === today) {
    return {
      ok: false,
      error: "ALREADY_CLAIMED",
      message: "Daily login XP already claimed today.",
      state: saveProgressionState(state),
    };
  }
  const yesterday = dayKey(now - 24 * 60 * 60 * 1000);
  const streak = state.lastLoginDayKey === yesterday ? state.loginStreak + 1 : 1;
  state = {
    ...state,
    loginStreak: streak,
    lastLoginDayKey: today,
    longestLoginStreak: Math.max(state.longestLoginStreak, streak),
  };
  saveProgressionState(state);

  const result = grantXp({
    ownerKey: params.ownerKey,
    source: "DAILY_LOGIN",
    userId: params.userId,
    requestId: `daily:${today}:${params.ownerKey}`,
    context: { now },
  });
  return { ...result, streak };
}

export function performPrestige(params: {
  ownerKey: string;
  userId?: string | null;
}): { ok: true; state: ProgressionState } | { ok: false; error: string; message: string } {
  let state = getProgressionState(params.ownerKey);
  if (params.userId) state = { ...state, userId: params.userId };
  if (!canPrestige(state)) {
    return {
      ok: false,
      error: "NOT_ELIGIBLE",
      message: "Reach level 100 to unlock Prestige.",
    };
  }
  state = applyPrestigeReset(state);
  state = saveProgressionState(state);
  void persistProgressionBestEffort(state);
  return { ok: true, state };
}

export function getProgressionSnapshot(ownerKey: string): ProgressionSnapshot {
  const now = Date.now();
  let state = touchRested(getProgressionState(ownerKey), now);
  state = saveProgressionState(state);
  return {
    level: state.level,
    currentXp: state.currentXp,
    xpToNextLevel: getXPForLevel(state.level),
    xpPercent: xpProgressPercent(state.currentXp, state.level),
    lifetimeXp: state.lifetimeXp,
    prestige: state.prestige,
    prestigeUnlocked: state.prestigeUnlocked || state.level >= 100,
    prestigeXpBonusPercent: state.prestige * PRESTIGE_XP_BONUS_PERCENT,
    statPoints: state.statPoints,
    skillPoints: state.skillPoints,
    masteryXp: state.masteryXp,
    combatStats: state.combatStats,
    loginStreak: state.loginStreak,
    longestLoginStreak: state.longestLoginStreak,
    restedXpPool: state.restedXpPool,
    highestCombo: state.highestCombo,
    battlesWon: state.battlesWon,
    battlesPlayed: state.battlesPlayed,
    questsCompleted: state.questsCompleted,
    hoursPlayedApprox: state.hoursPlayedApprox,
    titles: state.titles,
    cosmetics: state.cosmetics,
    auras: state.auras,
    recentUnlocks: state.recentUnlocks,
    notifications: state.notifications.slice(0, 12),
    cardMasteryCount: Object.keys(state.cardMastery).length,
    petMasteryCount: Object.keys(state.petMastery).length,
    weaponMasteryCount: Object.keys(state.weaponMastery).length,
    nextRewards: previewNextMilestoneRewards(state.level),
  };
}
