/**
 * Transparent Rift Stakes fee calculator.
 * Fees ONLY apply to Rift Stakes — never Casual/Ranked/Practice.
 *
 * Rounding: integer lamports, floor on fee, remainder stays with winner.
 * Never silently shorts winner or treasury — fee + winnerReceives === prizePool.
 * Cancelled/refunded matches: callers must not charge (charged=false path).
 */

import {
  clampFeeBps,
  DEFAULT_FEE_BPS,
  ESTIMATED_NETWORK_FEE_LAMPORTS,
  MAX_FEE_BPS,
  TREASURY_ALLOCATION_BPS,
} from "@/game/rift-stakes/config";
import type {
  FeeBreakdown,
  TreasuryAllocationBps,
  TreasuryBucket,
} from "@/game/rift-stakes/types";

export type CalculateFeeInput = {
  stakePerPlayerLamports: number;
  /** Override rate; clamped to [0, MAX_FEE_BPS] */
  feeBps?: number;
  feeSource?: FeeBreakdown["feeSource"];
  promoId?: string | null;
  vipTierId?: string | null;
  estimatedNetworkFeeLamports?: number;
};

/**
 * Deterministic fee math in lamports.
 *
 * prizePool = stake * 2
 * platformFee = floor(prizePool * feeBps / 10_000)
 * winnerReceives = prizePool - platformFee
 *
 * Example: stake 0.10 SOL each → pot 0.20 SOL, 2% fee = 0.004, winner 0.196.
 */
export function calculateFee(input: CalculateFeeInput): FeeBreakdown {
  const stake = Math.max(0, Math.trunc(input.stakePerPlayerLamports));
  const feeBps = clampFeeBps(
    input.feeBps === undefined ? DEFAULT_FEE_BPS : input.feeBps,
  );
  const prizePoolLamports = stake * 2;
  const platformFeeLamports = Math.floor((prizePoolLamports * feeBps) / 10_000);
  const winnerReceivesLamports = prizePoolLamports - platformFeeLamports;

  // Invariant: no silent shorting
  if (platformFeeLamports + winnerReceivesLamports !== prizePoolLamports) {
    throw new Error("FEE_INVARIANT_BROKEN");
  }

  const percent = (feeBps / 100).toFixed(feeBps % 100 === 0 ? 0 : 2);

  return {
    feeBps,
    feePercentDisplay: `${percent}%`,
    stakePerPlayerLamports: stake,
    opponentStakeLamports: stake,
    prizePoolLamports,
    platformFeeLamports,
    winnerReceivesLamports,
    estimatedNetworkFeeLamports:
      input.estimatedNetworkFeeLamports ?? ESTIMATED_NETWORK_FEE_LAMPORTS,
    feeSource: input.feeSource ?? "default",
    promoId: input.promoId ?? null,
    vipTierId: input.vipTierId ?? null,
    feeWaived: feeBps === 0,
    roundingNote:
      "Fee floored to whole lamports; remainder stays with winner. fee + winner === pot.",
  };
}

/** Zero fee snapshot for refunds / cancels — never charge platform fee. */
export function zeroFeeOnRefund(stakePerPlayerLamports: number): FeeBreakdown {
  return calculateFee({
    stakePerPlayerLamports,
    feeBps: 0,
    feeSource: "promo",
    promoId: "refund_no_fee",
  });
}

export type AllocationLine = {
  bucket: TreasuryBucket;
  bps: number;
  amountLamports: number;
};

/**
 * Split a collected platform fee into internal accounting buckets.
 * Uses largest-remainder so sum(lines) === feeLamports exactly.
 */
export function allocateTreasuryFee(
  feeLamports: number,
  allocation: TreasuryAllocationBps = TREASURY_ALLOCATION_BPS,
): AllocationLine[] {
  const fee = Math.max(0, Math.trunc(feeLamports));
  const entries: { bucket: TreasuryBucket; bps: number }[] = [
    { bucket: "development", bps: allocation.development },
    { bucket: "tournaments", bps: allocation.tournaments },
    { bucket: "community", bps: allocation.community },
    { bucket: "infrastructure", bps: allocation.infrastructure },
  ];
  const totalBps = entries.reduce((s, e) => s + e.bps, 0);
  if (totalBps !== 10_000) {
    throw new Error(`TREASURY_ALLOCATION_BPS_MUST_SUM_10000 (got ${totalBps})`);
  }

  const raw = entries.map((e) => {
    const exact = (fee * e.bps) / 10_000;
    const base = Math.floor(exact);
    return { ...e, amountLamports: base, frac: exact - base };
  });
  let remainder = fee - raw.reduce((s, r) => s + r.amountLamports, 0);
  raw
    .slice()
    .sort((a, b) => b.frac - a.frac)
    .forEach((r) => {
      if (remainder <= 0) return;
      const target = raw.find((x) => x.bucket === r.bucket)!;
      target.amountLamports += 1;
      remainder -= 1;
    });

  const lines = raw.map(({ bucket, bps, amountLamports }) => ({
    bucket,
    bps,
    amountLamports,
  }));
  const sum = lines.reduce((s, l) => s + l.amountLamports, 0);
  if (sum !== fee) throw new Error("ALLOCATION_INVARIANT_BROKEN");
  return lines;
}

export function assertFeeWithinHardMax(feeBps: number): void {
  if (feeBps > MAX_FEE_BPS) {
    throw new Error(`FEE_EXCEEDS_HARD_MAX_${MAX_FEE_BPS}`);
  }
}

/** Confirmation dialog payload — every number visible before Confirm. */
export function buildConfirmationSummary(fee: FeeBreakdown) {
  return {
    yourEntryLamports: fee.stakePerPlayerLamports,
    opponentEntryLamports: fee.opponentStakeLamports,
    prizePoolLamports: fee.prizePoolLamports,
    platformFeePercent: fee.feePercentDisplay,
    platformFeeBps: fee.feeBps,
    platformFeeLamports: fee.platformFeeLamports,
    estimatedNetworkFeeLamports: fee.estimatedNetworkFeeLamports,
    winnerReceivesLamports: fee.winnerReceivesLamports,
    feeWaived: fee.feeWaived,
    feeSource: fee.feeSource,
    label: "Optional · Real SOL",
  };
}
