import { NextResponse } from "next/server";
import { getDemoSupplyStats } from "@/lib/marketplace/demo-listings";
import { EGG_SUPPLY_GLOBAL } from "@/lib/economy/egg-supply";

export async function GET() {
  return NextResponse.json({
    global: EGG_SUPPLY_GLOBAL,
    sources: getDemoSupplyStats(),
    notes: [
      "Starter eggs are account-bound and never sellable.",
      "Weekly official release stays within the configured 25–100 band.",
      "Slow release is enabled — the full pool is not dumped at once.",
      "Counters shown here are demo stats until EggSupplyCounter is wired to live minting.",
    ],
  });
}
