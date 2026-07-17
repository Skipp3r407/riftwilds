"use client";

import { useState } from "react";
import { revenueDisclosures } from "@/lib/revenue/disclosures";

export function SupportsEconomyBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="focus-ring rounded border border-[rgba(61,231,255,0.35)] bg-[rgba(61,231,255,0.08)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--cyan)]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Supports the Riftwilds Economy
      </button>
      {open ? (
        <div
          role="dialog"
          className="absolute left-0 z-20 mt-2 w-64 rounded-md border border-[var(--stroke)] bg-[rgba(12,20,40,0.98)] p-3 text-[11px] leading-relaxed text-[var(--text-muted)] shadow-lg"
        >
          <p>{revenueDisclosures.supportsEconomy}</p>
          <p className="mt-2 text-[var(--amber)]">{revenueDisclosures.holderRewards}</p>
          <button
            type="button"
            className="mt-2 text-[var(--cyan)] underline"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
