"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  exitNativeFullscreen,
  isFullscreenApiAvailable,
  isNativeFullscreen,
  requestNativeFullscreen,
  type EnterFullscreenResult,
} from "@/game/live-world/systems/immersive/fullscreen";
import { waitForNextLayout } from "@/game/live-world/systems/immersive/display-layout";
import type { WindowModePreference } from "@/game/live-world/systems/immersive/types";

export type DisplayMode = "windowed" | "native-fullscreen" | "viewport-expand";

type Options = {
  /** Element to fullscreen (Live World host). Falls back to documentElement. */
  targetRef?: React.RefObject<HTMLElement | null>;
  preference?: WindowModePreference;
  onPreferenceChange?: (pref: WindowModePreference) => void;
};

/**
 * Fullscreen + viewport-expand fallback. Exit never traps — Esc / UI / browser chrome.
 *
 * Enter always applies expanded CSS first, waits a layout frame, then requests
 * native fullscreen when available — so the canvas parent is never 0×0 / short
 * letterboxed inside a black :fullscreen stage.
 */
export function useLiveWorldFullscreen(options: Options = {}) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("windowed");
  const [apiAvailable] = useState(() =>
    typeof document !== "undefined" ? isFullscreenApiAvailable() : false,
  );
  const preferenceRef = useRef(options.preference);
  const onPrefRef = useRef(options.onPreferenceChange);
  const targetRef = options.targetRef;
  preferenceRef.current = options.preference;
  onPrefRef.current = options.onPreferenceChange;

  const syncNative = useCallback(() => {
    if (isNativeFullscreen()) {
      setDisplayMode("native-fullscreen");
    } else {
      setDisplayMode((prev) => (prev === "native-fullscreen" ? "windowed" : prev));
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onChange = () => syncNative();
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange as EventListener);
    };
  }, [syncNative]);

  const enter = useCallback(async (): Promise<EnterFullscreenResult> => {
    const preferExpand = preferenceRef.current === "viewport-expand";

    // Always expand CSS first (same active layout as native FS). Using
    // viewport-expand here avoids fullscreenchange sync collapsing a premature
    // "native-fullscreen" mode before requestFullscreen resolves.
    setDisplayMode("viewport-expand");
    await waitForNextLayout();

    if (preferExpand || !apiAvailable) {
      onPrefRef.current?.("viewport-expand");
      return {
        ok: true,
        mode: "viewport-expand",
        reason: preferExpand ? "User preference" : "API unavailable",
      };
    }

    const result = await requestNativeFullscreen(targetRef?.current ?? null);
    if (result.ok && result.mode === "native") {
      setDisplayMode("native-fullscreen");
      onPrefRef.current?.("browser-fullscreen");
      await waitForNextLayout();
      return result;
    }

    // API denied — stay on viewport-expand so the Commons still fills the display.
    onPrefRef.current?.("viewport-expand");
    return result;
  }, [apiAvailable, targetRef]);

  const exit = useCallback(async () => {
    if (isNativeFullscreen()) {
      await exitNativeFullscreen();
    }
    setDisplayMode("windowed");
    onPrefRef.current?.("windowed");
    await waitForNextLayout();
  }, []);

  const toggle = useCallback(async () => {
    if (displayMode === "windowed") {
      return enter();
    }
    await exit();
    return { ok: true as const, mode: "native" as const };
  }, [displayMode, enter, exit]);

  const active = displayMode !== "windowed";

  return {
    displayMode,
    active,
    apiAvailable,
    enter,
    exit,
    toggle,
  };
}
