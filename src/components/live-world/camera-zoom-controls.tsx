"use client";

import { useEffect, useState } from "react";
import type { LiveWorldBridge } from "@/game/live-world/bridge";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "@/game/live-world/systems/premium/camera-zoom";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  bridge: LiveWorldBridge;
};

export function LiveWorldCameraZoomControls({ bridge }: Props) {
  const [zoom, setZoom] = useState(() => bridge.cameraZoom.get());

  useEffect(() => bridge.cameraZoom.subscribe(setZoom), [bridge]);

  return (
    <div
      className="pointer-events-auto absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-xl border border-[var(--stroke)] bg-[rgba(8,12,22,0.72)] p-1 backdrop-blur-md md:bottom-14"
      aria-label="Camera zoom"
    >
      <button
        type="button"
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white hover:bg-white/10 disabled:opacity-35"
        aria-label="Zoom out"
        disabled={zoom <= MIN_ZOOM + 0.001}
        onClick={() => {
          playSfx("ui.click");
          bridge.queueZoomDelta(-ZOOM_STEP);
        }}
      >
        −
      </button>
      <span className="min-w-[2.75rem] text-center text-[10px] tabular-nums text-[var(--text-muted)]">
        {zoom.toFixed(1)}×
      </span>
      <button
        type="button"
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white hover:bg-white/10 disabled:opacity-35"
        aria-label="Zoom in"
        disabled={zoom >= MAX_ZOOM - 0.001}
        onClick={() => {
          playSfx("ui.click");
          bridge.queueZoomDelta(ZOOM_STEP);
        }}
      >
        +
      </button>
    </div>
  );
}
