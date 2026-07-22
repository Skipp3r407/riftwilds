/**
 * Mana / Rift Energy curve analysis for decks and the card pool.
 */

import type { TcgCard } from "@/content/tcg/types";
import {
  STANDARD_BATTLE_RULES,
  type BattleRulesConfig,
} from "@/game/tcg/rules/battle-rules-config";
import { isCombatEligibleCard } from "@/content/tcg/framework/combat-eligibility";
import { resolveCardCategory } from "@/content/tcg/framework/card-categories";

export type CurveBuckets = {
  /** Counts for costs 0..6 and 7+ */
  buckets: number[];
  total: number;
  zeroCost: number;
  earlyCurve: number; // cost ≤ turn1Max
  averageCost: number;
};

export type CurveWarning = {
  code:
    | "TOO_EXPENSIVE"
    | "NO_TURN1_PLAYS"
    | "ZERO_COST_CAP"
    | "ZERO_COST_FLOOD"
    | "THIN_EARLY_CURVE";
  severity: "error" | "warn" | "info";
  message: string;
};

export function energyCostOf(card: Pick<TcgCard, "energyCost">): number {
  return Math.max(0, card.energyCost ?? 0);
}

export function analyzeCurve(
  cards: Array<Pick<TcgCard, "energyCost">>,
): CurveBuckets {
  const buckets = [0, 0, 0, 0, 0, 0, 0, 0];
  let sum = 0;
  for (const c of cards) {
    const cost = energyCostOf(c);
    sum += cost;
    const idx = Math.min(7, cost);
    buckets[idx] = (buckets[idx] ?? 0) + 1;
  }
  const turn1 = STANDARD_BATTLE_RULES.energy.turn1Max;
  return {
    buckets,
    total: cards.length,
    zeroCost: buckets[0] ?? 0,
    earlyCurve: buckets.slice(0, turn1 + 1).reduce((a, b) => a + b, 0),
    averageCost: cards.length ? sum / cards.length : 0,
  };
}

export function isCollectibleZeroCostCombat(card: TcgCard): boolean {
  if (card.isToken) return false;
  if (!isCombatEligibleCard(card.id, card.type)) return false;
  const cat = resolveCardCategory(card.type, card.id);
  if (cat === "commander") return false;
  return energyCostOf(card) === 0;
}

export function countZeroCostInDeck(cards: TcgCard[]): number {
  return cards.filter(isCollectibleZeroCostCombat).length;
}

export function analyzeDeckCurveWarnings(
  cards: TcgCard[],
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): CurveWarning[] {
  const curve = analyzeCurve(cards);
  const warnings: CurveWarning[] = [];
  const turn1 = rules.energy.turn1Max;
  const maxZero = rules.deck.maxZeroCostPerDeck;

  const turn1Plays = cards.filter((c) => energyCostOf(c) <= turn1).length;
  if (turn1Plays === 0) {
    warnings.push({
      code: "NO_TURN1_PLAYS",
      severity: "error",
      message: `No cards costing ≤ ${turn1} Energy — opening turns will often brick.`,
    });
  } else if (turn1Plays < 4) {
    warnings.push({
      code: "THIN_EARLY_CURVE",
      severity: "warn",
      message: `Only ${turn1Plays} cards costing ≤ ${turn1}. Aim for at least 6–8 early plays.`,
    });
  }

  if (curve.averageCost >= 3.6) {
    warnings.push({
      code: "TOO_EXPENSIVE",
      severity: "warn",
      message: `Average cost ${curve.averageCost.toFixed(2)} is high — expect slow starts.`,
    });
  }

  if (curve.zeroCost > maxZero) {
    warnings.push({
      code: "ZERO_COST_CAP",
      severity: "error",
      message: `At most ${maxZero} zero-cost cards per deck (have ${curve.zeroCost}).`,
    });
  } else if (curve.zeroCost === maxZero) {
    warnings.push({
      code: "ZERO_COST_FLOOD",
      severity: "info",
      message: `At the ${maxZero} zero-cost deck cap.`,
    });
  }

  return warnings;
}

/** Histogram string for reports. */
export function formatCurveHistogram(curve: CurveBuckets): string {
  return curve.buckets
    .map((n, i) => `${i === 7 ? "7+" : i}:${n}`)
    .join("  ");
}
