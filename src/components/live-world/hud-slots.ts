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
