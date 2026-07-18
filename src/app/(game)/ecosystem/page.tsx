import Image from "next/image";
import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { ThumbnailCard } from "@/components/ecosystem/thumbnail-card";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { sectionUiThumbPath } from "@/lib/assets/paths";
import { buildEcosystemSnapshot } from "@/game/expansion/ecosystem";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";
import { getCivilizationProgress } from "@/game/civilization/progress-store";
import { resolveFestivalOccurrences } from "@/game/festivals/calendar";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { ACHIEVEMENT_CATALOG } from "@/game/achievements/catalog";
import { SAMPLE_STORY_ARCS } from "@/game/story/arcs/sample-branching";

export const metadata = { title: "Ecosystem" };

export default function EcosystemPage() {
  const enabled = featureFlagDefaults.ECOSYSTEM_DASHBOARD_ENABLED;
  const snapshot = buildEcosystemSnapshot();
  const civ = getCivilizationProgress();
  const clock = resolveLivingWorldClock();
  const festivals = resolveFestivalOccurrences(clock);

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Decade foundations"
        titleSlug="ecosystem"
        title="Riftwilds Ecosystem"
        description="Living world, civilization restoration, story arcs, festivals, and expansion packs — modular systems built to grow for years."
        status={enabled ? "Foundations live" : "Paused"}
        statusTone={enabled ? "live" : "warn"}
        actions={
          <>
            <Link href="/live-world" className="btn-primary focus-ring">
              Enter Live World
            </Link>
            <Link href="/homestead" className="btn-secondary focus-ring">
              Homestead
            </Link>
          </>
        }
      />

      {!enabled ? (
        <section className="panel p-6 text-sm text-[var(--text-muted)]">
          Ecosystem dashboard is paused by `ECOSYSTEM_DASHBOARD_ENABLED`.
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="panel p-4">
              <p className="text-xs text-[var(--text-muted)]">Season</p>
              <p className="mt-1 font-display text-xl text-white">
                {snapshot.livingWorld.season}
              </p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                {snapshot.livingWorld.dayPhase} · {snapshot.livingWorld.weather}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-xs text-[var(--text-muted)]">Civilization</p>
              <p className="mt-1 font-display text-xl text-white">
                {snapshot.civilization.era}
              </p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                {snapshot.civilization.unlockedMilestones}/
                {snapshot.civilization.totalMilestones} milestones ·{" "}
                {snapshot.civilization.progressPercent}%
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-xs text-[var(--text-muted)]">Achievements</p>
              <p className="mt-1 font-display text-xl text-white">
                {snapshot.achievements.catalogSize}
              </p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">Catalog entries seeded</p>
            </div>
            <div className="panel p-4">
              <p className="text-xs text-[var(--text-muted)]">Festivals</p>
              <p className="mt-1 font-display text-xl text-white">
                {snapshot.festivals.active} active
              </p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                {snapshot.festivals.upcoming} upcoming in calendar
              </p>
            </div>
          </section>

          {snapshot.livingWorld.disasterActive ? (
            <section className="panel border-[rgba(255,184,77,0.35)] p-4">
              <StatusChip tone="warn">Disaster</StatusChip>
              <p className="mt-2 text-sm text-white">
                Active world pressure: {snapshot.livingWorld.disasterActive}
              </p>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h2 className="font-display text-lg text-white">Expansion packs</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {snapshot.packs.map((pack) => (
                  <li
                    key={pack.id}
                    className="rounded-md border border-[var(--stroke)] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white">{pack.name}</span>
                      <span className="text-xs text-[var(--cyan)]">v{pack.version}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {pack.entryCount} content entries · {pack.phase}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--text-dim)]">
                Content registry counts:{" "}
                {Object.entries(snapshot.countsByKind)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(" · ")}
              </p>
            </div>

            <div className="panel p-5">
              <h2 className="font-display text-lg text-white">Civilization milestones</h2>
              <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm">
                {CIVILIZATION_MILESTONES.map((m, index) => {
                  const contributed = civ.contributions[m.key] ?? 0;
                  const unlocked = civ.unlockedMilestoneKeys.includes(m.key);
                  return (
                    <ThumbnailCard
                      key={m.key}
                      imageSrc={m.imageSrc}
                      imageAlt={m.name}
                      priority={index < 2}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-white drop-shadow-sm">
                          {m.name}
                        </span>
                        <StatusChip tone={unlocked ? "live" : "warn"}>
                          {unlocked ? "Restored" : `${contributed}/${m.threshold}`}
                        </StatusChip>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-[rgba(220,230,245,0.88)] drop-shadow-sm">
                        {m.description}
                      </p>
                    </ThumbnailCard>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-[var(--text-dim)]">
                Cooperative entertainment progress — no cash value. API:{" "}
                <code className="text-[var(--cyan)]">/api/civilization</code>
                {" · "}
                <Link href="/restoration" className="text-[var(--cyan)]">
                  Full restoration board
                </Link>
              </p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h2 className="font-display text-lg text-white">Story arcs</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {SAMPLE_STORY_ARCS.map((arc) => (
                  <ThumbnailCard
                    key={arc.key}
                    imageSrc={arc.imageSrc}
                    imageAlt={arc.name}
                  >
                    <p className="font-medium text-white drop-shadow-sm">{arc.name}</p>
                    <p className="mt-1 line-clamp-3 text-xs text-[rgba(220,230,245,0.88)] drop-shadow-sm">
                      {arc.synopsis}
                    </p>
                  </ThumbnailCard>
                ))}
              </ul>
              <Link
                href="/api/story/arcs"
                className="mt-3 inline-block text-xs text-[var(--cyan)]"
              >
                Story engine API
              </Link>
            </div>
            <div className="panel p-5">
              <h2 className="font-display text-lg text-white">Festival calendar</h2>
              <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm">
                {festivals.map((f) => (
                  <ThumbnailCard
                    key={f.festival.key}
                    imageSrc={f.festival.imageSrc}
                    imageAlt={f.festival.name}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-white drop-shadow-sm">
                        {f.festival.name}
                      </span>
                      <StatusChip tone={f.active ? "live" : "warn"}>
                        {f.active
                          ? "Active"
                          : `In ${f.upcomingInDays ?? "?"} days`}
                      </StatusChip>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-[rgba(220,230,245,0.88)] drop-shadow-sm">
                      {f.festival.description}
                    </p>
                  </ThumbnailCard>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="font-display text-lg text-white">Systems & entry points</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              {[
                { href: "/api/world/clock", label: "World clock API", slug: "world-clock" },
                { href: "/api/archivist?topic=ember", label: "AI Archivist", slug: "ai-archivist" },
                { href: "/api/achievements", label: "Achievement catalog", slug: "achievement-catalog" },
                { href: "/api/timeline", label: "Living timeline", slug: "living-timeline" },
                { href: "/api/housing/catalog", label: "Housing catalog", slug: "housing-catalog" },
                { href: "/api/expansion/packs", label: "Expansion packs", slug: "expansion-packs" },
                { href: "/quests", label: "Quest board", slug: "quest-board" },
                { href: "/dashboard", label: "Player dashboard", slug: "player-dashboard" },
                { href: "/restoration", label: "World restoration", slug: "world-restoration" },
                { href: "/treasury", label: "Community treasury", slug: "community-treasury" },
                { href: "/rewards", label: "Reward center", slug: "reward-center" },
                { href: "/social", label: "Social hub", slug: "social-hub" },
                { href: "/creators", label: "Creator hub", slug: "creator-hub" },
                { href: "/codex/riftlings", label: "Riftling Codex", slug: "riftling-codex" },
                { href: "/admin/analytics", label: "Analytics admin", slug: "analytics-admin" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2.5 rounded-md border border-[var(--stroke)] px-3 py-2 text-[var(--cyan)] transition-colors hover:border-[rgba(61,231,255,0.35)] hover:bg-[rgba(61,231,255,0.04)]"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[radial-gradient(ellipse_at_center,rgba(61,231,255,0.12),transparent_70%)]">
                    <Image
                      src={sectionUiThumbPath("ecosystem", link.slug)}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                      unoptimized
                      aria-hidden
                    />
                  </span>
                  <span className="leading-snug">{link.label}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--text-dim)]">
              Achievement universe: {ACHIEVEMENT_CATALOG.length} defs. Roadmap:{" "}
              <code className="text-[var(--cyan)]">docs/TEN_YEAR_EXPANSION_PLAN.md</code>
              {" · "}
              Transition:{" "}
              <code className="text-[var(--cyan)]">docs/ECOSYSTEM_TRANSITION.md</code>
            </p>
          </section>
        </>
      )}
    </div>
  );
}
