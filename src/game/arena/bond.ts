/**
 * Bond bonuses — small and PvP-safe.
 * Ranked/care-normalized modes clamp Bond to a flat band so care farming cannot dominate ladder.
 */

export const BOND_CONFIG = {
  /** Max Bond contribution to any single combat multiplier (PvP-safe). */
  MAX_DAMAGE_BPS: 400, // +4%
  MAX_ACCURACY_FLAT: 3,
  MAX_CRIT_BPS: 200, // +2%
  /** Ranked: Bond treated as this value regardless of care state. */
  RANKED_NORMALIZED_BOND: 50,
  /** Practice/PvE soft cap before diminishing returns. */
  SOFT_CAP: 100,
} as const;

export type BondContext = {
  bond: number;
  careNormalized: boolean;
};

export function effectiveBond(ctx: BondContext): number {
  if (ctx.careNormalized) return BOND_CONFIG.RANKED_NORMALIZED_BOND;
  return Math.max(0, Math.min(BOND_CONFIG.SOFT_CAP, Math.round(ctx.bond)));
}

export function bondCombatBonuses(ctx: BondContext) {
  const b = effectiveBond(ctx);
  const t = b / BOND_CONFIG.SOFT_CAP;
  return {
    damageMul: 1 + (BOND_CONFIG.MAX_DAMAGE_BPS / 10000) * t,
    accuracyFlat: Math.round(BOND_CONFIG.MAX_ACCURACY_FLAT * t),
    critChanceBps: Math.round(BOND_CONFIG.MAX_CRIT_BPS * t),
  };
}
