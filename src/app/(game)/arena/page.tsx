import Image from "next/image";
import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";
import { sectionUiThumbPath } from "@/lib/assets/paths";
import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { PageHeader, StatusChip } from "@/components/shared/page-header";

export const metadata = { title: "Riftwilds Arena" };

const links = [
  {
    href: "/arena/training",
    label: "Training",
    slug: "training",
    body: "Phase 1 — AI opponent, full server-authoritative combat.",
    enabled: featureFlagDefaults.ARENA_ENABLED,
  },
  {
    href: "/arena/loadout",
    label: "Loadout",
    slug: "loadout",
    body: "Equip starter weapons and set affinity for training.",
    enabled: featureFlagDefaults.WEAPONS_ENABLED,
  },
  {
    href: "/arena/history",
    label: "History",
    slug: "history",
    body: "Review recent training battles and Arena Points earned.",
    enabled: true,
  },
  {
    href: "/arena/duels",
    label: "Duels",
    slug: "duels",
    body: "Friend challenges — Phase 2.",
    enabled: featureFlagDefaults.CASUAL_DUELS_ENABLED,
  },
  {
    href: "/arena/ranked",
    label: "Ranked",
    slug: "ranked",
    body: "Seasonal Glicko-style ladder — Phase 3.",
    enabled: featureFlagDefaults.RANKED_DUELS_ENABLED,
  },
  {
    href: "/arena/tournaments",
    label: "Tournaments",
    slug: "tournaments",
    body: "Free entry brackets — Phase 4. No user-funded stakes.",
    enabled: featureFlagDefaults.TOURNAMENTS_ENABLED,
  },
  {
    href: "/arena/spectate",
    label: "Spectate",
    slug: "spectate",
    body: "Watch public battles in the Live World — Phase 2.",
    enabled: featureFlagDefaults.SPECTATOR_MODE_ENABLED,
  },
  {
    href: "/arena/leaderboard",
    label: "Leaderboard",
    slug: "leaderboard",
    body: "Seasonal Arena Points and ranks.",
    enabled: featureFlagDefaults.ARENA_POINTS_ENABLED,
  },
] as const;

export default function ArenaHomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Riftwilds Arena"
        titleSlug="arena"
        title="Arena"
        description="Skill-based turn battles for Riftlings. Earn non-transferable Arena Points through gameplay only — never purchase, sell, redeem, or wager real value."
        status={featureFlagDefaults.ARENA_ENABLED ? "Training open" : "Paused"}
        statusTone={featureFlagDefaults.ARENA_ENABLED ? "live" : "warn"}
        actions={
          <>
            <Link href="/arena/training" className="btn-primary focus-ring">
              Enter training
            </Link>
            <Link href="/arena/loadout" className="btn-secondary focus-ring">
              Build loadout
            </Link>
          </>
        }
      />

      <ArenaNoWageringBanner />

      <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <StatusChip tone="danger">No wagering</StatusChip>
        REAL_VALUE_WAGERING_ENABLED={String(REAL_VALUE_WAGERING_ENABLED)} (hard-disabled)
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="panel panel-interactive group block overflow-hidden focus-ring"
          >
            <div className="section-card-thumb border-b border-[rgba(61,231,255,0.12)]">
              <Image
                src={sectionUiThumbPath("arena", link.slug)}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="section-card-thumb__img"
                unoptimized
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg text-white">{link.label}</h2>
                {!link.enabled ? <StatusChip tone="warn">Soon</StatusChip> : null}
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{link.body}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
