"use client";

import { useEffect, useState } from "react";

type SourceRow = {
  kind: string;
  displayName: string;
  accountBound: boolean;
  sellable: boolean;
  releasedToday: number;
  releasedThisWeek: number;
  totalReleased: number;
  remainingToday: number | null;
  remainingThisWeek: number | null;
  remainingTotal: number | null;
  maxReleasedPerWeek: number | null;
  slowRelease: boolean;
};

export function SupplyStatusPanel() {
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    void fetch("/api/marketplace/supply")
      .then((r) => r.json())
      .then((data) => {
        setSources(data.sources ?? []);
        setNotes(data.notes ?? []);
      })
      .catch(() => {
        setSources([]);
      });
  }, []);

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <h2 className="font-display text-lg text-white">Egg supply & release</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Limited sources with daily/weekly caps. Starter eggs stay account-bound.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="text-[var(--text-muted)]">
            <tr className="border-b border-[var(--stroke)]">
              <th className="py-2 pr-3 font-medium">Source</th>
              <th className="py-2 pr-3 font-medium">Week</th>
              <th className="py-2 pr-3 font-medium">Today left</th>
              <th className="py-2 pr-3 font-medium">Total left</th>
              <th className="py-2 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.kind} className="border-b border-[var(--stroke)]/60">
                <td className="py-2.5 pr-3 text-white">{s.displayName}</td>
                <td className="py-2.5 pr-3 text-[var(--text-muted)]">
                  {s.releasedThisWeek}
                  {s.maxReleasedPerWeek != null ? ` / ${s.maxReleasedPerWeek}` : ""}
                </td>
                <td className="py-2.5 pr-3 text-[var(--text-muted)]">
                  {s.remainingToday ?? "∞"}
                </td>
                <td className="py-2.5 pr-3 text-[var(--text-muted)]">
                  {s.remainingTotal ?? "∞"}
                </td>
                <td className="py-2.5 text-[var(--text-muted)]">
                  {!s.sellable || s.accountBound ? "account-bound" : "sellable"}
                  {s.slowRelease ? " · slow release" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-1 text-[11px] text-[var(--text-muted)]">
        {notes.map((n) => (
          <li key={n}>• {n}</li>
        ))}
      </ul>
    </section>
  );
}
