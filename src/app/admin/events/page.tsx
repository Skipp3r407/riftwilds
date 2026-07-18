"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CatalogRow = { key: string; name: string; tier: string; qualifyScore: number };
type Snapshot = {
  active: { id: string; name: string; phase: string; key: string; regionSlug: string } | null;
  catalog: CatalogRow[];
  multiplayerBacklog?: string[];
};

export default function AdminEventsPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/world-events/admin");
    const json = (await res.json()) as { snapshot?: Snapshot };
    setSnapshot(json.snapshot ?? null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/world-events/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok?: boolean; note?: string; error?: string };
    setMessage(json.note ?? json.error ?? (json.ok ? "OK" : "Failed"));
    await refresh();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Dynamic World Events</h1>
      <p className="page-lede mt-2">
        Schedule / trigger living-world spectacle. Soft Credits only — never SOL. Full 100-player
        boss sync remains backlog.
      </p>

      {snapshot?.active ? (
        <div className="panel mt-6 p-4 text-sm">
          <p className="font-display text-white">Active</p>
          <p className="mt-1 text-[var(--text-muted)]">
            {snapshot.active.name} · {snapshot.active.phase} · {snapshot.active.regionSlug}
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-[var(--text-muted)]">No active world event.</p>
      )}

      {message ? <p className="mt-3 text-xs text-[var(--cyan)]">{message}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary focus-ring text-sm"
          onClick={() => void post({ action: "ensure_demo" })}
        >
          Ensure demo event
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring text-sm"
          onClick={() => void post({ action: "schedule_tick", forceSpawn: true })}
        >
          Scheduler tick (force)
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring text-sm"
          onClick={() => void post({ action: "cancel", cancelReason: "Admin stop" })}
        >
          Cancel active
        </button>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg text-white">Catalog triggers</h2>
        <ul className="mt-3 space-y-2">
          {(snapshot?.catalog ?? []).map((row) => (
            <li
              key={row.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--stroke)] px-3 py-2 text-sm"
            >
              <span>
                {row.name}{" "}
                <span className="text-[var(--text-dim)]">
                  ({row.tier} · qualify {row.qualifyScore})
                </span>
              </span>
              <button
                type="button"
                className="btn-primary focus-ring text-xs"
                onClick={() =>
                  void post({ action: "trigger", key: row.key, skipAnnounce: true })
                }
              >
                Trigger
              </button>
            </li>
          ))}
        </ul>
      </section>

      {snapshot?.multiplayerBacklog?.length ? (
        <section className="panel mt-8 p-4">
          <h2 className="font-display text-base text-white">Multiplayer backlog</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--text-muted)]">
            {snapshot.multiplayerBacklog.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/api/festivals" className="btn-secondary focus-ring text-sm">
          Festivals API
        </Link>
        <Link href="/admin/loyalty" className="btn-secondary focus-ring text-sm">
          Rift Storm
        </Link>
        <Link href="/admin" className="btn-secondary focus-ring text-sm">
          Back to admin
        </Link>
      </div>
    </main>
  );
}
