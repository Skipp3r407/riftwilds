/**
 * Keeper XP curve — smooth exponential.
 * Level N requires getXPForLevel(N) XP to reach level N+1.
 */

export function getXPForLevel(level: number): number {
  const lv = Math.max(1, Math.floor(level));
  return Math.floor(100 * Math.pow(lv, 1.8));
}

export type LevelProgress = {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  lifetimeXp: number;
};

/**
 * Apply raw XP into level progress. Supports multi-level gains; never discards excess.
 */
export function applyXpGain(
  state: Pick<LevelProgress, "level" | "currentXp" | "lifetimeXp">,
  rawXp: number,
): LevelProgress & { levelsGained: number } {
  const gain = Math.max(0, Math.floor(rawXp));
  let level = Math.max(1, Math.floor(state.level));
  let currentXp = Math.max(0, Math.floor(state.currentXp)) + gain;
  const lifetimeXp = Math.max(0, Math.floor(state.lifetimeXp)) + gain;
  let levelsGained = 0;

  // Cap runaway loops (e.g. huge test grants) while preserving excess XP.
  const maxLevelsPerGrant = 500;
  while (levelsGained < maxLevelsPerGrant) {
    const required = getXPForLevel(level);
    if (currentXp < required) break;
    currentXp -= required;
    level += 1;
    levelsGained += 1;
  }

  return {
    level,
    currentXp,
    xpToNextLevel: getXPForLevel(level),
    lifetimeXp,
    levelsGained,
  };
}

export function xpProgressPercent(currentXp: number, level: number): number {
  const need = getXPForLevel(level);
  if (need <= 0) return 100;
  return Math.min(100, Math.max(0, Math.floor((currentXp / need) * 100)));
}
