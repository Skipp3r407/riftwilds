"use client";

import type { ReactNode } from "react";
import type { ImmersiveSettings } from "@/game/live-world/systems/immersive/types";
import { prefersReducedMotion } from "@/game/live-world/systems/immersive/settings";

type Props = {
  children: ReactNode;
  opacity: number;
  visible?: boolean;
  settings: ImmersiveSettings;
  className?: string;
  /** Keep pointer events even when faded (e.g. reveal edge) */
  keepInteractive?: boolean;
};

export function HudLayer({
  children,
  opacity,
  visible = true,
  settings,
  className = "",
  keepInteractive,
}: Props) {
  if (!visible && opacity <= 0.01) {
    return keepInteractive ? (
      <div className={`pointer-events-auto ${className}`} style={{ opacity: 0.001 }}>
        {children}
      </div>
    ) : null;
  }

  const reduced = prefersReducedMotion(settings);
  const scale = settings.largeUi ? 1.12 : 1;
  const contrast = settings.highContrast
    ? "contrast-125 brightness-110"
    : "";

  return (
    <div
      className={`${contrast} ${className}`}
      data-hud-layer
      data-large-ui={settings.largeUi ? "1" : "0"}
      data-high-contrast={settings.highContrast ? "1" : "0"}
      style={{
        opacity,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        transition: reduced ? undefined : "opacity 280ms ease",
        pointerEvents: opacity < 0.05 && !keepInteractive ? "none" : undefined,
      }}
    >
      {children}
    </div>
  );
}
