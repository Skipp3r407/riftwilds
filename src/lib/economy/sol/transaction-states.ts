/**
 * SOL / marketplace settlement state machine.
 * Ownership is never granted from a client success screen alone.
 */

export const SETTLEMENT_STATES = [
  "CREATED",
  "AWAITING_SIGNATURE",
  "SUBMITTED",
  "CONFIRMED",
  "FINALIZED",
  "FAILED",
  "EXPIRED",
  "CANCELED",
  "REFUND_REVIEW",
  "REFUNDED",
  "DISPUTED",
] as const;

export type SettlementState = (typeof SETTLEMENT_STATES)[number];

/** Legal transitions — anything else is rejected. */
export const SETTLEMENT_TRANSITIONS: Record<SettlementState, readonly SettlementState[]> = {
  CREATED: ["AWAITING_SIGNATURE", "CANCELED", "EXPIRED", "FAILED"],
  AWAITING_SIGNATURE: ["SUBMITTED", "CANCELED", "EXPIRED", "FAILED"],
  SUBMITTED: ["CONFIRMED", "FAILED", "EXPIRED", "DISPUTED"],
  CONFIRMED: ["FINALIZED", "FAILED", "DISPUTED", "REFUND_REVIEW"],
  FINALIZED: ["REFUND_REVIEW", "DISPUTED"],
  FAILED: ["REFUND_REVIEW", "CANCELED"],
  EXPIRED: ["REFUND_REVIEW", "CANCELED"],
  CANCELED: [],
  REFUND_REVIEW: ["REFUNDED", "DISPUTED", "FAILED"],
  REFUNDED: ["DISPUTED"],
  DISPUTED: ["REFUND_REVIEW", "REFUNDED", "FAILED"],
};

export function canTransitionSettlement(
  from: SettlementState,
  to: SettlementState,
): boolean {
  return SETTLEMENT_TRANSITIONS[from].includes(to);
}

export type SettlementOrder = {
  orderId: string;
  userId: string;
  state: SettlementState;
  requestId: string;
  lamports: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  /** Set only after server-side chain verification. */
  verifiedTxSignature: string | null;
  note: string;
};

type Store = { orders: Map<string, SettlementOrder> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsSettlementOrders?: Store };
  if (!g.__riftwildsSettlementOrders) g.__riftwildsSettlementOrders = { orders: new Map() };
  return g.__riftwildsSettlementOrders;
}

export function resetSettlementOrdersForTests(): void {
  const g = globalThis as unknown as { __riftwildsSettlementOrders?: Store };
  g.__riftwildsSettlementOrders = { orders: new Map() };
}

export function createSettlementOrder(params: {
  userId: string;
  requestId: string;
  lamports: string;
  purpose: string;
}): SettlementOrder {
  const existing = [...store().orders.values()].find((o) => o.requestId === params.requestId);
  if (existing) return existing;

  const order: SettlementOrder = {
    orderId: `ord_${params.requestId}`,
    userId: params.userId,
    state: "CREATED",
    requestId: params.requestId,
    lamports: params.lamports,
    purpose: params.purpose,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    verifiedTxSignature: null,
    note: "Scaffold only — SOL settlement blocked until flags + escrow review.",
  };
  store().orders.set(order.orderId, order);
  return order;
}

export function transitionSettlementOrder(params: {
  orderId: string;
  to: SettlementState;
  verifiedTxSignature?: string | null;
  note?: string;
}): { ok: true; order: SettlementOrder } | { ok: false; error: string } {
  const order = store().orders.get(params.orderId);
  if (!order) return { ok: false, error: "order_not_found" };
  if (!canTransitionSettlement(order.state, params.to)) {
    return { ok: false, error: `invalid_transition:${order.state}->${params.to}` };
  }
  /** FINALIZED requires server-verified signature — never client claim alone. */
  if (params.to === "FINALIZED" && !params.verifiedTxSignature && !order.verifiedTxSignature) {
    return { ok: false, error: "missing_server_verification" };
  }
  order.state = params.to;
  order.updatedAt = new Date().toISOString();
  if (params.verifiedTxSignature) order.verifiedTxSignature = params.verifiedTxSignature;
  if (params.note) order.note = params.note;
  store().orders.set(order.orderId, order);
  return { ok: true, order };
}

/** Entitlements may grant only when FINALIZED. */
export function mayGrantEntitlement(state: SettlementState): boolean {
  return state === "FINALIZED";
}
