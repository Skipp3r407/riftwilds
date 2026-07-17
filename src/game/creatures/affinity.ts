import type { AffinityName, MatchupResult } from "@prisma/client";

/**
 * Original Riftwilds affinity chart — smaller and distinct from Pokémon types.
 * Values are basis points (10000 = 1.0x).
 */
export const AFFINITY_MODIFIER_BPS: Record<MatchupResult, number> = {
  STRONG: 12500,
  WEAK: 7500,
  RESIST: 5000,
  NEUTRAL: 10000,
};

/** Compact original matchup table: attacker -> defender -> result */
export const AFFINITY_CHART: Partial<
  Record<AffinityName, Partial<Record<AffinityName, MatchupResult>>>
> = {
  EMBER: { GROVE: "STRONG", FROST: "STRONG", TIDE: "WEAK", STONE: "WEAK", VOID: "RESIST" },
  TIDE: { EMBER: "STRONG", STONE: "STRONG", STORM: "WEAK", GROVE: "WEAK", ALLOY: "RESIST" },
  GROVE: { TIDE: "STRONG", STONE: "STRONG", EMBER: "WEAK", FROST: "WEAK", SPIRIT: "RESIST" },
  STORM: { TIDE: "STRONG", ALLOY: "STRONG", STONE: "WEAK", SPIRIT: "WEAK", FROST: "RESIST" },
  STONE: { STORM: "STRONG", EMBER: "STRONG", TIDE: "WEAK", GROVE: "WEAK", VOID: "RESIST" },
  FROST: { GROVE: "STRONG", STORM: "STRONG", EMBER: "WEAK", ALLOY: "WEAK", RADIANT: "RESIST" },
  RADIANT: { VOID: "STRONG", SPIRIT: "STRONG", ALLOY: "WEAK", FROST: "WEAK", EMBER: "RESIST" },
  VOID: { RADIANT: "STRONG", SPIRIT: "STRONG", STONE: "WEAK", GROVE: "WEAK", STORM: "RESIST" },
  ALLOY: { FROST: "STRONG", RADIANT: "STRONG", STORM: "WEAK", TIDE: "WEAK", SPIRIT: "RESIST" },
  SPIRIT: { ALLOY: "STRONG", STORM: "STRONG", VOID: "WEAK", RADIANT: "WEAK", TIDE: "RESIST" },
};

export function getMatchup(
  attacker: AffinityName,
  defender: AffinityName,
): MatchupResult {
  if (attacker === defender) return "NEUTRAL";
  return AFFINITY_CHART[attacker]?.[defender] ?? "NEUTRAL";
}

export function getAffinityModifier(
  attacker: AffinityName,
  defender: AffinityName,
): number {
  const result = getMatchup(attacker, defender);
  return AFFINITY_MODIFIER_BPS[result] / 10000;
}
