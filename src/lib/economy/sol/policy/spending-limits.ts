/**
 * Spending limit stubs — soft daily/weekly caps for optional SOL spends.
 */

export type SpendingLimitConfig = {
  dailySolLamports: bigint;
  weeklySolLamports: bigint;
  perTxSolLamports: bigint;
  requireCoolingOffAboveLamports: bigint;
};

export const DEFAULT_SPENDING_LIMITS: SpendingLimitConfig = {
  dailySolLamports: 5_000_000_000n, // 5 SOL
  weeklySolLamports: 20_000_000_000n,
  perTxSolLamports: 2_000_000_000n,
  requireCoolingOffAboveLamports: 1_000_000_000n,
};

export type SpendCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; code: string };

export function checkSpendingLimits(params: {
  amountLamports: bigint;
  spentTodayLamports: bigint;
  spentWeekLamports: bigint;
  config?: SpendingLimitConfig;
}): SpendCheckResult {
  const config = params.config ?? DEFAULT_SPENDING_LIMITS;
  if (params.amountLamports > config.perTxSolLamports) {
    return { allowed: false, code: "per_tx_limit", reason: "Exceeds per-transaction SOL limit" };
  }
  if (params.spentTodayLamports + params.amountLamports > config.dailySolLamports) {
    return { allowed: false, code: "daily_limit", reason: "Exceeds daily SOL spending limit" };
  }
  if (params.spentWeekLamports + params.amountLamports > config.weeklySolLamports) {
    return { allowed: false, code: "weekly_limit", reason: "Exceeds weekly SOL spending limit" };
  }
  return { allowed: true };
}

export function requiresCoolingOff(
  amountLamports: bigint,
  config: SpendingLimitConfig = DEFAULT_SPENDING_LIMITS,
): boolean {
  return amountLamports >= config.requireCoolingOffAboveLamports;
}
