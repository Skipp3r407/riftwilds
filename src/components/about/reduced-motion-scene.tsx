import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Static full-bleed scene for prefers-reduced-motion / Skip Intro fallbacks.
 * No parallax, no Ken Burns — just a readable cinematic still.
 */
export function ReducedMotionScene({ src, alt, className, priority }: Props) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(4,6,14,0.92)] via-[rgba(4,6,14,0.55)] to-[rgba(4,6,14,0.28)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(4,6,14,0.78)] via-[rgba(4,6,14,0.35)] to-transparent md:from-[rgba(4,6,14,0.72)] md:via-[rgba(4,6,14,0.28)]"
        aria-hidden
      />
    </div>
  );
}
