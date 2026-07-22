/**
 * Site-wide continuous beds (playlist + procedural ambient + combat stems).
 * Pause must silence every layer — oscillators survive HTMLAudio.pause().
 */

import { stopAmbient } from "@/lib/audio/ambient";
import { musicEngine } from "@/lib/audio/music";
import { musicStems } from "@/lib/audio/music-stems";

/** Stop playlist, procedural ambience, and stem oscillators immediately. */
export function pauseAllBeds() {
  musicEngine.pause();
  stopAmbient(0);
  void musicStems.stop(0);
}
