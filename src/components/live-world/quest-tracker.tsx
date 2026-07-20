"use client";

import { useEffect, useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { LW_HUD_CARD_TITLE, LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import { playSfx } from "@/hooks/use-sfx";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";

export type QuestRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

type TrackedQuest = {
  id: string;
  title: string;
  progress: number;
  requirement: number;
  rarity: QuestRarity;
  distanceM?: number;
  rewardHint?: string;
  pinned?: boolean;
};

function rarityForIndex(i: number): QuestRarity {
  const order: QuestRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
  return order[i % order.length]!;
}

function tasksToQuests(
  snapshot: SocialPresenceSnapshot | null,
  pinnedIds: Set<string>,
): TrackedQuest[] {
  const tasks = snapshot?.dailyTasks?.filter((t) => !t.claimed).slice(0, 4) ?? [];
  return tasks.map((t, i) => ({
    id: t.id,
    title: t.title,
    progress: t.progress,
    requirement: t.requirement,
    rarity: rarityForIndex(i),
    distanceM: 40 + ((t.id.length * 7) % 180),
    rewardHint: i === 0 ? "+CR · Care" : i === 1 ? "Card pack scrap" : "Companion XP",
    pinned: pinnedIds.has(t.id),
  }));
}

type Props = {
  snapshot: SocialPresenceSnapshot | null;
  onCompleteFx?: (title: string) => void;
  className?: string;
};

/**
 * Animated quest / objectives tracker — rarity colors, progress, distance, pin, rewards.
 */
export function QuestTracker({ snapshot, onCompleteFx, className = "" }: Props) {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState(true);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [prevProgress, setPrevProgress] = useState<Record<string, number>>({});

  const quests = tasksToQuests(snapshot, pinnedIds);
  const ordered = [
    ...quests.filter((q) => q.pinned),
    ...quests.filter((q) => !q.pinned),
  ];

  useEffect(() => {
    let completedTitle: string | null = null;
    let completedId: string | null = null;
    for (const q of quests) {
      const prev = prevProgress[q.id];
      if (prev != null && q.progress >= q.requirement && prev < q.requirement) {
        completedId = q.id;
        completedTitle = q.title;
        break;
      }
    }
    const next: Record<string, number> = {};
    for (const q of quests) next[q.id] = q.progress;
    setPrevProgress(next);
    if (!completedId || !completedTitle) return;
    setFlashId(completedId);
    onCompleteFx?.(completedTitle);
    playSfx("ui.click");
    const t = window.setTimeout(() => setFlashId(null), 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compare against prior snapshot only
  }, [snapshot?.dailyTasks]);

  if (!snapshot?.enabled || ordered.length === 0) return null;

  const togglePin = (id: string) => {
    playSfx("ui.click");
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className={`${LW_HUD_GLASS} lw-hud-glass--primary lw-hud-enter w-full overflow-hidden px-2.5 py-2 ${className}`}
      data-testid="pinned-objectives-tracker"
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`${LW_HUD_CARD_TITLE} !tracking-wider`}>Objectives</p>
        <button
          type="button"
          className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--amber)]"
          onClick={() => {
            playSfx("ui.click");
            setExpanded((v) => !v);
          }}
          aria-expanded={expanded}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded ? (
        <ul className="mt-1.5 space-y-2">
          {ordered.map((q) => {
            const pct = Math.min(100, Math.round((q.progress / q.requirement) * 100));
            const done = q.progress >= q.requirement;
            return (
              <li
                key={q.id}
                className={`lw-hud-quest ${flashId === q.id || done ? "lw-hud-quest--complete" : ""}`}
                data-rarity={q.rarity}
                title={`${q.title} · ${q.rewardHint ?? ""}`}
              >
                <div className="flex min-w-0 items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium leading-snug text-[var(--text)]">
                      {q.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[9px] text-[var(--text-muted)]">
                      <span className="capitalize text-[var(--stone)]">{q.rarity}</span>
                      {q.distanceM != null ? (
                        <span className="tabular-nums text-[var(--cyan)]">
                          {q.distanceM}m
                        </span>
                      ) : null}
                      {q.rewardHint ? (
                        <span className="truncate text-[var(--amber)]/80">{q.rewardHint}</span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="tabular-nums text-[9px] text-[var(--cyan)]">
                      {q.progress}/{q.requirement}
                    </span>
                    <button
                      type="button"
                      className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--amber)]"
                      title={q.pinned ? "Unpin" : "Pin"}
                      aria-label={q.pinned ? "Unpin objective" : "Pin objective"}
                      onClick={() => togglePin(q.id)}
                    >
                      {q.pinned ? (
                        <Pin className="h-3 w-3 text-[var(--amber)]" aria-hidden />
                      ) : (
                        <PinOff className="h-3 w-3" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
                <div className="lw-hud-quest__bar" aria-hidden>
                  <span style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
          {ordered[0]?.title} · {ordered.length} active
        </p>
      )}
    </div>
  );
}
