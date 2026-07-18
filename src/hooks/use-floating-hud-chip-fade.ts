"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import type { ImmersiveSettings } from "@/game/live-world/systems/immersive/types";
import {
  createFloatingChipFadeState,
  floatingChipOpacity,
  revealFloatingChip,
  setFloatingChipHeld,
  tickFloatingChipFade,
  type FloatingChipFadeState,
} from "@/game/live-world/systems/immersive/floating-chip-fade";
import { prefersReducedMotion } from "@/game/live-world/systems/immersive/settings";

/**
 * Idle-fade for floating Live World chips (world clock, interact prompt, etc.).
 * Hover / focus holds full opacity; activity keys flash then resume fade.
 */
export function useFloatingHudChipFade(
  settings: ImmersiveSettings,
  /** Change this when the chip's meaningful content updates (new target, weather, etc.). */
  activityKey?: string | number | boolean | null,
) {
  const [state, setState] = useState<FloatingChipFadeState>(() => createFloatingChipFadeState());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const reveal = useCallback(() => {
    setState((prev) => revealFloatingChip(prev));
  }, []);

  const hold = useCallback((held: boolean) => {
    setState((prev) => setFloatingChipHeld(prev, held));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => tickFloatingChipFade(prev, settingsRef.current));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setState((prev) =>
      tickFloatingChipFade(revealFloatingChip(prev), settings),
    );
  }, [settings.hudMode, settings.autoHideHud, settings.autoHideDelayMs, settings.reducedMotion]);

  // Flash fully visible when the chip's content/activity changes.
  useEffect(() => {
    if (activityKey === undefined) return;
    setState((prev) => revealFloatingChip(prev));
  }, [activityKey]);

  const opacity = floatingChipOpacity(state, settings);
  const reduced = prefersReducedMotion(settings);

  return {
    opacity,
    reveal,
    hold,
    onPointerEnter: () => hold(true),
    onPointerLeave: () => hold(false),
    onFocusCapture: () => hold(true),
    onBlurCapture: (e: FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        hold(false);
      }
    },
    /** Tap-to-reveal on touch / coarse pointers (doesn't leave a permanent blocker). */
    onPointerDown: () => reveal(),
    transition: reduced ? undefined : "opacity 320ms ease",
    state,
  };
}
