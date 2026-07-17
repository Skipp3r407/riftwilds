"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionTitleImage } from "@/components/shared/page-header";
import { ImageButton } from "@/components/ui/image-button";
import { projectConfig } from "@/lib/config/project";

/**
 * Conversion-first hero inspired by clear pet-egg funnels,
 * executed in original Riftwilds art direction (not a cream/pixel clone).
 * Atmosphere wallpaper is provided by RouteWallpaper in the marketing layout.
 */
export function Hero() {
  return (
    <section className="relative min-h-[min(92vh,860px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[rgba(255,122,61,0.12)] blur-3xl"
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-[rgba(61,231,255,0.1)] blur-3xl"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[min(92vh,860px)] max-w-7xl flex-col justify-end px-4 pb-14 pt-24 md:px-6 md:pb-20 lg:justify-center">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <SectionTitleImage
                slug="riftwilds"
                label={projectConfig.PROJECT_NAME}
                align="left"
                className="max-w-md md:max-w-xl"
              />
            </motion.div>
            <motion.h1
              className="font-display mt-3 text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <span className="sr-only">{projectConfig.PROJECT_NAME}. </span>
              HATCH IT.
              <br />
              RAISE IT.
              <br />
              <span className="text-[var(--cyan)]">KEEP IT ALIVE.</span>
            </motion.h1>
            <motion.p
              className="mt-5 max-w-lg text-base text-[var(--text-muted)] md:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Claim a Rift egg. Hatch a {projectConfig.CREATURE_NAME}. Care for it in{" "}
              {projectConfig.UNIVERSE_NAME} — then duel, trade gear, and share in transparent
              ecosystem rewards.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <ImageButton href="/hatchery" variant="primary" className="text-base">
                Claim egg
              </ImageButton>
              <ImageButton href="/play" variant="secondary" className="text-base">
                Open dashboard
              </ImageButton>
            </motion.div>
            <p className="mt-4 max-w-md text-xs text-[var(--text-muted)]">
              Solana {projectConfig.SOLANA_NETWORK}. Rewards are not guaranteed. Neglect can make a
              Riftling dormant — permanent death stays off by default.
            </p>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-md"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            <div className="panel panel-glow relative aspect-square overflow-hidden shadow-[0_0_80px_rgba(61,231,255,0.16)]">
              <div className="pointer-events-none absolute inset-0 surface-grid opacity-40" />
              <Image
                src="/assets/eggs/mystery-rift-egg.png?v=mask3"
                alt=""
                fill
                className="object-contain p-8 drop-shadow-[0_0_40px_rgba(61,231,255,0.35)]"
                unoptimized
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(10,10,15,0.97)] to-transparent p-6 pt-20">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
                  Mystery Rift egg
                </p>
                <div className="mt-3 flex justify-center gap-3">
                  {[
                    { src: "/assets/pets/cindercub.png?v=mask3", label: "Ember" },
                    { src: "/assets/pets/mossprig.png?v=mask3", label: "Grove" },
                    { src: "/assets/pets/bubbloon.png?v=mask3", label: "Tide" },
                  ].map((c) => (
                    <div key={c.label} className="text-center">
                      <Image
                        src={c.src}
                        alt=""
                        width={48}
                        height={48}
                        className="mx-auto"
                        unoptimized
                      />
                      <p className="mt-1 text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                        {c.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
