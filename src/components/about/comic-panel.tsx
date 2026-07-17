"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type ComicPanelProps = {
  src: string;
  alt: string;
  /** HTML caption under the art — never baked into the image */
  caption?: string;
  /** Optional kicker above caption (e.g. panel number) */
  kicker?: string;
  aspectClassName?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Tighter inset for dense grids */
  dense?: boolean;
};

/**
 * Graphic-novel frame: cyan/amber gutter border, navy scrim, caption in HTML.
 * Hover scale is disabled when prefers-reduced-motion is set.
 */
export function ComicPanel({
  src,
  alt,
  caption,
  kicker,
  aspectClassName = "aspect-[4/3]",
  priority,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className,
  dense,
}: ComicPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <figure
      className={cn(
        "comic-panel relative overflow-hidden rounded-[var(--radius-lg)]",
        "border border-[rgba(61,231,255,0.22)] bg-[rgba(6,8,14,0.72)]",
        "shadow-[inset_0_0_0_1px_rgba(255,184,77,0.08),0_8px_28px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[rgba(0,0,0,0.4)]",
          aspectClassName,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className={cn(
            "object-cover object-center",
            !reduceMotion && "transition-transform duration-700 ease-out hover:scale-[1.03]",
          )}
        />
        <div
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(61,231,255,0.12)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[rgba(6,8,14,0.55)] to-transparent"
          aria-hidden
        />
      </div>
      {kicker || caption ? (
        <figcaption className={cn(dense ? "px-3 py-2.5" : "px-4 py-3")}>
          {kicker ? (
            <p className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-[var(--cyan)]">
              {kicker}
            </p>
          ) : null}
          {caption ? (
            <p
              className={cn(
                "text-sm leading-relaxed text-[var(--text-muted)]",
                kicker && "mt-1",
              )}
            >
              {caption}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
