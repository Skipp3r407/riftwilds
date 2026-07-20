"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { LW_HUD_BTN, LW_HUD_CARD_TITLE, LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import { QuestTracker } from "@/components/live-world/quest-tracker";
import { emitHudFx } from "@/components/live-world/hud-fx-layer";
import { playSfx } from "@/hooks/use-sfx";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";
import type { ReactNode } from "react";
import { NearbyPlayerActions } from "@/components/social/nearby-player-actions";

type Props = {
  snapshot: SocialPresenceSnapshot | null;
  minimap?: ReactNode | null;
  /** Optional extra below stack (e.g. town activity when free-dragged away). */
  footer?: ReactNode;
  /** Nearby drawer open (controlled). Defaults to closed badge. */
  nearbyOpen?: boolean;
  onNearbyOpenChange?: (open: boolean) => void;
};

/**
 * Right-column stack: minimap + nearby badge/drawer + pinned objectives + presence.
 * Large lists stay collapsed so the world view owns the center.
 */
export function RightColumnHud({
  snapshot,
  minimap,
  footer,
  nearbyOpen: nearbyOpenProp,
  onNearbyOpenChange,
}: Props) {
  const [nearbyLocal, setNearbyLocal] = useState(false);
  const nearbyOpen = nearbyOpenProp ?? nearbyLocal;
  const setNearbyOpen = (open: boolean) => {
    onNearbyOpenChange?.(open);
    if (nearbyOpenProp === undefined) setNearbyLocal(open);
  };

  const nearbyCount = snapshot?.nearbyEstimate ?? 0;
  const status = snapshot?.status ?? "Exploring";

  // Friendly labels only — never expose hub activity scores / internal zone IDs.
  const nearbyLabels =
    snapshot?.popularLocations?.slice(0, 6).map((loc, i) => ({
      id: loc.locationId,
      name: loc.label.replace(/\s+/g, "").slice(0, 14) || `Keeper${i + 1}`,
      fullName: loc.label,
    })) ?? [];

  return (
    <div
      className="flex w-full flex-col items-end gap-1.5 md:gap-2"
      data-testid="live-world-right-column"
    >
      <div className="relative flex w-full flex-col items-end gap-1">
        {minimap}

        {snapshot?.enabled ? (
          <div className="pointer-events-auto flex w-full flex-col items-end gap-1">
            <button
              type="button"
              className={`${LW_HUD_BTN} gap-1.5 px-2 py-1 text-[10px]`}
              data-testid="nearby-players-badge"
              aria-expanded={nearbyOpen}
              aria-controls="nearby-players-drawer"
              title={
                nearbyCount > 0
                  ? `${nearbyCount} nearby — open list`
                  : "Nearby keepers — open list"
              }
              onClick={() => {
                playSfx("ui.click");
                setNearbyOpen(!nearbyOpen);
              }}
            >
              <List className="h-3 w-3 shrink-0 text-[var(--cyan)]" aria-hidden />
              <span className="tabular-nums text-[var(--text)]">
                {nearbyCount > 0 ? `${nearbyCount} nearby` : "Nearby"}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-[var(--text-muted)] transition-transform ${
                  nearbyOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            {nearbyOpen ? (
              <div
                id="nearby-players-drawer"
                className={`${LW_HUD_GLASS} w-full overflow-hidden px-2.5 py-2`}
                data-testid="nearby-players-drawer"
              >
                <p className={LW_HUD_CARD_TITLE}>Nearby</p>
                <ul className="mt-1.5 max-h-[10rem] space-y-1.5 overflow-auto pr-0.5">
                  {nearbyLabels.length > 0 ? (
                    nearbyLabels.map((n) => (
                      <li key={n.id} className="min-w-0" title={n.fullName}>
                        <div className="truncate text-[11px] font-medium text-[var(--text)]">
                          {n.name}
                        </div>
                        <NearbyPlayerActions
                          handleHint={n.name}
                          label={n.fullName}
                          compact
                        />
                      </li>
                    ))
                  ) : (
                    <li className="space-y-1.5 text-[11px] leading-snug text-[var(--text-muted)]">
                      <p>Local solo — peer names appear when multiplayer joins.</p>
                      <p>
                        Practice social actions with town keepers:{" "}
                        <Link
                          href="/social?tab=friends&add=keeper_mira"
                          className="text-[var(--cyan)] underline focus-ring"
                          onClick={() => playSfx("ui.click")}
                        >
                          Add Keeper Mira
                        </Link>
                      </p>
                      <NearbyPlayerActions
                        handleHint="keeper_mira"
                        label="Keeper Mira"
                        compact
                      />
                    </li>
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <QuestTracker
        snapshot={snapshot}
        onCompleteFx={(title) =>
          emitHudFx({ kind: "quest", text: `✓ ${title}`, x: 78, y: 28 })
        }
      />

      {snapshot?.enabled ? (
        <div
          className={`${LW_HUD_GLASS} lw-hud-glass--secondary flex w-full items-center gap-2 px-2 py-1.5`}
          title={`${status} · ${snapshot.presenceLevelLabel}`}
          data-testid="presence-status-chip"
        >
          <span
            className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ring-2 ring-offset-1 ring-offset-transparent ${
              snapshot.antiAfk.ok
                ? "bg-[var(--emerald)] ring-[rgba(61,255,176,0.35)]"
                : "bg-[var(--amber)] ring-[rgba(255,184,77,0.35)]"
            }`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium text-[var(--text)]">{status}</p>
            <p className="truncate text-[9px] text-[var(--text-muted)]">
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
