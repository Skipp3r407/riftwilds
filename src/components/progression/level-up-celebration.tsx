"use client";

import { useEffect, useState } from "react";
import { PROGRESSION_EVENT } from "@/lib/progression/client";
import type { LevelReward } from "@/lib/progression/types";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type CelebState = {
  levelsGained: number;
  rewards: LevelReward[];
  open: boolean;
};

/**
 * Full-screen level-up celebration — glow, confetti, rewards list.
 */
export function LevelUpCelebration() {
  const [state, setState] = useState<CelebState>({
    levelsGained: 0,
    rewards: [],
    open: false,
  });

  useEffect(() => {
    const onProg = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as {
        levelsGained?: number;
        rewards?: LevelReward[];
      };
      if ((detail.levelsGained ?? 0) > 0) {
        setState({
          levelsGained: detail.levelsGained!,
          rewards: detail.rewards ?? [],
          open: true,
        });
        try {
          playSfx("quests.complete");
        } catch {
          /* sfx optional */
        }
      }
    };
    window.addEventListener(PROGRESSION_EVENT, onProg);
    return () => window.removeEventListener(PROGRESSION_EVENT, onProg);
  }, []);

  if (!state.open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Level up"
      data-testid="level-up-celebration"
    >
      <div
        className={cn(
          "relative max-h-[85vh] w-full max-w-md overflow-auto rounded-2xl border border-[var(--amber)]/50",
          "bg-[linear-gradient(160deg,rgba(40,28,12,0.95),rgba(18,22,40,0.96))] p-6 shadow-[0_0_60px_rgba(245,180,60,0.35)]",
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 animate-ping rounded-full bg-[var(--amber)]/70"
              style={{
                left: `${8 + ((i * 17) % 84)}%`,
                top: `${10 + ((i * 23) % 70)}%`,
                animationDelay: `${(i % 6) * 0.12}s`,
              }}
            />
          ))}
        </div>
        <p className="relative text-center font-display text-3xl tracking-wide text-[var(--amber)] drop-shadow">
          LEVEL UP{state.levelsGained > 1 ? ` ×${state.levelsGained}` : "!"}
        </p>
        <p className="relative mt-2 text-center text-sm text-[var(--text-muted)]">
          New power and rewards unlocked.
        </p>
        {state.rewards.length > 0 ? (
          <ul className="relative mt-4 space-y-2">
            {state.rewards.map((r, i) => (
              <li
                key={`${r.kind}-${r.level}-${i}`}
                className="rounded-lg border border-[var(--stroke)] bg-black/30 px-3 py-2 text-sm text-[var(--text)]"
              >
                {r.label}
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          className="relative mt-6 w-full rounded-lg border border-[var(--amber)]/60 bg-[var(--amber)]/15 px-4 py-2.5 font-display text-sm tracking-wide text-[var(--amber)] transition hover:bg-[var(--amber)]/25"
          onClick={() => setState((s) => ({ ...s, open: false }))}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
