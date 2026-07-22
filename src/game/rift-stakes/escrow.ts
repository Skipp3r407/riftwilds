/**
 * Rift Stakes escrow state machine.
 * DEMO mode simulates deposits/payouts with identical API to future on-chain.
 * Server-authoritative — never trust client for winner/payout.
 */

import {
  DISCONNECT_RULES,
  getStakeTier,
  isRiftStakesOnChainLive,
} from "@/game/rift-stakes/config";
import { calculateFee, zeroFeeOnRefund } from "@/game/rift-stakes/fees";
import type {
  EscrowPhase,
  EscrowRecord,
  FeeBreakdown,
  StakeMatch,
  StakeMatchStatus,
  StakeTierId,
} from "@/game/rift-stakes/types";
import {
  riftStakesContract,
} from "@/game/rift-stakes/contract-interface";

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;
}

export function createEscrow(input: {
  matchId: string;
  stakeTierId: StakeTierId;
  hostOwnerKey: string;
  hostWallet: string | null;
  fee: FeeBreakdown;
}): EscrowRecord {
  const tier = getStakeTier(input.stakeTierId);
  if (!tier) throw new Error("UNKNOWN_TIER");
  const demoMode = !isRiftStakesOnChainLive();
  const t = nowIso();
  return {
    id: newId("escrow"),
    matchId: input.matchId,
    phase: "CONFIRM_STAKE",
    stakeTierId: input.stakeTierId,
    stakePerPlayerLamports: tier.stakeLamports,
    hostOwnerKey: input.hostOwnerKey,
    guestOwnerKey: null,
    hostWallet: input.hostWallet,
    guestWallet: null,
    hostDeposited: false,
    guestDeposited: false,
    fee: input.fee,
    winnerOwnerKey: null,
    demoMode,
    onChainTxIds: [],
    createdAt: t,
    updatedAt: t,
    lockedAt: null,
    settledAt: null,
  };
}

export function attachGuest(
  escrow: EscrowRecord,
  guestOwnerKey: string,
  guestWallet: string | null,
): EscrowRecord {
  if (escrow.guestOwnerKey && escrow.guestOwnerKey !== guestOwnerKey) {
    throw new Error("GUEST_ALREADY_ATTACHED");
  }
  return {
    ...escrow,
    guestOwnerKey,
    guestWallet,
    phase: "DEPOSIT_PENDING",
    updatedAt: nowIso(),
  };
}

export function recordDeposit(
  escrow: EscrowRecord,
  who: "host" | "guest",
): EscrowRecord {
  if (escrow.phase === "CANCELLED" || escrow.phase === "REFUNDED") {
    throw new Error("ESCROW_CLOSED");
  }
  let next: EscrowRecord = {
    ...escrow,
    hostDeposited: who === "host" ? true : escrow.hostDeposited,
    guestDeposited: who === "guest" ? true : escrow.guestDeposited,
    updatedAt: nowIso(),
  };

  const result = riftStakesContract.simulateDeposit({
    escrowId: escrow.id,
    amountLamports: escrow.stakePerPlayerLamports,
    demoMode: escrow.demoMode,
  });
  next = {
    ...next,
    onChainTxIds: [...next.onChainTxIds, result.txId],
    phase: "DEPOSITED",
  };

  if (next.hostDeposited && next.guestDeposited) {
    const lock = riftStakesContract.lockEscrow({
      escrowId: next.id,
      demoMode: next.demoMode,
    });
    next = {
      ...next,
      phase: "LOCKED",
      lockedAt: nowIso(),
      onChainTxIds: [...next.onChainTxIds, lock.txId],
    };
  }
  return next;
}

export function beginMatch(escrow: EscrowRecord): EscrowRecord {
  if (escrow.phase !== "LOCKED") throw new Error("ESCROW_NOT_LOCKED");
  return { ...escrow, phase: "MATCH_ACTIVE", updatedAt: nowIso() };
}

/**
 * Server-only settlement. Client-supplied winner is rejected at API layer.
 */
export function settleWinner(
  escrow: EscrowRecord,
  winnerOwnerKey: string,
): { escrow: EscrowRecord; feeCharged: boolean } {
  if (escrow.phase !== "MATCH_ACTIVE" && escrow.phase !== "VERIFYING") {
    throw new Error("ESCROW_NOT_SETTLEABLE");
  }
  if (
    winnerOwnerKey !== escrow.hostOwnerKey &&
    winnerOwnerKey !== escrow.guestOwnerKey
  ) {
    throw new Error("WINNER_NOT_PARTICIPANT");
  }

  let next: EscrowRecord = {
    ...escrow,
    phase: "VERIFYING",
    winnerOwnerKey,
    updatedAt: nowIso(),
  };

  const feeTx = riftStakesContract.transferFee({
    escrowId: next.id,
    amountLamports: next.fee.platformFeeLamports,
    demoMode: next.demoMode,
  });
  const prizeTx = riftStakesContract.transferPrize({
    escrowId: next.id,
    amountLamports: next.fee.winnerReceivesLamports,
    winnerOwnerKey,
    demoMode: next.demoMode,
  });

  next = {
    ...next,
    phase: "PAYOUT_COMPLETE",
    settledAt: nowIso(),
    onChainTxIds: [...next.onChainTxIds, feeTx.txId, prizeTx.txId],
    updatedAt: nowIso(),
  };

  return {
    escrow: next,
    feeCharged: next.fee.platformFeeLamports > 0,
  };
}

/** Cancel / disconnect refund — NO platform fee. */
export function refundEscrow(
  escrow: EscrowRecord,
  reason: string,
): EscrowRecord {
  if (
    escrow.phase === "PAYOUT_COMPLETE" ||
    escrow.phase === "REFUNDED" ||
    escrow.phase === "CANCELLED"
  ) {
    return escrow;
  }
  const refundTx = riftStakesContract.refundAll({
    escrowId: escrow.id,
    reason,
    demoMode: escrow.demoMode,
  });
  return {
    ...escrow,
    phase: "REFUNDED",
    fee: zeroFeeOnRefund(escrow.stakePerPlayerLamports),
    settledAt: nowIso(),
    updatedAt: nowIso(),
    onChainTxIds: [...escrow.onChainTxIds, refundTx.txId],
  };
}

export function matchStatusFromEscrow(phase: EscrowPhase): StakeMatchStatus {
  switch (phase) {
    case "IDLE":
    case "CONNECT_WALLET":
    case "CONFIRM_STAKE":
      return "LOBBY";
    case "DEPOSIT_PENDING":
    case "DEPOSITED":
      return "AWAITING_DEPOSITS";
    case "LOCKED":
      return "LOCKED";
    case "MATCH_ACTIVE":
      return "IN_PROGRESS";
    case "VERIFYING":
    case "PAYOUT_PENDING":
      return "VERIFYING";
    case "PAYOUT_COMPLETE":
      return "COMPLETED";
    case "REFUND_PENDING":
    case "REFUNDED":
      return "REFUNDED";
    case "CANCELLED":
      return "CANCELLED";
    case "DISPUTED":
      return "DISPUTED";
    default:
      return "LOBBY";
  }
}

export function createStakeMatch(input: {
  stakeTierId: StakeTierId;
  hostOwnerKey: string;
  hostDisplayName: string;
  fee: FeeBreakdown;
}): { match: StakeMatch; escrow: EscrowRecord } {
  const matchId = newId("smatch");
  const publicId = matchId.slice(-8).toUpperCase();
  const escrow = createEscrow({
    matchId,
    stakeTierId: input.stakeTierId,
    hostOwnerKey: input.hostOwnerKey,
    hostWallet: null,
    fee: input.fee,
  });
  const t = nowIso();
  const match: StakeMatch = {
    id: matchId,
    publicId,
    status: "LOBBY",
    stakeTierId: input.stakeTierId,
    escrowId: escrow.id,
    hostOwnerKey: input.hostOwnerKey,
    guestOwnerKey: null,
    hostDisplayName: input.hostDisplayName,
    guestDisplayName: null,
    winnerOwnerKey: null,
    feeSnapshot: input.fee,
    demoMode: escrow.demoMode,
    disconnectPolicyApplied: null,
    createdAt: t,
    updatedAt: t,
    startedAt: null,
    completedAt: null,
  };
  return { match, escrow };
}

export { DISCONNECT_RULES, calculateFee };
