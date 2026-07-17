/** SOL accounting — integer lamports only. */

export const LAMPORTS_PER_SOL = 1_000_000_000n;

export function solToLamports(sol: number | string): bigint {
  if (typeof sol === "string") {
    const [whole, frac = ""] = sol.split(".");
    const fracPadded = (frac + "000000000").slice(0, 9);
    return BigInt(whole || "0") * LAMPORTS_PER_SOL + BigInt(fracPadded);
  }
  // Convert via string to avoid float drift for config literals
  return solToLamports(sol.toFixed(9));
}

export function lamportsToSolString(lamports: bigint | number): string {
  const n = typeof lamports === "number" ? BigInt(lamports) : lamports;
  const neg = n < 0n;
  const abs = neg ? -n : n;
  const whole = abs / LAMPORTS_PER_SOL;
  const frac = abs % LAMPORTS_PER_SOL;
  const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
  const body = fracStr ? `${whole}.${fracStr}` : `${whole}`;
  return neg ? `-${body}` : body;
}

export function addLamports(a: bigint, b: bigint): bigint {
  return a + b;
}

export function mulBps(amount: bigint, bps: number): bigint {
  return (amount * BigInt(bps)) / 10_000n;
}

/**
 * Marketplace fee split from sale price (seller + fee buckets = 100%).
 * Prefer `allocateForTransactionType` from `@/lib/revenue` for full policy versions.
 * Remainder after integer % division goes to growth (last residual bucket).
 */
export function splitMarketplaceProceeds(
  priceLamports: bigint,
  split: {
    sellerPercent: number;
    growthPercent: number;
    petRewardPercent: number;
    operationsPercent: number;
    eventsPercent: number;
  },
): {
  seller: bigint;
  growth: bigint;
  petReward: bigint;
  operations: bigint;
  events: bigint;
} {
  const seller = (priceLamports * BigInt(split.sellerPercent)) / 100n;
  const petReward = (priceLamports * BigInt(split.petRewardPercent)) / 100n;
  const operations = (priceLamports * BigInt(split.operationsPercent)) / 100n;
  const events = (priceLamports * BigInt(split.eventsPercent)) / 100n;
  const growth = priceLamports - seller - petReward - operations - events;
  return { seller, growth, petReward, operations, events };
}
