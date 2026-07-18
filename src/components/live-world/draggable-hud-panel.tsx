"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  clampHudPanelPosition,
  snapHudPanelPosition,
  type HudPanelId,
  type HudPanelPosition,
} from "@/game/live-world/systems/immersive/hud-panel-layout";

export type HudDragHandleProps = {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  style: CSSProperties;
  className: string;
  "data-hud-drag-handle": string;
  title: string;
};

type Props = {
  panelId: HudPanelId;
  position?: HudPanelPosition | null;
  onPositionChange: (position: HudPanelPosition) => void;
  /** Classes used when no custom position is set (must include absolute placement). */
  defaultClassName: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  children: (api: {
    dragHandleProps: HudDragHandleProps;
    isDragging: boolean;
    isCustom: boolean;
  }) => ReactNode;
  testId?: string;
};

function findBoundsEl(el: HTMLElement): HTMLElement {
  const host = el.closest<HTMLElement>('[data-testid="live-world-host"]');
  if (host) {
    const canvas = host.querySelector<HTMLElement>(":scope > div.relative");
    if (canvas) return canvas;
    return host;
  }
  return (el.offsetParent as HTMLElement | null) ?? document.documentElement;
}

/**
 * Free-position HUD shell. Drag via `dragHandleProps` on a header/grip only —
 * buttons inside the handle row should stopPropagation on pointerdown.
 */
export function DraggableHudPanel({
  panelId,
  position,
  onPositionChange,
  defaultClassName,
  className = "",
  style,
  disabled,
  children,
  testId,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [livePos, setLivePos] = useState<HudPanelPosition | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    panelW: number;
    panelH: number;
    boundsW: number;
    boundsH: number;
  } | null>(null);

  const custom = position != null || livePos != null;
  const effective = livePos ?? position ?? null;

  useEffect(() => {
    if (dragging) return;
    setLivePos(null);
  }, [position, dragging]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, select, textarea, [data-no-drag]")) {
        return;
      }
      const root = rootRef.current;
      if (!root) return;

      e.preventDefault();
      e.stopPropagation();

      const bounds = findBoundsEl(root);
      const rootRect = root.getBoundingClientRect();
      const boundsRect = bounds.getBoundingClientRect();
      const originX = effective?.x ?? rootRect.left - boundsRect.left;
      const originY = effective?.y ?? rootRect.top - boundsRect.top;

      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX,
        originY,
        panelW: root.offsetWidth,
        panelH: root.offsetHeight,
        boundsW: bounds.clientWidth,
        boundsH: bounds.clientHeight,
      };

      setLivePos({ x: originX, y: originY });
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* unsupported */
      }
    },
    [disabled, effective],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const next = clampHudPanelPosition(
        drag.originX + (e.clientX - drag.startX),
        drag.originY + (e.clientY - drag.startY),
        drag.panelW,
        drag.panelH,
        drag.boundsW,
        drag.boundsH,
      );
      setLivePos(next);
    },
    [],
  );

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const next = snapHudPanelPosition(
        clampHudPanelPosition(
          drag.originX + (e.clientX - drag.startX),
          drag.originY + (e.clientY - drag.startY),
          drag.panelW,
          drag.panelH,
          drag.boundsW,
          drag.boundsH,
        ),
        drag.panelW,
        drag.panelH,
        drag.boundsW,
        drag.boundsH,
      );
      dragRef.current = null;
      setDragging(false);
      setLivePos(next);
      onPositionChange(next);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    },
    [onPositionChange],
  );

  const dragHandleProps: HudDragHandleProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    style: { touchAction: "none" },
    className: disabled
      ? ""
      : dragging
        ? "cursor-grabbing select-none"
        : "cursor-grab select-none",
    "data-hud-drag-handle": panelId,
    title: "Drag to reposition",
  };

  // Prefer fixed while a local drag position is active so docked (stacked) panels
  // can leave their absolute parent's containing block without a mid-gesture remount.
  const placeStyle: CSSProperties = (() => {
    if (effective == null) return {};
    if (livePos != null) {
      const root = rootRef.current;
      const bounds = root ? findBoundsEl(root).getBoundingClientRect() : null;
      return {
        position: "fixed",
        left: (bounds?.left ?? 0) + effective.x,
        top: (bounds?.top ?? 0) + effective.y,
        right: "auto",
        bottom: "auto",
        transform: "none",
        zIndex: 60,
      };
    }
    return {
      position: "absolute",
      left: effective.x,
      top: effective.y,
      right: "auto",
      bottom: "auto",
      transform: "none",
      zIndex: 45,
    };
  })();

  return (
    <div
      ref={rootRef}
      className={`${custom ? "pointer-events-auto absolute z-30" : defaultClassName} ${className}`}
      style={{ ...style, ...placeStyle }}
      data-testid={testId}
      data-hud-panel={panelId}
      data-hud-custom={custom ? "1" : "0"}
      data-dragging={dragging ? "1" : "0"}
    >
      {children({ dragHandleProps, isDragging: dragging, isCustom: custom })}
    </div>
  );
}

/** Compact grip affordance for headers without a natural drag strip. */
export function HudDragGrip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-3.5 w-2.5 shrink-0 flex-col justify-center gap-0.5 opacity-45 ${className}`}
      aria-hidden
    >
      <span className="h-0.5 w-full rounded-full bg-current" />
      <span className="h-0.5 w-full rounded-full bg-current" />
      <span className="h-0.5 w-full rounded-full bg-current" />
    </span>
  );
}
