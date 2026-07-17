"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

const POLL_MS = 60_000;

type SolPriceResponse = {
  usd?: number;
  change24hPct?: number | null;
  updatedAt?: string;
  source?: string;
  error?: string;
};

type Props = {
  className?: string;
};

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
}

function formatChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

export function SolPriceChip({ className }: Props) {
  const [quote, setQuote] = useState<SolPriceResponse | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/market/sol-price", { cache: "no-store" });
      const data = (await res.json()) as SolPriceResponse;
      if (!res.ok || typeof data.usd !== "number") {
        setUnavailable(true);
        setQuote(null);
        return;
      }
      setQuote(data);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
      setQuote(null);
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

  const change = quote?.change24hPct;
  const changeTone =
    typeof change === "number"
      ? change > 0
        ? "text-[var(--emerald)]"
        : change < 0
          ? "text-[var(--coral)]"
          : "text-[var(--text-muted)]"
      : null;

  return (
    <div
      className={cn(
        "inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-[var(--stroke)] bg-[rgba(22,22,37,0.72)] px-2 py-1 font-mono text-[11px] tabular-nums text-[var(--text)] sm:max-w-none",
        className,
      )}
      title={unavailable || !quote ? "SOL price unavailable" : "SOL / USD · CoinGecko · display only"}
      aria-live="polite"
    >
      {loading && !quote && !unavailable ? (
        <span className="text-[var(--text-muted)]">SOL …</span>
      ) : unavailable || !quote ? (
        <span className="truncate text-[var(--amber)]">SOL —</span>
      ) : (
        <>
          <span className="text-white">
            <span className="text-[var(--text-muted)]">SOL</span> {formatUsd(quote.usd!)}
          </span>
          {typeof change === "number" && changeTone ? (
            <span className={cn("hidden tabular-nums sm:inline", changeTone)}>
              {formatChange(change)}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
