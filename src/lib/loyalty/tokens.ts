/**
 * Non-transferable Loyalty Tokens — cosmetics shop currency only.
 * Never convertible to SOL; never grants gameplay power.
 */

import {
  appendTokenLedger,
  getTokenAccount,
  hasClaimKey,
  markClaimKey,
  saveTokenAccount,
} from "@/lib/loyalty/store";
import type { LoyaltyTokenAccount, LoyaltyTokenLedgerEntry } from "@/lib/loyalty/types";

export type TokenMutationResult =
  | { ok: true; account: LoyaltyTokenAccount; entry: LoyaltyTokenLedgerEntry; idempotentReplay?: boolean }
  | { ok: false; error: "insufficient" | "invalid" | "duplicate"; message: string; account?: LoyaltyTokenAccount };

export function creditLoyaltyTokens(params: {
  userId: string;
  amount: number;
  reason: string;
  requestId: string;
  metadata?: Record<string, unknown>;
}): TokenMutationResult {
  const amount = Math.floor(params.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "invalid", message: "Loyalty token credit must be a positive integer." };
  }
  if (hasClaimKey(`lt:${params.requestId}`)) {
    const account = getTokenAccount(params.userId);
    return {
      ok: true,
      account,
      entry: {
        id: `lt_replay_${params.requestId}`,
        userId: params.userId,
        delta: amount,
        balanceAfter: account.balance,
        reason: params.reason,
        requestId: params.requestId,
        at: new Date().toISOString(),
        metadata: { ...params.metadata, idempotentReplay: true },
      },
      idempotentReplay: true,
    };
  }

  const account = getTokenAccount(params.userId);
  const next: LoyaltyTokenAccount = {
    ...account,
    balance: account.balance + amount,
    lifetimeEarned: account.lifetimeEarned + amount,
    version: account.version + 1,
  };
  const entry: LoyaltyTokenLedgerEntry = {
    id: `lt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: params.userId,
    delta: amount,
    balanceAfter: next.balance,
    reason: params.reason,
    requestId: params.requestId,
    at: new Date().toISOString(),
    metadata: params.metadata,
  };
  saveTokenAccount(next);
  appendTokenLedger(entry);
  markClaimKey(`lt:${params.requestId}`);
  return { ok: true, account: next, entry };
}

export function debitLoyaltyTokens(params: {
  userId: string;
  amount: number;
  reason: string;
  requestId: string;
  metadata?: Record<string, unknown>;
}): TokenMutationResult {
  const amount = Math.floor(params.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "invalid", message: "Loyalty token debit must be a positive integer." };
  }
  if (hasClaimKey(`lt:${params.requestId}`)) {
    const account = getTokenAccount(params.userId);
    return {
      ok: true,
      account,
      entry: {
        id: `lt_replay_${params.requestId}`,
        userId: params.userId,
        delta: -amount,
        balanceAfter: account.balance,
        reason: params.reason,
        requestId: params.requestId,
        at: new Date().toISOString(),
        metadata: { ...params.metadata, idempotentReplay: true },
      },
      idempotentReplay: true,
    };
  }

  const account = getTokenAccount(params.userId);
  if (account.balance < amount) {
    return {
      ok: false,
      error: "insufficient",
      message: "Not enough Loyalty Tokens.",
      account,
    };
  }

  const next: LoyaltyTokenAccount = {
    ...account,
    balance: account.balance - amount,
    lifetimeSpent: account.lifetimeSpent + amount,
    version: account.version + 1,
  };
  const entry: LoyaltyTokenLedgerEntry = {
    id: `lt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: params.userId,
    delta: -amount,
    balanceAfter: next.balance,
    reason: params.reason,
    requestId: params.requestId,
    at: new Date().toISOString(),
    metadata: params.metadata,
  };
  saveTokenAccount(next);
  appendTokenLedger(entry);
  markClaimKey(`lt:${params.requestId}`);
  return { ok: true, account: next, entry };
}
