/**
 * Ability resolution hooks — passive / active / ultimate.
 * Structured effects from content `TcgAbility` / `TcgEffect`.
 */

import type { TcgAbility, TcgEffect } from "@/content/tcg/types";
import { unitHasKeyword } from "@/game/tcg/combat/keywords";
import {
  consumeWard,
  type TcgStatusInstance,
} from "@/game/tcg/combat/status";

export type AbilityTiming =
  | "battlecry"
  | "deathrattle"
  | "passive"
  | "activated"
  | "aura"
  | "trigger"
  | "ultimate";

export type AbilityResolveContext = {
  abilities: TcgAbility[];
  timing: AbilityTiming | AbilityTiming[];
  /** Energy already spent this turn (for Empower). */
  energySpentThisTurn?: number;
};

export type AbilityEffectResult = {
  damageToKeeper?: number;
  healKeeper?: number;
  draw?: number;
  gainEnergy?: number;
  buffAttack?: number;
  buffHealth?: number;
  destroyTarget?: boolean;
  notes: string[];
};

function empowerBonus(effect: TcgEffect, energySpent: number): number {
  if (!effect.value) return 0;
  // Partial Empower: +1 per 2 energy spent when ability text/effects imply it.
  return Math.floor(Math.max(0, energySpent) / 2);
}

export function abilitiesForTiming(
  abilities: TcgAbility[],
  timing: AbilityTiming | AbilityTiming[],
): TcgAbility[] {
  const set = new Set(Array.isArray(timing) ? timing : [timing]);
  return abilities.filter((a) => set.has(a.timing as AbilityTiming));
}

/**
 * Resolve structured effects for a timing window.
 * Does not mutate match state — caller applies results.
 */
export function resolveAbilityEffects(
  ctx: AbilityResolveContext,
): AbilityEffectResult {
  const result: AbilityEffectResult = { notes: [] };
  const list = abilitiesForTiming(ctx.abilities, ctx.timing);
  const spent = ctx.energySpentThisTurn ?? 0;

  for (const ab of list) {
    for (const fx of ab.effects) {
      const bonus = unitHasKeyword(ab.name ? [ab.name] : [], "empower")
        ? empowerBonus(fx, spent)
        : 0;
      const value = (fx.value ?? 0) + bonus;

      switch (fx.op) {
        case "deal_damage":
          result.damageToKeeper = (result.damageToKeeper ?? 0) + value;
          result.notes.push(`${ab.name}: deal ${value}`);
          break;
        case "heal":
          result.healKeeper = (result.healKeeper ?? 0) + value;
          result.notes.push(`${ab.name}: heal ${value}`);
          break;
        case "draw":
          result.draw = (result.draw ?? 0) + Math.max(1, value || 1);
          break;
        case "gain_energy":
          result.gainEnergy = (result.gainEnergy ?? 0) + Math.max(1, value || 1);
          break;
        case "buff_atk":
          result.buffAttack = (result.buffAttack ?? 0) + value;
          break;
        case "buff_hp":
          result.buffHealth = (result.buffHealth ?? 0) + value;
          break;
        case "destroy_target":
          result.destroyTarget = true;
          break;
        case "ward_grant":
          result.notes.push(`${ab.name}: ward`);
          break;
        case "charge_ready":
          result.notes.push(`${ab.name}: charge`);
          break;
        default:
          result.notes.push(`${ab.name}: ${fx.op}`);
      }
    }
  }
  return result;
}

/** Apply spell damage through Ward on a unit (if targeted). */
export function applySpellDamageToUnit(input: {
  damage: number;
  statuses: TcgStatusInstance[];
}): { damage: number; statuses: TcgStatusInstance[]; blocked: boolean } {
  const { statuses, blocked } = consumeWard(input.statuses);
  if (blocked) {
    return { damage: 0, statuses, blocked: true };
  }
  return { damage: input.damage, statuses, blocked: false };
}

export function summarizeAbilities(abilities: TcgAbility[]): {
  passive: string | null;
  active: string | null;
  ultimate: string | null;
} {
  const passive = abilities.find((a) => a.timing === "passive");
  const active = abilities.find(
    (a) => a.timing === "activated" || a.timing === "battlecry",
  );
  const ultimate = abilities.find((a) => a.timing === "ultimate");
  return {
    passive: passive?.text ?? null,
    active: active?.text ?? null,
    ultimate: ultimate?.text ?? null,
  };
}
