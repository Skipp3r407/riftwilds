/**
 * Effective Rift Energy cost when playing a card from hand.
 * Printed cost lives on TcgCardDef.riftCost; discounts / modifiers apply here
 * BEFORE any affordability check.
 */

import { isCommanderCategory } from "@/content/tcg/framework/card-categories";
import { canAffordRiftCost } from "@/game/tcg/rift-energy";
import { isRiftSparkToken } from "@/game/tcg/rules/rift-spark";
import type { TcgCardDef } from "@/game/tcg/types";

export type PlayCostContext = {
  /** Commander passive: first Companion each game costs 1 less. */
  firstCompanionDiscountAvailable?: boolean;
  /**
   * Flat temporary cost delta applied after companion discount
   * (negative = cheaper, positive = more expensive).
   */
  temporaryCostModifier?: number;
  /**
   * Extra flat reductions from relics / buffs / auras (non-negative;
   * subtracted from cost after temporary modifier).
   */
  costReduction?: number;
};

export type ResolvedPlayCost = {
  /** Energy spent on a successful play. */
  cost: number;
  /** Printed / catalog rift cost before discounts. */
  printedCost: number;
  /** Whether the first-companion discount applied. */
  usedCompanionDiscount: boolean;
};

export function isCommanderPlayDef(def: TcgCardDef): boolean {
  const ct = def.contentType ?? "";
  return isCommanderCategory(ct) || ct === "hero";
}

/** Companions (not evolutions / commanders) receive the Keeper discount. */
export function isCompanionDiscountTarget(def: TcgCardDef): boolean {
  return (def.contentType ?? "") === "companion";
}

/**
 * Resolve spend cost for a hand play.
 * Order: printed → companion discount → temporary modifier → relic/buff reduction → clamp ≥ 0
 * - Rift Spark: free (special path; cost 0 by design)
 * - Commanders: not playable from hand (caller should reject); cost stays printed
 */
export function resolvePlayCost(
  def: TcgCardDef,
  ctx: PlayCostContext = {},
): ResolvedPlayCost {
  const printedCost = Math.max(0, def.riftCost);
  if (isRiftSparkToken(def.id)) {
    return { cost: 0, printedCost, usedCompanionDiscount: false };
  }

  let cost = printedCost;
  let usedCompanionDiscount = false;

  if (
    ctx.firstCompanionDiscountAvailable &&
    isCompanionDiscountTarget(def) &&
    cost > 0
  ) {
    cost = Math.max(0, cost - 1);
    usedCompanionDiscount = true;
  }

  const tempMod = ctx.temporaryCostModifier ?? 0;
  if (tempMod !== 0) {
    cost = Math.max(0, cost + tempMod);
  }

  const reduction = Math.max(0, ctx.costReduction ?? 0);
  if (reduction > 0) {
    cost = Math.max(0, cost - reduction);
  }

  return { cost, printedCost, usedCompanionDiscount };
}

/** True when current energy can pay the fully resolved play cost. */
export function canAffordPlay(
  currentEnergy: number,
  def: TcgCardDef,
  ctx: PlayCostContext = {},
): boolean {
  return canAffordRiftCost(currentEnergy, resolvePlayCost(def, ctx).cost);
}

export function playCostContextFromSide(side: {
  commander?: unknown;
  firstCompanionDiscountUsed?: boolean;
  temporaryPlayCostModifier?: number;
  playCostReduction?: number;
}): PlayCostContext {
  return {
    firstCompanionDiscountAvailable:
      Boolean(side.commander) && !side.firstCompanionDiscountUsed,
    temporaryCostModifier: side.temporaryPlayCostModifier ?? 0,
    costReduction: side.playCostReduction ?? 0,
  };
}
