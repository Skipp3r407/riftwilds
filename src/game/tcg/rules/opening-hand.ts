/**
 * Opening-hand shaping — ensure ≥1 playable vs starting Rift Energy.
 * Soft reshuffle of the dealt window; does not change deck composition.
 */

import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { isPracticeUsefulCard } from "@/game/tcg/practice-loadout";
import {
  STANDARD_BATTLE_RULES,
  type BattleRulesConfig,
} from "@/game/tcg/rules/battle-rules-config";
import { isCommanderPlayDef } from "@/game/tcg/play-cost";
import { isRiftSparkToken } from "@/game/tcg/rules/rift-spark";
import type { TcgCardInstance } from "@/game/tcg/types";

export type OpeningHandOpts = {
  openingSize?: number;
  /** Max printed cost considered playable on turn 1. */
  maxOpenCost?: number;
  /** When true, only practice-useful defs count as playable (teaching). */
  practiceUsefulOnly?: boolean;
};

export function isOpeningPlayable(
  inst: TcgCardInstance,
  maxOpenCost: number,
  practiceUsefulOnly: boolean,
): boolean {
  if (isRiftSparkToken(inst.defId)) return true;
  const def = getTcgCardDef(inst.defId);
  if (!def) return false;
  if (isCommanderPlayDef(def)) return false;
  if (def.riftCost > maxOpenCost) return false;
  if (practiceUsefulOnly && !isPracticeUsefulCard(def.id)) return false;
  return true;
}

export function openingHandHasPlayable(
  hand: TcgCardInstance[],
  opts?: OpeningHandOpts,
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): boolean {
  const maxOpenCost = opts?.maxOpenCost ?? rules.energy.turn1Max;
  const practiceUsefulOnly = opts?.practiceUsefulOnly ?? false;
  return hand.some((c) => isOpeningPlayable(c, maxOpenCost, practiceUsefulOnly));
}

/**
 * If the top `openingSize` cards have no affordable play, swap the priciest
 * hand card with the cheapest affordable card deeper in the deck.
 */
export function ensureOpeningHandPlayable(
  deck: TcgCardInstance[],
  opts?: OpeningHandOpts,
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): TcgCardInstance[] {
  const openingSize = opts?.openingSize ?? rules.hand.openingSize;
  const maxOpenCost = opts?.maxOpenCost ?? rules.energy.turn1Max;
  const practiceUsefulOnly = opts?.practiceUsefulOnly ?? false;
  if (deck.length <= openingSize) return [...deck];

  const cards = [...deck];
  const hand = cards.slice(0, openingSize);
  const rest = cards.slice(openingSize);

  const playable = (inst: TcgCardInstance) =>
    isOpeningPlayable(inst, maxOpenCost, practiceUsefulOnly);

  if (hand.some(playable)) return cards;

  const donorIdx = rest.findIndex(playable);
  if (donorIdx < 0) {
    // Soft fallback: any card ≤ turn1Max + 1 so turn 2 is rarely a full brick.
    const softMax = maxOpenCost + 1;
    const midIdx = rest.findIndex((inst) =>
      isOpeningPlayable(inst, softMax, practiceUsefulOnly),
    );
    if (midIdx < 0) return cards;
    return swapPriciest(hand, rest, midIdx);
  }

  return swapPriciest(hand, rest, donorIdx);
}

function handCost(inst: TcgCardInstance): number {
  return getTcgCardDef(inst.defId)?.riftCost ?? 99;
}

function swapPriciest(
  hand: TcgCardInstance[],
  rest: TcgCardInstance[],
  donorIdx: number,
): TcgCardInstance[] {
  let replaceAt = 0;
  for (let i = 1; i < hand.length; i += 1) {
    if (handCost(hand[i]!) > handCost(hand[replaceAt]!)) replaceAt = i;
  }
  const tmp = hand[replaceAt]!;
  hand[replaceAt] = rest[donorIdx]!;
  rest[donorIdx] = tmp;
  return [...hand, ...rest];
}
