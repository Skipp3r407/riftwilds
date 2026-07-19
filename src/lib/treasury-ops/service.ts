/**
 * Treasury Ops facade — ingest → categorize → ledger → distribute → audit.
 */

import { appendAudit } from "./audit";
import { validateSplitsBps, createDefaultWallets } from "./config";
import { buildPayoutPlan, previewDistribution } from "./distribution-engine";
import { computeAnalytics, computeHealthScore } from "./analytics";
import { loadTreasuryOpsState, mutateTreasuryOpsState, saveTreasuryOpsState } from "./store";
import { executeTransfers, estimateFeeLamports, transferModeLabel } from "./transfer-engine";
import type {
  DashboardSnapshot,
  DistributionRecord,
  IncomingTransaction,
  RevenueSourceKey,
  TreasuryOpsWallet,
  TreasuryWalletRole,
} from "./types";

function id(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function bumpBalance(
  state: ReturnType<typeof loadTreasuryOpsState>,
  walletId: string,
  asset: "SOL" | "RIFT",
  delta: bigint,
): void {
  let bal = state.balances.find((b) => b.walletId === walletId && b.asset === asset);
  if (!bal) {
    bal = {
      walletId,
      asset,
      balanceRaw: "0",
      updatedAt: new Date().toISOString(),
      verified: false,
      isDemo: true,
    };
    state.balances.push(bal);
  }
  const next = BigInt(bal.balanceRaw) + delta;
  bal.balanceRaw = next < 0n ? "0" : next.toString();
  bal.updatedAt = new Date().toISOString();
}

function projectWallet(state: ReturnType<typeof loadTreasuryOpsState>) {
  return state.wallets.find((w) => w.role === "PROJECT_TREASURY");
}

export function getDashboard(): DashboardSnapshot {
  const state = loadTreasuryOpsState();
  const project = projectWallet(state);
  const projectBal =
    state.balances.find((b) => b.walletId === project?.id && b.asset === "SOL")?.balanceRaw ?? "0";
  const analytics = computeAnalytics(state);
  const healthScore = computeHealthScore(state, analytics);

  return {
    settings: state.settings,
    wallets: state.wallets,
    rules: state.rules,
    balances: state.balances,
    projectTreasuryBalanceLamports: projectBal,
    pendingCount: state.pendingDistributions.length,
    failedCount: state.failed.filter((f) => f.retryCount < 5).length,
    approvalQueue: state.approvals.filter((a) => a.status === "PENDING"),
    recentIncoming: state.incoming.slice(0, 25),
    recentDistributions: state.distributions.slice(0, 25),
    analytics,
    notifications: state.notifications.slice(0, 20),
    healthScore,
    mode: transferModeLabel(state.settings),
    constraints: {
      noPlayerWagering: true,
      noHolderDividendAutopay: true,
      singleProjectTreasuryLanding: true,
    },
  };
}

export type IngestInput = {
  sourceKey: RevenueSourceKey;
  amountLamports: string;
  senderAddress?: string;
  txSignature?: string | null;
  idempotencyKey: string;
  asset?: "SOL" | "RIFT";
  confirmations?: number;
  metadata?: Record<string, unknown>;
  actorId?: string | null;
  requestId?: string | null;
  /** When true, auto-queue distribution after verify */
  triggerDistribute?: boolean;
};

export async function ingestRevenue(input: IngestInput): Promise<{
  incoming: IncomingTransaction;
  duplicate: boolean;
  distribution: DistributionRecord | null;
}> {
  const result = mutateTreasuryOpsState((state) => {
    const existing = state.incoming.find((t) => t.idempotencyKey === input.idempotencyKey);
    if (existing) {
      return { incoming: existing, duplicate: true, distribution: null };
    }
    if (input.txSignature && state.seenSignatures.includes(input.txSignature)) {
      const dup: IncomingTransaction = {
        id: id("in"),
        sourceKey: input.sourceKey,
        category: input.sourceKey,
        asset: input.asset ?? "SOL",
        amountLamports: input.amountLamports,
        senderAddress: input.senderAddress ?? "unknown",
        recipientAddress: state.settings.projectTreasuryAddress,
        txSignature: input.txSignature,
        idempotencyKey: input.idempotencyKey,
        confirmations: input.confirmations ?? 0,
        status: "DUPLICATE",
        verifiedAt: null,
        metadata: { ...(input.metadata ?? {}), duplicate: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.incoming.unshift(dup);
      appendAudit(state, {
        actorId: input.actorId ?? null,
        action: "incoming_duplicate",
        entityType: "incoming",
        entityId: dup.id,
        requestId: input.requestId ?? null,
        metadata: { idempotencyKey: input.idempotencyKey },
      });
      return { incoming: dup, duplicate: true, distribution: null };
    }

    const project = projectWallet(state);
    const now = new Date().toISOString();
    const confirmations = input.confirmations ?? 1;
    const verified = confirmations >= state.settings.minConfirmations;
    const incoming: IncomingTransaction = {
      id: id("in"),
      sourceKey: input.sourceKey,
      category: input.sourceKey,
      asset: input.asset ?? "SOL",
      amountLamports: input.amountLamports,
      senderAddress: input.senderAddress ?? "unknown",
      recipientAddress: project?.address ?? state.settings.projectTreasuryAddress,
      txSignature: input.txSignature ?? null,
      idempotencyKey: input.idempotencyKey,
      confirmations,
      status: verified ? "VERIFIED" : "PENDING_VERIFY",
      verifiedAt: verified ? now : null,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };

    state.incoming.unshift(incoming);
    if (incoming.txSignature) {
      state.seenSignatures.unshift(incoming.txSignature);
      if (state.seenSignatures.length > 10_000) state.seenSignatures.length = 10_000;
    }

    if (verified && project) {
      bumpBalance(state, project.id, incoming.asset, BigInt(incoming.amountLamports));
      incoming.status = "CATEGORIZED";
      incoming.updatedAt = now;
    }

    appendAudit(state, {
      actorId: input.actorId ?? "system",
      action: "revenue_ingested",
      entityType: "incoming",
      entityId: incoming.id,
      requestId: input.requestId ?? null,
      metadata: {
        sourceKey: incoming.sourceKey,
        amountLamports: incoming.amountLamports,
      },
    });

    state.notifications.unshift({
      id: id("note"),
      createdAt: now,
      level: "info",
      title: `Revenue received: ${incoming.sourceKey}`,
      body: `${incoming.amountLamports} lamports logged to Project Treasury.`,
      read: false,
    });

    let distribution: DistributionRecord | null = null;
    if (
      verified &&
      input.triggerDistribute !== false &&
      state.settings.autoDistributeEnabled &&
      !state.settings.paused &&
      !state.settings.emergencyStop
    ) {
      distribution = queueDistributionForIncoming(state, incoming, input.actorId, input.requestId);
    }

    return { incoming, duplicate: false, distribution };
  }).result;

  // Auto-execute under-threshold queues outside the mutate lock (async transfer path).
  if (
    result.distribution &&
    !result.duplicate &&
    result.distribution.status === "QUEUED" &&
    !result.distribution.requiresApproval
  ) {
    try {
      const executed = await executeDistribution({
        distributionId: result.distribution.id,
        actorId: input.actorId ?? "system",
        requestId: input.requestId,
      });
      return { ...result, distribution: executed };
    } catch {
      return result;
    }
  }

  return result;
}

function queueDistributionForIncoming(
  state: ReturnType<typeof loadTreasuryOpsState>,
  incoming: IncomingTransaction,
  actorId?: string | null,
  requestId?: string | null,
): DistributionRecord | null {
  const already = state.processed.find((p) => p.idempotencyKey === `dist:${incoming.idempotencyKey}`);
  if (already) return state.distributions.find((d) => d.id === already.distributionId) ?? null;

  const amount = BigInt(incoming.amountLamports);
  const min = BigInt(state.rules.minDistributionLamports);
  if (amount < min) {
    appendAudit(state, {
      actorId: actorId ?? "system",
      action: "distribution_skipped_below_min",
      entityType: "incoming",
      entityId: incoming.id,
      requestId: requestId ?? null,
      metadata: { amount: incoming.amountLamports, min: state.rules.minDistributionLamports },
    });
    return null;
  }

  const dist = buildPayoutPlan({
    grossLamports: amount,
    rules: state.rules,
    wallets: state.wallets,
    asset: incoming.asset,
    incomingId: incoming.id,
    idempotencyKey: `dist:${incoming.idempotencyKey}`,
  });

  state.distributions.unshift(dist);
  state.processed.unshift({
    id: id("proc"),
    incomingId: incoming.id,
    idempotencyKey: dist.idempotencyKey,
    processedAt: new Date().toISOString(),
    distributionId: dist.id,
    note: "Queued from ingest",
  });
  incoming.status = "QUEUED";
  incoming.updatedAt = new Date().toISOString();

  if (dist.requiresApproval) {
    state.approvals.unshift({
      id: id("appr"),
      distributionId: dist.id,
      requestedAt: new Date().toISOString(),
      requestedBy: actorId ?? "system",
      status: "PENDING",
      decidedBy: null,
      decidedAt: null,
      note: "Above auto-approval threshold",
    });
    state.notifications.unshift({
      id: id("note"),
      createdAt: new Date().toISOString(),
      level: "warn",
      title: "Manual approval required",
      body: `Distribution ${dist.id} exceeds auto-approval threshold.`,
      read: false,
    });
  } else {
    state.pendingDistributions.push(dist.id);
  }

  appendAudit(state, {
    actorId: actorId ?? "system",
    action: "distribution_queued",
    entityType: "distribution",
    entityId: dist.id,
    requestId: requestId ?? null,
    metadata: { requiresApproval: dist.requiresApproval, gross: dist.grossLamports },
  });

  return dist;
}

export async function executeDistribution(params: {
  distributionId?: string;
  previewGrossLamports?: string;
  actorId?: string | null;
  requestId?: string | null;
  force?: boolean;
}): Promise<DistributionRecord> {
  const state = loadTreasuryOpsState();

  if (params.previewGrossLamports) {
    return previewDistribution({
      grossLamports: BigInt(params.previewGrossLamports),
      rules: state.rules,
      wallets: state.wallets,
    });
  }

  let dist =
    (params.distributionId
      ? state.distributions.find((d) => d.id === params.distributionId)
      : null) ?? null;

  if (!dist) {
    const nextId = state.pendingDistributions[0];
    dist = nextId ? state.distributions.find((d) => d.id === nextId) ?? null : null;
  }
  if (!dist) {
    throw new Error("No distribution to execute");
  }

  if (state.settings.emergencyStop && !params.force) {
    throw new Error("Emergency stop active");
  }
  if (state.settings.paused && !params.force) {
    throw new Error("Treasury distribution paused");
  }
  if (dist.requiresApproval && dist.status === "PENDING_APPROVAL" && !params.force) {
    throw new Error("Distribution requires manual approval");
  }

  // Idempotency: already completed/simulated
  if (dist.status === "COMPLETED" || dist.status === "SIMULATED") {
    return dist;
  }

  const project = projectWallet(state);
  if (!project) throw new Error("Project treasury wallet missing");

  const gross = BigInt(dist.grossLamports);
  const projectBal = BigInt(
    state.balances.find((b) => b.walletId === project.id && b.asset === dist.asset)?.balanceRaw ??
      "0",
  );
  if (projectBal < gross) {
    dist.status = "FAILED";
    dist.error = "Insufficient project treasury balance";
    dist.updatedAt = new Date().toISOString();
    state.failed.unshift({
      id: id("fail"),
      distributionId: dist.id,
      reason: dist.error,
      retryCount: 0,
      lastError: dist.error,
      nextRetryAt: new Date(Date.now() + 60_000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveTreasuryOpsState(state);
    throw new Error(dist.error);
  }

  dist.status = "EXECUTING";
  dist.updatedAt = new Date().toISOString();
  const { distribution: executed } = await executeTransfers({
    distribution: dist,
    settings: state.settings,
  });

  // Apply ledger moves for simulated or completed
  if (executed.status === "SIMULATED" || executed.status === "COMPLETED") {
    bumpBalance(state, project.id, executed.asset, -gross);
    for (const line of executed.lines) {
      if (line.status === "SIMULATED" || line.status === "CONFIRMED") {
        bumpBalance(state, line.walletId, executed.asset, BigInt(line.amountLamports));
      }
    }
    if (executed.incomingId) {
      const incoming = state.incoming.find((i) => i.id === executed.incomingId);
      if (incoming) {
        incoming.status = "DISTRIBUTED";
        incoming.updatedAt = new Date().toISOString();
      }
    }
    state.pendingDistributions = state.pendingDistributions.filter((x) => x !== executed.id);
  } else if (executed.status === "FAILED") {
    state.failed.unshift({
      id: id("fail"),
      distributionId: executed.id,
      reason: executed.error ?? "transfer_failed",
      retryCount: 0,
      lastError: executed.error ?? "transfer_failed",
      nextRetryAt: new Date(Date.now() + 60_000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    state.notifications.unshift({
      id: id("note"),
      createdAt: new Date().toISOString(),
      level: "critical",
      title: "Distribution failed",
      body: executed.error ?? "Unknown transfer failure",
      read: false,
    });
  }

  // Replace in array
  const idx = state.distributions.findIndex((d) => d.id === executed.id);
  if (idx >= 0) state.distributions[idx] = executed;

  appendAudit(state, {
    actorId: params.actorId ?? "system",
    action: "distribution_executed",
    entityType: "distribution",
    entityId: executed.id,
    requestId: params.requestId ?? null,
    metadata: {
      status: executed.status,
      simulated: executed.simulated,
      feeEstimate: estimateFeeLamports(executed.lines.length),
    },
  });

  saveTreasuryOpsState(state);
  return executed;
}

export function approveDistribution(params: {
  distributionId: string;
  actorId: string;
  requestId?: string | null;
  approve: boolean;
  note?: string;
}): DistributionRecord {
  return mutateTreasuryOpsState((state) => {
    const dist = state.distributions.find((d) => d.id === params.distributionId);
    if (!dist) throw new Error("Distribution not found");
    const approval = state.approvals.find(
      (a) => a.distributionId === params.distributionId && a.status === "PENDING",
    );
    const now = new Date().toISOString();
    if (approval) {
      approval.status = params.approve ? "APPROVED" : "REJECTED";
      approval.decidedBy = params.actorId;
      approval.decidedAt = now;
      approval.note = params.note ?? null;
    }
    if (params.approve) {
      dist.status = "APPROVED";
      dist.approvedBy = params.actorId;
      dist.approvedAt = now;
      dist.requiresApproval = false;
      if (!state.pendingDistributions.includes(dist.id)) {
        state.pendingDistributions.push(dist.id);
      }
    } else {
      dist.status = "CANCELLED";
      dist.error = params.note ?? "Rejected by admin";
    }
    dist.updatedAt = now;
    appendAudit(state, {
      actorId: params.actorId,
      action: params.approve ? "distribution_approved" : "distribution_rejected",
      entityType: "distribution",
      entityId: dist.id,
      requestId: params.requestId ?? null,
      metadata: { note: params.note ?? null },
    });
    return dist;
  }).result;
}

export function pauseTreasury(actorId: string, requestId?: string | null) {
  return mutateTreasuryOpsState((state) => {
    state.settings.paused = true;
    state.settings.updatedAt = new Date().toISOString();
    appendAudit(state, {
      actorId,
      action: "treasury_paused",
      entityType: "settings",
      entityId: "treasury_ops",
      requestId: requestId ?? null,
      metadata: {},
    });
    return state.settings;
  }).result;
}

export function resumeTreasury(actorId: string, requestId?: string | null) {
  return mutateTreasuryOpsState((state) => {
    state.settings.paused = false;
    state.settings.emergencyStop = false;
    state.settings.updatedAt = new Date().toISOString();
    appendAudit(state, {
      actorId,
      action: "treasury_resumed",
      entityType: "settings",
      entityId: "treasury_ops",
      requestId: requestId ?? null,
      metadata: {},
    });
    return state.settings;
  }).result;
}

export function emergencyStop(actorId: string, requestId?: string | null) {
  return mutateTreasuryOpsState((state) => {
    state.settings.emergencyStop = true;
    state.settings.paused = true;
    state.settings.updatedAt = new Date().toISOString();
    state.notifications.unshift({
      id: id("note"),
      createdAt: new Date().toISOString(),
      level: "critical",
      title: "Emergency stop engaged",
      body: "All automated distributions halted.",
      read: false,
    });
    appendAudit(state, {
      actorId,
      action: "treasury_emergency_stop",
      entityType: "settings",
      entityId: "treasury_ops",
      requestId: requestId ?? null,
      metadata: {},
    });
    return state.settings;
  }).result;
}

export function updateRules(params: {
  splits?: Record<string, number>;
  minDistributionLamports?: string;
  distributionDelayMs?: number;
  autoApprovalThresholdLamports?: string;
  actorId: string;
  requestId?: string | null;
}) {
  return mutateTreasuryOpsState((state) => {
    const nextSplits = params.splits ?? state.rules.splits;
    const check = validateSplitsBps(nextSplits);
    if (!check.ok) throw new Error(check.message);

    state.ruleHistory.unshift({ ...state.rules });
    state.rules = {
      ...state.rules,
      version: state.rules.version + 1,
      splits: nextSplits,
      minDistributionLamports:
        params.minDistributionLamports ?? state.rules.minDistributionLamports,
      distributionDelayMs: params.distributionDelayMs ?? state.rules.distributionDelayMs,
      autoApprovalThresholdLamports:
        params.autoApprovalThresholdLamports ?? state.rules.autoApprovalThresholdLamports,
      updatedAt: new Date().toISOString(),
    };

    // Sync wallet percentBps for distribution targets
    for (const w of state.wallets) {
      if (w.isDistributionTarget) {
        w.percentBps = nextSplits[w.id] ?? 0;
        w.updatedAt = state.rules.updatedAt;
      }
    }

    appendAudit(state, {
      actorId: params.actorId,
      action: "rules_updated",
      entityType: "rules",
      entityId: state.rules.id,
      requestId: params.requestId ?? null,
      metadata: { version: state.rules.version, splits: nextSplits },
    });
    return state.rules;
  }).result;
}

export function updateSettings(params: {
  patch: Partial<{
    treasuryName: string;
    treasuryDescription: string;
    projectTreasuryAddress: string;
    autoDistributeEnabled: boolean;
    monitoringEnabled: boolean;
    pollIntervalMs: number;
    minConfirmations: number;
    realTransfersEnabled: boolean;
    rpcPrimaryUrl: string;
    rpcFallbackUrl: string;
    wsUrl: string;
  }>;
  actorId: string;
  requestId?: string | null;
}) {
  return mutateTreasuryOpsState((state) => {
    // Never silently enable real transfers without explicit true
    Object.assign(state.settings, params.patch);
    if (params.patch.projectTreasuryAddress) {
      const project = projectWallet(state);
      if (project) {
        project.address = params.patch.projectTreasuryAddress;
        project.updatedAt = new Date().toISOString();
      }
      state.settings.projectTreasuryAddress = params.patch.projectTreasuryAddress;
    }
    state.settings.updatedAt = new Date().toISOString();
    appendAudit(state, {
      actorId: params.actorId,
      action: "settings_updated",
      entityType: "settings",
      entityId: "treasury_ops",
      requestId: params.requestId ?? null,
      metadata: { patch: params.patch },
    });
    return state.settings;
  }).result;
}

export function updateWalletAddress(params: {
  walletId: string;
  address: string;
  actorId: string;
  requestId?: string | null;
}) {
  return mutateTreasuryOpsState((state) => {
    const w = state.wallets.find((x) => x.id === params.walletId);
    if (!w) throw new Error("Wallet not found");
    w.address = params.address;
    w.updatedAt = new Date().toISOString();
    if (w.role === "PROJECT_TREASURY") {
      state.settings.projectTreasuryAddress = params.address;
      state.settings.updatedAt = w.updatedAt;
    }
    appendAudit(state, {
      actorId: params.actorId,
      action: "wallet_address_updated",
      entityType: "wallet",
      entityId: w.id,
      requestId: params.requestId ?? null,
      metadata: { address: params.address },
    });
    return w;
  }).result;
}

export function addCustomWallet(params: {
  name: string;
  description?: string;
  address: string;
  percentBps?: number;
  actorId: string;
  requestId?: string | null;
}): TreasuryOpsWallet {
  return mutateTreasuryOpsState((state) => {
    const now = new Date().toISOString();
    const wallet: TreasuryOpsWallet = {
      id: id("wallet_custom"),
      role: "CUSTOM",
      name: params.name,
      description: params.description ?? "Custom destination wallet",
      address: params.address,
      network: state.settings.network,
      asset: "SOL",
      isActive: true,
      isDistributionTarget: (params.percentBps ?? 0) > 0,
      percentBps: params.percentBps ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    state.wallets.push(wallet);
    appendAudit(state, {
      actorId: params.actorId,
      action: "wallet_added",
      entityType: "wallet",
      entityId: wallet.id,
      requestId: params.requestId ?? null,
      metadata: { name: wallet.name },
    });
    return wallet;
  }).result;
}

export function retryFailed(params: {
  failedId?: string;
  actorId: string;
  requestId?: string | null;
}): { requeued: string[] } {
  return mutateTreasuryOpsState((state) => {
    const targets = params.failedId
      ? state.failed.filter((f) => f.id === params.failedId)
      : state.failed.filter((f) => f.retryCount < 5);

    const requeued: string[] = [];
    for (const f of targets) {
      const dist = state.distributions.find((d) => d.id === f.distributionId);
      if (!dist) continue;
      if (dist.status === "COMPLETED" || dist.status === "SIMULATED") continue;
      dist.status = "QUEUED";
      dist.error = null;
      dist.updatedAt = new Date().toISOString();
      for (const line of dist.lines) {
        if (line.status === "FAILED") {
          line.status = "PENDING";
          line.error = null;
        }
      }
      if (!state.pendingDistributions.includes(dist.id)) {
        state.pendingDistributions.push(dist.id);
      }
      f.retryCount += 1;
      f.updatedAt = new Date().toISOString();
      requeued.push(dist.id);
    }

    appendAudit(state, {
      actorId: params.actorId,
      action: "failed_distributions_retried",
      entityType: "distribution",
      entityId: params.failedId ?? "batch",
      requestId: params.requestId ?? null,
      metadata: { requeued },
    });
    return { requeued };
  }).result;
}

export function getHistory(limit = 50) {
  const state = loadTreasuryOpsState();
  return {
    incoming: state.incoming.slice(0, limit),
    distributions: state.distributions.slice(0, limit),
    auditLogs: state.auditLogs.slice(0, limit),
    failed: state.failed.slice(0, limit),
  };
}

export function getBalances() {
  const state = loadTreasuryOpsState();
  return {
    balances: state.balances,
    wallets: state.wallets,
    projectTreasuryAddress: state.settings.projectTreasuryAddress,
  };
}

export function getAnalytics() {
  const state = loadTreasuryOpsState();
  const analytics = computeAnalytics(state);
  return { ...analytics, healthScore: computeHealthScore(state, analytics) };
}

export function exportReport() {
  const state = loadTreasuryOpsState();
  const analytics = computeAnalytics(state);
  const report = {
    id: id("report"),
    period: "daily" as const,
    periodStart: new Date(Date.now() - 86_400_000).toISOString(),
    periodEnd: new Date().toISOString(),
    totalInLamports: analytics.periods.daily.inflowLamports,
    totalOutLamports: analytics.periods.daily.outflowLamports,
    bySource: analytics.bySource,
    byWallet: analytics.byWallet,
    healthScore: computeHealthScore(state, analytics),
    generatedAt: new Date().toISOString(),
  };
  mutateTreasuryOpsState((s) => {
    s.reports.unshift(report);
    return report;
  });
  return report;
}

/** Reset wallets to defaults (keeps history). */
export function resetWalletTemplates(actorId: string) {
  return mutateTreasuryOpsState((state) => {
    const addr = state.settings.projectTreasuryAddress;
    const templates = createDefaultWallets(addr);
    // Preserve custom wallets
    const customs = state.wallets.filter((w) => w.role === "CUSTOM");
    state.wallets = [...templates, ...customs];
    appendAudit(state, {
      actorId,
      action: "wallets_reset_templates",
      entityType: "wallet",
      entityId: "batch",
      requestId: null,
      metadata: {},
    });
    return state.wallets;
  }).result;
}

export type { TreasuryWalletRole, RevenueSourceKey };
