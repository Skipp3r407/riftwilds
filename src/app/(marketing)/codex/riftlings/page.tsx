import Link from "next/link";
import { GameImage } from "@/components/assets/game-image";
import { SectionTitleBand } from "@/components/shared/page-header";
import { listSpeciesLore } from "@/content/pets/lore";
import { creatureIconPath, creatureProfilePath } from "@/lib/assets/paths";

export const metadata = { title: "Riftling Codex" };

export default function RiftlingCodexPage() {
  const loreList = listSpeciesLore().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="creatures" label="Riftling Codex" kicker="Encyclopedia" />
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        {loreList.length} launch species with short, standard, and full lore entries. Personal pet
        biographies are generated at hatch and live on each companion’s profile.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loreList.map((lore) => (
          <Link
            key={lore.slug}
            href={`/codex/riftlings/${lore.slug}`}
            className="panel group overflow-hidden p-4 transition hover:border-[var(--cyan)]/50"
          >
            <div className="relative mb-3 flex aspect-[4/3] items-center justify-center rounded-xl bg-[rgba(7,11,22,0.55)]">
              <GameImage
                src={creatureProfilePath(lore.slug)}
                alt={`${lore.name} artwork`}
                width={220}
                height={180}
                fallbackSrc={creatureIconPath(lore.slug, true)}
                showDevBadge={false}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--mint)]">
              {lore.affinity} · {lore.nativeRegion}
            </p>
            <h2 className="mt-1 font-display text-xl text-white group-hover:text-[var(--cyan)]">
              {lore.name}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{lore.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] line-clamp-4">
              {lore.shortBio}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--amber)]">
              Lore {lore.status}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
