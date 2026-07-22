/**
 * Smart-contract / escrow interface for Rift Stakes.
 * DEMO implementations mirror the future on-chain API surface.
 * Real program IDL lives in contracts/rift-stakes/ when deployed.
 */

import { clampFeeBps, MAX_FEE_BPS } from "@/game/rift-stakes/config";
import { calculateFee } from "@/game/rift-stakes/fees";

export type ContractTxResult = {
  ok: true;
  txId: string;
  demoMode: boolean;
  note: string;
};

function demoTx(kind: string, demoMode: boolean): ContractTxResult {
  const id = `demo_${kind}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
  return {
    ok: true,
    txId: id,
    demoMode,
    note: demoMode
      ? "DEMO — no chain broadcast. Identical API for mainnet swap-in."
      : "On-chain path reserved — wire Anchor program here.",
  };
}

/**
 * Program interface ready for Anchor/Solana deploy.
 * CalculateFee / TransferFee / TransferPrize are first-class.
 */
export const riftStakesContract = {
  /** Hard-max fee enforced in program config + server. */
  maxFeeBps: MAX_FEE_BPS,

  calculateFee(input: {
    stakePerPlayerLamports: number;
    feeBps: number;
  }) {
    const feeBps = clampFeeBps(input.feeBps);
    return calculateFee({
      stakePerPlayerLamports: input.stakePerPlayerLamports,
      feeBps,
      feeSource: "default",
    });
  },

  simulateDeposit(input: {
    escrowId: string;
    amountLamports: number;
    demoMode: boolean;
  }): ContractTxResult {
    void input.escrowId;
    void input.amountLamports;
    return demoTx("deposit", input.demoMode);
  },

  lockEscrow(input: {
    escrowId: string;
    demoMode: boolean;
  }): ContractTxResult {
    void input.escrowId;
    return demoTx("lock", input.demoMode);
  },

  transferFee(input: {
    escrowId: string;
    amountLamports: number;
    demoMode: boolean;
  }): ContractTxResult {
    void input.escrowId;
    void input.amountLamports;
    return demoTx("transfer_fee", input.demoMode);
  },

  transferPrize(input: {
    escrowId: string;
    amountLamports: number;
    winnerOwnerKey: string;
    demoMode: boolean;
  }): ContractTxResult {
    void input.escrowId;
    void input.amountLamports;
    void input.winnerOwnerKey;
    return demoTx("transfer_prize", input.demoMode);
  },

  refundAll(input: {
    escrowId: string;
    reason: string;
    demoMode: boolean;
  }): ContractTxResult {
    void input.escrowId;
    void input.reason;
    return demoTx("refund", input.demoMode);
  },
} as const;

export type RiftStakesContract = typeof riftStakesContract;
