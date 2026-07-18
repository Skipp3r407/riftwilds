import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getSolEconomyAdminPanel } from "@/lib/economy/sol";

export const metadata = { title: "Admin · SOL Economy" };

export default function AdminSolEconomyPage() {
  const panel = getSolEconomyAdminPanel();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white">Admin · SOL Economy</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Read-only scaffolding. Gold (Credits) + Rift Shards power play. All SOL_* flags
            default false. Network: {panel.network}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/economy" className="btn-secondary focus-ring text-sm">
            Economy home
          </Link>
          <Link href="/admin/economy/credits" className="btn-secondary focus-ring text-sm">
            Credits
          </Link>
        </div>
      </div>

      <section className="panel space-y-3 p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Mandate flags</h2>
        <p>
          All off: <span className="text-white">{String(panel.allSolFlagsOff)}</span>
        </p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {Object.entries(panel.flags).map(([key, value]) => (
            <li key={key}>
              {key}: <span className="text-white">{String(value)}</span>
            </li>
          ))}
          <li>
            REAL_SOL_MARKETPLACE_ENABLED:{" "}
            <span className="text-white">
              {String(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED)}
            </span>
          </li>
          <li>
            SOL_PURCHASES_ENABLED:{" "}
            <span className="text-white">
              {String(featureFlagDefaults.SOL_PURCHASES_ENABLED)}
            </span>
          </li>
        </ul>
      </section>

      <section className="panel space-y-3 p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Fee preview (1 SOL example)</h2>
        <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs text-white">
          {JSON.stringify(panel.feeExample1Sol, null, 2)}
        </pre>
      </section>

      <section className="panel space-y-3 p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Warnings</h2>
        <ul className="list-disc space-y-1 pl-5">
          {panel.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
