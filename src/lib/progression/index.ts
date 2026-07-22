/**
 * Keeper Experience & Leveling System — public API.
 */

export { getXPForLevel, applyXpGain, xpProgressPercent } from "@/lib/progression/formula";
export { XP_SOURCE_AMOUNTS, XP_SOURCE_CATEGORY, isXpSourceKey, questXpSourceFromReward } from "@/lib/progression/sources";
export { calculateXpGrant, battleBonusSources } from "@/lib/progression/calc";
export { comboBonusPercent, comboMultiplierLabel, COMBO_TIERS } from "@/lib/progression/combo";
export { applyRestedXp, computeRestedPoolGain, RESTED_OFFLINE_MS } from "@/lib/progression/rested";
export { resolveBoostPercent, applyBoostPercent, prestigeXpPercent, BOOST_PERCENTS } from "@/lib/progression/boosts";
export { evaluateAntiFarm, repeatOpponentMultiplier } from "@/lib/progression/anti-farm";
export { rewardsForLevel, rewardsForLevelRange, PER_LEVEL_STATS } from "@/lib/progression/rewards";
export { canPrestige, applyPrestigeReset, PRESTIGE_LEVEL_REQUIREMENT } from "@/lib/progression/prestige";
export {
  grantXp,
  grantQuestXp,
  grantBattleXp,
  claimDailyLogin,
  performPrestige,
  getProgressionSnapshot,
} from "@/lib/progression/service";
export {
  getProgressionState,
  saveProgressionState,
  resetProgressionStoreForTests,
  emptyProgressionState,
} from "@/lib/progression/store";

export type {
  XpSourceKey,
  XpSourceCategory,
  ProgressionState,
  ProgressionSnapshot,
  XpGrantResult,
  LevelReward,
  GrantXpContext,
} from "@/lib/progression/types";
