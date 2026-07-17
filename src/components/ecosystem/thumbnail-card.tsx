import Image from "next/image";
import type { ReactNode } from "react";

type ThumbnailCardProps = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
  priority?: boolean;
};

/** Full-bleed cinematic card background with a dark scrim for readable text. */
export function ThumbnailCard({
  imageSrc,
  imageAlt,
  children,
  className = "",
  priority = false,
}: ThumbnailCardProps) {
  return (
    <li
      className={`relative min-h-[5.5rem] overflow-hidden rounded-md border border-[var(--stroke)] ${className}`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
        priority={priority}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.92)] via-[rgba(6,12,24,0.78)] to-[rgba(6,12,24,0.45)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.88)] via-transparent to-[rgba(6,12,24,0.35)]"
        aria-hidden
      />
      <div className="relative z-10 px-3 py-2.5">{children}</div>
    </li>
  );
}
