"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { GlobalActivityFeed } from "@/components/ecosystem/activity-feed";

type CivPayload = {
  enabled?: boolean;
  progressPercent?: number;
  progress?: {
    era: number | string;
    unlockedMilestoneKeys: string[];
    contributions: Record<string, number>;
  };
  milestones?: Array<{
    key: string;
    name: string;
    description: string;
    imageSrc?: string;
    contributed: number;
    unlocked: boolean;
    target?: number;
    threshold?: number;
  }>;
  activeEffects?: Array<{ kind: string; [key: string]: unknown } | string>;
  disclaimer?: string;
};

export default function WorldRestorationPage() {
  const [data, setData] = useState<CivPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    setLoading(true);
    void fetch("/api/civilization")
      .then((r) => r.json())
      .then((json: CivPayload) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const contribute = async () => {
    setBusy(true);
    try {
      await fetch("/api/civilization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      });
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const percent = data?.progressPercent ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Living world"
        titleSlug="restoration"
        title="World Restoration"
        description="Collective civilization milestones permanently reshape The Riftwilds. Cooperative entertainment — no cash value."
        status={data?.enabled ? "Live progress" : "Paused"}
        statusTone={data?.enabled ? "live" : "warn"}
        actions={
          <>
            <Link href="/ecosystem" className="btn-secondary focus-ring text-sm">
              Ecosystem
            </Link>
            <Link href="/live-world" className="btn-primary focus-ring text-sm">
              Enter Live World
            </Link>
          </>
        }
      />

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading restoration…</p>
      ) : data?.enabled === false ? (
        <section className="panel p-5 text-sm text-[var(--text-muted)]">
          Civilization restoration is paused by feature flag.
        </section>
      ) : (
        <>
          <section className="panel p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Era</p>
                <p className="font-display text-2xl text-white">
                  {data?.progress?.era ?? "Unknown"}
                </p>
              </div>
              <StatusChip tone="live">{percent}% restored</StatusChip>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                className="h-full rounded-full bg-[var(--emerald)] transition-all"
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
            <button
              type="button"
              className="btn-secondary focus-ring mt-4 text-sm"
              disabled={busy}
              onClick={() => void contribute()}
            >
              {busy ? "Contributing…" : "Contribute (demo)"}
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(data?.milestones ?? []).map((m) => {
              const target = m.target ?? m.threshold;
              return (
                <article
                  key={m.key}
                  className="panel overflow-hidden p-0 transition-[border-color] hover:border-[rgba(61,231,255,0.28)]"
                >
                  {m.imageSrc ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-[var(--stroke)]">
                      <Image
                        src={m.imageSrc}
                        alt={m.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                        priority={m.key === "commons_lanterns"}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.72)] via-transparent to-transparent"
                        aria-hidden
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-display text-lg text-white">{m.name}</h2>
                      <StatusChip tone={m.unlocked ? "live" : "default"}>
                        {m.unlocked ? "unlocked" : "open"}
                      </StatusChip>
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">{m.description}</p>
                    <p className="mt-2 text-xs text-[var(--text-dim)]">
                      Contributed {m.contributed}
                      {target !== undefined ? ` / ${target}` : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlobalActivityFeed limit={8} compact />
            <section className="panel space-y-2 p-5 text-xs text-[var(--text-muted)]">
              <h2 className="font-display text-lg text-white">Active effects</h2>
              {(data?.activeEffects ?? []).length === 0 ? (
                <p>No permanent effects unlocked yet.</p>
              ) : (
                <ul className="space-y-1">
                  {(data?.activeEffects ?? []).map((e, i) => (
                    <li key={i} className="text-white">
                      {typeof e === "string" ? e : e.kind}
                    </li>
                  ))}
                </ul>
              )}
              {data?.disclaimer ? <p className="pt-2">{data.disclaimer}</p> : null}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
