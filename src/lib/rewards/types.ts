/**
 * Community Reward Treasury (Pet Reward system) — server-authored types.
 * Browser clients display these values; they never compute allocation shares.
 *
 * Funding comes from verified project-controlled deposits only
 * (game revenue, marketplace fees, optional creator allocations).
 * Buying the Pump.fun coin does NOT automatically generate SOL for pet owners.
 */

import type { RevenueTransactionType } from "@/lib/revenue/types";

export type FundingSourceKind =
  | "SHOP_PURCHASE"
  | "MARKETPLACE_SALE"
  | "CRAFTING_FEE"
  | "UPGRADE_FEE"
  | "LISTING_FEE"
  | "TOKEN_FEE"
  | "GAME_PURCHASE"
  | "GAME_REVENUE"
  | "CREATOR_ALLOCATION"
  | "VERIFIED_INJECTOR";

export type InactiveReasonCode =
  | "listed"
  | "transferred"
  | "cooldown"
  | "min_token"
  | "sleeping"
  | "sick"
  | "deceased"
  | "not_selected"
  | "slots_exceeded"
  | "wallet_blocked"
  | "no_living_pet"
  | "rewards_disabled"
  | "care_too_low";

export type PetRewardStatus = "active" | "inactive";

export type VaultRealtimeEventType =
  | "rewardPoolUpdated"
  | "rewardEstimateUpdated"
  | "claimCompleted"
  | "newFundingTransaction"
  | "epochClosed"
  | "petEligibilityChanged";

export type VerifiedFundingRecord = {
  id: string;
  requestId: string;
  createdAt: string;
  amountLamports: string;
  source: FundingSourceKind;
  transactionType: RevenueTransactionType | "OTHER";
  txSignature: string | null;
  network: string;
  explorerUrl: string | null;
  epochKey: string;
  verified: true;
  note?: string;
};

export type WalletClaimBalance = {
  walletKey: string;
  claimableLamports: string;
  lifetimeClaimedLamports: string;
};

export type EligiblePetWeight = {
  publicPetId: string;
  walletKey: string;
  weight: number;
  status: PetRewardStatus;
  inactiveReasons: InactiveReasonCode[];
  inactiveReasonLabels: string[];
};

export type RewardEpochState = {
  key: string;
  epochNumber: number;
  status: "OPEN" | "FINALIZED" | "CLAIMABLE" | "CLOSED";
  startsAt: string;
  endsAt: string;
  nextSnapshotAt: string;
  /** Unfinalized pool funded by verified deposits this epoch. */
  poolLamports: string;
  totalEligibleWeight: number;
  eligiblePetCount: number;
  rewardRateLabel: string;
};

export type DailyRewardPoint = {
  day: string;
  estimatedLamports: string;
  claimableLamports: string;
  depositsLamports: string;
};

export type CommunityActivitySnapshot = {
  newHolders: number | null;
  marketplaceTrades: number;
  eggsHatched: number;
  petsEvolved: number;
  /** Honest label when holder metrics are not yet wired. */
  holdersLabel: string;
};

export type PetRewardVaultView = {
  publicPetId: string;
  petName: string;
  status: PetRewardStatus;
  inactiveReasons: InactiveReasonCode[];
  inactiveReasonLabels: string[];
  currentEpoch: RewardEpochState;
  currentRewardRate: string;
  /** Wallet share of current unfinalized treasury epoch pool — estimate only. */
  estimatedPendingLamports: string;
  estimatedPendingSol: string;
  /** Finalized, unclaimed — never mixed with estimated. */
  claimableLamports: string;
  claimableSol: string;
  lifetimeEarnedLamports: string;
  lifetimeEarnedSol: string;
  eligibleWeight: number;
  currentRewardPoolLamports: string;
  currentRewardPoolSol: string;
  walletSharePercent: number;
  nextSnapshotAt: string;
  nextSnapshotSeconds: number;
  /** Alias for UI: next community reward distribution. */
  nextDistributionAt: string;
  nextDistributionSeconds: number;
  communityActivity: CommunityActivitySnapshot;
  claimsEnabled: boolean;
  chainSettlementEnabled: boolean;
  isOwner: boolean;
  /** Wallet estimates only for authenticated owners. */
  walletEstimatesVisible: boolean;
  explorerVaultUrl: string | null;
  recentFunding: VerifiedFundingRecord[];
  analytics: {
    petRank: number | null;
    totalEligiblePets: number;
    walletSharePercent: number;
    epochNumber: number;
    vaultBalanceLamports: string;
    vaultBalanceSol: string;
    todayDepositsLamports: string;
    todayDepositsSol: string;
    avgRewardPerEligiblePetLamports: string;
    avgRewardPerEligiblePetSol: string;
    history: {
      today: DailyRewardPoint;
      yesterday: DailyRewardPoint;
      last7d: DailyRewardPoint[];
      last30d: DailyRewardPoint[];
      lifetime: DailyRewardPoint;
    };
  };
  disclaimers: {
    entertainment: string;
    estimates: string;
    holderRewards: string;
    communityTreasury: string;
  };
  dataSource: "server_vault";
};

export type VaultRealtimeEvent =
  | {
      type: "rewardPoolUpdated";
      epochKey: string;
      poolLamports: string;
      at: string;
    }
  | {
      type: "rewardEstimateUpdated";
      publicPetId: string;
      walletKey: string;
      estimatedPendingLamports: string;
      previousEstimatedLamports: string;
      at: string;
      /** Animate only when this is true (verified deposit). */
      fromVerifiedDeposit: true;
      fundingId: string;
    }
  | {
      type: "claimCompleted";
      publicPetId: string;
      walletKey: string;
      claimedLamports: string;
      celebrationStyle: CelebrationStyle;
      at: string;
      txSignature: string | null;
      chainWrite: boolean;
    }
  | {
      type: "newFundingTransaction";
      funding: VerifiedFundingRecord;
      at: string;
    }
  | {
      type: "epochClosed";
      epochKey: string;
      epochNumber: number;
      finalizedPoolLamports: string;
      at: string;
    }
  | {
      type: "petEligibilityChanged";
      publicPetId: string;
      status: PetRewardStatus;
      inactiveReasons: InactiveReasonCode[];
      weight: number;
      at: string;
    };

export type CelebrationStyle = "jump" | "spin" | "stretch" | "sparkle-burst";

export type RecordVerifiedDepositInput = {
  /** Idempotency key — duplicate requestIds are rejected. */
  requestId: string;
  grossLamports: bigint;
  transactionType: RevenueTransactionType;
  source: FundingSourceKind;
  txSignature?: string | null;
  network?: string;
  note?: string;
  /**
   * Server verification token. Injector / settlement paths must pass a secret
   * known only to the server process — never from untrusted client bodies alone.
   */
  verificationToken: string;
};
