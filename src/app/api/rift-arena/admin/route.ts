import { NextResponse } from "next/server";
import { z } from "zod";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  getRiftArenaAdminConfig,
  updateRiftArenaAdminConfig,
} from "@/game/rift-arena/admin-config";

const patchSchema = z.object({
  matchmakingPaused: z.boolean().optional(),
  rankedPaused: z.boolean().optional(),
  solArenaPaused: z.boolean().optional(),
  dailyEntrySoftCap: z.number().int().min(1).max(500).optional(),
  pauseReason: z.string().max(200).nullable().optional(),
});

export async function GET() {
  return NextResponse.json({
    config: getRiftArenaAdminConfig(),
    flags: {
      RIFT_ARENA_SOL_STAKES_ENABLED: featureFlagDefaults.RIFT_ARENA_SOL_STAKES_ENABLED,
      RIFT_ARENA_SOL_ESCROW_ENABLED: featureFlagDefaults.RIFT_ARENA_SOL_ESCROW_ENABLED,
      SOL_WALLET_ENABLED: featureFlagDefaults.SOL_WALLET_ENABLED,
    },
    note: "Local admin hooks — audit/role gates land with Neon admin auth.",
  });
}

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  // Keep SOL arena paused unless someone explicitly unpauses — still cannot go live
  // without feature flags + REAL_VALUE_WAGERING.
  const config = updateRiftArenaAdminConfig(parsed.data);
  return NextResponse.json({ config, ok: true });
}
