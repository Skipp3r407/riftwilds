"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ABOUT_META, ABOUT_SLOGAN, aboutScenePaths, heroCtas } from "@/content/about/riftwilds-origin";
import { ParallaxScene } from "@/components/about/parallax-scene";
import { ReducedMotionScene } from "@/components/about/reduced-motion-scene";
import { cn } from "@/lib/utils/cn";

type Props = {
  onSkipIntro: () => void;
  introSkipped: boolean;
  className?: string;
};

export function CinematicHero({ onSkipIntro, introSkipped, className }: Props) {
  const reduceMotion = useReducedMotion();
  const instant = Boolean(reduceMotion || introSkipped);

  return (
    <section
      id="about-hero"
      aria-labelledby="about-hero-title"
      className={cn("relative min-h-[100svh] overflow-hidden", className)}
    >
      {instant ? (
        <ReducedMotionScene
          src={aboutScenePaths.hero}
          alt="A glowing rift splits the sky above cliffside silhouettes of Riftlings and a lone keeper"
          priority
        />
      ) : (
        <ParallaxScene
          src={aboutScenePaths.hero}
          alt="A glowing rift splits the sky above cliffside silhouettes of Riftlings and a lone keeper"
          priority
          accent="var(--violet)"
        />
      )}

      {!instant ? (
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(0,0,0,0.55)_100%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.6 }}
          />
        </div>
      ) : null}

      <div className="relative z-[2] mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
        <div className="absolute right-4 top-24 z-[3] md:right-6 md:top-28">
          <button
            type="button"
            onClick={onSkipIntro}
            className="focus-ring rounded-md border border-[var(--stroke)] bg-[rgba(8,10,16,0.7)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)] hover:text-white"
          >
            Skip Intro
          </button>
        </div>

        <motion.div
          initial={instant ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={instant ? { duration: 0 } : { duration: 0.9, delay: 1.1 }}
          className="max-w-3xl"
        >
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
            Origin of the Riftwilds
          </p>
          <h1
            id="about-hero-title"
            className="font-display mt-3 text-4xl font-bold leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            {ABOUT_META.heroTitle}
          </h1>
          <p className="mt-4 text-lg text-[var(--text-muted)] md:text-xl">
            {ABOUT_META.heroSubtitle}
          </p>
          <p className="mt-3 max-w-xl text-base text-[var(--text)] md:text-lg">
            {ABOUT_META.heroSupport}
          </p>
          <p className="mt-4 max-w-xl text-sm italic text-[var(--violet)] md:text-base">
            {ABOUT_SLOGAN}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {heroCtas.primary.map((cta) => (
              <Link key={cta.href} href={cta.href} className="btn-primary focus-ring text-sm md:text-base">
                {cta.label}
              </Link>
            ))}
            {heroCtas.secondary.map((cta) => (
              <Link
                key={`${cta.href}-${cta.label}`}
                href={cta.href}
                className="btn-secondary focus-ring text-sm md:text-base"
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
