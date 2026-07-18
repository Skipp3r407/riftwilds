"use client";

import Image from "next/image";
import {
  ABOUT_SLOGAN,
  affinityBirthVignettes,
  birthComicPanels,
  fullLorePanels,
  howRiftlingsCameToBe,
} from "@/content/about/riftwilds-origin";
import { ComicPanel } from "@/components/about/comic-panel";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { cn } from "@/lib/utils/cn";

/** Full-bleed atmospheric art behind card copy — dark scrims keep text readable. */
function CardArtBackground({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes={sizes}
        className="z-0 object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[rgba(4,6,14,0.94)] via-[rgba(4,6,14,0.72)] to-[rgba(4,6,14,0.42)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[rgba(4,6,14,0.55)] via-transparent to-transparent"
        aria-hidden
      />
    </>
  );
}

type Props = {
  className?: string;
};

/**
 * Long-form birth lore: fragment → bond → egg → hatch → identity,
 * comic panels, affinity vignettes, and expandable full-lore panels.
 */
export function HowRiftlingsCameToBe({ className }: Props) {
  const lore = howRiftlingsCameToBe;

  return (
    <section
      id={lore.id}
      aria-labelledby="how-riftlings-heading"
      className={cn(
        "scroll-mt-28 border-t border-[var(--stroke)] py-16 md:py-24",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <CinematicTextReveal
          as="p"
          className="font-display text-xs uppercase tracking-[0.22em] text-[var(--cyan)]"
        >
          {lore.kicker}
        </CinematicTextReveal>
        <CinematicTextReveal
          as="h2"
          delay={0.05}
          className="font-display mt-3 text-3xl text-white md:text-4xl"
        >
          <span id="how-riftlings-heading">{lore.heading}</span>
        </CinematicTextReveal>
        <CinematicTextReveal
          as="p"
          delay={0.1}
          className="mt-3 max-w-3xl text-base text-[var(--text-muted)] md:text-lg"
        >
          {lore.support}
        </CinematicTextReveal>

        <div className="mt-8 max-w-3xl space-y-4 border-l border-[var(--stroke-strong)] pl-4 md:pl-5">
          {lore.introduction.map((paragraph, i) => (
            <CinematicTextReveal
              key={i}
              as="p"
              delay={0.12 + i * 0.04}
              className="text-sm leading-relaxed text-[var(--text)] md:text-base"
            >
              {paragraph}
            </CinematicTextReveal>
          ))}
        </div>

        {/* Comic strip */}
        <div className="mt-12">
          <h3 className="font-display text-xl text-white">The becoming, in four moments</h3>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Captions live in the page — the art stays wordless for accessibility and clarity.
          </p>
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {birthComicPanels.map((panel, index) => (
              <li key={panel.id}>
                <ComicPanel
                  src={panel.src}
                  alt={panel.alt}
                  caption={panel.caption}
                  kicker={`Panel ${String(index + 1).padStart(2, "0")}`}
                  aspectClassName="aspect-[16/9]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Step-by-step lifecycle */}
        <ol className="mt-14 grid gap-4 lg:grid-cols-5">
          {lore.steps.map((step, index) => (
            <li
              key={step.id}
              className="panel relative flex min-h-[18rem] flex-col gap-2 overflow-hidden p-4"
            >
              <CardArtBackground
                src={step.image.src}
                alt={step.image.alt}
                sizes="(max-width: 1024px) 100vw, 20vw"
              />
              <div className="relative z-10 flex flex-col gap-2">
                <span className="font-display text-xs text-[var(--cyan)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  {String(index + 1).padStart(2, "0")} · {step.title}
                </span>
                <p className="text-sm font-medium leading-snug text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
                  {step.comicCaption}
                </p>
                <p className="text-sm leading-relaxed text-[rgba(220,228,240,0.92)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Bridge Fracture → Eggs → Keeper */}
        <div className="mt-14">
          <h3 className="font-display text-xl text-white">{lore.bridge.heading}</h3>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {lore.bridge.steps.map((step, index) => (
              <li
                key={step.title}
                className="panel relative min-h-[14rem] overflow-hidden p-5"
              >
                <CardArtBackground
                  src={step.image.src}
                  alt={step.image.alt}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="relative z-10">
                  <span className="font-display text-xs text-[var(--amber)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-display mt-2 text-lg text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(220,228,240,0.92)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                    {step.body}
                  </p>
                </div>
                {index < lore.bridge.steps.length - 1 ? (
                  <span
                    className="pointer-events-none absolute -right-2 top-1/2 z-20 hidden text-[var(--text-dim)] md:block"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        {/* Preservation purpose */}
        <div className="panel mt-10 p-5 md:p-6">
          <h3 className="font-display text-lg text-white">{lore.preservationNote.heading}</h3>
          {lore.preservationNote.body.map((p, i) => (
            <p key={i} className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
              {p}
            </p>
          ))}
          <p className="mt-4 font-display text-sm text-[var(--cyan)]">{ABOUT_SLOGAN}</p>
        </div>

        {/* Affinity birth vignettes */}
        <div className="mt-14">
          <h3 className="font-display text-xl text-white md:text-2xl">
            Birth vignettes by affinity
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Eleven ways a fragment found something worth keeping — short comic captions, then the
            quieter truth beneath them.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {affinityBirthVignettes.map((v) => (
              <li
                key={v.id}
                className="panel flex flex-col overflow-hidden border-t-2"
                style={{ borderTopColor: v.accent }}
              >
                <div className="relative aspect-[16/9] w-full bg-[rgba(0,0,0,0.35)]">
                  <Image
                    src={v.thumbSrc}
                    alt={v.thumbAlt}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover object-center"
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(6,8,14,0.75)] to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-display text-lg text-white" style={{ color: v.accent }}>
                      {v.affinity}
                    </h4>
                    <span className="shrink-0 text-[0.65rem] uppercase tracking-wider text-[var(--text-dim)]">
                      {v.bondMatter.split("·")[0]?.trim()}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug text-[var(--text)]">
                    “{v.comicCaption}”
                  </p>
                  <p className="text-xs text-[var(--text-dim)]">{v.bondMatter}</p>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{v.prose}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Expandable full lore */}
        <div className="mt-14">
          <h3 className="font-display text-xl text-white">Full lore — read deeper</h3>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
            Expand any panel for the longer telling. The short story above is enough; these are for
            keepers who want every fold.
          </p>
          <div className="mt-6 space-y-3">
            {fullLorePanels.map((panel) => (
              <details key={panel.id} className="panel group p-4 md:p-5">
                <summary className="focus-ring cursor-pointer list-none rounded font-display text-base text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <span>{panel.title}</span>
                    <span className="text-sm font-sans font-normal text-[var(--text-muted)]">
                      {panel.summary}
                    </span>
                  </span>
                </summary>
                <div className="mt-4 space-y-3 border-t border-[var(--stroke)] pt-4">
                  {panel.body.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-[var(--text-muted)]">
                      {p}
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
