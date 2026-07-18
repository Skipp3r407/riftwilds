"use client";

import { LW_HUD_CARD_TITLE, LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";
import type { ReactNode } from "react";

type Props = {
  snapshot: SocialPresenceSnapshot | null;
  minimap?: ReactNode | null;
  /** Optional extra below stack (e.g. town activity when free-dragged away). */
  footer?: ReactNode;
};

/**
 * Right-column stack matching reference: minimap → nearby → daily tasks → social status.
 * Nearby list uses presence stubs until multiplayer nameplates ship.
 */
export function RightColumnHud({ snapshot, minimap, footer }: Props) {
  const tasks = snapshot?.dailyTasks?.slice(0, 4) ?? [];
  const nearbyCount = snapshot?.nearbyEstimate ?? 0;
  const status = snapshot?.status ?? "Exploring";

  // Stub nearby keepers from popular hubs when we lack per-player lists
  const nearbyLabels =
    snapshot?.popularLocations?.slice(0, 4).map((loc, i) => ({
      id: loc.locationId,
      name: loc.label.replace(/\s+/g, "").slice(0, 12) || `Keeper${i + 1}`,
      fullName: loc.label,
      detail: `Hub ${loc.activityScore}`,
    })) ?? [];

  return (
    <div
      className="flex w-full flex-col items-end gap-1.5 md:gap-2"
      data-testid="live-world-right-column"
    >
      {minimap}

      {snapshot?.enabled ? (
        <div className={`${LW_HUD_GLASS} w-full overflow-hidden px-2.5 py-2`}>
          <p className={LW_HUD_CARD_TITLE}>
            Nearby Players{nearbyCount > 0 ? ` (${nearbyCount})` : ""}
          </p>
          <ul className="mt-1.5 max-h-[5.5rem] space-y-1 overflow-auto pr-0.5">
            {nearbyLabels.length > 0 ? (
              nearbyLabels.map((n) => (
                <li
                  key={n.id}
                  className="flex min-w-0 items-baseline justify-between gap-2 text-[11px]"
                  title={`${n.fullName} · ${n.detail}`}
                >
                  <span className="min-w-0 truncate font-medium text-[var(--text)]">
                    {n.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-[10px] text-[var(--text-muted)]">
                    {n.detail}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[11px] leading-snug text-[var(--text-muted)]">
                Local solo — nearby list fills when peers join.
              </li>
            )}
          </ul>
        </div>
      ) : null}

      {snapshot?.enabled && tasks.length > 0 ? (
        <div className={`${LW_HUD_GLASS} w-full overflow-hidden px-2.5 py-2`}>
          <p className={LW_HUD_CARD_TITLE}>Daily Tasks</p>
          <ul className="mt-1.5 space-y-1.5">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex min-w-0 items-baseline justify-between gap-2 text-[11px]"
                title={`${t.title} ${t.progress}/${t.requirement}`}
              >
                <span
                  className={`min-w-0 truncate ${
                    t.claimed
                      ? "text-[var(--text-dim)] line-through opacity-70"
                      : "font-medium text-[var(--text)]"
                  }`}
                >
                  {t.title}
                </span>
                <span className="shrink-0 tabular-nums text-[10px] text-[var(--cyan)]">
                  {t.progress}/{t.requirement}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {snapshot?.enabled ? (
        <div
          className={`${LW_HUD_GLASS} flex w-full items-center gap-2.5 px-2.5 py-2`}
          title={`${status} · ${snapshot.presenceLevelLabel}`}
        >
          <span
            className={`inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-transparent ${
              snapshot.antiAfk.ok
                ? "bg-[var(--emerald)] ring-[rgba(61,255,176,0.35)]"
                : "bg-[var(--amber)] ring-[rgba(255,184,77,0.35)]"
            }`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-[var(--text)]">{status}</p>
            <p className="truncate text-[10px] text-[var(--text-muted)]">
              {snapshot.presenceLevelLabel}
              {snapshot.inRestZone ? ` · Rest +${snapshot.restBonusPercent}%` : ""}
            </p>
          </div>
        </div>
      ) : null}

      {footer}
    </div>
  );
}
