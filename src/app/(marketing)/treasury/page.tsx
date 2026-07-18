"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StatusChip } from "@/components/shared/page-header";
import { TreasuryBucketCard } from "@/components/ecosystem/treasury-bucket-card";
import { TreasuryBudgetVisual } from "@/components/ecosystem/treasury-budget-visual";
import type { CommunityTreasuryDashboard } from "@/lib/ecosystem/treasury";
import { TREASURY_HERO_SRC } from "@/lib/ecosystem/treasury-art";

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
      <header className="panel relative overflow-hidden p-0">
        <div className="relative min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
          <Image
            src={TREASURY_HERO_SRC}
            alt="Riftwilds community treasury vault hall"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.94)] via-[rgba(6,12,24,0.72)] to-[rgba(6,12,24,0.35)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.92)] via-transparent to-[rgba(6,12,24,0.4)]"
            aria-hidden
          />
          <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-end p-5 sm:min-h-[240px] sm:p-6 md:min-h-[280px] md:p-8">
            <p className="page-kicker">Transparent ledger</p>
            <h1 className="page-title mt-2 text-left drop-shadow-sm">Community Treasury</h1>
            <p className="page-lede mt-3 max-w-xl text-left text-[rgba(220,230,245,0.92)]">
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
        </div>
      </header>

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
            {treasury.buckets.map((b, index) => (
              <TreasuryBucketCard key={b.key} bucket={b} priority={index < 2} />
            ))}
          </section>

          <TreasuryBudgetVisual budgets={treasury.budgets} growthNote={treasury.growthNote} />

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
