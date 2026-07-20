/**
 * Server-authoritative integer Credits ledger.
 * - Atomic debit/credit (single-threaded process memory; Prisma-ready shape)
 * - Idempotency via requestId
 * - No floats; AI callers cannot invent rewards (validate reason + amount)
 *
 * Demo/dev: in-memory store. Production: map to prisma.currencyLedger + playerProfile.softCurrency.
 */

import {
  CREDITS_CONFIG_VERSION,
  FAUCET_RULES,
  SINK_RULES,
  STARTER_CREDITS,
} from "@/lib/credits/config";
import type {
  CreditAccount,
  CreditFaucetReason,
  CreditLedgerEntry,
  CreditMutationResult,
  CreditReason,
  CreditSinkReason,
  EconomyAlert,
  EconomyHealthSnapshot,
} from "@/lib/credits/types";
import { CREDITS_CURRENCY } from "@/lib/credits/types";

type RateBucket = {
  dayKey: string;
  creditedToday: number;
  grantCountToday: number;
  lastGrantAt: number;
};

type Store = {
  accounts: Map<string, CreditAccount>;
  entries: CreditLedgerEntry[];
  byRequestId: Map<string, CreditLedgerEntry>;
  rate: Map<string, RateBucket>;
  burnedLifetime: number;
  creditedLifetime: number;
  debitedLifetime: number;
  faucetTotals: Partial<Record<CreditFaucetReason, number>>;
  sinkTotals: Partial<Record<CreditSinkReason, number>>;
  recentDeltas: { at: number; delta: number }[];
};

const globalForCredits = globalThis as unknown as { __riftwildsCredits?: Store };

function createStore(): Store {
  return {
    accounts: new Map(),
    entries: [],
    byRequestId: new Map(),
    rate: new Map(),
    burnedLifetime: 0,
    creditedLifetime: 0,
    debitedLifetime: 0,
    faucetTotals: {},
    sinkTotals: {},
    recentDeltas: [],
  };
}

function store(): Store {
  if (!globalForCredits.__riftwildsCredits) {
    globalForCredits.__riftwildsCredits = createStore();
  }
  return globalForCredits.__riftwildsCredits;
}

/** Test helper — wipe in-memory ledger. */
export function resetCreditLedgerForTests(): void {
  globalForCredits.__riftwildsCredits = createStore();
}

/**
 * Seed memory balance from Prisma hydrate (no new faucet grant).
 * Only applies when account is untouched (balance 0, version 0).
 * Marks starter requestId as applied so ensureStarterCredits cannot double-grant.
 */
export function seedCreditAccountBalance(
  userId: string,
  balance: number,
  version = 0,
): void {
  if (!assertInt(balance) || balance < 0) return;
  const acc = ensureAccount(userId);
  if (acc.balance !== 0 || acc.version !== 0) return;
  const now = Date.now();
  const iso = new Date(now).toISOString();
  acc.balance = balance;
  acc.version = Math.max(1, version);
  acc.updatedAt = iso;
  const s = store();
  const starterId = `starter:${userId}`;
  if (!s.byRequestId.has(starterId)) {
    const marker: CreditLedgerEntry = {
      id: `cle_hydrate_${userId}`,
      createdAt: iso,
      userId,
      currency: CREDITS_CURRENCY,
      delta: 0,
      balanceAfter: balance,
      reason: "STARTER_GRANT",
      requestId: starterId,
      metadata: { hydratedFromPrisma: true },
    };
    s.byRequestId.set(starterId, marker);
  }
}

/**
 * Dev Override mock Credits — one-time top-up to softCurrency when the ledger
 * is empty or only has a tiny starter grant. Idempotent; does not reset spends.
 */
export function ensureDevOverrideMockCredits(
  userId: string,
  target: number,
): void {
  if (!assertInt(target) || target <= 0) return;
  seedCreditAccountBalance(userId, target);

  const s = store();
  const seedId = `dev-override-seed:${userId}`;
  if (s.byRequestId.has(seedId)) return;

  const acc = ensureAccount(userId);
  const now = Date.now();
  const iso = new Date(now).toISOString();

  if (acc.balance >= target) {
    s.byRequestId.set(seedId, {
      id: `cle_devov_mark_${userId}`,
      createdAt: iso,
      userId,
      currency: CREDITS_CURRENCY,
      delta: 0,
      balanceAfter: acc.balance,
      reason: "STARTER_GRANT",
      requestId: seedId,
      metadata: { kind: "dev_override_mock", alreadyFunded: true },
    });
    return;
  }

  const delta = target - acc.balance;
  acc.balance = target;
  acc.version += 1;
  acc.updatedAt = iso;
  const entry: CreditLedgerEntry = {
    id: `cle_devov_${userId}`,
    createdAt: iso,
    userId,
    currency: CREDITS_CURRENCY,
    delta,
    balanceAfter: target,
    reason: "STARTER_GRANT",
    requestId: seedId,
    metadata: { kind: "dev_override_mock" },
  };
  s.entries.push(entry);
  s.byRequestId.set(seedId, entry);

  const starterId = `starter:${userId}`;
  if (!s.byRequestId.has(starterId)) {
    s.byRequestId.set(starterId, entry);
  }
}

function utcDayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function assertInt(n: number): boolean {
  return Number.isInteger(n) && Number.isFinite(n);
}

function ensureAccount(userId: string, now = Date.now()): CreditAccount {
  const s = store();
  let acc = s.accounts.get(userId);
  if (!acc) {
    const iso = new Date(now).toISOString();
    acc = {
      userId,
      balance: 0,
      version: 0,
      createdAt: iso,
      updatedAt: iso,
    };
    s.accounts.set(userId, acc);
  }
  return acc;
}

function rateKey(userId: string, reason: CreditReason): string {
  return `${userId}:${reason}`;
}

function checkFaucetLimits(
  userId: string,
  reason: CreditFaucetReason,
  amount: number,
  now: number,
): CreditMutationResult | null {
  const rule = FAUCET_RULES[reason];
  if (!rule) {
    return {
      ok: false,
      error: "unknown_reason",
      message: `Unknown faucet reason: ${reason}`,
    };
  }
  if (amount <= 0 || !assertInt(amount)) {
    return { ok: false, error: "invalid_amount", message: "Amount must be a positive integer" };
  }
  if (amount > rule.maxPerGrant) {
    return {
      ok: false,
      error: "validation_failed",
      message: `Exceeds maxPerGrant (${rule.maxPerGrant}) for ${reason}`,
    };
  }

  const s = store();
  const key = rateKey(userId, reason);
  const day = utcDayKey(now);
  let bucket = s.rate.get(key);
  if (!bucket || bucket.dayKey !== day) {
    bucket = { dayKey: day, creditedToday: 0, grantCountToday: 0, lastGrantAt: 0 };
    s.rate.set(key, bucket);
  }

  if (rule.cooldownMs > 0 && bucket.lastGrantAt > 0) {
    const elapsed = now - bucket.lastGrantAt;
    if (elapsed < rule.cooldownMs) {
      return {
        ok: false,
        error: "cooldown",
        message: `Cooldown active for ${reason}`,
        retryAfterMs: rule.cooldownMs - elapsed,
        balance: ensureAccount(userId, now).balance,
      };
    }
  }

  if (bucket.creditedToday + amount > rule.dailyCap) {
    return {
      ok: false,
      error: "daily_cap",
      message: `Daily cap ${rule.dailyCap} for ${reason}`,
      balance: ensureAccount(userId, now).balance,
    };
  }
  if (bucket.grantCountToday >= rule.dailyGrantCount) {
    return {
      ok: false,
      error: "rate_limited",
      message: `Daily grant count exceeded for ${reason}`,
      balance: ensureAccount(userId, now).balance,
    };
  }
  return null;
}

function applyMutation(params: {
  userId: string;
  delta: number;
  reason: CreditReason;
  requestId: string;
  metadata?: Record<string, unknown>;
  leavesCirculation?: boolean;
  now?: number;
}): CreditMutationResult {
  const now = params.now ?? Date.now();
  const s = store();

  if (!params.requestId || typeof params.requestId !== "string") {
    return { ok: false, error: "validation_failed", message: "requestId required" };
  }
  if (!assertInt(params.delta) || params.delta === 0) {
    return { ok: false, error: "invalid_amount", message: "delta must be non-zero integer" };
  }

  const existing = s.byRequestId.get(params.requestId);
  if (existing) {
    return {
      ok: true,
      entry: existing,
      balance: existing.balanceAfter,
      idempotentReplay: true,
    };
  }

  const acc = ensureAccount(params.userId, now);
  const next = acc.balance + params.delta;
  if (next < 0) {
    return {
      ok: false,
      error: "insufficient_credits",
      message: "Insufficient Credits",
      balance: acc.balance,
    };
  }

  const entry: CreditLedgerEntry = {
    id: `cle_${now.toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date(now).toISOString(),
    userId: params.userId,
    currency: CREDITS_CURRENCY,
    delta: params.delta,
    balanceAfter: next,
    reason: params.reason,
    requestId: params.requestId,
    metadata: params.metadata,
    leavesCirculation: params.leavesCirculation,
  };

  acc.balance = next;
  acc.version += 1;
  acc.updatedAt = entry.createdAt;
  s.entries.push(entry);
  s.byRequestId.set(params.requestId, entry);
  s.recentDeltas.push({ at: now, delta: params.delta });
  if (s.recentDeltas.length > 5000) s.recentDeltas.splice(0, s.recentDeltas.length - 5000);

  if (params.delta > 0) {
    s.creditedLifetime += params.delta;
    const fr = params.reason as CreditFaucetReason;
    s.faucetTotals[fr] = (s.faucetTotals[fr] ?? 0) + params.delta;
    const key = rateKey(params.userId, params.reason);
    const day = utcDayKey(now);
    let bucket = s.rate.get(key);
    if (!bucket || bucket.dayKey !== day) {
      bucket = { dayKey: day, creditedToday: 0, grantCountToday: 0, lastGrantAt: 0 };
    }
    bucket.creditedToday += params.delta;
    bucket.grantCountToday += 1;
    bucket.lastGrantAt = now;
    s.rate.set(key, bucket);
  } else {
    const abs = -params.delta;
    s.debitedLifetime += abs;
    const sr = params.reason as CreditSinkReason;
    s.sinkTotals[sr] = (s.sinkTotals[sr] ?? 0) + abs;
    if (params.leavesCirculation) s.burnedLifetime += abs;
  }

  return { ok: true, entry, balance: next };
}

/**
 * Credit (faucet). Validates caps/cooldowns. Rejects AI-invented grants when metadata.source === "ai_npc".
 * Idempotent replays short-circuit before rate-limit checks.
 */
export function creditCredits(params: {
  userId: string;
  amount: number;
  reason: CreditFaucetReason;
  requestId: string;
  metadata?: Record<string, unknown>;
  now?: number;
}): CreditMutationResult {
  if (params.metadata?.source === "ai_npc") {
    return {
      ok: false,
      error: "ai_cannot_grant",
      message: "AI NPC dialogue cannot grant Credits — server quest/event systems only",
    };
  }
  const existing = store().byRequestId.get(params.requestId);
  if (existing) {
    return {
      ok: true,
      entry: existing,
      balance: existing.balanceAfter,
      idempotentReplay: true,
    };
  }
  const now = params.now ?? Date.now();
  const limitErr = checkFaucetLimits(params.userId, params.reason, params.amount, now);
  if (limitErr) return limitErr;
  return applyMutation({
    userId: params.userId,
    delta: params.amount,
    reason: params.reason,
    requestId: params.requestId,
    metadata: params.metadata,
    leavesCirculation: false,
    now,
  });
}

/** Debit (sink). Idempotent replays short-circuit before validation. */
export function debitCredits(params: {
  userId: string;
  amount: number;
  reason: CreditSinkReason;
  requestId: string;
  metadata?: Record<string, unknown>;
  now?: number;
}): CreditMutationResult {
  const existing = store().byRequestId.get(params.requestId);
  if (existing) {
    return {
      ok: true,
      entry: existing,
      balance: existing.balanceAfter,
      idempotentReplay: true,
    };
  }
  const rule = SINK_RULES[params.reason];
  if (!rule) {
    return { ok: false, error: "unknown_reason", message: `Unknown sink: ${params.reason}` };
  }
  if (!assertInt(params.amount) || params.amount <= 0) {
    return { ok: false, error: "invalid_amount", message: "Amount must be a positive integer" };
  }
  if (params.amount < rule.minAmount || params.amount > rule.maxPerAction) {
    return {
      ok: false,
      error: "validation_failed",
      message: `Amount out of range for ${params.reason}`,
    };
  }
  return applyMutation({
    userId: params.userId,
    delta: -params.amount,
    reason: params.reason,
    requestId: params.requestId,
    metadata: params.metadata,
    leavesCirculation: rule.leavesCirculation,
    now: params.now,
  });
}

export function getCreditBalance(userId: string): number {
  return ensureAccount(userId).balance;
}

export function getCreditAccount(userId: string): CreditAccount {
  return { ...ensureAccount(userId) };
}

export function listLedgerEntries(
  userId: string,
  opts?: { limit?: number },
): CreditLedgerEntry[] {
  const limit = opts?.limit ?? 50;
  return store()
    .entries.filter((e) => e.userId === userId)
    .slice(-limit)
    .reverse();
}

/** One-time starter Credits (idempotent). */
export function ensureStarterCredits(userId: string, requestId?: string): CreditMutationResult {
  return creditCredits({
    userId,
    amount: STARTER_CREDITS,
    reason: "STARTER_GRANT",
    requestId: requestId ?? `starter:${userId}`,
    metadata: { kind: "starter" },
  });
}

export function getEconomyHealth(): EconomyHealthSnapshot {
  const s = store();
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  let net24 = 0;
  for (const d of s.recentDeltas) {
    if (d.at >= dayAgo) net24 += d.delta;
  }

  let circulation = 0;
  for (const acc of s.accounts.values()) circulation += acc.balance;

  const alerts: EconomyAlert[] = [];
  if (net24 > 50_000) {
    alerts.push({
      code: "FAUCET_SURGE_24H",
      severity: "warn",
      message: `Net +${net24} Credits in 24h — review faucet abuse; no auto-change applied.`,
    });
  }
  if (circulation > 50_000_000) {
    alerts.push({
      code: "CIRCULATION_HIGH",
      severity: "critical",
      message: "Circulation above warn threshold — admin review required.",
    });
  }
  const faucetSum = Object.values(s.faucetTotals).reduce((a, b) => a + (b ?? 0), 0);
  const sinkSum = Object.values(s.sinkTotals).reduce((a, b) => a + (b ?? 0), 0);
  if (faucetSum > 0 && sinkSum / faucetSum < 0.35) {
    alerts.push({
      code: "SINK_UNDERPRESSURE",
      severity: "warn",
      message: "Sinks absorbing <35% of lifetime faucets — consider content sinks (admin).",
    });
  }

  return {
    at: new Date(now).toISOString(),
    totalAccounts: s.accounts.size,
    totalCreditsInCirculation: circulation,
    totalCreditedLifetime: s.creditedLifetime,
    totalDebitedLifetime: s.debitedLifetime,
    totalBurnedLifetime: s.burnedLifetime,
    faucetTotals: { ...s.faucetTotals },
    sinkTotals: { ...s.sinkTotals },
    netFaucetMinusSink24h: net24,
    alerts,
    configVersion: CREDITS_CONFIG_VERSION,
  };
}

/** Pure preview for UI — does not mutate. */
export function canAfford(userId: string, amount: number): boolean {
  return assertInt(amount) && amount >= 0 && getCreditBalance(userId) >= amount;
}
