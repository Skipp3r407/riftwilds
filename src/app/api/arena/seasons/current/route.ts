import { NextResponse } from "next/server";
import { arenaConfig } from "@/lib/config/arena";

export async function GET() {
  return NextResponse.json({
    season: {
      key: "season-0-training",
      name: "Training Season 0",
      isActive: true,
      balanceVersion: arenaConfig.BALANCE_VERSION,
      affinityVersion: arenaConfig.AFFINITY_VERSION,
      note: "Ranked seasons begin in Phase 3. Arena Points may reset between seasons.",
    },
  });
}
