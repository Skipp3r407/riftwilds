/**
 * Site-wide continuous beds (playlist + procedural ambient + combat stems).
 * Pause must silence every layer — oscillators survive HTMLAudio.pause().
 */

import { stopAmbient } from "@/lib/audio/ambient";
import { audioManager } from "@/lib/audio/manager";
import { musicEngine } from "@/lib/audio/music";
import { musicStems } from "@/lib/audio/music-stems";

/** Stop playlist, procedural ambience, and stem oscillators immediately. */
export function pauseAllBeds() {
  musicEngine.pause();
  stopAmbient(0);
  void musicStems.stop(0);
}

let lifecycleGuardsInstalled = false;

/**
 * Stop all beds when the tab/window goes away.
 * Browsers (and Cursor Simple Browser) can keep HTMLAudio / Web Audio alive
 * after the UI is closed unless we explicitly pause on pagehide / hide / freeze.
 */
export function installBedLifecycleGuards() {
  if (lifecycleGuardsInstalled || typeof window === "undefined") return;
  lifecycleGuardsInstalled = true;

  const silence = () => {
    pauseAllBeds();
    audioManager.suspendContext();
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") silence();
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", silence);
  window.addEventListener("beforeunload", silence);
  // Page Lifecycle API — bfcache / frozen background tabs.
  window.addEventListener("freeze", silence);
}

if (typeof window !== "undefined") {
  installBedLifecycleGuards();
}
