"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { playSfx } from "@/hooks/use-sfx";
import {
  HudDragGrip,
  type HudDragHandleProps,
} from "@/components/live-world/draggable-hud-panel";

/** Shared warm glass surface for Live World immersion HUD (fantasy chrome). */
export const LW_HUD_GLASS =
  "lw-hud-glass rounded-xl border border-[var(--stroke-bronze)] bg-[rgba(20,18,14,0.78)] shadow-[0_8px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(232,213,176,0.1)] backdrop-blur-md";

export const LW_HUD_BTN =
  "lw-hud-btn focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[rgba(20,16,12,0.45)] px-2.5 py-1.5 text-[10px] font-medium tracking-wide text-[var(--text-muted)] transition-[color,background,border-color,box-shadow] duration-150 hover:border-[var(--stroke-amber)] hover:bg-[rgba(255,184,77,0.08)] hover:text-[var(--text)]";

export const LW_HUD_BTN_ACTIVE =
  "border-[var(--stroke-strong)] bg-[rgba(61,231,255,0.1)] text-[var(--cyan)] shadow-[0_0_12px_rgba(61,231,255,0.1)]";

type CollapseToggleProps = {
  collapsed: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel?: string;
  className?: string;
  /** Compact chevron-only control for panel headers */
  chevronOnly?: boolean;
};

export function HudCollapseToggle({
  collapsed,
  onToggle,
  expandLabel,
  collapseLabel = "Collapse",
  className = "",
  chevronOnly,
}: CollapseToggleProps) {
  const label = collapsed ? expandLabel : collapseLabel;
  return (
    <button
      type="button"
      className={`${LW_HUD_BTN} ${chevronOnly ? "px-1.5 py-1" : ""} ${className}`}
      aria-expanded={!collapsed}
      aria-label={label}
      title={label}
      onClick={() => {
        playSfx("ui.click");
        onToggle();
      }}
    >
      {collapsed ? (
        <ChevronUp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      )}
      {!chevronOnly ? <span>{label}</span> : null}
    </button>
  );
}

type CollapsiblePanelProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  title: string;
  peekLabel?: string;
  peekExtra?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  testId?: string;
  /** When true, peek tab uses bottom-edge chevron styling */
  edge?: "bottom" | "side";
  /** Drag handle props for free-form HUD repositioning (header / peek strip). */
  dragHandleProps?: HudDragHandleProps;
};

/**
 * Glass HUD panel with expand/collapse. Collapsed state shows a small peek tab.
 */
export function CollapsibleHudPanel({
  collapsed,
  onCollapsedChange,
  title,
  peekLabel,
  peekExtra,
  headerExtra,
  children,
  className = "",
  panelClassName = "",
  testId,
  edge = "side",
  dragHandleProps,
}: CollapsiblePanelProps) {
  if (collapsed) {
    return (
      <div className={`pointer-events-auto ${className}`} data-testid={testId} data-collapsed="1">
        <div
          className={`${LW_HUD_GLASS} ${LW_HUD_BTN} gap-2 px-2.5 py-1.5 ${
            edge === "bottom" ? "rounded-t-xl rounded-b-md" : ""
          } ${dragHandleProps?.className ?? ""}`}
          {...(dragHandleProps
            ? {
                onPointerDown: dragHandleProps.onPointerDown,
                onPointerMove: dragHandleProps.onPointerMove,
                onPointerUp: dragHandleProps.onPointerUp,
                onPointerCancel: dragHandleProps.onPointerCancel,
                style: dragHandleProps.style,
                "data-hud-drag-handle": dragHandleProps["data-hud-drag-handle"],
                title: `${peekLabel ?? title} · drag to move`,
              }
            : {})}
        >
          {dragHandleProps ? <HudDragGrip className="text-white/80" /> : null}
          <button
            type="button"
            className="inline-flex items-center gap-1.5"
            data-no-drag
            aria-expanded={false}
            aria-label={peekLabel ?? `Show ${title}`}
            title={peekLabel ?? `Show ${title}`}
            onClick={() => {
              playSfx("ui.click");
              onCollapsedChange(false);
            }}
          >
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[var(--cyan)]" aria-hidden />
            <span className="font-display text-[11px] text-white/90">{peekLabel ?? title}</span>
            {peekExtra}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-auto ${LW_HUD_GLASS} ${panelClassName} ${className}`}
      data-testid={testId}
      data-collapsed="0"
    >
      <div
        className={`flex items-center justify-between gap-2 border-b border-[var(--stroke)]/60 px-3 py-1.5 ${
          dragHandleProps?.className ?? ""
        }`}
        {...(dragHandleProps
          ? {
              onPointerDown: dragHandleProps.onPointerDown,
              onPointerMove: dragHandleProps.onPointerMove,
              onPointerUp: dragHandleProps.onPointerUp,
              onPointerCancel: dragHandleProps.onPointerCancel,
              style: dragHandleProps.style,
              "data-hud-drag-handle": dragHandleProps["data-hud-drag-handle"],
              title: dragHandleProps.title,
            }
          : {})}
      >
        <p className="flex min-w-0 items-center gap-1.5 font-display text-xs tracking-wide text-white">
          {dragHandleProps ? <HudDragGrip className="text-white/70" /> : null}
          <span className="truncate">{title}</span>
        </p>
        <div className="flex items-center gap-1.5" data-no-drag>
          {headerExtra}
          <HudCollapseToggle
            collapsed={false}
            onToggle={() => onCollapsedChange(true)}
            expandLabel={`Show ${title}`}
            collapseLabel={`Hide ${title}`}
            chevronOnly
          />
        </div>
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
