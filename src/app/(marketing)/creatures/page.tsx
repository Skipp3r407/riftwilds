import Link from "next/link";
import { GameImage } from "@/components/assets/game-image";
import { SpeciesKitPanel } from "@/components/creatures/species-kit-panel";
import { SectionTitleBand } from "@/components/shared/page-header";
import { getSpeciesLore } from "@/content/pets/lore";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { creatureIconPath, creatureProfilePath } from "@/lib/assets/paths";

export const metadata = { title: "Creatures" };

export default function CreaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="creatures" label="Riftlings" kicker="Codex" />
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        {LAUNCH_SPECIES.length} launch species across ten affinities — each with unique base stats,
        signature abilities, traits, and full lore. Collect, care for, and battle original Riftwilds
        IP.
      </p>
      <p className="mt-2">
        <Link href="/codex/riftlings" className="text-sm text-[var(--cyan)] hover:underline">
          Open the Riftling Codex →
        </Link>
      </p>
      <div className="mt-8 grid gap-6">
        {LAUNCH_SPECIES.map((sp) => (
          <article key={sp.slug} id={sp.slug} className="panel overflow-hidden p-4 md:p-6">
            <div className="relative z-[1] grid gap-6 md:grid-cols-[200px_1fr]">
              <div>
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_42%,rgba(90,110,150,0.38),rgba(14,18,32,0.92)_72%)] ring-1 ring-[rgba(148,197,255,0.14)]">
                  <GameImage
                    src={creatureProfilePath(sp.slug)}
                    alt={`${sp.name} profile artwork`}
                    width={384}
                    height={384}
                    fill
                    loading="eager"
                    fallbackSrc={creatureIconPath(sp.slug, true)}
                    showDevBadge={false}
                  />
                </div>
                <h2 className="font-display text-2xl text-white">{sp.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  {sp.affinity} · {sp.rarityBias} · {sp.temperament}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {sp.habitat} · {sp.bodyType.replaceAll("_", " ")}
                </p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  {getSpeciesLore(sp.slug)?.shortBio ?? sp.description}
                </p>
                <Link
                  href={`/codex/riftlings/${sp.slug}`}
                  className="mt-3 inline-block text-xs text-[var(--cyan)] hover:underline"
                >
                  Full lore
                </Link>
              </div>
              <SpeciesKitPanel
                baseStats={sp.baseStats}
                abilities={sp.abilities}
                traits={sp.traits}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
