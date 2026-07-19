/**
 * Trade request shell — double-confirm required before any future settlement.
 * No production escrow claimed.
 */

import { randomUUID } from "crypto";

export type TradeRequestStatus =
  | "draft"
  | "awaiting_counterparty"
  | "awaiting_double_confirm"
  | "confirmed"
  | "cancelled"
  | "expired";

export type TradeSideOffer = {
  label: string;
  itemKeys: string[];
  creditsOffer?: number;
};

export type TradeRequest = {
  publicId: string;
  initiatorLabel: string;
  counterpartyLabel: string;
  offer: TradeSideOffer;
  ask: TradeSideOffer;
  status: TradeRequestStatus;
  initiatorConfirmed: boolean;
  counterpartyConfirmed: boolean;
  createdAt: string;
  note: string;
};

const trades = new Map<string, TradeRequest>();

export function createTradeRequest(input: {
  initiatorLabel: string;
  counterpartyLabel: string;
  offer: TradeSideOffer;
  ask: TradeSideOffer;
}): TradeRequest {
  const publicId = `trade_${randomUUID().slice(0, 8)}`;
  const row: TradeRequest = {
    publicId,
    initiatorLabel: input.initiatorLabel,
    counterpartyLabel: input.counterpartyLabel,
    offer: input.offer,
    ask: input.ask,
    status: "awaiting_counterparty",
    initiatorConfirmed: false,
    counterpartyConfirmed: false,
    createdAt: new Date().toISOString(),
    note: "Demo trade shell — settlement and escrow are not live.",
  };
  trades.set(publicId, row);
  return row;
}

export function listTradeRequests(): TradeRequest[] {
  return [...trades.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTradeRequest(publicId: string): TradeRequest | null {
  return trades.get(publicId) ?? null;
}

/**
 * Double-confirm: each side must confirm once. Both true → confirmed (demo only).
 */
export function confirmTradeSide(
  publicId: string,
  side: "initiator" | "counterparty",
): { ok: true; trade: TradeRequest } | { ok: false; reason: string } {
  const trade = trades.get(publicId);
  if (!trade) return { ok: false, reason: "trade_not_found" };
  if (trade.status === "cancelled" || trade.status === "expired") {
    return { ok: false, reason: "trade_closed" };
  }

  if (side === "initiator") trade.initiatorConfirmed = true;
  else trade.counterpartyConfirmed = true;

  if (trade.initiatorConfirmed && trade.counterpartyConfirmed) {
    trade.status = "confirmed";
  } else {
    trade.status = "awaiting_double_confirm";
  }
  trades.set(publicId, trade);
  return { ok: true, trade };
}

export function cancelTradeRequest(publicId: string): boolean {
  const trade = trades.get(publicId);
  if (!trade) return false;
  trade.status = "cancelled";
  trades.set(publicId, trade);
  return true;
}
