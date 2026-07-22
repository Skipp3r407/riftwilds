"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BATTLE_HISTORY_MODE_FILTERS } from "@/lib/tcg/battle-hub";
import { cn } from "@/lib/utils/cn";

type Row = {
  state: {
    publicId: string;
    status: string;
    round: number;
    winnerId: string | null;
    completionReason: string | null;
    combatants: { id: string; name: string }[];
  };
  arenaPointsAwarded: number | null;
  createdAt: string;
  completedAt: string | null;
  mode: string;
};

function normalizeMode(mode: string) {
  return mode.trim().toLowerCase();
}

export function BattleHistoryList() {
  const searchParams = useSearchParams();
  const modeFilter = (searchParams.get("mode") ?? "all").toLowerCase();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/arena/my-battles")
      .then((r) => r.json())
      .then((d) => setRows(d.battles ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (modeFilter === "all" || modeFilter === "stakes") return rows;
    return rows.filter((row) => {
      const m = normalizeMode(row.mode);
      if (modeFilter === "practice") {
        return m.includes("practice") || m.includes("training");
      }
      if (modeFilter === "ai") {
        return m.includes("ai") || m.includes("training") || m.includes("boss");
      }
      return m.includes(modeFilter);
    });
  }, [modeFilter, rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="History mode filters">
        {BATTLE_HISTORY_MODE_FILTERS.map((f) => {
          const active = modeFilter === f.id;
          return (
            <Link
              key={f.id}
              href={f.href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                active
                  ? "border-[rgba(61,231,255,0.55)] bg-[rgba(61,231,255,0.14)] text-white"
                  : "border-[rgba(61,231,255,0.2)] text-[var(--text-muted)] hover:border-[rgba(61,231,255,0.45)] hover:text-[var(--text)]",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading history…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          No battles yet
          {modeFilter !== "all" ? ` for ${modeFilter}` : ""}.{" "}
          <Link href="/tcg/battle" className="text-[var(--cyan)] underline">
            Open Battle Hub
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => {
            const player = row.state.combatants[0];
            const won = row.state.winnerId === player?.id;
            return (
              <li key={row.state.publicId} className="panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-white">
                      {row.mode} · {player?.name ?? "Pet"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {row.state.publicId} · Round {row.state.round} ·{" "}
                      {row.state.status === "COMPLETED"
                        ? won
                          ? "Victory"
                          : row.state.winnerId
                            ? "Defeat"
                            : "Draw"
                        : "In progress"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--text-muted)]">
                    {row.arenaPointsAwarded != null ? (
                      <p className="text-[var(--mint)]">+{row.arenaPointsAwarded} AP</p>
                    ) : null}
                    <p>{new Date(row.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
