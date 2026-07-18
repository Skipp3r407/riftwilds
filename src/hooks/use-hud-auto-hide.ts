"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImmersiveSettings, HudRevealReason } from "@/game/live-world/systems/immersive/types";
import {
  createHudVisibilityState,
  hudChromeOpacity,
  revealHud,
  shouldShowChromeLayer,
  tickHudVisibility,
  type HudVisibilityState,
} from "@/game/live-world/systems/immersive/hud-visibility";

export function useHudAutoHide(settings: ImmersiveSettings) {
  const [state, setState] = useState<HudVisibilityState>(() => createHudVisibilityState());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const reveal = useCallback((reason: HudRevealReason) => {
    setState((prev) => revealHud(prev, reason));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => tickHudVisibility(prev, settingsRef.current));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    // Mode changes should re-evaluate immediately
    setState((prev) => tickHudVisibility(revealHud(prev, "manual"), settings));
  }, [settings.hudMode, settings.autoHideHud, settings.hudOpacity, settings.autoHideDelayMs]);

  const opacity = hudChromeOpacity(state, settings);
  const show = (layer: Parameters<typeof shouldShowChromeLayer>[0]) =>
    shouldShowChromeLayer(layer, settings, state);

  return { state, reveal, opacity, show };
}
