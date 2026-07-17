import Link from "next/link";
import { listPolicies, bpsToPercentLabel } from "@/lib/revenue/policies";
import { revenueDisclosures } from "@/lib/revenue/disclosures";

export const metadata = {
  title: "Economy policies",
  description: "Public version history for Riftwilds revenue allocation policies.",
};

export default function EconomyPoliciesPage() {
  const policies = listPolicies();

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-12 md:px-6">
      <div>
        <Link href="/economy" className="text-sm text-[var(--cyan)] underline">
          ← Economy
        </Link>
        <h1 className="font-display mt-4 text-4xl text-white">Allocation policy history</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Compare published versions. Policies never rewrite historical purchases.
        </p>
        <p className="mt-2 text-xs text-[var(--amber)]">{revenueDisclosures.policyMayChange}</p>
      </div>

      <div className="space-y-4">
        {policies.map((p) => (
          <article key={p.id} className="panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl text-white">{p.name}</h2>
              <span className="text-xs uppercase tracking-wider text-[var(--amber)]">
                {p.status}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-2">
              <div>
                <dt className="uppercase tracking-wider">Transaction type</dt>
                <dd className="text-white">{p.transactionType}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider">Version</dt>
                <dd className="text-white">{p.version}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider">Effective</dt>
                <dd className="text-white">{new Date(p.effectiveFrom).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider">End</dt>
                <dd className="text-white">{p.effectiveUntil ?? "Open"}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-1 text-sm">
              {p.entries.map((e) => (
                <li key={e.destination} className="flex justify-between gap-3">
                  <span className="text-[var(--text-muted)]">{e.label}</span>
                  <span style={{ color: e.color }}>{bpsToPercentLabel(e.basisPoints)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--text-muted)]">Reason: {p.reason}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
