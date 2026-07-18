import Link from "next/link";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { AllocationDonut, AllocationCards } from "@/components/economy";

export const metadata = { title: "Admin · Economy" };

const emergencyControls = [
  "Pause deposits processing",
  "Pause reward calculation",
  "Pause claims",
  "Pause marketplace listings",
  "Pause marketplace purchases",
  "Pause permanent death",
  "Enable maintenance banner",
];

const sections = [
  "Allocation policy editor",
  "Policy version history",
  "Revenue deposits",
  "Treasury balances",
  "Spending records",
  "Reward epochs",
  "Eligibility rules",
  "Care timers",
  "Marketplace fee policy",
  "Claims",
  "Reconciliation",
  "Fraud flags",
  "Emergency controls",
  "Public disclosure editor",
];

export default function AdminEconomyPage() {
  const policy = getActiveTreasuryPolicy();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Admin · Economy</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Policy v{policy.version} ({policy.status}). Financial mutations require role, reason,
            audit log, and confirmation. Never silently edit completed ledger rows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/economy/revenue-allocation"
            className="btn-primary focus-ring text-sm"
          >
            Revenue allocation
          </Link>
          <Link href="/admin/economy/simulator" className="btn-secondary focus-ring text-sm">
            Simulator
          </Link>
          <Link href="/admin/economy/health" className="btn-secondary focus-ring text-sm">
            Health
          </Link>
          <Link href="/admin/economy/sol" className="btn-secondary focus-ring text-sm">
            SOL economy
          </Link>
          <Link href="/economy" className="btn-secondary focus-ring text-sm">
            Public economy
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <AllocationDonut allocations={policy.allocations} />
        <div className="panel p-5 text-sm text-[var(--text-muted)]">
          <h2 className="font-display text-lg text-white">Active flags</h2>
          <ul className="mt-3 space-y-1">
            <li>EPOCH_REWARDS_ENABLED: {String(featureFlagDefaults.EPOCH_REWARDS_ENABLED)}</li>
            <li>
              REAL_MONEY_REWARDS_ENABLED: {String(featureFlagDefaults.REAL_MONEY_REWARDS_ENABLED)}
            </li>
            <li>
              REAL_SOL_MARKETPLACE_ENABLED:{" "}
              {String(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED)}
            </li>
            <li>
              PERMANENT_DEATH_ENABLED: {String(featureFlagDefaults.PERMANENT_DEATH_ENABLED)}
            </li>
            <li>MAINTENANCE_MODE: {String(featureFlagDefaults.MAINTENANCE_MODE)}</li>
          </ul>
          <p className="mt-4 text-xs">
            Editors for AllocationPolicy / MarketplaceFeePolicy / RewardEpoch will write versioned
            rows + AuditLog. UI shell only until authz is wired.
          </p>
        </div>
      </section>

      <AllocationCards />

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Emergency controls</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {emergencyControls.map((c) => (
            <button
              key={c}
              type="button"
              className="btn-secondary justify-start px-3 py-2 text-left text-xs"
              disabled
              title="Requires admin confirmation + audit reason"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {sections.map((s) => (
          <div key={s} className="panel p-4 text-sm text-[var(--text-muted)]">
            {s}
          </div>
        ))}
      </section>
    </main>
  );
}
