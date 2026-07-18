/**
 * Pure Live World camera zoom helpers (no Phaser) — safe for unit tests.
 */

export const CAMERA_ZOOM_STORAGE_KEY = "riftwilds-live-world-camera-zoom-v1";
export const MIN_ZOOM = 0.9;
export const MAX_ZOOM = 2.25;
/** Closer default so Keeper / Riftling / NPCs read clearly on RESIZE canvases. */
export const DEFAULT_ZOOM = 1.52;
export const NON_PREMIUM_DEFAULT_ZOOM = 1.28;
export const ZOOM_STEP = 0.12;

export function clampCameraZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function loadPersistedCameraZoom(fallback: number): number {
  if (typeof window === "undefined") return clampCameraZoom(fallback);
  try {
    const raw = window.localStorage.getItem(CAMERA_ZOOM_STORAGE_KEY);
    if (raw == null) return clampCameraZoom(fallback);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return clampCameraZoom(fallback);
    return clampCameraZoom(parsed);
  } catch {
    return clampCameraZoom(fallback);
  }
}

export function persistCameraZoom(zoom: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CAMERA_ZOOM_STORAGE_KEY, String(clampCameraZoom(zoom)));
  } catch {
    /* ignore quota / private mode */
  }
}
