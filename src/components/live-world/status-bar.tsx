"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsibleHudPanel, LW_HUD_BTN, LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import { playSfx } from "@/hooks/use-sfx";
import type { WorldHudStatus } from "@/game/live-world/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  resolveLivingWorldClock,
  type LivingWorldClock,
} from "@/game/living-world/clock";

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
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Leave room for right-column stack. */
  reserveTopRight?: boolean;
};

/**
 * Compact top-left region / weather / time / channel line.
 */
export function LiveWorldStatusBar({
  status,
  collapsed = false,
  onCollapsedChange,
  reserveTopRight = false,
}: Props) {
  const tone =
    status.connection === "connected" || status.connection === "local"
      ? "text-[var(--cyan)]"
      : status.connection === "error" || status.connection === "disconnected"
        ? "text-[var(--danger,#ff6b8a)]"
        : "text-[var(--amber,#ffb84d)]";

  const canCollapse = typeof onCollapsedChange === "function";
  const topPad = reserveTopRight ? "md:pr-[14rem]" : "";

  const [clock, setClock] = useState<LivingWorldClock | null>(null);
  useEffect(() => {
    if (!featureFlagDefaults.LIVING_WORLD_CLOCK_ENABLED) return;
    const tick = () => setClock(resolveLivingWorldClock());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  const channel =
    status.connection === "local"
      ? "Solo"
      : status.connection === "connected"
        ? "Live"
        : STATUS_LABEL[status.connection];

  const weatherBit = clock
    ? `${clock.labels.weather} · ${clock.labels.dayPhase}`
    : status.hint;

  if (canCollapse && collapsed) {
    return (
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start gap-2 p-2 md:p-3 ${topPad}`}
      >
        <CollapsibleHudPanel
          collapsed
          onCollapsedChange={onCollapsedChange}
          title={status.mapName}
          peekLabel={status.mapName}
          peekExtra={
            <span className={`text-[9px] uppercase tracking-wider ${tone}`}>{channel}</span>
          }
          testId="live-world-status-bar"
          className="pointer-events-auto"
        >
          {null}
        </CollapsibleHudPanel>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 z-20 flex items-start gap-2 p-2 md:p-3 ${topPad}`}
      data-testid="live-world-status-bar"
      data-collapsed={collapsed ? "1" : "0"}
    >
      <div className={`${LW_HUD_GLASS} max-w-[min(20rem,calc(100vw-10rem))] px-2.5 py-1.5`}>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[12px] tracking-wide text-[var(--text)]">
              {status.mapName}
              <span className={`ml-1.5 text-[9px] font-sans uppercase tracking-wider ${tone}`}>
                {channel}
              </span>
            </p>
            <p className="truncate text-[9px] text-[var(--text-muted)]">
              <span className="text-[var(--amber)]/90">{weatherBit}</span>
              {clock?.labels.season ? (
                <span className="text-[var(--text-dim)]"> · {clock.labels.season}</span>
              ) : null}
            </p>
          </div>
          {canCollapse ? (
            <button
              type="button"
              className={`pointer-events-auto ${LW_HUD_BTN} shrink-0 px-1.5 py-1`}
              aria-label="Hide status"
              title="Hide status"
              onClick={() => {
                playSfx("ui.click");
                onCollapsedChange(true);
              }}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
