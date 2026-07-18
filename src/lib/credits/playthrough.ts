/**
 * Economic playthrough harness — earns then spends Credits through real ledger APIs.
 * Used by tests + simulations. No real SOL.
 */

import {
  creditCredits,
  ensureStarterCredits,
  getCreditBalance,
  getEconomyHealth,
  resetCreditLedgerForTests,
} from "@/lib/credits/ledger";
import {
  grantCraftCredits,
  grantDailyGoalCredits,
  grantGatherCredits,
  grantJobBoardCredits,
  grantQuestCredits,
  grantRiftlingBonus,
} from "@/lib/credits/faucets";
import {
  donateRestoration,
  sellNpcShopItem,
  spendCraftFee,
  spendNpcShop,
  spendRepair,
  spendTravel,
  takeMarketplaceSaleFee,
} from "@/lib/credits/sinks";

export type PlaythroughStep = {
  step: string;
  ok: boolean;
  balance: number;
  detail?: string;
};

export type PlaythroughReport = {
  userId: string;
  steps: PlaythroughStep[];
  finalBalance: number;
  earned: number;
  spent: number;
  health: ReturnType<typeof getEconomyHealth>;
  passed: boolean;
};

export function runCreditPlaythrough(userId = "playthrough-keeper"): PlaythroughReport {
  resetCreditLedgerForTests();
  const steps: PlaythroughStep[] = [];
  let earned = 0;
  let spent = 0;

  const track = (step: string, result: { ok: boolean; balance?: number; message?: string }, delta = 0) => {
    if (result.ok && delta > 0) earned += delta;
    if (result.ok && delta < 0) spent += -delta;
    steps.push({
      step,
      ok: result.ok,
      balance: result.balance ?? getCreditBalance(userId),
      detail: result.ok ? undefined : result.message,
    });
  };

  const starter = ensureStarterCredits(userId);
  track("starter_grant", starter, starter.ok ? 200 : 0);

  const q1 = grantQuestCredits({ userId, questKey: "starter-q1-awakening", amount: 25 });
  track("quest_q1", q1, q1.ok ? 25 : 0);

  const q2 = grantQuestCredits({ userId, questKey: "starter-q2-fragments", amount: 30 });
  track("quest_q2", q2, q2.ok ? 30 : 0);

  const day = new Date().toISOString().slice(0, 10);
  const daily = grantDailyGoalCredits({
    userId,
    goalKey: "daily-talk-npc",
    amount: 25,
    dayKey: day,
  });
  track("daily_goal", daily, daily.ok ? 25 : 0);

  const gather = grantGatherCredits({
    userId,
    nodeId: "gather-commons-moss",
    amount: 8,
    requestId: `gather:${userId}:1`,
  });
  track("gather", gather, gather.ok ? 8 : 0);

  const craftFee = spendCraftFee({
    userId,
    recipeId: "craft-commons-ration",
    amount: 5,
    requestId: `craftfee:${userId}:1`,
  });
  track("craft_fee", craftFee, craftFee.ok ? -5 : 0);

  const craft = grantCraftCredits({
    userId,
    recipeId: "craft-commons-ration",
    amount: 20,
    requestId: `craft:${userId}:1`,
  });
  track("craft_reward", craft, craft.ok ? 20 : 0);

  const job = grantJobBoardCredits({
    userId,
    jobId: "job-commons-lanterns",
    amount: 40,
    requestId: `job:${userId}:lanterns`,
  });
  track("job_board", job, job.ok ? 40 : 0);

  const shop = spendNpcShop({
    userId,
    shopId: "shop-mira-care",
    itemId: "mossmeal",
    price: 20,
    requestId: `shop:${userId}:mossmeal`,
  });
  track("npc_shop_buy", shop, shop.ok ? -20 : 0);

  // Buy-sell loop must not print money
  const sell = sellNpcShopItem({
    userId,
    shopId: "shop-mira-care",
    itemId: "mossmeal",
    buyPrice: 20,
    requestId: `sell:${userId}:mossmeal`,
  });
  track("npc_sell_back", sell, sell.ok ? 7 : 0); // 35% of 20 = 7

  const travel = spendTravel({
    userId,
    fromRegion: "riftwild-commons",
    toRegion: "ember-crater",
    amount: 15,
    requestId: `travel:${userId}:ember`,
  });
  track("travel_fee", travel, travel.ok ? -15 : 0);

  const repair = spendRepair({
    userId,
    targetId: "marker-plaza-1",
    amount: 10,
    requestId: `repair:${userId}:1`,
  });
  track("repair", repair, repair.ok ? -10 : 0);

  const donate = donateRestoration({
    userId,
    milestoneKey: "restore-commons-lanterns",
    amount: 50,
    requestId: `restore:${userId}:1`,
  });
  track("restoration_donate", donate, donate.ok ? -50 : 0);

  const fee = takeMarketplaceSaleFee({
    sellerId: userId,
    saleId: "sale-demo-1",
    priceCredits: 400,
    requestId: `mktfee:${userId}:1`,
  });
  track("marketplace_fee", fee, fee.ok ? -(fee.feeCredits ?? 0) : 0);

  const rift = grantRiftlingBonus({
    userId,
    petId: "pet-demo-1",
    dayKey: day,
    slot: 0,
  });
  track("riftling_bonus", rift, rift.ok ? 5 : 0);

  // AI cannot grant
  const aiBlocked = creditCredits({
    userId,
    amount: 9999,
    reason: "QUEST_REWARD",
    requestId: `ai-evil:${userId}`,
    metadata: { source: "ai_npc" },
  });
  track("ai_grant_blocked", {
    ok: !aiBlocked.ok,
    balance: getCreditBalance(userId),
    message: aiBlocked.ok ? "AI wrongly granted" : aiBlocked.message,
  });

  const finalBalance = getCreditBalance(userId);
  const health = getEconomyHealth();
  const passed =
    steps.every((s) => s.ok) &&
    starter.ok &&
    !aiBlocked.ok &&
    finalBalance > 0 &&
    spent > 0 &&
    earned > spent;

  return {
    userId,
    steps,
    finalBalance,
    earned,
    spent,
    health,
    passed,
  };
}
