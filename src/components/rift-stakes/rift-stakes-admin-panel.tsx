"use client";

import { useCallback, useEffect, useState } from "react";
import { MAX_FEE_BPS } from "@/game/rift-stakes/config";

type AdminPayload = {
  admin: {
    stakesPaused: boolean;
    treasuryPaused: boolean;
    matchmakingPaused: boolean;
    feeBps: number;
    pauseReason: string | null;
  };
  promotions: {
    id: string;
    name: string;
    feeBps: number;
    active: boolean;
  }[];
  recentFees: { id: string; reason: string; charged: boolean; feeBps: number }[];
  queueSize: number;
  maxFeeBps: number;
};

export function RiftStakesAdminPanel() {
  const [data, setData] = useState<AdminPayload | null>(null);
  const [feeInput, setFeeInput] = useState("200");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/rift-stakes/admin");
    const json = await res.json();
    if (res.ok) {
      setData(json);
      setFeeInput(String(json.admin.feeBps));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setFee() {
    const feeBps = Number(feeInput);
    const res = await fetch("/api/rift-stakes/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_fee", feeBps }),
    });
    const json = await res.json();
    setMsg(json.ok ? `Fee set to ${json.feeBps} bps` : json.error);
    void load();
  }

  async function togglePause(field: "stakesPaused" | "treasuryPaused" | "matchmakingPaused") {
    if (!data) return;
    const res = await fetch("/api/rift-stakes/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "pause",
        [field]: !data.admin[field],
        pauseReason: "Admin toggle",
      }),
    });
    const json = await res.json();
    setMsg(json.ok ? "Pause flags updated" : json.error);
    void load();
  }

  async function activateZeroFee() {
    const now = Date.now();
    const res = await fetch("/api/rift-stakes/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "promo",
        promo: {
          id: "promo_zero_weekend",
          name: "Zero-Fee Event",
          feeBps: 0,
          active: true,
          startsAt: new Date(now - 60_000).toISOString(),
          endsAt: new Date(now + 86_400_000).toISOString(),
          note: "Promotional 0% fee",
        },
      }),
    });
    const json = await res.json();
    setMsg(json.ok ? "0% promo activated" : json.error);
    void load();
  }

  if (!data) return <p className="text-sm text-[var(--text-muted)]">Loading admin…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-semibold">Platform fee</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Default 2% (200 bps). Hard max {MAX_FEE_BPS} bps (5%). Fees only on Rift
          Stakes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm tabular-nums"
            value={feeInput}
            onChange={(e) => setFeeInput(e.target.value)}
            aria-label="Fee basis points"
          />
          <button type="button" className="btn-primary focus-ring text-sm" onClick={() => void setFee()}>
            Save fee bps
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => void activateZeroFee()}
          >
            Activate 0% promo
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["stakesPaused", "Stakes"],
            ["treasuryPaused", "Treasury"],
            ["matchmakingPaused", "Matchmaking"],
          ] as const
        ).map(([field, label]) => (
          <button
            key={field}
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => void togglePause(field)}
          >
            {label}: {data.admin[field] ? "PAUSED" : "live"}
          </button>
        ))}
      </div>

      <p className="text-sm text-[var(--text-muted)]">Queue size: {data.queueSize}</p>

      <section>
        <h3 className="font-semibold">Recent fee log</h3>
        <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-xs">
          {data.recentFees.map((f) => (
            <li key={f.id}>
              {f.charged ? "✓" : "○"} {f.feeBps}bps · {f.reason}
            </li>
          ))}
        </ul>
      </section>

      {msg && <p className="text-sm text-amber-200">{msg}</p>}
    </div>
  );
}
