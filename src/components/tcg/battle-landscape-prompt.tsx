"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import {
  dismissLandscapePrompt,
  shouldShowLandscapePrompt,
  type BattleViewportClass,
} from "@/lib/tcg/battle-viewport";
import { cn } from "@/lib/utils/cn";

/**
 * Soft landscape recommendation on phone-portrait battle start.
 * Never forces orientation — dismiss for session or permanently.
 */
export function BattleLandscapePrompt({
  viewport,
  active,
}: {
  viewport: BattleViewportClass;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      setOpen(false);
      return;
    }
    setOpen(shouldShowLandscapePrompt(viewport));
  }, [active, viewport]);

  if (!open || !active) return null;

  return (
    <div
      className="battle-landscape-prompt"
      role="status"
      aria-live="polite"
      aria-label="Landscape recommended"
    >
      <div className="battle-landscape-prompt__card">
        <Smartphone className="battle-landscape-prompt__icon" aria-hidden />
        <div className="battle-landscape-prompt__copy">
          <p className="battle-landscape-prompt__title">Landscape recommended</p>
          <p className="battle-landscape-prompt__body">
            Rotate for the preferred mobile battle layout — enemy, board, hand, and
            actions without scrolling. Portrait still works.
          </p>
        </div>
        <div className="battle-landscape-prompt__actions">
          <button
            type="button"
            className="battle-landscape-prompt__btn focus-ring"
            onClick={() => {
              dismissLandscapePrompt(false);
              setOpen(false);
            }}
          >
            Got it
          </button>
          <button
            type="button"
            className={cn(
              "battle-landscape-prompt__btn battle-landscape-prompt__btn--ghost focus-ring",
            )}
            onClick={() => {
              dismissLandscapePrompt(true);
              setOpen(false);
            }}
          >
            Don&apos;t show again
          </button>
        </div>
        <button
          type="button"
          className="battle-landscape-prompt__close focus-ring"
          aria-label="Dismiss"
          onClick={() => {
            dismissLandscapePrompt(false);
            setOpen(false);
          }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
