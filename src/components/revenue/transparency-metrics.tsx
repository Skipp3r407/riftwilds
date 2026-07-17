import { getDemoTransparencyMetrics, DEMO_EPOCH } from "@/lib/revenue/demo-metrics";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export function RevenueTransparencyMetrics() {
  if (!featureFlagDefaults.REVENUE_TRANSPARENCY_ENABLED) {
    return null;
  }

  const metrics = getDemoTransparencyMetrics();

  return (
    <section id="revenue-transparency" className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-white">Revenue transparency</h2>
        <p className="mt-1 text-xs text-[var(--amber)]">
          Demo Data — figures are placeholders until verified Solana sources are connected.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.key} className="panel p-3 text-xs">
            <p className="text-[var(--text-muted)]">{m.label}</p>
            <p className="mt-1 font-display text-lg text-white">{m.amountSol} {m.asset}</p>
            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
              {m.network} · {m.verificationStatus} · {m.source}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">Updated {m.lastUpdate}</p>
          </div>
        ))}
      </div>
      <div className="panel grid gap-2 p-4 text-xs text-[var(--text-muted)] sm:grid-cols-3">
        <p>Finalized epochs: {DEMO_EPOCH.finalizedEpochs}</p>
        <p>Eligible wallets: {DEMO_EPOCH.eligibleWallets}</p>
        <p>Eligible pets: {DEMO_EPOCH.eligiblePets}</p>
      </div>
    </section>
  );
}
