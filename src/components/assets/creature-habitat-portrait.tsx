"use client";

import { GameImage } from "@/components/assets/game-image";
import {
  creatureIconPath,
  creatureProfilePath,
  habitatBackgroundFallback,
  habitatBackgroundPath,
} from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";
import { habitatRegionSlug } from "@/lib/world/region-slugs";

type CreatureHabitatPortraitProps = {
  speciesSlug: string;
  speciesName: string;
  nativeRegion?: string;
  affinity?: string;
  /** Card grid uses 4/3; detail header uses square. */
  aspect?: "card" | "square";
  className?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
};

/**
 * Creature portrait seated in a painted habitat plate for its native region.
 * Environment is decorative; portrait stays the subject with a soft scrim.
 *
 * Layout contract:
 * - Outer frame owns border/ring (never clipped).
 * - Inner well owns aspect-ratio + overflow (images cannot grow the card).
 * - Habitat is slightly oversized to hide subpixel cover seams.
 */
export function CreatureHabitatPortrait({
  speciesSlug,
  speciesName,
  nativeRegion,
  affinity,
  aspect = "card",
  className,
  loading = "eager",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: CreatureHabitatPortraitProps) {
  const regionSlug = habitatRegionSlug(nativeRegion, affinity);

  return (
    <div
      className={cn(
        "relative w-full shrink-0 rounded-xl border border-[rgba(148,197,255,0.14)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[11px]",
          aspect === "square" ? "aspect-square" : "aspect-[4/3]",
        )}
      >
        {/* Oversized cover plate — kills 1px left/right seams from object-cover. */}
        <div className="absolute -inset-[2px]" aria-hidden>
          <GameImage
            src={habitatBackgroundPath(regionSlug)}
            alt=""
            width={768}
            height={aspect === "square" ? 768 : 576}
            fill
            objectFit="cover"
            sizes={sizes}
            loading={loading}
            fallbackSrc={habitatBackgroundFallback(regionSlug)}
            showDevBadge={false}
            className="scale-[1.04]"
          />
        </div>

        {/* Soft lift so dark cutouts (Veilhare, Voidling, etc.) stay readable. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(220,236,255,0.32)_0%,rgba(140,180,220,0.12)_45%,transparent_74%)]"
        />

        {/* Lighter vignette than before — heavy scrims washed out frost/void subjects. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(8,12,24,0.04)_0%,rgba(8,12,24,0.28)_78%,rgba(6,8,16,0.5)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(6,8,16,0.55)] to-transparent"
        />

        {/* Subject well: fixed to the aspect box; tall silhouettes use contain. */}
        <div className="absolute inset-0 z-[1] flex items-center justify-center p-[7%]">
          <div className="relative h-full w-full">
            <GameImage
              src={creatureProfilePath(speciesSlug)}
              alt={`${speciesName} artwork`}
              width={384}
              height={384}
              fill
              objectFit="contain"
              sizes={sizes}
              loading={loading}
              fallbackSrc={creatureIconPath(speciesSlug, true)}
              showDevBadge={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
