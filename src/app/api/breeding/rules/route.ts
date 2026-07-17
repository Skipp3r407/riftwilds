import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { serializeBreedingRules } from "@/lib/economy/breeding-rules";

export async function GET() {
  return NextResponse.json({
    flags: {
      BREEDING_ENABLED: featureFlagDefaults.BREEDING_ENABLED,
      SOL_PURCHASES_ENABLED: featureFlagDefaults.SOL_PURCHASES_ENABLED,
    },
    rules: serializeBreedingRules(),
  });
}
