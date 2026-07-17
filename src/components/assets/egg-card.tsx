"use client";

import { GameImage } from "@/components/assets/game-image";
import { eggFullPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

export type EggCardProps = {
  eggClass: string;
  name: string;
  description?: string;
  className?: string;
};

export function EggCard({ eggClass, name, description, className }: EggCardProps) {
  return (
    <article className={cn("panel p-4", className)}>
      <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-[rgba(7,11,22,0.55)]">
        <GameImage
          src={eggFullPath(eggClass)}
          alt={`${name} illustration`}
          width={200}
          height={200}
          fallbackSrc={eggFullPath(eggClass, true)}
          showDevBadge={false}
          className="egg-wobble"
        />
      </div>
      <h3 className="font-display text-base text-white">{name}</h3>
      {description ? <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p> : null}
    </article>
  );
}
