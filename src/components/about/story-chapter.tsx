"use client";

import { aboutChapters, type AboutChapter } from "@/content/about/riftwilds-origin";
import { ParallaxScene } from "@/components/about/parallax-scene";
import { ComicPanel } from "@/components/about/comic-panel";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { cn } from "@/lib/utils/cn";

type Props = {
  chapter: AboutChapter;
  index: number;
  className?: string;
};

export function StoryChapter({ chapter, index, className }: Props) {
  const total = String(aboutChapters.length).padStart(2, "0");

  return (
    <section
      id={`chapter-${chapter.id}`}
      aria-labelledby={`chapter-heading-${chapter.id}`}
      className={cn("relative min-h-[min(100vh,920px)] scroll-mt-28", className)}
    >
      <ParallaxScene
        src={chapter.sceneSrc}
        alt={chapter.sceneAlt}
        accent={chapter.accent}
        priority={index === 0}
      />

      <div className="relative z-[1] mx-auto flex min-h-[min(100vh,920px)] max-w-7xl flex-col justify-end px-4 py-16 md:px-6 md:py-24">
        <div className="relative max-w-2xl">
          {/* Dark scrim behind copy so titles/dek/body stay readable on bright art */}
          <div
            className="pointer-events-none absolute -inset-x-3 -inset-y-5 rounded-2xl bg-[linear-gradient(105deg,rgba(4,6,14,0.92)_0%,rgba(4,6,14,0.86)_58%,rgba(4,6,14,0.55)_100%)] shadow-[0_12px_48px_rgba(0,0,0,0.45)] md:-inset-x-5 md:-inset-y-7"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-x-3 -inset-y-5 rounded-2xl ring-1 ring-inset ring-white/10 md:-inset-x-5 md:-inset-y-7"
            aria-hidden
          />

          <div className="relative px-4 py-5 md:px-6 md:py-6">
            <CinematicTextReveal
              as="p"
              className="font-display text-xs uppercase tracking-[0.22em] drop-shadow-[0_1px_10px_rgba(0,0,0,0.9)]"
            >
              <span style={{ color: chapter.accent }}>{chapter.kicker}</span>
              <span className="mx-2 text-white/45">·</span>
              <span className="text-white/70">
                {String(index + 1).padStart(2, "0")} / {total}
              </span>
            </CinematicTextReveal>

            <CinematicTextReveal
              as="h2"
              delay={0.05}
              className="font-display mt-3 text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] md:text-5xl"
            >
              <span id={`chapter-heading-${chapter.id}`}>{chapter.heading}</span>
            </CinematicTextReveal>

            <CinematicTextReveal
              as="p"
              delay={0.1}
              className="mt-4 text-base leading-relaxed text-[rgba(245,248,255,0.92)] drop-shadow-[0_1px_10px_rgba(0,0,0,0.85)] md:text-lg"
            >
              {chapter.support}
            </CinematicTextReveal>

            <div className="mt-6 space-y-4 border-l border-white/35 pl-4 md:pl-5">
              {chapter.body.map((paragraph, i) => (
                <CinematicTextReveal
                  key={i}
                  as="p"
                  delay={0.12 + i * 0.04}
                  className="text-sm leading-relaxed text-[rgba(245,248,255,0.95)] drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] md:text-base"
                >
                  {paragraph}
                </CinematicTextReveal>
              ))}
            </div>

            {chapter.comicInset ? (
              <CinematicTextReveal delay={0.28} className="mt-8">
                <ComicPanel
                  src={chapter.comicInset.src}
                  alt={chapter.comicInset.alt}
                  caption={chapter.comicInset.caption}
                  kicker="Comic inset"
                  aspectClassName="aspect-[16/9]"
                  sizes="(max-width: 768px) 100vw, 42rem"
                  className="max-w-xl"
                />
              </CinematicTextReveal>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
