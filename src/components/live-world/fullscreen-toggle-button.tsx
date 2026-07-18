"use client";

import type { ReactNode } from "react";
import { describeFullscreenLabel } from "@/game/live-world/systems/immersive/fullscreen";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  active: boolean;
  onToggle: () => void;
  className?: string;
  compact?: boolean;
  icon?: ReactNode;
};

export function FullscreenToggleButton({
  active,
  onToggle,
  className = "",
  compact,
  icon,
}: Props) {
  const label = describeFullscreenLabel(active);
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
      {icon}
      {compact ? (active ? "Exit FS" : "Fullscreen") : label}
    </button>
  );
}
