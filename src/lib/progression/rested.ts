/**
 * Rested XP — offline 12h+ fills a pool; next earned XP is 2x until pool empties.
 */

export const RESTED_OFFLINE_MS = 12 * 60 * 60 * 1000;
/** Max rested pool generated per offline period (hours of equivalent base XP). */
export const RESTED_POOL_CAP = 2500;
/** XP generated per full hour offline after the 12h threshold. */
export const RESTED_XP_PER_HOUR = 50;

export function computeRestedPoolGain(params: {
  lastSeenAt: number;
  now: number;
  currentPool: number;
}): number {
  const offline = Math.max(0, params.now - params.lastSeenAt);
  if (offline < RESTED_OFFLINE_MS) return 0;
  const extraHours = Math.floor((offline - RESTED_OFFLINE_MS) / (60 * 60 * 1000)) + 1;
  const gain = extraHours * RESTED_XP_PER_HOUR;
  const room = Math.max(0, RESTED_POOL_CAP - Math.max(0, params.currentPool));
  return Math.min(room, gain);
}

/**
 * Double XP from rested pool. Returns final grant amount and remaining pool.
 * Pool drains by the *bonus* portion (equal to base portion doubled).
 */
export function applyRestedXp(params: {
  baseAfterOtherBonuses: number;
  restedPool: number;
}): { total: number; restedApplied: number; poolRemaining: number } {
  const base = Math.max(0, Math.floor(params.baseAfterOtherBonuses));
  const pool = Math.max(0, Math.floor(params.restedPool));
  if (base <= 0 || pool <= 0) {
    return { total: base, restedApplied: 0, poolRemaining: pool };
  }
  // Each unit of pool enables +100% on one unit of base XP.
  const doubledUnits = Math.min(base, pool);
  const total = base + doubledUnits;
  return {
    total,
    restedApplied: doubledUnits,
    poolRemaining: pool - doubledUnits,
  };
}
