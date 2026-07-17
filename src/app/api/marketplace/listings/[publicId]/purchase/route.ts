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

const bodySchema = z.object({
  requestId: z.string().min(8).max(128),
  buyerWallet: z.string().optional(),
  sellerWallet: z.string().optional(),
});

type Params = { params: Promise<{ publicId: string }> };

export async function POST(req: Request, { params }: Params) {
  if (
    !isFeatureEnabled("MARKETPLACE_WRITES_ENABLED") &&
    !isFeatureEnabled("MARKETPLACE_ENABLED")
  ) {
    return NextResponse.json({ error: "MARKETPLACE_WRITES_DISABLED" }, { status: 403 });
  }

  const gate = resolveSettlementGate({
    marketplaceEnabled:
      featureFlagDefaults.MARKETPLACE_ENABLED || featureFlagDefaults.MARKETPLACE_WRITES_ENABLED,
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
    mode: result.mode,
    publicId,
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
    note: "Demo-credit purchase stub. No SOL transferred.",
  });
}
