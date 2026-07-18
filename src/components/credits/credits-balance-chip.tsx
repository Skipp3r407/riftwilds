"use client";

import { useEffect, useState } from "react";
import {
  fetchCreditsBalance,
  getDemoCreditsUserId,
} from "@/lib/credits/client";
import { flushPendingQuestCredits } from "@/lib/credits/sync-pending";

/** Compact Credits display for Live World HUD — server ledger balance. */
export function CreditsBalanceChip() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await flushPendingQuestCredits();
        const res = await fetchCreditsBalance(getDemoCreditsUserId());
        if (!cancelled && res.ok) setBalance(res.balance);
      } catch {
        /* ignore */
      }
    })();
    const onFocus = () => {
      void fetchCreditsBalance(getDemoCreditsUserId()).then((res) => {
        if (!cancelled && res.ok) setBalance(res.balance);
      });
    };
    window.addEventListener("riftwilds-credits-updated", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("riftwilds-credits-updated", onFocus);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[rgba(8,12,22,0.82)] px-2.5 py-1.5 text-xs text-white backdrop-blur-md"
      title="Credits are soft currency — not SOL"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/ui/credits/icon.png" alt="" width={16} height={16} className="h-4 w-4" />
      <span className="font-display tabular-nums">
        {balance === null ? "…" : balance.toLocaleString()}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">cr</span>
    </div>
  );
}

export function emitCreditsUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("riftwilds-credits-updated"));
  }
}
