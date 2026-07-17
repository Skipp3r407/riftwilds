import { NextResponse } from "next/server";
import { getSolPriceUsd, SOL_PRICE_CACHE_TTL_MS } from "@/lib/market/sol-price";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quote = await getSolPriceUsd();
    const maxAge = Math.max(1, Math.floor(SOL_PRICE_CACHE_TTL_MS / 1000));

    return NextResponse.json(quote, {
      headers: {
        "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "SOL price unavailable",
        source: "coingecko",
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
