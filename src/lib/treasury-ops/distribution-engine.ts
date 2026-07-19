import { TOTAL_BPS, validateSplitsBps } from "./config";
import type {
  DistributionRecord,
  DistributionRuleSet,
  PayoutLine,
  TreasuryOpsWallet,
} from "./types";

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build an idempotent payout plan. Remainder lamports go to DEVELOPMENT (or first target).
 * Invariant: sum(lines) === grossLamports.
 */
export function buildPayoutPlan(params: {
  grossLamports: bigint;
  rules: DistributionRuleSet;
  wallets: TreasuryOpsWallet[];
  asset?: "SOL" | "RIFT";
  incomingId?: string | null;
  idempotencyKey: string;
  previewOnly?: boolean;
}): DistributionRecord {
  const check = validateSplitsBps(params.rules.splits);
  if (!check.ok) {
    throw new Error(check.message ?? "Invalid distribution splits");
  }
  if (params.grossLamports < 0n) {
    throw new Error("Gross amount cannot be negative");
  }

  const walletById = new Map(params.wallets.map((w) => [w.id, w]));
  const entries = Object.entries(params.rules.splits).filter(([, bps]) => bps > 0);

  const lines: PayoutLine[] = entries.map(([walletId, percentBps]) => {
    const wallet = walletById.get(walletId);
    if (!wallet) {
      throw new Error(`Unknown wallet in split: ${walletId}`);
    }
    const calculated = (params.grossLamports * BigInt(percentBps)) / BigInt(TOTAL_BPS);
    return {
      id: id("pline"),
      walletId,
      walletRole: wallet.role,
      walletName: wallet.name,
      address: wallet.address,
      percentBps,
      amountLamports: calculated.toString(),
      status: "PENDING",
      txSignature: null,
      error: null,
      attemptedAt: null,
      confirmedAt: null,
    };
  });

  const sumFloor = lines.reduce((s, l) => s + BigInt(l.amountLamports), 0n);
  let remainder = params.grossLamports - sumFloor;
  if (remainder > 0n) {
    const prefer =
      lines.find((l) => l.walletRole === "DEVELOPMENT") ??
      lines.find((l) => l.walletRole === "OPERATIONS") ??
      lines[0];
    if (!prefer) throw new Error("No payout destinations");
    prefer.amountLamports = (BigInt(prefer.amountLamports) + remainder).toString();
    remainder = 0n;
  }

  const total = lines.reduce((s, l) => s + BigInt(l.amountLamports), 0n);
  if (total !== params.grossLamports) {
    throw new Error(`Payout invariant failed: ${total} !== ${params.grossLamports}`);
  }

  const threshold = BigInt(params.rules.autoApprovalThresholdLamports);
  const requiresApproval = params.grossLamports > threshold;
  const now = new Date().toISOString();

  return {
    id: id("dist"),
    incomingId: params.incomingId ?? null,
    ruleVersion: params.rules.version,
    status: params.previewOnly ? "PREVIEW" : requiresApproval ? "PENDING_APPROVAL" : "QUEUED",
    grossLamports: params.grossLamports.toString(),
    asset: params.asset ?? "SOL",
    lines,
    requiresApproval,
    approvedBy: null,
    approvedAt: null,
    idempotencyKey: params.idempotencyKey,
    previewOnly: Boolean(params.previewOnly),
    simulated: false,
    error: null,
    createdAt: now,
    updatedAt: now,
    executedAt: null,
  };
}

export function previewDistribution(params: {
  grossLamports: bigint;
  rules: DistributionRuleSet;
  wallets: TreasuryOpsWallet[];
}): DistributionRecord {
  return buildPayoutPlan({
    ...params,
    idempotencyKey: `preview:${Date.now()}`,
    previewOnly: true,
  });
}
