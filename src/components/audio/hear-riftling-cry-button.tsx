"use client";

import { playRiftlingCry } from "@/lib/audio/riftling-cries";
import { cn } from "@/lib/utils/cn";

type Props = {
  speciesSlug: string;
  label?: string;
  className?: string;
  mood?: "cry" | "idle" | "happy";
};

/** Explicit user-triggered species vocalization (codex / collection). */
export function HearRiftlingCryButton({
  speciesSlug,
  label = "Hear cry",
  className,
  mood = "cry",
}: Props) {
  return (
    <button
      type="button"
      className={cn("btn-secondary focus-ring text-xs", className)}
      onClick={() =>
        playRiftlingCry(speciesSlug, { mood, force: true, ignoreReducedSound: true })
      }
    >
      {label}
    </button>
  );
}
