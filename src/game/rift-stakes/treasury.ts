/**
 * Rift Stakes treasury bookkeeping — fees only from settled stakes matches.
 * On-chain: single transfer to treasury wallet.
 * Off-chain: 50/20/15/15 allocation lines for transparency.
 */

import { allocateTreasuryFee } from "@/game/rift-stakes/fees";
import {
  appendFeeHistory,
  appendTreasuryTx,
  getRiftStakesStore,
  saveRiftStakesStore,
} from "@/game/rift-stakes/store";
import type { FeeBreakdown } from "@/game/rift-stakes/types";

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

/** Record platform fee after server-authoritative win. No-op if fee is 0. */
export function recordPlatformFee(input: {
  matchId: string;
  escrowId: string;
  fee: FeeBreakdown;
  demoMode: boolean;
}): { charged: boolean; lines: ReturnType<typeof allocateTreasuryFee> } {
  const store = getRiftStakesStore();
  if (store.admin.treasuryPaused) {
    appendFeeHistory({
      id: newId("feehist"),
      matchId: input.matchId,
      feeBps: input.fee.feeBps,
      platformFeeLamports: input.fee.platformFeeLamports,
      prizePoolLamports: input.fee.prizePoolLamports,
      winnerReceivesLamports: input.fee.winnerReceivesLamports,
      charged: false,
      reason: "TREASURY_PAUSED — fee deferred/skipped for DEMO settle",
      createdAt: new Date().toISOString(),
    });
    return { charged: false, lines: [] };
  }

  if (input.fee.platformFeeLamports <= 0) {
    appendFeeHistory({
      id: newId("feehist"),
      matchId: input.matchId,
      feeBps: 0,
      platformFeeLamports: 0,
      prizePoolLamports: input.fee.prizePoolLamports,
      winnerReceivesLamports: input.fee.winnerReceivesLamports,
      charged: false,
      reason: "ZERO_FEE (promo/VIP/refund path)",
      createdAt: new Date().toISOString(),
    });
    return { charged: false, lines: [] };
  }

  appendTreasuryTx({
    id: newId("treastx"),
    kind: "PLATFORM_FEE",
    matchId: input.matchId,
    escrowId: input.escrowId,
    amountLamports: input.fee.platformFeeLamports,
    bucket: null,
    note: `Platform fee ${input.fee.feePercentDisplay} → treasury wallet`,
    demoMode: input.demoMode,
    createdAt: new Date().toISOString(),
  });

  const lines = allocateTreasuryFee(input.fee.platformFeeLamports);
  for (const line of lines) {
    appendTreasuryTx({
      id: newId("treastx"),
      kind: "ALLOCATION_BOOK",
      matchId: input.matchId,
      escrowId: input.escrowId,
      amountLamports: line.amountLamports,
      bucket: line.bucket,
      note: `Accounting ${line.bps / 100}% → ${line.bucket}`,
      demoMode: input.demoMode,
      createdAt: new Date().toISOString(),
    });
  }

  appendFeeHistory({
    id: newId("feehist"),
    matchId: input.matchId,
    feeBps: input.fee.feeBps,
    platformFeeLamports: input.fee.platformFeeLamports,
    prizePoolLamports: input.fee.prizePoolLamports,
    winnerReceivesLamports: input.fee.winnerReceivesLamports,
    charged: true,
    reason: "SETTLED_WIN",
    createdAt: new Date().toISOString(),
  });

  return { charged: true, lines };
}

/** Explicit no-fee record for cancel/refund. */
export function recordRefundNoFee(input: {
  matchId: string;
  escrowId: string;
  prizePoolLamports: number;
  reason: string;
  demoMode: boolean;
}) {
  appendTreasuryTx({
    id: newId("treastx"),
    kind: "REFUND_NOTE",
    matchId: input.matchId,
    escrowId: input.escrowId,
    amountLamports: 0,
    bucket: null,
    note: `No fee charged — ${input.reason}`,
    demoMode: input.demoMode,
    createdAt: new Date().toISOString(),
  });
  appendFeeHistory({
    id: newId("feehist"),
    matchId: input.matchId,
    feeBps: 0,
    platformFeeLamports: 0,
    prizePoolLamports: input.prizePoolLamports,
    winnerReceivesLamports: input.prizePoolLamports,
    charged: false,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  });
}

export function getTreasuryPublicSnapshot() {
  const s = getRiftStakesStore();
  const byBucket = {
    development: 0,
    tournaments: 0,
    community: 0,
    infrastructure: 0,
  };
  for (const tx of s.treasuryTx) {
    if (tx.kind === "ALLOCATION_BOOK" && tx.bucket) {
      byBucket[tx.bucket] += tx.amountLamports;
    }
  }
  return {
    treasuryWallet: s.treasuryWallet,
    collectedFeesLamports: s.collectedFeesLamports,
    allocationBps: {
      development: 50,
      tournaments: 20,
      community: 15,
      infrastructure: 15,
    },
    allocatedLamports: byBucket,
    recentTx: s.treasuryTx.slice(0, 40),
    feeHistory: s.feeHistory.slice(0, 40),
    note: "Fees only from Rift Stakes. Free modes contribute $0.",
  };
}

export function setTreasuryWallet(address: string) {
  saveRiftStakesStore((s) => {
    s.treasuryWallet = address;
  });
}
