/** Server-side SOL/USD quote via CoinGecko (cached ~45s). */

export const SOL_PRICE_CACHE_TTL_MS = 45_000;
export const SOL_PRICE_SOURCE = "coingecko" as const;

export type SolPriceQuote = {
  usd: number;
  change24hPct: number | null;
  updatedAt: string;
  source: typeof SOL_PRICE_SOURCE;
  cached: boolean;
};

type CacheEntry = {
  quote: Omit<SolPriceQuote, "cached">;
  expiresAt: number;
};

let cache: CacheEntry | null = null;

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true";

type CoinGeckoResponse = {
  solana?: {
    usd?: number;
    usd_24h_change?: number;
  };
};

export async function getSolPriceUsd(): Promise<SolPriceQuote> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return { ...cache.quote, cached: true };
  }

  const res = await fetch(COINGECKO_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`CoinGecko responded ${res.status}`);
  }

  const data = (await res.json()) as CoinGeckoResponse;
  const usd = data.solana?.usd;
  if (typeof usd !== "number" || !Number.isFinite(usd)) {
    throw new Error("CoinGecko response missing solana.usd");
  }

  const changeRaw = data.solana?.usd_24h_change;
  const change24hPct =
    typeof changeRaw === "number" && Number.isFinite(changeRaw) ? changeRaw : null;

  const quote: Omit<SolPriceQuote, "cached"> = {
    usd,
    change24hPct,
    updatedAt: new Date().toISOString(),
    source: SOL_PRICE_SOURCE,
  };

  cache = {
    quote,
    expiresAt: now + SOL_PRICE_CACHE_TTL_MS,
  };

  return { ...quote, cached: false };
}
