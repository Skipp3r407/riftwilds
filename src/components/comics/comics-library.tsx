"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ComicIssue, ComicProgressState } from "@/content/comics/types";
import { ComicCoverCard } from "@/components/comics/comic-cover-card";
import { ColoringDownloads } from "@/components/coloring/coloring-downloads";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import {
  createEmptyComicProgress,
  loadComicProgress,
  toggleFavoriteIssue,
} from "@/lib/comics";

type Props = {
  issues: ComicIssue[];
  seriesTitle: string;
  seriesSubtitle: string;
};

export function ComicsLibrary({ issues, seriesTitle, seriesSubtitle }: Props) {
  const [progress, setProgress] = useState<ComicProgressState>(createEmptyComicProgress);

  useEffect(() => {
    setProgress(loadComicProgress());
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_20%_0%,rgba(61,231,255,0.14),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(255,184,77,0.12),transparent_45%),linear-gradient(160deg,#1a1510_0%,#0a1830_55%,#121a28_100%)] px-6 py-12 md:px-10 md:py-16">
        <p className="page-kicker">Lore Library · Magical Archive</p>
        <h1 className="font-display mt-3 text-4xl text-white md:text-6xl">{seriesTitle}</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)] md:text-lg">{seriesSubtitle}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {issues.length} illustrated issues · resume &amp; favorites · Codex / cosmetic unlocks
          (never pay-to-win)
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/comics/${issues[0]?.slug ?? ""}`} className="btn-primary focus-ring">
            Start Issue #1
          </Link>
          <Link href="/fan-kit" className="btn-secondary focus-ring">
            Fan Kit
          </Link>
          <Link href="/coloring" className="btn-secondary focus-ring">
            Coloring
          </Link>
          <Link href="/codex/world" className="btn-secondary focus-ring">
            World Codex
          </Link>
          <Link href="/live-world" className="btn-secondary focus-ring">
            Live World
          </Link>
        </div>
      </header>

      <section className="mt-10" aria-label="Lore Library shelves">
        <h2 className="font-display text-2xl text-white">Archive shelves</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Select a volume to open the reader — page flip, zoom, bookmarks, and reading progress
          persist locally. Story unlocks cosmetics and Codex ties only.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {issues.map((issue) => (
            <ComicCoverCard
              key={issue.slug}
              issue={issue}
              progress={progress.issues[issue.slug]}
              onToggleFavorite={(slug) => setProgress((p) => toggleFavoriteIssue(p, slug))}
            />
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-10">
        <ColoringDownloads />
        <WallpaperDownloads />
      </div>

      <section className="panel mt-12 p-6" aria-label="Series extras">
        <h2 className="font-display text-xl text-white">Bonus &amp; extras</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Developer commentary, character/location bios, and timeline notes live inside each issue
          reader (end pages + sidebar). Issue #3 links to the Traveling Circus world event. Free
          coloring pages and desktop wallpapers are above — also at{" "}
          <Link href="/coloring" className="text-[var(--cyan)] underline-offset-2 hover:underline">
            /coloring
          </Link>
          .
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-[var(--cyan)] sm:grid-cols-2">
          <li>
            <Link href="/comics/the-traveling-circus" className="hover:underline">
              Issue #3 → Circus live event
            </Link>
          </li>
          <li>
            <Link href="/fan-kit#share" className="hover:underline">
              Shareable moment cards
            </Link>
          </li>
          <li>
            <Link href="/fan-kit" className="hover:underline">
              Wallpapers &amp; stickers (Fan Kit)
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">
              About / origin story
            </Link>
          </li>
          <li>
            <Link href="/codex/riftlings" className="hover:underline">
              Riftling Codex
            </Link>
          </li>
          <li>
            <span className="text-[var(--text-muted)]">
              Unlocked codex: {progress.unlockedCodex.length} · Achievements:{" "}
              {progress.achievements.length}
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
