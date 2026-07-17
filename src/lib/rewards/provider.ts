import { isFeatureEnabled } from "@/lib/config/feature-flags";
import type { EpochPayoutLine, EpochPayoutResult } from "@/game/economy/epoch-rewards";

export type RewardCommitResult = {
  requestId: string;
  committed: number;
  rejected: { petId: string; reason: string }[];
};

/**
 * Pluggable reward settlement.
 * Default: soft-currency / demo only. Real-money provider is a no-op until enabled + audited.
 */
export interface RewardProvider {
  readonly id: string;
  commitEpochPayouts(result: EpochPayoutResult, requestId: string): Promise<RewardCommitResult>;
}

export const softCurrencyRewardProvider: RewardProvider = {
  id: "soft-currency",
  async commitEpochPayouts(result, requestId) {
    if (!isFeatureEnabled("EPOCH_REWARDS_ENABLED")) {
      return {
        requestId,
        committed: 0,
        rejected: result.lines.map((l) => ({ petId: l.petId, reason: "epoch_rewards_disabled" })),
      };
    }
    // Persistence is wired in Phase 3+ via RewardLedger + CurrencyLedger transactions.
    return {
      requestId,
      committed: result.lines.filter((l) => l.softCurrency > 0).length,
      rejected: [],
    };
  },
};

export const realMoneyRewardProvider: RewardProvider = {
  id: "real-money",
  async commitEpochPayouts(result, requestId) {
    if (!isFeatureEnabled("REAL_MONEY_REWARDS_ENABLED")) {
      return {
        requestId,
        committed: 0,
        rejected: result.lines.map((l: EpochPayoutLine) => ({
          petId: l.petId,
          reason: "real_money_rewards_disabled",
        })),
      };
    }
    // Intentionally unimplemented until legal/audit/treasury gates pass.
    return {
      requestId,
      committed: 0,
      rejected: result.lines.map((l) => ({ petId: l.petId, reason: "real_money_provider_not_configured" })),
    };
  },
};

export function getActiveRewardProvider(): RewardProvider {
  if (isFeatureEnabled("REAL_MONEY_REWARDS_ENABLED")) {
    return realMoneyRewardProvider;
  }
  return softCurrencyRewardProvider;
}
