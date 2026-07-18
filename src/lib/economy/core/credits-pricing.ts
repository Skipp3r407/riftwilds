/**
 * Convert disclosed SOL catalog prices to integer Credits for play checkout.
 * SOL display may remain for optional wallet path; Credits are the play path.
 */

/** Lamports per SOL. */
const LAMPORTS_PER_SOL = 1_000_000_000n;

/** How many Credits equal 0.001 SOL of catalog price (tunable). */
export const CREDITS_PER_MILLI_SOL = 10;

/**
 * Map item lamports → Credits. Minimum 1 Credit for any positive price.
 * Uses milli-SOL buckets so common items stay affordable vs starter 200 Credits.
 */
export function lamportsToCreditsPrice(lamports: bigint): number {
  if (lamports <= 0n) return 0;
  const milliSol = Number((lamports * 1000n) / LAMPORTS_PER_SOL);
  const credits = Math.max(1, Math.round(milliSol * CREDITS_PER_MILLI_SOL));
  return credits;
}

export function quoteCreditsPrice(params: {
  itemId: string;
  priceLamports: bigint;
}): { itemId: string; priceCredits: number; priceLamports: string } {
  return {
    itemId: params.itemId,
    priceCredits: lamportsToCreditsPrice(params.priceLamports),
    priceLamports: params.priceLamports.toString(),
  };
}
