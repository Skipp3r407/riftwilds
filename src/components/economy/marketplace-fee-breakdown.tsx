"use client";

import { useMemo, useState } from "react";
import {
  getActiveTreasuryPolicy,
  validateMarketplaceFeeSplit,
  type MarketplaceFeeSplit,
} from "@/lib/config/treasury-policy";
import { cn } from "@/lib/utils/cn";
import { MarketplaceDisclaimer } from "./disclaimers";

type SplitLine = {
  key: keyof MarketplaceFeeSplit;
  label: string;
  percent: number;
  amount: number;
  color: string;
};

const SPLIT_META: Omit<SplitLine, "percent" | "amount">[] = [
  { key: "sellerPercent", label: "Seller proceeds", color: "var(--emerald)" },
  { key: "growthPercent", label: "Growth treasury", color: "var(--cyan)" },
  { key: "petRewardPercent", label: "Community Reward Treasury", color: "var(--violet)" },
  { key: "operationsPercent", label: "Operations", color: "var(--amber)" },
  { key: "eventsPercent", label: "Community Events", color: "var(--coral)" },
];

function computeIntegerSplit(
  priceCredits: number,
  fee: MarketplaceFeeSplit,
): SplitLine[] {
  const keys = SPLIT_META.map((m) => m.key);
  const amounts = keys.map((key) => Math.floor((priceCredits * fee[key]) / 100));
  const allocated = amounts.reduce((sum, n) => sum + n, 0);
  const remainder = priceCredits - allocated;

  if (remainder !== 0) {
    const sellerIndex = keys.indexOf("sellerPercent");
    amounts[sellerIndex] = (amounts[sellerIndex] ?? 0) + remainder;
  }

  return SPLIT_META.map((meta, index) => ({
    ...meta,
    percent: fee[meta.key],
    amount: amounts[index] ?? 0,
  }));
}

type MarketplaceFeeBreakdownProps = {
  className?: string;
  defaultPriceCredits?: number;
};

export function MarketplaceFeeBreakdown({
  className,
  defaultPriceCredits = 1000,
}: MarketplaceFeeBreakdownProps) {
  const policy = getActiveTreasuryPolicy();
  const fee = policy.marketplaceFee;
  const isValid = validateMarketplaceFeeSplit(fee);

  const [priceInput, setPriceInput] = useState(String(defaultPriceCredits));

  const priceCredits = useMemo(() => {
    const parsed = Number.parseInt(priceInput, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [priceInput]);

  const lines = useMemo(
    () => computeIntegerSplit(priceCredits, fee),
    [priceCredits, fee],
  );

  const sellerLine = lines.find((line) => line.key === "sellerPercent");
  const feeTotal = priceCredits - (sellerLine?.amount ?? 0);

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="marketplace-fee-heading"
    >
      <div>
        <h2 id="marketplace-fee-heading" className="font-display text-xl text-white">
          Marketplace fee breakdown
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Published split from{" "}
          <span className="text-white">{policy.label}</span>. Calculator uses demo credits —
          not live SOL prices.
        </p>
      </div>

      {!isValid ? (
        <p className="panel p-4 text-sm text-[var(--coral)]" role="alert">
          Marketplace fee split must total 100%. Current policy is misconfigured.
        </p>
      ) : null}

      <div className="panel space-y-5 p-5">
        <label className="block text-sm">
          <span className="text-[var(--text-muted)]">Example sale price (demo credits)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
            className="focus-ring mt-2 w-full max-w-xs rounded-md border border-[var(--stroke)] bg-[var(--bg-panel)] px-3 py-2 text-white"
          />
        </label>

        <ul className="space-y-2">
          {lines.map((line) => (
            <li
              key={line.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: line.color }}
                  aria-hidden
                />
                <span className="text-sm text-white">{line.label}</span>
              </div>
              <div className="text-right">
                <p className="font-display tabular-nums text-white">{line.amount} cr</p>
                <p className="text-xs text-[var(--text-muted)]">{line.percent}%</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-between gap-2 border-t border-[var(--stroke)] pt-4 text-sm">
          <span className="text-[var(--text-muted)]">Total sale</span>
          <span className="font-display tabular-nums text-white">{priceCredits} cr</span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span className="text-[var(--text-muted)]">Non-seller allocation (fees)</span>
          <span className="font-display tabular-nums text-[var(--amber)]">{feeTotal} cr</span>
        </div>
        {sellerLine ? (
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span className="text-[var(--text-muted)]">Seller receives</span>
            <span className="font-display tabular-nums text-[var(--emerald)]">
              {sellerLine.amount} cr
            </span>
          </div>
        ) : null}
      </div>

      <MarketplaceDisclaimer />
    </section>
  );
}
