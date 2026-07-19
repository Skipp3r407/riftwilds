/**
 * Balance metrics + archetype helpers for long-term live ops.
 */

import type { NormalizedTcgCard } from "@/content/tcg/framework/normalize-card";

export type ArchetypeId =
  | "aggro"
  | "midrange"
  | "control"
  | "combo"
  | "tempo"
  | "ramp"
  | "tribal"
  | "toolbox";

export type ArchetypeDef = {
  id: ArchetypeId | string;
  name: string;
  description: string;
  /** Preferred roles in the 30-card shell. */
  roleBias: string[];
  /** Soft curve center (energy cost). */
  curveCenter: number;
  exampleKeywords: string[];
};

export const ARCHETYPES: ArchetypeDef[] = [
  {
    id: "aggro",
    name: "Ember Aggro",
    description: "Low curve, Charge, race the Keeper.",
    roleBias: ["skirmisher", "striker", "finisher"],
    curveCenter: 2,
    exampleKeywords: ["charge", "empower"],
  },
  {
    id: "midrange",
    name: "Grove Midrange",
    description: "Riftbond value and Bloom boards.",
    roleBias: ["striker", "support", "tank"],
    curveCenter: 3.5,
    exampleKeywords: ["riftbond", "bloom", "harmony"],
  },
  {
    id: "control",
    name: "Tide Control",
    description: "Ward walls, removal, late finishers.",
    roleBias: ["controller", "tank", "finisher"],
    curveCenter: 4,
    exampleKeywords: ["ward", "shatter", "echo"],
  },
  {
    id: "combo",
    name: "Spirit Combo",
    description: "Soulbind / Echo engines into burst turns.",
    roleBias: ["utility", "summoner", "finisher"],
    curveCenter: 3,
    exampleKeywords: ["soulbind", "echo", "awaken"],
  },
  {
    id: "tempo",
    name: "Spire Tempo",
    description: "Efficient trades and board swings.",
    roleBias: ["skirmisher", "controller", "striker"],
    curveCenter: 2.5,
    exampleKeywords: ["charge", "overflow"],
  },
  {
    id: "ramp",
    name: "Stone Ramp",
    description: "Early energy tricks into Ancient threats.",
    roleBias: ["ramp", "tank", "finisher"],
    curveCenter: 4.5,
    exampleKeywords: ["ancient", "guardian"],
  },
];

export type BalanceBucket = {
  band: "weak" | "fair" | "strong" | "outlier";
  cards: { id: string; name: string; powerScore: number }[];
};

export function bucketByPower(cards: NormalizedTcgCard[]): BalanceBucket[] {
  const bands: BalanceBucket[] = [
    { band: "weak", cards: [] },
    { band: "fair", cards: [] },
    { band: "strong", cards: [] },
    { band: "outlier", cards: [] },
  ];
  for (const c of cards) {
    const s = c.balance.powerScore;
    const row = { id: c.id, name: c.localization.name, powerScore: s };
    if (s < 35) bands[0]!.cards.push(row);
    else if (s < 65) bands[1]!.cards.push(row);
    else if (s < 85) bands[2]!.cards.push(row);
    else bands[3]!.cards.push(row);
  }
  return bands;
}

/** Soft health check — flags curve / role holes for a 30-card list. */
export function analyzeDeckBalance(
  cards: NormalizedTcgCard[],
): {
  avgCost: number;
  avgPowerScore: number;
  roleCounts: Record<string, number>;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (cards.length === 0) {
    return { avgCost: 0, avgPowerScore: 0, roleCounts: {}, warnings: ["Empty deck"] };
  }
  const avgCost =
    cards.reduce((a, c) => a + c.energyCost, 0) / cards.length;
  const avgPowerScore =
    cards.reduce((a, c) => a + c.balance.powerScore, 0) / cards.length;
  const roleCounts: Record<string, number> = {};
  for (const c of cards) {
    roleCounts[c.role] = (roleCounts[c.role] ?? 0) + 1;
  }
  if (avgCost < 2) warnings.push("Curve very low — may brick vs control.");
  if (avgCost > 4.5) warnings.push("Curve very high — vulnerable to aggro.");
  if ((roleCounts.controller ?? 0) === 0 && (roleCounts.support ?? 0) === 0) {
    warnings.push("No interaction / support roles detected.");
  }
  return { avgCost, avgPowerScore, roleCounts, warnings };
}
