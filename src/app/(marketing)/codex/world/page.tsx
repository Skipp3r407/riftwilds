import Link from "next/link";
import type { Metadata } from "next";
import { GameImage } from "@/components/assets/game-image";
import { ColoringDownloads } from "@/components/coloring/coloring-downloads";
import { SectionTitleBand } from "@/components/shared/page-header";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import { WORLD_LORE_ENTRIES } from "@/content/codex/world-lore";

export const metadata: Metadata = {
  title: "World Codex | Riftwilds Lore",
  description:
    "Gateway Hearts, the Fracture, Elara Venn, and the living history of Aeryndra — story bible summaries for Keepers.",
};

const CATEGORY_LABEL: Record<(typeof WORLD_LORE_ENTRIES)[number]["category"], string> = {
  history: "History",
  cosmology: "Cosmology",
  faction: "Factions & Orders",
  region: "Regions",
  person: "People",
  book: "Books",
};

export default function WorldCodexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionTitleBand slug="world" label="World Codex" kicker="Story Bible" />
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        Living history of Aeryndra and the Riftwilds. Species companions live in the{" "}
        <Link href="/codex/riftlings" className="text-[var(--cyan)] underline-offset-2 hover:underline">
          Riftling Codex
        </Link>
        . Full narrative design docs:{" "}
        <span className="text-[var(--text-muted)]">docs/story/STORY_BIBLE.md</span>.
      </p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Prefer cinema?{" "}
        <Link href="/about" className="text-[var(--amber)] underline-offset-2 hover:underline">
          Read the origin story
        </Link>
        .
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORLD_LORE_ENTRIES.map((entry) => (
          <article key={entry.id} className="panel overflow-hidden p-4">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : null}
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--mint)]">
              {CATEGORY_LABEL[entry.category]}
            </p>
            <h2 className="mt-1 font-display text-xl text-white">{entry.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{entry.summary}</p>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {entry.body.map((para, i) => (
                <p key={`${entry.id}-${i}`}>{para}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 space-y-10">
        <ColoringDownloads />
        <WallpaperDownloads />
      </div>
    </div>
  );
}
