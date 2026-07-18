"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GameImage } from "@/components/assets/game-image";
import { AffinityChip } from "@/components/leaderboards/affinity-chip";
import { creaturePortraitPath } from "@/lib/assets/paths";
import type { LeaderboardEntry, LeaderboardTab } from "@/lib/leaderboards/types";
import { scoreForTab } from "@/lib/leaderboards/demo-data";
import { cn } from "@/lib/utils/cn";

const PODIUM_ORDER = [1, 0, 2] as const; // visual: silver, gold, bronze

const TIER = {
  1: {
    label: "Rift Crown",
    accent: "from-[rgba(255,184,77,0.35)] via-[rgba(255,229,102,0.18)] to-transparent",
    border: "border-[rgba(255,184,77,0.55)]",
    glow: "shadow-[0_0_40px_rgba(255,184,77,0.22)]",
    pedestal: "h-28 md:h-32",
    plate: "bg-gradient-to-b from-[rgba(255,184,77,0.28)] to-[rgba(255,122,61,0.08)]",
    rankColor: "text-[var(--amber)]",
  },
  2: {
    label: "Rift Silver",
    accent: "from-[rgba(61,231,255,0.3)] via-[rgba(208,214,224,0.12)] to-transparent",
    border: "border-[rgba(61,231,255,0.45)]",
    glow: "shadow-[0_0_28px_rgba(61,231,255,0.16)]",
    pedestal: "h-20 md:h-24",
    plate: "bg-gradient-to-b from-[rgba(61,231,255,0.2)] to-[rgba(148,197,255,0.06)]",
    rankColor: "text-[var(--cyan)]",
  },
  3: {
    label: "Rift Bronze",
    accent: "from-[rgba(255,122,61,0.28)] via-[rgba(196,168,130,0.12)] to-transparent",
    border: "border-[rgba(255,122,61,0.45)]",
    glow: "shadow-[0_0_24px_rgba(255,122,61,0.14)]",
    pedestal: "h-16 md:h-20",
    plate: "bg-gradient-to-b from-[rgba(255,122,61,0.18)] to-[rgba(196,168,130,0.06)]",
    rankColor: "text-[var(--ember)]",
  },
} as const;

function metricLabel(tab: LeaderboardTab): string {
  if (tab === "rift") return "RP";
  if (tab === "care") return "Care";
  if (tab === "collection") return "Cards";
  if (tab === "arena") return "AP";
  return "RP";
}

export function LeaderboardPodium({
  entries,
  tab,
}: {
  entries: LeaderboardEntry[];
  tab: LeaderboardTab;
}) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <section className="panel relative overflow-hidden p-4 md:p-6" aria-label="Top three podium">
      <Image
        src="/assets/ui/leaderboards/podium-glow.svg"
        alt=""
        width={640}
        height={200}
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-auto w-full max-w-3xl opacity-70"
        unoptimized
        aria-hidden
      />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
            Summit
          </p>
          <h2 className="mt-1 font-display text-lg text-white md:text-xl">Rift Podium</h2>
        </div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
          Gold · Silver · Bronze
        </p>
      </div>

      <div className="relative mx-auto grid max-w-3xl grid-cols-3 items-end gap-2 md:gap-4">
        {PODIUM_ORDER.map((slot, visualIndex) => {
          const entry = top3[slot];
          if (!entry) return <div key={visualIndex} />;
          const tier = TIER[entry.rank as 1 | 2 | 3] ?? TIER[3];
          const score = scoreForTab(entry, tab);

          return (
            <motion.div
              key={entry.wallet}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visualIndex * 0.08, duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-[var(--radius-lg)] border bg-[rgba(10,10,18,0.45)] p-2 md:p-3",
                  tier.border,
                  tier.glow,
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-b opacity-90",
                    tier.accent,
                  )}
                  aria-hidden
                />
                <div className="relative flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "font-display text-2xl font-bold md:text-3xl",
                      tier.rankColor,
                    )}
                  >
                    #{entry.rank}
                  </span>
                  <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--stroke)] bg-[rgba(8,8,14,0.55)] md:h-20 md:w-20">
                    <GameImage
                      src={creaturePortraitPath(entry.speciesSlug)}
                      alt={entry.speciesName}
                      width={72}
                      height={72}
                      showDevBadge={false}
                      className="h-12 w-12 md:h-16 md:w-16"
                    />
                  </div>
                  <p className="mt-2 truncate font-display text-xs text-white md:text-sm">
                    {entry.playerName}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-[var(--text-dim)]">
                    {entry.walletShort}
                  </p>
                  <div className="mt-2">
                    <AffinityChip affinity={entry.affinity} />
                  </div>
                  <p className="mt-2 font-display text-sm text-[var(--amber)] md:text-base">
                    {score.toLocaleString()}
                    <span className="ml-1 text-[10px] text-[var(--text-muted)]">
                      {metricLabel(tab)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">{tier.label}</p>
                </div>
              </div>
              <div
                className={cn(
                  "mt-2 w-full rounded-t-[var(--radius-md)] border border-b-0 border-[var(--stroke)]",
                  tier.plate,
                  tier.pedestal,
                )}
                aria-hidden
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
