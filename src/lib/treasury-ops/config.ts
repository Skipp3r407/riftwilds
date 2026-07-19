/**
 * Bootstrap config for Project Treasury Ops.
 * Default split: 35 Dev / 20 Marketing / 15 Tournament / 10 Community /
 * 10 Creator / 5 Emergency / 5 Liquidity.
 */

import type { DistributionRuleSet, SystemSettings, TreasuryOpsWallet } from "./types";

export const TREASURY_OPS_STATE_VERSION = 1;
export const TOTAL_BPS = 10_000;

export const DEFAULT_SPLIT_BPS = {
  DEVELOPMENT: 3500,
  MARKETING: 2000,
  TOURNAMENT: 1500,
  COMMUNITY: 1000,
  CREATOR: 1000,
  EMERGENCY: 500,
  LIQUIDITY: 500,
} as const;

/** Min auto-distribute threshold: 0.01 SOL */
export const DEFAULT_MIN_DISTRIBUTION_LAMPORTS = "10000000";
/** Manual approval above 1 SOL */
export const DEFAULT_AUTO_APPROVAL_THRESHOLD_LAMPORTS = "1000000000";
export const DEFAULT_DISTRIBUTION_DELAY_MS = 5_000;

export function createDefaultSettings(now = new Date().toISOString()): SystemSettings {
  return {
    treasuryName: "Riftwilds Project Treasury",
    treasuryDescription:
      "Single landing wallet for Pump.fun creator fees and other project revenue. Funds are categorized and distributed to ops wallets by configurable rules — never auto-paid to all token holders.",
    network: "devnet",
    paused: false,
    emergencyStop: false,
    autoDistributeEnabled: true,
    realTransfersEnabled: false,
    monitoringEnabled: true,
    pollIntervalMs: 15_000,
    minConfirmations: 1,
    rpcPrimaryUrl: process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    rpcFallbackUrl: process.env.SOLANA_RPC_FALLBACK_URL ?? "https://api.devnet.solana.com",
    wsUrl: process.env.SOLANA_WS_URL ?? "",
    projectTreasuryAddress: process.env.PROJECT_TREASURY_ADDRESS ?? "PROJECT_TREASURY_COMING_SOON",
    lastMonitorTickAt: null,
    updatedAt: now,
  };
}

export function createDefaultWallets(
  projectAddress: string,
  now = new Date().toISOString(),
): TreasuryOpsWallet[] {
  const stub = (role: string) => `${role}_COMING_SOON`;

  const mk = (
    role: TreasuryOpsWallet["role"],
    name: string,
    description: string,
    percentBps: number,
    isDistributionTarget: boolean,
    address?: string,
  ): TreasuryOpsWallet => ({
    id: `wallet_${role.toLowerCase()}`,
    role,
    name,
    description,
    address: address ?? stub(role),
    network: "devnet",
    asset: "SOL",
    isActive: true,
    isDistributionTarget,
    percentBps,
    createdAt: now,
    updatedAt: now,
  });

  return [
    mk(
      "PROJECT_TREASURY",
      "Project Treasury",
      "Single landing wallet for all creator fees and project revenue before distribution.",
      0,
      false,
      projectAddress,
    ),
    mk(
      "DEVELOPMENT",
      "Development",
      "Game development, engineering, audits, infrastructure build-out.",
      DEFAULT_SPLIT_BPS.DEVELOPMENT,
      true,
    ),
    mk(
      "MARKETING",
      "Marketing",
      "Campaigns, creators, listings promotions, community outreach.",
      DEFAULT_SPLIT_BPS.MARKETING,
      true,
    ),
    mk(
      "OPERATIONS",
      "Operations",
      "Hosting, RPC, support, day-to-day ops. Manual / non-default split target.",
      0,
      false,
    ),
    mk(
      "TOURNAMENT",
      "Tournament",
      "Treasury-funded prize pools and event ops — not player-vs-player escrow.",
      DEFAULT_SPLIT_BPS.TOURNAMENT,
      true,
    ),
    mk(
      "COMMUNITY",
      "Community",
      "Events, challenges, grants. Never auto-dividend to all holders.",
      DEFAULT_SPLIT_BPS.COMMUNITY,
      true,
    ),
    mk(
      "CREATOR",
      "Creator",
      "Creator hub grants and guild marketplace support budgets.",
      DEFAULT_SPLIT_BPS.CREATOR,
      true,
    ),
    mk(
      "LIQUIDITY",
      "Liquidity",
      "DEX liquidity and market-making reserves (ops-controlled).",
      DEFAULT_SPLIT_BPS.LIQUIDITY,
      true,
    ),
    mk(
      "EMERGENCY",
      "Emergency",
      "Incident response, exploit mitigation, critical recovery.",
      DEFAULT_SPLIT_BPS.EMERGENCY,
      true,
    ),
    mk(
      "COLD_STORAGE",
      "Cold Storage",
      "Long-term cold reserve. Not part of auto-split.",
      0,
      false,
    ),
    mk(
      "BACKUP",
      "Backup",
      "Backup destination / recovery staging. Not part of auto-split.",
      0,
      false,
    ),
  ];
}

export function createDefaultRules(
  wallets: TreasuryOpsWallet[],
  now = new Date().toISOString(),
): DistributionRuleSet {
  const splits: Record<string, number> = {};
  for (const w of wallets) {
    if (w.isDistributionTarget && w.percentBps > 0) {
      splits[w.id] = w.percentBps;
    }
  }
  return {
    id: "rules_v1",
    version: 1,
    label: "Default ops split v1",
    active: true,
    splits,
    minDistributionLamports: DEFAULT_MIN_DISTRIBUTION_LAMPORTS,
    distributionDelayMs: DEFAULT_DISTRIBUTION_DELAY_MS,
    autoApprovalThresholdLamports: DEFAULT_AUTO_APPROVAL_THRESHOLD_LAMPORTS,
    createdAt: now,
    updatedAt: now,
  };
}

export function validateSplitsBps(splits: Record<string, number>): {
  ok: boolean;
  total: number;
  message?: string;
} {
  const total = Object.values(splits).reduce((s, n) => s + n, 0);
  if (total !== TOTAL_BPS) {
    return { ok: false, total, message: `Splits must sum to ${TOTAL_BPS} bps, got ${total}` };
  }
  for (const [id, bps] of Object.entries(splits)) {
    if (!Number.isInteger(bps) || bps < 0) {
      return { ok: false, total, message: `Invalid bps for ${id}: ${bps}` };
    }
  }
  return { ok: true, total };
}

export function lamportsToSolLabel(lamports: string | bigint): string {
  const n = typeof lamports === "bigint" ? lamports : BigInt(lamports || "0");
  const whole = n / 1_000_000_000n;
  const frac = n % 1_000_000_000n;
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "") || "0";
  return fracStr === "0" ? `${whole} SOL` : `${whole}.${fracStr} SOL`;
}
