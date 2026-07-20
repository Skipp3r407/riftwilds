/**
 * Rift Energy — TCG turn resource.
 * Distinct from Arena combatant energy and Rift Burst ultimate meter.
 * Values come from canonical battle rules (Turn 1 max 2 → cap 10).
 */

import {
  STANDARD_BATTLE_RULES,
  energyMaxForTurn,
  type BattleRulesConfig,
} from "@/game/tcg/rules/battle-rules-config";

export type RiftEnergyConfig = {
  startMax: number;
  cap: number;
  perTurnGain: number;
};

export const DEFAULT_RIFT_ENERGY: RiftEnergyConfig = {
  startMax: STANDARD_BATTLE_RULES.energy.turn1Max,
  cap: STANDARD_BATTLE_RULES.energy.cap,
  perTurnGain: STANDARD_BATTLE_RULES.energy.perTurnGain,
};

function toRules(config?: RiftEnergyConfig): BattleRulesConfig {
  if (!config) return STANDARD_BATTLE_RULES;
  return {
    ...STANDARD_BATTLE_RULES,
    energy: {
      ...STANDARD_BATTLE_RULES.energy,
      turn1Max: config.startMax,
      cap: config.cap,
      perTurnGain: config.perTurnGain,
    },
  };
}

/** Max energy available at the start of `turn` (1-indexed). */
export function riftEnergyMaxForTurn(
  turn: number,
  config: RiftEnergyConfig = DEFAULT_RIFT_ENERGY,
): number {
  return energyMaxForTurn(turn, toRules(config));
}

/** Refill current energy to the turn max (no carry-over of unspent base). */
export function refillRiftEnergy(
  turn: number,
  config?: RiftEnergyConfig,
): {
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

/** Grant temporary energy that stacks on current pool for this turn. */
export function grantTempEnergy(
  current: number,
  currentMax: number,
  amount: number,
  hardCap: number = STANDARD_BATTLE_RULES.energy.cap + 2,
): { riftEnergy: number; riftEnergyMax: number; tempGranted: number } {
  const grant = Math.max(0, amount);
  const riftEnergy = Math.min(hardCap, current + grant);
  const riftEnergyMax = Math.min(hardCap, Math.max(currentMax, riftEnergy));
  return { riftEnergy, riftEnergyMax, tempGranted: grant };
}
