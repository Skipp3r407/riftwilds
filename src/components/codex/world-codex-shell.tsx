"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GameImage } from "@/components/assets/game-image";
import {
  WORLD_LORE_CATEGORY_LABEL,
  WORLD_LORE_CATEGORY_ORDER,
  type WorldLoreCategory,
  type WorldLoreEntry,
} from "@/content/codex/world-lore";
import { getSpeciesLore } from "@/content/pets/lore";

type Props = {
  entries: WorldLoreEntry[];
};

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

export function WorldCodexShell({ entries }: Props) {
  const [activeCategory, setActiveCategory] = useState<WorldLoreCategory | "all">("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = Object.fromEntries(
      WORLD_LORE_CATEGORY_ORDER.map((c) => [c, 0]),
    ) as Record<WorldLoreCategory, number>;
    for (const entry of entries) map[entry.category] += 1;
    return map;
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (activeCategory !== "all" && entry.category !== activeCategory) return false;
      if (!q) return true;
      const hay = [
        entry.title,
        entry.summary,
        ...entry.body,
        entry.eraTag ?? "",
        ...(entry.relatedSpeciesSlugs ?? []),
        ...(entry.relatedRegionIds ?? []).map((id) => REGION_LABEL[id] ?? id),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [entries, activeCategory, query]);

  const groups = useMemo(() => {
    return WORLD_LORE_CATEGORY_ORDER.map((category) => ({
      category,
      entries: filtered.filter((e) => e.category === category),
    })).filter((g) => g.entries.length > 0);
  }, [filtered]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          <span className="text-white">{entries.length}</span> encyclopedia entries ·{" "}
          <span className="text-white">{filtered.length}</span> showing
        </p>
        <label className="block w-full max-w-md">
          <span className="sr-only">Search World Codex</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search regions, Hearts, factions, people…"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-[var(--text-muted)] focus-ring"
          />
        </label>
      </div>

      <nav
        aria-label="World Codex sections"
        className="sticky top-2 z-20 mt-5 -mx-1 overflow-x-auto rounded-2xl border border-white/10 bg-[rgba(10,14,24,0.88)] px-2 py-2 backdrop-blur-md"
      >
        <ul className="flex min-w-max gap-1.5">
          <li>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
                activeCategory === "all"
                  ? "bg-[var(--cyan)]/20 text-[var(--cyan)] ring-1 ring-[var(--cyan)]/40"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              All ({entries.length})
            </button>
          </li>
          {WORLD_LORE_CATEGORY_ORDER.map((category) => (
            <li key={category}>
              <button
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
                  activeCategory === category
                    ? "bg-[var(--mint)]/15 text-[var(--mint)] ring-1 ring-[var(--mint)]/35"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {WORLD_LORE_CATEGORY_LABEL[category]} ({counts[category]})
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {groups.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--text-muted)]">No entries match that search.</p>
      ) : (
        <div className="mt-8 space-y-12">
          {groups.map((group) => (
            <section key={group.category} id={`section-${group.category}`} className="scroll-mt-24">
              <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-white/10 pb-2">
                <h2 className="font-display text-2xl text-white">
                  {WORLD_LORE_CATEGORY_LABEL[group.category]}
                </h2>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {group.entries.length}{" "}
                  {group.entries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.entries.map((entry) => (
                  <WorldLoreCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function WorldLoreCard({ entry }: { entry: WorldLoreEntry }) {
  const species = (entry.relatedSpeciesSlugs ?? [])
    .map((slug) => ({ slug, lore: getSpeciesLore(slug) }))
    .filter((s) => s.lore);

  return (
    <article className="panel flex flex-col overflow-hidden p-4">
      <div className="relative z-[1] mb-3 aspect-[16/10] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_42%,rgba(90,110,150,0.38),rgba(14,18,32,0.92)_72%)] ring-1 ring-[rgba(148,197,255,0.14)]">
        {entry.artSrc ? (
          <GameImage
            src={entry.artSrc}
            alt={`Illustration for ${entry.title}`}
            width={480}
            height={300}
            fill
            objectFit="cover"
            showDevBadge={false}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-end p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              {WORLD_LORE_CATEGORY_LABEL[entry.category]}
            </p>
          </div>
        )}
      </div>

      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--mint)]">
        {WORLD_LORE_CATEGORY_LABEL[entry.category]}
        {entry.eraTag ? ` · ${entry.eraTag}` : ""}
      </p>
      <h3 className="mt-1 font-display text-xl text-white">
        <Link
          href={`/codex/world/${entry.id}`}
          className="hover:text-[var(--cyan)] focus-ring rounded"
        >
          {entry.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{entry.summary}</p>

      <details className="mt-3 group">
        <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.16em] text-[var(--amber)] marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Read entry</span>
          <span className="hidden group-open:inline">Hide entry</span>
        </summary>
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          {entry.body.map((para, i) => (
            <p key={`${entry.id}-${i}`}>{para}</p>
          ))}
        </div>
      </details>

      {(entry.relatedRegionIds?.length || species.length > 0) && (
        <div className="mt-auto space-y-2 border-t border-white/10 pt-3">
          {entry.relatedRegionIds && entry.relatedRegionIds.length > 0 ? (
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              <span className="uppercase tracking-[0.14em] text-white/50">Regions · </span>
              {entry.relatedRegionIds
                .map((id) => REGION_LABEL[id] ?? id)
                .join(" · ")}
            </p>
          ) : null}
          {species.length > 0 ? (
            <p className="flex flex-wrap gap-x-2 gap-y-1 text-[11px]">
              <span className="uppercase tracking-[0.14em] text-white/50">Riftlings</span>
              {species.map(({ slug, lore }) => (
                <Link
                  key={slug}
                  href={`/codex/riftlings/${slug}`}
                  className="text-[var(--cyan)] underline-offset-2 hover:underline"
                >
                  {lore!.name}
                </Link>
              ))}
            </p>
          ) : null}
        </div>
      )}

      <Link
        href={`/codex/world/${entry.id}`}
        className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[var(--cyan)] underline-offset-2 hover:underline"
      >
        Open full page
      </Link>
    </article>
  );
}
