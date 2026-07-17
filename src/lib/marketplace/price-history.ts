/**
 * Non-prescriptive price history helpers.
 * NEVER say "This pet is worth X" — only comparable recent ranges.
 */

import { lamportsToSolString } from "@/lib/items/lamports";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";

export type ComparableSale = {
  priceLamports: bigint;
  soldAt: string;
  rarity?: string;
  speciesSlug?: string;
};

export type PriceHistorySnapshot = {
  askingPriceLamports: bigint | null;
  lastSaleLamports: bigint | null;
  avgSimilarRarityLamports: bigint | null;
  avgSpeciesLamports: bigint | null;
  recentSales: { priceLamports: string; soldAt: string; rarity?: string; speciesSlug?: string }[];
  lowestListingLamports: bigint | null;
  similarRange: { lowLamports: bigint; highLamports: bigint } | null;
  /** Safe UI copy — never assigns intrinsic value. */
  summaryLine: string;
  comparisonNotes: string[];
  warnings: string[];
};

function avg(values: bigint[]): bigint | null {
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0n);
  return sum / BigInt(values.length);
}

function range(values: bigint[]): { lowLamports: bigint; highLamports: bigint } | null {
  if (values.length === 0) return null;
  let low = values[0]!;
  let high = values[0]!;
  for (const v of values) {
    if (v < low) low = v;
    if (v > high) high = v;
  }
  return { lowLamports: low, highLamports: high };
}

export function buildPriceHistorySummary(input: {
  askingPriceLamports?: bigint | null;
  lastSaleLamports?: bigint | null;
  similarRaritySales?: ComparableSale[];
  speciesSales?: ComparableSale[];
  recentSales?: ComparableSale[];
  lowestListingLamports?: bigint | null;
  traitNotes?: string[];
}): PriceHistorySnapshot {
  const similar = input.similarRaritySales ?? [];
  const species = input.speciesSales ?? [];
  const recent = input.recentSales ?? similar;
  const similarPrices = similar.map((s) => s.priceLamports);
  const speciesPrices = species.map((s) => s.priceLamports);
  const similarRange = range(similarPrices);
  const avgSimilar = avg(similarPrices);
  const avgSpecies = avg(speciesPrices);

  let summaryLine =
    "Not enough recent comparable sales to summarize a range. Asking prices are set by sellers and are not guaranteed values.";
  if (similarRange) {
    summaryLine = `Similar pets recently sold between ${lamportsToSolString(similarRange.lowLamports)} and ${lamportsToSolString(similarRange.highLamports)} SOL. This is not a valuation of this listing.`;
  }

  const warnings: string[] = [];
  const ask = input.askingPriceLamports ?? null;
  if (ask != null && avgSimilar != null && avgSimilar > 0n) {
    const high = LISTING_RULES.suspiciousPrice.highMultipleOfAvg;
    const low = LISTING_RULES.suspiciousPrice.lowFractionOfAvg;
    if (ask > avgSimilar * BigInt(Math.floor(high))) {
      warnings.push(
        "Asking price is much higher than recent similar sales. Review carefully — this is not a value guarantee either way.",
      );
    }
    if (ask < (avgSimilar * BigInt(Math.round(low * 100))) / 100n) {
      warnings.push(
        "Asking price is much lower than recent similar sales. Possible typo, wash-trade risk, or distressed sale — verify ownership history.",
      );
    }
  }

  const comparisonNotes = [
    ...(input.traitNotes ?? []),
    "Compare rarity, species, abilities, and cosmetics yourself — the marketplace never assigns intrinsic worth.",
  ];

  return {
    askingPriceLamports: ask,
    lastSaleLamports: input.lastSaleLamports ?? null,
    avgSimilarRarityLamports: avgSimilar,
    avgSpeciesLamports: avgSpecies,
    recentSales: recent.slice(0, 12).map((s) => ({
      priceLamports: s.priceLamports.toString(),
      soldAt: s.soldAt,
      rarity: s.rarity,
      speciesSlug: s.speciesSlug,
    })),
    lowestListingLamports: input.lowestListingLamports ?? null,
    similarRange,
    summaryLine,
    comparisonNotes,
    warnings,
  };
}

export function serializePriceHistory(snapshot: PriceHistorySnapshot) {
  return {
    askingPriceSol: snapshot.askingPriceLamports
      ? lamportsToSolString(snapshot.askingPriceLamports)
      : null,
    lastSaleSol: snapshot.lastSaleLamports
      ? lamportsToSolString(snapshot.lastSaleLamports)
      : null,
    avgSimilarRaritySol: snapshot.avgSimilarRarityLamports
      ? lamportsToSolString(snapshot.avgSimilarRarityLamports)
      : null,
    avgSpeciesSol: snapshot.avgSpeciesLamports
      ? lamportsToSolString(snapshot.avgSpeciesLamports)
      : null,
    lowestListingSol: snapshot.lowestListingLamports
      ? lamportsToSolString(snapshot.lowestListingLamports)
      : null,
    similarRangeSol: snapshot.similarRange
      ? {
          low: lamportsToSolString(snapshot.similarRange.lowLamports),
          high: lamportsToSolString(snapshot.similarRange.highLamports),
        }
      : null,
    recentSales: snapshot.recentSales.map((s) => ({
      ...s,
      priceSol: lamportsToSolString(BigInt(s.priceLamports)),
    })),
    summaryLine: snapshot.summaryLine,
    comparisonNotes: snapshot.comparisonNotes,
    warnings: snapshot.warnings,
    forbiddenLanguage: ["This pet is worth", "guaranteed value", "will sell for"],
  };
}
