import { NextResponse } from "next/server";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";
import { createRequestId } from "@/lib/utils/request-id";
import { projectConfig } from "@/lib/config/project";

/**
 * Returns only verified-or-explicitly-demo treasury metrics.
 * Never invents live revenue figures.
 */
export async function GET() {
  const policy = getActiveTreasuryPolicy();
  const observedAt = new Date().toISOString();
  const keys = [
    "total_verified_creator_fee_revenue",
    "total_growth_treasury",
    "total_pet_allocations",
    "total_operations_funding",
    "total_community_event_funding",
    "total_emergency_reserves",
    "total_marketplace_fees",
    "total_pet_allocations_claimed",
    "total_unclaimed",
    "completed_epochs",
    "currently_eligible_pets",
    "reward_active_wallets",
  ] as const;

  const metrics = keys.map((key) => ({
    key,
    label: key.replace(/_/g, " "),
    amountRaw: "0",
    asset: "DEMO_CREDITS",
    verified: false,
    isDemo: true,
    source: "bootstrap-config",
    network: projectConfig.SOLANA_NETWORK,
    observedAt,
    policyVersion: policy.version,
  }));

  return NextResponse.json({
    requestId: createRequestId(),
    policyVersion: policy.version,
    policyStatus: policy.status,
    metrics,
    disclaimer:
      "Demo zeros until verified RevenueDeposit records exist. Do not treat these as live balances.",
  });
}
