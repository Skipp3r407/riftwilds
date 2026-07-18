import type { ImmersiveSettings, MinimapCorner } from "@/game/live-world/systems/immersive/types";
import { hasCustomHudPanelPosition } from "@/game/live-world/systems/immersive/hud-panel-layout";

/** Top-right chrome column: minimap (when docked TR) + world pulse / popular hubs. */
export function topRightHudStackClass(statusCollapsed: boolean): string {
  // Sit below status chips; peek status is shorter so stack can rise slightly.
  // Width follows children (minimap size or 14rem pulse panel).
  return statusCollapsed
    ? "pointer-events-none absolute right-3 top-12 z-30 flex min-w-[14rem] flex-col items-end gap-2 md:right-4"
    : "pointer-events-none absolute right-3 top-[4.75rem] z-30 flex min-w-[14rem] flex-col items-end gap-2 md:right-4 md:top-20";
}

export function minimapUsesTopRightStack(
  settings: Pick<ImmersiveSettings, "minimapCorner" | "hudPanelLayout">,
): boolean {
  // Include hidden state so the "Show minimap" peek stays in the stack, not over World pulse.
  // Custom free-form positions break out of the docked column.
  if (hasCustomHudPanelPosition(settings.hudPanelLayout, "minimap")) return false;
  const corner: MinimapCorner = settings.minimapCorner ?? "top-right";
  return corner === "top-right";
}

/** World pulse stays in the top-right column until the user free-positions it. */
export function townActivityUsesTopRightStack(
  settings: Pick<ImmersiveSettings, "hudPanelLayout">,
): boolean {
  return !hasCustomHudPanelPosition(settings.hudPanelLayout, "townActivity");
}

/**
 * Bottom-left dock: presence peek sits on the edge; chat stacks above it.
 * flex-col-reverse keeps presence visually lowest when both are docked.
 */
export function bottomLeftHudStackClass(): string {
  return "pointer-events-none absolute bottom-3 left-3 z-30 flex flex-col-reverse items-start gap-2 pb-[max(0px,var(--safe-bottom))] md:bottom-4 md:left-4";
}

export function chatUsesBottomLeftStack(
  settings: Pick<ImmersiveSettings, "hudPanelLayout">,
): boolean {
  return !hasCustomHudPanelPosition(settings.hudPanelLayout, "chat");
}

export function presenceUsesBottomLeftStack(
  settings: Pick<ImmersiveSettings, "hudPanelLayout">,
): boolean {
  return !hasCustomHudPanelPosition(settings.hudPanelLayout, "presence");
}

/** True when the immersion toolbar still occupies the bottom-center dock. */
export function toolbarUsesBottomCenterDock(
  settings: Pick<ImmersiveSettings, "hudPanelLayout">,
): boolean {
  return !hasCustomHudPanelPosition(settings.hudPanelLayout, "toolbar");
}

/**
 * World clock / day line sits above the docked toolbar so they never share a row.
 * When the toolbar is free-positioned, clock returns to the bottom edge.
 */
export function worldClockDockClass(
  settings: Pick<ImmersiveSettings, "hudPanelLayout" | "toolbarCollapsed">,
): string {
  if (!toolbarUsesBottomCenterDock(settings)) {
    return "pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3 md:bottom-4";
  }
  return settings.toolbarCollapsed
    ? "pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-3 md:bottom-14"
    : "pointer-events-none absolute inset-x-0 bottom-[4.75rem] z-20 flex justify-center px-3 md:bottom-20";
}

/**
 * Interact prompt sits above world clock + toolbar (and mobile sticks on small screens).
 */
export function interactPromptDockClass(
  settings: Pick<ImmersiveSettings, "hudPanelLayout" | "toolbarCollapsed">,
): string {
  if (!toolbarUsesBottomCenterDock(settings)) {
    return "pointer-events-none absolute inset-x-0 bottom-28 z-25 flex justify-center px-4 md:bottom-16";
  }
  return settings.toolbarCollapsed
    ? "pointer-events-none absolute inset-x-0 bottom-36 z-25 flex justify-center px-4 md:bottom-32"
    : "pointer-events-none absolute inset-x-0 bottom-44 z-25 flex justify-center px-4 md:bottom-40";
}
