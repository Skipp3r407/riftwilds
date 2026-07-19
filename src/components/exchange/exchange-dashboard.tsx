"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EarningMethod, RiftExchangeDashboard } from "@/lib/exchange/types";
import { cn } from "@/lib/utils/cn";
import { playSfx } from "@/hooks/use-sfx";

type FilterId = "all" | "live" | "partial" | "scaffold" | "coming";

const STATUS_TONE: Record<EarningMethod["status"], string> = {
  live: "text-[var(--cyan)] border-[var(--cyan)]/40",
  partial: "text-[var(--amber)] border-[var(--amber)]/40",
  scaffold: "text-[var(--text-muted)] border-[var(--stroke)]",
  coming: "text-[var(--text-dim)] border-[var(--stroke)]",
};

function timeLeft(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return "Window closed";
  const h = Math.floor(ms / 3600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h left`;
  return `${h}h left`;
}

export function ExchangeDashboard() {
  const [dashboard, setDashboard] = useState<RiftExchangeDashboard | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetch("/api/exchange/dashboard")
      .then((r) => r.json())
      .then((j: { dashboard?: RiftExchangeDashboard }) => setDashboard(j.dashboard ?? null))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  const methods = useMemo(() => {
    if (!dashboard) return [];
    if (filter === "all") return dashboard.methods;
    return dashboard.methods.filter((m) => m.status === filter);
  }, [dashboard, filter]);

  if (loading) {
    return (
      <div className="panel p-6 text-sm text-[var(--text-muted)]">Loading Rift Exchange…</div>
    );
  }

  if (!dashboard) {
    return (
      <div className="panel p-6 text-sm text-[var(--coral)]">
        Could not load Exchange dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden p-5">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url(/assets/marketplace/desk-atmosphere.png)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(8,10,18,0.92)] via-[rgba(8,10,18,0.78)] to-[rgba(8,10,18,0.9)]"
          aria-hidden
        />
        <div className="relative z-[1] space-y-3">
          <p className="text-sm text-[var(--amber)]">{dashboard.framing}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/marketplace" className="btn-primary focus-ring text-sm">
              Player Marketplace
            </Link>
            <Link href="/rewards" className="btn-secondary focus-ring text-sm">
              Reward Center
            </Link>
            <Link href="/treasury" className="btn-secondary focus-ring text-sm">
              Treasury
            </Link>
            <Link href="/creators" className="btn-secondary focus-ring text-sm">
              Creator Hub
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.55)] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Reputation (demo)
              </p>
              <p className="mt-1 font-display text-2xl text-white">
                {dashboard.reputation.score}
              </p>
              <p className="text-xs text-[var(--cyan)]">{dashboard.reputation.tierLabel}</p>
            </div>
            <div className="rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.55)] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Live / partial paths
              </p>
              <p className="mt-1 font-display text-2xl text-white">
                {
                  dashboard.methods.filter((m) => m.status === "live" || m.status === "partial")
                    .length
                }
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                of {dashboard.methods.length} modular methods
              </p>
            </div>
            <div className="rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.55)] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Wallet
              </p>
              <p className="mt-1 font-display text-lg text-white">Optional</p>
              <p className="text-xs text-[var(--text-muted)]">
                Core play never requires SOL or a wallet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All"],
            ["live", "Live"],
            ["partial", "Partial"],
            ["scaffold", "Scaffold"],
            ["coming", "Coming"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              playSfx("ui.nav");
              setFilter(id);
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition",
              filter === id
                ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.12)] text-white"
                : "border-[var(--stroke)] text-[var(--text-muted)] hover:text-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" id="methods">
        {methods.map((m) => (
          <EarningMethodCard key={m.id} method={m} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel space-y-3 p-5" id="history">
          <h2 className="font-display text-lg text-white">Claim / history hooks</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Demo rows only — not a payout ledger. Ranges elsewhere are entertainment estimates.
          </p>
          <ul className="space-y-2">
            {dashboard.recentClaims.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-[var(--stroke)] bg-[rgba(8,10,18,0.45)] px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white">{c.label}</p>
                  <span className="shrink-0 text-[10px] uppercase text-[var(--text-dim)]">
                    {c.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--cyan)]">{c.amountLabel}</p>
              </li>
            ))}
          </ul>
          <Link href="/rewards" className="text-xs text-[var(--cyan)] underline">
            Open Reward Center for claimable vault balances →
          </Link>
        </section>

        <section className="panel space-y-3 p-5" id="leaderboard">
          <h2 className="font-display text-lg text-white">Contribution leaderboard</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Demo contribution scores — explicitly not SOL earnings rankings.
          </p>
          <ol className="space-y-2">
            {dashboard.leaderboard.map((row) => (
              <li
                key={row.rank}
                className="flex items-center justify-between rounded-md border border-[var(--stroke)] px-3 py-2"
              >
                <span className="text-sm text-white">
                  #{row.rank} {row.handle}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{row.scoreLabel}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel space-y-4 p-5" id="treasury">
        <h2 className="font-display text-lg text-white">Treasury allocation</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Configurable community buckets from verified activity — not a promise of player payouts.
        </p>
        <div className="space-y-2">
          {dashboard.treasuryAllocation.map((line) => (
            <div key={line.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-white">{line.label}</span>
                <span className="text-[var(--cyan)]">{line.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full bg-[var(--cyan)]/70"
                  style={{ width: `${line.percent}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--text-dim)]">{line.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel space-y-3 p-5" id="anti-abuse">
        <h2 className="font-display text-lg text-white">Reputation & anti-abuse</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--cyan)]">Enforced now</p>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-muted)]">
              {dashboard.antiAbuseSummary.real.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--amber)]">Scaffolded</p>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-muted)]">
              {dashboard.antiAbuseSummary.scaffold.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel space-y-2 p-5" id="bounties">
        <h2 className="font-display text-lg text-white">Disclaimers</h2>
        <ul className="space-y-1 text-sm text-[var(--text-muted)]">
          {dashboard.disclaimers.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>
        <p className="pt-2 text-[11px] text-[var(--text-dim)]" id="esports">
          Esports circuits and sponsorship paths remain coming/scaffold — spectator betting is never
          enabled.
        </p>
      </section>
    </div>
  );
}

function EarningMethodCard({ method }: { method: EarningMethod }) {
  const left = timeLeft(method.endsAt);
  return (
    <article className="panel flex flex-col gap-3 p-4 transition hover:border-[var(--cyan)]/35">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-dim)]">
            {method.category} · {method.difficulty}
          </p>
          <h3 className="mt-0.5 font-display text-lg text-white">{method.title}</h3>
        </div>
        <span
          className={cn(
            "shrink-0 rounded border px-2 py-0.5 text-[10px] uppercase tracking-wide",
            STATUS_TONE[method.status],
          )}
        >
          {method.status}
        </span>
      </div>
      <p className="text-sm text-[var(--text-muted)]">{method.summary}</p>
      <p className="text-xs text-[var(--amber)]">
        Est. reward range: <span className="text-white">{method.rewardRangeLabel}</span>
      </p>
      <p className="text-[11px] text-[var(--text-dim)]">
        Illustrative entertainment band — never a guarantee.
      </p>
      <ul className="space-y-0.5 text-[11px] text-[var(--text-muted)]">
        {method.requirements.slice(0, 3).map((r) => (
          <li key={r}>• {r}</li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-[11px] text-[var(--text-dim)]">
          Popularity {method.popularity}
          {left ? ` · ${left}` : ""}
          {method.progressPercent != null ? ` · ${method.progressPercent}%` : ""}
        </span>
        <Link
          href={method.href}
          onClick={() => playSfx("ui.click")}
          className="btn-secondary focus-ring text-xs"
        >
          Open
        </Link>
      </div>
      {method.progressPercent != null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <div
            className="h-full rounded-full bg-[var(--amber)]/70"
            style={{ width: `${method.progressPercent}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}
