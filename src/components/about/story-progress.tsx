"use client";

import { motion, useReducedMotion, useScroll } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

export function StoryProgress({ className }: Props) {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none fixed left-0 right-0 top-0 z-[60] h-0.5 bg-[rgba(255,255,255,0.06)]",
        className,
      )}
      role="progressbar"
      aria-label="Story scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {reduceMotion ? (
        <div className="h-full w-0 bg-[var(--cyan)]" />
      ) : (
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[var(--cyan)] via-[var(--violet)] to-[var(--amber)]"
          style={{ scaleX: scrollYProgress }}
        />
      )}
    </div>
  );
}
