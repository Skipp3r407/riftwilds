"use client";

import { ABOUT_SLOGAN } from "@/content/about/riftwilds-origin";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { ImageButton } from "@/components/ui/image-button";
import { markOriginStorySeen } from "@/lib/origin-story";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

export function FinalStoryCTA({ className }: Props) {
  return (
    <section
      id="begin-story"
      aria-labelledby="begin-story-heading"
      className={cn(
        "relative overflow-hidden border-y border-[var(--stroke)] py-20 md:py-28",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(61,231,255,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
        <CinematicTextReveal
          as="p"
          className="font-display text-xs uppercase tracking-[0.22em] text-[var(--cyan)]"
        >
          The Call
        </CinematicTextReveal>
        <CinematicTextReveal
          as="h2"
          delay={0.05}
          className="font-display mt-3 text-3xl font-bold text-white md:text-5xl"
        >
          <span id="begin-story-heading">The next chapter is not written yet.</span>
        </CinematicTextReveal>
        <CinematicTextReveal
          as="p"
          delay={0.1}
          className="mt-4 text-base italic text-[var(--text-muted)] md:text-lg"
        >
          {ABOUT_SLOGAN}
        </CinematicTextReveal>
        <CinematicTextReveal
          as="div"
          delay={0.15}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <ImageButton href="/" variant="primary" className="text-base" onClick={markOriginStorySeen}>
            Continue to Riftwilds
          </ImageButton>
          <ImageButton href="/live-world" variant="secondary" className="text-base">
            BEGIN YOUR STORY
          </ImageButton>
          <ImageButton href="/codex/riftlings" variant="secondary" className="text-base">
            Open the Codex
          </ImageButton>
          <ImageButton href="/world" variant="secondary" className="text-base">
            Explore the Regions
          </ImageButton>
        </CinematicTextReveal>
      </div>
    </section>
  );
}
