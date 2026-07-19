/**
 * Centralized Framer Motion presets for Riftwilds AAA UI.
 * Always pair with `useReducedMotion()` — return `undefined` / skip when reduced.
 */

export const riftEase = [0.22, 1, 0.36, 1] as const;

export const riftFadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.35, ease: riftEase },
};

export const riftFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.28, ease: riftEase },
};

export const riftScaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 320, damping: 26 },
};

export const riftStagger = {
  animate: {
    transition: { staggerChildren: 0.045, delayChildren: 0.04 },
  },
};

export const riftCardHover = {
  y: -6,
  rotateX: 4,
  rotateY: -3,
  scale: 1.02,
};

export const riftCardTap = { scale: 0.98 };

export const riftModalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, pointerEvents: "auto" as const },
  // Drop hit-testing while fading out so an invisible scrim cannot swallow clicks.
  exit: { opacity: 0, pointerEvents: "none" as const },
  transition: { duration: 0.2 },
};

export const riftModalPanel = {
  initial: { opacity: 0, y: 28, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 280, damping: 28 },
};
