"use client";

import { useEffect, useState } from "react";
import { Heart, Zap } from "lucide-react";
import { displayCarePercent, type CareStats } from "@/game/creatures/care";

type Vitals = {
  petName: string;
  health: number;
  energy: number;
};

/**
 * Bottom-center orbs — Companion Health + Energy from the care system.
 * Not combat HP/MP; does not invent power that breaks economy.
 */
export function VitalOrbs({ className = "" }: { className?: string }) {
  const [vitals, setVitals] = useState<Vitals | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/pets", { credentials: "include" });
        const data = (await res.json()) as {
          pets?: { name: string; stats?: CareStats }[];
        };
        const pet = data.pets?.[0];
        if (!cancelled && pet?.stats) {
          setVitals({
            petName: pet.name,
            health: displayCarePercent(pet.stats.health),
            energy: displayCarePercent(pet.stats.energy),
          });
        } else if (!cancelled) {
          // Demo fallback — readable stubs, not combat power
          setVitals({ petName: "Companion", health: 100, energy: 100 });
        }
      } catch {
        if (!cancelled) {
          setVitals({ petName: "Companion", health: 100, energy: 100 });
        }
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!vitals) return null;

  return (
    <div
      className={`pointer-events-none flex items-end gap-2.5 md:gap-3 ${className}`}
      data-testid="live-world-vital-orbs"
      title={`${vitals.petName} — care vitals (Credits economy, not SOL)`}
    >
      <Orb label="Health" value={vitals.health} max={100} tone="health" />
      <Orb label="Energy" value={vitals.energy} max={100} tone="energy" />
    </div>
  );
}

function Orb({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "health" | "energy";
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "health"
      ? "linear-gradient(180deg, #ffb0a0 0%, #e05050 48%, #6a1818 100%)"
      : "linear-gradient(180deg, #9ad4ff 0%, #3d8ad4 48%, #1a3a6a 100%)";
  const Icon = tone === "health" ? Heart : Zap;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`lw-hud-orb lw-hud-orb--${tone} flex h-14 w-14 items-center justify-center md:h-[3.75rem] md:w-[3.75rem]`}
        aria-label={`${label} ${value}/${max}`}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className="lw-hud-orb__fill"
          style={{
            background: fill,
            clipPath: `inset(${100 - pct}% 0 0 0)`,
          }}
        />
        <div className="lw-hud-orb__value flex flex-col items-center leading-none">
          <Icon
            className="mb-0.5 h-2.5 w-2.5 opacity-80"
            aria-hidden
            strokeWidth={2.25}
          />
          <span className="text-[11px]">{value}</span>
        </div>
      </div>
      <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[var(--stone)]">
        {label}
      </span>
    </div>
  );
}
