/**
 * Comic reader page-turn motion helpers (pure — unit-tested).
 */

export type FlipDirection = 1 | -1 | 0;

export type PageTurnMotion = {
  mode: "flip" | "crossfade";
  durationMs: number;
  /** CSS / Framer cubic-bezier */
  ease: readonly [number, number, number, number];
};

/** Direction of a turn: forward (next) = 1, back = -1. */
export function flipDirection(fromPage: number, toPage: number): FlipDirection {
  if (toPage > fromPage) return 1;
  if (toPage < fromPage) return -1;
  return 0;
}

/**
 * Motion recipe. Reduced-motion users get a short crossfade;
 * everyone else gets a resistant flip that settles.
 */
export function pageTurnMotion(reduceMotion: boolean): PageTurnMotion {
  if (reduceMotion) {
    return {
      mode: "crossfade",
      durationMs: 220,
      ease: [0.4, 0, 0.2, 1],
    };
  }
  return {
    mode: "flip",
    /** Slight resistance then settle */
    durationMs: 640,
    ease: [0.65, 0.05, 0.36, 1],
  };
}

/** How thick the left (read) / right (remaining) page stacks look, 0–1. */
export function stackThickness(
  page: number,
  totalPages: number,
): { left: number; right: number } {
  if (totalPages <= 1) return { left: 0, right: 0 };
  const t = Math.max(0, Math.min(1, (page - 1) / (totalPages - 1)));
  return { left: t, right: 1 - t };
}

/** Cover intro should play when opening an issue on page 1. */
export function shouldOfferCoverIntro(page: number, coverAlreadyOpened: boolean): boolean {
  return page === 1 && !coverAlreadyOpened;
}
