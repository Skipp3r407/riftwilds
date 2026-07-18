import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { getSessionContext } from "@/lib/auth/session";
import { CREDITS_DISCLAIMER } from "@/lib/credits/config";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  actionCompleteJob,
  actionCompleteQuest,
  actionDailyGoal,
  actionEventReward,
  actionNpcShopBuy,
  actionNpcShopSell,
  actionRepair,
  actionRestoreDonate,
  actionTravel,
  actionWeeklyGoal,
  ensurePlayerCredits,
} from "@/lib/credits/actions";
import {
  findPrismaLedgerByRequestId,
  hydrateMemoryFromPrisma,
  persistRecentCreditMutation,
} from "@/lib/credits/persist-bridge";
import { getCreditBalance } from "@/lib/credits/ledger";

const bodySchema = z.object({
  action: z.enum([
    "ensure_starter",
    "quest_complete",
    "job_complete",
    "event_reward",
    "npc_shop_buy",
    "npc_shop_sell",
    "travel",
    "restore_donate",
    "repair",
    "daily_goal",
    "weekly_goal",
  ]),
  demoUser: z.string().min(2).max(80).optional(),
  requestId: z.string().min(4).max(200).optional(),
  questKey: z.string().optional(),
  amount: z.number().int().positive().optional(),
  jobId: z.string().optional(),
  eventId: z.string().optional(),
  shopId: z.string().optional(),
  itemId: z.string().optional(),
  buyPrice: z.number().int().positive().optional(),
  fromRegion: z.string().optional(),
  toRegion: z.string().optional(),
  milestoneKey: z.string().optional(),
  targetId: z.string().optional(),
  goalKey: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isFeatureEnabled("CREDITS_LEDGER_ENABLED")) {
    return jsonError("Credits ledger disabled", 503, "feature_disabled");
  }

  const guard = await withApiGuard({
    bucket: "credits-action",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "credits_economy_action",
  });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, "bad_json", guard.requestId);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 400, "validation_failed", guard.requestId);
  }

  const session = await getSessionContext();
  const userId = session?.userId ?? parsed.data.demoUser ?? "demo-keeper";

  await hydrateMemoryFromPrisma(userId);

  if (parsed.data.requestId) {
    const prior = await findPrismaLedgerByRequestId(parsed.data.requestId);
    if (prior) {
      return jsonOk(
        {
          balance: prior.balanceAfter,
          message: "Idempotent replay",
          entryId: prior.id,
          idempotentReplay: true,
          disclaimer: CREDITS_DISCLAIMER,
        },
        guard.requestId,
      );
    }
  }

  const d = parsed.data;
  let result;

  switch (d.action) {
    case "ensure_starter":
      result = ensurePlayerCredits(userId);
      break;
    case "quest_complete":
      if (!d.questKey) {
        return jsonError("questKey required", 400, "validation_failed", guard.requestId);
      }
      result = actionCompleteQuest({ userId, questKey: d.questKey, amount: d.amount });
      break;
    case "job_complete":
      if (!d.jobId) {
        return jsonError("jobId required", 400, "validation_failed", guard.requestId);
      }
      result = actionCompleteJob({ userId, jobId: d.jobId, requestId: d.requestId });
      break;
    case "event_reward":
      if (!d.eventId) {
        return jsonError("eventId required", 400, "validation_failed", guard.requestId);
      }
      result = actionEventReward({ userId, eventId: d.eventId, requestId: d.requestId });
      break;
    case "npc_shop_buy":
      if (!d.shopId || !d.itemId) {
        return jsonError("shopId and itemId required", 400, "validation_failed", guard.requestId);
      }
      result = actionNpcShopBuy({
        userId,
        shopId: d.shopId,
        itemId: d.itemId,
        requestId: d.requestId,
      });
      break;
    case "npc_shop_sell":
      if (!d.shopId || !d.itemId || !d.buyPrice) {
        return jsonError(
          "shopId, itemId, buyPrice required",
          400,
          "validation_failed",
          guard.requestId,
        );
      }
      result = actionNpcShopSell({
        userId,
        shopId: d.shopId,
        itemId: d.itemId,
        buyPrice: d.buyPrice,
        requestId: d.requestId,
      });
      break;
    case "travel":
      if (!d.fromRegion || !d.toRegion || !d.amount) {
        return jsonError(
          "fromRegion, toRegion, amount required",
          400,
          "validation_failed",
          guard.requestId,
        );
      }
      result = actionTravel({
        userId,
        fromRegion: d.fromRegion,
        toRegion: d.toRegion,
        amount: d.amount,
        requestId: d.requestId,
      });
      break;
    case "restore_donate":
      if (!d.milestoneKey || !d.amount) {
        return jsonError(
          "milestoneKey and amount required",
          400,
          "validation_failed",
          guard.requestId,
        );
      }
      result = actionRestoreDonate({
        userId,
        milestoneKey: d.milestoneKey,
        amount: d.amount,
        requestId: d.requestId,
      });
      break;
    case "repair":
      if (!d.targetId || !d.amount) {
        return jsonError("targetId and amount required", 400, "validation_failed", guard.requestId);
      }
      result = actionRepair({
        userId,
        targetId: d.targetId,
        amount: d.amount,
        requestId: d.requestId,
      });
      break;
    case "daily_goal":
      if (!d.goalKey) {
        return jsonError("goalKey required", 400, "validation_failed", guard.requestId);
      }
      result = actionDailyGoal({ userId, goalKey: d.goalKey });
      break;
    case "weekly_goal":
      if (!d.goalKey) {
        return jsonError("goalKey required", 400, "validation_failed", guard.requestId);
      }
      result = actionWeeklyGoal({ userId, goalKey: d.goalKey });
      break;
    default:
      return jsonError("Unknown action", 400, "validation_failed", guard.requestId);
  }

  if (result.ok) {
    await persistRecentCreditMutation(userId, d.requestId);
  }

  if (!result.ok) {
    return jsonError(result.message, 400, result.error ?? "action_failed", guard.requestId);
  }

  return jsonOk(
    {
      balance: result.balance ?? getCreditBalance(userId),
      message: result.message,
      entryId: result.entryId,
      disclaimer: CREDITS_DISCLAIMER,
    },
    guard.requestId,
  );
}
