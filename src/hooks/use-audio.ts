"use client";

import { useCallback, useEffect, useState } from "react";
import { audioManager, unlockAudio } from "@/lib/audio/manager";
import type { AudioPrefs, AudioVolumeGroup } from "@/lib/audio/types";
import { useGameUiStore } from "@/lib/state/game-ui";

/**
 * Subscribe to unified audio prefs (master + category volumes + mute-all).
 */
export function useAudio() {
  const [prefs, setPrefs] = useState<AudioPrefs>(() => audioManager.getPrefs());
  const setSoundMuted = useGameUiStore((s) => s.setSoundMuted);

  useEffect(() => {
    audioManager.init();
    return audioManager.subscribe((next) => {
      setPrefs(next);
      setSoundMuted(next.mutedAll || next.volumes.master <= 0);
    });
  }, [setSoundMuted]);

  const setMutedAll = useCallback((muted: boolean) => {
    audioManager.setMutedAll(muted);
  }, []);

  const toggleMuteAll = useCallback(() => {
    audioManager.toggleMuteAll();
  }, []);

  const setVolume = useCallback((group: AudioVolumeGroup, volume: number) => {
    audioManager.setVolume(group, volume);
  }, []);

  return {
    prefs,
    mutedAll: prefs.mutedAll,
    volumes: prefs.volumes,
    setMutedAll,
    toggleMuteAll,
    setVolume,
    unlock: unlockAudio,
    gainFor: (group: Exclude<AudioVolumeGroup, "master">) =>
      audioManager.gainFor(group),
  };
}
