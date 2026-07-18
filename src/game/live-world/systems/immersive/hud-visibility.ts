import type { HudRevealReason, ImmersiveSettings } from "@/game/live-world/systems/immersive/types";
import {
  prefersReducedMotion,
  resolveAutoHideEnabled,
  resolveBaseHudOpacity,
} from "@/game/live-world/systems/immersive/settings";

export type HudVisibilityState = {
  visible: boolean;
  opacity: number;
  lastRevealAt: number;
  lastReason: HudRevealReason | null;
};

export function createHudVisibilityState(now = Date.now()): HudVisibilityState {
  return {
    visible: true,
    opacity: 1,
    lastRevealAt: now,
    lastReason: null,
  };
}

export function revealHud(
  state: HudVisibilityState,
  reason: HudRevealReason,
  now = Date.now(),
): HudVisibilityState {
  return {
    visible: true,
    opacity: 1,
    lastRevealAt: now,
    lastReason: reason,
  };
}

/**
 * Tick auto-hide: returns next visibility given settings + idle time.
 * Cinematic keeps HUD hidden unless recently revealed by combat/message/menu.
 */
export function tickHudVisibility(
  state: HudVisibilityState,
  settings: ImmersiveSettings,
  now = Date.now(),
): HudVisibilityState {
  const autoHide = resolveAutoHideEnabled(settings);
  const baseOpacity = resolveBaseHudOpacity(settings);

  if (settings.hudMode === "cinematic") {
    const holdMs = prefersReducedMotion(settings) ? 4000 : settings.autoHideDelayMs;
    const recently =
      state.lastReason === "combat" ||
      state.lastReason === "damage" ||
      state.lastReason === "message" ||
      state.lastReason === "quest" ||
      state.lastReason === "menu";
    if (recently && now - state.lastRevealAt < holdMs) {
      return { ...state, visible: true, opacity: Math.max(0.35, baseOpacity || 0.45) };
    }
    return { ...state, visible: false, opacity: 0 };
  }

  if (!autoHide) {
    return { ...state, visible: true, opacity: baseOpacity };
  }

  const delay = prefersReducedMotion(settings)
    ? Math.max(settings.autoHideDelayMs, 4000)
    : settings.autoHideDelayMs;

  if (now - state.lastRevealAt >= delay) {
    return { ...state, visible: false, opacity: 0 };
  }

  return { ...state, visible: true, opacity: baseOpacity };
}

/** Effective CSS opacity for HUD chrome (0–1). */
export function hudChromeOpacity(
  state: HudVisibilityState,
  settings: ImmersiveSettings,
): number {
  if (!state.visible) return 0;
  return Math.min(state.opacity, resolveBaseHudOpacity(settings) || 1);
}

export function shouldShowChromeLayer(
  layer: "status" | "minimap" | "chat" | "zoom" | "toolbar" | "credits",
  settings: ImmersiveSettings,
  state: HudVisibilityState,
): boolean {
  if (settings.hudMode === "cinematic" && !state.visible) return false;
  if (settings.hudMode === "minimal") {
    return layer === "status" || layer === "toolbar" || layer === "chat";
  }
  if (settings.hudMode === "immersive" && !state.visible) {
    return layer === "toolbar";
  }
  return true;
}
