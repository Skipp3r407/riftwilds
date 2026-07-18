/**
 * Soft-follow camera with optional zoom and mild isometric presentation.
 * Physics stays axis-aligned; presentation adds depth via zoom + follow lerp.
 */

import * as Phaser from "phaser";
import { getInputManager } from "@/game/live-world/input/input-manager";
import {
  DEFAULT_ZOOM,
  NON_PREMIUM_DEFAULT_ZOOM,
  clampCameraZoom,
  loadPersistedCameraZoom,
  persistCameraZoom,
} from "@/game/live-world/systems/premium/camera-zoom";

export type IsoCameraController = {
  bindPlayer: (player: Phaser.GameObjects.Sprite) => void;
  /** Soft-follow the companion Riftling (or re-bind player). */
  bindFollow: (target: Phaser.GameObjects.Sprite) => void;
  setZoomDelta: (delta: number) => void;
  setZoom: (next: number) => void;
  getZoom: () => number;
  /** Slightly slower lerp while photo/cinematic for smoother framing. */
  setSmoothFollow: (smooth: boolean) => void;
  shakeMajor: () => void;
  destroy: () => void;
};

export {
  CAMERA_ZOOM_STORAGE_KEY,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  NON_PREMIUM_DEFAULT_ZOOM,
  ZOOM_STEP,
  clampCameraZoom,
  loadPersistedCameraZoom,
  persistCameraZoom,
} from "@/game/live-world/systems/premium/camera-zoom";

/**
 * Mild "isometric" presentation:
 * - Higher default zoom (closer, more readable actors)
 * - Soft follow lerp
 * - Wheel + programmatic zoom (clamped, persisted)
 * - Shake reserved for major events
 */
export function attachIsoCamera(
  scene: Phaser.Scene,
  mapW: number,
  mapH: number,
  premium: boolean,
  onZoomChange?: (zoom: number) => void,
): IsoCameraController {
  const cam = scene.cameras.main;
  cam.setBounds(0, 0, mapW, mapH);
  cam.setBackgroundColor(premium ? "#1a2430" : "#0a101c");

  const fallback = premium ? DEFAULT_ZOOM : NON_PREMIUM_DEFAULT_ZOOM;
  let zoom = loadPersistedCameraZoom(fallback);
  cam.setZoom(zoom);
  onZoomChange?.(zoom);

  let lerp = premium ? 0.08 : 0.12;
  const baseLerp = lerp;
  const biasY = premium ? -18 : 0;

  const applyZoom = (next: number) => {
    zoom = clampCameraZoom(next);
    cam.setZoom(zoom);
    persistCameraZoom(zoom);
    onZoomChange?.(zoom);
  };

  const onWheel = (
    _pointer: Phaser.Input.Pointer,
    _gos: Phaser.GameObjects.GameObject[],
    _dx: number,
    dy: number,
  ) => {
    const input = getInputManager();
    if (input.isTypingFocused() || input.isModalOpen()) return;
    // Ignore tiny trackpad noise; invert so scroll-up zooms in.
    if (Math.abs(dy) < 0.5) return;
    applyZoom(zoom - dy * 0.00135);
  };
  scene.input.on("wheel", onWheel);

  const bindFollow = (target: Phaser.GameObjects.Sprite) => {
    cam.startFollow(target, true, lerp, lerp);
    cam.setFollowOffset(0, biasY);
  };

  return {
    bindPlayer(player) {
      bindFollow(player);
    },
    bindFollow,
    setZoomDelta(delta) {
      applyZoom(zoom + delta);
    },
    setZoom(next) {
      applyZoom(next);
    },
    getZoom() {
      return zoom;
    },
    setSmoothFollow(smooth) {
      lerp = smooth ? Math.min(baseLerp, 0.05) : baseLerp;
    },
    shakeMajor() {
      cam.shake(280, 0.006);
    },
    destroy() {
      scene.input.off("wheel", onWheel);
    },
  };
}
