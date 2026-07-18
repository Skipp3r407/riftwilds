/**
 * Rift Shards — soft secondary currency (in-memory + schema proposal).
 * Never SOL. Not required for core TCG / Live World play.
 */

import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";
import { CURRENCY } from "@/lib/economy/sol/currencies";

type Account = { balance: number; updatedAt: string };

type Store = {
  accounts: Map<string, Account>;
  requestIds: Set<string>;
};

function store(): Store {
  const g = globalThis as unknown as { __riftwildsRiftShards?: Store };
  if (!g.__riftwildsRiftShards) {
    g.__riftwildsRiftShards = { accounts: new Map(), requestIds: new Set() };
  }
  return g.__riftwildsRiftShards;
}

export function resetRiftShardsForTests(): void {
  const g = globalThis as unknown as { __riftwildsRiftShards?: Store };
  g.__riftwildsRiftShards = { accounts: new Map(), requestIds: new Set() };
}

export function getRiftShardBalance(userId: string): number {
  return store().accounts.get(userId)?.balance ?? 0;
}

export function creditRiftShards(params: {
  userId: string;
  amount: number;
  requestId: string;
  reason: string;
}): { ok: true; balance: number; idempotentReplay?: boolean } | { ok: false; error: string } {
  if (!Number.isInteger(params.amount) || params.amount < 1) {
    return { ok: false, error: "invalid_amount" };
  }
  if (store().requestIds.has(params.requestId)) {
    return { ok: true, balance: getRiftShardBalance(params.userId), idempotentReplay: true };
  }
  const prev = getRiftShardBalance(params.userId);
  const balance = prev + params.amount;
  store().accounts.set(params.userId, { balance, updatedAt: new Date().toISOString() });
  store().requestIds.add(params.requestId);
  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "CURRENCY_CREDIT",
    currency: CURRENCY.RIFT_SHARDS,
    amount: params.amount,
    requestId: params.requestId,
    metadata: { reason: params.reason },
  });
  return { ok: true, balance };
}

export function debitRiftShards(params: {
  userId: string;
  amount: number;
  requestId: string;
  reason: string;
}): { ok: true; balance: number; idempotentReplay?: boolean } | { ok: false; error: string } {
  if (!Number.isInteger(params.amount) || params.amount < 1) {
    return { ok: false, error: "invalid_amount" };
  }
  if (store().requestIds.has(params.requestId)) {
    return { ok: true, balance: getRiftShardBalance(params.userId), idempotentReplay: true };
  }
  const prev = getRiftShardBalance(params.userId);
  if (prev < params.amount) return { ok: false, error: "insufficient_shards" };
  const balance = prev - params.amount;
  store().accounts.set(params.userId, { balance, updatedAt: new Date().toISOString() });
  store().requestIds.add(params.requestId);
  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "CURRENCY_DEBIT",
    currency: CURRENCY.RIFT_SHARDS,
    amount: params.amount,
    requestId: params.requestId,
    metadata: { reason: params.reason },
  });
  return { ok: true, balance };
}
