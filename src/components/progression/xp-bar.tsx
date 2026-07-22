"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  claimDailyProgression,
  emitProgressionEvent,
  fetchProgressionSnapshot,
  PROGRESSION_EVENT,
} from "@/lib/progression/client";
import type { ProgressionSnapshot } from "@/lib/progression/types";
import { cn } from "@/lib/utils/cn";

type FloatGain = { id: number; amount: number };

/**
 * Compact level badge + XP bar for the game top bar.
 */
export function ProgressionXpBar({ className }: { className?: string }) {
  const [snap, setSnap] = useState<ProgressionSnapshot | null>(null);
  const [floats, setFloats] = useState<FloatGain[]>([]);
  const [pulse, setPulse] = useState(false);
  const [barPct, setBarPct] = useState(0);

  const refresh = useCallback(async () => {
    const next = await fetchProgressionSnapshot();
    if (next) {
      setSnap(next);
      setBarPct(next.xpPercent);
    }
  }, []);

  useEffect(() => {
    void refresh();
    void claimDailyProgression().then((r) => {
      if (r && r.ok && r.granted > 0) {
        emitProgressionEvent({
          granted: r.granted,
          levelsGained: r.levelsGained,
          rewards: r.rewards,
        });
        void refresh();
      }
    });
  }, [refresh]);

  useEffect(() => {
    const onProg = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as {
        granted?: number;
        levelsGained?: number;
        snapshot?: ProgressionSnapshot | null;
      };
      if (detail.snapshot) {
        setSnap(detail.snapshot);
        setBarPct(detail.snapshot.xpPercent);
      } else {
        void refresh();
      }
      if (detail.granted && detail.granted > 0) {
        const id = Date.now();
        setFloats((f) => [...f, { id, amount: detail.granted! }]);
        setPulse(true);
        window.setTimeout(() => {
          setFloats((f) => f.filter((x) => x.id !== id));
          setPulse(false);
        }, 1600);
      }
    };
    window.addEventListener(PROGRESSION_EVENT, onProg);
    return () => window.removeEventListener(PROGRESSION_EVENT, onProg);
  }, [refresh]);

  if (!snap) return null;

  return (
    <Link
      href="/progression"
      className={cn(
        "relative hidden min-w-[7.5rem] max-w-[11rem] flex-col gap-0.5 rounded-md border border-[var(--stroke)] bg-[rgba(22,22,37,0.72)] px-2 py-1 sm:flex",
        pulse && "ring-1 ring-[var(--amber)]/60",
        className,
      )}
      title={`Level ${snap.level} · ${snap.currentXp}/${snap.xpToNextLevel} XP`}
      data-testid="progression-xp-bar"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="rounded bg-[var(--amber)]/20 px-1.5 py-0.5 font-display text-[10px] font-semibold tracking-wide text-[var(--amber)]">
          Lv {snap.level}
          {snap.prestige > 0 ? ` · P${snap.prestige}` : ""}
        </span>
        <span className="font-mono text-[9px] tabular-nums text-[var(--text-muted)]">
          {snap.currentXp}/{snap.xpToNextLevel}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-black/45"
        role="meter"
        aria-label="Experience"
        aria-valuenow={barPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--amber)] transition-[width] duration-700 ease-out"
          style={{ width: `${barPct}%` }}
        />
      </div>
      {floats.map((f) => (
        <span
          key={f.id}
          className="pointer-events-none absolute -top-3 right-1 animate-bounce font-mono text-[11px] font-semibold text-[var(--amber)]"
        >
          +{f.amount} XP
        </span>
      ))}
    </Link>
  );
}
