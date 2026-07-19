/**
 * Treasury Monitoring Service — poll + optional WS/RPC failover stubs.
 * On SOL deposit: verify tx/amount/sender/confirmations → store → trigger engine.
 * Demo mode synthesizes a verified deposit when `simulateDeposit` is set.
 */

import { appendAudit } from "./audit";
import { ingestRevenue } from "./service";
import { loadTreasuryOpsState, mutateTreasuryOpsState } from "./store";
import type { RevenueSourceKey } from "./types";

export type MonitorTickResult = {
  ok: boolean;
  mode: "demo" | "rpc";
  rpcUsed: "primary" | "fallback" | "none";
  depositsFound: number;
  ingestedIds: string[];
  errors: string[];
  rateLimited: boolean;
};

const lastTickByKey = new Map<string, number>();

function rateLimitOk(key: string, minIntervalMs: number): boolean {
  const last = lastTickByKey.get(key) ?? 0;
  const now = Date.now();
  if (now - last < minIntervalMs) return false;
  lastTickByKey.set(key, now);
  return true;
}

/**
 * Attempt RPC health check. Failover primary → fallback.
 * Does not require live chain for demo; returns mode accordingly.
 */
async function pickRpc(
  primary: string,
  fallback: string,
): Promise<{ url: string; which: "primary" | "fallback" | "none" }> {
  for (const [which, url] of [
    ["primary", primary],
    ["fallback", fallback],
  ] as const) {
    if (!url) continue;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2_500);
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) return { url, which };
    } catch {
      // try next
    }
  }
  return { url: "", which: "none" };
}

export async function runMonitorTick(opts?: {
  simulateDeposit?: {
    amountLamports: string;
    sourceKey?: RevenueSourceKey;
    senderAddress?: string;
    txSignature?: string;
  };
  actorId?: string | null;
  requestId?: string | null;
  force?: boolean;
}): Promise<MonitorTickResult> {
  const state = loadTreasuryOpsState();
  const errors: string[] = [];
  const ingestedIds: string[] = [];

  if (!state.settings.monitoringEnabled && !opts?.force) {
    return {
      ok: false,
      mode: "demo",
      rpcUsed: "none",
      depositsFound: 0,
      ingestedIds: [],
      errors: ["Monitoring disabled"],
      rateLimited: false,
    };
  }

  if (!rateLimitOk("monitor_tick", Math.min(5_000, state.settings.pollIntervalMs)) && !opts?.force) {
    return {
      ok: false,
      mode: "demo",
      rpcUsed: "none",
      depositsFound: 0,
      ingestedIds: [],
      errors: ["Rate limited"],
      rateLimited: true,
    };
  }

  const rpc = await pickRpc(state.settings.rpcPrimaryUrl, state.settings.rpcFallbackUrl);

  mutateTreasuryOpsState((s) => {
    s.settings.lastMonitorTickAt = new Date().toISOString();
    appendAudit(s, {
      actorId: opts?.actorId ?? "monitor",
      action: "monitor_tick",
      entityType: "monitor",
      entityId: "treasury_ops",
      requestId: opts?.requestId ?? null,
      metadata: { rpcUsed: rpc.which },
    });
    return true;
  });

  // Live signature scan would go here when PROJECT_TREASURY_ADDRESS is a real pubkey
  // and indexer/RPC getSignaturesForAddress is wired. Demo path below.

  if (opts?.simulateDeposit) {
    const sig =
      opts.simulateDeposit.txSignature ??
      `mon_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const result = await ingestRevenue({
      sourceKey: opts.simulateDeposit.sourceKey ?? "pumpfun_creator_fees",
      amountLamports: opts.simulateDeposit.amountLamports,
      senderAddress: opts.simulateDeposit.senderAddress ?? "PUMPFUN_CREATOR_FEE_ROUTER",
      txSignature: sig,
      idempotencyKey: `monitor:${sig}`,
      confirmations: state.settings.minConfirmations,
      metadata: {
        via: "monitor_tick",
        verified: true,
        note: "Simulated Pump.fun → Project Treasury deposit",
      },
      actorId: opts.actorId ?? "monitor",
      requestId: opts.requestId,
      triggerDistribute: true,
    });
    if (!result.duplicate) ingestedIds.push(result.incoming.id);
  }

  return {
    ok: true,
    mode: rpc.which === "none" ? "demo" : "rpc",
    rpcUsed: rpc.which,
    depositsFound: ingestedIds.length,
    ingestedIds,
    errors,
    rateLimited: false,
  };
}
