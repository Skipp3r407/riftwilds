"use client";

import { useEffect, useState } from "react";
import { Footprints, Mountain, PawPrint, Sparkles } from "lucide-react";
import { LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import { displayCarePercent, type CareStats } from "@/game/creatures/care";
import type { WorldHudStatus } from "@/game/live-world/types";

type Props = {
  status: WorldHudStatus;
  className?: string;
};

type LocalVitals = {
  companion: string;
  health: number;
  energy: number;
  level: number;
  xpPct: number;
};

/**
 * Keeper / companion status strip beside vitals — level, XP, buffs, region, mount cue.
 */
export function PlayerStatusDock({ status, className = "" }: Props) {
  const [vitals, setVitals] = useState<LocalVitals>({
    companion: status.petLabel || "Companion",
    health: 100,
    energy: 100,
    level: 1,
    xpPct: 35,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/pets", { credentials: "include" });
        const data = (await res.json()) as {
          pets?: { name: string; level?: number; stats?: CareStats }[];
        };
        const pet = data.pets?.[0];
        if (!cancelled && pet) {
          setVitals({
            companion: pet.name || status.petLabel || "Companion",
            health: pet.stats ? displayCarePercent(pet.stats.health) : 100,
            energy: pet.stats ? displayCarePercent(pet.stats.energy) : 100,
            level: typeof pet.level === "number" ? pet.level : 1,
            xpPct: 28 + ((pet.name?.length ?? 3) % 50),
          });
        }
      } catch {
        /* demo fallback keeps defaults */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [status.petLabel]);

  const buffs = [
    { id: "care", label: "Bonded", Icon: Sparkles },
    { id: "region", label: status.mapName.split(" ")[0] ?? "Region", Icon: Mountain },
  ];

  return (
    <div
      className={`pointer-events-none ${LW_HUD_GLASS} lw-hud-glass--secondary lw-hud-enter flex min-w-0 max-w-[12.5rem] flex-col gap-1 px-2.5 py-1.5 md:max-w-[14rem] ${className}`}
      data-testid="live-world-player-status"
      title={`${status.playerLabel} · Lv ${vitals.level}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate font-display text-[11px] tracking-wide text-[var(--text)]">
          {status.playerLabel || "Keeper"}
        </p>
        <span className="shrink-0 text-[9px] tabular-nums text-[var(--amber)]">
          Lv {vitals.level}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-black/40"
        role="meter"
        aria-label={`Experience ${vitals.xpPct}%`}
        aria-valuenow={vitals.xpPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--amber)]"
          style={{ width: `${vitals.xpPct}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
        <PawPrint className="h-3 w-3 shrink-0 text-[var(--cyan)]" aria-hidden />
        <span className="truncate">{vitals.companion}</span>
        <span className="ml-auto tabular-nums text-[var(--text-dim)]">
          {vitals.health}/{vitals.energy}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {buffs.map(({ id, label, Icon }) => (
          <span
            key={id}
            className="inline-flex items-center gap-0.5 rounded-md border border-[var(--lw-trim)]/50 bg-black/25 px-1 py-0.5 text-[8px] uppercase tracking-wider text-[var(--stone)]"
          >
            <Icon className="h-2.5 w-2.5 text-[var(--amber)]" aria-hidden />
            {label}
          </span>
        ))}
        <span
          className="inline-flex items-center gap-0.5 rounded-md border border-[var(--stroke)]/50 bg-black/20 px-1 py-0.5 text-[8px] uppercase tracking-wider text-[var(--text-dim)]"
          title="On foot"
        >
          <Footprints className="h-2.5 w-2.5" aria-hidden />
          Walk
        </span>
      </div>
    </div>
  );
}
