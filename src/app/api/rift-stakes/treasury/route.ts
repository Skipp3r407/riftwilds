import { NextResponse } from "next/server";
import { isRiftStakesEnabled } from "@/game/rift-stakes/config";
import { getTreasuryPublicSnapshot } from "@/game/rift-stakes/treasury";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export async function GET() {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json({ error: "RIFT_STAKES_DISABLED" }, { status: 403 });
  }
  if (!featureFlagDefaults.RIFT_STAKES_TREASURY_UI_ENABLED) {
    return NextResponse.json({ error: "TREASURY_UI_DISABLED" }, { status: 403 });
  }
  return NextResponse.json({
    ...getTreasuryPublicSnapshot(),
    label: "Rift Stakes Fee Treasury · Transparent",
  });
}
