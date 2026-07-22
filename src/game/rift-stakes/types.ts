/**
 * Rift Stakes — optional SOL wager PvP types.
 * Never used by Casual / Ranked / Training / Practice queues.
 */

export const RIFT_STAKES_MODE = "RIFT_STAKES" as const;

export type EscrowPhase =
  | "IDLE"
  | "CONNECT_WALLET"
  | "CONFIRM_STAKE"
  | "DEPOSIT_PENDING"
  | "DEPOSITED"
  | "LOCKED"
  | "MATCH_ACTIVE"
  | "VERIFYING"
  | "PAYOUT_PENDING"
  | "PAYOUT_COMPLETE"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "CANCELLED"
  | "DISPUTED";

export type StakeMatchStatus =
  | "LOBBY"
  | "QUEUED"
  | "AWAITING_DEPOSITS"
  | "LOCKED"
  | "IN_PROGRESS"
  | "VERIFYING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "DISPUTED";

export type StakeTierId = "micro" | "low" | "standard" | "high";

export type StakeTier = {
  id: StakeTierId;
  label: string;
  /** Lamports each player deposits */
  stakeLamports: number;
  description: string;
};

export type FeeBreakdown = {
  /** Fee rate in basis points (100 = 1%) */
  feeBps: number;
  feePercentDisplay: string;
  stakePerPlayerLamports: number;
  opponentStakeLamports: number;
  prizePoolLamports: number;
  platformFeeLamports: number;
  /** Winner net after platform fee (before network fees) */
  winnerReceivesLamports: number;
  /** Display-only estimate; not deducted from escrow pot */
  estimatedNetworkFeeLamports: number;
  /** Fee source: default | vip | promo | admin */
  feeSource: "default" | "vip" | "promo" | "admin";
  promoId: string | null;
  vipTierId: string | null;
  /** True when fee is 0 (promo / VIP) */
  feeWaived: boolean;
  roundingNote: string;
};

export type TreasuryAllocationBps = {
  development: number;
  tournaments: number;
  community: number;
  infrastructure: number;
};

export type EscrowRecord = {
  id: string;
  matchId: string;
  phase: EscrowPhase;
  stakeTierId: StakeTierId;
  stakePerPlayerLamports: number;
  hostOwnerKey: string;
  guestOwnerKey: string | null;
  hostWallet: string | null;
  guestWallet: string | null;
  hostDeposited: boolean;
  guestDeposited: boolean;
  fee: FeeBreakdown;
  winnerOwnerKey: string | null;
  demoMode: boolean;
  onChainTxIds: string[];
  createdAt: string;
  updatedAt: string;
  lockedAt: string | null;
  settledAt: string | null;
};

export type StakeMatch = {
  id: string;
  publicId: string;
  status: StakeMatchStatus;
  stakeTierId: StakeTierId;
  escrowId: string | null;
  hostOwnerKey: string;
  guestOwnerKey: string | null;
  hostDisplayName: string;
  guestDisplayName: string | null;
  winnerOwnerKey: string | null;
  feeSnapshot: FeeBreakdown | null;
  demoMode: boolean;
  disconnectPolicyApplied: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};

export type TreasuryBucket =
  | "development"
  | "tournaments"
  | "community"
  | "infrastructure";

export type TreasuryTransactionKind =
  | "PLATFORM_FEE"
  | "ALLOCATION_BOOK"
  | "REFUND_NOTE"
  | "PROMO_WAIVER"
  | "ADJUSTMENT";

export type RiftStakesTreasuryTx = {
  id: string;
  kind: TreasuryTransactionKind;
  matchId: string | null;
  escrowId: string | null;
  amountLamports: number;
  bucket: TreasuryBucket | null;
  note: string;
  demoMode: boolean;
  createdAt: string;
};

export type FeeHistoryEntry = {
  id: string;
  matchId: string;
  feeBps: number;
  platformFeeLamports: number;
  prizePoolLamports: number;
  winnerReceivesLamports: number;
  charged: boolean;
  reason: string;
  createdAt: string;
};

export type PromoFeeEvent = {
  id: string;
  name: string;
  feeBps: number;
  active: boolean;
  startsAt: string;
  endsAt: string;
  note: string;
};

export type VipFeeTier = {
  id: string;
  label: string;
  feeBps: number;
  minMatches: number;
  note: string;
};

export type RiftStakesAdminState = {
  stakesPaused: boolean;
  treasuryPaused: boolean;
  matchmakingPaused: boolean;
  feeBps: number;
  pauseReason: string | null;
  updatedAt: string;
};

export type StakeQueueEntry = {
  ownerKey: string;
  displayName: string;
  wallet: string | null;
  stakeTierId: StakeTierId;
  vipTierId: string | null;
  joinedAt: string;
};
