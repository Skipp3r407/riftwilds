"use client";

import { loreTimeline } from "@/content/about/riftwilds-origin";
import { ComicPanel } from "@/components/about/comic-panel";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

export function LoreTimeline({ className }: Props) {
  return (
    <section
      id="lore-timeline"
      aria-labelledby="lore-timeline-heading"
      className={cn("relative py-16 md:py-24", className)}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <CinematicTextReveal
          as="h2"
          className="font-display text-2xl text-white md:text-3xl"
        >
          <span id="lore-timeline-heading">Lore Timeline</span>
        </CinematicTextReveal>
        <CinematicTextReveal
          as="p"
          delay={0.05}
          className="mt-2 max-w-2xl text-sm text-[var(--text-muted)] md:text-base"
        >
          From the Age of Gateways to the Present Awakening — nine eras told as comic
          panels of the fracture, the keepers, and the awakening still ahead.
        </CinematicTextReveal>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {loreTimeline.map((entry, index) => (
            <CinematicTextReveal
              key={entry.id}
              as="li"
              delay={index * 0.04}
              className="panel overflow-hidden p-0"
            >
              <ComicPanel
                src={entry.comic.src}
                alt={entry.comic.alt}
                aspectClassName="aspect-[4/3]"
                sizes="(max-width: 768px) 100vw, 33vw"
                className="rounded-none border-0 shadow-none"
                dense
              />
              <div className="p-4 md:p-5">
                <span
                  className="font-display text-xs tracking-[0.18em] text-[var(--cyan)]"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-2 text-base text-white md:text-lg">
                  {entry.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{entry.summary}</p>
              </div>
            </CinematicTextReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
