"use client";

import { useEffect, useState } from "react";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  resolveLivingWorldClock,
  type LivingWorldClock,
} from "@/game/living-world/clock";
import { resolveActiveDisaster } from "@/game/living-world/disasters";

/**
 * Lightweight Live World HUD hook — shows season / day phase / weather.
 * Pure client clock (no fetch) so Phaser session stays snappy.
 */
export function WorldClockChip({ regionSlug }: { regionSlug?: string }) {
  const enabled = featureFlagDefaults.LIVING_WORLD_CLOCK_ENABLED;
  const [clock, setClock] = useState<LivingWorldClock | null>(null);
  const [disasterName, setDisasterName] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const next = resolveLivingWorldClock();
      setClock(next);
      const d = resolveActiveDisaster(next);
      setDisasterName(d?.disaster.name ?? null);
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || !clock) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 md:bottom-4">
      <div className="rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.78)] px-3 py-2 text-center backdrop-blur-md">
        <p className="text-[11px] text-[var(--cyan)]">
          {clock.labels.season} · {clock.labels.dayPhase} · {clock.labels.weather}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">
          {regionSlug ? `${regionSlug} · ` : ""}
          World day {clock.worldDay}
          {disasterName ? ` · ${disasterName}` : ""}
        </p>
      </div>
    </div>
  );
}
