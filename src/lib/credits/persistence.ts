/**
 * Optional Prisma persistence for Credits.
 * In-memory ledger stays authoritative for rate limits / hot path.
 * When enabled + User exists, softCurrency + CurrencyLedger are synced.
 * Demo users (no User row) stay memory-only — never invent DB users here.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { CREDITS_CURRENCY, type CreditLedgerEntry } from "@/lib/credits/types";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export function isCreditsPrismaEnabled(): boolean {
  if (!isFeatureEnabled("CREDITS_PRISMA_ENABLED")) return false;
  if (process.env.CREDITS_PRISMA_ENABLED === "false") return false;
  if (process.env.CREDITS_PRISMA_ENABLED === "true") return true;
  // Default on when flag is true and DATABASE_URL looks real (not placeholder).
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(url) && !url.includes("USER:PASSWORD") && !url.includes("localhost/dummy");
}

export type PrismaCreditSnapshot = {
  balance: number;
  version: number;
  entry: CreditLedgerEntry | null;
};

/** Lookup idempotent entry across restarts. */
export async function findPrismaLedgerByRequestId(
  requestId: string,
): Promise<CreditLedgerEntry | null> {
  if (!isCreditsPrismaEnabled()) return null;
  try {
    const row = await prisma.currencyLedger.findUnique({ where: { requestId } });
    if (!row) return null;
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      userId: row.userId,
      currency: CREDITS_CURRENCY,
      delta: row.delta,
      balanceAfter: row.balanceAfter,
      reason: row.reason as CreditLedgerEntry["reason"],
      requestId: row.requestId,
      metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    };
  } catch {
    return null;
  }
}

/** Load PlayerProfile.softCurrency when User+profile exist. */
export async function loadPrismaSoftCurrency(
  userId: string,
): Promise<{ balance: number; version: number } | null> {
  if (!isCreditsPrismaEnabled()) return null;
  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { softCurrency: true, version: true },
    });
    if (!profile) return null;
    return { balance: profile.softCurrency, version: profile.version };
  } catch {
    return null;
  }
}

/**
 * Persist a successful memory mutation. No-ops if User missing or Prisma disabled.
 * Returns true when written.
 */
export async function persistCreditEntry(params: {
  userId: string;
  entry: CreditLedgerEntry;
  balance: number;
  accountVersion: number;
}): Promise<boolean> {
  if (!isCreditsPrismaEnabled()) return false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });
    if (!user) return false;

    await prisma.$transaction(async (tx) => {
      await tx.currencyLedger.upsert({
        where: { requestId: params.entry.requestId },
        create: {
          userId: params.userId,
          currency: CREDITS_CURRENCY,
          delta: params.entry.delta,
          balanceAfter: params.entry.balanceAfter,
          reason: params.entry.reason,
          requestId: params.entry.requestId,
          metadata: (params.entry.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
        },
        update: {},
      });

      const profile = await tx.playerProfile.findUnique({ where: { userId: params.userId } });
      if (profile) {
        await tx.playerProfile.update({
          where: { userId: params.userId },
          data: {
            softCurrency: params.balance,
            version: { increment: 1 },
          },
        });
      } else {
        await tx.playerProfile.create({
          data: {
            userId: params.userId,
            softCurrency: params.balance,
            displayName: "Riftkeeper",
          },
        });
      }
    });
    return true;
  } catch {
    // Fail soft — memory ledger already applied; admin can reconcile later.
    return false;
  }
}

/** Best-effort list of recent Prisma ledger rows for authenticated users. */
export async function listPrismaLedgerEntries(
  userId: string,
  limit = 15,
): Promise<CreditLedgerEntry[]> {
  if (!isCreditsPrismaEnabled()) return [];
  try {
    const rows = await prisma.currencyLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      userId: row.userId,
      currency: CREDITS_CURRENCY,
      delta: row.delta,
      balanceAfter: row.balanceAfter,
      reason: row.reason as CreditLedgerEntry["reason"],
      requestId: row.requestId,
      metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    }));
  } catch {
    return [];
  }
}
