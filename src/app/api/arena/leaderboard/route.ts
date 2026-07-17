import { NextResponse } from "next/server";
import { arenaConfig } from "@/lib/config/arena";

export async function GET() {
  return NextResponse.json({
    disclosure: arenaConfig.DISCLOSURES.noWagering,
    seasonKey: "season-0-training",
    entries: [],
    note: "Leaderboard populates when ranked seasons are enabled. Arena Points are non-transferable and have no monetary value.",
  });
}
