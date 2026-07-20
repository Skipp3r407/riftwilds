import Link from "next/link";
import { notFound } from "next/navigation";
import { HearRiftlingCryButton } from "@/components/audio/hear-riftling-cry-button";
import { CreatureHabitatPortrait } from "@/components/assets/creature-habitat-portrait";
import { SpeciesKitPanel } from "@/components/creatures/species-kit-panel";
import { getSpeciesLore, SPECIES_LORE_SLUGS } from "@/content/pets/lore";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";

type Props = { params: Promise<{ speciesSlug: string }> };

export function generateStaticParams() {
  return SPECIES_LORE_SLUGS.map((speciesSlug) => ({ speciesSlug }));
}

export async function generateMetadata({ params }: Props) {
  const { speciesSlug } = await params;
  const lore = getSpeciesLore(speciesSlug);
  return { title: lore ? `${lore.name} · Codex` : "Riftling Codex" };
}

export default async function RiftlingCodexSpeciesPage({ params }: Props) {
  const { speciesSlug } = await params;
  const lore = getSpeciesLore(speciesSlug);
  if (!lore) notFound();
  const species = getSpeciesBySlug(speciesSlug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link
        href="/codex/riftlings"
        className="text-xs uppercase tracking-wider text-[var(--cyan)] hover:underline"
      >
        ← Riftling Codex
      </Link>

      <header className="panel mt-4 p-6">
        <div className="relative z-[1] grid gap-6 md:grid-cols-[220px_1fr]">
          <CreatureHabitatPortrait
            speciesSlug={lore.slug}
            speciesName={lore.name}
            nativeRegion={lore.nativeRegion}
            affinity={lore.affinity}
            aspect="square"
            sizes="220px"
            className="relative z-[1] w-full shrink-0"
          />
          <div className="relative z-[1] min-w-0">
            <p className="page-kicker">{lore.affinity}</p>
            <h1 className="page-title mt-2">{lore.name || lore.slug}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {lore.title} · {lore.pronunciation}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-[var(--mint)]">
              {lore.nativeRegion}
              {lore.secondaryHabitats.length
                ? ` · also ${lore.secondaryHabitats.join(", ")}`
                : ""}
            </p>
            {lore.shortBio ? (
              <p className="mt-4 text-sm leading-relaxed text-white/90">{lore.shortBio}</p>
            ) : null}
            <div className="mt-4">
              <HearRiftlingCryButton speciesSlug={lore.slug} label="Hear signature cry" />
            </div>
          </div>
        </div>
      </header>

      <section className="panel mt-4 p-6">
        <h2 className="font-display text-lg text-white">Standard biography</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{lore.standardBio}</p>
      </section>

      <section className="panel mt-4 p-6">
        <h2 className="font-display text-lg text-white">Full lore</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
          {lore.fullLore}
        </p>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-display text-base text-white">Ecology</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">Behavior</dt>
              <dd className="text-white">{lore.naturalBehavior}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Social</dt>
              <dd className="text-white">{lore.socialBehavior}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Diet</dt>
              <dd className="text-white">{lore.favoriteFoods.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Egg</dt>
              <dd className="text-white">{lore.eggAppearance}</dd>
            </div>
          </dl>
        </div>
        <div className="panel p-5">
          <h3 className="font-display text-base text-white">Culture & myth</h3>
          <p className="mt-3 text-sm text-white/90">{lore.ancientLegend}</p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">{lore.commonMisunderstanding}</p>
          <p className="mt-4 rounded-md border border-dashed border-[var(--stroke)] px-3 py-2 text-xs text-[var(--text-muted)]">
            Hidden truth locked — spoiler protection until unlocked in play.
          </p>
        </div>
      </section>

      <section className="panel mt-4 p-6">
        <h2 className="font-display text-lg text-white">Historical timeline</h2>
        <ol className="mt-3 space-y-2 text-sm">
          {lore.historicalTimeline.map((row) => (
            <li key={row.era} className="panel-inset px-3 py-2">
              <span className="text-[var(--amber)]">{row.era}</span>
              <span className="ml-2 text-white">{row.event}</span>
            </li>
          ))}
        </ol>
      </section>

      {species ? (
        <section className="panel mt-4 p-6">
          <h2 className="font-display text-lg text-white">Combat kit</h2>
          <div className="mt-4">
            <SpeciesKitPanel
              baseStats={species.baseStats}
              abilities={species.abilities}
              traits={species.traits}
            />
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Evolution: {species.evolutionPaths.join(" → ")}
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs text-[var(--text-muted)]">
        Collector note: {lore.marketplaceCollectorNote}
      </p>
    </div>
  );
}
