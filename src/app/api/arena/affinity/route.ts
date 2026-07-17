import { NextResponse } from "next/server";
import {
  ARENA_AFFINITY_VERSION,
  ARENA_MATCHUP_MOD,
  getPublicAffinityChart,
} from "@/game/arena/affinity-matrix";

export async function GET() {
  return NextResponse.json({
    version: ARENA_AFFINITY_VERSION,
    modifiers: ARENA_MATCHUP_MOD,
    chart: getPublicAffinityChart(),
  });
}
