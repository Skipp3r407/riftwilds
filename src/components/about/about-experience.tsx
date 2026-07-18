"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ABOUT_SLOGAN,
  aboutChapters,
  characterProfiles,
  infoBlocks,
  whyEggsExist,
  whyPetsEvolve,
  whyRiftlingsWereMade,
} from "@/content/about/riftwilds-origin";
import { CinematicHero } from "@/components/about/cinematic-hero";
import { StoryChapter } from "@/components/about/story-chapter";
import { ChapterNavigation } from "@/components/about/chapter-navigation";
import { StoryProgress } from "@/components/about/story-progress";
import { NarrationControls } from "@/components/about/narration-controls";
import { LoreTimeline } from "@/components/about/lore-timeline";
import { CharacterProfile } from "@/components/about/character-profile";
import { RiftlingOriginDiagram } from "@/components/about/riftling-origin-diagram";
import { HowRiftlingsCameToBe } from "@/components/about/how-riftlings-came-to-be";
import { FinalStoryCTA } from "@/components/about/final-story-cta";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { ComicPanel } from "@/components/about/comic-panel";
import { CommercialShowcase } from "@/components/marketing/commercial-showcase";
import { markOriginStorySeen } from "@/lib/origin-story";

function useActiveChapter() {
  const [activeId, setActiveId] = useState(aboutChapters[0]?.id);

  useEffect(() => {
    const nodes = aboutChapters
      .map((c) => document.getElementById(`chapter-${c.id}`))
      .filter((n): n is HTMLElement => Boolean(n));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const id = visible.target.id.replace("chapter-", "");
        setActiveId(id as (typeof aboutChapters)[number]["id"]);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  return activeId;
}

function isLeavingAboutHref(href: string): boolean {
  if (!href || href.startsWith("#")) return false;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return true;
    return !url.pathname.startsWith("/about");
  } catch {
    return false;
  }
}

export function AboutExperience() {
  const [introSkipped, setIntroSkipped] = useState(false);
  const activeId = useActiveChapter();

  const onSkipIntro = useCallback(() => {
    // Dismissing the cinematic counts as having seen the origin story gate.
    markOriginStorySeen();
    setIntroSkipped(true);
    const origin = document.getElementById("origin");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    origin?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, []);

  // Mark seen when leaving /about via any in-app link (logo, Home, CTAs, nav)
  // so middleware won't bounce returning navigations back to the story.
  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !isLeavingAboutHref(href)) return;
      markOriginStorySeen();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  return (
    <div className="relative bg-[rgba(6,8,14,0.35)]">
      <StoryProgress />
      <CinematicHero onSkipIntro={onSkipIntro} introSkipped={introSkipped} />
      <ChapterNavigation activeId={activeId} />

      <div id="origin" className="scroll-mt-28">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <NarrationControls />
        </div>

        {aboutChapters.map((chapter, index) => (
          <StoryChapter key={chapter.id} chapter={chapter} index={index} />
        ))}
      </div>

      <HowRiftlingsCameToBe />
      <RiftlingOriginDiagram />

      <section
        id="characters"
        aria-labelledby="characters-heading"
        className="border-t border-[var(--stroke)] py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <CinematicTextReveal
            as="h2"
            className="font-display text-2xl text-white md:text-3xl"
          >
            <span id="characters-heading">Those Who Began the Path</span>
          </CinematicTextReveal>
          <CinematicTextReveal
            as="p"
            delay={0.05}
            className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]"
          >
            {ABOUT_SLOGAN}
          </CinematicTextReveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {characterProfiles.map((character) => (
              <CharacterProfile key={character.id} character={character} />
            ))}
          </div>
        </div>
      </section>

      <LoreTimeline />

      <section
        id="about-lore-blocks"
        aria-labelledby="about-lore-blocks-heading"
        className="border-t border-[var(--stroke)] py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <CinematicTextReveal
            as="h2"
            className="font-display text-2xl text-white md:text-3xl"
          >
            <span id="about-lore-blocks-heading">Understanding the Riftwilds</span>
          </CinematicTextReveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {infoBlocks.map((block) => (
              <article key={block.id} className="panel overflow-hidden p-0">
                {block.comic ? (
                  <ComicPanel
                    src={block.comic.src}
                    alt={block.comic.alt}
                    aspectClassName="aspect-[16/10]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="rounded-none border-0 shadow-none"
                    dense
                  />
                ) : null}
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-lg text-white">{block.title}</h3>
                  {block.body.map((p, i) => (
                    <p
                      key={i}
                      className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]"
                    >
                      {p}
                    </p>
                  ))}
                  {block.bullets ? (
                    <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-[var(--text)]">
                      {block.bullets.map((b) => (
                        <li key={b} className="border-l border-[var(--stroke-strong)] pl-2">
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {[whyRiftlingsWereMade, whyEggsExist, whyPetsEvolve].map((block) => (
              <article key={block.id} className="panel overflow-hidden p-0">
                {block.comic ? (
                  <ComicPanel
                    src={block.comic.src}
                    alt={block.comic.alt}
                    aspectClassName="aspect-[16/10]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="rounded-none border-0 shadow-none"
                    dense
                  />
                ) : null}
                <div className="p-5">
                  <h3 className="font-display text-base text-white">{block.title}</h3>
                  {block.body.map((p, i) => (
                    <p key={i} className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {p}
                    </p>
                  ))}
                  {block.bullets ? (
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-[var(--text-muted)]">
                      {block.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CommercialShowcase />
      <FinalStoryCTA />
    </div>
  );
}
