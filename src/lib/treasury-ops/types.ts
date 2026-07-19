/**
 * Project Treasury Ops — automated revenue distribution types.
 * Pump.fun creator fees land in ONE Project Treasury Wallet, then split by rules.
 * Never player P2W escrow or holder dividend autopay.
 */

export type TreasuryWalletRole =
  | "PROJECT_TREASURY"
  | "DEVELOPMENT"
  | "MARKETING"
  | "OPERATIONS"
  | "COMMUNITY"
  | "TOURNAMENT"
  | "CREATOR"
  | "LIQUIDITY"
  | "EMERGENCY"
  | "COLD_STORAGE"
  | "BACKUP"
  | "CUSTOM";

export type RevenueSourceKey =
  | "pumpfun_creator_fees"
  | "marketplace_fees"
  | "nft_sales"
  | "nft_royalties"
  | "battle_pass"
  | "cosmetic_shop"
  | "creator_guild_marketplace"
  | "arena_tournament_fees"
  | "sponsored_events"
  | "merch"
  | "donations"
  | "ads"
  | "website_sales"
  | "other";

export type IncomingStatus =
  | "PENDING_VERIFY"
  | "VERIFIED"
  | "CATEGORIZED"
  | "QUEUED"
  | "DISTRIBUTED"
  | "REJECTED"
  | "DUPLICATE";

export type DistributionStatus =
  | "PREVIEW"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "QUEUED"
  | "EXECUTING"
  | "SIMULATED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "PAUSED";

export type PayoutLineStatus =
  | "PENDING"
  | "SIMULATED"
  | "BROADCAST"
  | "CONFIRMED"
  | "FAILED"
  | "SKIPPED";

export type TreasuryOpsWallet = {
  id: string;
  role: TreasuryWalletRole;
  name: string;
  description: string;
  address: string;
  network: string;
  asset: "SOL" | "RIFT";
  isActive: boolean;
  isDistributionTarget: boolean;
  /** Basis points of auto-split (0 for non-targets). Must sum 10000 across active targets. */
  percentBps: number;
  createdAt: string;
  updatedAt: string;
};

export type DistributionRuleSet = {
  id: string;
  version: number;
  label: string;
  active: boolean;
  /** Target walletId → bps */
  splits: Record<string, number>;
  minDistributionLamports: string;
  distributionDelayMs: number;
  /** Above this lamports amount → require manual approval */
  autoApprovalThresholdLamports: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemSettings = {
  treasuryName: string;
  treasuryDescription: string;
  network: string;
  paused: boolean;
  emergencyStop: boolean;
  autoDistributeEnabled: boolean;
  /** Real on-chain transfers — requires keys + flag */
  realTransfersEnabled: boolean;
  monitoringEnabled: boolean;
  pollIntervalMs: number;
  minConfirmations: number;
  rpcPrimaryUrl: string;
  rpcFallbackUrl: string;
  wsUrl: string;
  projectTreasuryAddress: string;
  lastMonitorTickAt: string | null;
  updatedAt: string;
};

export type IncomingTransaction = {
  id: string;
  sourceKey: RevenueSourceKey;
  category: string;
  asset: "SOL" | "RIFT";
  amountLamports: string;
  senderAddress: string;
  recipientAddress: string;
  txSignature: string | null;
  idempotencyKey: string;
  confirmations: number;
  status: IncomingStatus;
  verifiedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ProcessedTransaction = {
  id: string;
  incomingId: string;
  idempotencyKey: string;
  processedAt: string;
  distributionId: string | null;
  note: string;
};

export type PayoutLine = {
  id: string;
  walletId: string;
  walletRole: TreasuryWalletRole;
  walletName: string;
  address: string;
  percentBps: number;
  amountLamports: string;
  status: PayoutLineStatus;
  txSignature: string | null;
  error: string | null;
  attemptedAt: string | null;
  confirmedAt: string | null;
};

export type DistributionRecord = {
  id: string;
  incomingId: string | null;
  ruleVersion: number;
  status: DistributionStatus;
  grossLamports: string;
  asset: "SOL" | "RIFT";
  lines: PayoutLine[];
  requiresApproval: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  idempotencyKey: string;
  previewOnly: boolean;
  simulated: boolean;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  executedAt: string | null;
};

export type FailedDistribution = {
  id: string;
  distributionId: string;
  reason: string;
  retryCount: number;
  lastError: string;
  nextRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManualApproval = {
  id: string;
  distributionId: string;
  requestedAt: string;
  requestedBy: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  decidedBy: string | null;
  decidedAt: string | null;
  note: string | null;
};

export type WalletBalance = {
  walletId: string;
  asset: "SOL" | "RIFT";
  /** Lamports or raw token units as string */
  balanceRaw: string;
  updatedAt: string;
  verified: boolean;
  isDemo: boolean;
};

export type TreasuryAuditEntry = {
  id: string;
  createdAt: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown>;
};

export type TreasuryReport = {
  id: string;
  period: "daily" | "weekly" | "monthly" | "annual";
  periodStart: string;
  periodEnd: string;
  totalInLamports: string;
  totalOutLamports: string;
  bySource: Record<string, string>;
  byWallet: Record<string, string>;
  healthScore: number;
  generatedAt: string;
};

export type NotificationStub = {
  id: string;
  createdAt: string;
  level: "info" | "warn" | "critical";
  title: string;
  body: string;
  read: boolean;
};

export type TreasuryOpsState = {
  version: number;
  settings: SystemSettings;
  wallets: TreasuryOpsWallet[];
  rules: DistributionRuleSet;
  ruleHistory: DistributionRuleSet[];
  balances: WalletBalance[];
  incoming: IncomingTransaction[];
  processed: ProcessedTransaction[];
  distributions: DistributionRecord[];
  pendingDistributions: string[];
  failed: FailedDistribution[];
  approvals: ManualApproval[];
  auditLogs: TreasuryAuditEntry[];
  reports: TreasuryReport[];
  notifications: NotificationStub[];
  /** Seen Solana signatures for dedupe */
  seenSignatures: string[];
  seededAt: string;
  updatedAt: string;
};

export type DashboardSnapshot = {
  settings: SystemSettings;
  wallets: TreasuryOpsWallet[];
  rules: DistributionRuleSet;
  balances: WalletBalance[];
  projectTreasuryBalanceLamports: string;
  pendingCount: number;
  failedCount: number;
  approvalQueue: ManualApproval[];
  recentIncoming: IncomingTransaction[];
  recentDistributions: DistributionRecord[];
  analytics: AnalyticsSnapshot;
  notifications: NotificationStub[];
  healthScore: number;
  mode: "demo_simulated" | "monitor_only" | "live_transfers";
  constraints: {
    noPlayerWagering: true;
    noHolderDividendAutopay: true;
    singleProjectTreasuryLanding: true;
  };
};

export type AnalyticsSnapshot = {
  periods: {
    daily: PeriodStats;
    weekly: PeriodStats;
    monthly: PeriodStats;
    annual: PeriodStats;
  };
  bySource: Record<string, string>;
  byWallet: Record<string, string>;
  averageInflowLamports: string;
  growthRatePct: number;
  distributionCount: number;
  expenseCount: number;
  healthScore: number;
};

export type PeriodStats = {
  inflowLamports: string;
  outflowLamports: string;
  netLamports: string;
  txCount: number;
};
