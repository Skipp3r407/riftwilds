import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { arenaConfig, REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";
import { ARENA_AFFINITY_VERSION } from "@/game/arena/affinity-matrix";

export async function GET() {
  return NextResponse.json({
    arenaEnabled: featureFlagDefaults.ARENA_ENABLED,
    flags: {
      ARENA_ENABLED: featureFlagDefaults.ARENA_ENABLED,
      CASUAL_DUELS_ENABLED: featureFlagDefaults.CASUAL_DUELS_ENABLED,
      RANKED_DUELS_ENABLED: featureFlagDefaults.RANKED_DUELS_ENABLED,
      TOURNAMENTS_ENABLED: featureFlagDefaults.TOURNAMENTS_ENABLED,
      WEAPONS_ENABLED: featureFlagDefaults.WEAPONS_ENABLED,
      EQUIPMENT_CRAFTING_ENABLED: featureFlagDefaults.EQUIPMENT_CRAFTING_ENABLED,
      SPECTATOR_MODE_ENABLED: featureFlagDefaults.SPECTATOR_MODE_ENABLED,
      COMMUNITY_PREDICTIONS_ENABLED: featureFlagDefaults.COMMUNITY_PREDICTIONS_ENABLED,
      ARENA_POINTS_ENABLED: featureFlagDefaults.ARENA_POINTS_ENABLED,
      SPONSORED_PRIZES_ENABLED: featureFlagDefaults.SPONSORED_PRIZES_ENABLED,
      REAL_VALUE_WAGERING_ENABLED,
    },
    balanceVersion: arenaConfig.BALANCE_VERSION,
    affinityVersion: ARENA_AFFINITY_VERSION,
    disclosures: arenaConfig.DISCLOSURES,
    phase: 1,
    availableModes: ["TRAINING"],
  });
}
