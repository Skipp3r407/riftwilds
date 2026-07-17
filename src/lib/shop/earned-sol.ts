/**
 * In-game / earned SOL — playable balance for shop purchases.
 * Not wallet SOL. Persisted client-side until a server ledger exists.
 */

import { lamportsToSolString, solToLamports } from "@/lib/items/lamports";

export const EARNED_SOL_STORAGE_KEY = "riftwilds-earned-sol-v1";

/** Starter playable balance so keepers can buy common shop items. */
export const EARNED_SOL_STARTER_LAMPORTS = solToLamports("0.25");

export type EarnedSolState = {
  lamports: string;
  updatedAt: string;
};

export function createStarterEarnedSolState(
  now = new Date().toISOString(),
): EarnedSolState {
  return {
    lamports: EARNED_SOL_STARTER_LAMPORTS.toString(),
    updatedAt: now,
  };
}

export function parseEarnedSolLamports(raw: string | null | undefined): bigint {
  if (!raw) return EARNED_SOL_STARTER_LAMPORTS;
  try {
    const parsed = JSON.parse(raw) as Partial<EarnedSolState>;
    if (typeof parsed.lamports === "string" && /^-?\d+$/.test(parsed.lamports)) {
      const n = BigInt(parsed.lamports);
      return n < 0n ? 0n : n;
    }
  } catch {
    /* fall through */
  }
  if (/^\d+$/.test(raw)) {
    return BigInt(raw);
  }
  return EARNED_SOL_STARTER_LAMPORTS;
}

export function serializeEarnedSolState(lamports: bigint, now = new Date().toISOString()): string {
  const safe = lamports < 0n ? 0n : lamports;
  const state: EarnedSolState = { lamports: safe.toString(), updatedAt: now };
  return JSON.stringify(state);
}

export function formatEarnedSol(lamports: bigint): string {
  return lamportsToSolString(lamports);
}

export function canAffordEarnedSol(balanceLamports: bigint, priceLamports: bigint): boolean {
  return balanceLamports >= priceLamports && priceLamports >= 0n;
}

export function debitEarnedSol(
  balanceLamports: bigint,
  priceLamports: bigint,
): { ok: true; next: bigint } | { ok: false; reason: "insufficient_earned_sol" } {
  if (!canAffordEarnedSol(balanceLamports, priceLamports)) {
    return { ok: false, reason: "insufficient_earned_sol" };
  }
  return { ok: true, next: balanceLamports - priceLamports };
}

/** Demo play reward — small earned SOL credit for local testing. */
export const PLAY_REWARD_LAMPORTS = solToLamports("0.02");

export function creditEarnedSol(balanceLamports: bigint, amountLamports: bigint): bigint {
  if (amountLamports <= 0n) return balanceLamports < 0n ? 0n : balanceLamports;
  return (balanceLamports < 0n ? 0n : balanceLamports) + amountLamports;
}
