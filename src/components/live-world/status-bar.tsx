"use client";

import type { WorldHudStatus } from "@/game/live-world/types";

const STATUS_LABEL: Record<WorldHudStatus["connection"], string> = {
  loading: "Loading",
  connecting: "Connecting",
  local: "Local",
  connected: "Online",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  error: "Error",
};

type Props = {
  status: WorldHudStatus;
};

export function LiveWorldStatusBar({ status }: Props) {
  const tone =
    status.connection === "connected" || status.connection === "local"
      ? "text-[var(--cyan)]"
      : status.connection === "error" || status.connection === "disconnected"
        ? "text-[var(--danger,#ff6b8a)]"
        : "text-[var(--amber,#ffb84d)]";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 md:p-4">
      <div className="rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.72)] px-3 py-2 backdrop-blur-md">
        <p className="font-display text-sm text-white">{status.mapName}</p>
        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
          {status.instanceLabel} ·{" "}
          <span className={tone}>{STATUS_LABEL[status.connection]}</span>
        </p>
      </div>
      <div className="max-w-[16rem] rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.72)] px-3 py-2 text-right backdrop-blur-md">
        <p className="text-[11px] text-[var(--text-muted)]">
          {status.playerLabel} · {status.petLabel}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">{status.hint}</p>
      </div>
    </div>
  );
}
