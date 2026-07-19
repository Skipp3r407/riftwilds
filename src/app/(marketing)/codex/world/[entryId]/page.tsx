import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameImage } from "@/components/assets/game-image";
import { SectionTitleBand } from "@/components/shared/page-header";
import {
  getWorldLore,
  listWorldLoreIds,
  WORLD_LORE_CATEGORY_LABEL,
  WORLD_LORE_ENTRIES,
} from "@/content/codex/world-lore";
import { getSpeciesLore } from "@/content/pets/lore";

const REGION_LABEL: Record<string, string> = {
  "riftwild-commons": "Riftwild Commons",
  "ember-crater": "Ember Crater",
  "moonwater-coast": "Moonwater Coast",
  "elderwood-forest": "Elderwood Forest",
  "stormspire-peaks": "Stormspire Peaks",
  "stoneheart-canyon": "Stoneheart Canyon",
  "frostveil-basin": "Frostveil Basin",
  "radiant-citadel": "Radiant Citadel",
  "void-hollow": "Void Hollow",
  "alloy-ruins": "Alloy Ruins",
  "spirit-marsh": "Spirit Marsh",
  "celestial-rift": "Celestial Rift",
};

type Props = {
  params: Promise<{ entryId: string }>;
};

export function generateStaticParams() {
  return listWorldLoreIds().map((entryId) => ({ entryId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params;
  const entry = getWorldLore(entryId);
  if (!entry) return { title: "World Codex Entry" };
  return {
    title: `${entry.title} | World Codex`,
    description: entry.summary,
  };
}

export default async function WorldCodexEntryPage({ params }: Props) {
  const { entryId } = await params;
  const entry = getWorldLore(entryId);
  if (!entry) notFound();

  const species = (entry.relatedSpeciesSlugs ?? [])
    .map((slug) => ({ slug, lore: getSpeciesLore(slug) }))
    .filter((s) => s.lore);

  const idx = WORLD_LORE_ENTRIES.findIndex((e) => e.id === entry.id);
  const prev = idx > 0 ? WORLD_LORE_ENTRIES[idx - 1] : null;
  const next = idx >= 0 && idx < WORLD_LORE_ENTRIES.length - 1 ? WORLD_LORE_ENTRIES[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="text-sm text-[var(--text-muted)]">
        <Link href="/codex/world" className="text-[var(--cyan)] underline-offset-2 hover:underline">
          ← World Codex
        </Link>
      </p>

      <SectionTitleBand
        slug="world"
        label={entry.title}
        kicker={WORLD_LORE_CATEGORY_LABEL[entry.category]}
      />

      {entry.eraTag ? (
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--mint)]">
          {entry.eraTag}
        </p>
      ) : null}

      <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">{entry.summary}</p>

      {entry.artSrc ? (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_42%,rgba(90,110,150,0.38),rgba(14,18,32,0.92)_72%)] ring-1 ring-[rgba(148,197,255,0.14)]">
          <GameImage
            src={entry.artSrc}
            alt={`Illustration for ${entry.title}`}
            width={960}
            height={540}
            fill
            objectFit="cover"
            showDevBadge={false}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : null}

      <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--text-muted)]">
        {entry.body.map((para, i) => (
          <p key={`${entry.id}-${i}`}>{para}</p>
        ))}
      </div>

      {(entry.relatedRegionIds?.length ||
        entry.relatedBookIds?.length ||
        species.length > 0) && (
        <aside className="panel mt-10 space-y-4 p-5">
          <h2 className="font-display text-lg text-white">Related</h2>
          {entry.relatedRegionIds && entry.relatedRegionIds.length > 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              <span className="uppercase tracking-[0.14em] text-white/50">Regions · </span>
              {entry.relatedRegionIds.map((id) => REGION_LABEL[id] ?? id).join(" · ")}
            </p>
          ) : null}
          {entry.relatedBookIds && entry.relatedBookIds.length > 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              <span className="uppercase tracking-[0.14em] text-white/50">Books · </span>
              {entry.relatedBookIds.join(" · ")}
            </p>
          ) : null}
          {species.length > 0 ? (
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">Riftling Codex</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {species.map(({ slug, lore }) => (
                  <li key={slug}>
                    <Link
                      href={`/codex/riftlings/${slug}`}
                      className="rounded-full border border-white/10 px-3 py-1 text-sm text-[var(--cyan)] hover:border-[var(--cyan)]/40"
                    >
                      {lore!.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      )}

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm">
        {prev ? (
          <Link
            href={`/codex/world/${prev.id}`}
            className="text-[var(--text-muted)] hover:text-[var(--cyan)]"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/codex/world/${next.id}`}
            className="text-[var(--text-muted)] hover:text-[var(--cyan)]"
          >
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
