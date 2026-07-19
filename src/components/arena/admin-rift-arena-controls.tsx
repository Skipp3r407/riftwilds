"use client";

import { useCallback, useEffect, useState } from "react";

type AdminConfig = {
  matchmakingPaused: boolean;
  rankedPaused: boolean;
  solArenaPaused: boolean;
  dailyEntrySoftCap: number;
  pauseReason: string | null;
  updatedAt: string | null;
};

export function AdminRiftArenaControls() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/rift-arena/admin");
    const json = await res.json();
    if (res.ok) setConfig(json.config);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (body: Partial<AdminConfig>) => {
    setStatus(null);
    const res = await fetch("/api/rift-arena/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error || "UPDATE_FAILED");
      return;
    }
    setConfig(json.config);
    setStatus("Saved (local memory)");
  };

  if (!config) {
    return <p className="text-sm text-[var(--text-muted)]">Loading Rift Arena admin…</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.matchmakingPaused}
          onChange={(e) => void patch({ matchmakingPaused: e.target.checked })}
        />
        Pause free matchmaking
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.rankedPaused}
          onChange={(e) => void patch({ rankedPaused: e.target.checked })}
        />
        Pause ranked scaffold
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.solArenaPaused}
          onChange={(e) => void patch({ solArenaPaused: e.target.checked })}
        />
        Pause SOL Arena surface (stakes still flag-gated OFF)
      </label>
      <label className="flex flex-wrap items-center gap-2">
        Daily entry soft cap
        <input
          type="number"
          min={1}
          max={500}
          value={config.dailyEntrySoftCap}
          onChange={(e) =>
            void patch({ dailyEntrySoftCap: Number(e.target.value) || 80 })
          }
          className="w-20 rounded border border-white/15 bg-black/40 px-2 py-1"
        />
      </label>
      {status ? <p className="text-xs text-amber-200/90">{status}</p> : null}
      <p className="text-xs text-[var(--text-dim)]">
        Updated: {config.updatedAt ?? "never"} · Role/audit gates TBD
      </p>
    </div>
  );
}
