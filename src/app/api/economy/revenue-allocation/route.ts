import { NextResponse } from "next/server";
import {
  listPolicies,
  getActivePolicy,
  TREASURY_VAULTS,
  PAYMENT_SPLIT_STRATEGY,
  bpsToPercentLabel,
} from "@/lib/revenue/policies";
import { allocateForTransactionType, serializeAllocation } from "@/lib/revenue/allocate";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { solToLamports } from "@/lib/items/lamports";
import type { RevenueTransactionType } from "@/lib/revenue/types";

export async function GET(req: Request) {
  if (!featureFlagDefaults.REVENUE_ALLOCATION_ENABLED) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "SHOP_PURCHASE") as RevenueTransactionType;
  const exampleSol = searchParams.get("exampleSol") ?? "1";

  const policy = getActivePolicy(type);
  const example = serializeAllocation(
    allocateForTransactionType(solToLamports(exampleSol), type),
  );

  return NextResponse.json({
    strategy: PAYMENT_SPLIT_STRATEGY,
    disclosures: revenueDisclosures,
    vaults: TREASURY_VAULTS,
    flags: {
      SHOP_REVENUE_SPLIT_ENABLED: featureFlagDefaults.SHOP_REVENUE_SPLIT_ENABLED,
      MARKETPLACE_REVENUE_SPLIT_ENABLED: featureFlagDefaults.MARKETPLACE_REVENUE_SPLIT_ENABLED,
      REWARD_CLAIMS_ENABLED: featureFlagDefaults.REWARD_CLAIMS_ENABLED,
      AUTOMATIC_SETTLEMENT_ENABLED: featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED,
      EGG_HOLDER_REWARDS_ENABLED: featureFlagDefaults.EGG_HOLDER_REWARDS_ENABLED,
    },
    activePolicy: {
      ...policy,
      entries: policy.entries.map((e) => ({
        ...e,
        percentLabel: bpsToPercentLabel(e.basisPoints),
      })),
    },
    exampleAllocation: example,
    policies: listPolicies().map((p) => ({
      id: p.id,
      name: p.name,
      transactionType: p.transactionType,
      version: p.version,
      status: p.status,
      effectiveFrom: p.effectiveFrom,
      entries: p.entries.map((e) => ({
        destination: e.destination,
        basisPoints: e.basisPoints,
        percentLabel: bpsToPercentLabel(e.basisPoints),
        label: e.label,
      })),
    })),
  });
}
