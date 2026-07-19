import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getRiftArenaAdminConfig } from "@/game/rift-arena/admin-config";
import { listArenaCalendar } from "@/game/rift-arena/calendar";
import { riftArenaConfig } from "@/game/rift-arena/config";
import { listStakeTiersDoc } from "@/game/rift-arena/escrow-scaffold";
import { freeQueueSize } from "@/game/rift-arena/free-queue";
import { demoHistoryIfEmpty } from "@/game/rift-arena/history";
import {
  currentSeason,
  hallOfChampions,
  listLadder,
} from "@/game/rift-arena/ladder";
import { RIFT_ARENA_MATCH_TYPE_META } from "@/game/rift-arena/types";
import {
  attachTcgGuestCookie,
  resolveTcgOwnerKey,
} from "@/game/tcg/owner-key";

export async function GET() {
  if (!featureFlagDefaults.RIFT_ARENA_HUB_ENABLED) {
    return NextResponse.json({ error: "RIFT_ARENA_DISABLED" }, { status: 403 });
  }

  const { key, guestToken } = await resolveTcgOwnerKey();
  const res = NextResponse.json({
    disclosures: riftArenaConfig.DISCLOSURES,
    matchTypes: RIFT_ARENA_MATCH_TYPE_META,
    season: currentSeason(),
    ladder: listLadder(12),
    champions: hallOfChampions(),
    calendar: listArenaCalendar(),
    history: demoHistoryIfEmpty(key),
    flags: {
      hub: featureFlagDefaults.RIFT_ARENA_HUB_ENABLED,
      freeMatchmaking: featureFlagDefaults.RIFT_ARENA_FREE_MATCHMAKING_ENABLED,
      rankedScaffold: featureFlagDefaults.RIFT_ARENA_RANKED_SCAFFOLD_ENABLED,
      solStakes: featureFlagDefaults.RIFT_ARENA_SOL_STAKES_ENABLED,
      solEscrow: featureFlagDefaults.RIFT_ARENA_SOL_ESCROW_ENABLED,
    },
    admin: getRiftArenaAdminConfig(),
    queueSize: freeQueueSize(),
    stakeTiersDoc: listStakeTiersDoc(),
    note: "Default experience is free play. SOL Arena stays OFF.",
  });
  return attachTcgGuestCookie(res, guestToken);
}
