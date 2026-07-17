"use client";

import Image from "next/image";
import { useState } from "react";
import {
  regionImageFallback,
  regionImagePath,
  worldCardPath,
} from "@/lib/assets/paths";

type RegionBannerProps = {
  slug: string;
  alt?: string;
};

/** Prefers worlds/{slug}/card.png, then legacy regions/{slug}.png, then SVG. */
export function RegionBanner({ slug, alt = "" }: RegionBannerProps) {
  const [src, setSrc] = useState(worldCardPath(slug));
  const legacy = regionImagePath(slug);
  const fallback = regionImageFallback(slug);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      unoptimized={src.endsWith(".svg")}
      onError={() => {
        if (src === worldCardPath(slug) && src !== legacy) setSrc(legacy);
        else if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}
