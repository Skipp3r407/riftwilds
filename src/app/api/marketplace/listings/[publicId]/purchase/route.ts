import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults, isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  getMarketplaceListing,
  purchaseRuntimeListing,
} from "@/lib/marketplace/demo-listings";
import {
  assertUniqueRequestId,
  detectWashTradingRisk,
  resolveSettlementGate,
} from "@/lib/marketplace/integrity";
import { saleAllocationForPetsAndEggs, saleAllocationForItems } from "@/lib/marketplace/fee-policy";
import { serializeAllocation } from "@/lib/revenue/allocate";
import { settleMarketplaceCreditsPurchase } from "@/lib/marketplace/credits-settle";
import { getSessionContext } from "@/lib/auth/session";
import { hydrateMemoryFromPrisma, persistRecentCreditMutation } from "@/lib/credits/persist-bridge";
import { isMarketplaceFrozen } from "@/lib/economy/admin-ops";

const bodySchema = z.object({
  requestId: z.string().min(8).max(128),
  buyerWallet: z.string().optional(),
  sellerWallet: z.string().optional(),
  demoUser: z.string().min(2).max(80).optional(),
});

type Params = { params: Promise<{ publicId: string }> };

export async function POST(req: Request, { params }: Params) {
  if (isMarketplaceFrozen()) {
    return NextResponse.json({ error: "MARKETPLACE_FROZEN" }, { status: 403 });
  }
  if (
    !isFeatureEnabled("MARKETPLACE_WRITES_ENABLED") &&
    !isFeatureEnabled("MARKETPLACE_ENABLED")
  ) {
    return NextResponse.json({ error: "MARKETPLACE_WRITES_DISABLED" }, { status: 403 });
  }

  const gate = resolveSettlementGate({
    marketplaceEnabled:
      isFeatureEnabled("MARKETPLACE_ENABLED") || isFeatureEnabled("MARKETPLACE_WRITES_ENABLED"),
    realSolMarketplaceEnabled: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED,
    solPurchasesEnabled: featureFlagDefaults.SOL_PURCHASES_ENABLED,
  });

  if (gate.mode === "blocked") {
    return NextResponse.json({ error: "SETTLEMENT_BLOCKED", gate }, { status: 403 });
  }

  if (gate.mode === "sol_escrow") {
    return NextResponse.json(
      {
        error: "SOL_ESCROW_NOT_IMPLEMENTED",
        gate,
        note: "Real SOL escrow requires audited programs. Keep REAL_SOL_MARKETPLACE_ENABLED=false.",
      },
      { status: 501 },
    );
  }

  const { publicId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const unique = assertUniqueRequestId(parsed.data.requestId);
  if (!unique.ok) {
    return NextResponse.json({ error: unique.reason }, { status: 409 });
  }

  const listing = getMarketplaceListing(publicId);
  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "NOT_AVAILABLE" }, { status: 404 });
  }

  const session = await getSessionContext();
  const buyerUserId = session?.userId ?? parsed.data.demoUser ?? "demo-keeper";
  await hydrateMemoryFromPrisma(buyerUserId);

  const credits = settleMarketplaceCreditsPurchase({
    listing,
    buyerUserId,
    requestId: parsed.data.requestId,
  });
  if (!credits.ok) {
    return NextResponse.json(
      {
        error: credits.error,
        message: credits.message,
        balance: credits.balance,
      },
      { status: 400 },
    );
  }

  await persistRecentCreditMutation(buyerUserId, `${parsed.data.requestId}:buyer`);

  const wash = detectWashTradingRisk({
    buyerWallet: parsed.data.buyerWallet,
    sellerWallet: parsed.data.sellerWallet ?? listing.sellerLabel,
    priceLamports: BigInt(listing.priceLamports),
  });

  const result = purchaseRuntimeListing(publicId, parsed.data.requestId);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  const price = BigInt(listing.priceLamports);
  const allocation =
    listing.kind === "ITEM"
      ? null
      : serializeAllocation(saleAllocationForPetsAndEggs(price));
  const itemSplit = listing.kind === "ITEM" ? saleAllocationForItems(price) : null;

  return NextResponse.json({
    ok: true,
    mode: "credits",
    currency: "CREDITS",
    publicId,
    settlement: credits,
    washTrading: wash,
    allocation,
    itemSplit: itemSplit
      ? {
          seller: itemSplit.seller.toString(),
          projectReserve: itemSplit.projectReserve.toString(),
          holderRewards: itemSplit.holderRewards.toString(),
          ops: itemSplit.ops.toString(),
          communityEvents: itemSplit.communityEvents.toString(),
        }
      : null,
    note: "Credits settlement applied. No SOL transferred. SOL never required for marketplace play.",
  });
}
