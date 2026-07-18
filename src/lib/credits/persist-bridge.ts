/**
 * Bridge between in-memory Credits ledger and optional Prisma persistence.
 */

import {
  findPrismaLedgerByRequestId,
  loadPrismaSoftCurrency,
  persistCreditEntry,
  isCreditsPrismaEnabled,
} from "@/lib/credits/persistence";
import {
  getCreditAccount,
  getCreditBalance,
  listLedgerEntries,
  seedCreditAccountBalance,
} from "@/lib/credits/ledger";
import type { CreditLedgerEntry } from "@/lib/credits/types";

export { findPrismaLedgerByRequestId, persistCreditEntry, isCreditsPrismaEnabled };

/**
 * If memory balance is empty/new and Prisma has softCurrency, seed memory once.
 */
export async function hydrateMemoryFromPrisma(userId: string): Promise<void> {
  if (!isCreditsPrismaEnabled()) return;
  const acc = getCreditAccount(userId);
  // Only hydrate empty accounts that have never been touched locally this process.
  if (acc.balance > 0 || acc.version > 0) return;
  const db = await loadPrismaSoftCurrency(userId);
  if (!db) return;
  seedCreditAccountBalance(userId, db.balance, db.version);
}

/** Persist the most recent matching memory entry after a successful action. */
export async function persistRecentCreditMutation(
  userId: string,
  requestId?: string,
): Promise<boolean> {
  const entries = listLedgerEntries(userId, { limit: 8 });
  const entry: CreditLedgerEntry | undefined = requestId
    ? entries.find((e) => e.requestId === requestId) ?? entries[0]
    : entries[0];
  if (!entry) return false;
  const account = getCreditAccount(userId);
  return persistCreditEntry({
    userId,
    entry,
    balance: getCreditBalance(userId),
    accountVersion: account.version,
  });
}
