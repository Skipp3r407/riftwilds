"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export function BattleHistoryList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/arena/my-battles")
      .then((r) => r.json())
      .then((d) => setRows(d.battles ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading history…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        No battles yet.{" "}
        <Link href="/arena/training" className="text-[var(--cyan)] underline">
          Start a training duel
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
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
  );
}
