"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  startTransition,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ComicHotspot,
  ComicIssue,
  ComicProgressState,
} from "@/content/comics/types";
import { ComicPageView } from "@/components/comics/comic-page-view";
import {
  castCommunityVote,
  collectCover,
  continuePage,
  createEmptyComicProgress,
  loadComicProgress,
  markHotspotFound,
  pageFromGamepadButton,
  pageFromKeyboard,
  setBookmark,
  setCurrentPage,
  unlockComicAchievement,
  updateComicSettings,
} from "@/lib/comics";
import { cn } from "@/lib/utils/cn";

type Props = {
  issue: ComicIssue;
  prevSlug?: string | null;
  nextSlug?: string | null;
};

export function ComicReader({ issue, prevSlug, nextSlug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = issue.pages.length;
  const [progress, setProgress] = useState<ComicProgressState>(createEmptyComicProgress);
  const [page, setPage] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [turning, setTurning] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const issueProgress = progress.issues[issue.slug];

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(total, next));
      setTurning(true);
      startTransition(() => {
        setPage(clamped);
        setProgress((p) => setCurrentPage(p, issue.slug, clamped, total));
      });
      window.setTimeout(() => setTurning(false), 280);
      const url = `/comics/${issue.slug}?page=${clamped}`;
      router.replace(url, { scroll: false });
    },
    [issue.slug, router, total],
  );

  const onHydrate = useEffectEvent(() => {
    const loaded = loadComicProgress();
    setProgress(loaded);
    const fromUrl = Number(searchParams.get("page") || "");
    const ip = loaded.issues[issue.slug];
    const start =
      Number.isFinite(fromUrl) && fromUrl > 0
        ? fromUrl
        : ip
          ? continuePage(ip)
          : 1;
    setPage(Math.max(1, Math.min(total, start)));
    setProgress((p) => {
      let next = unlockComicAchievement(p, "ach-first-page");
      next = setCurrentPage(next, issue.slug, Math.max(1, Math.min(total, start)), total);
      return next;
    });
  });

  useEffect(() => {
    onHydrate();
  }, [issue.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const next = pageFromKeyboard(e.key, page, total);
      if (next != null) {
        e.preventDefault();
        goTo(next);
      }
      if (e.key.toLowerCase() === "f") {
        void shellRef.current?.requestFullscreen?.();
        setFullscreen(true);
      }
      if (e.key === "Escape" && document.fullscreenElement) {
        void document.exitFullscreen();
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, page, total]);

  useEffect(() => {
    let raf = 0;
    const poll = () => {
      const pads = navigator.getGamepads?.() ?? [];
      for (const pad of pads) {
        if (!pad) continue;
        for (let i = 0; i < pad.buttons.length; i++) {
          if (pad.buttons[i]?.pressed) {
            const n = pageFromGamepadButton(i, page, total);
            if (n != null) goTo(n);
          }
        }
      }
      raf = window.requestAnimationFrame(poll);
    };
    raf = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(raf);
  }, [goTo, page, total]);

  useEffect(() => {
    if (issueProgress?.completed) {
      setProgress((p) => {
        let next = unlockComicAchievement(p, "ach-finish-one");
        next = collectCover(next, issue.slug, "anniversary");
        return next;
      });
    }
  }, [issue.slug, issueProgress?.completed]);

  const current = issue.pages[page - 1]!;
  const settings = progress.settings;

  const onHotspot = (h: ComicHotspot) => {
    setProgress((p) => {
      let next = markHotspotFound(p, issue.slug, h.id, h.codexEntryId, h.secretCode, h.rewardId);
      next = unlockComicAchievement(next, "ach-hotspot-1");
      if (h.secretCode) next = unlockComicAchievement(next, "ach-secret-code");
      return next;
    });
    const bits = [
      `Found: ${h.label}`,
      h.codexEntryId ? `Codex: ${h.codexEntryId}` : null,
      h.secretCode ? `Quest stub: ${h.secretCode}` : null,
    ].filter(Boolean);
    setToast(bits.join(" · "));
    window.setTimeout(() => setToast(null), 3200);
  };

  return (
    <div
      ref={shellRef}
      className={cn(
        "min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(26,32,48,0.95),#070a12_70%)]",
        settings.highContrast && "contrast-125",
        fullscreen && "p-0",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 md:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="page-kicker">Issue #{issue.issueNumber}</p>
            <h1 className="font-display text-2xl text-white md:text-3xl">{issue.title}</h1>
            <p className="text-sm text-[var(--text-muted)]">{issue.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/comics" className="btn-secondary focus-ring text-sm">
              Library
            </Link>
            {issue.playChapterHref && (
              <Link href={issue.playChapterHref} className="btn-primary focus-ring text-sm">
                {issue.playChapterLabel ?? "Play this chapter"}
              </Link>
            )}
            {issue.worldEventHref && (
              <Link href={issue.worldEventHref} className="btn-secondary focus-ring text-sm">
                World event
              </Link>
            )}
          </div>
        </header>

        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--stroke)] bg-black/30 p-2"
          role="toolbar"
          aria-label="Reader controls"
        >
          <button type="button" className="btn-secondary focus-ring text-sm" onClick={() => goTo(page - 1)} disabled={page <= 1}>
            Prev
          </button>
          <button type="button" className="btn-secondary focus-ring text-sm" onClick={() => goTo(page + 1)} disabled={page >= total}>
            Next
          </button>
          <span className="px-2 text-sm text-[var(--text-muted)]" aria-live="polite">
            {page} / {total}
          </span>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) => setBookmark(p, issue.slug, page === issueProgress?.bookmarkedPage ? null : page))
            }
          >
            {issueProgress?.bookmarkedPage === page ? "Bookmarked" : "Bookmark"}
          </button>
          <button type="button" className="btn-secondary focus-ring text-sm" onClick={() => setThumbsOpen((v) => !v)}>
            Thumbnails
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => {
              if (!document.fullscreenElement) {
                void shellRef.current?.requestFullscreen?.();
                setFullscreen(true);
              } else {
                void document.exitFullscreen();
                setFullscreen(false);
              }
            }}
          >
            Fullscreen
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) =>
                updateComicSettings(p, { zoom: Math.min(1.4, (p.settings.zoom || 1) + 0.1) }),
              )
            }
          >
            Zoom +
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) =>
                updateComicSettings(p, { zoom: Math.max(0.8, (p.settings.zoom || 1) - 0.1) }),
              )
            }
          >
            Zoom −
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) => updateComicSettings(p, { darkMode: !p.settings.darkMode }))
            }
          >
            {settings.darkMode ? "Light page" : "Dark page"}
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) => updateComicSettings(p, { highContrast: !p.settings.highContrast }))
            }
          >
            Contrast
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) => updateComicSettings(p, { musicEnabled: !p.settings.musicEnabled }))
            }
            aria-pressed={settings.musicEnabled}
          >
            Music {settings.musicEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) => updateComicSettings(p, { sfxEnabled: !p.settings.sfxEnabled }))
            }
            aria-pressed={settings.sfxEnabled}
          >
            SFX {settings.sfxEnabled ? "On" : "Off"}
          </button>
        </div>

        {toast && (
          <div className="rounded-md border border-[var(--cyan)] bg-[rgba(61,231,255,0.12)] px-3 py-2 text-sm text-[var(--cyan)]" role="status">
            {toast}
            {toast.includes("Codex:") && (
              <Link href="/codex/world" className="ml-2 underline">
                Open Codex
              </Link>
            )}
          </div>
        )}

        <div
          className={cn(
            "transition duration-300",
            turning && "translate-x-2 opacity-70",
          )}
          onTouchStart={(e) => {
            touchX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const x = e.changedTouches[0]?.clientX;
            if (touchX.current == null || x == null) return;
            const dx = x - touchX.current;
            if (dx < -50) goTo(page + 1);
            if (dx > 50) goTo(page - 1);
            touchX.current = null;
          }}
        >
          <ComicPageView
            page={current}
            issueTitle={issue.title}
            highContrast={settings.highContrast}
            darkMode={settings.darkMode}
            foundHotspots={issueProgress?.foundHotspots ?? []}
            onHotspot={onHotspot}
            zoom={settings.zoom}
          />
        </div>

        {thumbsOpen && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8" role="navigation" aria-label="Page thumbnails">
            {issue.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                className={cn(
                  "rounded border px-1 py-2 text-xs focus-ring",
                  p.pageNumber === page
                    ? "border-[var(--cyan)] text-[var(--cyan)]"
                    : "border-[var(--stroke)] text-[var(--text-muted)]",
                )}
                onClick={() => goTo(p.pageNumber)}
              >
                {p.pageNumber}
              </button>
            ))}
          </div>
        )}

        {current.layout === "end" && issue.hasCommunityVote && issue.voteOptions && (
          <section className="panel p-4" aria-label="Community vote">
            <h2 className="font-display text-lg text-white">
              {issue.votePrompt ?? "Shape the side-story"}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {issue.voteOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    "btn-secondary focus-ring text-sm",
                    issueProgress?.voteChoiceId === opt.id && "border-[var(--amber)] text-[var(--amber)]",
                  )}
                  onClick={() => {
                    setProgress((p) => {
                      let next = castCommunityVote(p, issue.slug, opt.id);
                      next = unlockComicAchievement(next, "ach-vote");
                      return next;
                    });
                    setToast(`Vote recorded: ${opt.label} (stub tallies)`);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <aside className="panel grid gap-4 p-4 md:grid-cols-2" aria-label="Issue extras">
          <div>
            <h2 className="font-display text-lg text-white">Characters</h2>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
              {issue.characters.map((c) => (
                <li key={c.name}>
                  <span className="text-white">{c.name}</span> — {c.role}: {c.blurb}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-lg text-white">Locations &amp; timeline</h2>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
              {issue.locations.map((l) => (
                <li key={l.name}>
                  <span className="text-white">{l.name}</span>: {l.blurb}
                </li>
              ))}
            </ul>
            {issue.timelineNote && (
              <p className="mt-2 text-sm text-[var(--amber)]">{issue.timelineNote}</p>
            )}
          </div>
          {issue.commentary && (
            <div className="md:col-span-2">
              <h2 className="font-display text-lg text-white">Developer commentary</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
                {issue.commentary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <nav className="flex flex-wrap justify-between gap-2 pb-8" aria-label="Issue navigation">
          {prevSlug ? (
            <Link href={`/comics/${prevSlug}`} className="btn-secondary focus-ring text-sm">
              ← Previous issue
            </Link>
          ) : (
            <span />
          )}
          {nextSlug ? (
            <Link href={`/comics/${nextSlug}`} className="btn-secondary focus-ring text-sm">
              Next issue →
            </Link>
          ) : (
            <Link href="/comics" className="btn-primary focus-ring text-sm">
              Back to library
            </Link>
          )}
        </nav>

        <p className="sr-only">
          Keyboard: Left/Right or A/D to turn pages, F for fullscreen, Home/End for first/last page.
          Swipe on touch devices. Gamepad D-pad supported as best-effort stub. Ambient music and SFX
          toggles persist locally; audio beds are stubs until wired to the site audio bus.
        </p>
      </div>
    </div>
  );
}
