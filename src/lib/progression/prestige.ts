/**
 * Prestige — optional reset at level 100+. Keeps cosmetics/collections/cards/pets/titles.
 */

import { BASE_COMBAT_STATS } from "@/lib/progression/rewards";
import type { ProgressionState } from "@/lib/progression/types";

export const PRESTIGE_LEVEL_REQUIREMENT = 100;
export const PRESTIGE_XP_BONUS_PERCENT = 2;
export const PRESTIGE_BADGE_PREFIX = "badge:prestige-";
export const PRESTIGE_AURA_PREFIX = "aura:prestige-";

export function canPrestige(state: Pick<ProgressionState, "level" | "prestigeUnlocked">): boolean {
  return state.prestigeUnlocked || state.level >= PRESTIGE_LEVEL_REQUIREMENT;
}

export function prestigeBadgeId(prestigeNumber: number): string {
  return `${PRESTIGE_BADGE_PREFIX}${prestigeNumber}`;
}

export function prestigeAuraId(prestigeNumber: number): string {
  return `${PRESTIGE_AURA_PREFIX}${prestigeNumber}`;
}

/**
 * Reset level/XP/stat points; keep cosmetics, titles, auras, mastery, collections.
 */
export function applyPrestigeReset(state: ProgressionState, now = Date.now()): ProgressionState {
  if (!canPrestige(state)) return state;
  const nextPrestige = state.prestige + 1;
  const badge = prestigeBadgeId(nextPrestige);
  const aura = prestigeAuraId(nextPrestige);
  return {
    ...state,
    level: 1,
    currentXp: 0,
    // lifetimeXp retained
    prestige: nextPrestige,
    prestigeUnlocked: true,
    statPoints: 0,
    skillPoints: 0,
    combatStats: { ...BASE_COMBAT_STATS },
    cosmetics: state.cosmetics.includes(badge)
      ? state.cosmetics
      : [...state.cosmetics, badge],
    auras: state.auras.includes(aura) ? state.auras : [...state.auras, aura],
    recentUnlocks: [`Prestige ${nextPrestige}`, badge, aura, ...state.recentUnlocks].slice(0, 24),
    updatedAt: now,
    version: state.version + 1,
  };
}
