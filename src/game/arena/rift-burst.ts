/** Rift Burst ultimate meter — fills from dealing/taking damage and Focus/Charge. */

export const RIFT_BURST_CONFIG = {
  MAX: 100,
  ON_DAMAGE_DEALT: 8,
  ON_DAMAGE_TAKEN: 5,
  ON_FOCUS: 12,
  ON_CHARGE: 18,
  ON_CRIT: 6,
  ULTIMATE_COST: 100,
} as const;

export function clampRiftBurst(value: number): number {
  return Math.max(0, Math.min(RIFT_BURST_CONFIG.MAX, Math.round(value)));
}

export function gainRiftBurst(current: number, amount: number): number {
  return clampRiftBurst(current + amount);
}

export function canSpendRiftBurst(current: number, cost: number = RIFT_BURST_CONFIG.ULTIMATE_COST): boolean {
  return current >= cost;
}

export function spendRiftBurst(current: number, cost: number = RIFT_BURST_CONFIG.ULTIMATE_COST): number {
  if (!canSpendRiftBurst(current, cost)) return current;
  return clampRiftBurst(current - cost);
}
