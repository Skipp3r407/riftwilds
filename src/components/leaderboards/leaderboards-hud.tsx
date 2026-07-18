"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { LeaderboardPodium } from "@/components/leaderboards/podium";
import { RankTable } from "@/components/leaderboards/rank-table";
import { StatusChip } from "@/components/shared/page-header";
import {
  AFFINITY_OPTIONS,
  CURRENT_SEASON_ID,
  DEMO_YOU_WALLET,
  filterLeaderboardEntries,
  getDemoLeaderboard,
  LEADERBOARD_SEASONS,
  scoreForTab,
  winRatePercent,
} from "@/lib/leaderboards/demo-data";
import type {
  AffinityFilter,
  LeaderboardTab,
  LeaderboardTimeRange,
} from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

const TABS: { id: LeaderboardTab; label: string; stub?: boolean }[] = [
  { id: "rift", label: "Rift Battles" },
  { id: "collection", label: "Card Binder" },
  { id: "care", label: "Care", stub: true },
  { id: "arena", label: "Legacy Arena", stub: true },
];

const TIME_RANGES: { id: LeaderboardTimeRange; label: string }[] = [
  { id: "season", label: "Season" },
  { id: "week", label: "This week" },
];

export function LeaderboardsHud({
  defaultTab = "rift",
  showNoWagering = true,
}: {
  defaultTab?: LeaderboardTab;
  showNoWagering?: boolean;
}) {
  const [tab, setTab] = useState<LeaderboardTab>(defaultTab);
  const [seasonId, setSeasonId] = useState(CURRENT_SEASON_ID);
  const [timeRange, setTimeRange] = useState<LeaderboardTimeRange>("season");
  const [affinity, setAffinity] = useState<AffinityFilter>("ALL");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const season = LEADERBOARD_SEASONS.find((s) => s.id === seasonId) ?? LEADERBOARD_SEASONS[0]!;

  const filtered = useMemo(() => {
    const raw = getDemoLeaderboard({ seasonId, timeRange });
    return filterLeaderboardEntries(raw, {
      tab,
      affinity,
      query: deferredQuery,
    });
  }, [seasonId, timeRange, tab, affinity, deferredQuery]);

  const youEntry = useMemo(
    () => filtered.find((e) => e.isYou || e.wallet === DEMO_YOU_WALLET) ?? null,
    [filtered],
  );

  const tabMeta = TABS.find((t) => t.id === tab);

  return (
    <div className="space-y-5">
      {showNoWagering && (tab === "rift" || tab === "arena") ? (
        <ArenaNoWageringBanner />
      ) : null}

      <section className="panel surface-grid relative overflow-hidden p-4 md:p-5">
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
                Season control
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="lb-season">
                  Season
                </label>
                <select
                  id="lb-season"
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  className="focus-ring rounded-[var(--radius-md)] border border-[var(--stroke-strong)] bg-[rgba(8,8,14,0.65)] px-3 py-2 font-display text-sm text-white"
                >
                  {LEADERBOARD_SEASONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span
                  className={cn(
                    "status-chip",
                    season.status === "live" && "status-chip--live",
                    season.status === "ended" && "status-chip--warn",
                    season.status === "upcoming" && "status-chip--info",
                  )}
                >
                  {season.status === "live" ? "Current season" : season.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {season.startsAt} → {season.endsAt}
                {tab === "rift"
                  ? " · Rift Points from practice wins & energy play — earn-only, no cash value."
                  : tab === "collection"
                    ? " · Binder progress ranks unique cards collected."
                    : tab === "arena"
                      ? " · Legacy Arena Points — soft-secondary to Rift Battles."
                      : " · Secondary boards use demo scores until live feeds ship."}
              </p>
              <p className="mt-2 text-xs">
                <Link href="/tcg/battle" className="text-[var(--cyan)] underline-offset-2 hover:underline">
                  Play Rift Battle
                </Link>
                <span className="mx-2 text-[var(--text-dim)]">·</span>
                <Link
                  href="/tcg/collection"
                  className="text-[var(--amber)] underline-offset-2 hover:underline"
                >
                  Open Card Binder
                </Link>
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Leaderboard boards">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "focus-ring rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition",
                    tab === t.id
                      ? "border-[var(--cyan)] bg-[rgba(61,231,255,0.14)] text-white shadow-[0_0_18px_rgba(61,231,255,0.12)]"
                      : "border-[var(--stroke)] text-[var(--text-muted)] hover:border-[rgba(61,231,255,0.35)] hover:text-white",
                  )}
                >
                  {t.label}
                  {t.stub ? (
                    <span className="ml-1.5 text-[9px] text-[var(--amber)]">demo</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]"
                aria-hidden
              />
              <label className="sr-only" htmlFor="lb-search">
                Search by name or wallet
              </label>
              <input
                id="lb-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keeper, wallet, species…"
                className="focus-ring w-full rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(8,8,14,0.55)] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-[var(--text-dim)]"
              />
            </div>

            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
              Affinity
              <select
                value={affinity}
                onChange={(e) => setAffinity(e.target.value as AffinityFilter)}
                className="focus-ring rounded-[var(--radius-md)] border border-[var(--stroke)] bg-[rgba(8,8,14,0.55)] px-3 py-2 text-sm normal-case tracking-normal text-white"
              >
                {AFFINITY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="flex flex-col gap-1 border-0 p-0">
              <legend className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
                Time range
              </legend>
              <div className="flex gap-1.5">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTimeRange(r.id)}
                    className={cn(
                      "focus-ring rounded-[var(--radius-md)] border px-3 py-2 text-sm transition",
                      timeRange === r.id
                        ? "border-[var(--amber)] bg-[rgba(255,184,77,0.12)] text-[var(--amber)]"
                        : "border-[var(--stroke)] text-[var(--text-muted)] hover:text-white",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      {youEntry ? (
        <aside
          className="panel-soft flex flex-wrap items-center justify-between gap-3 border-[rgba(61,231,255,0.35)] px-4 py-3"
          aria-label="Your rank"
        >
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-[var(--cyan)]">
              Your rank
            </p>
            <p className="mt-1 text-sm text-white">
              <span className="font-display text-xl text-[var(--cyan)]">#{youEntry.rank}</span>
              <span className="mx-2 text-[var(--text-dim)]">·</span>
              {youEntry.playerName}
              <span className="ml-2 font-mono text-xs text-[var(--text-dim)]">
                {youEntry.walletShort}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <p>
              <span className="text-[var(--text-dim)]">
                {tabMeta?.label ?? "Score"}
              </span>{" "}
              <span className="font-display text-[var(--amber)]">
                {scoreForTab(youEntry, tab).toLocaleString()}
              </span>
            </p>
            <p className="font-mono text-xs text-[var(--text-muted)]">
              <span className="text-[var(--emerald)]">{youEntry.wins}W</span>
              {" / "}
              <span className="text-[var(--danger)]">{youEntry.losses}L</span>
              <span className="ml-2 text-[var(--cyan)]">{winRatePercent(youEntry)}%</span>
            </p>
            <StatusChip tone="info">Demo wallet</StatusChip>
          </div>
        </aside>
      ) : (
        <aside className="panel-inset px-4 py-3 text-sm text-[var(--text-muted)]">
          Your demo rank is outside the current filter set. Clear search or affinity to find it.
        </aside>
      )}

      <LeaderboardPodium entries={filtered} tab={tab} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--text-muted)]">
          Showing <span className="text-white">{filtered.length}</span> keepers ·{" "}
          {tabMeta?.label}
          {tabMeta?.stub ? " (stub board)" : ""}
        </p>
        <StatusChip tone="warn">Feature-flagged demo data</StatusChip>
      </div>

      <RankTable entries={filtered} tab={tab} />
    </div>
  );
}
