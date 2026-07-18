"use client";

import { useEffect, useState } from "react";

type Goal = {
  id: string;
  title: string;
  summary: string;
  kind: string;
  creditHintMin: number;
  creditHintMax: number;
  suggestedSink: string;
  starterRecommended?: boolean;
  iconAsset: string;
  priority: number;
};

export function MapGoalsPanel({
  regionId = "riftwild-commons",
  starterOnly = false,
}: {
  regionId?: string;
  starterOnly?: boolean;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const qs = starterOnly
      ? "starter=1"
      : `regionId=${encodeURIComponent(regionId)}`;
    (async () => {
      try {
        const res = await fetch(`/api/map-goals?${qs}`);
        const json = (await res.json()) as {
          ok?: boolean;
          goals?: Goal[];
          error?: string;
        };
        if (!res.ok || json.ok === false) {
          if (!cancelled) setError(json.error ?? "Failed to load map goals");
          return;
        }
        if (!cancelled) setGoals(json.goals ?? []);
      } catch {
        if (!cancelled) setError("Network error loading map goals");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [regionId, starterOnly]);

  return (
    <section className="panel space-y-4 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--text-dim)]">Map Goals</p>
        <h2 className="font-display text-xl font-bold text-white">
          {starterOnly ? "Starter recommendations" : "Region goals"}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Earn Credits through work — spend them on shops, travel, repairs, and restoration.
        </p>
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <ul className="space-y-3">
        {goals.map((g) => (
          <li key={g.id} className="flex gap-3 border-b border-[var(--stroke)] pb-3 last:border-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.iconAsset} alt="" width={36} height={36} className="mt-0.5 h-9 w-9" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">{g.title}</p>
              <p className="text-sm text-[var(--text-muted)]">{g.summary}</p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                {g.creditHintMax > 0
                  ? `Credits ~${g.creditHintMin}–${g.creditHintMax}`
                  : "Spend / donate"}{" "}
                · sink {g.suggestedSink}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
