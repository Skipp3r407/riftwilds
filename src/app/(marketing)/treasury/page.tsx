"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import type { CommunityTreasuryDashboard } from "@/lib/ecosystem/treasury";

export default function TreasuryPage() {
  const [treasury, setTreasury] = useState<CommunityTreasuryDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/treasury")
      .then((r) => r.json())
      .then((json: { treasury?: CommunityTreasuryDashboard }) =>
        setTreasury(json.treasury ?? null),
      )
      .catch(() => setTreasury(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <SectionTitleBand slug="treasury" label="Community Treasury" kicker="Transparent ledger" />
        <p className="page-lede mt-4">
          Growth, reward vault, events, operations, and reserves. Blank means unknown — not zero.
          Token purchases do not fabricate pet SOL income.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/rewards" className="btn-primary focus-ring text-sm">
            Reward Center
          </Link>
          <Link href="/transparency" className="btn-secondary focus-ring text-sm">
            Transparency
          </Link>
          <Link href="/token" className="btn-secondary focus-ring text-sm">
            Token
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading treasury…</p>
      ) : treasury ? (
        <>
          <div className="flex items-center gap-2">
            <StatusChip tone={treasury.availability === "live" ? "live" : "warn"}>
              {treasury.availability}
            </StatusChip>
            <span className="text-xs text-[var(--text-dim)]">
              Updated {new Date(treasury.refreshedAt).toLocaleString()}
            </span>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {treasury.buckets.map((b) => (
              <article key={b.key} className="panel p-4">
                <h2 className="font-display text-lg text-white">{b.label}</h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{b.description}</p>
                <p className="mt-3 font-display text-2xl text-white">{b.balanceLabel}</p>
                <p className="mt-1 text-[10px] text-[var(--text-dim)]">
                  {b.asset}
                  {b.isDemo ? " · demo / awaiting ledger" : ""}
                  {b.verified ? " · verified" : ""}
                </p>
              </article>
            ))}
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-xl text-white">Budget policy</h2>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{treasury.growthNote}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {treasury.budgets.map((line) => (
                <li
                  key={line.key}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--stroke)] py-2"
                >
                  <span className="text-white">
                    {line.label}{" "}
                    <span className="text-[var(--text-dim)]">({line.allocationPercent}%)</span>
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{line.note}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <h2 className="font-display text-xl text-white">Recent flows</h2>
              <ul className="mt-3 space-y-3 text-xs text-[var(--text-muted)]">
                {treasury.recentFlows.map((f) => (
                  <li key={f.id} className="border-b border-[var(--stroke)] pb-2">
                    <p className="text-white">
                      {f.direction === "in" ? "In" : "Out"} · {f.label}
                    </p>
                    <p>
                      {f.amountLabel}
                      {f.txRef ? ` · ${f.txRef}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel space-y-4 p-5">
              <div>
                <h2 className="font-display text-xl text-white">Grants</h2>
                <ul className="mt-2 space-y-2 text-xs text-[var(--text-muted)]">
                  {treasury.grants.map((g) => (
                    <li key={g.id}>
                      <span className="text-white">{g.title}</span> — {g.status} ({g.askLabel})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-xl text-white">Votes</h2>
                <ul className="mt-2 space-y-2 text-xs text-[var(--text-muted)]">
                  {treasury.votes.map((v) => (
                    <li key={v.id}>
                      <span className="text-white">{v.title}</span> — {v.status}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
            <p>{treasury.distributionsNote}</p>
            {treasury.disclaimers.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </section>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Treasury unavailable.</p>
      )}
    </div>
  );
}
