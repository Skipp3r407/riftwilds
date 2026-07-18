"use client";

import { useEffect, useState } from "react";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  resolveLivingWorldClock,
  type LivingWorldClock,
} from "@/game/living-world/clock";
import { resolveActiveDisaster } from "@/game/living-world/disasters";
import { syncWorldClockAudio } from "@/lib/audio/weather";
import { FloatingHudChip } from "@/components/live-world/floating-hud-chip";

type Props = {
  regionSlug?: string;
  /** Placement classes from hud-slots (reserves space above docked toolbar). */
  className?: string;
};

/**
 * Lightweight Live World HUD hook — shows season / day phase / weather.
 * Pure client clock (no fetch) so Phaser session stays snappy.
 * Idle-fades in Immersive / Cinematic (and when auto-hide HUD is on).
 */
export function WorldClockChip({ regionSlug, className }: Props) {
  const enabled = featureFlagDefaults.LIVING_WORLD_CLOCK_ENABLED;
  const [clock, setClock] = useState<LivingWorldClock | null>(null);
  const [disasterName, setDisasterName] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const next = resolveLivingWorldClock();
      setClock(next);
      syncWorldClockAudio({
        dayPhase: next.dayPhase,
        weather: next.weather,
      });
      const d = resolveActiveDisaster(next);
      setDisasterName(d?.disaster.name ?? null);
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || !clock) return null;

  const activityKey = [
    regionSlug ?? "",
    clock.labels.season,
    clock.labels.dayPhase,
    clock.labels.weather,
    clock.worldDay,
    disasterName ?? "",
  ].join("|");

  return (
    <div
      className={
        className ??
        "pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 md:bottom-4"
      }
      data-testid="live-world-clock-chip"
    >
      <FloatingHudChip activityKey={activityKey} testId="live-world-clock-chip-fade">
        <div className="rounded-xl border border-[var(--stroke-bronze)] bg-[rgba(20,18,14,0.78)] px-3 py-2 text-center shadow-[0_8px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(232,213,176,0.1)] backdrop-blur-md">
          <p className="text-[11px] text-[var(--cyan)]">
            {clock.labels.season} · {clock.labels.dayPhase} · {clock.labels.weather}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">
            {regionSlug ? `${regionSlug} · ` : ""}
            World day {clock.worldDay}
            {disasterName ? ` · ${disasterName}` : ""}
          </p>
        </div>
      </FloatingHudChip>
    </div>
  );
}
