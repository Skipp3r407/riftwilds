import Link from "next/link";
import { projectConfig } from "@/lib/config/project";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { DEFAULT_ODDS } from "@/game/economy/hatch-odds";
import { HatcheryDashboard } from "@/components/hatchery/hatchery-dashboard";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { PageHeader, StatusChip } from "@/components/shared/page-header";

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
          Starter eggs are account-bound and never sellable. Breeding uses rising fees, cooldowns,
          and weekly global caps — rarity is never guaranteed. See marketplace breeding rules and{" "}
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
              className="panel-inset flex items-center justify-between px-3 py-2.5 text-sm"
            >
              <span className="text-[var(--text-muted)]">{rarity}</span>
              <span className="font-display text-white">{pct}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
