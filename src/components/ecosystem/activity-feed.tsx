"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EcosystemActivityItem } from "@/lib/ecosystem/activity-feed";
import { cn } from "@/lib/utils/cn";

const KIND_TONE: Record<string, string> = {
  hatch: "text-[var(--amber)]",
  restore: "text-[var(--emerald)]",
  marketplace: "text-[var(--cyan)]",
  guild_boss: "text-[var(--coral)]",
  discovery: "text-[var(--cyan)]",
  join: "text-white",
  festival: "text-[var(--amber)]",
  arena: "text-[var(--coral)]",
  token: "text-[var(--text-muted)]",
  community: "text-[var(--text-muted)]",
  quest: "text-[var(--emerald)]",
};

type Props = {
  className?: string;
  limit?: number;
  compact?: boolean;
};

export function GlobalActivityFeed({ className, limit = 12, compact }: Props) {
  const [items, setItems] = useState<EcosystemActivityItem[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/activity/feed?limit=${limit}`)
      .then((r) => r.json())
      .then((json: { items?: EcosystemActivityItem[]; note?: string }) => {
        if (cancelled) return;
        setItems(json.items ?? []);
        setNote(json.note ?? null);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <section className={cn("panel p-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-kicker">Live</p>
          <h2 className="font-display text-xl text-white">World activity</h2>
        </div>
        <Link href="/ecosystem" className="text-xs text-[var(--cyan)] focus-ring">
          Ecosystem
        </Link>
      </div>
      {loading ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">Loading feed…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">No activity yet.</p>
      ) : (
        <ul className={cn("mt-4 space-y-3", compact && "space-y-2")}>
          {items.map((item) => (
            <li
              key={item.id}
              className="border-b border-[var(--stroke)] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={cn("text-sm font-medium", KIND_TONE[item.kind] ?? "text-white")}>
                  {item.href ? (
                    <Link href={item.href} className="focus-ring hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </p>
                <time className="text-[10px] text-[var(--text-dim)]">
                  {new Date(item.at).toLocaleString()}
                </time>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
      {note ? <p className="mt-4 text-[10px] text-[var(--text-dim)]">{note}</p> : null}
    </section>
  );
}
