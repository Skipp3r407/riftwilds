"use client";

import { useEffect, useMemo, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import type { PlayerPose } from "@/game/live-world/types";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { getVisitedCells, FOG_CELL_SIZE } from "@/game/live-world/systems/exploration-fog";
import {
  markerFallbackColor,
  minimapIconForKind,
  queryNearbyMinimapMarkers,
} from "@/game/world-exploration";
import type {
  HudPanelLayout,
  HudPanelPosition,
  ImmersiveSettings,
  MinimapCorner,
} from "@/game/live-world/systems/immersive/types";
import {
  DraggableHudPanel,
  HudDragGrip,
  type HudDragHandleProps,
} from "@/components/live-world/draggable-hud-panel";

type MinimapMode = "fixed-north" | "rotate" | "hidden";

type Props = {
  bridge: LiveWorldBridge;
  settings?: Pick<
    ImmersiveSettings,
    | "minimapHidden"
    | "minimapCollapsed"
    | "minimapOpacity"
    | "minimapSize"
    | "minimapCorner"
    | "minimapLocked"
  >;
  onSettingsPatch?: (patch: Partial<ImmersiveSettings>) => void;
  /** When true, parent owns placement (top-right HUD stack). */
  stacked?: boolean;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

function cornerClass(corner: MinimapCorner): string {
  switch (corner) {
    case "top-left":
      return "left-3 top-12";
    case "bottom-left":
      return "bottom-16 left-3";
    case "bottom-right":
      return "bottom-16 right-3";
    case "top-right":
    default:
      return "right-3 top-12";
  }
}

function MinimapDragBar({
  dragHandleProps,
  label = "Minimap",
}: {
  dragHandleProps?: HudDragHandleProps;
  label?: string;
}) {
  if (!dragHandleProps) return null;
  return (
    <div
      className={`mb-1 flex w-full items-center gap-1.5 rounded-lg border border-[var(--stroke-bronze)]/70 bg-[rgba(14,12,10,0.72)] px-2 py-1 text-[9px] tracking-wide text-[var(--stone)] ${dragHandleProps.className}`}
      onPointerDown={dragHandleProps.onPointerDown}
      onPointerMove={dragHandleProps.onPointerMove}
      onPointerUp={dragHandleProps.onPointerUp}
      onPointerCancel={dragHandleProps.onPointerCancel}
      style={dragHandleProps.style}
      data-hud-drag-handle={dragHandleProps["data-hud-drag-handle"]}
      title={dragHandleProps.title}
    >
      <HudDragGrip className="text-[var(--stone)]/80" />
      <span>{label}</span>
    </div>
  );
}

export function LiveWorldMinimap({
  bridge,
  settings,
  onSettingsPatch,
  stacked = false,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  const [pose, setPose] = useState<PlayerPose>(bridge.playerPose.get());
  const [mode, setMode] = useState<MinimapMode>("fixed-north");
  const [tick, setTick] = useState(0);

  const hidden = settings?.minimapHidden || mode === "hidden";
  const collapsed = settings?.minimapCollapsed ?? false;
  const locked = settings?.minimapLocked ?? false;
  const opacity = settings?.minimapOpacity ?? 0.92;
  const size = settings?.minimapSize ?? 148;
  const corner = settings?.minimapCorner ?? "top-right";
  const canDrag = typeof onPanelPositionChange === "function";

  useEffect(() => {
    const unsub = bridge.playerPose.subscribe(setPose);
    const id = window.setInterval(() => setTick((t) => t + 1), 500);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, [bridge]);

  const bp = useMemo(() => {
    try {
      return getBlueprint(pose.regionSlug);
    } catch {
      return null;
    }
  }, [pose.regionSlug]);

  const nearby = useMemo(() => {
    void tick;
    return queryNearbyMinimapMarkers({
      regionSlug: pose.regionSlug,
      x: pose.x,
      y: pose.y,
    });
  }, [pose.regionSlug, pose.x, pose.y, tick]);

  const placeClass = stacked
    ? "pointer-events-auto relative z-30"
    : `pointer-events-auto absolute z-30 ${cornerClass(corner)}`;

  const renderInner = (dragHandleProps?: HudDragHandleProps) => {
    if (hidden || !bp) {
      return (
        <>
          <MinimapDragBar dragHandleProps={dragHandleProps} />
          <button
            type="button"
            data-no-drag
            className="btn-secondary focus-ring text-[10px]"
            onClick={() => {
              setMode("fixed-north");
              onSettingsPatch?.({ minimapHidden: false, minimapCollapsed: false });
            }}
          >
            Show minimap
          </button>
        </>
      );
    }

    if (collapsed) {
      return (
        <>
          <MinimapDragBar dragHandleProps={dragHandleProps} />
          <button
            type="button"
            data-no-drag
            className="btn-secondary focus-ring text-[10px]"
            onClick={() => onSettingsPatch?.({ minimapCollapsed: false })}
          >
            Expand minimap
          </button>
        </>
      );
    }

    const scaleX = size / bp.camera.width;
    const scaleY = size / bp.camera.height;
    const visited = getVisitedCells(pose.regionSlug);

    const px = pose.x * scaleX;
    const py = pose.y * scaleY;
    const rot = mode === "rotate" ? pose.facingRad + Math.PI / 2 : 0;

    return (
      <div className="flex flex-col items-end gap-1" style={{ opacity }}>
        <MinimapDragBar dragHandleProps={dragHandleProps} />
        <button
          type="button"
          data-no-drag
          data-testid="live-world-minimap"
          className="lw-hud-glass relative overflow-hidden rounded-xl border border-[var(--stroke-bronze)] bg-[#0a101c]/92"
          style={{ width: size, height: size }}
          aria-label="Open world map"
          onClick={() => {
            if (locked) return;
            bridge.openWorldMap("region", pose.regionSlug);
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${rot}rad)`,
              transformOrigin: `${px}px ${py}px`,
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,40,56,0.9),#0a101c)]" />
            {Array.from(visited)
              .slice(0, 120)
              .map((key) => {
                const [cx, cy] = key.split(",").map(Number);
                return (
                  <div
                    key={key}
                    className="absolute bg-[rgba(61,231,255,0.08)]"
                    style={{
                      left: (cx! * FOG_CELL_SIZE) * scaleX,
                      top: (cy! * FOG_CELL_SIZE) * scaleY,
                      width: FOG_CELL_SIZE * scaleX,
                      height: FOG_CELL_SIZE * scaleY,
                    }}
                  />
                );
              })}

            {nearby.slice(0, 18).map((m) => {
              if (m.x == null || m.y == null) return null;
              const icon = minimapIconForKind(m.kind);
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={icon}
                  alt=""
                  title={m.label}
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 object-contain"
                  style={{
                    left: m.x * scaleX,
                    top: m.y * scaleY,
                  }}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.title = m.label;
                    fallback.className =
                      "absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm";
                    fallback.style.background = markerFallbackColor(m.kind);
                    fallback.style.left = el.style.left;
                    fallback.style.top = el.style.top;
                    el.parentElement?.appendChild(fallback);
                  }}
                />
              );
            })}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/ui/map/minimap-player.png"
              alt=""
              className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 object-contain"
              style={{
                left: px,
                top: py,
                transform: `translate(-50%, -50%) rotate(${pose.facingRad + Math.PI / 2}rad)`,
              }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
              }}
            />
          </div>
          <span className="absolute bottom-1.5 left-1.5 max-w-[85%] truncate rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-[var(--stone)]">
            {bp.name}
          </span>
          {nearby.length > 0 && (
            <span className="absolute right-1.5 top-1.5 rounded border border-[var(--stroke-bronze)]/50 bg-black/55 px-1.5 py-0.5 text-[8px] tabular-nums text-[var(--cyan)]">
              {nearby.length} near
            </span>
          )}
        </button>
        {!locked ? (
          <div className="flex gap-1">
            {(
              [
                ["fixed-north", "N"],
                ["rotate", "↻"],
                ["hidden", "✕"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                data-no-drag
                className={`focus-ring min-h-7 min-w-7 rounded-md border px-1.5 py-0.5 text-[10px] ${
                  mode === m
                    ? "border-[var(--stroke-amber)] bg-[rgba(255,184,77,0.14)] text-[var(--amber)]"
                    : "border-[var(--stroke)]/60 bg-[rgba(12,10,8,0.55)] text-[var(--text-muted)] hover:border-[var(--stroke-amber)] hover:text-[var(--text)]"
                }`}
                onClick={() => {
                  setMode(m);
                  if (m === "hidden") onSettingsPatch?.({ minimapHidden: true });
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              data-no-drag
              className="focus-ring min-h-7 min-w-7 rounded-md border border-[var(--stroke)]/60 bg-[rgba(12,10,8,0.55)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:border-[var(--stroke-amber)] hover:text-[var(--text)]"
              title="Collapse"
              onClick={() => onSettingsPatch?.({ minimapCollapsed: true })}
            >
              –
            </button>
            <button
              type="button"
              data-no-drag
              className="focus-ring min-h-7 min-w-7 rounded-md border border-[var(--stroke)]/60 bg-[rgba(12,10,8,0.55)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] hover:border-[var(--stroke-amber)] hover:text-[var(--text)]"
              title="Move corner"
              onClick={() => {
                const order: MinimapCorner[] = [
                  "top-right",
                  "top-left",
                  "bottom-left",
                  "bottom-right",
                ];
                const i = order.indexOf(corner);
                onSettingsPatch?.({ minimapCorner: order[(i + 1) % order.length]! });
              }}
            >
              ⤢
            </button>
          </div>
        ) : (
          <span className="text-[9px] text-[var(--text-dim)]">Locked</span>
        )}
      </div>
    );
  };

  if (!canDrag) {
    return <div className={placeClass}>{renderInner()}</div>;
  }

  return (
    <DraggableHudPanel
      panelId="minimap"
      position={panelLayout?.minimap}
      onPositionChange={onPanelPositionChange}
      defaultClassName={placeClass}
    >
      {({ dragHandleProps }) => renderInner(dragHandleProps)}
    </DraggableHudPanel>
  );
}
