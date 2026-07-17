"use client";

import { useEffect, useState } from "react";

type MetricsResponse = {
  metrics: {
    eggsCreated: number;
    eggsHatched: number;
    livingCreatures: number;
    marketplaceListings: number;
    activePlayers: number;
    memorials?: number;
  };
  season: string;
  project: { network: string };
  demoFallback?: boolean;
};

/** Tight status strip — Hatchlings-style clarity, honest demo labels. */
export function LiveStatus() {
  const [data, setData] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/transparency/metrics")
      .then((r) => r.json())
      .then((json: MetricsResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Eggs claimed",
      value: data?.metrics.eggsCreated,
    },
    {
      label: "Hatched Riftlings",
      value: data?.metrics.eggsHatched ?? data?.metrics.livingCreatures,
    },
    {
      label: "Living creatures",
      value: data?.metrics.livingCreatures,
    },
    {
      label: "Market listings",
      value: data?.metrics.marketplaceListings,
    },
  ];

  return (
    <section className="border-y border-[var(--stroke)] bg-[rgba(10,10,15,0.72)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[var(--stroke)] md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[var(--bg-deep)] px-4 py-6 text-center md:px-6"
          >
            <p className="font-display text-3xl text-white md:text-4xl">
              {data && card.value != null ? card.value : "—"}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {card.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[10px] text-[var(--text-dim)] md:px-6">
        {data?.demoFallback
          ? "Demo data — counters show zero until the live database is connected. Never fabricated scarcity."
          : `${data?.season ?? "Season"} · ${data?.project.network ?? "network"}`}
      </p>
    </section>
  );
}
