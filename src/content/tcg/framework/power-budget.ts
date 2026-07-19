/**
 * Power-budget checks + deck analytics warnings.
 * Soft gates — never silently rewrite card JSON.
 */

import type { NormalizedTcgCard } from "@/content/tcg/framework/normalize-card";
import { estimatePowerBudget } from "@/game/tcg/combat/formulas";

export type PowerBudgetReport = {
  cardId: string;
  name: string;
  cost: number;
  budget: number;
  /** Expected band midpoint by cost. */
  expected: number;
  band: "under" | "fair" | "over" | "outlier";
  warnings: string[];
};

const EXPECTED_BY_COST: Record<number, number> = {
  1: 4.5,
  2: 5.5,
  3: 6.5,
  4: 7.5,
  5: 8.5,
  6: 9.5,
  7: 10.5,
  8: 11.5,
  9: 12.5,
  10: 13.5,
};

export function expectedBudgetForCost(cost: number): number {
  const c = Math.max(1, Math.min(10, Math.round(cost)));
  return EXPECTED_BY_COST[c] ?? 7;
}

export function evaluateCardPowerBudget(
  card: Pick<
    NormalizedTcgCard,
    | "id"
    | "localization"
    | "energyCost"
    | "attack"
    | "health"
    | "defense"
    | "speed"
    | "keywords"
    | "type"
  >,
): PowerBudgetReport {
  const warnings: string[] = [];
  const atk = card.attack ?? 0;
  const hp = card.health ?? 0;
  const budget = estimatePowerBudget({
    cost: card.energyCost,
    attack: atk,
    health: hp,
    defense: card.defense,
    speed: card.speed,
    keywordCount: card.keywords.length,
  });
  const expected = expectedBudgetForCost(card.energyCost);
  const delta = budget - expected;
  let band: PowerBudgetReport["band"] = "fair";
  if (delta <= -2.5) band = "under";
  else if (delta >= 4) band = "outlier";
  else if (delta >= 2) band = "over";

  if (band === "over" || band === "outlier") {
    warnings.push(
      `${card.localization.name} power budget ${budget} vs expected ~${expected} (cost ${card.energyCost}).`,
    );
  }
  if (atk >= 12 && card.energyCost <= 3) {
    warnings.push("High ATK on low cost — watch aggro outliers.");
  }
  if (hp >= 20 && card.energyCost <= 4) {
    warnings.push("Very high HP for curve — tank outlier.");
  }

  return {
    cardId: card.id,
    name: card.localization.name,
    cost: card.energyCost,
    budget,
    expected,
    band,
    warnings,
  };
}

export function analyzeDeckPowerBudget(cards: NormalizedTcgCard[]): {
  avgBudget: number;
  roleCounts: Record<string, number>;
  warnings: string[];
  outliers: PowerBudgetReport[];
} {
  const reports = cards.map(evaluateCardPowerBudget);
  const warnings: string[] = [];
  const roleCounts: Record<string, number> = {};
  for (const c of cards) {
    roleCounts[c.role] = (roleCounts[c.role] ?? 0) + 1;
  }
  const avgBudget =
    reports.reduce((a, r) => a + r.budget, 0) / Math.max(1, reports.length);
  const outliers = reports.filter(
    (r) => r.band === "over" || r.band === "outlier",
  );
  for (const r of outliers) warnings.push(...r.warnings);

  if ((roleCounts.tank ?? 0) + (roleCounts.defender ?? 0) === 0) {
    warnings.push("No tank/defender — vulnerable to face races.");
  }
  if ((roleCounts.healer ?? 0) + (roleCounts.support ?? 0) === 0) {
    warnings.push("No support/healer roles detected.");
  }
  if (avgBudget > 9) warnings.push("Deck average power budget is high.");
  if (avgBudget < 4.5) warnings.push("Deck average power budget is low.");

  return { avgBudget, roleCounts, warnings, outliers };
}
