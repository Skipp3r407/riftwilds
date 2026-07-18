import Link from "next/link";
import { projectConfig } from "@/lib/config/project";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { DEFAULT_ODDS } from "@/game/economy/hatch-odds";
import { HatcheryDashboard } from "@/components/hatchery/hatchery-dashboard";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { hatcheryRarityIconPath } from "@/lib/assets/paths";

export const metadata = { title: "Hatchery" };

export default function HatcheryPage() {
  return (
    <div className="relative space-y-6">
      <PageHeader
        kicker="Incubation bay"
        titleSlug="hatchery"
        title="Hatchery"
        description={
          <>
            Incubate eggs, track countdowns, and reveal new {projectConfig.CREATURE_NAME_PLURAL}.
            Hatch outcomes are determined server-side — no simulated near-misses.
          </>
        }
        status={featureFlagDefaults.HATCHING_ENABLED ? "Online" : "Paused"}
        statusTone={featureFlagDefaults.HATCHING_ENABLED ? "live" : "warn"}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusChip tone={featureFlagDefaults.STARTER_EGG_CLAIMS_ENABLED ? "live" : "warn"}>
            Starter claims {featureFlagDefaults.STARTER_EGG_CLAIMS_ENABLED ? "open" : "paused"}
          </StatusChip>
          <StatusChip tone="info">{LAUNCH_SPECIES.length} launch species</StatusChip>
        </div>
      </PageHeader>

      <HatcheryDashboard />

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Supply & breeding</h2>
        <p className="mt-2">
          Free starter eggs are limited (first-come global pool) and account-bound — never sellable.
          When free stock is gone, keepers can still buy eggs with Credits at a premium late-game
          price (soft currency sink, never SOL). Breeding uses rising fees, cooldowns, and weekly
          global caps — rarity is never guaranteed. See marketplace breeding rules and{" "}
          <code className="text-[var(--cyan)]">docs/MARKETPLACE_ECONOMY.md</code>.
        </p>
        <Link href="/marketplace" className="btn-secondary focus-ring mt-4 inline-flex text-sm">
          Marketplace & breeding rules
        </Link>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-white">Published rarity odds</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Fixed table shown before every hatch roll.
            </p>
          </div>
          <Link href="/fairness" className="text-xs text-[var(--cyan)] hover:underline">
            Fairness details →
          </Link>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(DEFAULT_ODDS).map(([rarity, pct]) => (
            <li
              key={rarity}
              className="panel-inset flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-[var(--text-muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hatcheryRarityIconPath(rarity)}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 object-contain drop-shadow-[0_0_8px_rgba(61,231,255,0.2)]"
                />
                <span className="truncate">{rarity}</span>
              </span>
              <span className="font-display shrink-0 text-white">{pct}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
