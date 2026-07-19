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
        "relative overflow-hidden rounded-xl ring-1 ring-[rgba(148,197,255,0.14)]",
        aspect === "square" ? "aspect-square" : "aspect-[4/3]",
        className,
      )}
    >
      <div className="absolute inset-0" aria-hidden>
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
        />
      </div>
      {/* Atmospheric vignette so busy scenery doesn't flatten the portrait. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(8,12,24,0.12)_0%,rgba(8,12,24,0.55)_78%,rgba(6,8,16,0.82)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgba(6,8,16,0.72)] to-transparent"
      />
      <div className="absolute inset-0 z-[1] flex items-center justify-center p-[6%]">
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
  );
}
