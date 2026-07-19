import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  currentSeason,
  hallOfChampions,
  listLadder,
} from "@/game/rift-arena/ladder";

export async function GET() {
  if (!featureFlagDefaults.RIFT_ARENA_HUB_ENABLED) {
    return NextResponse.json({ error: "RIFT_ARENA_DISABLED" }, { status: 403 });
  }
  return NextResponse.json({
    season: currentSeason(),
    ladder: listLadder(50),
    champions: hallOfChampions(),
    scaffold: !featureFlagDefaults.RANKED_DUELS_ENABLED,
    note: "Local demo ratings — not production Glicko. No SOL.",
  });
}
