"use client";

import Link from "next/link";
import { GameImage } from "@/components/assets/game-image";
import { creatureIconPath, creatureProfilePath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

export type CreatureCardProps = {
  slug: string;
  name: string;
  affinity: string;
  rarity?: string;
  habitat?: string;
  lore?: string;
  temperament?: string;
  signatureAbility?: string;
  signatureTrait?: string;
  href?: string;
  className?: string;
};

export function CreatureCard({
  slug,
  name,
  affinity,
  rarity = "Common",
  habitat,
  lore,
  temperament,
  signatureAbility,
  signatureTrait,
  href = `/creatures#${slug}`,
  className,
}: CreatureCardProps) {
  return (
    <article className={cn("panel overflow-hidden p-4", className)}>
      <div className="relative mb-3 flex aspect-square items-center justify-center rounded-xl bg-[rgba(7,11,22,0.55)]">
        <GameImage
          src={creatureProfilePath(slug)}
          alt={`${name} profile artwork`}
          width={280}
          height={280}
          fallbackSrc={creatureIconPath(slug, true)}
          showDevBadge={false}
        />
      </div>
      <h3 className="font-display text-lg text-white">{name}</h3>
      <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
        {affinity}
        {rarity ? ` · ${rarity}` : null}
        {temperament ? ` · ${temperament}` : null}
        {habitat ? ` · ${habitat}` : null}
      </p>
      {lore ? <p className="mt-3 text-sm text-[var(--text-muted)]">{lore}</p> : null}
      {signatureAbility || signatureTrait ? (
        <ul className="mt-3 space-y-1 text-xs text-[var(--text-muted)]">
          {signatureAbility ? (
            <li>
              <span className="text-[var(--cyan)]">Ability</span> · {signatureAbility}
            </li>
          ) : null}
          {signatureTrait ? (
            <li>
              <span className="text-[var(--amber)]">Trait</span> · {signatureTrait}
            </li>
          ) : null}
        </ul>
      ) : null}
      <Link href={href} className="mt-4 inline-block text-sm text-[var(--cyan)]">
        View details
      </Link>
    </article>
  );
}
