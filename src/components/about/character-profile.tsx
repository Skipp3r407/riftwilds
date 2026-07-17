"use client";

import type { CharacterProfile as CharacterProfileData } from "@/content/about/riftwilds-origin";
import { ComicPanel } from "@/components/about/comic-panel";
import { CinematicTextReveal } from "@/components/about/cinematic-text-reveal";
import { cn } from "@/lib/utils/cn";

type Props = {
  character: CharacterProfileData;
  className?: string;
};

export function CharacterProfile({ character, className }: Props) {
  return (
    <article
      className={cn("panel overflow-hidden", className)}
      aria-labelledby={`character-${character.id}`}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.1fr)]">
        <ComicPanel
          src={character.portrait.src}
          alt={character.portrait.alt}
          aspectClassName="aspect-[3/4]"
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="rounded-none border-0 border-b border-[rgba(61,231,255,0.18)] shadow-none lg:border-b-0 lg:border-r"
          dense
        />

        <div className="flex flex-col p-5 md:p-6">
          <CinematicTextReveal
            as="p"
            className="font-display text-xs uppercase tracking-[0.18em] text-[var(--cyan)]"
          >
            Character
          </CinematicTextReveal>
          <CinematicTextReveal
            as="h3"
            delay={0.04}
            className="font-display mt-2 text-xl text-white md:text-2xl"
          >
            <span id={`character-${character.id}`}>{character.name}</span>
          </CinematicTextReveal>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{character.role}</p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {character.traits.map((trait) => (
              <li
                key={trait}
                className="rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
              >
                {trait}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm leading-relaxed text-[var(--text)]">
            {character.background}
          </p>
          <p className="mt-3 text-xs text-[var(--text-dim)]">{character.visualNotes}</p>
          {character.mysteryNote ? (
            <p className="mt-3 border-l border-[var(--violet)] pl-3 text-sm text-[var(--violet)]">
              {character.mysteryNote}
            </p>
          ) : null}
        </div>
      </div>

      {character.panels?.length ? (
        <div className="grid gap-3 border-t border-[var(--stroke)] p-3 sm:grid-cols-2 md:p-4">
          {character.panels.map((panel, index) => (
            <ComicPanel
              key={panel.src}
              src={panel.src}
              alt={panel.alt}
              caption={panel.caption}
              kicker={`Panel ${String(index + 1).padStart(2, "0")}`}
              aspectClassName="aspect-[16/9]"
              sizes="(max-width: 768px) 100vw, 30vw"
              dense
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
