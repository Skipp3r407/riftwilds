"use client";

import type { ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { describeFullscreenLabel } from "@/game/live-world/systems/immersive/fullscreen";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  active: boolean;
  onToggle: () => void;
  className?: string;
  compact?: boolean;
  /** Icon-only control with tooltip (preferred for chrome density). */
  iconOnly?: boolean;
  icon?: ReactNode;
};

export function FullscreenToggleButton({
  active,
  onToggle,
  className = "",
  compact,
  iconOnly,
  icon,
}: Props) {
  const label = describeFullscreenLabel(active);
  const resolvedIcon =
    icon ??
    (active ? (
      <Minimize2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ) : (
      <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
    ));

  return (
    <button
      type="button"
      data-testid="fullscreen-toggle"
      aria-pressed={active}
      aria-label={label}
      title={`${label} (F / Alt+Enter)`}
      className={
        className ||
        "btn-secondary focus-ring pointer-events-auto text-xs"
      }
      onClick={() => {
        playSfx("ui.click");
        onToggle();
      }}
    >
      {resolvedIcon}
      {iconOnly ? null : compact ? (active ? "Exit FS" : "Fullscreen") : label}
    </button>
  );
}
