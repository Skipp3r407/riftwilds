"use client";

import type { WorldEventPlayerView } from "@/lib/world-events/types";

type Props = {
  view: WorldEventPlayerView | null;
  onParticipate?: (action: string) => void;
};

/** Compact Live World strip for the active Dynamic World Event. */
export function HappeningNowBanner({ view, onParticipate }: Props) {
  const active = view?.active;
  if (!view?.enabled || !active) return null;
  if (!["ANNOUNCED", "ACTIVE", "RESOLVING"].includes(active.phase)) return null;

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-14 z-30 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 md:top-16"
      data-testid="happening-now-banner"
    >
      <div className="rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.78)] px-3 py-2 backdrop-blur-md">
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
    </div>
  );
}
