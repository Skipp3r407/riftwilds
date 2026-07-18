import { NextResponse } from "next/server";
import { getTokenPriceUsd, TOKEN_PRICE_CACHE_TTL_MS } from "@/lib/market/token-price";

export const dynamic = "force-dynamic";

export async function GET() {
  const quote = await getTokenPriceUsd();
  const maxAge = Math.max(1, Math.floor(TOKEN_PRICE_CACHE_TTL_MS / 1000));

  return NextResponse.json(quote, {
    headers: {
      "Cache-Control":
        quote.status === "live"
          ? `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}`
          : "no-store",
    },
  });
}
