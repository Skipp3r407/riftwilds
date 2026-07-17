"use client";

import { useEffect, useState } from "react";

type HistoryPayload = {
  summaryLine: string;
  askingPriceSol: string | null;
  lastSaleSol: string | null;
  avgSimilarRaritySol: string | null;
  avgSpeciesSol: string | null;
  lowestListingSol: string | null;
  similarRangeSol: { low: string; high: string } | null;
  recentSales: { priceSol: string; soldAt: string; rarity?: string; speciesSlug?: string }[];
  comparisonNotes: string[];
  warnings: string[];
};

type Props = {
  publicId: string | null;
};

export function PriceHistoryPanel({ publicId }: Props) {
  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicId) {
      setHistory(null);
      return;
    }
    let cancelled = false;
    void fetch(`/api/marketplace/price-history?publicId=${encodeURIComponent(publicId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load price history");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setHistory(data.history);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  if (!publicId) {
    return (
      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Price history</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Select a listing to compare recent sales. Language never assigns guaranteed value.
        </p>
      </section>
    );
  }

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <h2 className="font-display text-lg text-white">Price history</h2>
        <p className="mt-2 text-sm text-[var(--amber)]">
          Comparable recent sales only — never “this pet is worth X”.
        </p>
      </div>

      {error ? <p className="text-sm text-[var(--coral)]">{error}</p> : null}
      {!history ? (
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      ) : (
        <>
          <p className="text-sm text-white">{history.summaryLine}</p>
          <dl className="grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-[var(--text-muted)]">Asking price</dt>
              <dd className="mt-0.5 text-white">{history.askingPriceSol ?? "—"} SOL</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Last sale</dt>
              <dd className="mt-0.5 text-white">{history.lastSaleSol ?? "—"} SOL</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Avg similar rarity</dt>
              <dd className="mt-0.5 text-white">{history.avgSimilarRaritySol ?? "—"} SOL</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Avg species</dt>
              <dd className="mt-0.5 text-white">{history.avgSpeciesSol ?? "—"} SOL</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Lowest listing</dt>
              <dd className="mt-0.5 text-white">{history.lowestListingSol ?? "—"} SOL</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Similar range</dt>
              <dd className="mt-0.5 text-white">
                {history.similarRangeSol
                  ? `${history.similarRangeSol.low}–${history.similarRangeSol.high} SOL`
                  : "—"}
              </dd>
            </div>
          </dl>

          {history.warnings.length > 0 ? (
            <ul className="space-y-1 text-xs text-[var(--amber)]">
              {history.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          ) : null}

          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Recent sales
            </p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
              {history.recentSales.map((s, i) => (
                <li key={`${s.soldAt}-${i}`}>
                  {s.priceSol} SOL · {s.rarity ?? "?"} · {s.speciesSlug ?? "?"} ·{" "}
                  {new Date(s.soldAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-1 text-[11px] text-[var(--text-muted)]">
            {history.comparisonNotes.map((n) => (
              <li key={n}>• {n}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
