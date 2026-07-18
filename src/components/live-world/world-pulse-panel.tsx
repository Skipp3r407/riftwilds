"use client";

import { CollapsibleHudPanel } from "@/components/live-world/hud-chrome";
import { DraggableHudPanel } from "@/components/live-world/draggable-hud-panel";
import type { WorldEventPlayerView } from "@/lib/world-events/types";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";
import type { HudPanelLayout, HudPanelPosition } from "@/game/live-world/systems/immersive/types";

type Props = {
  worldEvents: WorldEventPlayerView | null;
  snapshot: SocialPresenceSnapshot | null;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  stacked?: boolean;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

function formatEndsIn(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "soon";
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

/**
 * Mid-left World Pulse — timed events list (reference HUD).
 * Wired to real world-events + community stubs; no fake combat timers.
 */
export function WorldPulsePanel({
  worldEvents,
  snapshot,
  collapsed = false,
  onCollapsedChange,
  stacked = false,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  const happening = worldEvents?.happeningNow?.slice(0, 5) ?? [];
  const community = snapshot?.activeEvents?.slice(0, 3) ?? [];
  const canCollapse = typeof onCollapsedChange === "function";
  const canDrag = typeof onPanelPositionChange === "function";

  if (!worldEvents?.enabled && !snapshot?.enabled) return null;

  const body = (
    <ul className="space-y-1.5">
      {worldEvents?.active ? (
        <li className="rounded-md border border-[var(--stroke-amber)]/40 bg-[rgba(255,184,77,0.08)] px-2 py-1.5">
          <p className="text-[10px] font-medium text-[var(--amber,#ffb84d)]">
            ★ {worldEvents.active.name}
          </p>
          <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
            {worldEvents.active.phase}
            {worldEvents.active.endsAt
              ? ` · ${formatEndsIn(worldEvents.active.endsAt)}`
              : ""}
          </p>
        </li>
      ) : null}
      {happening.map((e) => (
        <li key={e.id} className="text-[10px] leading-snug text-[var(--text-muted)]">
          <span className="text-[var(--text)]">{e.label}</span>
          {e.subtitle ? (
            <span className="text-[var(--text-dim)]"> — {e.subtitle}</span>
          ) : null}
          <span className="ml-1 text-[var(--cyan)]/80">· {formatEndsIn(e.endsAt)}</span>
        </li>
      ))}
      {community.map((e) => (
        <li key={e.id} className="text-[10px] text-[var(--text-muted)]">
          <span className="text-[var(--text)]">{e.label}</span>
          {e.phase ? (
            <span className="ml-1 text-[var(--cyan)]/80">· {e.phase}</span>
          ) : null}
        </li>
      ))}
      {happening.length === 0 && community.length === 0 && !worldEvents?.active ? (
        <li className="text-[10px] text-[var(--text-dim)]">
          Quiet streets — watch for caravans and festivals.
        </li>
      ) : null}
    </ul>
  );

  const defaultClass = stacked
    ? "pointer-events-none relative z-25 hidden w-full md:block"
    : "pointer-events-none absolute left-3 top-24 z-25 hidden w-56 md:block md:left-4";

  if (!canCollapse) {
    return (
      <div className={defaultClass} data-testid="world-pulse-panel">
        <div className="rounded-xl border border-[var(--stroke-bronze)] bg-[rgba(20,18,14,0.78)] px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-dim)]">
            World Pulse
          </p>
          <div className="mt-1.5">{body}</div>
        </div>
      </div>
    );
  }

  if (!canDrag) {
    return (
      <div className={defaultClass}>
        <CollapsibleHudPanel
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          title="World Pulse"
          peekLabel="World Pulse"
          testId="world-pulse-panel"
          panelClassName="w-full max-h-56 overflow-auto"
        >
          {body}
        </CollapsibleHudPanel>
      </div>
    );
  }

  return (
    <DraggableHudPanel
      panelId="townActivity"
      position={panelLayout?.townActivity}
      onPositionChange={onPanelPositionChange}
      defaultClassName={defaultClass}
    >
      {({ dragHandleProps }) => (
        <CollapsibleHudPanel
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          title="World Pulse"
          peekLabel="World Pulse"
          testId="world-pulse-panel"
          panelClassName="w-full max-h-56 overflow-auto"
          dragHandleProps={dragHandleProps}
        >
          {body}
        </CollapsibleHudPanel>
      )}
    </DraggableHudPanel>
  );
}
