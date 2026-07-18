/**
 * Idempotent entitlement grants — gameplay copies vs cosmetic collectibles.
 */

import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";
import { mayGrantEntitlement, type SettlementState } from "@/lib/economy/sol/transaction-states";

export type EntitlementKind =
  | "GAMEPLAY_CARD_COPY"
  | "COLLECTIBLE_EDITION"
  | "COSMETIC"
  | "PACK_OPEN_RESULT"
  | "TITLE"
  | "SEASON_PASS_TRACK";

export type Entitlement = {
  id: string;
  userId: string;
  kind: EntitlementKind;
  assetKey: string;
  /** TCG gameplay card id when kind is GAMEPLAY_CARD_COPY or linked edition. */
  gameplayCardId: string | null;
  requestId: string;
  grantedAt: string;
  source: string;
  metadata: Record<string, unknown>;
};

type Store = {
  byUser: Map<string, Entitlement[]>;
  byRequestId: Map<string, Entitlement>;
};

function store(): Store {
  const g = globalThis as unknown as { __riftwildsEntitlements?: Store };
  if (!g.__riftwildsEntitlements) {
    g.__riftwildsEntitlements = { byUser: new Map(), byRequestId: new Map() };
  }
  return g.__riftwildsEntitlements;
}

export function resetEntitlementsForTests(): void {
  const g = globalThis as unknown as { __riftwildsEntitlements?: Store };
  g.__riftwildsEntitlements = { byUser: new Map(), byRequestId: new Map() };
}

export function grantEntitlement(params: {
  userId: string;
  kind: EntitlementKind;
  assetKey: string;
  requestId: string;
  source: string;
  gameplayCardId?: string | null;
  metadata?: Record<string, unknown>;
  /** When granting from SOL order — must be FINALIZED. */
  settlementState?: SettlementState;
}): { ok: true; entitlement: Entitlement; idempotentReplay: boolean } | { ok: false; error: string } {
  if (params.settlementState !== undefined && !mayGrantEntitlement(params.settlementState)) {
    return { ok: false, error: "settlement_not_finalized" };
  }
  const existing = store().byRequestId.get(params.requestId);
  if (existing) {
    return { ok: true, entitlement: existing, idempotentReplay: true };
  }

  const entitlement: Entitlement = Object.freeze({
    id: `ent_${params.requestId}`,
    userId: params.userId,
    kind: params.kind,
    assetKey: params.assetKey,
    gameplayCardId: params.gameplayCardId ?? null,
    requestId: params.requestId,
    grantedAt: new Date().toISOString(),
    source: params.source,
    metadata: Object.freeze({ ...(params.metadata ?? {}) }) as Record<string, unknown>,
  });

  const list = store().byUser.get(params.userId) ?? [];
  list.push(entitlement);
  store().byUser.set(params.userId, list);
  store().byRequestId.set(params.requestId, entitlement);

  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "ENTITLEMENT_GRANT",
    requestId: `ledger:${params.requestId}`,
    metadata: {
      kind: params.kind,
      assetKey: params.assetKey,
      gameplayCardId: params.gameplayCardId ?? null,
      source: params.source,
    },
  });

  return { ok: true, entitlement, idempotentReplay: false };
}

export function listEntitlements(userId: string): Entitlement[] {
  return [...(store().byUser.get(userId) ?? [])];
}
