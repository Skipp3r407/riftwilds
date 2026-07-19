import type { AnalyticsSnapshot, PeriodStats, TreasuryOpsState } from "./types";

function periodStats(
  state: TreasuryOpsState,
  sinceMs: number,
): PeriodStats {
  const since = Date.now() - sinceMs;
  const incoming = state.incoming.filter(
    (t) =>
      new Date(t.createdAt).getTime() >= since &&
      t.status !== "DUPLICATE" &&
      t.status !== "REJECTED",
  );
  const dists = state.distributions.filter(
    (d) =>
      new Date(d.createdAt).getTime() >= since &&
      (d.status === "COMPLETED" || d.status === "SIMULATED"),
  );
  const inflow = incoming.reduce((s, t) => s + BigInt(t.amountLamports), 0n);
  const outflow = dists.reduce((s, d) => s + BigInt(d.grossLamports), 0n);
  return {
    inflowLamports: inflow.toString(),
    outflowLamports: outflow.toString(),
    netLamports: (inflow - outflow).toString(),
    txCount: incoming.length + dists.length,
  };
}

export function computeAnalytics(state: TreasuryOpsState): AnalyticsSnapshot {
  const bySource: Record<string, string> = {};
  for (const t of state.incoming) {
    if (t.status === "DUPLICATE" || t.status === "REJECTED") continue;
    bySource[t.sourceKey] = (
      BigInt(bySource[t.sourceKey] ?? "0") + BigInt(t.amountLamports)
    ).toString();
  }

  const byWallet: Record<string, string> = {};
  for (const d of state.distributions) {
    if (d.status !== "COMPLETED" && d.status !== "SIMULATED") continue;
    for (const line of d.lines) {
      byWallet[line.walletName] = (
        BigInt(byWallet[line.walletName] ?? "0") + BigInt(line.amountLamports)
      ).toString();
    }
  }

  const daily = periodStats(state, 86_400_000);
  const weekly = periodStats(state, 7 * 86_400_000);
  const monthly = periodStats(state, 30 * 86_400_000);
  const annual = periodStats(state, 365 * 86_400_000);

  const weekIn = BigInt(weekly.inflowLamports);
  const dayIn = BigInt(daily.inflowLamports);
  const avg = weekIn / 7n;
  const growthRatePct =
    avg === 0n ? 0 : Number(((dayIn - avg) * 10000n) / avg) / 100;

  const healthScore = computeHealthScore(state, {
    periods: { daily, weekly, monthly, annual },
    bySource,
    byWallet,
    averageInflowLamports: avg.toString(),
    growthRatePct,
    distributionCount: state.distributions.length,
    expenseCount: state.distributions.filter(
      (d) => d.status === "COMPLETED" || d.status === "SIMULATED",
    ).length,
    healthScore: 0,
  });

  return {
    periods: { daily, weekly, monthly, annual },
    bySource,
    byWallet,
    averageInflowLamports: avg.toString(),
    growthRatePct,
    distributionCount: state.distributions.length,
    expenseCount: state.distributions.filter(
      (d) => d.status === "COMPLETED" || d.status === "SIMULATED",
    ).length,
    healthScore,
  };
}

/**
 * Treasury Health Score 0–100:
 * balances present, low failure rate, rules valid, not emergency-stopped, recent activity.
 */
export function computeHealthScore(
  state: TreasuryOpsState,
  analytics: AnalyticsSnapshot,
): number {
  let score = 70;
  if (state.settings.emergencyStop) score -= 40;
  else if (state.settings.paused) score -= 15;
  if (!state.settings.monitoringEnabled) score -= 5;
  if (state.failed.filter((f) => f.retryCount < 5).length > 0) score -= 10;
  if (state.approvals.some((a) => a.status === "PENDING")) score -= 5;

  const project = state.wallets.find((w) => w.role === "PROJECT_TREASURY");
  const bal = BigInt(
    state.balances.find((b) => b.walletId === project?.id && b.asset === "SOL")
      ?.balanceRaw ?? "0",
  );
  if (bal > 0n) score += 10;
  if (BigInt(analytics.periods.weekly.inflowLamports) > 0n) score += 10;
  if (state.wallets.some((w) => w.address.includes("COMING_SOON"))) score -= 5;

  return Math.max(0, Math.min(100, score));
}
