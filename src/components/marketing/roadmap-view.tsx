import Image from "next/image";
import Link from "next/link";
import { SectionTitleBand } from "@/components/shared/page-header";
import {
  ROADMAP_META,
  ROADMAP_PAGE_ART,
  ROADMAP_PHASES,
  ROADMAP_PILLARS,
  type RoadmapPhase,
  type RoadmapPillar,
} from "@/content/roadmap";
import { cn } from "@/lib/utils/cn";

const statusChipClass: Record<RoadmapPhase["statusTone"], string> = {
  live: "border-[rgba(61,231,255,0.45)] bg-[rgba(61,231,255,0.12)] text-[var(--cyan)]",
  next: "border-[rgba(255,184,77,0.45)] bg-[rgba(255,184,77,0.12)] text-[var(--amber)]",
  later: "border-white/20 bg-white/5 text-[var(--text-muted)]",
};

function PillarCard({ pillar }: { pillar: RoadmapPillar }) {
  return (
    <article className="relative min-h-[13.5rem] overflow-hidden rounded-xl border border-[rgba(61,231,255,0.22)] bg-[rgba(6,10,18,0.72)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:min-h-[14.5rem]">
      <Image
        src={pillar.imageSrc}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center"
        aria-hidden
        unoptimized
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(4,8,16,0.96)] via-[rgba(6,10,18,0.78)] to-[rgba(6,10,18,0.28)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(61,231,255,0.45)] to-transparent"
        aria-hidden
      />
      <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-5">
        <h3 className="font-display text-sm text-[var(--cyan)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
          {pillar.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{pillar.body}</p>
      </div>
    </article>
  );
}

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
  return (
    <article
      id={phase.id}
      className="panel relative scroll-mt-24 overflow-hidden p-0"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="grid md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <div className="relative min-h-[10.5rem] md:min-h-full">
          <Image
            src={phase.imageSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover object-center"
            aria-hidden
            unoptimized
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,10,18,0.75)] via-transparent to-[rgba(6,10,18,0.2)] md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[rgba(6,10,18,0.55)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                phase.statusTone === "live"
                  ? "radial-gradient(circle at 30% 40%, rgba(61,231,255,0.28), transparent 62%)"
                  : phase.statusTone === "next"
                    ? "radial-gradient(circle at 30% 40%, rgba(255,184,77,0.24), transparent 62%)"
                    : "radial-gradient(circle at 30% 40%, rgba(120,150,200,0.16), transparent 62%)",
            }}
            aria-hidden
          />
        </div>

        <div className="relative p-6 md:p-8">
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
                {phase.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-2xl text-white md:text-3xl">{phase.title}</h2>
            </div>
            <span
              className={cn(
                "inline-flex rounded-md border px-2.5 py-1 font-display text-xs uppercase tracking-[0.18em]",
                statusChipClass[phase.statusTone],
              )}
            >
              {phase.status}
            </span>
          </div>
          <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
            {phase.lede}
          </p>
          <ul className="relative mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
            {phase.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <div className="relative mt-6 flex flex-wrap gap-2">
            {phase.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="btn-secondary focus-ring !px-3 !py-1.5 text-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function RoadmapView() {
  return (
    <div className="relative pb-16">
      {/* Full-bleed atmospheric background (route has no shared RouteWallpaper entry). */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src={ROADMAP_PAGE_ART.background}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-[0.7]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(4,8,16,0.5)] via-[rgba(6,10,18,0.7)] to-[rgba(4,7,14,0.94)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(61,231,255,0.16),transparent_42%),radial-gradient(ellipse_at_88%_18%,rgba(255,184,77,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(4,8,16,0.3)_72%,rgba(4,8,16,0.58)_100%)]" />
      </div>

      <section className="relative overflow-hidden px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="mx-auto max-w-4xl">
          <SectionTitleBand
            slug="battle"
            label={ROADMAP_META.title}
            kicker={ROADMAP_META.kicker}
            className="mb-6"
          />
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
            {ROADMAP_META.intro}
          </p>
          <div className="mt-5 border border-[rgba(255,184,77,0.28)] bg-[rgba(12,10,6,0.72)] p-4 text-sm text-[var(--amber)] backdrop-blur-[2px]">
            {ROADMAP_META.disclaimer}
          </div>
          <nav aria-label="Roadmap phases" className="mt-6 flex flex-wrap gap-2">
            {ROADMAP_PHASES.map((phase) => (
              <a
                key={phase.id}
                href={`#${phase.id}`}
                className="focus-ring inline-flex rounded-md border border-[rgba(61,231,255,0.28)] bg-[rgba(8,12,20,0.72)] px-3 py-1.5 text-xs text-[var(--cyan)] transition hover:border-[rgba(255,184,77,0.45)] hover:text-[var(--amber)]"
              >
                {phase.status}: {phase.title.split("—")[0]?.trim() ?? phase.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-4xl gap-4 px-4 md:grid-cols-2 md:px-6">
        {ROADMAP_PILLARS.map((pillar) => (
          <PillarCard key={pillar.title} pillar={pillar} />
        ))}
      </section>

      <section className="relative mx-auto mt-10 max-w-4xl space-y-6 px-4 md:px-6">
        {ROADMAP_PHASES.map((phase, index) => (
          <PhaseCard key={phase.id} phase={phase} index={index} />
        ))}
      </section>

      <section className="relative mx-auto mt-12 max-w-4xl px-4 md:px-6">
        <div className="panel-soft p-6 text-sm text-[var(--text-muted)]">
          <h2 className="font-display text-xl text-white">Keep exploring</h2>
          <p className="mt-2">
            Patch history, Help, and economy transparency stay available while we ship.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/patch-notes" className="btn-secondary focus-ring text-sm">
              Patch Notes
            </Link>
            <Link href="/help" className="btn-secondary focus-ring text-sm">
              Help
            </Link>
            <Link href="/economy" className="btn-secondary focus-ring text-sm">
              Economy
            </Link>
            <Link href="/transparency" className="btn-secondary focus-ring text-sm">
              Transparency
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
