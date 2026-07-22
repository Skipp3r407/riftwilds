"use client";

import { useEffect } from "react";
import {
  enterSoundscape,
  type SoundscapeMode,
} from "@/lib/audio/adaptive-engine";

/**
 * Drop into server or client pages to enter an adaptive soundscape on mount.
 * Does not change the dock playlist track (see adaptive-engine switchPlaylist).
 */
export function SoundscapeMount({
  mode,
  regionId,
  fadeMs = 800,
}: {
  mode: SoundscapeMode;
  regionId?: string;
  fadeMs?: number;
}) {
  useEffect(() => {
    // Page mounts must never yank playlist music — SFX/stems/reverb only.
    void enterSoundscape(mode, { regionId, fadeMs, switchPlaylist: false });
  }, [mode, regionId, fadeMs]);

  return null;
}
