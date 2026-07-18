/**
 * Live World host / canvas wrap layout for windowed vs expanded (FS / viewport-expand).
 * Kept pure so unit tests can assert non-zero playable sizing contracts.
 */

export type LiveWorldDisplayLayout = {
  hostClass: string;
  canvasWrapClass: string;
};

const WORLD_BG = "bg-[#0a101c]";

/**
 * Host must NOT use `.panel` (backdrop-filter / isolation) — that compositing path
 * blacks out the WebGL canvas under Fullscreen API in Chromium.
 */
export function resolveLiveWorldDisplayLayout(expanded: boolean): LiveWorldDisplayLayout {
  if (expanded) {
    return {
      hostClass: `fixed inset-0 z-[80] flex h-dvh max-h-dvh w-screen flex-col overflow-hidden ${WORLD_BG}`,
      canvasWrapClass: `relative min-h-0 w-full flex-1 ${WORLD_BG}`,
    };
  }
  return {
    hostClass: `relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--stroke)] ${WORLD_BG}`,
    canvasWrapClass: `relative h-[min(72vh,720px)] min-h-[420px] w-full ${WORLD_BG}`,
  };
}

export type ContentSize = { width: number; height: number };

/** Minimum playable Phaser parent size (avoids 0×0 RESIZE collapse). */
export const MIN_PLAYABLE_VIEWPORT = 64;

export function readElementContentSize(el: Pick<Element, "getBoundingClientRect"> | null): ContentSize {
  if (!el) return { width: 0, height: 0 };
  const rect = el.getBoundingClientRect();
  return {
    width: Math.max(0, Math.round(rect.width)),
    height: Math.max(0, Math.round(rect.height)),
  };
}

export function hasPlayableViewportSize(size: ContentSize): boolean {
  return size.width >= MIN_PLAYABLE_VIEWPORT && size.height >= MIN_PLAYABLE_VIEWPORT;
}

/** Double-rAF: wait until after style/layout commits (e.g. before requestFullscreen). */
export function waitForNextLayout(): Promise<void> {
  if (typeof requestAnimationFrame === "undefined") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
