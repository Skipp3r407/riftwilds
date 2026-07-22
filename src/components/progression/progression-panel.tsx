"use client";

import { useCallback, useEffect, useState } from "react";
import {
  claimDailyProgression,
  emitProgressionEvent,
  fetchProgressionSnapshot,
  requestPrestige,
} from "@/lib/progression/client";
import type { ProgressionSnapshot } from "@/lib/progression/types";
import { cn } from "@/lib/utils/cn";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--stroke)] bg-black/25 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">{label}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums text-[var(--text)]">{value}</p>
    </div>
  );
}

export function ProgressionPanel() {
  const [snap, setSnap] = useState<ProgressionSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await fetchProgressionSnapshot();
    setSnap(next);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!snap) {
    return (
      <p className="text-sm text-[var(--text-muted)]" data-testid="progression-loading">
        Loading progression…
      </p>
    );
  }

  return (
    <div className="space-y-6" data-testid="progression-panel">
      <div className="rounded-xl border border-[var(--stroke)] bg-[rgba(18,20,32,0.72)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl text-[var(--amber)]">Level {snap.level}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {snap.currentXp} / {snap.xpToNextLevel} XP · Lifetime {snap.lifetimeXp.toLocaleString()}
              {snap.prestige > 0 ? ` · Prestige ${snap.prestige}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-[var(--cyan)]/50 bg-[var(--cyan)]/10 px-3 py-1.5 text-xs text-[var(--cyan)]"
              onClick={async () => {
                setBusy(true);
                setMessage(null);
                const r = await claimDailyProgression();
                if (r?.ok && r.granted > 0) {
                  emitProgressionEvent({
                    granted: r.granted,
                    levelsGained: r.levelsGained,
                    rewards: r.rewards,
                  });
                  setMessage(`Daily bonus +${r.granted} XP (streak ${r.streak ?? 1})`);
                } else {
                  setMessage(r && "message" in r ? String(r.message) : "Already claimed today.");
                }
                await refresh();
                setBusy(false);
              }}
            >
              Claim daily XP
            </button>
            {snap.prestigeUnlocked ? (
              <button
                type="button"
                disabled={busy}
                className="rounded-lg border border-[var(--amber)]/50 bg-[var(--amber)]/10 px-3 py-1.5 text-xs text-[var(--amber)]"
                onClick={async () => {
                  if (!window.confirm("Prestige resets level to 1. Cosmetics, cards, pets, and titles are kept. Continue?")) {
                    return;
                  }
                  setBusy(true);
                  const r = await requestPrestige();
                  setMessage(r?.ok ? `Prestige ${r.snapshot?.prestige ?? ""}!` : r?.error ?? "Failed");
                  if (r?.snapshot) setSnap(r.snapshot);
                  else await refresh();
                  setBusy(false);
                }}
              >
                Prestige
              </button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/45">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--amber)] transition-[width] duration-700"
            style={{ width: `${snap.xpPercent}%` }}
          />
        </div>
        {message ? <p className="mt-3 text-xs text-[var(--text-muted)]">{message}</p> : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Stat points" value={snap.statPoints} />
        <Stat label="Skill points" value={snap.skillPoints} />
        <Stat label="Mastery XP" value={snap.masteryXp} />
        <Stat label="Rested pool" value={snap.restedXpPool} />
        <Stat label="Battles won" value={`${snap.battlesWon}/${snap.battlesPlayed}`} />
        <Stat label="Quests done" value={snap.questsCompleted} />
        <Stat label="Login streak" value={snap.loginStreak} />
        <Stat label="Highest combo" value={snap.highestCombo} />
        <Stat label="Max HP" value={snap.combatStats.maxHp} />
        <Stat label="Atk / Def / Spd" value={`${snap.combatStats.atk} / ${snap.combatStats.def} / ${snap.combatStats.speed}`} />
        <Stat label="Card mastery" value={snap.cardMasteryCount} />
        <Stat label="Pet mastery" value={snap.petMasteryCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--stroke)] bg-black/20 p-4">
          <h2 className="font-display text-lg text-[var(--text)]">Upcoming rewards</h2>
          <ul className="mt-3 space-y-2">
            {snap.nextRewards.length === 0 ? (
              <li className="text-sm text-[var(--text-muted)]">Keep earning XP for the next milestone.</li>
            ) : (
              snap.nextRewards.map((r, i) => (
                <li key={`${r.level}-${r.kind}-${i}`} className="text-sm text-[var(--text-muted)]">
                  <span className="text-[var(--amber)]">Lv {r.level}</span> — {r.label}
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--stroke)] bg-black/20 p-4">
          <h2 className="font-display text-lg text-[var(--text)]">Recent unlocks</h2>
          <ul className="mt-3 space-y-2">
            {snap.recentUnlocks.length === 0 ? (
              <li className="text-sm text-[var(--text-muted)]">No unlocks yet.</li>
            ) : (
              snap.recentUnlocks.slice(0, 8).map((u) => (
                <li key={u} className="text-sm text-[var(--text)]">
                  {u}
                </li>
              ))
            )}
          </ul>
          {snap.notifications.length > 0 ? (
            <div className="mt-4 border-t border-[var(--stroke)] pt-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Notifications</p>
              <ul className="mt-2 space-y-1">
                {snap.notifications.slice(0, 6).map((n) => (
                  <li key={n.id} className={cn("text-xs text-[var(--text-muted)]")}>
                    <span className="text-[var(--cyan)]">{n.title}</span> — {n.body}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <p className="text-xs text-[var(--text-dim)]">
        Earn XP in Practice battles, Quests, Riftling care, exploration, crafting, marketplace, and daily login.
        XP is always granted by the server — clients never set amounts.
      </p>
    </div>
  );
}
