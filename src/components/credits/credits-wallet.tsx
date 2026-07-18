"use client";

import { useEffect, useState } from "react";
import { CREDITS_DISCLAIMER } from "@/lib/credits/config";
import { fetchCreditsBalance, getDemoCreditsUserId } from "@/lib/credits/client";

type BalancePayload = {
  balance: number;
  recent?: { delta: number; reason: string; createdAt: string }[];
  disclaimer?: string;
};

export function CreditsWallet({ demoUser }: { demoUser?: string }) {
  const [data, setData] = useState<BalancePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = demoUser ?? (typeof window !== "undefined" ? getDemoCreditsUserId() : "demo-keeper");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchCreditsBalance(user);
        if (!json.ok) {
          if (!cancelled) setError(json.error ?? "Failed to load Credits");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Network error loading Credits");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <section className="panel space-y-3 p-4">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/ui/credits/icon.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">Credits wallet</p>
          <p className="font-display text-2xl font-bold text-white">
            {data ? data.balance.toLocaleString() : "…"}
          </p>
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <p className="text-xs text-[var(--text-muted)]">{data?.disclaimer ?? CREDITS_DISCLAIMER}</p>
      {data?.recent?.length ? (
        <ul className="space-y-1 text-xs text-[var(--text-muted)]">
          {data.recent.slice(0, 5).map((e, i) => (
            <li key={`${e.createdAt}-${i}`} className="flex justify-between gap-2">
              <span>{e.reason}</span>
              <span className={e.delta >= 0 ? "text-[var(--cyan)]" : "text-[var(--amber)]"}>
                {e.delta >= 0 ? "+" : ""}
                {e.delta}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
