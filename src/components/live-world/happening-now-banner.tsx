"use client";

import type { WorldEventPlayerView } from "@/lib/world-events/types";
import { FloatingHudChip } from "@/components/live-world/floating-hud-chip";

type Props = {
  view: WorldEventPlayerView | null;
  onParticipate?: (action: string) => void;
  /** When true, parent owns absolute placement (top-center stack). */
  stacked?: boolean;
  className?: string;
};

/** Compact Live World strip for the active Dynamic World Event. */
export function HappeningNowBanner({
  view,
  onParticipate,
  stacked = false,
  className,
}: Props) {
  const active = view?.active;
  if (!view?.enabled || !active) return null;
  if (!["ANNOUNCED", "ACTIVE", "RESOLVING"].includes(active.phase)) return null;

  const activityKey = `${active.key}|${active.phase}|${active.regionSlug}`;

  const wrapClass = stacked
    ? `pointer-events-none w-full ${className ?? ""}`
    : `pointer-events-none absolute left-1/2 top-14 z-30 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 md:top-16 ${className ?? ""}`;

  return (
    <div className={wrapClass} data-testid="happening-now-banner">
      <FloatingHudChip activityKey={activityKey} testId="happening-now-banner-fade">
        <div className="rounded-xl border border-[var(--stroke-bronze)] bg-[rgba(20,18,14,0.78)] px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(232,213,176,0.1)] backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-dim)]">
            Happening now
          </p>
          <p className="font-display text-sm text-white">{active.name}</p>
          <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
            {active.phase} · {active.regionSlug.replace(/-/g, " ")} · {active.tier}
          </p>
          {active.phase === "ACTIVE" && onParticipate ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                className="rounded-md border border-[var(--stroke)] px-2 py-1 text-[10px] text-[var(--cyan)] hover:bg-white/5"
                onClick={() => onParticipate("ARRIVE")}
              >
                Arrive
              </button>
              <button
                type="button"
                className="rounded-md border border-[var(--stroke)] px-2 py-1 text-[10px] text-[var(--cyan)] hover:bg-white/5"
                onClick={() => onParticipate(active.key.includes("boss") ? "BOSS_HIT" : "DEFEND")}
              >
                Join in
              </button>
            </div>
          ) : null}
        </div>
      </FloatingHudChip>
    </div>
  );
}
