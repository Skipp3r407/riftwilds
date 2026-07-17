import type {
  AllocationLine,
  AllocationResult,
  LedgerEntryDraft,
  RevenueAllocationPolicy,
  RevenueTransactionType,
} from "@/lib/revenue/types";
import { getActivePolicy } from "@/lib/revenue/policies";

const TOTAL_BPS = 10_000n;

/**
 * Split gross lamports by policy BPS using integer division.
 * Remainder lamports go to policy.remainderDestination (default Growth).
 * Invariant: sum(allocated) === gross.
 */
export function allocateRevenue(
  grossLamports: bigint,
  policy: RevenueAllocationPolicy,
): AllocationResult {
  if (grossLamports < 0n) {
    throw new Error("Gross amount cannot be negative");
  }

  const lines: AllocationLine[] = policy.entries
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((entry) => {
      const calculated = (grossLamports * BigInt(entry.basisPoints)) / TOTAL_BPS;
      return {
        destination: entry.destination,
        label: entry.label,
        basisPoints: entry.basisPoints,
        calculatedAmountLamports: calculated,
        roundingAdjustmentLamports: 0n,
        allocatedAmountLamports: calculated,
        color: entry.color,
      };
    });

  const sumFloor = lines.reduce((s, l) => s + l.allocatedAmountLamports, 0n);
  const remainder = grossLamports - sumFloor;

  if (remainder > 0n) {
    const target =
      lines.find((l) => l.destination === policy.remainderDestination) ?? lines[0];
    if (!target) {
      throw new Error("No allocation destinations");
    }
    target.roundingAdjustmentLamports += remainder;
    target.allocatedAmountLamports += remainder;
  }

  const total = lines.reduce((s, l) => s + l.allocatedAmountLamports, 0n);
  if (total !== grossLamports) {
    throw new Error(`Allocation invariant failed: ${total} !== ${grossLamports}`);
  }

  return {
    policyId: policy.id,
    policyVersion: policy.version,
    transactionType: policy.transactionType,
    grossLamports,
    lines,
    remainderLamports: remainder,
    remainderDestination: policy.remainderDestination,
  };
}

export function allocateForTransactionType(
  grossLamports: bigint,
  transactionType: RevenueTransactionType,
): AllocationResult {
  return allocateRevenue(grossLamports, getActivePolicy(transactionType));
}

/** Immutable ledger drafts for a verified payment (Phase 1 — record only). */
export function buildLedgerEntries(params: {
  result: AllocationResult;
  assetMint: string;
  network: string;
}): LedgerEntryDraft[] {
  return params.result.lines.map((line) => ({
    policyVersion: params.result.policyVersion,
    transactionType: params.result.transactionType,
    destination: line.destination,
    rawGrossAmountLamports: params.result.grossLamports.toString(),
    basisPoints: line.basisPoints,
    allocatedAmountLamports: line.allocatedAmountLamports.toString(),
    roundingAdjustmentLamports: line.roundingAdjustmentLamports.toString(),
    assetMint: params.assetMint,
    network: params.network,
    status: "RECORDED" as const,
  }));
}

/** JSON-safe serialization for APIs / UI. */
export function serializeAllocation(result: AllocationResult) {
  return {
    policyId: result.policyId,
    policyVersion: result.policyVersion,
    transactionType: result.transactionType,
    grossLamports: result.grossLamports.toString(),
    remainderLamports: result.remainderLamports.toString(),
    remainderDestination: result.remainderDestination,
    lines: result.lines.map((l) => ({
      destination: l.destination,
      label: l.label,
      basisPoints: l.basisPoints,
      percent: l.basisPoints / 100,
      calculatedAmountLamports: l.calculatedAmountLamports.toString(),
      roundingAdjustmentLamports: l.roundingAdjustmentLamports.toString(),
      allocatedAmountLamports: l.allocatedAmountLamports.toString(),
      color: l.color,
    })),
  };
}
