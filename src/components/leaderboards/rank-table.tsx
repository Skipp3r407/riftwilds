"use client";

import { motion } from "framer-motion";
import { GameImage } from "@/components/assets/game-image";
import { AffinityChip } from "@/components/leaderboards/affinity-chip";
import { TrendCell } from "@/components/leaderboards/trend-cell";
import { EmptyState } from "@/components/shared/page-header";
import { creaturePortraitPath } from "@/lib/assets/paths";
import { scoreForTab, winRatePercent } from "@/lib/leaderboards/demo-data";
import type { LeaderboardEntry, LeaderboardTab } from "@/lib/leaderboards/types";
import { cn } from "@/lib/utils/cn";

function metricHeader(tab: LeaderboardTab): string {
  if (tab === "rift") return "Rift Points";
  if (tab === "care") return "Care";
  if (tab === "collection") return "Binder cards";
  if (tab === "arena") return "Arena Points";
  return "Rift Points";
}

export function RankTable({
  entries,
  tab,
}: {
  entries: LeaderboardEntry[];
  tab: LeaderboardTab;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No keepers match"
        description="Try another affinity, widen the time range, or clear your search."
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--stroke)] bg-[rgba(8,8,14,0.45)] text-[10px] uppercase tracking-[0.16em] text-[var(--text-dim)]">
              <th className="px-3 py-3 font-medium md:px-4">Rank</th>
              <th className="px-3 py-3 font-medium md:px-4">Keeper</th>
              <th className="px-3 py-3 font-medium md:px-4">Riftling</th>
              <th className="px-3 py-3 font-medium md:px-4">Affinity</th>
              <th className="px-3 py-3 font-medium md:px-4">{metricHeader(tab)}</th>
              <th className="px-3 py-3 font-medium md:px-4">W / L</th>
              <th className="px-3 py-3 font-medium md:px-4">Win%</th>
              <th className="px-3 py-3 font-medium md:px-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <RankRow key={entry.wallet} entry={entry} tab={tab} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RankRow({
  entry,
  tab,
  index,
}: {
  entry: LeaderboardEntry;
  tab: LeaderboardTab;
  index: number;
}) {
  const score = scoreForTab(entry, tab);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.35), duration: 0.28 }}
      className={cn(
        "border-b border-[var(--stroke)] transition-colors",
        entry.isYou
          ? "bg-[rgba(61,231,255,0.1)] shadow-[inset_3px_0_0_var(--cyan)]"
          : "hover:bg-[rgba(255,255,255,0.03)]",
      )}
    >
      <td className="px-3 py-3 align-middle md:px-4">
        <span
          className={cn(
            "font-display text-sm",
            entry.rank === 1 && "text-[var(--amber)]",
            entry.rank === 2 && "text-[var(--cyan)]",
            entry.rank === 3 && "text-[var(--ember)]",
            entry.rank > 3 && "text-white",
          )}
        >
          #{entry.rank}
        </span>
      </td>
      <td className="px-3 py-3 align-middle md:px-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-white">{entry.playerName}</p>
            {entry.isYou ? (
              <span className="status-chip status-chip--info">You</span>
            ) : null}
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--text-dim)]">
            {entry.walletShort}
          </p>
        </div>
      </td>
      <td className="px-3 py-3 align-middle md:px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--stroke)] bg-[rgba(8,8,14,0.5)]">
            <GameImage
              src={creaturePortraitPath(entry.speciesSlug)}
              alt=""
              width={36}
              height={36}
              showDevBadge={false}
              className="h-8 w-8"
            />
          </div>
          <span className="text-[var(--text-muted)]">{entry.speciesName}</span>
        </div>
      </td>
      <td className="px-3 py-3 align-middle md:px-4">
        <AffinityChip affinity={entry.affinity} />
      </td>
      <td className="px-3 py-3 align-middle md:px-4">
        <span className="font-display text-[var(--amber)]">{score.toLocaleString()}</span>
      </td>
      <td className="px-3 py-3 align-middle font-mono text-xs text-[var(--text-muted)] md:px-4">
        <span className="text-[var(--emerald)]">{entry.wins}</span>
        <span className="mx-1 text-[var(--text-dim)]">/</span>
        <span className="text-[var(--danger)]">{entry.losses}</span>
      </td>
      <td className="px-3 py-3 align-middle font-mono text-xs text-[var(--cyan)] md:px-4">
        {winRatePercent(entry)}%
      </td>
      <td className="px-3 py-3 align-middle md:px-4">
        <TrendCell trend={entry.trend} delta={entry.trendDelta} />
      </td>
    </motion.tr>
  );
}
