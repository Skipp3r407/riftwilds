/**
 * Camera enhancement prefs + stubs (free look / rotate / cinematic).
 * Zoom remains in premium/camera-zoom + iso-camera — this module coordinates focus modes.
 */

import type { CameraFocusTarget } from "@/game/live-world/systems/immersive/types";

export type CameraEnhanceState = {
  focus: CameraFocusTarget;
  /** Free-look / rotate — not wired to Phaser yet */
  freeLookEnabled: boolean;
  rotateEnabled: boolean;
  cinematicActive: boolean;
  photoModeActive: boolean;
};

export function createCameraEnhanceState(): CameraEnhanceState {
  return {
    focus: "player",
    freeLookEnabled: false,
    rotateEnabled: false,
    cinematicActive: false,
    photoModeActive: false,
  };
}

export function setCameraFocus(
  state: CameraEnhanceState,
  focus: CameraFocusTarget,
): CameraEnhanceState {
  return { ...state, focus };
}

export function toggleRiftlingFocus(state: CameraEnhanceState): CameraEnhanceState {
  return {
    ...state,
    focus: state.focus === "riftling" ? "player" : "riftling",
  };
}

export function setCinematicMode(
  state: CameraEnhanceState,
  active: boolean,
): CameraEnhanceState {
  return {
    ...state,
    cinematicActive: active,
    // Cinematic implies player follow unless photo overrides
    focus: active && state.focus === "free" ? "player" : state.focus,
  };
}

export function setPhotoCamera(
  state: CameraEnhanceState,
  active: boolean,
): CameraEnhanceState {
  return {
    ...state,
    photoModeActive: active,
    freeLookEnabled: active ? true : state.freeLookEnabled,
  };
}

/** Documented stubs for future Phaser free-look / orbit. */
export const CAMERA_FEATURE_STUBS = [
  {
    id: "free-look",
    status: "stub" as const,
    note: "Middle-mouse / right-stick drag to pan without moving Keeper",
  },
  {
    id: "orbit-rotate",
    status: "stub" as const,
    note: "Optional presentation rotate — physics stays axis-aligned",
  },
  {
    id: "cinematic-dolly",
    status: "stub" as const,
    note: "Scripted dolly paths for cutscenes / photo framing",
  },
  {
    id: "smooth-zoom",
    status: "live" as const,
    note: "Wheel / +− / UI buttons via iso-camera + persisted zoom",
  },
  {
    id: "riftling-focus",
    status: "live" as const,
    note: "Focus companion sprite via bridge cameraFocus queue",
  },
] as const;
