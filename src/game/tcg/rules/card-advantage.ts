/**
 * Strategic card advantage (Rules v2.2) — keywords + limited conversions.
 *
 * Design intent:
 * - Draw **one** card at the start of each turn (engine).
 * - Never auto-replace a played card with a free draw.
 * - Extra cards come from keywords, limited Commander focus, relics, and
 *   optional resource conversions — not from flood / unlimited draw.
 */

import { unitHasKeyword } from "@/game/tcg/combat/keywords";
import type {
  CardAdvantageRules,
} from "@/game/tcg/rules/battle-rules-config";
import type { TcgCardInstance, TcgPlayerSide } from "@/game/tcg/types";

export type { CardAdvantageRules };

export const CARD_ADVANTAGE_KEYWORDS = [
  "insight",
  "inspire",
  "scout",
  "discover",
] as const;

export type CardAdvantageKeyword = (typeof CARD_ADVANTAGE_KEYWORDS)[number];

export type CardAdvantageConversion =
  | "ENERGY_TO_DRAW"
  | "DISCARD_FOR_ENERGY"
  | "RECYCLE";

export const DEFAULT_CARD_ADVANTAGE_RULES: CardAdvantageRules = {
  energyToDrawCost: 2,
  discardForEnergyAmount: 1,
  commanderDrawCost: 1,
  commanderDrawPerTurn: 1,
  oneConversionEachPerTurn: true,
};

/** Optional cost lookup — inject from engine to avoid catalog cycles in tests. */
let costLookup: ((defId: string) => number) | null = null;

export function setCardAdvantageCostLookup(
  fn: ((defId: string) => number) | null,
): void {
  costLookup = fn;
}

export type CardAdvantageSideFlags = {
  /** Inspire draw already granted this turn. */
  inspireUsedThisTurn: boolean;
  /** Companions summoned this turn (for Inspire). */
  companionsSummonedThisTurn: number;
  /** Cards played this turn (for relic thrift triggers). */
  cardsPlayedThisTurn: number;
  /** Temp Energy to grant at next turn start. */
  pendingTempEnergyNextTurn: number;
  /** Conversion kinds already used this turn. */
  conversionsUsedThisTurn: CardAdvantageConversion[];
  /** Commander Focus uses this turn. */
  commanderDrawsThisTurn: number;
  /** Relic end-of-turn draw already fired this turn. */
  relicDrawUsedThisTurn: boolean;
};

export function freshCardAdvantageFlags(): CardAdvantageSideFlags {
  return {
    inspireUsedThisTurn: false,
    companionsSummonedThisTurn: 0,
    cardsPlayedThisTurn: 0,
    pendingTempEnergyNextTurn: 0,
    conversionsUsedThisTurn: [],
    commanderDrawsThisTurn: 0,
    relicDrawUsedThisTurn: false,
  };
}

export function resetCardAdvantageTurnFlags(
  flags: CardAdvantageSideFlags,
): void {
  flags.inspireUsedThisTurn = false;
  flags.companionsSummonedThisTurn = 0;
  flags.cardsPlayedThisTurn = 0;
  flags.conversionsUsedThisTurn = [];
  flags.commanderDrawsThisTurn = 0;
  flags.relicDrawUsedThisTurn = false;
}

/** Printed cost helper for Scout / Discover auto-picks. */
export function printedCostOf(defId: string): number {
  if (costLookup) return costLookup(defId);
  return 99;
}

/**
 * Scout: draw already happened; put the priciest hand card on the bottom
 * (filters bricks; keeps cheap plays).
 */
export function pickScoutBottomCard(
  hand: TcgCardInstance[],
): TcgCardInstance | null {
  if (hand.length === 0) return null;
  let best = hand[0]!;
  let bestCost = printedCostOf(best.defId);
  for (let i = 1; i < hand.length; i += 1) {
    const c = hand[i]!;
    const cost = printedCostOf(c.defId);
    if (cost > bestCost) {
      best = c;
      bestCost = cost;
    }
  }
  return best;
}

/**
 * Discover: among revealed candidates, take the cheapest (Practice / AI default).
 * Returns index into `candidates`.
 */
export function pickDiscoverIndex(candidates: TcgCardInstance[]): number {
  if (candidates.length === 0) return -1;
  let best = 0;
  let bestCost = printedCostOf(candidates[0]!.defId);
  for (let i = 1; i < candidates.length; i += 1) {
    const cost = printedCostOf(candidates[i]!.defId);
    if (cost < bestCost) {
      best = i;
      bestCost = cost;
    }
  }
  return best;
}

export function sideHasInspireOnBoard(side: TcgPlayerSide): boolean {
  return side.board.some((u) => unitHasKeyword(u.keywords, "inspire"));
}

export function conversionAlreadyUsed(
  flags: CardAdvantageSideFlags,
  kind: CardAdvantageConversion,
): boolean {
  return flags.conversionsUsedThisTurn.includes(kind);
}

export function canEnergyToDraw(input: {
  energy: number;
  handSize: number;
  maxHand: number;
  flags: CardAdvantageSideFlags;
  rules: CardAdvantageRules;
}): { ok: true } | { ok: false; reason: string } {
  if (
    input.rules.oneConversionEachPerTurn &&
    conversionAlreadyUsed(input.flags, "ENERGY_TO_DRAW")
  ) {
    return { ok: false, reason: "CONVERSION_USED" };
  }
  if (input.energy < input.rules.energyToDrawCost) {
    return { ok: false, reason: "INSUFFICIENT_RIFT_ENERGY" };
  }
  if (input.handSize >= input.maxHand) {
    return { ok: false, reason: "HAND_FULL" };
  }
  return { ok: true };
}

export function canDiscardForEnergy(input: {
  handSize: number;
  flags: CardAdvantageSideFlags;
  rules: CardAdvantageRules;
}): { ok: true } | { ok: false; reason: string } {
  if (
    input.rules.oneConversionEachPerTurn &&
    conversionAlreadyUsed(input.flags, "DISCARD_FOR_ENERGY")
  ) {
    return { ok: false, reason: "CONVERSION_USED" };
  }
  if (input.handSize < 1) return { ok: false, reason: "NO_CARD" };
  return { ok: true };
}

export function canRecycle(input: {
  handSize: number;
  deckSize: number;
  maxHand: number;
  flags: CardAdvantageSideFlags;
  rules: CardAdvantageRules;
}): { ok: true } | { ok: false; reason: string } {
  if (
    input.rules.oneConversionEachPerTurn &&
    conversionAlreadyUsed(input.flags, "RECYCLE")
  ) {
    return { ok: false, reason: "CONVERSION_USED" };
  }
  if (input.handSize < 1) return { ok: false, reason: "NO_CARD" };
  // Net-zero: shuffle one back, draw one — need a deck card OR the recycled card.
  if (input.deckSize < 1 && input.handSize < 1) {
    return { ok: false, reason: "EMPTY_DECK" };
  }
  if (input.handSize >= input.maxHand && input.deckSize < 1) {
    return { ok: false, reason: "HAND_FULL" };
  }
  return { ok: true };
}

export function canCommanderDraw(input: {
  energy: number;
  handSize: number;
  maxHand: number;
  flags: CardAdvantageSideFlags;
  rules: CardAdvantageRules;
  hasCommander: boolean;
}): { ok: true } | { ok: false; reason: string } {
  if (!input.hasCommander) return { ok: false, reason: "NO_COMMANDER" };
  if (input.flags.commanderDrawsThisTurn >= input.rules.commanderDrawPerTurn) {
    return { ok: false, reason: "COMMANDER_DRAW_USED" };
  }
  if (input.energy < input.rules.commanderDrawCost) {
    return { ok: false, reason: "INSUFFICIENT_RIFT_ENERGY" };
  }
  if (input.handSize >= input.maxHand) {
    return { ok: false, reason: "HAND_FULL" };
  }
  return { ok: true };
}

/** How many plain draws a resolving card should grant (Insight / op:draw). */
export function resolveInsightDrawCount(input: {
  keywords: string[];
  abilityDraw?: number;
  /** Scout / Discover already handle their own card flow. */
  skipPlainDraw?: boolean;
}): number {
  if (input.skipPlainDraw) return 0;
  const fromKeyword = unitHasKeyword(input.keywords, "insight") ? 1 : 0;
  const fromAbility = Math.max(0, input.abilityDraw ?? 0);
  return Math.max(fromKeyword, fromAbility);
}

export function cardUsesScout(keywords: string[]): boolean {
  return unitHasKeyword(keywords, "scout");
}

export function cardUsesDiscover(keywords: string[]): boolean {
  return unitHasKeyword(keywords, "discover");
}

/**
 * Relic thrift: end of turn, 0 Energy left, played ≥1 card → draw 1 once.
 * Relics tagged with Insight grant this (strategic, not flood).
 */
export function relicGrantsThriftDraw(keywords: string[] | undefined): boolean {
  return unitHasKeyword(keywords, "insight");
}
