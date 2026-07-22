/**
 * Stackable XP boost modifiers (Premium / Weekend / Holiday / quest bonus).
 */

import type { XpBoostFlags } from "@/lib/progression/types";

export const BOOST_PERCENTS = {
  premium: 15,
  weekend: 50,
  holiday: 100,
} as const;

export function isWeekendUtc(now = Date.now()): boolean {
  const day = new Date(now).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Sum stacked boost percents. Weekend applies when `flags.weekend === true`,
 * or when `flags.autoWeekend` is true and today is a weekend (UTC).
 */
export function resolveBoostPercent(
  flags: (XpBoostFlags & { autoWeekend?: boolean }) | undefined,
  now = Date.now(),
): number {
  let pct = 0;
  if (flags?.premium) pct += BOOST_PERCENTS.premium;
  const weekendOn =
    flags?.weekend === true || (flags?.autoWeekend === true && isWeekendUtc(now));
  if (weekendOn) pct += BOOST_PERCENTS.weekend;
  if (flags?.holiday) pct += BOOST_PERCENTS.holiday;
  if (flags?.questBonusPercent) pct += Math.max(0, Math.floor(flags.questBonusPercent));
  return pct;
}

export function applyBoostPercent(base: number, percent: number): { total: number; bonus: number } {
  const b = Math.max(0, Math.floor(base));
  const p = Math.max(0, Math.floor(percent));
  const bonus = Math.floor((b * p) / 100);
  return { total: b + bonus, bonus };
}

/** Prestige permanent XP: +2% per prestige rank. */
export function prestigeXpPercent(prestige: number): number {
  return Math.max(0, Math.floor(prestige)) * 2;
}
