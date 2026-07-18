import Link from "next/link";
import { getEconomyHealth } from "@/lib/credits/ledger";
import {
  CREDITS_CONFIG_VERSION,
  CREDITS_DISCLAIMER,
  FAUCET_SINK_PAIRINGS,
} from "@/lib/credits/config";

export const metadata = { title: "Admin · Credits Health" };
export const dynamic = "force-dynamic";

export default function AdminCreditsHealthPage() {
  const health = getEconomyHealth();

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="page-kicker">Ops · Credits</p>
          <h1 className="page-title mt-2">Credits Economy Health</h1>
          <p className="page-lede">
            Config v{CREDITS_CONFIG_VERSION}. Alerts never auto-mutate extreme values — admin
            adjusts config only.
          </p>
        </div>
        <Link href="/admin/content" className="btn-secondary focus-ring text-sm">
          Content Studio
        </Link>
      </div>

      <p className="panel border-[rgba(255,184,77,0.35)] p-3 text-sm text-[var(--amber)]">
        {CREDITS_DISCLAIMER}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Accounts" value={health.totalAccounts} />
        <Metric label="In circulation" value={health.totalCreditsInCirculation} />
        <Metric label="Lifetime credited" value={health.totalCreditedLifetime} />
        <Metric label="Lifetime burned" value={health.totalBurnedLifetime} />
      </div>

      <section className="panel space-y-2 p-4">
        <h2 className="font-display text-lg text-white">Alerts</h2>
        {health.alerts.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No alerts at this moment.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {health.alerts.map((a) => (
              <li key={a.code} className="text-[var(--amber)]">
                [{a.severity}] {a.code}: {a.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel space-y-2 p-4">
        <h2 className="font-display text-lg text-white">Faucet ↔ sink pairings</h2>
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          {FAUCET_SINK_PAIRINGS.map((p) => (
            <li key={p.faucet}>
              <span className="text-white">{p.faucet}</span> → {p.sinks.join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--text-dim)]">
        Snapshot at {health.at}. Live API: <code>/api/credits/health</code>
      </p>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase text-[var(--text-dim)]">{label}</p>
      <p className="mt-1 font-display text-2xl text-white">{value.toLocaleString()}</p>
    </div>
  );
}
