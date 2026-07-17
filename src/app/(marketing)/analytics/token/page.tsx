"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import type { TokenAnalyticsDashboard } from "@/lib/ecosystem/token-analytics";

function fmtUsd(n: number | null) {
  if (n === null || Number.isNaN(n)) return "N/A";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(4)}`;
}

export default function TokenAnalyticsPage() {
  const [dashboard, setDashboard] = useState<TokenAnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/analytics/token")
      .then((r) => r.json())
      .then((json: { dashboard?: TokenAnalyticsDashboard }) =>
        setDashboard(json.dashboard ?? null),
      )
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <SectionTitleBand slug="token-analytics" label="Token Analytics" kicker="Live market" />
        <p className="page-lede mt-4">
          Price, liquidity, volume, milestones, and treasury slices. DexScreener when mint is
          configured; honest empties until then. Never fabricates reward SOL from buys.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/token" className="btn-secondary focus-ring text-sm">
            Token overview
          </Link>
          <Link href="/treasury" className="btn-secondary focus-ring text-sm">
            Treasury
          </Link>
          <Link href="/play" className="btn-primary focus-ring text-sm">
            Play
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading analytics…</p>
      ) : dashboard ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="info">{dashboard.phase}</StatusChip>
            <span className="text-xs text-[var(--text-dim)]">
              {dashboard.symbol} · {dashboard.network} · {dashboard.market.source}
            </span>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Price" value={fmtUsd(dashboard.market.priceUsd)} />
            <Metric label="Market cap" value={fmtUsd(dashboard.market.marketCapUsd)} />
            <Metric label="Liquidity" value={fmtUsd(dashboard.market.liquidityUsd)} />
            <Metric label="24h volume" value={fmtUsd(dashboard.market.volume24hUsd)} />
            <Metric
              label="Holders"
              value={
                dashboard.market.holderCount !== null
                  ? String(dashboard.market.holderCount)
                  : "N/A"
              }
            />
            <Metric
              label="Burned"
              value={
                dashboard.supply.burned !== null ? String(dashboard.supply.burned) : "N/A"
              }
            />
            <Metric
              label="Locked %"
              value={
                dashboard.supply.lockedPercent !== null
                  ? `${dashboard.supply.lockedPercent}%`
                  : "N/A"
              }
            />
            <Metric
              label="Bonding curve"
              value={
                dashboard.market.bondingCurveProgressPercent !== null
                  ? `${dashboard.market.bondingCurveProgressPercent}%`
                  : "N/A"
              }
            />
          </section>

          <p className="text-xs text-[var(--text-muted)]">{dashboard.market.note}</p>
          <p className="text-xs text-[var(--text-dim)]">{dashboard.supply.note}</p>
          <p className="text-xs text-[var(--amber)]">{dashboard.rewardVaultNote}</p>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-white">Buy / sell</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {dashboard.buySellLinks.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No external links yet — mint / pair pending.
                </p>
              ) : (
                dashboard.buySellLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className={
                      l.primary
                        ? "btn-primary focus-ring text-sm"
                        : "btn-secondary focus-ring text-sm"
                    }
                  >
                    {l.label}
                  </a>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-[var(--text-dim)]">
              Mint: {dashboard.mint ?? "COMING_SOON"}
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <h2 className="font-display text-xl text-white">Treasury slices</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                {dashboard.treasurySlices.map((s) => (
                  <li key={s.key} className="flex justify-between border-b border-[var(--stroke)] py-2">
                    <span>{s.label}</span>
                    <span className="text-white">{s.amountLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-5">
              <h2 className="font-display text-xl text-white">Charts</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{dashboard.charts.note}</p>
              <p className="mt-4 text-xs text-[var(--text-dim)]">
                Price series: {dashboard.charts.priceSeriesAvailable ? "yes" : "deferred"} · Volume:{" "}
                {dashboard.charts.volumeSeriesAvailable ? "yes" : "deferred"}
              </p>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-white">Milestones</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {dashboard.milestones.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--stroke)] py-2"
                >
                  <span className="text-white">
                    {m.reached ? "✓ " : ""}
                    {m.title}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {m.progressLabel} · {m.rewardLabel}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-white">Large wallets</h2>
            {dashboard.whales.length === 0 && dashboard.topHolders.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Holder indexer not connected — no fabricated whale list.
              </p>
            ) : (
              <ul className="mt-2 text-sm text-[var(--text-muted)]">
                {dashboard.topHolders.map((w) => (
                  <li key={w.rank}>
                    #{w.rank} {w.walletLabel}{" "}
                    {w.percentOfSupply !== null ? `${w.percentOfSupply}%` : w.size}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-white">Recent activity</h2>
            <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
              {dashboard.recentActivity.map((a) => (
                <li key={a.id}>
                  <span className="text-white">{a.title}</span> — {a.detail}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
            {dashboard.disclaimers.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </section>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Analytics unavailable.</p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-xl text-white">{value}</p>
    </div>
  );
}
