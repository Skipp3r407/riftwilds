"use client";

import { useEffect, useState } from "react";
import { Bell, Maximize2, Minimize2, Menu } from "lucide-react";
import { LW_HUD_BTN, LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import { CreditsBalanceChip } from "@/components/credits/credits-balance-chip";
import { playSfx } from "@/hooks/use-sfx";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  resolveLivingWorldClock,
  type LivingWorldClock,
} from "@/game/living-world/clock";
import type { WorldHudStatus } from "@/game/live-world/types";

const STATUS_TONE: Record<WorldHudStatus["connection"], string> = {
  loading: "text-[var(--amber)]",
  connecting: "text-[var(--amber)]",
  local: "text-[var(--cyan)]",
  connected: "text-[var(--cyan)]",
  reconnecting: "text-[var(--amber)]",
  disconnected: "text-[var(--danger,#ff6b8a)]",
  error: "text-[var(--danger,#ff6b8a)]",
};

type Props = {
  status: WorldHudStatus;
  fullscreenActive: boolean;
  onToggleFullscreen: () => void;
  onOpenMenu: () => void;
  mapGoalsEnabled?: boolean;
  showMapGoals?: boolean;
  onToggleMapGoals?: () => void;
  notificationCount?: number;
};

/**
 * Unified top command bar — region, weather/time, currency, notifications, system.
 * Replaces scattered top-left / top-center / top-right chips as one Reliquary device.
 */
export function TopCommandBar({
  status,
  fullscreenActive,
  onToggleFullscreen,
  onOpenMenu,
  mapGoalsEnabled,
  showMapGoals,
  onToggleMapGoals,
  notificationCount = 0,
}: Props) {
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
        : status.connection;
  const weatherBit = clock
    ? `${clock.labels.weather} · ${clock.labels.dayPhase}`
    : status.hint;
  const season = clock?.labels.season;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-2 z-35 flex justify-center px-2 md:top-3 md:px-3"
      data-testid="live-world-top-command-bar"
    >
      <div
        className={`lw-hud-topbar lw-hud-enter pointer-events-auto ${LW_HUD_GLASS} lw-hud-glass--primary`}
      >
        <div className="lw-hud-topbar__seg min-w-0 flex-1">
          <div className="min-w-0">
            <p className="truncate font-display text-[12px] tracking-wide text-[var(--text)] md:text-[13px]">
              {status.mapName}
              <span
                className={`ml-1.5 text-[9px] font-sans uppercase tracking-wider ${STATUS_TONE[status.connection]}`}
              >
                {channel}
              </span>
            </p>
            <p className="truncate text-[9px] text-[var(--text-muted)]">
              <span className="text-[var(--amber)]/90">{weatherBit}</span>
              {season ? (
                <span className="text-[var(--text-dim)]"> · {season}</span>
              ) : null}
              {status.playerLabel ? (
                <span className="text-[var(--text-dim)]"> · {status.playerLabel}</span>
              ) : null}
            </p>
          </div>
        </div>

        {featureFlagDefaults.CREDITS_LEDGER_ENABLED ? (
          <div className="lw-hud-topbar__seg shrink-0 [&_>div]:border-[var(--lw-trim)] [&_>div]:bg-transparent [&_>div]:shadow-none">
            <CreditsBalanceChip />
          </div>
        ) : null}

        <div className="lw-hud-topbar__seg shrink-0 gap-1">
          <button
            type="button"
            className={`${LW_HUD_BTN} relative !px-2`}
            title={
              notificationCount > 0
                ? `${notificationCount} notifications`
                : "Notifications"
            }
            aria-label="Notifications"
            onClick={() => playSfx("ui.click")}
          >
            <Bell className="h-3.5 w-3.5 text-[var(--amber)]" aria-hidden />
            {notificationCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--amber)] px-0.5 text-[8px] font-bold text-[rgba(20,14,8,0.95)]">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </button>
          {mapGoalsEnabled && onToggleMapGoals ? (
            <button
              type="button"
              className={LW_HUD_BTN}
              onClick={() => {
                playSfx("ui.click");
                onToggleMapGoals();
              }}
            >
              {showMapGoals ? "Hide goals" : "Goals"}
            </button>
          ) : null}
          <button
            type="button"
            className={`${LW_HUD_BTN} !px-2`}
            title={fullscreenActive ? "Exit fullscreen" : "Fullscreen"}
            aria-label={fullscreenActive ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => {
              playSfx("ui.click");
              onToggleFullscreen();
            }}
          >
            {fullscreenActive ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            className={`${LW_HUD_BTN} !px-2`}
            title="System menu (Esc)"
            aria-label="Open system menu"
            onClick={() => {
              playSfx("ui.click");
              onOpenMenu();
            }}
          >
            <Menu className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
