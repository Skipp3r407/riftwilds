/**
 * Orchestrates deposit → lock → match → server settle → fee/treasury.
 * Winner is NEVER accepted from an untrusted client claim without server verify.
 */

import {
  beginMatch,
  matchStatusFromEscrow,
  recordDeposit,
  refundEscrow,
  settleWinner,
} from "@/game/rift-stakes/escrow";
import {
  getEscrow,
  getMatch,
  updateLeaderboard,
  upsertEscrow,
  upsertMatch,
} from "@/game/rift-stakes/store";
import {
  recordPlatformFee,
  recordRefundNoFee,
} from "@/game/rift-stakes/treasury";

export function depositForMatch(input: {
  matchId: string;
  ownerKey: string;
}): { ok: true; escrowPhase: string; matchStatus: string } | { ok: false; error: string } {
  const match = getMatch(input.matchId);
  if (!match?.escrowId) return { ok: false, error: "MATCH_NOT_FOUND" };
  const escrow = getEscrow(match.escrowId);
  if (!escrow) return { ok: false, error: "ESCROW_NOT_FOUND" };

  const who =
    input.ownerKey === escrow.hostOwnerKey
      ? "host"
      : input.ownerKey === escrow.guestOwnerKey
        ? "guest"
        : null;
  if (!who) return { ok: false, error: "NOT_PARTICIPANT" };

  try {
    let next = recordDeposit(escrow, who);
    let nextMatch = {
      ...match,
      status: matchStatusFromEscrow(next.phase),
      updatedAt: new Date().toISOString(),
    };
    if (next.phase === "LOCKED") {
      next = beginMatch(next);
      nextMatch = {
        ...nextMatch,
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    upsertEscrow(next);
    upsertMatch(nextMatch);
    return {
      ok: true,
      escrowPhase: next.phase,
      matchStatus: nextMatch.status,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "DEPOSIT_FAILED",
    };
  }
}

/**
 * Server-authoritative settle. `winnerOwnerKey` must come from match engine /
 * admin verify — API must not accept arbitrary client winner without checks.
 */
export function settleMatchServer(input: {
  matchId: string;
  winnerOwnerKey: string;
  hostDisplayName?: string;
  guestDisplayName?: string;
}): { ok: true; matchStatus: string } | { ok: false; error: string } {
  const match = getMatch(input.matchId);
  if (!match?.escrowId) return { ok: false, error: "MATCH_NOT_FOUND" };
  const escrow = getEscrow(match.escrowId);
  if (!escrow) return { ok: false, error: "ESCROW_NOT_FOUND" };

  try {
    const { escrow: settled, feeCharged } = settleWinner(
      escrow,
      input.winnerOwnerKey,
    );
    upsertEscrow(settled);

    if (feeCharged) {
      recordPlatformFee({
        matchId: match.id,
        escrowId: settled.id,
        fee: settled.fee,
        demoMode: settled.demoMode,
      });
    }

    const loserKey =
      input.winnerOwnerKey === match.hostOwnerKey
        ? match.guestOwnerKey
        : match.hostOwnerKey;

    updateLeaderboard({
      ownerKey: input.winnerOwnerKey,
      displayName:
        input.winnerOwnerKey === match.hostOwnerKey
          ? match.hostDisplayName
          : (match.guestDisplayName ?? "Challenger"),
      won: true,
      netDeltaLamports: settled.fee.winnerReceivesLamports - settled.fee.stakePerPlayerLamports,
      feePaidLamports: 0,
    });
    if (loserKey) {
      updateLeaderboard({
        ownerKey: loserKey,
        displayName:
          loserKey === match.hostOwnerKey
            ? match.hostDisplayName
            : (match.guestDisplayName ?? "Challenger"),
        won: false,
        netDeltaLamports: -settled.fee.stakePerPlayerLamports,
        feePaidLamports: 0,
      });
    }

    const nextMatch = {
      ...match,
      status: "COMPLETED" as const,
      winnerOwnerKey: input.winnerOwnerKey,
      feeSnapshot: settled.fee,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertMatch(nextMatch);
    return { ok: true, matchStatus: nextMatch.status };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "SETTLE_FAILED",
    };
  }
}

export function cancelOrRefundMatch(input: {
  matchId: string;
  reason: string;
}): { ok: true } | { ok: false; error: string } {
  const match = getMatch(input.matchId);
  if (!match?.escrowId) return { ok: false, error: "MATCH_NOT_FOUND" };
  const escrow = getEscrow(match.escrowId);
  if (!escrow) return { ok: false, error: "ESCROW_NOT_FOUND" };

  const refunded = refundEscrow(escrow, input.reason);
  upsertEscrow(refunded);
  recordRefundNoFee({
    matchId: match.id,
    escrowId: refunded.id,
    prizePoolLamports: escrow.fee.prizePoolLamports,
    reason: input.reason,
    demoMode: refunded.demoMode,
  });
  upsertMatch({
    ...match,
    status: "REFUNDED",
    disconnectPolicyApplied: input.reason,
    feeSnapshot: refunded.fee,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}
