"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { playSfx } from "@/hooks/use-sfx";

type Props = {
  open: boolean;
  familyTitle: string;
  affinity: string;
  onDone: () => void;
};

/** First-open discovery cinematic shell (short, skippable). */
export function CodexDiscoveryBanner({
  open,
  familyTitle,
  affinity,
  onDone,
}: Props) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) playSfx("codex.discover");
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="codex-discovery"
          role="dialog"
          aria-label="Species discovery"
          data-audio-cue="codex.discovery.reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
        >
          <motion.div
            className="codex-discovery__plate"
            initial={reduceMotion ? false : { scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { scale: 0.96, opacity: 0 }}
          >
            <p className="codex-discovery__eyebrow">Codex discovery · {affinity}</p>
            <h2 className="codex-discovery__title">{familyTitle}</h2>
            <p className="codex-discovery__body">
              A new bond-line page unfolds in the Rift Codex. Silhouettes wait
              where memory has not yet been drawn into your binder.
            </p>
            <button
              type="button"
              className="codex-discovery__cta"
              onClick={() => {
                playSfx("codex.page_turn");
                onDone();
              }}
              data-audio-cue="codex.ui.confirm"
            >
              Turn the page
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
