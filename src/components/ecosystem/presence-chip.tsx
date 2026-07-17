"use client";

import { useEffect, useState } from "react";
import type { LivePresenceSnapshot } from "@/lib/ecosystem/presence";

export function PresenceChip({ className }: { className?: string }) {
  const [snap, setSnap] = useState<LivePresenceSnapshot | null>(null);

  useEffect(() => {
    void fetch("/api/presence")
      .then((r) => r.json())
      .then((json: { presence?: LivePresenceSnapshot }) => setSnap(json.presence ?? null))
      .catch(() => setSnap(null));
  }, []);

  const label =
    snap?.globalOnline !== null && snap?.globalOnline !== undefined
      ? `${snap.globalOnline} online`
      : "Presence stub";

  return (
    <span
      className={className}
      title={snap?.note ?? "Live presence awaits multiplayer authority"}
    >
      <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--stroke)] px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)] opacity-60" aria-hidden />
        {label}
      </span>
    </span>
  );
}
