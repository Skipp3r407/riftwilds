/** Server-side project token / USD quote via DexScreener (cached ~45s). */

import { getPumpfunPublicConfig } from "@/lib/community/pumpfun-config";
import { projectConfig } from "@/lib/config/project";

export const TOKEN_PRICE_CACHE_TTL_MS = 45_000;
export const TOKEN_PRICE_SOURCE = "dexscreener" as const;

export type TokenPriceQuote = {
  symbol: string;
  name: string;
  mint: string | null;
  usd: number | null;
  change24hPct: number | null;
  updatedAt: string;
  source: typeof TOKEN_PRICE_SOURCE | "none";
  configured: boolean;
  cached: boolean;
  status: "live" | "awaiting_mint" | "unavailable";
};

type CacheEntry = {
  quote: Omit<TokenPriceQuote, "cached">;
  expiresAt: number;
};

let cache: CacheEntry | null = null;
let cacheKey: string | null = null;

function displaySymbol(raw: string): string {
  return raw.replace(/^\$/, "").trim() || "RIFT";
}

type DexPair = {
  priceUsd?: string;
  priceChange?: { h24?: number };
};

/**
 * Best-effort DexScreener quote for the configured community mint.
 * Never fabricates a price when mint is unset or no pair exists.
 */
export async function getTokenPriceUsd(): Promise<TokenPriceQuote> {
  const config = getPumpfunPublicConfig();
  const symbol = displaySymbol(projectConfig.TOKEN_SYMBOL);
  const name = projectConfig.TOKEN_NAME;
  const now = Date.now();
  const key = config.mint ?? "none";

  if (cache && cacheKey === key && cache.expiresAt > now) {
    return { ...cache.quote, cached: true };
  }

  if (!config.mint) {
    const quote: Omit<TokenPriceQuote, "cached"> = {
      symbol,
      name,
      mint: null,
      usd: null,
      change24hPct: null,
      updatedAt: new Date().toISOString(),
      source: "none",
      configured: false,
      status: "awaiting_mint",
    };
    cache = { quote, expiresAt: now + TOKEN_PRICE_CACHE_TTL_MS };
    cacheKey = key;
    return { ...quote, cached: false };
  }

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${config.mint}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`DexScreener responded ${res.status}`);
    }

    const json = (await res.json()) as { pairs?: DexPair[] };
    const pair = json.pairs?.[0];
    const usdRaw = pair?.priceUsd ? Number(pair.priceUsd) : NaN;
    const usd = Number.isFinite(usdRaw) ? usdRaw : null;
    const changeRaw = pair?.priceChange?.h24;
    const change24hPct =
      typeof changeRaw === "number" && Number.isFinite(changeRaw) ? changeRaw : null;

    const quote: Omit<TokenPriceQuote, "cached"> = {
      symbol,
      name,
      mint: config.mint,
      usd,
      change24hPct,
      updatedAt: new Date().toISOString(),
      source: TOKEN_PRICE_SOURCE,
      configured: true,
      status: usd !== null ? "live" : "unavailable",
    };

    cache = { quote, expiresAt: now + TOKEN_PRICE_CACHE_TTL_MS };
    cacheKey = key;
    return { ...quote, cached: false };
  } catch {
    const quote: Omit<TokenPriceQuote, "cached"> = {
      symbol,
      name,
      mint: config.mint,
      usd: null,
      change24hPct: null,
      updatedAt: new Date().toISOString(),
      source: TOKEN_PRICE_SOURCE,
      configured: true,
      status: "unavailable",
    };
    cache = { quote, expiresAt: now + Math.min(15_000, TOKEN_PRICE_CACHE_TTL_MS) };
    cacheKey = key;
    return { ...quote, cached: false };
  }
}
