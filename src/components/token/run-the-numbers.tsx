"use client";

import { useState } from "react";
import type { TokenLiveAnalytics } from "@/lib/ecosystem/token-live-analytics";

function fmtCompactUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtPrice(n: number) {
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(2)}`;
}

type Props = {
  defaults: TokenLiveAnalytics["calculatorDefaults"];
  symbol: string;
};

export function RunTheNumbers({ defaults, symbol }: Props) {
  const [monthlyRevenue, setMonthlyRevenue] = useState(defaults.monthlyRevenueUsd);
  const [assumedMcap, setAssumedMcap] = useState(defaults.assumedMcapUsd);
  const allocation = defaults.allocationPercent;

  const annualRevenue = monthlyRevenue * 12;
  const buybackAnnual = annualRevenue * (allocation / 100);
  const revenueMultiple = assumedMcap > 0 ? assumedMcap / annualRevenue : 0;
  const buybackYield = assumedMcap > 0 ? (buybackAnnual / assumedMcap) * 100 : 0;
  // Illustrative unit price assuming 1B circulating for sketch math only.
  const assumedCirculating = 1_000_000_000;
  const tokenPrice = assumedMcap / assumedCirculating;

  return (
    <section className="panel overflow-hidden p-0">
      <div className="border-b border-[var(--stroke)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl text-white">Run the numbers yourself</h2>
          <span className="rounded border border-[rgba(255,184,77,0.35)] bg-[rgba(255,184,77,0.1)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--amber)]">
            HYPOTHETICAL
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Sketch earnings-to-valuation math for {symbol}. Not a forecast — entertainment / education
          only.
        </p>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-2 md:gap-8 sm:p-6">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
            Earnings to valuation
          </p>

          <SliderField
            label="Monthly protocol revenue"
            value={monthlyRevenue}
            min={1_000}
            max={500_000}
            step={1_000}
            display={fmtCompactUsd(monthlyRevenue)}
            onChange={setMonthlyRevenue}
          />
          <SliderField
            label="Assumed circulating market cap"
            value={assumedMcap}
            min={10_000}
            max={5_000_000}
            step={10_000}
            display={fmtCompactUsd(assumedMcap)}
            onChange={setAssumedMcap}
          />
          <div className="flex items-center justify-between border-b border-[var(--stroke)] pb-3 text-sm">
            <span className="text-[var(--text-muted)]">Allocated to buyback</span>
            <span className="font-display text-white">{allocation}%</span>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-lg border border-[rgba(61,231,255,0.18)] bg-[rgba(4,10,20,0.72)] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)]">
            Revenue multiple
          </p>
          <p className="mt-1 font-display text-4xl text-[var(--cyan)] sm:text-5xl">
            {revenueMultiple > 0 ? `${revenueMultiple.toFixed(1)}x` : "—"}
          </p>
          <dl className="mt-5 space-y-2 text-sm">
            <StatRow label="Annual revenue" value={fmtCompactUsd(annualRevenue)} />
            <StatRow
              label={`Illustrative ${symbol} price`}
              value={fmtPrice(tokenPrice)}
            />
            <StatRow
              label="Buyback yield on mkt cap"
              value={`${buybackYield.toFixed(1)}%`}
            />
          </dl>
        </div>
      </div>

      <p className="border-t border-[var(--stroke)] px-5 py-3 text-[11px] leading-relaxed text-[var(--text-dim)] sm:px-6">
        Illustrative only. Market cap uses assumed circulating supply (1B units for sketch math).
        Yields use annualized revenue × allocation. Not a forecast or financial advice. Riftwilds is
        entertainment software — no guaranteed returns. Trading does not auto-generate SOL for pet
        owners.
      </p>
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-display text-white">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[rgba(61,231,255,0.15)] accent-[var(--amber)]"
      />
    </label>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[rgba(120,140,170,0.12)] py-1.5">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="text-white">{value}</dd>
    </div>
  );
}
