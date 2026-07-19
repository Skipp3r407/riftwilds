"use client";

import { useEffect } from "react";
import {
  enterSoundscape,
  type SoundscapeMode,
} from "@/lib/audio/adaptive-engine";

/**
 * Drop into server or client pages to enter an adaptive soundscape on mount.
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
    void enterSoundscape(mode, { regionId, fadeMs });
  }, [mode, regionId, fadeMs]);

  return null;
}
