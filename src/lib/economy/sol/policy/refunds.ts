/**
 * Refunds ledger stub — append-only refund / dispute records.
 */

import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";

export type RefundStatus = "REQUESTED" | "REVIEW" | "APPROVED" | "DENIED" | "REFUNDED";

export type RefundRecord = {
  refundId: string;
  orderId: string;
  userId: string;
  amountLamports: string;
  status: RefundStatus;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

type Store = { refunds: Map<string, RefundRecord> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsRefunds?: Store };
  if (!g.__riftwildsRefunds) g.__riftwildsRefunds = { refunds: new Map() };
  return g.__riftwildsRefunds;
}

export function resetRefundsForTests(): void {
  const g = globalThis as unknown as { __riftwildsRefunds?: Store };
  g.__riftwildsRefunds = { refunds: new Map() };
}

export function requestRefund(params: {
  orderId: string;
  userId: string;
  amountLamports: string;
  reason: string;
  requestId: string;
}): RefundRecord {
  const existing = [...store().refunds.values()].find((r) => r.refundId === `ref_${params.requestId}`);
  if (existing) return existing;

  const record: RefundRecord = {
    refundId: `ref_${params.requestId}`,
    orderId: params.orderId,
    userId: params.userId,
    amountLamports: params.amountLamports,
    status: "REQUESTED",
    reason: params.reason.slice(0, 500),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store().refunds.set(record.refundId, record);
  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "REFUND",
    currency: "SOL",
    amount: params.amountLamports,
    requestId: params.requestId,
    metadata: { orderId: params.orderId, status: record.status },
  });
  return record;
}

export function listRefunds(userId?: string): RefundRecord[] {
  const all = [...store().refunds.values()];
  return userId ? all.filter((r) => r.userId === userId) : all;
}
