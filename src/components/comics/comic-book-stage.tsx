"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ComicHotspot, ComicPage } from "@/content/comics/types";
import { ComicPageView } from "@/components/comics/comic-page-view";
import { pageTurnMotion, stackThickness } from "@/lib/comics/page-turn";
import { cn } from "@/lib/utils/cn";

type Props = {
  page: number;
  totalPages: number;
  pages: ComicPage[];
  issueTitle: string;
  direction: 1 | -1 | 0;
  darkMode: boolean;
  highContrast?: boolean;
  zoom?: number;
  foundHotspots: string[];
  onHotspot: (hotspot: ComicHotspot) => void;
  coverOpen: boolean;
  coverSrc?: string;
  coverLabel?: string;
  onOpenCover: () => void;
  onEdgeNav?: (dir: 1 | -1) => void;
};

export function ComicBookStage({
  page,
  totalPages,
  pages,
  issueTitle,
  direction,
  darkMode,
  highContrast,
  zoom = 1,
  foundHotspots,
  onHotspot,
  coverOpen,
  coverSrc,
  coverLabel,
  onOpenCover,
  onEdgeNav,
}: Props) {
  const reduceMotionPref = useReducedMotion();
  const reduceMotion = Boolean(reduceMotionPref);
  const motionRecipe = pageTurnMotion(reduceMotion);
  const stacks = stackThickness(page, totalPages);
  const dir = direction === 0 ? 1 : direction;
  const duration = motionRecipe.durationMs / 1000;
  const ease = [...motionRecipe.ease] as [number, number, number, number];

  const leftPx = 2 + Math.round(stacks.left * 14);
  const rightPx = 2 + Math.round(stacks.right * 16);
  const showCover = !coverOpen && Boolean(coverSrc);
  const current = pages[page - 1];

  return (
    <div
      className={cn(
        "comic-book-lamp relative mx-auto w-full",
        darkMode ? "comic-book-lamp--night" : "comic-book-lamp--day",
      )}
    >
      <div className="comic-book-vignette pointer-events-none absolute inset-0" aria-hidden />

      <div
        className={cn(
          "comic-book relative mx-auto",
          coverOpen ? "comic-book--open" : "comic-book--closed",
        )}
      >
        {/* Decorative leather book frame */}
        <div className="comic-book-frame" aria-hidden />
        <div className="comic-book-spine" aria-hidden />

        <div
          className="comic-book-stack comic-book-stack--left"
          style={{ width: leftPx }}
          aria-hidden
        />
        <div
          className="comic-book-stack comic-book-stack--right"
          style={{ width: rightPx }}
          aria-hidden
        />

        <div
          className="comic-book-pages relative z-[3] grid h-full"
          style={{ perspective: reduceMotion ? undefined : 1600 }}
        >
          <AnimatePresence initial={false}>
            {showCover ? (
              <motion.button
                key="cover"
                type="button"
                className="comic-book-cover focus-ring group relative z-[5] col-start-1 row-start-1 h-full w-full overflow-hidden text-left"
                onClick={onOpenCover}
                aria-label={`Open cover: ${coverLabel ?? issueTitle}`}
                style={{
                  transformOrigin: "left center",
                  transformStyle: reduceMotion ? undefined : "preserve-3d",
                }}
                initial={false}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { rotateY: -105, opacity: 0.35, x: -24, scale: 0.98 }
                }
                transition={{ duration: reduceMotion ? 0.22 : 0.7, ease }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={coverSrc!}
                    alt={coverLabel ?? `${issueTitle} cover`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, min(640px, 70vh)"
                    unoptimized
                    priority
                  />
                  <div className="comic-book-cover-sheen absolute inset-0" aria-hidden />
                </div>
                <span className="comic-book-cover-cta absolute inset-x-0 bottom-0 px-4 py-4 text-center font-display text-sm tracking-wide text-[#e8d5b0]">
                  Tap to open · or press Next
                </span>
              </motion.button>
            ) : (
              current && (
                <motion.div
                  key={`page-${current.pageNumber}`}
                  custom={dir}
                  className="comic-book-leaf col-start-1 row-start-1 h-full w-full"
                  style={{
                    transformOrigin: dir > 0 ? "left center" : "right center",
                    transformStyle: reduceMotion ? undefined : "preserve-3d",
                    zIndex: 3,
                  }}
                  initial={
                    motionRecipe.mode === "crossfade"
                      ? { opacity: 0 }
                      : {
                          opacity: 0.75,
                          rotateY: dir > 0 ? 86 : -86,
                          x: dir > 0 ? 40 : -40,
                          scale: 0.98,
                          filter: "brightness(0.92)",
                        }
                  }
                  animate={
                    motionRecipe.mode === "crossfade"
                      ? { opacity: 1 }
                      : {
                          opacity: 1,
                          rotateY: 0,
                          x: 0,
                          scale: 1,
                          filter: "brightness(1)",
                        }
                  }
                  exit={
                    motionRecipe.mode === "crossfade"
                      ? { opacity: 0, zIndex: 4 }
                      : {
                          opacity: 0.4,
                          rotateY: dir > 0 ? -95 : 95,
                          x: dir > 0 ? -48 : 48,
                          scale: 0.97,
                          filter: "brightness(0.85)",
                          zIndex: 4,
                        }
                  }
                  transition={{ duration, ease }}
                >
                  <div className="comic-book-leaf-shadow" aria-hidden />
                  <div className="comic-book-curl" aria-hidden />
                  <ComicPageView
                    page={current}
                    issueTitle={issueTitle}
                    highContrast={highContrast}
                    darkMode={darkMode}
                    foundHotspots={foundHotspots}
                    onHotspot={onHotspot}
                    zoom={zoom}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>

          {coverOpen && onEdgeNav && (
            <>
              <button
                type="button"
                className="absolute inset-y-0 left-0 z-[6] w-[9%] cursor-w-resize bg-transparent"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => onEdgeNav(-1)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 z-[6] w-[9%] cursor-e-resize bg-transparent"
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => onEdgeNav(1)}
              />
            </>
          )}
        </div>
      </div>

      <p className="comic-book-leaf-label mt-1.5 text-center text-[11px] tracking-wide text-[rgba(232,213,176,0.55)]">
        {coverOpen ? `Leaf ${page} of ${totalPages}` : "Cover closed — open to begin"}
      </p>
    </div>
  );
}
