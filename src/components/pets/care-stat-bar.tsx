"use client";

import {
  CARE_BAR_COLORS,
  careBarTone,
  displayCarePercent,
  type CareStats,
} from "@/game/creatures/care";
import { cn } from "@/lib/utils/cn";

const STAT_META: Record<
  keyof CareStats,
  { label: string; invert?: boolean }
> = {
  health: { label: "Health" },
  hunger: { label: "Hunger" },
  thirst: { label: "Thirst" },
  happiness: { label: "Happiness" },
  hygiene: { label: "Hygiene" },
  energy: { label: "Energy" },
  bond: { label: "Bond" },
  stress: { label: "Stress", invert: true },
};

export function CareStatBar({
  statKey,
  value,
  compact,
}: {
  statKey: keyof CareStats;
  value: number;
  compact?: boolean;
}) {
  const pct = displayCarePercent(value);
  const tone = careBarTone(statKey, pct);
  const color = CARE_BAR_COLORS[tone];
  const meta = STAT_META[statKey];

  return (
    <div className={cn("panel-inset", compact ? "px-2.5 py-2" : "px-3 py-2.5")}>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-[var(--text-muted)]">{meta.label}</span>
        <span className="tabular-nums text-white">{pct}%</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-[rgba(148,197,255,0.1)]"
        role="meter"
        aria-label={meta.label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-500 motion-safe:ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: color,
            boxShadow: `0 0 10px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

export const CARE_STAT_ORDER: (keyof CareStats)[] = [
  "health",
  "hunger",
  "thirst",
  "happiness",
  "hygiene",
  "energy",
  "bond",
  "stress",
];
