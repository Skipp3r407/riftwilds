"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  QUEST_CATALOG,
  QUEST_CATEGORY_LABELS,
  QUEST_DIFFICULTY_LABELS,
  QUEST_STATUS_LABELS,
  QUEST_TAB_LABELS,
  QUEST_TAB_THUMB,
  formatQuestReward,
  questArtPath,
  questObjectiveProgressPercent,
  type QuestBoardTab,
  type QuestDef,
  type QuestDifficulty,
  type QuestStatus,
} from "@/game/quests/quest-catalog";
import {
  acceptQuest,
  advanceQuestProgress,
  loadQuestDemoState,
  resetQuestDemoState,
  saveQuestDemoState,
  trackQuest,
  type QuestDemoState,
} from "@/game/quests/quest-demo-store";
import {
  QUEST_INSET,
  QUEST_PANEL,
  QUEST_PANEL_ACTIVE,
} from "@/components/quests/quest-surface";
import { StatusChip } from "@/components/shared/page-header";
import { playSfx } from "@/hooks/use-sfx";
import { guestFetch } from "@/lib/auth/guest-client";
import { cn } from "@/lib/utils/cn";

/** Claim egg rewards via hatchery earn API (free, no wallet). */
async function claimQuestEggRewards(quest: QuestDef) {
  for (const r of quest.rewards) {
    if (r.kind !== "egg") continue;
    try {
      await guestFetch("/api/hatchery/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: r.earnPath ?? "QUEST",
          questKey: quest.key,
          requestId: `quest-egg:${quest.key}`,
        }),
      });
    } catch {
      /* demo board — soft-fail; egg still listed as reward copy */
    }
  }
}

const TABS: QuestBoardTab[] = ["all", "story", "daily", "exploration"];
const STATUSES: Array<QuestStatus | "all"> = [
  "all",
  "available",
  "active",
  "completed",
  "locked",
];
const DIFFICULTIES: Array<QuestDifficulty | "all"> = ["all", "easy", "medium", "hard"];

const STATUS_TONE: Record<QuestStatus, "live" | "warn" | "info" | "danger" | "default"> = {
  available: "info",
  active: "live",
  completed: "default",
  locked: "warn",
};

const DIFF_COLOR: Record<QuestDifficulty, string> = {
  easy: "text-[var(--emerald)] border-[var(--emerald)]/35 bg-[rgba(61,255,176,0.08)]",
  medium: "text-[var(--amber)] border-[var(--amber)]/35 bg-[rgba(255,184,77,0.08)]",
  hard: "text-[var(--coral)] border-[var(--coral)]/35 bg-[rgba(255,107,107,0.08)]",
};

const CAT_ACCENT: Record<string, string> = {
  STORY: "var(--violet)",
  DAILY: "var(--cyan)",
  WEEKLY: "var(--tide)",
  EXPLORATION: "var(--grove)",
  CARE: "var(--spirit)",
  BATTLE: "var(--ember)",
  COLLECTION: "var(--radiant)",
  COMMUNITY: "var(--storm)",
  EVENT: "var(--amber)",
};

/** Subtle body wash by region (falls back to category accent). Keep low opacity for readability. */
const REGION_TINT: Record<string, string> = {
  "riftwild-commons": "var(--cyan)",
  "sproutfall-grove": "var(--grove)",
  "elderwood-forest": "var(--grove)",
  "cindercrag-basin": "var(--ember)",
  "ember-crater": "var(--ember)",
  "moonwater-coast": "var(--tide)",
  "stormspire-peaks": "var(--storm)",
  "stoneheart-canyon": "var(--amber)",
  "frostveil-basin": "var(--tide)",
  "radiant-citadel": "var(--radiant)",
  "void-hollow": "var(--violet)",
  "alloy-ruins": "var(--alloy)",
  "spirit-marsh": "var(--spirit)",
  "celestial-rift": "var(--violet)",
};

function questBodyTint(quest: QuestDef): string {
  const accent = CAT_ACCENT[quest.category] ?? "var(--cyan)";
  const region = quest.regionKey ? REGION_TINT[quest.regionKey] : undefined;
  const wash = region ?? accent;
  return [
    `linear-gradient(180deg, color-mix(in srgb, ${wash} 7%, transparent) 0%, transparent 42%)`,
    `radial-gradient(ellipse 90% 55% at 80% 0%, color-mix(in srgb, ${accent} 12%, transparent), transparent 70%)`,
    `linear-gradient(165deg, color-mix(in srgb, ${wash} 5%, rgba(8,8,14,0.55)) 0%, rgba(8,8,14,0.2) 100%)`,
  ].join(", ");
}

export function QuestBoard() {
  const [state, setState] = useState<QuestDemoState | null>(null);
  const [tab, setTab] = useState<QuestBoardTab>("all");
  const [statusFilter, setStatusFilter] = useState<QuestStatus | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<QuestDifficulty | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setState(loadQuestDemoState());
  }, []);

  useEffect(() => {
    if (state) saveQuestDemoState(state);
  }, [state]);

  const counts = useMemo(() => {
    const c: Record<QuestBoardTab, number> = {
      all: QUEST_CATALOG.length,
      story: 0,
      daily: 0,
      exploration: 0,
    };
    for (const q of QUEST_CATALOG) c[q.boardTab] += 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    if (!state) return [];
    return QUEST_CATALOG.filter((q) => {
      if (tab !== "all" && q.boardTab !== tab) return false;
      const entry = state[q.key];
      const status = entry?.status ?? "available";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
      const qText = query.trim().toLowerCase();
      if (
        qText &&
        !q.name.toLowerCase().includes(qText) &&
        !q.description.toLowerCase().includes(qText) &&
        !q.key.includes(qText) &&
        !(q.regionName?.toLowerCase().includes(qText) ?? false) &&
        !(q.regionKey?.includes(qText) ?? false)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const rank = (s: QuestStatus) =>
        ({ active: 0, available: 1, locked: 2, completed: 3 })[s] ?? 4;
      const sa = state[a.key]?.status ?? "available";
      const sb = state[b.key]?.status ?? "available";
      if (rank(sa) !== rank(sb)) return rank(sa) - rank(sb);
      return a.sortOrder - b.sortOrder;
    });
  }, [state, tab, statusFilter, difficultyFilter, query]);

  const stats = useMemo(() => {
    if (!state) return { active: 0, completed: 0, tracked: 0 };
    let active = 0;
    let completed = 0;
    let tracked = 0;
    for (const q of QUEST_CATALOG) {
      const e = state[q.key];
      if (!e) continue;
      if (e.status === "active") active += 1;
      if (e.status === "completed") completed += 1;
      if (e.tracked) tracked += 1;
    }
    return { active, completed, tracked };
  }, [state]);

  const patch = (updater: (prev: QuestDemoState) => QuestDemoState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  };

  if (!state) {
    return (
      <div className={cn(QUEST_PANEL, "p-8 text-sm text-[var(--text-muted)]")}>
        Loading quest board…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn(QUEST_PANEL, "relative overflow-hidden p-4 md:p-5")}>
        <div className="pointer-events-none absolute inset-0 z-[1] surface-grid opacity-40" />
        <div className="relative z-[1] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="warn">DEMO TRACKING</StatusChip>
            <StatusChip tone="info">Phase 3 board</StatusChip>
            <span className="text-xs text-[var(--text-muted)]">
              {stats.active} active · {stats.completed} completed · {stats.tracked} tracked
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/academy?lesson=b13-quests" className="btn-secondary focus-ring text-xs">
              Academy: Quests
            </Link>
            <button
              type="button"
              className="btn-secondary focus-ring text-xs"
              onClick={() => setState(resetQuestDemoState())}
            >
              Reset demo
            </button>
          </div>
        </div>

        <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  playSfx("ui.nav");
                  setTab(t);
                }}
                className={cn(
                  "focus-ring group flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs transition",
                  active
                    ? "border-[var(--stroke-strong)] bg-[rgba(61,231,255,0.12)] text-white shadow-[0_0_24px_rgba(61,231,255,0.12)]"
                    : "border-[var(--stroke)] bg-[rgba(8,8,14,0.35)] text-[var(--text-muted)] hover:border-[var(--stroke-strong)] hover:text-white",
                )}
              >
                <span className="relative size-7 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--stroke)] bg-[rgba(8,8,14,0.5)]">
                  <Image
                    src={QUEST_TAB_THUMB[t]}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="size-full object-contain p-0.5"
                  />
                </span>
                <span className="font-display tracking-wide">{QUEST_TAB_LABELS[t]}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active ? "bg-black/30 text-[var(--cyan)]" : "bg-black/20 text-[var(--text-dim)]",
                  )}
                >
                  {counts[t]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative z-[1] mt-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as QuestStatus | "all")}
              className="rounded-[var(--radius-sm)] border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs normal-case tracking-normal text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : QUEST_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
            Difficulty
            <select
              value={difficultyFilter}
              onChange={(e) =>
                setDifficultyFilter(e.target.value as QuestDifficulty | "all")
              }
              className="rounded-[var(--radius-sm)] border border-[var(--stroke)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs normal-case tracking-normal text-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All difficulties" : QUEST_DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quests…"
            className="ml-auto min-w-[12rem] flex-1 rounded-[var(--radius-sm)] border border-[var(--stroke)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-white placeholder:text-[var(--text-dim)] sm:max-w-xs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={cn(QUEST_PANEL, "p-8 text-center text-sm text-[var(--text-muted)]")}>
          No quests match these filters.
        </div>
      ) : (
        <ul className="grid items-start gap-3 lg:grid-cols-2">
          {filtered.map((quest) => (
            <li key={quest.key} className="h-auto self-start">
              <QuestCard
                quest={quest}
                entry={state[quest.key]!}
                onAccept={() => {
                  playSfx("quests.accept");
                  patch((s) => acceptQuest(s, quest.key));
                }}
                onTrack={() => {
                  playSfx("ui.click");
                  patch((s) => trackQuest(s, quest.key));
                }}
                onAdvance={() => {
                  const before = state[quest.key]?.status;
                  patch((s) => {
                    const next = advanceQuestProgress(s, quest.key);
                    const after = next[quest.key]?.status;
                    if (after === "completed" && before !== "completed") {
                      playSfx("quests.complete");
                      void claimQuestEggRewards(quest);
                    } else if (after === "active") {
                      playSfx("quests.objective");
                    }
                    return next;
                  });
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuestCard({
  quest,
  entry,
  onAccept,
  onTrack,
  onAdvance,
}: {
  quest: QuestDef;
  entry: QuestDemoState[string];
  onAccept: () => void;
  onTrack: () => void;
  onAdvance: () => void;
}) {
  const pct = questObjectiveProgressPercent(quest, entry.progress);
  const accent = CAT_ACCENT[quest.category] ?? "var(--cyan)";
  const locked = entry.status === "locked";
  const [artFailed, setArtFailed] = useState(false);

  return (
    <article
      className={cn(
        QUEST_PANEL,
        // Content-sized column — never stretch to row height or space-between mid-card voids.
        "relative flex h-auto flex-col justify-start overflow-hidden transition duration-300",
        (entry.status === "active" || entry.tracked) && QUEST_PANEL_ACTIVE,
        locked && "opacity-75",
      )}
    >
      {/* Bleed art under the card border so rounded top corners stay flush (no hairline gap). */}
      <div className="relative z-[1] -mx-px -mt-px aspect-[16/9] w-[calc(100%+2px)] shrink-0 overflow-hidden border-b border-[var(--stroke)] bg-[rgba(8,8,14,0.72)]">
        {!artFailed ? (
          <Image
            src={questArtPath(quest.key)}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center [transform:scale(1.02)]"
            onError={() => setArtFailed(true)}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--cyan)_22%,transparent),transparent_55%),linear-gradient(145deg,#12121c,#0a0a12)]"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(8,8,14,0.8)] to-transparent" />
        <div className="absolute right-3 top-3">
          <StatusChip tone={STATUS_TONE[entry.status]}>
            {QUEST_STATUS_LABELS[entry.status]}
          </StatusChip>
        </div>
      </div>

      <div
        className="relative z-[1] flex flex-col justify-start gap-4 p-4"
        style={{ backgroundImage: questBodyTint(quest) }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: accent,
                borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`,
                background: `color-mix(in srgb, ${accent} 12%, transparent)`,
              }}
            >
              {QUEST_CATEGORY_LABELS[quest.category]}
            </span>
            <span
              className={cn(
                "rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                DIFF_COLOR[quest.difficulty],
              )}
            >
              {QUEST_DIFFICULTY_LABELS[quest.difficulty]}
            </span>
            {quest.repeatable ? (
              <span className="text-[10px] text-[var(--text-dim)]">Repeatable</span>
            ) : null}
          </div>
          <h3 className="mt-2 font-display text-base text-white md:text-lg">{quest.name}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{quest.description}</p>
          {quest.regionName ? (
            <p className="mt-1.5 text-[11px] text-[var(--text-dim)]">
              Region · {quest.regionName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Objectives
          </p>
          <ul className="space-y-1.5">
            {quest.objectives.map((obj) => {
              const current = Math.min(entry.progress[obj.key] ?? 0, obj.target);
              const done = current >= obj.target || entry.status === "completed";
              return (
                <li
                  key={obj.key}
                  className={cn(QUEST_INSET, "flex items-start gap-2 px-2.5 py-2 text-xs")}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px]",
                      done
                        ? "border-[var(--emerald)] bg-[rgba(61,255,176,0.2)] text-[var(--emerald)]"
                        : "border-[var(--stroke)] text-transparent",
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className={cn("min-w-0 flex-1", done && "text-[var(--text-muted)] line-through")}>
                    {obj.description}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--text-dim)]">
                    {current}/{obj.target}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {entry.status === "active" || entry.status === "completed" ? (
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--text-dim)]">
              <span>Progress</span>
              <span className="tabular-nums text-[var(--cyan)]">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[var(--violet)] transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
            Rewards
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {quest.rewards.map((r, i) => (
              <span
                key={`${quest.key}-r-${i}`}
                className={cn(QUEST_INSET, "px-2 py-1 text-[11px] text-[var(--text)]")}
              >
                {formatQuestReward(r)}
              </span>
            ))}
          </div>
        </div>

        {locked && quest.requires?.length ? (
          <p className="text-[11px] text-[var(--amber)]">
            Locked — complete{" "}
            {quest.requires
              .map((k) => QUEST_CATALOG.find((q) => q.key === k)?.name ?? k)
              .join(", ")}{" "}
            first.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {entry.status === "available" ? (
            <button type="button" className="btn-primary focus-ring text-xs" onClick={onAccept}>
              Accept
            </button>
          ) : null}
          {entry.status === "active" || entry.status === "available" ? (
            <button
              type="button"
              className={cn(
                "btn-secondary focus-ring text-xs",
                entry.tracked && "border-[var(--stroke-strong)] text-[var(--cyan)]",
              )}
              onClick={onTrack}
            >
              {entry.tracked ? "Tracking" : "Track"}
            </button>
          ) : null}
          {entry.status === "active" ? (
            <button type="button" className="btn-secondary focus-ring text-xs" onClick={onAdvance}>
              Advance (demo)
            </button>
          ) : null}
          {entry.status === "completed" ? (
            <span className="self-center text-[11px] text-[var(--emerald)]">
              Rewards preview ready
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
