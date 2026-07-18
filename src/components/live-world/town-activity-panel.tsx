"use client";

import { CollapsibleHudPanel } from "@/components/live-world/hud-chrome";
import { DraggableHudPanel } from "@/components/live-world/draggable-hud-panel";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";
import type { HudPanelLayout, HudPanelPosition } from "@/game/live-world/systems/immersive/types";

type Props = {
  snapshot: SocialPresenceSnapshot | null;
  compact?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** When true, sits in the top-right HUD stack (no absolute positioning). */
  stacked?: boolean;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

export function TownActivityPanel({
  snapshot,
  compact,
  collapsed = false,
  onCollapsedChange,
  stacked = false,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  if (!snapshot?.enabled) return null;

  const locations = snapshot.popularLocations.slice(0, compact ? 4 : 6);
  const events = snapshot.activeEvents.slice(0, compact ? 2 : 4);
  const canCollapse = typeof onCollapsedChange === "function";
  const canDrag = typeof onPanelPositionChange === "function";

  const body = (
    <div className="flex flex-col gap-2.5">
      {events.length > 0 ? (
        <section>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-dim)]">
            Happening now
          </p>
          <ul className="mt-1 space-y-1">
            {events.map((e) => (
              <li key={e.id} className="text-[10px] text-[var(--text-muted)]">
                <span className="text-[var(--text)]">{e.label}</span>
                {e.kind === "world_event" && e.phase ? (
                  <span className="ml-1 text-[var(--cyan)]/80">· {e.phase}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-dim)]">
          Population
        </p>
        <ul className="mt-1 space-y-1">
          {snapshot.populationByRegion.map((r) => (
            <li
              key={r.regionSlug}
              className="flex justify-between gap-2 text-[10px] text-[var(--text-muted)]"
            >
              <span className="truncate">{r.label}</span>
              <span className="shrink-0 text-[var(--cyan)]/80">{r.estimate ?? "—"}</span>
            </li>
          ))}
        </ul>
      </section>

      {locations.length > 0 ? (
        <section>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-dim)]">
            Popular hubs
          </p>
          <ul className="mt-1 space-y-1">
            {locations.map((loc) => (
              <li
                key={loc.locationId}
                className="flex items-baseline justify-between gap-2 text-[10px]"
              >
                <span className="truncate text-[var(--text-muted)]">{loc.label}</span>
                <span className="shrink-0 text-[var(--cyan)]">{loc.activityScore}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );

  const defaultClass = stacked
    ? "pointer-events-none relative z-25 hidden w-full md:block"
    : "pointer-events-none absolute right-3 top-16 z-25 hidden w-56 md:block md:right-4";

  if (!canCollapse) {
    return (
      <div className={`${defaultClass} flex-col gap-2`} data-testid="town-activity-panel">
        <div className="rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.72)] px-3 py-2 backdrop-blur-md">
          <p className="font-display text-xs text-white">Town activity</p>
          <div className="mt-2">{body}</div>
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
          title="World pulse"
          peekLabel="World pulse"
          testId="town-activity-panel"
          panelClassName="w-56"
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
          title="World pulse"
          peekLabel="World pulse"
          testId="town-activity-panel"
          panelClassName="w-56"
          dragHandleProps={dragHandleProps}
        >
          {body}
        </CollapsibleHudPanel>
      )}
    </DraggableHudPanel>
  );
}
