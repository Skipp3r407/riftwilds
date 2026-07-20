"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { isDevPlaceholderPath } from "@/lib/assets/paths";

type GameImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  showDevBadge?: boolean;
  priority?: boolean;
  /** Override native lazy/eager. Dense catalog pages should use eager + thumbs. */
  loading?: "lazy" | "eager";
  /** Force unoptimized (keeps PNG alpha reliable for inventory/shop thumbs). */
  unoptimized?: boolean;
  /** Stretch to parent; use inside an sized aspect-square well. */
  fill?: boolean;
  /** How the image fills its box when `fill` is true. Default contain (pets/icons). */
  objectFit?: "contain" | "cover";
  /** Passed to next/image when `fill` is true. */
  sizes?: string;
};

/**
 * Skip `/_next/image` for SVGs and pet portraits.
 * /creatures loads ~100 portraits; the optimizer stalls and leaves empty slots.
 * Keep optimization for item/ability icons so 1024px masters are resized to thumbs.
 */
function shouldSkipOptimizer(src: string, forced?: boolean): boolean {
  if (forced != null) return forced;
  const pathOnly = src.split("?")[0] ?? src;
  if (pathOnly.endsWith(".svg")) return true;
  return (
    pathOnly.startsWith("/assets/pets/") ||
    pathOnly.startsWith("/assets/placeholders/creature-")
  );
}

export function GameImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = "/assets/placeholders/creature-cindercub-icon.svg",
  showDevBadge = true,
  priority,
  loading,
  unoptimized,
  fill = false,
  objectFit = "contain",
  sizes,
}: GameImageProps) {
  const [current, setCurrent] = useState(src);
  const isPlaceholder = isDevPlaceholderPath(current);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const skipOpt = shouldSkipOptimizer(current, unoptimized);
  const loadMode = priority ? undefined : loading;
  const fitClass =
    objectFit === "cover"
      ? "object-cover object-center"
      : "object-contain object-center drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]";

  const onError = () => {
    const pathOnly = current.split("?")[0] ?? current;
    // plate webp → plate png → legacy webp → legacy png → master png → svg → placeholder
    if (pathOnly.endsWith(".plate.webp")) {
      setCurrent(pathOnly.replace(/\.plate\.webp$/i, ".plate.png"));
      return;
    }
    if (pathOnly.endsWith(".plate.png")) {
      setCurrent(pathOnly.replace(/\.plate\.png$/i, ".webp"));
      return;
    }
    if (pathOnly.endsWith(".webp")) {
      setCurrent(pathOnly.replace(/\.webp$/i, ".png"));
      return;
    }
    if (pathOnly.includes("/thumbs/") && pathOnly.endsWith(".png")) {
      const slug = pathOnly.split("/").pop()?.replace(/\.png$/i, "");
      if (slug) {
        setCurrent(`/assets/pets/${slug}.png`);
        return;
      }
    }
    const pngToSvg = pathOnly.replace(/\.png$/i, ".svg");
    if (pngToSvg !== pathOnly && !pathOnly.includes("/thumbs/")) {
      setCurrent(pngToSvg);
      return;
    }
    if (current !== fallbackSrc) setCurrent(fallbackSrc);
  };

  if (fill) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <Image
          src={current}
          alt={alt}
          fill
          sizes={sizes ?? "(max-width: 768px) 50vw, 220px"}
          priority={priority}
          loading={loadMode}
          unoptimized={skipOpt}
          className={fitClass}
          onError={onError}
        />
        {showDevBadge && isPlaceholder && process.env.NODE_ENV === "development" ? (
          <span className="absolute left-1 top-1 z-[1] rounded bg-[rgba(255,184,77,0.9)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1a1020]">
            Dev
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("relative inline-block max-h-full max-w-full", className)}
      style={{ width, height }}
    >
      <Image
        src={current}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loadMode}
        unoptimized={skipOpt}
        className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        onError={onError}
      />
      {showDevBadge && isPlaceholder && process.env.NODE_ENV === "development" ? (
        <span className="absolute left-1 top-1 rounded bg-[rgba(255,184,77,0.9)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1a1020]">
          Dev
        </span>
      ) : null}
    </div>
  );
}
