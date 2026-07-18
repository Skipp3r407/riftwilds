/**
 * High-level Credits economy actions — quests, jobs, events, shops, travel, restoration.
 * All mutations go through faucets/sinks → ledger. AI NPCs never call these with invented rewards.
 */

import { STARTER_QUEST_CHAIN } from "@/game/npcs/starter-quests";
import { JOB_BOARD } from "@/content/jobs/board";
import { PUBLIC_EVENTS } from "@/content/events/public-events";
import { getNpcShop } from "@/game/npcs/shops";
import {
  ensureStarterCredits,
  getCreditBalance,
  type CreditMutationResult,
} from "@/lib/credits/ledger";
import {
  grantDailyGoalCredits,
  grantEventCredits,
  grantJobBoardCredits,
  grantQuestCredits,
  grantWeeklyGoalCredits,
} from "@/lib/credits/faucets";
import {
  donateRestoration,
  sellNpcShopItem,
  spendNpcShop,
  spendRepair,
  spendTravel,
  spendServiceFee,
} from "@/lib/credits/sinks";
import { DAILY_GOALS, WEEKLY_GOALS } from "@/content/goals/daily-weekly";
import { debitCredits } from "@/lib/credits/ledger";

export type EconomyActionResult = {
  ok: boolean;
  balance: number;
  message: string;
  error?: string;
  entryId?: string;
  secondary?: CreditMutationResult;
};

function fail(userId: string, message: string, error = "validation_failed"): EconomyActionResult {
  return { ok: false, balance: getCreditBalance(userId), message, error };
}

function okResult(userId: string, result: CreditMutationResult, message: string): EconomyActionResult {
  if (!result.ok) {
    return {
      ok: false,
      balance: result.balance ?? getCreditBalance(userId),
      message: result.message,
      error: result.error,
    };
  }
  return {
    ok: true,
    balance: result.balance,
    message,
    entryId: result.entry.id,
  };
}

export function ensurePlayerCredits(userId: string): EconomyActionResult {
  const r = ensureStarterCredits(userId);
  return okResult(userId, r, "Starter Credits ready");
}

export function actionCompleteQuest(params: {
  userId: string;
  questKey: string;
  amount?: number;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const quest = STARTER_QUEST_CHAIN.find((q) => q.key === params.questKey);
  const soft = quest?.rewards.find((r) => r.kind === "soft_currency");
  const amount = params.amount ?? soft?.amount ?? 0;
  if (!Number.isInteger(amount) || amount <= 0) {
    return fail(params.userId, "Quest has no Credits reward");
  }
  const r = grantQuestCredits({
    userId: params.userId,
    questKey: params.questKey,
    amount,
  });
  return okResult(params.userId, r, `Quest Credits granted (+${amount})`);
}

export function actionCompleteJob(params: {
  userId: string;
  jobId: string;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const job = JOB_BOARD.find((j) => j.id === params.jobId);
  if (!job) return fail(params.userId, "Unknown job");

  if (job.feeCost > 0) {
    const fee =
      job.feeReason === "TRAVEL_FEE"
        ? spendTravel({
            userId: params.userId,
            fromRegion: job.regionId,
            toRegion: job.regionId,
            amount: job.feeCost,
            requestId: params.requestId
              ? `${params.requestId}:fee`
              : `job-fee:${params.userId}:${job.id}:${Date.now()}`,
          })
        : job.feeReason === "SERVICE_FEE"
          ? spendServiceFee({
              userId: params.userId,
              serviceId: job.id,
              amount: job.feeCost,
              requestId: params.requestId
                ? `${params.requestId}:fee`
                : `job-fee:${params.userId}:${job.id}:${Date.now()}`,
            })
          : debitCredits({
              userId: params.userId,
              amount: job.feeCost,
              reason: "JOB_BOARD_FEE",
              requestId: params.requestId
                ? `${params.requestId}:fee`
                : `job-fee:${params.userId}:${job.id}:${Date.now()}`,
              metadata: { jobId: job.id },
            });
    if (!fee.ok) return okResult(params.userId, fee, fee.message);
  }

  const day = new Date().toISOString().slice(0, 10);
  const r = grantJobBoardCredits({
    userId: params.userId,
    jobId: job.id,
    amount: job.creditReward,
    requestId:
      params.requestId ?? `job:${params.userId}:${job.id}:${day}`,
  });
  return okResult(params.userId, r, `Job complete (+${job.creditReward} Credits)`);
}

export function actionEventReward(params: {
  userId: string;
  eventId: string;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const event = PUBLIC_EVENTS.find((e) => e.id === params.eventId);
  if (!event) return fail(params.userId, "Unknown event");
  const day = new Date().toISOString().slice(0, 10);
  const r = grantEventCredits({
    userId: params.userId,
    eventKey: event.id,
    amount: event.creditReward,
    requestId: params.requestId ?? `event:${params.userId}:${event.id}:${day}`,
  });
  return okResult(params.userId, r, `Event reward (+${event.creditReward} Credits)`);
}

export function actionNpcShopBuy(params: {
  userId: string;
  shopId: string;
  itemId: string;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const shop = getNpcShop(params.shopId);
  const item = shop?.buy.find((i) => i.itemId === params.itemId);
  if (!shop || !item) return fail(params.userId, "Item not found");
  const r = spendNpcShop({
    userId: params.userId,
    shopId: params.shopId,
    itemId: params.itemId,
    price: item.price,
    requestId:
      params.requestId ?? `shop-buy:${params.userId}:${params.shopId}:${params.itemId}:${Date.now()}`,
  });
  return okResult(params.userId, r, `Purchased ${item.name} (−${item.price} Credits)`);
}

export function actionNpcShopSell(params: {
  userId: string;
  shopId: string;
  itemId: string;
  buyPrice: number;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const r = sellNpcShopItem({
    userId: params.userId,
    shopId: params.shopId,
    itemId: params.itemId,
    buyPrice: params.buyPrice,
    requestId:
      params.requestId ?? `shop-sell:${params.userId}:${params.shopId}:${params.itemId}:${Date.now()}`,
  });
  return okResult(params.userId, r, "Sold item (discounted sell-back)");
}

export function actionTravel(params: {
  userId: string;
  fromRegion: string;
  toRegion: string;
  amount: number;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const r = spendTravel({
    userId: params.userId,
    fromRegion: params.fromRegion,
    toRegion: params.toRegion,
    amount: params.amount,
    requestId:
      params.requestId ??
      `travel:${params.userId}:${params.fromRegion}:${params.toRegion}:${Date.now()}`,
  });
  return okResult(params.userId, r, `Travel fee (−${params.amount} Credits)`);
}

export function actionRestoreDonate(params: {
  userId: string;
  milestoneKey: string;
  amount: number;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const r = donateRestoration({
    userId: params.userId,
    milestoneKey: params.milestoneKey,
    amount: params.amount,
    requestId:
      params.requestId ?? `restore:${params.userId}:${params.milestoneKey}:${Date.now()}`,
  });
  return okResult(params.userId, r, `Restoration donation (−${params.amount} Credits, burned)`);
}

export function actionRepair(params: {
  userId: string;
  targetId: string;
  amount: number;
  requestId?: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const r = spendRepair({
    userId: params.userId,
    targetId: params.targetId,
    amount: params.amount,
    requestId: params.requestId ?? `repair:${params.userId}:${params.targetId}:${Date.now()}`,
  });
  return okResult(params.userId, r, `Repair (−${params.amount} Credits)`);
}

export function actionDailyGoal(params: {
  userId: string;
  goalKey: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const goal = DAILY_GOALS.find((g) => g.id === params.goalKey);
  if (!goal) return fail(params.userId, "Unknown daily goal");
  const day = new Date().toISOString().slice(0, 10);
  const r = grantDailyGoalCredits({
    userId: params.userId,
    goalKey: goal.id,
    amount: goal.creditReward,
    dayKey: day,
  });
  return okResult(params.userId, r, `Daily goal (+${goal.creditReward} Credits)`);
}

export function actionWeeklyGoal(params: {
  userId: string;
  goalKey: string;
}): EconomyActionResult {
  ensureStarterCredits(params.userId);
  const goal = WEEKLY_GOALS.find((g) => g.id === params.goalKey);
  if (!goal) return fail(params.userId, "Unknown weekly goal");
  const week = new Date().toISOString().slice(0, 10);
  const r = grantWeeklyGoalCredits({
    userId: params.userId,
    goalKey: goal.id,
    amount: goal.creditReward,
    weekKey: week,
  });
  return okResult(params.userId, r, `Weekly goal (+${goal.creditReward} Credits)`);
}
