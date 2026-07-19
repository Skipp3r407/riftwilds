/**
 * Live analytics shapes for /token — charts, metrics, burn ledger, calculator.
 * Until mint + indexers land: honest empties + clearly labeled placeholders.
 * Plug real feeds via env mint + future indexer fetch stubs below.
 */

import { getPumpfunPublicConfig } from "@/lib/community/pumpfun-config";
import type { TokenMarketMetrics } from "@/lib/community/metrics";
import { projectConfig } from "@/lib/config/project";

export type ChartPoint = { t: string; v: number };

export type CandlePoint = {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  vol?: number;
};

export type BurnHistoryRow = {
  id: string;
  dateLabel: string;
  tokensBurnedLabel: string;
  solSpentLabel: string;
  usdLabel: string;
  priceLabel: string;
  revenuePercentLabel: string;
  isPlaceholder: boolean;
  txSig: string | null;
};

export type TokenLiveMetrics = {
  marketCapUsd: number | null;
  fdvUsd: number | null;
  volume24hUsd: number | null;
  holders: number | null;
  circulating: number | null;
  totalSupply: number | null;
  priceUsd: number | null;
  liquidityUsd: number | null;
};

export type TokenLiveAnalytics = {
  status: "awaiting_mint" | "live" | "partial";
  symbol: string;
  name: string;
  metrics: TokenLiveMetrics;
  metricsNote: string;
  priceChart: {
    available: boolean;
    mode: "embed" | "series" | "awaiting";
    embedUrl: string | null;
    externalUrl: string | null;
    candles: CandlePoint[];
    note: string;
  };
  cumulativeBuyback: {
    isPlaceholder: boolean;
    seriesUsd: ChartPoint[];
    seriesSecondary: ChartPoint[];
    note: string;
  };
  dailyBuyback: {
    isPlaceholder: boolean;
    barsUsd: ChartPoint[];
    latestUsd: number | null;
    note: string;
  };
  revenueAllocation: {
    isPlaceholder: boolean;
    seriesPercent: ChartPoint[];
    targetPercent: number;
    note: string;
  };
  burnHistory: {
    rows: BurnHistoryRow[];
    note: string;
  };
  calculatorDefaults: {
    monthlyRevenueUsd: number;
    assumedMcapUsd: number;
    allocationPercent: number;
  };
  feedHooks: {
    /** Set NEXT_PUBLIC_PUMPFUN_MINT / NEXT_PUBLIC_TOKEN_MINT to unlock Dex scalars + chart embed. */
    mintEnvKeys: string[];
    /** Future: TOKEN_BURN_INDEXER_URL for verified burn ledger. */
    burnIndexerEnvKey: string;
    /** Future: TOKEN_OHLCV_URL for native candle series (else Dex embed). */
    ohlcvEnvKey: string;
  };
};

/** Deterministic illustrative series — layout preview only, never labeled as live. */
function placeholderSeries(days: number, seed = 1): ChartPoint[] {
  const out: ChartPoint[] = [];
  const start = Date.UTC(2025, 6, 1);
  let acc = 0;
  for (let i = 0; i < days; i++) {
    const t = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    const wave = Math.sin(i / 11 + seed) * 0.35 + Math.cos(i / 19 + seed * 0.7) * 0.2;
    const step = Math.max(0.05, 0.4 + wave + (i % 7 === 0 ? 0.8 : 0));
    acc += step;
    out.push({ t, v: Number((acc * 1.15).toFixed(2)) });
  }
  return out;
}

function placeholderDailyBars(days: number): ChartPoint[] {
  const start = Date.UTC(2025, 6, 1);
  return Array.from({ length: days }, (_, i) => {
    const t = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    const wave = Math.abs(Math.sin(i / 5.5)) * 0.7 + Math.abs(Math.cos(i / 13)) * 0.35;
    const spike = i % 23 === 0 ? 1.4 : 0;
    return { t, v: Number((0.15 + wave + spike).toFixed(3)) };
  });
}

function placeholderAllocation(days: number, target: number): ChartPoint[] {
  const start = Date.UTC(2025, 6, 1);
  return Array.from({ length: days }, (_, i) => {
    const t = new Date(start + i * 86_400_000).toISOString().slice(0, 10);
    // Step down mid-series to show target change (illustrative layout only).
    const base = i < Math.floor(days * 0.55) ? target + 15 : target;
    const jitter = Math.sin(i / 8) * 2.5;
    return { t, v: Number(Math.min(100, Math.max(0, base + jitter)).toFixed(2)) };
  });
}

function placeholderBurnRows(symbol: string): BurnHistoryRow[] {
  const samples = [
    { d: "Jul 18, 2026", burned: "—", sol: "—", usd: "—", price: "—", pct: "—" },
    { d: "Jul 17, 2026", burned: "—", sol: "—", usd: "—", price: "—", pct: "—" },
    { d: "Jul 16, 2026", burned: "—", sol: "—", usd: "—", price: "—", pct: "—" },
  ];
  return samples.map((s, i) => ({
    id: `placeholder_burn_${i}`,
    dateLabel: s.d,
    tokensBurnedLabel: `${s.burned} ${symbol}`,
    solSpentLabel: s.sol,
    usdLabel: s.usd,
    priceLabel: s.price,
    revenuePercentLabel: s.pct,
    isPlaceholder: true,
    txSig: null,
  }));
}

/**
 * Fetch stubs for post-launch wiring. Currently returns null / empty;
 * replace bodies when indexer URLs are configured.
 */
export async function fetchBurnHistoryFromIndexer(_mint: string): Promise<BurnHistoryRow[] | null> {
  const url = process.env.TOKEN_BURN_INDEXER_URL?.trim();
  if (!url) return null;
  // Stub: wire GET `${url}?mint=` when an indexer exists. Do not invent burns.
  return null;
}

export async function fetchOhlcvSeries(_mint: string): Promise<CandlePoint[] | null> {
  const url = process.env.TOKEN_OHLCV_URL?.trim();
  if (!url) return null;
  // Stub: wire OHLCV provider when available; until then use Dex embed.
  return null;
}

export async function buildTokenLiveAnalytics(
  market: TokenMarketMetrics,
): Promise<TokenLiveAnalytics> {
  const config = getPumpfunPublicConfig();
  const symbol = projectConfig.TOKEN_SYMBOL;
  const name = projectConfig.TOKEN_NAME;
  const awaiting = market.availability === "awaiting_mint" || !config.mint;

  const status: TokenLiveAnalytics["status"] = awaiting
    ? "awaiting_mint"
    : market.availability === "partial" || market.availability === "live"
      ? market.availability === "live"
        ? "live"
        : "partial"
      : "partial";

  const allocationTarget = 50;
  const cum = placeholderSeries(120, 2);
  const secondary = cum.map((p, i) => ({
    t: p.t,
    v: Number((p.v * (2.2 + Math.sin(i / 17) * 0.15)).toFixed(2)),
  }));
  const daily = placeholderDailyBars(90);
  const alloc = placeholderAllocation(90, allocationTarget);

  const candles = await (config.mint ? fetchOhlcvSeries(config.mint) : Promise.resolve(null));
  const burns = await (config.mint
    ? fetchBurnHistoryFromIndexer(config.mint)
    : Promise.resolve(null));

  return {
    status,
    symbol,
    name,
    metrics: {
      marketCapUsd: market.marketCapUsd,
      fdvUsd: market.fdvUsd,
      volume24hUsd: market.volume24hUsd,
      holders: market.holderCount,
      circulating: null,
      totalSupply: null,
      priceUsd: market.priceUsd,
      liquidityUsd: market.liquidityUsd,
    },
    metricsNote: awaiting
      ? "AWAITING_MINT — market scalars show N/A until mint + pair data. Set NEXT_PUBLIC_PUMPFUN_MINT to unlock Dex feeds."
      : market.note,
    priceChart: {
      available: Boolean(config.chartEmbedUrl) || Boolean(candles?.length),
      mode: candles?.length
        ? "series"
        : config.chartEmbedUrl
          ? "embed"
          : "awaiting",
      embedUrl: config.chartEmbedUrl,
      externalUrl: config.chartExternalUrl,
      candles: candles ?? [],
      note: awaiting
        ? "Price chart unlocks after mint. No fabricated candles."
        : candles?.length
          ? "Native OHLCV series from configured indexer."
          : "DexScreener embed when a pair exists. Native candles when TOKEN_OHLCV_URL is wired.",
    },
    cumulativeBuyback: {
      isPlaceholder: true,
      seriesUsd: cum,
      seriesSecondary: secondary,
      note: awaiting
        ? "Illustrative layout only — cumulative buyback / treasury series fills after verified on-chain feeds at launch."
        : "Placeholder series until TOKEN_BURN_INDEXER_URL (or treasury ledger) is connected. Not live protocol spend.",
    },
    dailyBuyback: {
      isPlaceholder: true,
      barsUsd: daily,
      latestUsd: null,
      note: "Daily USD buyback bars — placeholder shape until indexer live.",
    },
    revenueAllocation: {
      isPlaceholder: true,
      seriesPercent: alloc,
      targetPercent: allocationTarget,
      note: "Target allocation % is illustrative policy preview — not a live settlement feed.",
    },
    burnHistory: {
      rows: burns?.length ? burns : placeholderBurnRows(symbol),
      note: burns?.length
        ? "Verified burn ledger from indexer."
        : "Placeholder rows — every burn will list here once on-chain settlement + indexer are live. Em dashes mean not yet available.",
    },
    calculatorDefaults: {
      monthlyRevenueUsd: 30_000,
      assumedMcapUsd: 500_000,
      allocationPercent: allocationTarget,
    },
    feedHooks: {
      mintEnvKeys: ["NEXT_PUBLIC_PUMPFUN_MINT", "NEXT_PUBLIC_TOKEN_MINT", "TOKEN_MINT_ADDRESS"],
      burnIndexerEnvKey: "TOKEN_BURN_INDEXER_URL",
      ohlcvEnvKey: "TOKEN_OHLCV_URL",
    },
  };
}
