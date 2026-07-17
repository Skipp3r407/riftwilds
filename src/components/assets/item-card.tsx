"use client";

import { GameImage } from "@/components/assets/game-image";
import { cn } from "@/lib/utils/cn";

export type ItemCardProps = {
  slug: string;
  name: string;
  category: string;
  description?: string;
  className?: string;
};

export function ItemCard({ slug, name, category, description, className }: ItemCardProps) {
  const src = `/assets/placeholders/affinity-grove.svg`;
  return (
    <article className={cn("panel p-4", className)}>
      <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-[rgba(7,11,22,0.55)]">
        <GameImage src={src} alt={name} width={160} height={160} />
      </div>
      <h3 className="font-display text-base text-white">{name}</h3>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--amber)]">{category}</p>
      {description ? <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p> : null}
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">item-{slug}</p>
    </article>
  );
}
