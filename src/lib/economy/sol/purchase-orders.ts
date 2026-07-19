/**
 * SOL purchase order + prepare/verify simulation.
 * Production settlement stays blocked while SOL_* flags are false.
 * Soft/devnet simulation can finalize with a synthetic signature for local tests only.
 */

import { SOL_ECONOMY_SEED_CATALOG, type CatalogItem } from "@/lib/economy/sol/catalog";
import { grantEntitlement, type Entitlement } from "@/lib/economy/sol/entitlements";
import { grantCollectibleEdition } from "@/lib/economy/sol/collectible-editions";
import { isSolPurchaseLive } from "@/lib/economy/sol/flags";
import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";
import { checkSpendingLimits } from "@/lib/economy/sol/policy/spending-limits";
import {
  createSettlementOrder,
  mayGrantEntitlement,
  transitionSettlementOrder,
  type SettlementOrder,
  type SettlementState,
} from "@/lib/economy/sol/transaction-states";
import { getSolEconomyNetwork } from "@/lib/economy/sol/wallet-challenge";
import { solToLamports } from "@/lib/items/lamports";

export type PurchaseOrderMode = "SOFT_SIMULATION" | "PRODUCTION_BLOCKED" | "LIVE_PENDING";

export type PurchaseOrder = {
  orderId: string;
  userId: string;
  sku: string;
  requestId: string;
  priceLamports: string;
  currency: "SOL";
  state: SettlementState;
  mode: PurchaseOrderMode;
  network: "devnet" | "localnet";
  expiresAt: string;
  preparedPayload: {
    destinationLabel: string;
    lamports: string;
    memo: string;
    note: string;
  } | null;
  verifiedTxSignature: string | null;
  entitlementId: string | null;
  createdAt: string;
  updatedAt: string;
  note: string;
};

type Store = {
  byRequestId: Map<string, PurchaseOrder>;
  byOrderId: Map<string, PurchaseOrder>;
};

function store(): Store {
  const g = globalThis as unknown as { __riftwildsSolPurchaseOrders?: Store };
  if (!g.__riftwildsSolPurchaseOrders) {
    g.__riftwildsSolPurchaseOrders = {
      byRequestId: new Map(),
      byOrderId: new Map(),
    };
  }
  return g.__riftwildsSolPurchaseOrders;
}

export function resetPurchaseOrdersForTests(): void {
  const g = globalThis as unknown as { __riftwildsSolPurchaseOrders?: Store };
  g.__riftwildsSolPurchaseOrders = {
    byRequestId: new Map(),
    byOrderId: new Map(),
  };
}

const ORDER_TTL_MS = 15 * 60 * 1000;

function catalogItem(sku: string): CatalogItem | undefined {
  return SOL_ECONOMY_SEED_CATALOG.find((i) => i.sku === sku && i.active);
}

function resolveSolLamports(item: CatalogItem): bigint | null {
  const price = item.prices.SOL;
  if (price == null || price === "" || price === 0) return null;
  try {
    return solToLamports(String(price));
  } catch {
    return null;
  }
}

function persist(order: PurchaseOrder): PurchaseOrder {
  store().byOrderId.set(order.orderId, order);
  store().byRequestId.set(order.requestId, order);
  return order;
}

/**
 * Create an expiring purchase order. Idempotent on requestId.
 * Soft simulation is always available; live production stays blocked by flags.
 */
export function createPurchaseOrder(params: {
  userId: string;
  sku: string;
  requestId: string;
  spentTodayLamports?: bigint;
  spentWeekLamports?: bigint;
}):
  | { ok: true; order: PurchaseOrder; settlement: SettlementOrder; idempotentReplay: boolean }
  | { ok: false; error: string; message: string } {
  const existing = store().byRequestId.get(params.requestId);
  if (existing) {
    const settlement = createSettlementOrder({
      userId: existing.userId,
      requestId: existing.requestId,
      lamports: existing.priceLamports,
      purpose: `purchase:${existing.sku}`,
    });
    return { ok: true, order: existing, settlement, idempotentReplay: true };
  }

  const item = catalogItem(params.sku);
  if (!item) {
    return { ok: false, error: "unknown_sku", message: "Catalog SKU not found or inactive" };
  }
  const lamports = resolveSolLamports(item);
  if (lamports == null) {
    return { ok: false, error: "not_sol_sku", message: "SKU has no SOL price" };
  }

  const spend = checkSpendingLimits({
    amountLamports: lamports,
    spentTodayLamports: params.spentTodayLamports ?? 0n,
    spentWeekLamports: params.spentWeekLamports ?? 0n,
  });
  if (!spend.allowed) {
    return { ok: false, error: spend.code, message: spend.reason };
  }

  const live = isSolPurchaseLive();
  const mode: PurchaseOrderMode = live ? "LIVE_PENDING" : "SOFT_SIMULATION";
  const now = new Date();
  const settlement = createSettlementOrder({
    userId: params.userId,
    requestId: params.requestId,
    lamports: lamports.toString(),
    purpose: `purchase:${params.sku}`,
  });

  const order: PurchaseOrder = {
    orderId: `po_${params.requestId}`,
    userId: params.userId,
    sku: params.sku,
    requestId: params.requestId,
    priceLamports: lamports.toString(),
    currency: "SOL",
    state: settlement.state,
    mode,
    network: getSolEconomyNetwork(),
    expiresAt: new Date(now.getTime() + ORDER_TTL_MS).toISOString(),
    preparedPayload: null,
    verifiedTxSignature: null,
    entitlementId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    note: live
      ? "Flags allow purchases but chain escrow is not wired — use soft simulation only."
      : "Soft/devnet simulation only. Production SOL purchases remain disabled (SOL_PURCHASES_ENABLED / SOL_WALLET_ENABLED=false).",
  };

  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "SOL_INTENT",
    currency: "SOL",
    amount: lamports,
    requestId: `po_create:${params.requestId}`,
    metadata: { sku: params.sku, mode, orderId: order.orderId },
  });

  return { ok: true, order: persist(order), settlement, idempotentReplay: false };
}

export function preparePurchaseOrder(params: {
  orderId: string;
  now?: Date;
}):
  | { ok: true; order: PurchaseOrder; settlement: SettlementOrder }
  | { ok: false; error: string; message: string } {
  const order = store().byOrderId.get(params.orderId);
  if (!order) return { ok: false, error: "order_not_found", message: "Purchase order not found" };

  const now = params.now ?? new Date();
  if (now.getTime() > new Date(order.expiresAt).getTime()) {
    order.state = "EXPIRED";
    order.updatedAt = now.toISOString();
    order.note = "Order expired before prepare.";
    persist(order);
    return { ok: false, error: "expired", message: "Purchase order expired" };
  }

  if (order.mode === "LIVE_PENDING" && !isSolPurchaseLive()) {
    order.mode = "PRODUCTION_BLOCKED";
    order.note = "Production SOL prepare blocked — flags off.";
    persist(order);
    return {
      ok: false,
      error: "production_blocked",
      message: "Live SOL prepare disabled. Soft simulation remains available via simulateVerify.",
    };
  }

  order.preparedPayload = {
    destinationLabel: "TREASURY_COMING_SOON_DEVNET",
    lamports: order.priceLamports,
    memo: `riftwilds:purchase:${order.sku}:${order.requestId}`,
    note:
      order.mode === "SOFT_SIMULATION"
        ? "Simulated prepare — no wallet broadcast. Review amounts, then call soft verify."
        : "Prepared for wallet review — do not broadcast until audited escrow is live.",
  };

  const awaitSig = transitionSettlementOrder({
    orderId: `ord_${order.requestId}`,
    to: "AWAITING_SIGNATURE",
    note: "Prepared for signature (simulation-safe).",
  });
  if (!awaitSig.ok && order.state === "CREATED") {
    // Settlement may already have progressed on idempotent replay
  }

  order.state = awaitSig.ok ? awaitSig.order.state : order.state === "CREATED" ? "AWAITING_SIGNATURE" : order.state;
  order.updatedAt = now.toISOString();
  persist(order);

  const settlement = createSettlementOrder({
    userId: order.userId,
    requestId: order.requestId,
    lamports: order.priceLamports,
    purpose: `purchase:${order.sku}`,
  });

  return { ok: true, order, settlement };
}

/**
 * Soft/devnet verify — advances settlement with a synthetic signature and grants once.
 * Never broadcasts chain txs. Refuses if order expired. Idempotent entitlement grant.
 */
export function verifyPurchaseSimulation(params: {
  orderId: string;
  /** Optional client-reported sig — ignored for authority; server mints sim sig. */
  clientTxSignature?: string;
  now?: Date;
}):
  | {
      ok: true;
      order: PurchaseOrder;
      entitlement: Entitlement | null;
      idempotentReplay: boolean;
      simulated: true;
    }
  | { ok: false; error: string; message: string } {
  const order = store().byOrderId.get(params.orderId);
  if (!order) return { ok: false, error: "order_not_found", message: "Purchase order not found" };

  const now = params.now ?? new Date();
  if (now.getTime() > new Date(order.expiresAt).getTime() && order.state !== "FINALIZED") {
    order.state = "EXPIRED";
    order.updatedAt = now.toISOString();
    persist(order);
    return { ok: false, error: "expired", message: "Purchase order expired" };
  }

  if (order.state === "FINALIZED" && order.entitlementId) {
    return {
      ok: true,
      order,
      entitlement: null,
      idempotentReplay: true,
      simulated: true,
    };
  }

  if (isSolPurchaseLive()) {
    return {
      ok: false,
      error: "live_verify_not_implemented",
      message:
        "Flags on but chain verify is not implemented — refusing live settlement. Keep soft simulation for tests.",
    };
  }

  if (!order.preparedPayload) {
    const prepared = preparePurchaseOrder({ orderId: order.orderId, now });
    if (!prepared.ok) return prepared;
  }

  const simSig = `sim_devnet_${order.requestId}`;
  const settlement = createSettlementOrder({
    userId: order.userId,
    requestId: order.requestId,
    lamports: order.priceLamports,
    purpose: `purchase:${order.sku}`,
  });

  const advance = (to: SettlementState, withSig = false) => {
    if (mayGrantEntitlement(settlement.state) || settlement.state === to) return { ok: true as const };
    return transitionSettlementOrder({
      orderId: settlement.orderId,
      to,
      verifiedTxSignature: withSig ? simSig : undefined,
      note: `Soft simulation → ${to}`,
    });
  };

  for (const step of [
    { to: "AWAITING_SIGNATURE" as const, sig: false },
    { to: "SUBMITTED" as const, sig: false },
    { to: "CONFIRMED" as const, sig: true },
    { to: "FINALIZED" as const, sig: true },
  ]) {
    const current = createSettlementOrder({
      userId: order.userId,
      requestId: order.requestId,
      lamports: order.priceLamports,
      purpose: `purchase:${order.sku}`,
    });
    if (mayGrantEntitlement(current.state)) break;
    if (current.state === step.to) continue;
    const next = advance(step.to, step.sig);
    if (!next.ok) {
      return { ok: false, error: next.error, message: `Simulation transition failed: ${next.error}` };
    }
  }

  const final = createSettlementOrder({
    userId: order.userId,
    requestId: order.requestId,
    lamports: order.priceLamports,
    purpose: `purchase:${order.sku}`,
  });
  if (!mayGrantEntitlement(final.state)) {
    return {
      ok: false,
      error: `settlement_${final.state}`,
      message: "Could not finalize simulated order",
    };
  }

  const item = catalogItem(order.sku);
  const kind =
    item?.kind === "COLLECTIBLE_EDITION"
      ? "COLLECTIBLE_EDITION"
      : item?.kind === "PREMIUM_COLLECTOR_PACK" || item?.kind === "STANDARD_PACK"
        ? "PACK_OPEN_RESULT"
        : "COSMETIC";

  let entitlement: Entitlement | null = null;
  let idempotentReplay = false;

  if (kind === "COLLECTIBLE_EDITION" && item?.gameplayCardId) {
    const editionId = `ce-${item.gameplayCardId}-alt`;
    const owned = grantCollectibleEdition({
      userId: order.userId,
      editionId,
      requestId: `ent_po_${order.requestId}`,
    });
    if (!owned.ok) {
      return { ok: false, error: owned.error, message: "Collectible grant failed" };
    }
    // grantCollectibleEdition already wrote an entitlement under the same requestId.
    const grant = grantEntitlement({
      userId: order.userId,
      kind: "COLLECTIBLE_EDITION",
      assetKey: editionId,
      gameplayCardId: item.gameplayCardId,
      requestId: `ent_po_${order.requestId}`,
      source: "sol_purchase_simulation",
      settlementState: "FINALIZED",
    });
    if (grant.ok) {
      entitlement = grant.entitlement;
      idempotentReplay = grant.idempotentReplay;
    }
  } else {
    const grant = grantEntitlement({
      userId: order.userId,
      kind,
      assetKey: order.sku,
      gameplayCardId: item?.gameplayCardId ?? null,
      requestId: `ent_po_${order.requestId}`,
      source: "sol_purchase_simulation",
      settlementState: "FINALIZED",
      metadata: { simulated: true, network: order.network },
    });
    if (!grant.ok) {
      return { ok: false, error: grant.error, message: "Entitlement grant failed" };
    }
    entitlement = grant.entitlement;
    idempotentReplay = grant.idempotentReplay;
  }

  order.state = "FINALIZED";
  order.verifiedTxSignature = simSig;
  order.entitlementId = entitlement?.id ?? order.entitlementId;
  order.updatedAt = now.toISOString();
  order.note = "Soft/devnet simulation finalized. No real SOL moved. Production remains disabled.";
  persist(order);

  appendEconomyLedgerEvent({
    userId: order.userId,
    eventType: "SOL_VERIFY",
    currency: "SOL",
    amount: BigInt(order.priceLamports),
    requestId: `po_verify:${order.requestId}`,
    metadata: {
      orderId: order.orderId,
      simulated: true,
      signature: simSig,
      clientTxIgnored: Boolean(params.clientTxSignature),
    },
  });

  return { ok: true, order, entitlement, idempotentReplay, simulated: true };
}

export function getPurchaseOrder(orderId: string): PurchaseOrder | null {
  return store().byOrderId.get(orderId) ?? null;
}

export function listPurchaseOrders(userId: string): PurchaseOrder[] {
  return [...store().byOrderId.values()]
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
