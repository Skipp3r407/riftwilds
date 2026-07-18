import type { ImmersiveSettings } from "@/game/live-world/systems/immersive/types";
import {
  prefersReducedMotion,
  resolveAutoHideEnabled,
} from "@/game/live-world/systems/immersive/settings";

export type FloatingChipFadeState = {
  /** True while fully opaque / recently revealed. */
  awake: boolean;
  lastRevealAt: number;
  /** Pointer / focus currently holding the chip open. */
  held: boolean;
};

export function createFloatingChipFadeState(now = Date.now()): FloatingChipFadeState {
  return {
    awake: true,
    lastRevealAt: now,
    held: false,
  };
}

export function revealFloatingChip(
  state: FloatingChipFadeState,
  now = Date.now(),
): FloatingChipFadeState {
  return {
    ...state,
    awake: true,
    lastRevealAt: now,
  };
}

export function setFloatingChipHeld(
  state: FloatingChipFadeState,
  held: boolean,
  now = Date.now(),
): FloatingChipFadeState {
  if (held) {
    return { awake: true, lastRevealAt: now, held: true };
  }
  return { ...state, held: false, lastRevealAt: now };
}

/** Whether floating chips should idle-fade for this HUD mode. */
export function resolveFloatingChipFadeEnabled(settings: ImmersiveSettings): boolean {
  if (settings.hudMode === "immersive" || settings.hudMode === "cinematic") return true;
  if (settings.hudMode === "minimal") return resolveAutoHideEnabled(settings);
  // Standard: only when the user opted into auto-hide HUD.
  return settings.autoHideHud;
}

/** Idle delay before fading — slightly gentler in Standard. */
export function resolveFloatingChipDelayMs(settings: ImmersiveSettings): number {
  const base = prefersReducedMotion(settings)
    ? Math.max(settings.autoHideDelayMs, 4000)
    : settings.autoHideDelayMs;
  if (settings.hudMode === "cinematic") return Math.min(base, 2000);
  if (settings.hudMode === "immersive") return base;
  // Standard / minimal: a bit longer so chips feel less twitchy.
  return Math.max(base, 3500);
}

/**
 * Resting opacity when faded (still hoverable).
 * Immersive / cinematic go near-invisible; Standard stays a touch more readable.
 */
export function resolveFloatingChipFadedOpacity(settings: ImmersiveSettings): number {
  if (settings.hudMode === "cinematic") return 0.05;
  if (settings.hudMode === "immersive") return 0.1;
  return 0.15;
}

export function tickFloatingChipFade(
  state: FloatingChipFadeState,
  settings: ImmersiveSettings,
  now = Date.now(),
): FloatingChipFadeState {
  if (!resolveFloatingChipFadeEnabled(settings)) {
    return { ...state, awake: true };
  }
  if (state.held) {
    return { ...state, awake: true };
  }
  const delay = resolveFloatingChipDelayMs(settings);
  if (now - state.lastRevealAt >= delay) {
    return { ...state, awake: false };
  }
  return { ...state, awake: true };
}

/** Effective CSS opacity for a floating chip (0–1). */
export function floatingChipOpacity(
  state: FloatingChipFadeState,
  settings: ImmersiveSettings,
): number {
  if (!resolveFloatingChipFadeEnabled(settings)) return 1;
  if (state.awake || state.held) return 1;
  return resolveFloatingChipFadedOpacity(settings);
}
