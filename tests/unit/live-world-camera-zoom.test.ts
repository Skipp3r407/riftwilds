import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CAMERA_ZOOM_STORAGE_KEY,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  clampCameraZoom,
  loadPersistedCameraZoom,
  persistCameraZoom,
} from "@/game/live-world/systems/premium/camera-zoom";

describe("Live World camera zoom", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clamps zoom within min/max", () => {
    expect(clampCameraZoom(0.1)).toBe(MIN_ZOOM);
    expect(clampCameraZoom(9)).toBe(MAX_ZOOM);
    expect(clampCameraZoom(DEFAULT_ZOOM)).toBe(DEFAULT_ZOOM);
  });

  it("defaults closer than legacy 1.28 so actors read clearer", () => {
    expect(DEFAULT_ZOOM).toBeGreaterThan(1.28);
    expect(DEFAULT_ZOOM).toBeLessThanOrEqual(MAX_ZOOM);
  });

  it("persists and reloads zoom preference when storage is available", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
      },
    });

    persistCameraZoom(1.9);
    expect(store.get(CAMERA_ZOOM_STORAGE_KEY)).toBe("1.9");
    expect(loadPersistedCameraZoom(DEFAULT_ZOOM)).toBeCloseTo(1.9, 5);
    persistCameraZoom(0.2);
    expect(loadPersistedCameraZoom(DEFAULT_ZOOM)).toBe(MIN_ZOOM);
  });

  it("falls back safely without window", () => {
    expect(loadPersistedCameraZoom(DEFAULT_ZOOM)).toBe(DEFAULT_ZOOM);
    expect(() => persistCameraZoom(1.7)).not.toThrow();
  });
});
