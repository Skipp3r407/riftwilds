import Link from "next/link";
import { CreatureHabitatPortrait } from "@/components/assets/creature-habitat-portrait";
import { SectionTitleBand } from "@/components/shared/page-header";
import { listSpeciesLore } from "@/content/pets/lore";

export const metadata = { title: "Riftling Codex" };

export default function RiftlingCodexPage() {
  const loreList = listSpeciesLore().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="codex" label="Riftling Codex" kicker="Encyclopedia" />
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        {loreList.length} launch species with short, standard, and full lore entries. Personal pet
        biographies are generated at hatch and live on each companion’s profile. World history and
        Gateway lore:{" "}
        <Link href="/codex/world" className="text-[var(--cyan)] underline-offset-2 hover:underline">
          World Codex
        </Link>
        .
      </p>

      <div className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loreList.map((lore) => (
          <Link
            key={lore.slug}
            href={`/codex/riftlings/${lore.slug}`}
            className="panel group flex flex-col p-4 transition hover:border-[var(--cyan)]/50"
          >
            <CreatureHabitatPortrait
              speciesSlug={lore.slug}
              speciesName={lore.name}
              nativeRegion={lore.nativeRegion}
              affinity={lore.affinity}
              aspect="card"
              className="relative z-[1] mb-3"
              loading="lazy"
            />
            {/* z-[1] keeps copy above panel::before scrim so name/lore never “vanish”. */}
            <div className="relative z-[1] min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--mint)]">
                {lore.affinity} · {lore.nativeRegion}
              </p>
              <h2 className="mt-1 font-display text-xl text-white group-hover:text-[var(--cyan)]">
                {lore.name || lore.slug}
              </h2>
              {lore.title ? (
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{lore.title}</p>
              ) : null}
              {lore.shortBio ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] line-clamp-4">
                  {lore.shortBio}
                </p>
              ) : null}
              <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--amber)]">
                Lore {lore.status}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
