import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createRequestId } from "@/lib/utils/request-id";
import { projectConfig, economyDefaults } from "@/lib/config/project";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { economyConfig } from "@/lib/config/economy";
import { DEFAULT_ODDS } from "@/game/economy/hatch-odds";
import { ECONOMY_FLYWHEEL } from "@/game/economy/flywheel";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";

export async function GET() {
  const requestId = createRequestId();

  let metrics = {
    eggsCreated: 0,
    eggsHatched: 0,
    livingCreatures: 0,
    dormantCreatures: 0,
    memorializedCreatures: 0,
    marketplaceListings: 0,
    activePlayers: 0,
    speciesCount: 0,
  };

  try {
    const [
      eggsCreated,
      eggsHatched,
      livingCreatures,
      dormantCreatures,
      memorializedCreatures,
      marketplaceListings,
      activePlayers,
      speciesCount,
      odds,
      season,
    ] = await Promise.all([
      prisma.egg.count(),
      prisma.egg.count({ where: { status: "HATCHED" } }),
      prisma.creature.count({
        where: { lifecycle: { notIn: ["MEMORIALIZED", "RETIRED", "DORMANT"] } },
      }),
      prisma.creature.count({ where: { lifecycle: "DORMANT" } }),
      prisma.creature.count({ where: { lifecycle: "MEMORIALIZED" } }),
      prisma.marketplaceListing.count({ where: { status: "ACTIVE" } }),
      prisma.playerProfile.count({
        where: { lastActiveAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      prisma.creatureSpecies.count({ where: { isActive: true } }),
      prisma.oddsVersion.findFirst({ where: { active: true } }),
      prisma.season.findFirst({ where: { active: true } }),
    ]);

    metrics = {
      eggsCreated,
      eggsHatched,
      livingCreatures,
      dormantCreatures,
      memorializedCreatures,
      marketplaceListings,
      activePlayers,
      speciesCount,
    };

    return NextResponse.json({
      requestId,
      refreshedAt: new Date().toISOString(),
      project: {
        name: projectConfig.PROJECT_NAME,
        version: projectConfig.GAME_VERSION,
        network: projectConfig.SOLANA_NETWORK,
        tokenMint: projectConfig.TOKEN_MINT_ADDRESS,
        treasuryWallet: projectConfig.TREASURY_WALLET,
      },
      metrics,
      odds: odds?.odds ?? DEFAULT_ODDS,
      oddsVersion: odds?.version ?? 1,
      season: season?.name ?? "Season 1 — Rift Awakening (Demo)",
      economy: {
        marketplaceFeeBps: economyDefaults.MARKETPLACE_FEE_BPS,
        treasuryFeeShareBps: economyConfig.TREASURY_FEE_SHARE_BPS,
        demoCreditsEnabled: economyDefaults.DEMO_CREDITS_ENABLED,
        epochRewardsEnabled: featureFlagDefaults.EPOCH_REWARDS_ENABLED,
        realMoneyRewardsEnabled: featureFlagDefaults.REAL_MONEY_REWARDS_ENABLED,
        realSolMarketplaceEnabled: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED,
        permanentDeathEnabled: featureFlagDefaults.PERMANENT_DEATH_ENABLED,
        randomnessMethod: "SERVER_CSPRNG (centralized game randomness)",
        auditStatus: "Not audited",
        smartContractStatus: "No game escrow program deployed",
        flywheelStages: ECONOMY_FLYWHEEL.map((s) => s.id),
        policyVersion: getActiveTreasuryPolicy().version,
        policyStatus: getActiveTreasuryPolicy().status,
      },
      treasury: {
        metrics: [
          "total_verified_creator_fee_revenue",
          "total_growth_treasury",
          "total_pet_allocations",
          "total_operations_funding",
          "total_community_event_funding",
          "total_emergency_reserves",
          "total_marketplace_fees",
          "total_pet_allocations_claimed",
          "total_unclaimed",
          "completed_epochs",
          "currently_eligible_pets",
          "reward_active_wallets",
        ].map((key) => ({
          key,
          label: key.replace(/_/g, " "),
          amountRaw: "0",
          asset: "DEMO_CREDITS",
          verified: false,
          isDemo: true,
          source: "bootstrap-config",
          network: projectConfig.SOLANA_NETWORK,
          observedAt: new Date().toISOString(),
        })),
      },
      featureFlags: featureFlagDefaults,
    });
  } catch {
    // DB may be unavailable during local bootstrap — return config-backed demo metrics.
    return NextResponse.json({
      requestId,
      refreshedAt: new Date().toISOString(),
      demoFallback: true,
      project: {
        name: projectConfig.PROJECT_NAME,
        version: projectConfig.GAME_VERSION,
        network: projectConfig.SOLANA_NETWORK,
        tokenMint: projectConfig.TOKEN_MINT_ADDRESS,
        treasuryWallet: projectConfig.TREASURY_WALLET,
      },
      metrics,
      odds: DEFAULT_ODDS,
      oddsVersion: 1,
      season: "Season 1 — Rift Awakening (Demo)",
      economy: {
        marketplaceFeeBps: economyDefaults.MARKETPLACE_FEE_BPS,
        treasuryFeeShareBps: economyConfig.TREASURY_FEE_SHARE_BPS,
        demoCreditsEnabled: true,
        epochRewardsEnabled: false,
        realMoneyRewardsEnabled: false,
        realSolMarketplaceEnabled: false,
        permanentDeathEnabled: false,
        randomnessMethod: "SERVER_CSPRNG (centralized game randomness)",
        auditStatus: "Not audited",
        smartContractStatus: "No game escrow program deployed",
        flywheelStages: ECONOMY_FLYWHEEL.map((s) => s.id),
      },
      featureFlags: featureFlagDefaults,
    });
  }
}
