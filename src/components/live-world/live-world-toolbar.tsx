"use client";

import {
  Aperture,
  ChevronDown,
  ChevronUp,
  Focus,
  Layers,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
} from "lucide-react";
import { FullscreenToggleButton } from "@/components/live-world/fullscreen-toggle-button";
import { LW_HUD_BTN, LW_HUD_BTN_ACTIVE, LW_HUD_GLASS } from "@/components/live-world/hud-chrome";
import {
  DraggableHudPanel,
  HudDragGrip,
  type HudDragHandleProps,
} from "@/components/live-world/draggable-hud-panel";
import { playSfx } from "@/hooks/use-sfx";
import type {
  HudPanelLayout,
  HudPanelPosition,
  HudUiMode,
} from "@/game/live-world/systems/immersive/types";

type Props = {
  fullscreenActive: boolean;
  onToggleFullscreen: () => void;
  hudMode: HudUiMode;
  onCycleHud: () => void;
  onOpenDisplaySettings: () => void;
  photoMode: boolean;
  onTogglePhoto: () => void;
  riftlingFocused: boolean;
  onToggleRiftlingFocus: () => void;
  opacity: number;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  panelLayout?: HudPanelLayout;
  onPanelPositionChange?: (position: HudPanelPosition) => void;
};

export function LiveWorldToolbar({
  fullscreenActive,
  onToggleFullscreen,
  hudMode,
  onCycleHud,
  onOpenDisplaySettings,
  photoMode,
  onTogglePhoto,
  riftlingFocused,
  onToggleRiftlingFocus,
  opacity,
  collapsed,
  onCollapsedChange,
  panelLayout,
  onPanelPositionChange,
}: Props) {
  const fade = Math.max(opacity, 0.35);
  const canDrag = typeof onPanelPositionChange === "function";
  // Docked bottom-center; world clock + interact prompt reserve space above via hud-slots.
  const defaultClass = collapsed
    ? "pointer-events-auto absolute bottom-0 left-1/2 z-40 -translate-x-1/2 pb-[max(0px,var(--safe-bottom))]"
    : `pointer-events-auto absolute bottom-3 left-1/2 z-40 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1 pb-[max(0px,var(--safe-bottom))] ${LW_HUD_GLASS} px-2 py-1.5`;

  const expandedControls = (
    <>
      <FullscreenToggleButton
        active={fullscreenActive}
        onToggle={onToggleFullscreen}
        compact
        className={`${LW_HUD_BTN} !border-[var(--stroke)] ${
          fullscreenActive ? LW_HUD_BTN_ACTIVE : ""
        }`}
        icon={
          fullscreenActive ? (
            <Minimize2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )
        }
      />
      <button
        type="button"
        className={LW_HUD_BTN}
        title="Cycle HUD mode (U)"
        onClick={() => {
          playSfx("ui.click");
          onCycleHud();
        }}
      >
        <Layers className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        HUD: {hudMode}
      </button>
      <button
        type="button"
        className={`${LW_HUD_BTN} ${riftlingFocused ? LW_HUD_BTN_ACTIVE : ""}`}
        title="Focus Riftling (Y)"
        aria-pressed={riftlingFocused}
        onClick={() => {
          playSfx("ui.click");
          onToggleRiftlingFocus();
        }}
      >
        <Focus className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        {riftlingFocused ? "Focus: Riftling" : "Focus: Keeper"}
      </button>
      <button
        type="button"
        className={`${LW_HUD_BTN} ${photoMode ? LW_HUD_BTN_ACTIVE : ""}`}
        title="Photo mode (N)"
        aria-pressed={photoMode}
        onClick={() => {
          playSfx("ui.click");
          onTogglePhoto();
        }}
      >
        <Aperture className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        {photoMode ? "Exit photo" : "Photo"}
      </button>
      <button
        type="button"
        className={LW_HUD_BTN}
        title="Display & HUD settings"
        onClick={() => {
          playSfx("ui.click");
          onOpenDisplaySettings();
        }}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        Display
      </button>
      <button
        type="button"
        className={`${LW_HUD_BTN} px-1.5`}
        aria-expanded
        aria-label="Hide immersion toolbar"
        title="Collapse toolbar"
        onClick={() => {
          playSfx("ui.click");
          onCollapsedChange(true);
        }}
      >
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </button>
    </>
  );

  const renderCollapsed = (dragHandleProps?: HudDragHandleProps) => (
    <div
      className={`inline-flex items-center gap-1 ${dragHandleProps?.className ?? ""}`}
      {...(dragHandleProps
        ? {
            onPointerDown: dragHandleProps.onPointerDown,
            onPointerMove: dragHandleProps.onPointerMove,
            onPointerUp: dragHandleProps.onPointerUp,
            onPointerCancel: dragHandleProps.onPointerCancel,
            style: dragHandleProps.style,
            "data-hud-drag-handle": dragHandleProps["data-hud-drag-handle"],
            title: "HUD toolbar · drag to move",
          }
        : {})}
    >
      {dragHandleProps ? <HudDragGrip className="text-white/70" /> : null}
      <button
        type="button"
        data-no-drag
        className={`${LW_HUD_GLASS} ${LW_HUD_BTN} gap-2 rounded-b-none rounded-t-xl border-b-0 px-3 py-1.5`}
        aria-expanded={false}
        aria-label="Show immersion toolbar"
        title="Show toolbar"
        onClick={() => {
          playSfx("ui.click");
          onCollapsedChange(false);
        }}
      >
        <ChevronUp className="h-3.5 w-3.5 text-[var(--cyan)]" aria-hidden />
        <span className="font-display text-[11px] text-white/90">HUD</span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--text-dim)]">
          {hudMode}
        </span>
      </button>
    </div>
  );

  const renderExpanded = (dragHandleProps?: HudDragHandleProps, glassOnInner = false) => (
    <div
      className={`flex flex-wrap items-center justify-center gap-1 ${
        glassOnInner ? `${LW_HUD_GLASS} px-2 py-1.5` : ""
      }`}
    >
      {dragHandleProps ? (
        <span
          className={`mr-0.5 inline-flex items-center text-[var(--text-dim)] ${dragHandleProps.className}`}
          onPointerDown={dragHandleProps.onPointerDown}
          onPointerMove={dragHandleProps.onPointerMove}
          onPointerUp={dragHandleProps.onPointerUp}
          onPointerCancel={dragHandleProps.onPointerCancel}
          style={dragHandleProps.style}
          data-hud-drag-handle={dragHandleProps["data-hud-drag-handle"]}
          title={dragHandleProps.title}
        >
          <HudDragGrip />
        </span>
      ) : null}
      {expandedControls}
    </div>
  );

  if (!canDrag) {
    return (
      <div
        data-testid="live-world-toolbar"
        data-collapsed={collapsed ? "1" : "0"}
        className={defaultClass}
        style={{ opacity: fade }}
      >
        {collapsed ? renderCollapsed() : expandedControls}
      </div>
    );
  }

  return (
    <DraggableHudPanel
      panelId="toolbar"
      position={panelLayout?.toolbar}
      onPositionChange={onPanelPositionChange}
      defaultClassName={defaultClass}
      style={{ opacity: fade }}
      testId="live-world-toolbar"
    >
      {({ dragHandleProps, isCustom }) => (
        <div data-collapsed={collapsed ? "1" : "0"}>
          {collapsed
            ? renderCollapsed(dragHandleProps)
            : renderExpanded(dragHandleProps, isCustom)}
        </div>
      )}
    </DraggableHudPanel>
  );
}
