"use client";

import type { ReactNode } from "react";
import { useImmersiveSettings } from "@/hooks/use-immersive-settings";
import { useFloatingHudChipFade } from "@/hooks/use-floating-hud-chip-fade";

type Props = {
  children: ReactNode;
  className?: string;
  /** Bumps full opacity when this value changes (new interact target, weather, etc.). */
  activityKey?: string | number | boolean | null;
  testId?: string;
};

/**
 * Hit-slop wrapper that fades floating HUD chips after idle, then restores on
 * hover / focus / tap. Keeps pointer-events so faded chips remain discoverable.
 */
export function FloatingHudChip({ children, className = "", activityKey, testId }: Props) {
  const { settings } = useImmersiveSettings();
  const fade = useFloatingHudChipFade(settings, activityKey);

  return (
    <div
      className={`pointer-events-auto ${className}`}
      data-testid={testId}
      data-floating-hud-chip
      data-chip-faded={fade.opacity < 0.5 ? "1" : "0"}
      style={{
        opacity: fade.opacity,
        transition: fade.transition,
        // Extra padding so a near-invisible chip still has a hover target.
        padding: "6px",
        margin: "-6px",
      }}
      onPointerEnter={fade.onPointerEnter}
      onPointerLeave={fade.onPointerLeave}
      onFocusCapture={fade.onFocusCapture}
      onBlurCapture={fade.onBlurCapture}
      onPointerDown={fade.onPointerDown}
    >
      {children}
    </div>
  );
}
