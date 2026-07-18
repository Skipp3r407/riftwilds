/**
 * Server Credits shop checkout — play path. SOL never required.
 */

import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { getSessionContext } from "@/lib/auth/session";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { getCatalogItem } from "@/lib/items/catalog";
import { getItemPriceLamports } from "@/lib/items/pricing";
import { lamportsToCreditsPrice } from "@/lib/economy/core/credits-pricing";
import { resolveShopPurchase } from "@/lib/shop/purchase";
import {
  hydrateMemoryFromPrisma,
  persistRecentCreditMutation,
} from "@/lib/credits/persist-bridge";
import { getCreditBalance } from "@/lib/credits/ledger";
import { grantOwnedItem } from "@/lib/equipment/inventory-store";
import { resolveOwnerKey } from "@/lib/auth/owner-key";
import { isShopFrozen } from "@/lib/economy/admin-ops";

const bodySchema = z.object({
  itemId: z.string().min(1).max(120),
  requestId: z.string().min(8).max(200),
  demoUser: z.string().min(2).max(80).optional(),
  method: z.enum(["CREDITS"]).default("CREDITS"),
});

export async function POST(request: Request) {
  if (isShopFrozen()) {
    return jsonError("Shop frozen by admin", 403, "shop_frozen");
  }
  if (!isFeatureEnabled("SHOP_CREDITS_CHECKOUT_ENABLED") || !isFeatureEnabled("MASTER_ECONOMY_CORE_ENABLED")) {
    return jsonError("Shop Credits checkout disabled", 503, "feature_disabled");
  }

  const guard = await withApiGuard({
    bucket: "shop-purchase",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "shop_credits_purchase",
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

  const item = getCatalogItem(parsed.data.itemId);
  if (!item) {
    return jsonError("Unknown item", 404, "not_found", guard.requestId);
  }

  const priceLamports = getItemPriceLamports(item.id, item.rarity);
  const priceCredits = lamportsToCreditsPrice(priceLamports);

  await hydrateMemoryFromPrisma(userId);

  const result = resolveShopPurchase({
    method: "CREDITS",
    priceLamports,
    earnedLamports: 0n,
    wallet: {
      walletConnected: false,
      walletBalanceLamports: null,
      solItemPurchasesEnabled: false,
      solPurchasesEnabled: false,
    },
    creditsBalance: getCreditBalance(userId),
    priceCredits,
    userId,
    requestId: parsed.data.requestId,
    itemId: item.id,
    settleCredits: true,
  });

  if (!result.ok) {
    return jsonError(result.reason, 400, "purchase_failed", guard.requestId);
  }

  await persistRecentCreditMutation(userId, parsed.data.requestId);
  const { ownerKey } = await resolveOwnerKey();
  grantOwnedItem(ownerKey, item.id, 1);

  return jsonOk(
    {
      ok: true,
      method: "CREDITS",
      itemId: item.id,
      priceCredits,
      balance: result.nextCreditsBalance ?? getCreditBalance(userId),
      disclaimer: "Credits are play currency. Not SOL. Not a token claim.",
    },
    guard.requestId,
  );
}
