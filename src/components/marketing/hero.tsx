"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ImageButton } from "@/components/ui/image-button";
import { creaturePortraitPath, mysteryRiftEggPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";
import {
  HERO_RIFTLING_POOL,
  type HeroRiftlingPreview,
} from "@/lib/marketing/hero-riftling-pool";
import { cn } from "@/lib/utils/cn";

const HERO_EGG_SRC = mysteryRiftEggPath();

type HeroCompanion = {
  slug: string;
  name: string;
  affinityLabel: string;
  src: string;
  accent: string;
  delay: number;
};

const AFFINITY_ACCENT: Record<string, string> = {
  EMBER: "var(--ember)",
  TIDE: "var(--tide)",
  GROVE: "var(--grove)",
  STORM: "var(--storm)",
  STONE: "var(--stone)",
  FROST: "var(--frost)",
  RADIANT: "var(--radiant)",
  VOID: "var(--void)",
  ALLOY: "var(--alloy)",
  SPIRIT: "var(--spirit)",
};

function affinityAccent(affinity: string): string {
  return AFFINITY_ACCENT[affinity] ?? "var(--cyan)";
}

function pickRandomCompanions(
  count: number,
  pool: readonly HeroRiftlingPreview[],
): HeroCompanion[] {
  const n = Math.min(count, pool.length);
  const indices = Array.from({ length: pool.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }
  return indices.slice(0, n).map((idx, order) => {
    const sp = pool[idx]!;
    return {
      slug: sp.slug,
      name: sp.name,
      affinityLabel: sp.affinity.charAt(0) + sp.affinity.slice(1).toLowerCase(),
      src: `${creaturePortraitPath(sp.slug)}?v=mask3`,
      accent: affinityAccent(sp.affinity),
      delay: order * 0.35,
    };
  });
}

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
  companions,
  compact = false,
}: {
  reduceMotion: boolean;
  companions: HeroCompanion[] | null;
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
          "home-hero__egg-art relative aspect-square w-full",
          compact ? "max-w-[12rem]" : "max-w-[26rem]",
        )}
      >
        <div className="home-hero__egg-aura" aria-hidden />
        {!reduceMotion ? <div className="home-hero__egg-ring" aria-hidden /> : null}

        <div
          className={cn(
            "absolute inset-[2%] home-hero__egg-float",
            reduceMotion && "![animation:none]",
          )}
        >
          <Image
            src={HERO_EGG_SRC}
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
          aria-busy={!companions}
        >
          {(companions ?? [null, null, null]).map((c, i) => (
            <li key={c?.slug ?? `slot-${i}`} className="text-center">
              <motion.div
                className={cn(
                  "relative mx-auto",
                  compact ? "h-11 w-11" : "h-20 w-20",
                )}
                style={c ? { ["--pet-accent" as string]: c.accent } : undefined}
                animate={
                  reduceMotion || !c ? undefined : { y: [0, -6, 0] }
                }
                transition={
                  c
                    ? {
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: c.delay,
                      }
                    : undefined
                }
              >
                {c ? (
                  <>
                    <span className="home-hero__pet-glow" aria-hidden />
                    <Image
                      src={c.src}
                      alt=""
                      width={80}
                      height={80}
                      className="relative z-[1] h-full w-full object-contain opacity-100"
                      unoptimized
                    />
                  </>
                ) : (
                  <span
                    className="block h-full w-full rounded-full bg-[rgba(61,231,255,0.08)]"
                    aria-hidden
                  />
                )}
              </motion.div>
              <p className="mt-1 font-display text-[9px] uppercase tracking-[0.2em] text-[var(--text)]/80">
                {c?.name ?? "\u00a0"}
              </p>
              {c ? (
                <p className="font-display text-[8px] uppercase tracking-[0.18em] text-[var(--text-dim)]">
                  {c.affinityLabel}
                </p>
              ) : null}
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
  const [companions, setCompanions] = useState<HeroCompanion[] | null>(null);

  useEffect(() => {
    setCompanions(pickRandomCompanions(3, HERO_RIFTLING_POOL));
  }, []);

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
                  BUILD A DECK.
                  <br />
                  <span className="text-[var(--cyan)]">WIN THE RIFT.</span>
                </span>
              </h1>
            </div>

            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-muted)] md:mt-5 md:text-lg">
              Claim a Rift egg. Hatch a {projectConfig.CREATURE_NAME}. Collect cards, spend Rift
              Energy, and duel on the board — Living World habitat ships in a future update.
            </p>

            {/* Mobile: egg showcase sits between copy and CTAs so pets stay on-screen */}
            <div className="mt-5 lg:hidden">
              <HeroShowcase
                reduceMotion={Boolean(reduceMotion)}
                companions={companions}
                compact
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <ImageButton
                href="/tcg/battle"
                variant="primary"
                className="home-hero__cta w-full justify-center text-base sm:w-auto sm:min-w-[10.5rem]"
              >
                Play Rift Battle
              </ImageButton>
              <ImageButton
                href="/tcg/collection"
                variant="secondary"
                className="home-hero__cta w-full justify-center text-base sm:w-auto sm:min-w-[10.5rem]"
              >
                Card Binder
              </ImageButton>
            </div>

            <p className="mt-3 max-w-md text-xs leading-relaxed text-[var(--text-dim)] md:mt-4">
              Solana {projectConfig.SOLANA_NETWORK}. Rewards aren&apos;t guaranteed. Neglect can make a{" "}
              {projectConfig.CREATURE_NAME} dormant — permanent death stays off by default.
            </p>
          </div>

          <div className="hidden lg:block">
            <HeroShowcase
              reduceMotion={Boolean(reduceMotion)}
              companions={companions}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
