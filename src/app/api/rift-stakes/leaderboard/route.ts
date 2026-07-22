import { NextResponse } from "next/server";
import { isRiftStakesEnabled } from "@/game/rift-stakes/config";
import { getRiftStakesStore } from "@/game/rift-stakes/store";

export async function GET() {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  const store = getRiftStakesStore();
  return NextResponse.json({
    season: "Rift Stakes DEMO Season",
    leaderboard: store.leaderboard.slice(0, 50),
    note: "Skill + settled stakes only. Free modes have separate ladders.",
  });
}
