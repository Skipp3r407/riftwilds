/**
 * Account-wide streak tracking (separate from pet care streaks).
 * Missing a day resets daily streak only — weekly/monthly/hours/seasonal persist.
 */

import { STREAK_MILESTONES } from "@/lib/loyalty/config";
import type { MilestoneDef, PlayerStreakState } from "@/lib/loyalty/types";

export function utcDayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function utcWeekKey(now = Date.now()): string {
  const d = new Date(now);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export function utcMonthKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 7);
}

export function emptyStreakState(userId: string, now = Date.now()): PlayerStreakState {
  const at = new Date(now).toISOString();
  return {
    userId,
    dailyStreak: 0,
    longestDailyStreak: 0,
    lastCheckInDayKey: null,
    weeklyStreak: 0,
    lastWeekKey: null,
    monthlyStreak: 0,
    lastMonthKey: null,
    hoursPlayed: 0,
    seasonalParticipation: 0,
    eventParticipation: 0,
    claimedMilestones: [],
    titles: [],
    badges: [],
    cosmetics: [],
    housingUnlocks: [],
    pityCounters: {},
    socialAnnounceOptOut: false,
    collection: [],
    createdAt: at,
    updatedAt: at,
  };
}

/**
 * Apply an eligible daily check-in.
 * - Same day → no-op (idempotent)
 * - Consecutive yesterday → +1 daily
 * - Gap → daily resets to 1 (weekly/monthly unaffected)
 */
export function applyDailyCheckIn(
  state: PlayerStreakState,
  now = Date.now(),
): { state: PlayerStreakState; advanced: boolean; resetDaily: boolean } {
  const day = utcDayKey(now);
  if (state.lastCheckInDayKey === day) {
    return { state, advanced: false, resetDaily: false };
  }

  const yesterday = utcDayKey(now - 24 * 60 * 60 * 1000);
  const consecutive = state.lastCheckInDayKey === yesterday;
  const nextDaily = consecutive ? state.dailyStreak + 1 : 1;
  const resetDaily = !consecutive && state.dailyStreak > 0;

  const week = utcWeekKey(now);
  let weeklyStreak = state.weeklyStreak;
  let lastWeekKey = state.lastWeekKey;
  if (lastWeekKey !== week) {
    const prevWeek = utcWeekKey(now - 7 * 24 * 60 * 60 * 1000);
    weeklyStreak = lastWeekKey === prevWeek ? weeklyStreak + 1 : 1;
    lastWeekKey = week;
  }

  const month = utcMonthKey(now);
  let monthlyStreak = state.monthlyStreak;
  let lastMonthKey = state.lastMonthKey;
  if (lastMonthKey !== month) {
    monthlyStreak = lastMonthKey
      ? (() => {
          const [y, m] = lastMonthKey.split("-").map(Number);
          const prev = new Date(Date.UTC(y!, m! - 1, 1));
          prev.setUTCMonth(prev.getUTCMonth() + 1);
          const expected = prev.toISOString().slice(0, 7);
          return expected === month ? monthlyStreak + 1 : 1;
        })()
      : 1;
    lastMonthKey = month;
  }

  const next: PlayerStreakState = {
    ...state,
    dailyStreak: nextDaily,
    longestDailyStreak: Math.max(state.longestDailyStreak, nextDaily),
    lastCheckInDayKey: day,
    weeklyStreak,
    lastWeekKey,
    monthlyStreak,
    lastMonthKey,
    updatedAt: new Date(now).toISOString(),
  };

  return { state: next, advanced: true, resetDaily };
}

export function recordHoursPlayed(
  state: PlayerStreakState,
  minutes: number,
  now = Date.now(),
): PlayerStreakState {
  const add = Math.max(0, Math.min(180, Math.floor(minutes))) / 60;
  return {
    ...state,
    hoursPlayed: Math.round((state.hoursPlayed + add) * 100) / 100,
    updatedAt: new Date(now).toISOString(),
  };
}

export function recordSeasonalParticipation(
  state: PlayerStreakState,
  now = Date.now(),
): PlayerStreakState {
  return {
    ...state,
    seasonalParticipation: state.seasonalParticipation + 1,
    updatedAt: new Date(now).toISOString(),
  };
}

export function recordEventParticipation(
  state: PlayerStreakState,
  now = Date.now(),
): PlayerStreakState {
  return {
    ...state,
    eventParticipation: state.eventParticipation + 1,
    updatedAt: new Date(now).toISOString(),
  };
}

export function newlyReachedLoyaltyMilestones(
  prevDays: number,
  nextDays: number,
): MilestoneDef[] {
  return STREAK_MILESTONES.filter((m) => prevDays < m.days && nextDays >= m.days);
}

export function unclaimedMilestones(state: PlayerStreakState): MilestoneDef[] {
  return STREAK_MILESTONES.filter(
    (m) => state.dailyStreak >= m.days && !state.claimedMilestones.includes(m.days),
  );
}
