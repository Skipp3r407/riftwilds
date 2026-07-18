import Image from "next/image";
import { getDemoTransparencyMetrics, DEMO_EPOCH } from "@/lib/revenue/demo-metrics";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  REVENUE_SECTION_ART,
  TRANSPARENCY_METRIC_ART,
} from "@/lib/revenue/revenue-art";

export function RevenueTransparencyMetrics() {
  if (!featureFlagDefaults.REVENUE_TRANSPARENCY_ENABLED) {
    return null;
  }

  const metrics = getDemoTransparencyMetrics();

  return (
    <section
      id="revenue-transparency"
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke)]"
    >
      <Image
        src={REVENUE_SECTION_ART.transparency}
        alt=""
        fill
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover object-center"
        aria-hidden
        unoptimized
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(6,12,24,0.78)] via-[rgba(6,12,24,0.88)] to-[rgba(6,12,24,0.94)]"
        aria-hidden
      />

      <div className="relative z-10 space-y-4 p-4 sm:p-5 md:p-6">
        <div>
          <h2 className="font-display text-2xl text-white drop-shadow-sm">
            Revenue transparency
          </h2>
          <p className="mt-1 text-xs text-[var(--amber)]">
            Demo Data — figures are placeholders until verified Solana sources are connected.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const art = TRANSPARENCY_METRIC_ART[m.key];
            return (
              <article
                key={m.key}
                className="relative min-h-[7.5rem] overflow-hidden rounded-md border border-[var(--stroke)]"
              >
                {art ? (
                  <Image
                    src={art.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center"
                    aria-hidden
                    unoptimized
                  />
                ) : null}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.96)] via-[rgba(6,12,24,0.82)] to-[rgba(6,12,24,0.48)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.55)] via-transparent to-[rgba(6,12,24,0.25)]"
                  aria-hidden
                />
                {art ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-90"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${art.accent}, transparent)`,
                    }}
                    aria-hidden
                  />
                ) : null}

                <div className="relative z-10 p-3 text-xs">
                  <p className="text-[rgba(220,230,245,0.88)] drop-shadow-sm">{m.label}</p>
                  <p className="mt-1 font-display text-lg text-white drop-shadow-sm">
                    {m.amountSol} {m.asset}
                  </p>
                  <p className="mt-1 text-[10px] text-[rgba(180,198,220,0.85)]">
                    {m.network} · {m.verificationStatus} · {m.source}
                  </p>
                  <p className="text-[10px] text-[rgba(180,198,220,0.75)]">
                    Updated {m.lastUpdate}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-2 rounded-md border border-[var(--stroke)] bg-[rgba(6,12,24,0.72)] p-4 text-xs text-[var(--text-muted)] backdrop-blur-[2px] sm:grid-cols-3">
          <p>Finalized epochs: {DEMO_EPOCH.finalizedEpochs}</p>
          <p>Eligible wallets: {DEMO_EPOCH.eligibleWallets}</p>
          <p>Eligible pets: {DEMO_EPOCH.eligiblePets}</p>
        </div>
      </div>
    </section>
  );
}
