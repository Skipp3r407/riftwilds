/**
 * Validated Credit faucets — quests, dailies, gather, craft, events, jobs, achievements.
 * Every grant goes through the authoritative ledger with caps.
 */

import { creditCredits, ensureStarterCredits } from "@/lib/credits/ledger";
import { RIFTLING_BONUS } from "@/lib/credits/config";
import type { CreditMutationResult } from "@/lib/credits/types";

export function grantQuestCredits(params: {
  userId: string;
  questKey: string;
  amount: number;
  requestId?: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "QUEST_REWARD",
    requestId: params.requestId ?? `quest:${params.userId}:${params.questKey}`,
    metadata: { questKey: params.questKey },
  });
}

export function grantDailyGoalCredits(params: {
  userId: string;
  goalKey: string;
  amount: number;
  dayKey: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "DAILY_GOAL",
    requestId: `daily:${params.userId}:${params.dayKey}:${params.goalKey}`,
    metadata: { goalKey: params.goalKey, dayKey: params.dayKey },
  });
}

export function grantWeeklyGoalCredits(params: {
  userId: string;
  goalKey: string;
  amount: number;
  weekKey: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "WEEKLY_GOAL",
    requestId: `weekly:${params.userId}:${params.weekKey}:${params.goalKey}`,
    metadata: { goalKey: params.goalKey, weekKey: params.weekKey },
  });
}

export function grantGatherCredits(params: {
  userId: string;
  nodeId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "GATHER",
    requestId: params.requestId,
    metadata: { nodeId: params.nodeId },
  });
}

export function grantCraftCredits(params: {
  userId: string;
  recipeId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "CRAFT",
    requestId: params.requestId,
    metadata: { recipeId: params.recipeId },
  });
}

export function grantEventCredits(params: {
  userId: string;
  eventKey: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "EVENT_REWARD",
    requestId: params.requestId,
    metadata: { eventKey: params.eventKey },
  });
}

export function grantJobBoardCredits(params: {
  userId: string;
  jobId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "JOB_BOARD",
    requestId: params.requestId,
    metadata: { jobId: params.jobId },
  });
}

export function grantAchievementCredits(params: {
  userId: string;
  achievementKey: string;
  amount: number;
}): CreditMutationResult {
  return creditCredits({
    userId: params.userId,
    amount: Math.min(params.amount, 100),
    reason: "ACHIEVEMENT",
    requestId: `ach:${params.userId}:${params.achievementKey}`,
    metadata: { achievementKey: params.achievementKey },
  });
}

/**
 * Capped Riftling care bonus — never unlimited passive Credits.
 */
export function grantRiftlingBonus(params: {
  userId: string;
  petId: string;
  dayKey: string;
  slot: number;
}): CreditMutationResult {
  if (params.slot < 0 || params.slot >= RIFTLING_BONUS.maxPetsCounted) {
    return {
      ok: false,
      error: "validation_failed",
      message: `Riftling bonus slots limited to ${RIFTLING_BONUS.maxPetsCounted}`,
    };
  }
  return creditCredits({
    userId: params.userId,
    amount: RIFTLING_BONUS.grantAmount,
    reason: "RIFTLING_BONUS",
    requestId: `riftling:${params.userId}:${params.dayKey}:${params.petId}`,
    metadata: {
      petId: params.petId,
      maxPerPetPerDay: RIFTLING_BONUS.maxPerPetPerDay,
      maxPerUserPerDay: RIFTLING_BONUS.maxPerUserPerDay,
    },
  });
}

export { ensureStarterCredits };
