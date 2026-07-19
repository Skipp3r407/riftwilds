"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { riftEase } from "@/components/ui/rift-motion";

export type RiftPageMood =
  | "library"
  | "atelier"
  | "battle"
  | "merchant"
  | "hearth"
  | "default";

export type RiftPageShellProps = {
  mood?: RiftPageMood;
  className?: string;
  /** Optional max-width utility class; default max-w-6xl */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Animated screen atmosphere + content column for game routes.
 * Particles are CSS-only; disabled under prefers-reduced-motion.
 */
export function RiftPageShell({
  mood = "default",
  className,
  wide = false,
  children,
}: RiftPageShellProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "rift-page relative mx-auto w-full px-4 py-8",
        wide ? "max-w-[1400px]" : "max-w-6xl",
        `rift-page--${mood}`,
        className,
      )}
    >
      <div className="rift-page__atmosphere" aria-hidden>
        <div className="rift-page__wash" />
        <div className="rift-page__vignette" />
        {!reduce ? <div className="rift-page__motes" /> : null}
      </div>
      {reduce ? (
        <div className="rift-page__body relative z-[1]">{children}</div>
      ) : (
        <motion.div
          className="rift-page__body relative z-[1]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: riftEase }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
