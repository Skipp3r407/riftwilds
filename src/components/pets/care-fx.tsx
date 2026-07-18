"use client";

import { cn } from "@/lib/utils/cn";

/** Lightweight CSS particle bursts for care actions. */
export function CareFxOverlay({
  kind,
  active,
}: {
  kind: string | null;
  active: boolean;
}) {
  if (!active || !kind || kind === "none") return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
      aria-hidden
    >
      <div
        className={cn(
          "care-fx",
          kind === "feed" && "care-fx-feed",
          kind === "play" && "care-fx-play",
          kind === "clean" && "care-fx-clean",
          kind === "sleep" && "care-fx-sleep",
          kind === "heal" && "care-fx-heal",
          kind === "bond" && "care-fx-bond",
          kind === "train" && "care-fx-train",
        )}
      />
    </div>
  );
}
