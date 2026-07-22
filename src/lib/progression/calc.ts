/**
 * Pure XP calculation — base + combo + boosts + prestige + rested + anti-farm.
 */

import { applyAntiFarmMultiplier, evaluateAntiFarm } from "@/lib/progression/anti-farm";
import { applyBoostPercent, prestigeXpPercent, resolveBoostPercent } from "@/lib/progression/boosts";
import { refreshComboWindow } from "@/lib/progression/combo";
import { applyRestedXp } from "@/lib/progression/rested";
import { getBaseXpForSource, XP_SOURCE_CATEGORY } from "@/lib/progression/sources";
import type {
  GrantXpContext,
  ProgressionState,
  XpGrantBreakdown,
  XpSourceKey,
} from "@/lib/progression/types";

export type CalcXpInput = {
  source: XpSourceKey;
  state: ProgressionState;
  context?: GrantXpContext;
};

export type CalcXpOutput = {
  breakdown: XpGrantBreakdown;
  comboActivities: ProgressionState["comboActivities"];
  comboWindowStartedAt: number;
  restedXpPool: number;
};

export function calculateXpGrant(input: CalcXpInput): CalcXpOutput {
  const now = input.context?.now ?? Date.now();
  const category = XP_SOURCE_CATEGORY[input.source];
  const isBattle = category === "BATTLE";

  const anti = evaluateAntiFarm({
    afk: input.context?.afk,
    surrendered: input.context?.surrendered,
    botMatch: input.context?.botMatch,
    priorWinsVsOpponent: input.context?.opponentId
      ? input.state.opponentWinCounts[input.context.opponentId] ?? 0
      : 0,
    isBattleSource: isBattle && input.source === "BATTLE_WIN",
  });

  const base = getBaseXpForSource(input.source);
  if (!anti.allowed) {
    return {
      breakdown: {
        base,
        comboPercent: 0,
        comboBonus: 0,
        restedApplied: 0,
        boostPercent: 0,
        boostBonus: 0,
        prestigePercent: 0,
        prestigeBonus: 0,
        antiFarmMultiplier: 0,
        total: 0,
        deniedReason: anti.reason,
      },
      comboActivities: input.state.comboActivities,
      comboWindowStartedAt: input.state.comboWindowStartedAt,
      restedXpPool: input.state.restedXpPool,
    };
  }

  const combo = refreshComboWindow({
    activities: input.state.comboActivities,
    windowStartedAt: input.state.comboWindowStartedAt,
    category,
    now,
  });
  const comboBonus = Math.floor((base * combo.bonusPercent) / 100);
  let running = base + comboBonus;

  const boostPercent = resolveBoostPercent(input.context?.boosts, now);
  const boosted = applyBoostPercent(running, boostPercent);
  running = boosted.total;

  const prestigePercent = prestigeXpPercent(input.state.prestige);
  const prestigeBonus = Math.floor((running * prestigePercent) / 100);
  running += prestigeBonus;

  running = applyAntiFarmMultiplier(running, anti.multiplier);

  const rested = applyRestedXp({
    baseAfterOtherBonuses: running,
    restedPool: input.state.restedXpPool,
  });

  return {
    breakdown: {
      base,
      comboPercent: combo.bonusPercent,
      comboBonus,
      restedApplied: rested.restedApplied,
      boostPercent,
      boostBonus: boosted.bonus,
      prestigePercent,
      prestigeBonus,
      antiFarmMultiplier: anti.multiplier,
      total: rested.total,
      deniedReason: null,
    },
    comboActivities: combo.activities,
    comboWindowStartedAt: combo.windowStartedAt,
    restedXpPool: rested.poolRemaining,
  };
}

/** Bonus XP keys stacked onto a win. */
export function battleBonusSources(context?: GrantXpContext): XpSourceKey[] {
  const extras: XpSourceKey[] = [];
  if (context?.perfectVictory) extras.push("BATTLE_PERFECT");
  if (context?.noCardsLost) extras.push("BATTLE_NO_CARDS_LOST");
  if (context?.higherRanked) extras.push("BATTLE_HIGHER_RANK");
  return extras;
}
