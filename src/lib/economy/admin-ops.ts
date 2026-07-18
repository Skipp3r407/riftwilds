/**
 * Phase 16 — Administration economy ops (audited grants / freeze).
 */

import { settleCredit, settleDebit } from "@/lib/economy/core/settlement";
import { getEconomyHealth } from "@/lib/credits/ledger";

type FreezeState = {
  marketplaceFrozen: boolean;
  shopFrozen: boolean;
  reason: string | null;
  updatedAt: string | null;
};

type AuditRow = {
  at: string;
  adminId: string;
  action: string;
  reason: string;
  metadata?: Record<string, unknown>;
};

type Store = { freeze: FreezeState; audit: AuditRow[] };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsEconomyAdmin?: Store };
  if (!g.__riftwildsEconomyAdmin) {
    g.__riftwildsEconomyAdmin = {
      freeze: {
        marketplaceFrozen: false,
        shopFrozen: false,
        reason: null,
        updatedAt: null,
      },
      audit: [],
    };
  }
  return g.__riftwildsEconomyAdmin;
}

function audit(adminId: string, action: string, reason: string, metadata?: Record<string, unknown>) {
  store().audit.unshift({
    at: new Date().toISOString(),
    adminId,
    action,
    reason,
    metadata,
  });
  if (store().audit.length > 500) store().audit.length = 500;
}

export function getEconomyAdminSnapshot() {
  return {
    health: getEconomyHealth(),
    freeze: store().freeze,
    recentAudit: store().audit.slice(0, 40),
  };
}

export function setEconomyFreeze(params: {
  adminId: string;
  marketplaceFrozen?: boolean;
  shopFrozen?: boolean;
  reason: string;
}): FreezeState {
  const f = store().freeze;
  if (typeof params.marketplaceFrozen === "boolean") f.marketplaceFrozen = params.marketplaceFrozen;
  if (typeof params.shopFrozen === "boolean") f.shopFrozen = params.shopFrozen;
  f.reason = params.reason.slice(0, 240);
  f.updatedAt = new Date().toISOString();
  audit(params.adminId, "FREEZE_UPDATE", params.reason, {
    marketplaceFrozen: f.marketplaceFrozen,
    shopFrozen: f.shopFrozen,
  });
  return { ...f };
}

export function isMarketplaceFrozen(): boolean {
  return store().freeze.marketplaceFrozen;
}

export function isShopFrozen(): boolean {
  return store().freeze.shopFrozen;
}

export function adminGrantCredits(params: {
  adminId: string;
  userId: string;
  amount: number;
  reason: string;
  requestId: string;
}): { ok: true; balance?: number } | { ok: false; message: string } {
  if (!params.reason || params.reason.length < 8) {
    return { ok: false, message: "Admin grant requires a reason (≥8 chars)" };
  }
  const r = settleCredit({
    userId: params.userId,
    amount: params.amount,
    reason: "ADMIN_ADJUST",
    requestId: params.requestId,
    metadata: { adminId: params.adminId, reason: params.reason },
  });
  if (!r.ok) return { ok: false, message: r.message };
  audit(params.adminId, "GRANT_CREDITS", params.reason, {
    userId: params.userId,
    amount: params.amount,
  });
  return { ok: true, balance: r.balance };
}

export function adminRevokeCredits(params: {
  adminId: string;
  userId: string;
  amount: number;
  reason: string;
  requestId: string;
}): { ok: true; balance?: number } | { ok: false; message: string } {
  if (!params.reason || params.reason.length < 8) {
    return { ok: false, message: "Admin revoke requires a reason (≥8 chars)" };
  }
  const r = settleDebit({
    userId: params.userId,
    amount: params.amount,
    reason: "ADMIN_ADJUST",
    requestId: params.requestId,
    metadata: { adminId: params.adminId, reason: params.reason },
  });
  if (!r.ok) return { ok: false, message: r.message };
  audit(params.adminId, "REVOKE_CREDITS", params.reason, {
    userId: params.userId,
    amount: params.amount,
  });
  return { ok: true, balance: r.balance };
}
