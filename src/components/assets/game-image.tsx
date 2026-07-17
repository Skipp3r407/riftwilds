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
  /** Force unoptimized (keeps PNG alpha reliable for inventory/shop thumbs). */
  unoptimized?: boolean;
};

export function GameImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = "/assets/placeholders/creature-cindercub-icon.svg",
  showDevBadge = true,
  priority,
  unoptimized,
}: GameImageProps) {
  const [current, setCurrent] = useState(src);
  const isPlaceholder = isDevPlaceholderPath(current);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <div className={cn("relative inline-block", className)} style={{ width, height }}>
      <Image
        src={current}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        unoptimized={unoptimized ?? current.endsWith(".svg")}
        className="h-full w-full object-contain"
        onError={() => {
          const pngToSvg = current.replace(/\.png(\?.*)?$/i, ".svg");
          if (pngToSvg !== current) {
            setCurrent(pngToSvg);
            return;
          }
          if (current !== fallbackSrc) setCurrent(fallbackSrc);
        }}
      />
      {showDevBadge && isPlaceholder && process.env.NODE_ENV === "development" ? (
        <span className="absolute left-1 top-1 rounded bg-[rgba(255,184,77,0.9)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#1a1020]">
          Dev
        </span>
      ) : null}
    </div>
  );
}
