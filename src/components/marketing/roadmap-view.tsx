import Link from "next/link";
import { SectionTitleBand } from "@/components/shared/page-header";
import {
  ROADMAP_META,
  ROADMAP_PHASES,
  ROADMAP_PILLARS,
  type RoadmapPhase,
} from "@/content/roadmap";
import { cn } from "@/lib/utils/cn";

const statusChipClass: Record<RoadmapPhase["statusTone"], string> = {
  live: "border-[rgba(61,231,255,0.45)] bg-[rgba(61,231,255,0.12)] text-[var(--cyan)]",
  next: "border-[rgba(255,184,77,0.45)] bg-[rgba(255,184,77,0.12)] text-[var(--amber)]",
  later: "border-white/20 bg-white/5 text-[var(--text-muted)]",
};

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
  return (
    <article
      id={phase.id}
      className="scroll-mt-24 panel relative overflow-hidden p-6 md:p-8"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40"
        style={{
          background:
            phase.statusTone === "live"
              ? "radial-gradient(circle, rgba(61,231,255,0.22), transparent 70%)"
              : phase.statusTone === "next"
                ? "radial-gradient(circle, rgba(255,184,77,0.2), transparent 70%)"
                : "radial-gradient(circle, rgba(120,150,200,0.12), transparent 70%)",
        }}
        aria-hidden
      />
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
          <Link key={link.href} href={link.href} className="btn-secondary focus-ring !px-3 !py-1.5 text-xs">
            {link.label}
          </Link>
        ))}
      </div>
    </article>
  );
}

export function RoadmapView() {
  return (
    <div className="relative pb-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 12% 0%, rgba(61,231,255,0.14), transparent 42%), radial-gradient(ellipse at 88% 18%, rgba(255,184,77,0.11), transparent 40%), linear-gradient(180deg, rgba(6,10,20,0.2) 0%, rgba(8,12,22,0.85) 55%, rgba(8,10,18,1) 100%)",
        }}
        aria-hidden
      />

      <section className="relative overflow-hidden px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="mx-auto max-w-4xl">
          <SectionTitleBand
            slug="docs"
            label={ROADMAP_META.title}
            kicker={ROADMAP_META.kicker}
            className="mb-6"
          />
          <p className="max-w-2xl text-base leading-relaxed text-[var(--text-muted)] md:text-lg">
            {ROADMAP_META.intro}
          </p>
          <div className="mt-5 panel border-[rgba(255,184,77,0.28)] p-4 text-sm text-[var(--amber)]">
            {ROADMAP_META.disclaimer}
          </div>
          <nav aria-label="Roadmap phases" className="mt-6 flex flex-wrap gap-2">
            {ROADMAP_PHASES.map((phase) => (
              <a
                key={phase.id}
                href={`#${phase.id}`}
                className="focus-ring inline-flex rounded-md border border-[rgba(61,231,255,0.28)] bg-[rgba(8,12,20,0.65)] px-3 py-1.5 text-xs text-[var(--cyan)] transition hover:border-[rgba(255,184,77,0.45)] hover:text-[var(--amber)]"
              >
                {phase.status}: {phase.title.split("—")[0]?.trim() ?? phase.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-4 md:grid-cols-2 md:px-6">
        {ROADMAP_PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-xl border border-[rgba(61,231,255,0.18)] bg-[rgba(8,12,20,0.55)] px-4 py-4"
          >
            <h3 className="font-display text-sm text-[var(--cyan)]">{pillar.title}</h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{pillar.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-10 max-w-4xl space-y-6 px-4 md:px-6">
        {ROADMAP_PHASES.map((phase, index) => (
          <PhaseCard key={phase.id} phase={phase} index={index} />
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-4 md:px-6">
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
