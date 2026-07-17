/**
 * Original Project Hatch damage model (not Pokémon's formula).
 *
 * baseImpact = abilityPower × attackerRelevantStat ÷ max(defenderRelevantStat, 1)
 * modifiedImpact = baseImpact × affinityModifier × levelScaling × randomRange × criticalModifier × statusModifier
 */

export type DamageInput = {
  abilityPower: number;
  attackerStat: number;
  defenderStat: number;
  affinityModifier: number;
  attackerLevel: number;
  randomFactor: number; // inclusive range e.g. 0.9–1.1 from server RNG
  isCritical: boolean;
  criticalMultiplier?: number;
  statusModifier?: number;
  minDamage?: number;
  maxDamage?: number;
};

export type DamageResult = {
  baseImpact: number;
  modifiedImpact: number;
  finalDamage: number;
  isCritical: boolean;
};

export function calculateDamage(input: DamageInput): DamageResult {
  const criticalMultiplier = input.criticalMultiplier ?? 1.5;
  const statusModifier = input.statusModifier ?? 1;
  const minDamage = input.minDamage ?? 1;
  const maxDamage = input.maxDamage ?? 9999;

  const baseImpact =
    (input.abilityPower * input.attackerStat) / Math.max(input.defenderStat, 1);

  const levelScaling = 1 + (input.attackerLevel - 1) * 0.02;

  const modifiedImpact =
    baseImpact *
    input.affinityModifier *
    levelScaling *
    input.randomFactor *
    (input.isCritical ? criticalMultiplier : 1) *
    statusModifier;

  const finalDamage = Math.min(
    maxDamage,
    Math.max(minDamage, Math.round(modifiedImpact)),
  );

  return {
    baseImpact,
    modifiedImpact,
    finalDamage,
    isCritical: input.isCritical,
  };
}

export function rollCritical(chanceBps: number, rollBps: number): boolean {
  return rollBps < Math.max(0, Math.min(10000, chanceBps));
}
