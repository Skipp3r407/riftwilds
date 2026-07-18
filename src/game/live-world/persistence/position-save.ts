import type { SavedWorldPosition } from "@/game/live-world/types";

const STORAGE_KEY = "riftwilds.liveWorld.position.v1";

/** Matches Commons blueprint spawn (32,24) tiles × 32px. */
export const DEFAULT_SPAWN = { mapId: "riftwild-commons", x: 1024, y: 768 };

/**
 * Client cache only. Authoritative position / restore lives on
 * `/api/persistence/*` + `src/lib/persistence` (see docs/persistence/ARCHITECTURE.md).
 */

export function loadSavedPosition(): SavedWorldPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedWorldPosition;
    if (
      typeof parsed?.x !== "number" ||
      typeof parsed?.y !== "number" ||
      typeof parsed?.mapId !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function savePosition(pos: Omit<SavedWorldPosition, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SavedWorldPosition = { ...pos, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearSavedPosition(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
