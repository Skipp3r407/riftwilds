import type { Rarity } from "@prisma/client";
import { hatchOddsDefault } from "@/lib/config/project";

export type OddsMap = Record<Rarity, number>;

export const DEFAULT_ODDS: OddsMap = {
  COMMON: hatchOddsDefault.COMMON,
  UNCOMMON: hatchOddsDefault.UNCOMMON,
  RARE: hatchOddsDefault.RARE,
  EPIC: hatchOddsDefault.EPIC,
  LEGENDARY: hatchOddsDefault.LEGENDARY,
  MYTHIC: hatchOddsDefault.MYTHIC,
  CELESTIAL: hatchOddsDefault.CELESTIAL,
};

const RARITY_ORDER: Rarity[] = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "CELESTIAL",
];

export function validateOdds(odds: OddsMap): boolean {
  const total = RARITY_ORDER.reduce((sum, r) => sum + odds[r], 0);
  return total === 100;
}

/**
 * rollValue: 0–9999 from CSPRNG. Returns rarity using cumulative weights.
 */
export function pickRarityFromRoll(rollValue: number, odds: OddsMap = DEFAULT_ODDS): Rarity {
  if (!validateOdds(odds)) {
    throw new Error("Odds must sum to 100");
  }
  const normalized = ((rollValue % 10000) + 10000) % 10000;
  const bucket = Math.floor(normalized / 100); // 0–99
  let cumulative = 0;
  for (const rarity of RARITY_ORDER) {
    cumulative += odds[rarity];
    if (bucket < cumulative) return rarity;
  }
  return "COMMON";
}

export function marketplaceFee(priceCredits: number, feeBps: number): number {
  return Math.floor((priceCredits * feeBps) / 10000);
}
