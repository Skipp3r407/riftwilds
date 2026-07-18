/**
 * Immutable EconomyLedger — append-only audit of economy events.
 * Complements Credits CurrencyLedger; never mutates or deletes prior rows.
 */

import { createHash, randomBytes } from "crypto";

export type EconomyLedgerEventType =
  | "CURRENCY_CREDIT"
  | "CURRENCY_DEBIT"
  | "ENTITLEMENT_GRANT"
  | "ENTITLEMENT_REVOKE"
  | "MARKETPLACE_STATE"
  | "SOL_INTENT"
  | "SOL_VERIFY"
  | "PACK_OPEN"
  | "TOURNAMENT_ENTRY"
  | "TOURNAMENT_PAYOUT"
  | "REFUND"
  | "DISPUTE"
  | "ADMIN_ADJUST"
  | "POLICY_BLOCK"
  | "MINT_REQUEST";

export type EconomyLedgerEntry = {
  id: string;
  createdAt: string;
  /** SHA-256 of previous entry id+payload (genesis uses zeros). */
  prevHash: string;
  /** SHA-256 of this entry’s canonical payload. */
  hash: string;
  userId: string | null;
  eventType: EconomyLedgerEventType;
  currency: string | null;
  amount: string | null;
  requestId: string;
  metadata: Record<string, unknown>;
};

type Store = {
  entries: EconomyLedgerEntry[];
  byRequestId: Map<string, EconomyLedgerEntry>;
};

function store(): Store {
  const g = globalThis as unknown as { __riftwildsEconomyLedger?: Store };
  if (!g.__riftwildsEconomyLedger) {
    g.__riftwildsEconomyLedger = { entries: [], byRequestId: new Map() };
  }
  return g.__riftwildsEconomyLedger;
}

function canonicalPayload(parts: {
  id: string;
  createdAt: string;
  prevHash: string;
  userId: string | null;
  eventType: EconomyLedgerEventType;
  currency: string | null;
  amount: string | null;
  requestId: string;
  metadata: Record<string, unknown>;
}): string {
  return JSON.stringify(parts);
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function resetEconomyLedgerForTests(): void {
  const g = globalThis as unknown as { __riftwildsEconomyLedger?: Store };
  g.__riftwildsEconomyLedger = { entries: [], byRequestId: new Map() };
}

/**
 * Append an immutable ledger event.
 * Duplicate requestId returns the existing entry (idempotent) — never mutates it.
 */
export function appendEconomyLedgerEvent(params: {
  userId: string | null;
  eventType: EconomyLedgerEventType;
  currency?: string | null;
  amount?: string | number | bigint | null;
  requestId: string;
  metadata?: Record<string, unknown>;
}): { entry: EconomyLedgerEntry; idempotentReplay: boolean } {
  const s = store();
  const existing = s.byRequestId.get(params.requestId);
  if (existing) {
    return { entry: existing, idempotentReplay: true };
  }

  const prev = s.entries[s.entries.length - 1];
  const prevHash = prev?.hash ?? "0".repeat(64);
  const id = `el_${randomBytes(12).toString("hex")}`;
  const createdAt = new Date().toISOString();
  const amount =
    params.amount === undefined || params.amount === null
      ? null
      : typeof params.amount === "bigint"
        ? params.amount.toString()
        : String(params.amount);
  const metadata = Object.freeze({ ...(params.metadata ?? {}) }) as Record<string, unknown>;

  const hash = sha256(
    canonicalPayload({
      id,
      createdAt,
      prevHash,
      userId: params.userId,
      eventType: params.eventType,
      currency: params.currency ?? null,
      amount,
      requestId: params.requestId,
      metadata,
    }),
  );

  const entry: EconomyLedgerEntry = Object.freeze({
    id,
    createdAt,
    prevHash,
    hash,
    userId: params.userId,
    eventType: params.eventType,
    currency: params.currency ?? null,
    amount,
    requestId: params.requestId,
    metadata,
  });

  s.entries.push(entry);
  s.byRequestId.set(params.requestId, entry);
  return { entry, idempotentReplay: false };
}

/** Rejects any attempt to mutate a stored entry (test + runtime helper). */
export function assertLedgerEntryImmutable(entry: EconomyLedgerEntry): void {
  if (!Object.isFrozen(entry)) {
    throw new Error("EconomyLedger entry must be frozen");
  }
  try {
    (entry as { amount: string | null }).amount = "tampered";
  } catch {
    return;
  }
  // Strict mode may not throw on assignment to frozen object — verify value unchanged.
  if (entry.amount === "tampered") {
    throw new Error("EconomyLedger entry was mutated");
  }
}

export function verifyEconomyLedgerChain(
  entries: EconomyLedgerEntry[] = store().entries,
): { ok: true } | { ok: false; index: number; reason: string } {
  let prevHash = "0".repeat(64);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    if (e.prevHash !== prevHash) {
      return { ok: false, index: i, reason: "prevHash mismatch" };
    }
    const expected = sha256(
      canonicalPayload({
        id: e.id,
        createdAt: e.createdAt,
        prevHash: e.prevHash,
        userId: e.userId,
        eventType: e.eventType,
        currency: e.currency,
        amount: e.amount,
        requestId: e.requestId,
        metadata: e.metadata,
      }),
    );
    if (expected !== e.hash) {
      return { ok: false, index: i, reason: "hash mismatch" };
    }
    prevHash = e.hash;
  }
  return { ok: true };
}

export function listEconomyLedger(limit = 100): EconomyLedgerEntry[] {
  return store().entries.slice(-limit);
}

export function getEconomyLedgerByRequestId(requestId: string): EconomyLedgerEntry | null {
  return store().byRequestId.get(requestId) ?? null;
}
