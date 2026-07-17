"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EconomySummary } from "@/components/economy";
import { SectionTitleBand } from "@/components/shared/page-header";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";

type Metrics = {
  demoFallback?: boolean;
  refreshedAt?: string;
  economy?: Record<string, unknown>;
  treasury?: {
    metrics: Array<{
      key: string;
      label: string;
      amountRaw: string;
      asset: string;
      verified: boolean;
      isDemo: boolean;
      source: string;
      network: string;
      observedAt: string;
    }>;
  };
};

const DEMO_TREASURY_METRICS = [
  "total_verified_creator_fee_revenue",
  "total_growth_treasury",
  "total_pet_allocations",
  "total_operations_funding",
  "total_community_event_funding",
  "total_emergency_reserves",
  "total_marketplace_fees",
  "total_pet_allocations_claimed",
  "total_unclaimed",
  "completed_epochs",
  "currently_eligible_pets",
  "reward_active_wallets",
].map((key) => ({
  key,
  label: key.replace(/_/g, " "),
  amountRaw: "0",
  asset: "DEMO_CREDITS",
  verified: false,
  isDemo: true,
  source: "bootstrap-config",
  network: "devnet",
  observedAt: new Date().toISOString(),
}));

export default function TransparencyPage() {
  const [json, setJson] = useState<Metrics | null>(null);
  const policy = getActiveTreasuryPolicy();

  useEffect(() => {
    void fetch("/api/transparency/metrics")
      .then((r) => r.json())
      .then(setJson)
      .catch(() => setJson(null));
  }, []);

  const treasuryMetrics = json?.treasury?.metrics ?? DEMO_TREASURY_METRICS;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <SectionTitleBand slug="transparency" label="Transparency" kicker="Public ledger" />
        <p className="page-lede mt-4">
          Public game economy and systems status. No fabricated market data. Contracts are not claimed
          audited unless a named audit exists.
        </p>
      </div>

      <EconomySummary variant="compact" />

      <section className="panel p-6">
        <h2 className="font-display text-xl text-white">Live treasury metrics</h2>
        <p className="mt-2 text-xs text-[var(--amber)]">
          Demo / unverified zeros until on-chain deposits are recorded. Every row shows asset, source,
          network, and verification status.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Policy v{policy.version} · {policy.status} · Epoch rewards use published eligibility rules
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs text-[var(--text-muted)]">
            <thead className="text-[var(--text)]">
              <tr className="border-b border-[var(--stroke)]">
                <th className="py-2 pr-3">Metric</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Verified</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {treasuryMetrics.map((m) => (
                <tr key={m.key} className="border-b border-[var(--stroke)]">
                  <td className="py-2 pr-3 capitalize text-white">{m.label}</td>
                  <td className="py-2 pr-3 font-mono">{m.amountRaw}</td>
                  <td className="py-2 pr-3">{m.asset}</td>
                  <td className="py-2 pr-3">{m.verified ? "yes" : "no"}</td>
                  <td className="py-2 pr-3">
                    {m.source}
                    {m.isDemo ? " · DEMO" : ""}
                  </td>
                  <td className="py-2">{new Date(m.observedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/economy" className="btn-secondary focus-ring mt-4 inline-flex text-sm">
          Full economy policy
        </Link>
      </section>

      <pre className="panel overflow-x-auto p-4 text-xs text-[var(--text-muted)]">
        {json ? JSON.stringify(json, null, 2) : "Loading metrics…"}
      </pre>
    </div>
  );
}
