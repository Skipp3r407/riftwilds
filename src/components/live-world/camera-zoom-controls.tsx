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
      className="lw-hud-zoom pointer-events-auto absolute bottom-3 right-3 z-20 md:bottom-14"
      aria-label="Camera zoom"
      data-testid="live-world-zoom-controls"
    >
      <button
        type="button"
        className="lw-hud-zoom__btn focus-ring"
        aria-label="Zoom out"
        disabled={zoom <= MIN_ZOOM + 0.001}
        onClick={() => {
          playSfx("ui.click");
          bridge.queueZoomDelta(-ZOOM_STEP);
        }}
      >
        −
      </button>
      <span className="lw-hud-zoom__value">{zoom.toFixed(1)}×</span>
      <button
        type="button"
        className="lw-hud-zoom__btn focus-ring"
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
