"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { brandCoinIconPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import { cn } from "@/lib/utils/cn";

const POLL_MS = 60_000;

type TokenPriceResponse = {
  symbol?: string;
  name?: string;
  mint?: string | null;
  usd?: number | null;
  change24hPct?: number | null;
  status?: "live" | "awaiting_mint" | "unavailable";
  configured?: boolean;
  error?: string;
};

type Props = {
  className?: string;
};

function displaySymbol(raw?: string): string {
  const fallback = projectConfig.TOKEN_SYMBOL.replace(/^\$/, "") || "RIFT";
  if (!raw) return fallback;
  return raw.replace(/^\$/, "").trim() || fallback;
}

function formatUsd(value: number): string {
  const digits =
    value >= 1 ? 4 : value >= 0.01 ? 5 : value >= 0.0001 ? 6 : 8;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function TokenPriceChip({ className }: Props) {
  const [quote, setQuote] = useState<TokenPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/market/token-price", { cache: "no-store" });
      const data = (await res.json()) as TokenPriceResponse;
      if (!res.ok) {
        setQuote({ status: "unavailable", usd: null });
        return;
      }
      setQuote(data);
    } catch {
      setQuote({ status: "unavailable", usd: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const id = window.setInterval(() => {
      void load();
    }, POLL_MS);

    const onFocus = () => {
      void load();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const symbol = displaySymbol(quote?.symbol);
  const hasPrice = typeof quote?.usd === "number" && Number.isFinite(quote.usd);
  const awaitingMint = quote?.status === "awaiting_mint" || quote?.configured === false;
  const change = quote?.change24hPct;
  const changeTone =
    typeof change === "number"
      ? change > 0
        ? "text-[var(--emerald)]"
        : change < 0
          ? "text-[var(--coral)]"
          : "text-[var(--text-muted)]"
      : null;

  const title = awaitingMint
    ? `Set NEXT_PUBLIC_PUMPFUN_MINT for live ${symbol} price`
    : hasPrice
      ? `${symbol} / USD · DexScreener · display only`
      : `${symbol} price unavailable`;

  return (
    <div
      className={cn(
        "inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-[var(--stroke)] bg-[rgba(22,22,37,0.72)] px-2 py-1 font-mono text-[11px] tabular-nums text-[var(--text)] sm:max-w-none",
        className,
      )}
      title={title}
      aria-live="polite"
    >
      <Image
        src={brandCoinIconPath}
        alt=""
        width={14}
        height={14}
        unoptimized
        className="h-3.5 w-3.5 shrink-0"
      />
      {loading && !quote ? (
        <span className="text-[var(--text-muted)]">{symbol} …</span>
      ) : !hasPrice ? (
        <span className="truncate text-[var(--amber)]">
          <span className="text-[var(--text-muted)]">{symbol}</span> —
        </span>
      ) : (
        <>
          <span className="text-white">
            <span className="text-[var(--text-muted)]">{symbol}</span>{" "}
            {formatUsd(quote.usd!)}
          </span>
          {typeof change === "number" && changeTone ? (
            <span className={cn("hidden tabular-nums xl:inline", changeTone)}>
              {formatChange(change)}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
