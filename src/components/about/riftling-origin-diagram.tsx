"use client";

import { originDiagramNodes } from "@/content/about/riftwilds-origin";
import { ComicPanel } from "@/components/about/comic-panel";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

/**
 * Comic-panel diagram — how Gateway fragments become Riftlings and find keepers.
 */
export function RiftlingOriginDiagram({ className }: Props) {
  return (
    <section
      id="riftling-origin"
      aria-labelledby="riftling-origin-heading"
      className={cn("py-12 md:py-16", className)}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <CinematicTextReveal
          as="h2"
          className="font-display text-2xl text-white md:text-3xl"
        >
          <span id="riftling-origin-heading">How a Riftling begins</span>
        </CinematicTextReveal>
        <CinematicTextReveal
          as="p"
          delay={0.05}
          className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]"
        >
          Six comic steps from living Gateway cores to eggs, companions, and keepers.
          Titles stay in the page — the art stays wordless.
        </CinematicTextReveal>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {originDiagramNodes.map((node, index) => (
            <li key={node.id} className="panel relative overflow-hidden p-0">
              <ComicPanel
                src={node.comic.src}
                alt={node.comic.alt}
                aspectClassName="aspect-[4/3]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="rounded-none border-0 shadow-none"
                dense
              />
              <div className="flex flex-col gap-1 p-4">
                <span className="font-display text-xs text-[var(--cyan)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-base text-white">{node.label}</span>
                <span className="text-sm text-[var(--text-muted)]">{node.detail}</span>
              </div>
              {index < originDiagramNodes.length - 1 ? (
                <span
                  className="pointer-events-none absolute -right-2 top-[42%] z-[1] hidden text-[var(--amber)] lg:block"
                  aria-hidden
                >
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
