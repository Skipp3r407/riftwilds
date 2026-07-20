import type { ImmersiveSettings, MinimapCorner } from "@/game/live-world/systems/immersive/types";
import { hasCustomHudPanelPosition } from "@/game/live-world/systems/immersive/hud-panel-layout";

/**
 * Reference HUD composition (Living Towns / immersive MMORPG chrome):
 * - Top-left: location + weather
 * - Mid-left: World Pulse
 * - Bottom-left: chat (+ presence peek)
 * - Top-center: Credits + Happening Now
 * - Top-right: utility pills (goals / fullscreen / exit)
 * - Right column: minimap → nearby badge/drawer → pinned objectives → presence
 * - Bottom-center: vitals orbs + consolidated action bar
 * - Bottom-right: compact radial / system shortcuts
 * Center of screen stays clear for the world (Level-2 panels collapsed by default).
 */

/** Mid-left World Pulse stack (below unified top command bar). */
export function midLeftHudStackClass(statusCollapsed: boolean): string {
  // Top command bar owns the header; pulse docks under it on all breakpoints.
  void statusCollapsed;
  return "pointer-events-none absolute left-3 top-[4.75rem] z-30 flex w-[min(16rem,calc(100%-1.5rem))] flex-col items-start gap-2 md:left-4 md:top-[5.25rem]";
}

export function townActivityUsesMidLeftStack(
  settings: Pick<ImmersiveSettings, "hudPanelLayout">,
): boolean {
  return !hasCustomHudPanelPosition(settings.hudPanelLayout, "townActivity");
}

/** Right column: minimap + nearby badge + objectives (narrower for play space). */
export function rightColumnHudStackClass(statusCollapsed: boolean): string {
  void statusCollapsed;
  return "pointer-events-none absolute right-3 top-[4.75rem] z-30 flex w-[min(13.5rem,calc(100%-1.5rem))] flex-col items-end gap-1.5 md:right-4 md:top-[5.25rem] md:w-[min(14.5rem,calc(100%-2rem))] xl:w-[min(15.5rem,22vw)]";
}

/** @deprecated Prefer rightColumnHudStackClass — kept for free-drag fallbacks. */
export function topRightHudStackClass(statusCollapsed: boolean): string {
  return rightColumnHudStackClass(statusCollapsed);
}

export function minimapUsesTopRightStack(
  settings: Pick<ImmersiveSettings, "minimapCorner" | "hudPanelLayout">,
): boolean {
  if (hasCustomHudPanelPosition(settings.hudPanelLayout, "minimap")) return false;
  const corner: MinimapCorner = settings.minimapCorner ?? "top-right";
  return corner === "top-right";
}

/** @deprecated World pulse moved to mid-left; alias for layout helpers. */
export function townActivityUsesTopRightStack(
  settings: Pick<ImmersiveSettings, "hudPanelLayout">,
): boolean {
  return townActivityUsesMidLeftStack(settings);
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

/** Bottom-center vitals + hotbar dock (above safe area). */
export function bottomCenterVitalsDockClass(
  settings: Pick<ImmersiveSettings, "toolbarCollapsed" | "hudPanelLayout">,
): string {
  // Sit above immersion toolbar when docked; clear center for world otherwise.
  if (!toolbarUsesBottomCenterDock(settings)) {
    return "pointer-events-none absolute inset-x-0 bottom-3 z-25 flex justify-center px-3 md:bottom-4";
  }
  return settings.toolbarCollapsed
    ? "pointer-events-none absolute inset-x-0 bottom-12 z-25 flex justify-center px-3 md:bottom-14"
    : "pointer-events-none absolute inset-x-0 bottom-[4.5rem] z-25 flex justify-center px-3 md:bottom-[5.25rem]";
}

/**
 * World clock sits with top-left status in reference layout (weather line).
 * Fallback: bottom dock above toolbar when status collapsed / no weather slot.
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
 * Interact prompt sits above vitals + toolbar (and mobile sticks on small screens).
 */
export function interactPromptDockClass(
  settings: Pick<ImmersiveSettings, "hudPanelLayout" | "toolbarCollapsed">,
): string {
  if (!toolbarUsesBottomCenterDock(settings)) {
    return "pointer-events-none absolute inset-x-0 bottom-36 z-30 flex justify-center px-4 md:bottom-28";
  }
  return settings.toolbarCollapsed
    ? "pointer-events-none absolute inset-x-0 bottom-40 z-30 flex justify-center px-4 md:bottom-36"
    : "pointer-events-none absolute inset-x-0 bottom-48 z-30 flex justify-center px-4 md:bottom-44";
}

/** Top-center credits + happening now. */
export function topCenterHudClass(): string {
  return "pointer-events-none absolute left-1/2 top-2 z-30 flex w-[min(18rem,calc(100%-10rem))] -translate-x-1/2 flex-col items-center gap-1.5 md:top-3";
}

/** Top-right utility (Goals / Fullscreen icon / System menu). */
export function topRightUtilityClass(): string {
  return "pointer-events-none absolute right-3 top-2 z-35 flex flex-wrap items-center justify-end gap-1 md:right-4 md:top-3";
}

/** Bottom-right circular menu. */
export function bottomRightRadialClass(): string {
  return "pointer-events-none absolute bottom-3 right-3 z-30 flex items-end gap-1.5 pb-[max(0px,var(--safe-bottom))] md:bottom-4 md:right-4";
}
