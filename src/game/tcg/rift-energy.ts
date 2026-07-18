import { RIFT_ENERGY } from "@/content/tcg";

/**
 * Rift Energy — TCG turn resource from foundational content bundle.
 * Distinct from Arena combatant energy and Rift Burst ultimate meter.
 */

export type RiftEnergyConfig = {
  startMax: number;
  cap: number;
  perTurnGain: number;
};

export const DEFAULT_RIFT_ENERGY: RiftEnergyConfig = {
  startMax: RIFT_ENERGY.start,
  cap: RIFT_ENERGY.maxCap,
  perTurnGain: RIFT_ENERGY.perTurnGain,
};

/** Max energy available at the start of `turn` (1-indexed). */
export function riftEnergyMaxForTurn(
  turn: number,
  config: RiftEnergyConfig = DEFAULT_RIFT_ENERGY,
): number {
  const t = Math.max(1, turn);
  return Math.min(config.cap, config.startMax + (t - 1) * config.perTurnGain);
}

/** Refill current energy to the turn max (no carry-over). */
export function refillRiftEnergy(turn: number, config?: RiftEnergyConfig): {
  riftEnergy: number;
  riftEnergyMax: number;
} {
  const riftEnergyMax = riftEnergyMaxForTurn(turn, config);
  return { riftEnergy: riftEnergyMax, riftEnergyMax };
}

export function canAffordRiftCost(current: number, cost: number): boolean {
  return cost >= 0 && current >= cost;
}

export function spendRiftEnergy(current: number, cost: number): number {
  if (!canAffordRiftCost(current, cost)) {
    throw new Error("INSUFFICIENT_RIFT_ENERGY");
  }
  return current - cost;
}
