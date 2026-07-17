import { NextResponse } from "next/server";
import { ECONOMY_FLYWHEEL } from "@/game/economy/flywheel";
import { economyConfig } from "@/lib/config/economy";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { createRequestId } from "@/lib/utils/request-id";

export async function GET() {
  return NextResponse.json({
    requestId: createRequestId(),
    flywheel: ECONOMY_FLYWHEEL,
    parameters: {
      marketplaceFeeBps: economyConfig.MARKETPLACE_FEE_BPS,
      treasuryFeeShareBps: economyConfig.TREASURY_FEE_SHARE_BPS,
      epochDurationHours: economyConfig.EPOCH_DURATION_HOURS,
      epochRewardSoftPerPet: economyConfig.EPOCH_REWARD_SOFT_CURRENCY_PER_PET,
      epochMaxPetsPerUser: economyConfig.EPOCH_MAX_PETS_PER_USER,
      epochRewardsEnabled: featureFlagDefaults.EPOCH_REWARDS_ENABLED,
      realMoneyRewardsEnabled: featureFlagDefaults.REAL_MONEY_REWARDS_ENABLED,
      creatorFeeNote: economyConfig.CREATOR_FEE_NOTE,
    },
    disclaimer:
      "Not a promise of profit or guaranteed rewards. Real-money epoch rewards remain disabled until audited and legally reviewed.",
  });
}
