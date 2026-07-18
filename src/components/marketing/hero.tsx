"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ImageButton } from "@/components/ui/image-button";
import { projectConfig } from "@/lib/config/project";
import { cn } from "@/lib/utils/cn";

const COMPANIONS = [
  {
    src: "/assets/pets/cindercub.png?v=mask3",
    label: "Ember",
    accent: "var(--ember)",
    delay: 0,
  },
  {
    src: "/assets/pets/mossprig.png?v=mask3",
    label: "Grove",
    accent: "var(--grove)",
    delay: 0.35,
  },
  {
    src: "/assets/pets/bubbloon.png?v=mask3",
    label: "Tide",
    accent: "var(--tide)",
    delay: 0.7,
  },
] as const;

const PARTICLES = [
  { left: "12%", top: "18%", size: 3, delay: 0 },
  { left: "28%", top: "62%", size: 2, delay: 1.2 },
  { left: "48%", top: "22%", size: 4, delay: 0.4 },
  { left: "66%", top: "70%", size: 2, delay: 2.1 },
  { left: "78%", top: "34%", size: 3, delay: 0.9 },
  { left: "86%", top: "58%", size: 2, delay: 1.6 },
  { left: "18%", top: "78%", size: 3, delay: 2.4 },
  { left: "56%", top: "48%", size: 2, delay: 0.2 },
] as const;

function HeroShowcase({
  reduceMotion,
  compact = false,
}: {
  reduceMotion: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full flex-col items-center",
        compact ? "max-w-[13.5rem]" : "max-w-[28rem] lg:max-w-none",
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full",
          compact ? "max-w-[12rem]" : "max-w-[26rem]",
        )}
      >
        <div className="home-hero__egg-aura" aria-hidden />
        {!reduceMotion ? <div className="home-hero__egg-ring" aria-hidden /> : null}

        <div
          className={cn("absolute inset-[4%]", !reduceMotion && "home-hero__egg-float")}
        >
          <Image
            src="/assets/eggs/mystery-rift-egg.png?v=mask3"
            alt="Mystery Rift egg"
            fill
            className="object-contain drop-shadow-[0_0_48px_rgba(61,231,255,0.4)]"
            unoptimized
            priority
            sizes={compact ? "224px" : "(max-width: 1024px) 50vw, 420px"}
          />
        </div>
      </div>

      <div className={cn("relative z-[2] w-full text-center", compact ? "-mt-1" : "-mt-5")}>
        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)] md:text-xs">
          Mystery Rift egg
        </p>
        <ul
          className={cn(
            "mt-2.5 flex items-end justify-center",
            compact ? "gap-3" : "mt-4 gap-7",
          )}
        >
          {COMPANIONS.map((c) => (
            <li key={c.label} className="text-center">
              <motion.div
                className={cn(
                  "relative mx-auto",
                  compact ? "h-11 w-11" : "h-20 w-20",
                )}
                style={{ ["--pet-accent" as string]: c.accent }}
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: c.delay,
                }}
              >
                <span className="home-hero__pet-glow" aria-hidden />
                <Image
                  src={c.src}
                  alt=""
                  width={80}
                  height={80}
                  className="relative z-[1] h-full w-full object-contain"
                  unoptimized
                />
              </motion.div>
              <p className="mt-1 font-display text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {c.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Conversion-first home hero — one cinematic composition.
 * Atmosphere wallpaper comes from RouteWallpaper; this layer adds
 * local glow, particles, and the egg showcase.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-hero relative min-h-[min(100svh,920px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="home-hero__veil" />
        <motion.div
          className="absolute -left-24 top-[12%] h-[22rem] w-[22rem] rounded-full bg-[rgba(61,231,255,0.14)] blur-3xl"
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.28, 0.5, 0.28], scale: [1, 1.12, 1] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 bottom-[8%] h-[26rem] w-[26rem] rounded-full bg-[rgba(255,184,77,0.12)] blur-3xl"
          animate={
            reduceMotion ? undefined : { opacity: [0.22, 0.45, 0.22], scale: [1, 1.08, 1] }
          }
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[rgba(255,122,61,0.08)] blur-3xl"
          animate={reduceMotion ? undefined : { opacity: [0.15, 0.32, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        {!reduceMotion
          ? PARTICLES.map((p, i) => (
              <span
                key={i}
                className="home-hero__particle"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))
          : null}
      </div>

      <div className="relative z-[1] mx-auto flex min-h-[min(100svh,920px)] max-w-7xl flex-col justify-center px-4 pb-24 pt-24 md:px-6 md:pb-16 lg:pb-20">
        <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <div className="max-w-xl">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--amber)] md:text-xs">
                Enter {projectConfig.UNIVERSE_NAME}
              </p>
              <h1 className="mt-2 md:mt-3">
                <span className="home-hero__brand font-display block font-bold leading-none tracking-[0.14em]">
                  {projectConfig.PROJECT_NAME.toUpperCase()}
                </span>
                <span className="font-display mt-3 block text-[clamp(1.45rem,3.6vw,2.45rem)] font-bold leading-[1.08] tracking-tight text-white md:mt-4">
                  HATCH IT.
                  <br />
                  RAISE IT.
                  <br />
                  <span className="text-[var(--cyan)]">KEEP IT ALIVE.</span>
                </span>
              </h1>
            </div>

            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-muted)] md:mt-5 md:text-lg">
              Claim a Rift egg. Hatch a {projectConfig.CREATURE_NAME}. Care for it, duel in the Arena,
              trade gear, and earn ecosystem rewards as you play.
            </p>

            {/* Mobile: egg showcase sits between copy and CTAs so pets stay on-screen */}
            <div className="mt-5 lg:hidden">
              <HeroShowcase reduceMotion={Boolean(reduceMotion)} compact />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <ImageButton
                href="/hatchery"
                variant="primary"
                className="home-hero__cta w-full justify-center text-base sm:w-auto sm:min-w-[10.5rem]"
              >
                Claim egg
              </ImageButton>
              <ImageButton
                href="/dashboard"
                variant="secondary"
                className="home-hero__cta w-full justify-center text-base sm:w-auto sm:min-w-[10.5rem]"
              >
                Open dashboard
              </ImageButton>
            </div>

            <p className="mt-3 max-w-md text-xs leading-relaxed text-[var(--text-dim)] md:mt-4">
              Solana {projectConfig.SOLANA_NETWORK}. Rewards aren&apos;t guaranteed. Neglect can make a{" "}
              {projectConfig.CREATURE_NAME} dormant — permanent death stays off by default.
            </p>
          </div>

          <div className="hidden lg:block">
            <HeroShowcase reduceMotion={Boolean(reduceMotion)} />
          </div>
        </div>
      </div>
    </section>
  );
}
