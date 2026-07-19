"use client";

import { StatusChip } from "@/components/shared/page-header";
import { RunTheNumbers } from "@/components/token/run-the-numbers";
import {
  BarSparkChart,
  CandleChart,
  DualAreaChart,
  PercentLineChart,
} from "@/components/token/svg-charts";
import type { TokenLiveAnalytics } from "@/lib/ecosystem/token-live-analytics";

function fmtUsd(n: number | null) {
  if (n === null || Number.isNaN(n)) return "N/A";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(4)}`;
}

function fmtCount(n: number | null) {
  if (n === null || Number.isNaN(n)) return "N/A";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function phaseTone(status: TokenLiveAnalytics["status"]): "info" | "warn" | "live" {
  if (status === "live") return "live";
  if (status === "partial") return "info";
  return "warn";
}

function phaseLabel(status: TokenLiveAnalytics["status"]) {
  if (status === "awaiting_mint") return "AWAITING_MINT";
  if (status === "live") return "LIVE";
  return "PARTIAL";
}

type Props = {
  live: TokenLiveAnalytics;
};

export function TokenLiveAnalyticsPanel({ live }: Props) {
  const awaiting = live.status === "awaiting_mint";
  const m = live.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cyan)]">
            Live analytics
          </p>
          <h2 className="font-display mt-1 text-2xl text-white sm:text-3xl">
            {live.symbol} market desk
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Price, supply metrics, buyback / treasury charts, and on-chain burn history. Real feeds
            plug in when the mint launches — until then you see honest empties and labeled
            placeholders.
          </p>
        </div>
        <StatusChip tone={phaseTone(live.status)}>{phaseLabel(live.status)}</StatusChip>
      </div>

      {/* Price chart */}
      <section className="panel overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] px-5 py-3 sm:px-6">
          <div>
            <p className="font-display text-sm text-white">
              {live.symbol} / USD
            </p>
            <p className="text-xs text-[var(--text-dim)]">{live.priceChart.note}</p>
          </div>
          {live.priceChart.externalUrl && !awaiting ? (
            <a
              href={live.priceChart.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--cyan)] underline"
            >
              Open external chart
            </a>
          ) : null}
        </div>
        <div className="p-3 sm:p-4">
          {live.priceChart.mode === "embed" && live.priceChart.embedUrl ? (
            <iframe
              title={`${live.symbol} chart`}
              src={live.priceChart.embedUrl}
              className="h-[360px] w-full rounded-lg border-0 bg-black sm:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <CandleChart
              candles={live.priceChart.candles}
              emptyLabel={live.priceChart.note}
            />
          )}
        </div>
      </section>

      {/* Key metrics row */}
      <section className="panel px-3 py-4 sm:px-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <MetricCell label="Market cap" value={fmtUsd(m.marketCapUsd)} awaiting={awaiting} />
          <MetricCell label="Fully diluted val. (FDV)" value={fmtUsd(m.fdvUsd)} awaiting={awaiting} />
          <MetricCell label="24h volume" value={fmtUsd(m.volume24hUsd)} awaiting={awaiting} />
          <MetricCell label="Holders" value={fmtCount(m.holders)} awaiting={awaiting} />
          <MetricCell
            label="Circulating"
            value={m.circulating !== null ? `${fmtCount(m.circulating)} ${live.symbol}` : "N/A"}
            awaiting={awaiting}
          />
          <MetricCell
            label="Total supply"
            value={m.totalSupply !== null ? `${fmtCount(m.totalSupply)} ${live.symbol}` : "N/A"}
            awaiting={awaiting}
          />
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-dim)]">{live.metricsNote}</p>
      </section>

      {/* Cumulative buyback / treasury */}
      <section className="panel overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--stroke)] px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-display text-lg text-white">
              Cumulative buyback & treasury allocation
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Total USD deployed toward buy & burn / treasury since launch
            </p>
          </div>
          {live.cumulativeBuyback.isPlaceholder ? (
            <span className="rounded border border-[rgba(255,184,77,0.3)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--amber)]">
              PLACEHOLDER SERIES
            </span>
          ) : null}
        </div>
        <div className="px-2 py-3 sm:px-4">
          <DualAreaChart
            primary={live.cumulativeBuyback.seriesUsd}
            secondary={live.cumulativeBuyback.seriesSecondary}
            primaryLabel="Buy & burn USD"
            secondaryLabel="Treasury track"
            emptyLabel="Series unlock after launch feeds"
          />
        </div>
        <p className="border-t border-[var(--stroke)] px-5 py-2 text-[11px] text-[var(--text-dim)] sm:px-6">
          {live.cumulativeBuyback.note}
        </p>
      </section>

      {/* Daily + allocation */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel overflow-hidden p-0">
          <div className="flex items-start justify-between gap-2 border-b border-[var(--stroke)] px-5 py-4">
            <div>
              <h3 className="font-display text-lg text-white">Daily buyback & burn</h3>
              <p className="text-xs text-[var(--text-muted)]">USD spent per day</p>
            </div>
            <div className="text-right">
              <p className="font-display text-sm text-[var(--amber)]">
                {live.dailyBuyback.latestUsd !== null
                  ? fmtUsd(live.dailyBuyback.latestUsd)
                  : "—"}
              </p>
              <p className="text-[10px] text-[var(--text-dim)]">Latest</p>
            </div>
          </div>
          <div className="px-2 py-3">
            <BarSparkChart
              series={live.dailyBuyback.barsUsd}
              emptyLabel="Daily bars after indexer"
            />
          </div>
          <p className="border-t border-[var(--stroke)] px-5 py-2 text-[11px] text-[var(--text-dim)]">
            {live.dailyBuyback.note}
            {live.dailyBuyback.isPlaceholder ? " · PLACEHOLDER" : ""}
          </p>
        </section>

        <section className="panel overflow-hidden p-0">
          <div className="flex items-start justify-between gap-2 border-b border-[var(--stroke)] px-5 py-4">
            <div>
              <h3 className="font-display text-lg text-white">Revenue allocated to buyback</h3>
              <p className="text-xs text-[var(--text-muted)]">% of daily revenue spent</p>
            </div>
            <span className="rounded-full border border-[rgba(61,231,255,0.35)] bg-[rgba(61,231,255,0.1)] px-2.5 py-0.5 text-[11px] text-[var(--cyan)]">
              {live.revenueAllocation.targetPercent}% target
            </span>
          </div>
          <div className="px-2 py-3">
            <PercentLineChart
              series={live.revenueAllocation.seriesPercent}
              target={live.revenueAllocation.targetPercent}
              emptyLabel="Allocation series after launch"
            />
          </div>
          <p className="border-t border-[var(--stroke)] px-5 py-2 text-[11px] text-[var(--text-dim)]">
            {live.revenueAllocation.note}
            {live.revenueAllocation.isPlaceholder ? " · PLACEHOLDER" : ""}
          </p>
        </section>
      </div>

      <RunTheNumbers defaults={live.calculatorDefaults} symbol={live.symbol} />

      {/* Burn history table */}
      <section className="panel overflow-hidden p-0">
        <div className="border-b border-[var(--stroke)] px-5 py-4 sm:px-6">
          <h3 className="font-display text-xl text-white">Every burn, on-chain</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            A verifiable record of each daily purchase and burn, settled on Solana — once the mint
            and indexer are live.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--stroke)] text-[10px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                <th className="px-5 py-3 font-medium sm:px-6">Date</th>
                <th className="px-3 py-3 font-medium">{live.symbol} burned</th>
                <th className="px-3 py-3 font-medium">SOL spent</th>
                <th className="px-3 py-3 font-medium">USD</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium sm:px-6">% of revenue</th>
              </tr>
            </thead>
            <tbody>
              {live.burnHistory.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[rgba(120,140,170,0.1)] text-[var(--text-muted)]"
                >
                  <td className="px-5 py-3 text-white sm:px-6">
                    {row.dateLabel}
                    {row.isPlaceholder ? (
                      <span className="ml-2 text-[10px] text-[var(--amber)]">placeholder</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">{row.tokensBurnedLabel}</td>
                  <td className="px-3 py-3">{row.solSpentLabel}</td>
                  <td className="px-3 py-3">{row.usdLabel}</td>
                  <td className="px-3 py-3 text-[var(--cyan)]">{row.priceLabel}</td>
                  <td className="px-5 py-3 sm:px-6">{row.revenuePercentLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-[var(--stroke)] px-5 py-3 text-[11px] text-[var(--text-dim)] sm:px-6">
          {live.burnHistory.note} Wire{" "}
          <code className="text-[var(--cyan)]">{live.feedHooks.burnIndexerEnvKey}</code> after
          launch for verified rows.
        </p>
      </section>

      <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
        <p>
          <strong className="text-white">Entertainment only.</strong> No guaranteed returns. Buying
          or trading {live.symbol} does not automatically generate SOL for pet owners. Wallet is
          optional for core play.
        </p>
        <p>
          Launch data path: set{" "}
          <code className="text-[var(--cyan)]">{live.feedHooks.mintEnvKeys[0]}</code> (or{" "}
          <code className="text-[var(--cyan)]">{live.feedHooks.mintEnvKeys[1]}</code>) for Dex
          scalars + chart embed; optional{" "}
          <code className="text-[var(--cyan)]">{live.feedHooks.ohlcvEnvKey}</code> for native
          candles;{" "}
          <code className="text-[var(--cyan)]">{live.feedHooks.burnIndexerEnvKey}</code> for the
          burn ledger.
        </p>
      </section>
    </div>
  );
}

function MetricCell({
  label,
  value,
  awaiting,
}: {
  label: string;
  value: string;
  awaiting: boolean;
}) {
  const showAwait = awaiting && value === "N/A";
  return (
    <div>
      <p className="text-[11px] text-[var(--text-dim)]">{label}</p>
      <p className="mt-1 font-display text-lg text-white sm:text-xl">
        {showAwait ? (
          <span className="text-[var(--amber)]">AWAITING_MINT</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
