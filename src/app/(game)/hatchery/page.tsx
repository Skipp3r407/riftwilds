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
            Free to play — no wallet, SOL, or {projectConfig.TOKEN_SYMBOL} required. Incubate eggs,
            hatch companions, and unlock matching collectible cards. Outcomes are server-rolled —
            never a guaranteed earnings promise.
          </>
        }
        status={featureFlagDefaults.HATCHING_ENABLED ? "Online" : "Paused"}
        statusTone={featureFlagDefaults.HATCHING_ENABLED ? "live" : "warn"}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusChip tone="live">Free to play</StatusChip>
          <StatusChip tone="live">No wallet needed</StatusChip>
          <StatusChip tone={featureFlagDefaults.STARTER_EGG_CLAIMS_ENABLED ? "live" : "warn"}>
            Starter claims {featureFlagDefaults.STARTER_EGG_CLAIMS_ENABLED ? "open" : "paused"}
          </StatusChip>
          <StatusChip tone="info">{LAUNCH_SPECIES.length} launch species</StatusChip>
        </div>
      </PageHeader>

      <HatcheryDashboard />

      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Free play & supply</h2>
        <p className="mt-2">
          Every new keeper gets one account-bound Starter Egg — guaranteed, no wallet. Earn more eggs
          through quests, bosses, login calendars, guild goals, battle pass free track, exploration,
          events, and achievements. Optional Credits eggs are a soft sink (never SOL). Optional{" "}
          {projectConfig.TOKEN_SYMBOL} holder perks are cosmetics only — never competitive power. See{" "}
          <code className="text-[var(--cyan)]">docs/economy/HATCHERY_ECONOMY.md</code> and{" "}
          <code className="text-[var(--cyan)]">docs/economy/FREE_TO_PLAY.md</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/play" className="btn-secondary focus-ring inline-flex text-sm">
            Play hub / onboarding
          </Link>
          <Link href="/quests" className="btn-secondary focus-ring inline-flex text-sm">
            Earn eggs via quests
          </Link>
          <Link href="/marketplace" className="btn-secondary focus-ring inline-flex text-sm">
            Marketplace & breeding
          </Link>
        </div>
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
