import { NextResponse } from "next/server";
import { STARTER_WEAPONS } from "@/game/arena/weapons";
import { arenaConfig } from "@/lib/config/arena";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export async function GET() {
  if (!featureFlagDefaults.WEAPONS_ENABLED) {
    return NextResponse.json({ error: "WEAPONS_DISABLED" }, { status: 403 });
  }
  return NextResponse.json({
    disclosure: arenaConfig.DISCLOSURES.weapons,
    weapons: STARTER_WEAPONS,
  });
}
