import { NextResponse } from "next/server";
import {
  DISCLOSURES,
  STAKE_TIERS,
  TREASURY_ALLOCATION_BPS,
  DEFAULT_FEE_BPS,
  MAX_FEE_BPS,
  formatSol,
  isRiftStakesEnabled,
  isRiftStakesOnChainLive,
} from "@/game/rift-stakes/config";
import { buildConfirmationSummary } from "@/game/rift-stakes/fees";
import { resolveEffectiveFee } from "@/game/rift-stakes/fee-resolver";
import { getAdminState } from "@/game/rift-stakes/admin";
import { stakesQueueSize } from "@/game/rift-stakes/matchmaking";
import { getRiftStakesStore } from "@/game/rift-stakes/store";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export async function GET() {
  if (!isRiftStakesEnabled()) {
    return NextResponse.json(
      {
        enabled: false,
        error: "RIFT_STAKES_DISABLED",
        note: "Set RIFT_STAKES_ENABLED=true or flip feature flag for local preview.",
      },
      { status: 403 },
    );
  }

  const admin = getAdminState();
  const demoFee = resolveEffectiveFee({
    stakePerPlayerLamports: STAKE_TIERS.find((t) => t.id === "standard")!
      .stakeLamports,
  });

  return NextResponse.json({
    enabled: true,
    demoMode: !isRiftStakesOnChainLive(),
    label: "Optional · Real SOL",
    disclosures: DISCLOSURES,
    tiers: STAKE_TIERS.map((t) => ({
      ...t,
      stakeSol: formatSol(t.stakeLamports),
      potSol: formatSol(t.stakeLamports * 2),
      preview: buildConfirmationSummary(
        resolveEffectiveFee({ stakePerPlayerLamports: t.stakeLamports }),
      ),
    })),
    fee: {
      defaultBps: DEFAULT_FEE_BPS,
      currentBps: admin.feeBps,
      maxBps: MAX_FEE_BPS,
      onlyOnRiftStakes: true,
      sampleConfirmation: buildConfirmationSummary(demoFee),
    },
    treasuryAllocationBps: TREASURY_ALLOCATION_BPS,
    admin,
    queueSize: stakesQueueSize(),
    flags: {
      RIFT_STAKES_ENABLED: featureFlagDefaults.RIFT_STAKES_ENABLED,
      RIFT_STAKES_ONCHAIN_ENABLED: featureFlagDefaults.RIFT_STAKES_ONCHAIN_ENABLED,
      RIFT_STAKES_TREASURY_UI_ENABLED:
        featureFlagDefaults.RIFT_STAKES_TREASURY_UI_ENABLED,
    },
    routes: {
      lobby: "/tcg/battle?mode=stakes",
      treasury: "/tcg/battle?mode=stakes&panel=treasury",
      history: "/tcg/battle?mode=stakes&panel=history",
      leaderboard: "/tcg/battle?mode=stakes&panel=leaderboard",
      admin: "/admin/rift-stakes",
      match: "/rift-stakes/match",
      practiceFree: "/tcg/battle?mode=practice&board=1",
      arenaFree: "/arena",
      battleHub: "/tcg/battle",
    },
    storeNote: getRiftStakesStore().matches.length
      ? `${getRiftStakesStore().matches.length} local matches`
      : "Empty local DEMO store",
  });
}
