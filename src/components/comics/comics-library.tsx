"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ComicIssue, ComicProgressState } from "@/content/comics/types";
import { COMIC_ARCS, COMIC_VOLUMES } from "@/content/comics/story-arcs";
import { ComicCoverCard } from "@/components/comics/comic-cover-card";
import { ColoringDownloads } from "@/components/coloring/coloring-downloads";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import {
  createEmptyComicProgress,
  isIssueUnlocked,
  loadComicProgress,
  prefetchIssueOffline,
  toggleFavoriteIssue,
  unlockLabel,
} from "@/lib/comics";

type Props = {
  issues: ComicIssue[];
  seriesTitle: string;
  seriesSubtitle: string;
};

type SortKey = "issue" | "date" | "progress" | "title";

export function ComicsLibrary({ issues, seriesTitle, seriesSubtitle }: Props) {
  const [progress, setProgress] = useState<ComicProgressState>(createEmptyComicProgress);
  const [query, setQuery] = useState("");
  const [arcId, setArcId] = useState<string>("all");
  const [volumeId, setVolumeId] = useState<string>("all");
  const [character, setCharacter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("issue");
  const [offlineNote, setOfflineNote] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadComicProgress());
  }, []);

  const characterOptions = useMemo(() => {
    const names = new Set<string>();
    for (const issue of issues) {
      for (const c of issue.characters) names.add(c.name);
    }
    return [...names].sort();
  }, [issues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = issues.filter((issue) => {
      if (arcId !== "all" && issue.arcId !== arcId) return false;
      if (volumeId !== "all" && issue.volumeId !== volumeId) return false;
      if (character !== "all" && !issue.characters.some((c) => c.name === character)) {
        return false;
      }
      if (favoritesOnly && !progress.favorites.includes(issue.slug)) return false;
      if (!q) return true;
      const hay = [
        issue.title,
        issue.subtitle,
        issue.synopsis,
        ...issue.tags,
        ...issue.characters.map((c) => c.name),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "date") return b.publishedAt.localeCompare(a.publishedAt);
      if (sort === "progress") {
        const pa = progress.issues[a.slug]?.maxPageReached ?? 0;
        const pb = progress.issues[b.slug]?.maxPageReached ?? 0;
        return pb - pa;
      }
      return a.issueNumber - b.issueNumber;
    });
    return list;
  }, [arcId, character, favoritesOnly, issues, progress.favorites, progress.issues, query, sort, volumeId]);

  const continueIssue = useMemo(() => {
    const withProgress = issues
      .map((i) => ({ issue: i, p: progress.issues[i.slug] }))
      .filter((x) => x.p && !x.p.completed && x.p.maxPageReached > 1)
      .sort((a, b) => (b.p!.lastReadAt ?? "").localeCompare(a.p!.lastReadAt ?? ""));
    return withProgress[0]?.issue;
  }, [issues, progress.issues]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_20%_0%,rgba(61,231,255,0.14),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(255,184,77,0.12),transparent_45%),linear-gradient(160deg,#1a1510_0%,#0a1830_55%,#121a28_100%)] px-6 py-12 md:px-10 md:py-16">
        <p className="page-kicker">Lore Library · Comic Publishing</p>
        <h1 className="font-display mt-3 text-4xl text-white md:text-6xl">{seriesTitle}</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)] md:text-lg">{seriesSubtitle}</p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          {issues.length} illustrated issues · volumes &amp; arcs · Codex / card teases · cosmetics
          only (never crypto-gated story)
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {continueIssue ? (
            <Link
              href={`/comics/${continueIssue.slug}`}
              className="btn-primary focus-ring"
            >
              Continue · {continueIssue.title}
            </Link>
          ) : (
            <Link href={`/comics/${issues[0]?.slug ?? ""}`} className="btn-primary focus-ring">
              Start Issue #1
            </Link>
          )}
          <Link href="/admin/comics" className="btn-secondary focus-ring">
            Comic Studio
          </Link>
          <Link href="/codex/world" className="btn-secondary focus-ring">
            World Codex
          </Link>
          <Link href="/tcg/codex" className="btn-secondary focus-ring">
            Rift Codex
          </Link>
          <Link href="/tcg/deck-builder" className="btn-secondary focus-ring">
            Deck Atelier
          </Link>
          <Link href="/fan-kit" className="btn-secondary focus-ring">
            Fan Kit
          </Link>
        </div>
      </header>

      <section className="panel mt-8 space-y-3 p-4" aria-label="Library filters">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[12rem] flex-1 text-xs text-[var(--text-muted)]">
            Search
            <input
              className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white focus-ring"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, tag, character…"
            />
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Volume
            <select
              className="mt-1 block rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-2 py-2 text-sm text-white focus-ring"
              value={volumeId}
              onChange={(e) => setVolumeId(e.target.value)}
            >
              <option value="all">All volumes</option>
              {COMIC_VOLUMES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Arc
            <select
              className="mt-1 block rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-2 py-2 text-sm text-white focus-ring"
              value={arcId}
              onChange={(e) => setArcId(e.target.value)}
            >
              <option value="all">All arcs</option>
              {COMIC_ARCS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Character
            <select
              className="mt-1 block rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-2 py-2 text-sm text-white focus-ring"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
            >
              <option value="all">All cast</option>
              {characterOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-[var(--text-muted)]">
            Sort
            <select
              className="mt-1 block rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-2 py-2 text-sm text-white focus-ring"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="issue">Issue #</option>
              <option value="date">Date</option>
              <option value="progress">Progress</option>
              <option value="title">Title</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-[var(--text-muted)]">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Favorites
          </label>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Showing {filtered.length} of {issues.length} · Unlocked codex:{" "}
          {progress.unlockedCodex.length} · Card teases: {progress.unlockedCards?.length ?? 0} ·
          Achievements: {progress.achievements.length}
        </p>
      </section>

      <section className="mt-10" aria-label="Lore Library shelves">
        <h2 className="font-display text-2xl text-white">Archive shelves</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Publisher-grade issues (~30–40 pages with front/back matter). Page flip, zoom, guided
          panel focus, bookmarks, and progress persist locally.
        </p>

        {COMIC_VOLUMES.filter((v) => v.volumeNumber >= 2).map((volume) => {
          const volumeIssues = issues.filter((i) => volume.issueSlugs.includes(i.slug));
          if (!volumeIssues.length) return null;
          const opener = volumeIssues.find((i) => i.volumeOpener || i.shelfBadge?.includes("Volume Two"));
          const unlocked =
            opener &&
            isIssueUnlocked(opener, {
              progress,
              comicsDevUnlock:
                typeof process !== "undefined" &&
                (process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK === "1" ||
                  process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK === "true"),
            });
          return (
            <div
              key={volume.id}
              className="mt-8 overflow-hidden rounded-xl border border-[rgba(61,231,255,0.35)] bg-[radial-gradient(ellipse_at_10%_0%,rgba(61,231,255,0.16),transparent_45%),radial-gradient(ellipse_at_90%_30%,rgba(255,210,122,0.12),transparent_40%),linear-gradient(120deg,#0a1830_0%,#121a28_55%,#1a1510_100%)] px-5 py-5 md:px-7"
              aria-label={`${volume.title} banner`}
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--cyan)]">Volume Two</p>
              <h3 className="font-display mt-1 text-2xl text-white md:text-3xl">{volume.title}</h3>
              <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
                Beyond the Forge Network — celestial sanctuaries, Prime companions, and the Hollow dark.
                {unlocked
                  ? " Shelf unlocked."
                  : " Unlocks after completing Issue #9: The Riftwright (or admin/dev override)."}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--amber)]">
                <li className="rounded-sm bg-[rgba(0,0,0,0.35)] px-2 py-1 ring-1 ring-[rgba(255,184,77,0.35)]">
                  Galaxy Map
                </li>
                <li className="rounded-sm bg-[rgba(0,0,0,0.35)] px-2 py-1 ring-1 ring-[rgba(255,184,77,0.35)]">
                  Celestial Keepers
                </li>
                <li className="rounded-sm bg-[rgba(0,0,0,0.35)] px-2 py-1 ring-1 ring-[rgba(255,184,77,0.35)]">
                  Nova · Astra
                </li>
                <li className="rounded-sm bg-[rgba(0,0,0,0.35)] px-2 py-1 ring-1 ring-[rgba(255,184,77,0.35)]">
                  ~18–22 min
                </li>
              </ul>
            </div>
          );
        })}

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((issue) => (
            <div key={issue.slug} className="space-y-2">
              <ComicCoverCard
                issue={issue}
                progress={progress.issues[issue.slug]}
                allProgress={progress}
                comicsDevUnlock={
                  typeof process !== "undefined" &&
                  (process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK === "1" ||
                    process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK === "true")
                }
                onToggleFavorite={(slug) => setProgress((p) => toggleFavoriteIssue(p, slug))}
              />
              <div className="flex flex-wrap items-center justify-between gap-1 px-1 text-[10px] text-[var(--text-muted)]">
                <span>{unlockLabel(issue)}</span>
                <span>
                  {issue.pages.length}p · ~{issue.readingTimeMinutes}m · {issue.covers.length} covers
                </span>
                <button
                  type="button"
                  className="text-[var(--cyan)] hover:underline"
                  onClick={() => {
                    void prefetchIssueOffline(issue).then((r) =>
                      setOfflineNote(
                        r.ok
                          ? `Cached ${r.cached} assets for ${issue.title}`
                          : `Offline stub: ${r.reason ?? "unavailable"}`,
                      ),
                    );
                  }}
                >
                  Prefetch offline
                </button>
              </div>
            </div>
          ))}
        </div>
        {offlineNote && (
          <p className="mt-3 text-xs text-[var(--amber)]" role="status">
            {offlineNote}
          </p>
        )}
      </section>

      <div className="mt-12 space-y-10">
        <ColoringDownloads />
        <WallpaperDownloads />
      </div>

      <section className="panel mt-12 p-6" aria-label="Series extras">
        <h2 className="font-display text-xl text-white">Bonus &amp; extras</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Profiles, maps, letters, and in-universe ads ship inside each published book. Issue #3
          links to the Traveling Circus world event. Studio ops:{" "}
          <Link href="/admin/comics" className="text-[var(--cyan)] underline-offset-2 hover:underline">
            /admin/comics
          </Link>
          .
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-[var(--cyan)] sm:grid-cols-2">
          {COMIC_ARCS.map((arc) => (
            <li key={arc.id}>
              <button
                type="button"
                className="hover:underline"
                onClick={() => setArcId(arc.id)}
              >
                {arc.title}
              </button>
              <span className="text-[var(--text-muted)]"> — {arc.subtitle}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
