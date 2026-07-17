"use client";

import { useCallback, useEffect, useState } from "react";
import {
  playSfx,
  sfx,
  unlockSfx,
  type SfxEventId,
  type SfxPrefs,
} from "@/lib/audio/sfx";
import { useGameUiStore } from "@/lib/state/game-ui";

/**
 * Subscribe to SFX prefs + helpers. Safe to call from any client component.
 * Unlock happens on first user gesture (global) or explicitly via unlock().
 */
export function useSfx() {
  const [prefs, setPrefs] = useState<SfxPrefs>(() => sfx.getPrefs());
  const setSoundMuted = useGameUiStore((s) => s.setSoundMuted);

  useEffect(() => {
    sfx.init();
    return sfx.subscribe((next) => {
      setPrefs(next);
      setSoundMuted(next.muted);
    });
  }, [setSoundMuted]);

  const play = useCallback((id: SfxEventId, opts?: { force?: boolean }) => {
    playSfx(id, opts);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    sfx.setMuted(muted);
  }, []);

  const setVolume = useCallback((volume: number) => {
    sfx.setVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    sfx.toggleMute();
  }, []);

  return {
    muted: prefs.muted,
    volume: prefs.volume,
    play,
    setMuted,
    setVolume,
    toggleMute,
    unlock: unlockSfx,
  };
}

/** Fire-and-forget play without subscribing (for one-off handlers). */
export { playSfx, unlockSfx };
