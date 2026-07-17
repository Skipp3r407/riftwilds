import type { AffinityName } from "@prisma/client";

export const ARENA_AFFINITY_VERSION = 1;

/** Modest modifiers — not Pokémon 2×/4×. */
export type ArenaMatchup = "ADV" | "STRONG_ADV" | "NEUTRAL" | "RESIST" | "STRONG_RESIST";

export const ARENA_MATCHUP_MOD: Record<ArenaMatchup, number> = {
  STRONG_ADV: 1.25,
  ADV: 1.15,
  NEUTRAL: 1,
  RESIST: 0.85,
  STRONG_RESIST: 0.75,
};

/**
 * Original Riftwilds Arena chart (attacker → defender).
 * Compact intentional design — differs from care/hatch affinity chart emphasis.
 */
const CHART: Partial<Record<AffinityName, Partial<Record<AffinityName, ArenaMatchup>>>> = {
  EMBER: { GROVE: "ADV", FROST: "STRONG_ADV", TIDE: "RESIST", STONE: "RESIST", VOID: "STRONG_RESIST" },
  TIDE: { EMBER: "STRONG_ADV", STONE: "ADV", STORM: "RESIST", GROVE: "RESIST", ALLOY: "STRONG_RESIST" },
  GROVE: { TIDE: "ADV", STONE: "STRONG_ADV", EMBER: "RESIST", FROST: "STRONG_RESIST", SPIRIT: "RESIST" },
  STORM: { TIDE: "STRONG_ADV", ALLOY: "ADV", STONE: "RESIST", SPIRIT: "RESIST", FROST: "STRONG_RESIST" },
  STONE: { STORM: "ADV", EMBER: "STRONG_ADV", TIDE: "RESIST", GROVE: "RESIST", VOID: "STRONG_RESIST" },
  FROST: { GROVE: "STRONG_ADV", STORM: "ADV", EMBER: "STRONG_RESIST", ALLOY: "RESIST", RADIANT: "RESIST" },
  RADIANT: { VOID: "STRONG_ADV", SPIRIT: "ADV", ALLOY: "RESIST", FROST: "RESIST", EMBER: "STRONG_RESIST" },
  VOID: { RADIANT: "ADV", SPIRIT: "STRONG_ADV", STONE: "RESIST", GROVE: "RESIST", STORM: "STRONG_RESIST" },
  ALLOY: { FROST: "ADV", RADIANT: "STRONG_ADV", STORM: "RESIST", TIDE: "STRONG_RESIST", SPIRIT: "RESIST" },
  SPIRIT: { ALLOY: "STRONG_ADV", STORM: "ADV", VOID: "RESIST", RADIANT: "RESIST", TIDE: "STRONG_RESIST" },
};

export function getArenaMatchup(attacker: AffinityName, defender: AffinityName): ArenaMatchup {
  if (attacker === defender) return "NEUTRAL";
  return CHART[attacker]?.[defender] ?? "NEUTRAL";
}

export function getArenaAffinityModifier(attacker: AffinityName, defender: AffinityName): number {
  return ARENA_MATCHUP_MOD[getArenaMatchup(attacker, defender)];
}

export function getPublicAffinityChart(): Record<
  string,
  Partial<Record<string, ArenaMatchup>>
> {
  return CHART as Record<string, Partial<Record<string, ArenaMatchup>>>;
}
