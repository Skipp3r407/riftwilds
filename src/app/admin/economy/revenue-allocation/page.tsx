import Link from "next/link";
import { listPolicies, TREASURY_VAULTS, PAYMENT_SPLIT_STRATEGY, bpsToPercentLabel } from "@/lib/revenue/policies";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { revenueDisclosures } from "@/lib/revenue/disclosures";

export const metadata = { title: "Admin · Revenue allocation" };

const sections = [
  "Active shop policy",
  "Active marketplace policy",
  "Crafting policy",
  "Upgrade policy",
  "Listing-fee policy",
  "Policy history",
  "Unsettled balances",
  "Settlement batches",
  "Community Reward Treasury",
  "Reward epochs",
  "Claims",
  "Refund adjustments",
  "Reconciliation",
  "Treasury wallet health",
];

export default function AdminRevenueAllocationPage() {
  const policies = listPolicies();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Admin · Revenue allocation</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Propose future policies with effective dates. Never alter policies retroactively.
            Production changes should require two authorized approvals.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/economy/policies" className="btn-secondary focus-ring text-sm">
            Public history
          </Link>
          <Link href="/admin/economy" className="btn-secondary focus-ring text-sm">
            Economy admin
          </Link>
        </div>
      </div>

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Flags & settlement</h2>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          <li>REVENUE_ALLOCATION_ENABLED: {String(featureFlagDefaults.REVENUE_ALLOCATION_ENABLED)}</li>
          <li>SHOP_REVENUE_SPLIT_ENABLED: {String(featureFlagDefaults.SHOP_REVENUE_SPLIT_ENABLED)}</li>
          <li>
            MARKETPLACE_REVENUE_SPLIT_ENABLED:{" "}
            {String(featureFlagDefaults.MARKETPLACE_REVENUE_SPLIT_ENABLED)}
          </li>
          <li>REWARD_CLAIMS_ENABLED: {String(featureFlagDefaults.REWARD_CLAIMS_ENABLED)}</li>
          <li>
            AUTOMATIC_SETTLEMENT_ENABLED:{" "}
            {String(featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED)}
          </li>
          <li>
            ONCHAIN_ATOMIC_SPLIT_ENABLED:{" "}
            {String(featureFlagDefaults.ONCHAIN_ATOMIC_SPLIT_ENABLED)}
          </li>
          <li>PAYMENT_SPLIT_STRATEGY: {PAYMENT_SPLIT_STRATEGY}</li>
          <li>EGG_HOLDER_REWARDS_ENABLED: {String(featureFlagDefaults.EGG_HOLDER_REWARDS_ENABLED)}</li>
        </ul>
        <p className="mt-4 text-xs">{revenueDisclosures.holderRewards}</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl text-white">Bootstrap policies</h2>
        {policies.map((p) => (
          <article key={p.id} className="panel p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-white">{p.name}</h3>
              <span className="text-xs uppercase text-[var(--amber)]">{p.status}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {p.transactionType} · v{p.version} · {p.reason}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {p.entries.map((e) => (
                <li
                  key={e.destination}
                  className="rounded border border-[var(--stroke)] px-2 py-1"
                  style={{ borderColor: e.color }}
                >
                  {e.label}: {bpsToPercentLabel(e.basisPoints)} ({e.basisPoints} bps)
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Treasury vaults</h2>
        <ul className="mt-3 space-y-1 text-xs text-[var(--text-muted)]">
          {Object.entries(TREASURY_VAULTS).map(([key, v]) => (
            <li key={key}>
              {key}: {v.label} · {v.address}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {sections.map((s) => (
          <div key={s} className="panel p-4 text-sm text-[var(--text-muted)]">
            {s}
            <p className="mt-1 text-[10px]">Requires identity · reason · audit log</p>
          </div>
        ))}
      </section>

      <p className="text-xs text-[var(--amber)]">
        Admin actions (propose / approve / pause settlements / finalize epoch) are shelled — wire with
        dual approval before production.
      </p>
    </main>
  );
}
