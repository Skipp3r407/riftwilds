"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatSol } from "@/game/rift-stakes/config";

type Snapshot = {
  treasuryWallet: string;
  collectedFeesLamports: number;
  allocationBps: Record<string, number>;
  allocatedLamports: Record<string, number>;
  recentTx: {
    id: string;
    kind: string;
    amountLamports: number;
    bucket: string | null;
    note: string;
    createdAt: string;
  }[];
  feeHistory: {
    id: string;
    matchId: string;
    feeBps: number;
    platformFeeLamports: number;
    charged: boolean;
    reason: string;
  }[];
  note: string;
};

export function RiftStakesTreasuryPanel() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/rift-stakes/treasury");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "LOAD_FAILED");
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "LOAD_FAILED");
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-rose-300">{error}</p>;
  if (!data) return <p className="text-sm text-[var(--text-muted)]">Loading treasury…</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--text-muted)]">{data.note}</p>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
          Treasury wallet
        </p>
        <p className="mt-1 break-all font-mono text-sm">{data.treasuryWallet}</p>
        <p className="mt-3 text-2xl font-semibold tabular-nums">
          {formatSol(data.collectedFeesLamports)} SOL collected
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(data.allocationBps).map(([k, pct]) => (
          <div
            key={k}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-4"
          >
            <p className="text-xs uppercase text-[var(--text-muted)]">{k}</p>
            <p className="mt-1 text-lg font-semibold">{pct}%</p>
            <p className="text-sm tabular-nums text-[var(--text-muted)]">
              {formatSol(data.allocatedLamports[k] ?? 0)} SOL booked
            </p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="font-semibold">Recent fee events</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {data.feeHistory.length === 0 && (
            <li className="text-[var(--text-muted)]">No fees yet.</li>
          )}
          {data.feeHistory.map((f) => (
            <li
              key={f.id}
              className="rounded-lg border border-[var(--border)] px-3 py-2"
            >
              {f.charged ? "Charged" : "Not charged"} · {f.feeBps / 100}% ·{" "}
              {formatSol(f.platformFeeLamports)} SOL · {f.reason}
            </li>
          ))}
        </ul>
      </section>

      <Link href="/tcg/battle?mode=stakes" className="text-sm underline">
        Back to Rift Stakes
      </Link>
    </div>
  );
}
