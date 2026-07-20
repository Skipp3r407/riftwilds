"use client";

import { useEffect, useState } from "react";
import type { PublicMapDirectoryEntry } from "@/lib/world-expansion/types";

const LABEL_TONE: Record<string, string> = {
  Quiet: "text-[var(--emerald)]",
  Settling: "text-[var(--cyan)]",
  Lively: "text-[var(--gold)]",
  Busy: "text-[var(--coral)]",
  Full: "text-[var(--coral)]",
};

type MapDirectoryPanelProps = {
  /** When true, hide live crowd/housing status — public Live World not launched. */
  comingSoon?: boolean;
};

export function MapDirectoryPanel({ comingSoon = false }: MapDirectoryPanelProps) {
  const [entries, setEntries] = useState<PublicMapDirectoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/world-expansion");
        const data = await res.json();
        if (!cancelled) {
          if (!data.ok) setError(data.error ?? "unavailable");
          else setEntries(data.directory ?? []);
        }
      } catch {
        if (!cancelled) setError("network");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading map directory…</p>;
  }
  if (error) {
    return <p className="text-sm text-[var(--coral)]">Directory unavailable ({error}).</p>;
  }

  if (comingSoon && entries.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Settlements open with Live World — Coming Soon.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {entries.map((e) => (
        <li
          key={e.mapId}
          className="rounded-md border border-[var(--stroke)] px-3 py-3 text-sm"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-white">{e.name}</span>
            {comingSoon ? (
              <span className="text-xs uppercase tracking-wide text-[var(--amber)]">
                Coming Soon
              </span>
            ) : (
              <span className={`text-xs uppercase ${LABEL_TONE[e.crowdLabel] ?? ""}`}>
                {e.crowdLabel}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {e.biome} · {e.regionSlug}
            {e.isOverflow ? " · temporary event space" : ""}
          </p>
          {comingSoon ? (
            <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
              Housing & crowd status open with Live World
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
              {e.friendsPresent > 0 ? <li>Friends here</li> : null}
              {e.guildPresent ? <li>Guild</li> : null}
              {e.hasActiveEvent ? <li>Event</li> : null}
              {e.housingAvailable ? <li>Housing open</li> : <li>No vacant plots</li>}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
