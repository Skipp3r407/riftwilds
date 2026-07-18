"use client";

import { useEffect, useState } from "react";
import type { WorldEventPlayerView } from "@/lib/world-events/types";
import { FloatingHudChip } from "@/components/live-world/floating-hud-chip";

type Props = {
  view: WorldEventPlayerView | null;
  onParticipate?: (action: string) => void;
  /** When true, parent owns absolute placement (top-center stack). */
  stacked?: boolean;
  className?: string;
};

/** Compact Live World strip for the active Dynamic World Event — auto-shrinks after idle. */
export function HappeningNowBanner({
  view,
  onParticipate,
  stacked = false,
  className,
}: Props) {
  const active = view?.active;
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    if (!active) {
      setShrunk(false);
      return;
    }
    setShrunk(false);
    const id = window.setTimeout(() => setShrunk(true), 6500);
    return () => window.clearTimeout(id);
  }, [active?.key, active?.phase, active?.regionSlug]);

  if (!view?.enabled || !active) return null;
  if (!["ANNOUNCED", "ACTIVE", "RESOLVING"].includes(active.phase)) return null;

  const activityKey = `${active.key}|${active.phase}|${active.regionSlug}`;
  const regionLabel = active.regionSlug.replace(/-/g, " ");

  const wrapClass = stacked
    ? `pointer-events-none w-full max-w-[16rem] ${className ?? ""}`
    : `pointer-events-none absolute left-1/2 top-12 z-30 w-[min(16rem,calc(100%-2rem))] -translate-x-1/2 md:top-14 ${className ?? ""}`;

  return (
    <div className={wrapClass} data-testid="happening-now-banner" data-shrunk={shrunk ? "1" : "0"}>
      <FloatingHudChip activityKey={activityKey} testId="happening-now-banner-fade">
        <div
          className={`rounded-lg border border-[var(--stroke-bronze)] bg-[rgba(20,18,14,0.78)] shadow-[0_6px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(232,213,176,0.1)] backdrop-blur-md transition-all ${
            shrunk ? "px-2 py-1" : "px-2.5 py-1.5"
          }`}
          onMouseEnter={() => setShrunk(false)}
          onFocusCapture={() => setShrunk(false)}
        >
          {shrunk ? (
            <p className="truncate font-display text-[11px] text-white" title={active.name}>
              <span className="mr-1 text-[9px] uppercase tracking-wider text-[var(--amber)]">
                Now
              </span>
              {active.name}
            </p>
          ) : (
            <>
              <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-dim)]">
                Happening now
              </p>
              <p className="truncate font-display text-[12px] text-white">{active.name}</p>
              <p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">
                {active.phase} · {regionLabel}
              </p>
              {active.phase === "ACTIVE" && onParticipate ? (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="rounded-md border border-[var(--stroke)] px-1.5 py-0.5 text-[9px] text-[var(--cyan)] hover:bg-white/5"
                    onClick={() => onParticipate("ARRIVE")}
                  >
                    Arrive
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[var(--stroke)] px-1.5 py-0.5 text-[9px] text-[var(--cyan)] hover:bg-white/5"
                    onClick={() =>
                      onParticipate(active.key.includes("boss") ? "BOSS_HIT" : "DEFEND")
                    }
                  >
                    Join in
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </FloatingHudChip>
    </div>
  );
}
