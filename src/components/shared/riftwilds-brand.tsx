"use client";

import Image from "next/image";
import { brandMarkPath, brandWordmarkPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  /** Hide wordmark (mobile / mid breakpoints handle this via CSS too). */
  wordmark?: boolean;
};

/**
 * Header brand lockup — enhanced Theme4 mark + wordmark with subtle idle energy.
 * Prefers PNG masters for AAA texture; animation is CSS filter/opacity only.
 */
export function RiftwildsBrand({
  className,
  markClassName,
  wordmarkClassName,
  wordmark = true,
}: Props) {
  return (
    <span className={cn("rw-brand flex items-center gap-1.5 md:gap-2", className)}>
      <span className="rw-brand__mark-wrap" aria-hidden="true">
        <Image
          src={brandMarkPath}
          alt=""
          width={512}
          height={512}
          priority
          unoptimized
          className={cn("hud-nav__brand-mark rw-brand__mark", markClassName)}
        />
        <span className="rw-brand__rift-flicker" />
        <span className="rw-brand__core-pulse" />
      </span>
      {wordmark ? (
        <Image
          src={brandWordmarkPath}
          alt="Riftwilds"
          width={491}
          height={140}
          priority
          unoptimized
          className={cn("hud-nav__brand-wordmark rw-brand__wordmark", wordmarkClassName)}
        />
      ) : null}
    </span>
  );
}
