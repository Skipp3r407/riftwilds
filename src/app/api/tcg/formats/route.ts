import { NextResponse } from "next/server";
import { TCG_FORMATS, TCG_LIVE_OPS, TCG_EXPANSIONS } from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export async function GET() {
  if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return NextResponse.json({ error: "TCG_DISABLED" }, { status: 403 });
  }
  return NextResponse.json({
    formats: TCG_FORMATS,
    constructedRules: CONSTRUCTED_RULES,
    expansions: TCG_EXPANSIONS,
    liveOps: TCG_LIVE_OPS,
    f2pCompetitive: true,
    cryptoRequired: false,
  });
}
