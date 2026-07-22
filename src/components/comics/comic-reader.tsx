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
import { deckBuilderHref, resolveCanonHref } from "@/content/comics/canon-links";
import { ComicBookStage } from "@/components/comics/comic-book-stage";
import { ComicEndShare } from "@/components/fan-kit/comic-end-share";
import { ColoringDownloads } from "@/components/coloring/coloring-downloads";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import {
  castCommunityVote,
  collectCover,
  continuePage,
  createEmptyComicProgress,
  flipDirection,
  loadComicProgress,
  markHotspotFound,
  pageFromGamepadButton,
  pageFromKeyboard,
  pageTurnMotion,
  setBookmark,
  setCurrentPage,
  shouldOfferCoverIntro,
  unlockComicAchievement,
  updateComicSettings,
} from "@/lib/comics";
import { playCoverOpenSound, playPageTurnSound } from "@/lib/comics/page-turn-sound";
import { getIssue001Transcript } from "@/content/comics/the-first-rift/issue-001.generated";
import { getIssue002Transcript } from "@/content/comics/sparks-journey/issue-002.generated";
import { isIssueUnlocked, issueLockReason } from "@/lib/comics/unlock";
import { useComicNarration } from "@/hooks/use-comic-narration";
import { cn } from "@/lib/utils/cn";

type Props = {
  issue: ComicIssue;
  prevSlug?: string | null;
  nextSlug?: string | null;
};

const TURN_LOCK_MS = pageTurnMotion(false).durationMs + 40;

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
  const [flipDir, setFlipDir] = useState<1 | -1 | 0>(0);
  const [coverOpen, setCoverOpen] = useState(false);
  const [focusPanel, setFocusPanel] = useState<number | null>(null);
  const [focusBubble, setFocusBubble] = useState<number | null>(null);
  const [canonToastHref, setCanonToastHref] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptSize, setTranscriptSize] = useState<"sm" | "md" | "lg">("md");
  const shellRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const turnLock = useRef(false);
  const pageRef = useRef(page);
  const coverOpenRef = useRef(coverOpen);
  const issueProgress = progress.issues[issue.slug];
  const cover = issue.covers.find((c) => c.kind === "standard") ?? issue.covers[0];

  pageRef.current = page;
  coverOpenRef.current = coverOpen;

  const openCover = useCallback(
    (withSound: boolean) => {
      setCoverOpen(true);
      if (withSound) playCoverOpenSound(progress.settings.sfxEnabled);
    },
    [progress.settings.sfxEnabled],
  );

  const goTo = useCallback(
    (next: number, opts?: { skipCoverGate?: boolean }) => {
      if (turnLock.current) return;

      // Closed cover: first "next" opens the book instead of skipping page 1.
      if (
        !opts?.skipCoverGate &&
        !coverOpenRef.current &&
        cover &&
        next > pageRef.current
      ) {
        openCover(true);
        return;
      }

      const clamped = Math.max(1, Math.min(total, next));
      if (clamped === pageRef.current) return;

      const dir = flipDirection(pageRef.current, clamped);
      setFlipDir(dir);
      setTurning(true);
      turnLock.current = true;

      if (!coverOpenRef.current && cover) {
        setCoverOpen(true);
      }

      playPageTurnSound(progress.settings.sfxEnabled, dir === 0 ? 1 : dir);

      startTransition(() => {
        setPage(clamped);
        setProgress((p) => setCurrentPage(p, issue.slug, clamped, total));
      });

      window.setTimeout(() => {
        setTurning(false);
        turnLock.current = false;
      }, TURN_LOCK_MS);

      const url = `/comics/${issue.slug}?page=${clamped}`;
      router.replace(url, { scroll: false });
    },
    [cover, issue.slug, openCover, progress.settings.sfxEnabled, router, total],
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
    const clamped = Math.max(1, Math.min(total, start));
    setPage(clamped);
    // Cover intro only when landing on page 1 fresh; mid-issue resume skips it.
    setCoverOpen(!shouldOfferCoverIntro(clamped, false) || !issue.covers.length);
    setProgress((p) => {
      let next = unlockComicAchievement(p, "ach-first-page");
      next = setCurrentPage(next, issue.slug, clamped, total);
      return next;
    });
  });

  useEffect(() => {
    onHydrate();
  }, [issue.slug]);

  useEffect(() => {
    let raf = 0;
    let lastFire = 0;
    const poll = () => {
      const pads = navigator.getGamepads?.() ?? [];
      const now = performance.now();
      for (const pad of pads) {
        if (!pad) continue;
        for (let i = 0; i < pad.buttons.length; i++) {
          if (pad.buttons[i]?.pressed && now - lastFire > 350) {
            const n = pageFromGamepadButton(i, page, total);
            if (n != null) {
              lastFire = now;
              goTo(n);
            }
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
  const pageTranscript =
    issue.slug === "the-first-rift"
      ? getIssue001Transcript(page)
      : issue.slug === "sparks-journey"
        ? getIssue002Transcript(page)
        : current.panels.flatMap((p) =>
            p.bubbles.map((b) => (b.speaker ? `${b.speaker}: ${b.text}` : b.text)),
          );
  const narration = useComicNarration({
    issueSlug: issue.slug,
    pageNumber: page,
    page: current,
    enabled: settings.narrationEnabled,
    active: coverOpen || !cover,
  });

  useEffect(() => {
    setFocusPanel(null);
    setFocusBubble(null);
    setCanonToastHref(null);
  }, [page]);

  const advanceGuided = useCallback(() => {
    if (!settings.guidedReading) return false;
    const panels = current.panels;
    if (!panels.length) return false;
    const pIdx = focusPanel ?? 0;
    const bubbles = panels[pIdx]?.bubbles ?? [];
    const bIdx = focusBubble ?? -1;
    if (bIdx + 1 < bubbles.length) {
      setFocusPanel(pIdx);
      setFocusBubble(bIdx + 1);
      return true;
    }
    if (pIdx + 1 < panels.length) {
      setFocusPanel(pIdx + 1);
      setFocusBubble(0);
      return true;
    }
    setFocusPanel(null);
    setFocusBubble(null);
    return false;
  }, [current.panels, focusBubble, focusPanel, settings.guidedReading]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (settings.guidedReading && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        if (!advanceGuided()) goTo(page + 1);
        return;
      }
      if (settings.guidedReading && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setFocusPanel(0);
        setFocusBubble(0);
        return;
      }
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
  }, [advanceGuided, goTo, page, settings.guidedReading, total]);

  const onHotspot = (h: ComicHotspot) => {
    const cardId = h.canonLink?.tcgCardId;
    setProgress((p) => {
      let next = markHotspotFound(
        p,
        issue.slug,
        h.id,
        h.codexEntryId ?? h.canonLink?.worldCodexEntryId,
        h.secretCode,
        h.rewardId,
        cardId,
      );
      next = unlockComicAchievement(next, "ach-hotspot-1");
      if (h.secretCode) next = unlockComicAchievement(next, "ach-secret-code");
      return next;
    });
    const href =
      (h.canonLink && resolveCanonHref(h.canonLink)) ||
      (h.codexEntryId ? `/codex/world/${h.codexEntryId}` : null);
    setCanonToastHref(href);
    const bits = [
      `Found: ${h.label}`,
      h.codexEntryId || h.canonLink?.worldCodexEntryId
        ? `Codex: ${h.codexEntryId ?? h.canonLink?.worldCodexEntryId}`
        : null,
      cardId ? `Card tease: ${cardId}` : null,
      h.secretCode ? `Quest stub: ${h.secretCode}` : null,
    ].filter(Boolean);
    setToast(bits.join(" · "));
    window.setTimeout(() => {
      setToast(null);
      setCanonToastHref(null);
    }, 4200);
  };

  const unlocked = isIssueUnlocked(issue, {
    progress,
    comicsDevUnlock:
      typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK === "1" ||
        process.env.NEXT_PUBLIC_COMICS_DEV_UNLOCK === "true"),
  });
  const lockReason = issueLockReason(issue, { progress });

  if (!unlocked) {
    return (
      <div className="comic-reader-shell min-h-screen">
        <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-16 text-center">
          <p className="page-kicker">Issue #{issue.issueNumber}</p>
          <h1 className="font-display text-3xl text-[var(--parchment,#e8d5b0)]">{issue.title}</h1>
          <p className="text-[var(--text-muted)]">{lockReason}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/comics" className="btn-secondary focus-ring">
              Archive shelves
            </Link>
            {prevSlug && (
              <Link href={`/comics/${prevSlug}`} className="btn-primary focus-ring">
                Read previous issue
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "comic-reader-shell min-h-screen",
        !settings.darkMode && "comic-reader-shell--day",
        settings.highContrast && "contrast-125",
        fullscreen && "p-0",
      )}
    >
      <div className="comic-reader-stage mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 md:gap-3 md:px-6 md:py-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="page-kicker">Issue #{issue.issueNumber}</p>
            <h1 className="font-display truncate text-xl text-[var(--parchment,#e8d5b0)] md:text-2xl">
              {issue.title}
            </h1>
            <p className="hidden text-sm text-[rgba(232,213,176,0.65)] sm:block">{issue.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/comics" className="btn-secondary focus-ring text-sm">
              Library
            </Link>
            <Link href="/coloring" className="btn-secondary focus-ring text-sm">
              Download to color
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
          className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[rgba(196,168,130,0.35)] bg-[rgba(20,14,10,0.55)] p-1.5"
          role="toolbar"
          aria-label="Reader controls"
        >
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => {
              if (page <= 1 && coverOpen) {
                setCoverOpen(false);
                return;
              }
              goTo(page - 1);
            }}
            disabled={page <= 1 && !coverOpen}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => goTo(page + 1)}
            disabled={page >= total && coverOpen}
          >
            {coverOpen ? "Next" : "Open"}
          </button>
          <span className="px-2 text-sm text-[rgba(232,213,176,0.7)]" aria-live="polite">
            {page} / {total}
            {turning ? " · turning…" : ""}
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
            Pages
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
            {settings.darkMode ? "Lamp soft" : "Lamp warm"}
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
            Page sound {settings.sfxEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() =>
              setProgress((p) =>
                updateComicSettings(p, { narrationEnabled: !p.settings.narrationEnabled }),
              )
            }
            aria-pressed={settings.narrationEnabled}
            title="Storybook voiceover (ElevenLabs clips when generated)"
          >
            Narration {settings.narrationEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => {
              setProgress((p) =>
                updateComicSettings(p, { guidedReading: !p.settings.guidedReading }),
              );
              setFocusPanel(0);
              setFocusBubble(0);
            }}
            aria-pressed={settings.guidedReading}
            title="Panel-by-panel guided reading"
          >
            Guided {settings.guidedReading ? "On" : "Off"}
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => setTranscriptOpen((v) => !v)}
            aria-pressed={transcriptOpen}
            title="Accessible script transcript (not overlaid on art)"
          >
            Transcript {transcriptOpen ? "On" : "Off"}
          </button>
          {settings.guidedReading && (
            <button
              type="button"
              className="btn-secondary focus-ring text-sm"
              onClick={() => {
                if (!advanceGuided()) goTo(page + 1);
              }}
            >
              Next panel
            </button>
          )}
          {settings.narrationEnabled && (
            <>
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                onClick={() => narration.togglePlay()}
                disabled={!narration.available || narration.status === "missing"}
                aria-pressed={narration.playing}
              >
                {narration.playing ? "Pause VO" : "Play VO"}
              </button>
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                onClick={() => narration.toggleMute()}
                aria-pressed={narration.muted}
              >
                VO {narration.muted ? "Muted" : "Audible"}
              </button>
              {narration.status === "missing" && (
                <span className="px-1 text-xs text-[rgba(232,213,176,0.55)]">
                  No clip for this page
                </span>
              )}
            </>
          )}
        </div>

        {toast && (
          <div
            className="rounded-md border border-[rgba(196,168,130,0.5)] bg-[rgba(232,213,176,0.12)] px-3 py-2 text-sm text-[var(--amber)]"
            role="status"
          >
            {toast}
            {canonToastHref && (
              <Link href={canonToastHref} className="ml-2 underline">
                Open link
              </Link>
            )}
            {toast.includes("Card tease:") && (
              <Link href={deckBuilderHref()} className="ml-2 underline">
                Deck Atelier
              </Link>
            )}
          </div>
        )}

        <div
          className="comic-reader-book-slot min-h-0 flex-1"
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
          <ComicBookStage
            page={page}
            totalPages={total}
            pages={issue.pages}
            issueTitle={issue.title}
            direction={flipDir}
            darkMode={settings.darkMode}
            highContrast={settings.highContrast}
            zoom={Math.min(settings.zoom || 1, 1.15)}
            foundHotspots={issueProgress?.foundHotspots ?? []}
            onHotspot={onHotspot}
            coverOpen={coverOpen || !cover}
            coverSrc={cover?.src}
            coverLabel={cover?.label}
            onOpenCover={() => openCover(true)}
            onEdgeNav={(d) => goTo(page + d)}
            focusPanelIndex={settings.guidedReading ? focusPanel : null}
            focusBubbleIndex={settings.guidedReading ? focusBubble : null}
            onPanelFocus={(i) => {
              if (!settings.guidedReading) return;
              setFocusPanel(i);
              setFocusBubble(0);
            }}
          />
        </div>

        {transcriptOpen && (
          <aside
            className={cn(
              "mt-3 max-h-56 overflow-y-auto rounded-md border border-[rgba(139,90,60,0.45)] bg-[rgba(20,14,10,0.88)] px-3 py-2 text-[#f5ead2]",
              transcriptSize === "sm" && "text-xs",
              transcriptSize === "md" && "text-sm",
              transcriptSize === "lg" && "text-base",
            )}
            aria-label={`Page ${page} accessible transcript`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
                Transcript · page {page} (accessibility — not overlaid on art)
              </p>
              <div className="flex gap-1" role="group" aria-label="Transcript text size">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={cn(
                      "btn-secondary focus-ring px-2 py-0.5 text-[10px] uppercase",
                      transcriptSize === size && "border-[var(--amber)] text-[var(--amber)]",
                    )}
                    onClick={() => setTranscriptSize(size)}
                    aria-pressed={transcriptSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {pageTranscript.length ? (
              <ul className="mt-1 space-y-1">
                {pageTranscript.map((line, i) => (
                  <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 opacity-70">No dialogue on this page.</p>
            )}
          </aside>
        )}

        {thumbsOpen && (
          <div
            className="flex gap-1.5 overflow-x-auto pb-2 pt-1"
            role="navigation"
            aria-label="Page edges"
          >
            {issue.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                className={cn(
                  "comic-thumb-edge focus-ring shrink-0 px-2 py-2 text-xs font-medium",
                  p.pageNumber === page && "comic-thumb-edge--active",
                )}
                style={{
                  width: `${Math.max(28, 22 + (total - p.pageNumber) * 0.35)}px`,
                }}
                onClick={() => {
                  if (!coverOpen) openCover(false);
                  goTo(p.pageNumber, { skipCoverGate: true });
                }}
              >
                {p.pageNumber}
              </button>
            ))}
          </div>
        )}

        {current.layout === "end" && issue.hasCommunityVote && issue.voteOptions && (
          <section className="panel panel--parchment p-4" aria-label="Community vote">
            <h2 className="font-display text-lg text-[var(--text-ink)]">
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

        {(current.layout === "end" || page === total) && (
          <ComicEndShare issueTitle={issue.title} issueSlug={issue.slug} />
        )}

        <aside className="panel grid gap-4 p-4 md:grid-cols-2" aria-label="Issue extras">
          <div>
            <h2 className="font-display text-lg text-white">Characters</h2>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
              {issue.characters.map((c) => {
                const href = c.canonLink ? resolveCanonHref(c.canonLink) : null;
                const cardHref = c.canonLink?.tcgCardId
                  ? deckBuilderHref(c.canonLink.tcgCardId)
                  : null;
                return (
                  <li key={c.name}>
                    <span className="text-white">{c.name}</span> — {c.role}: {c.blurb}
                    {(href || cardHref) && (
                      <span className="mt-0.5 flex flex-wrap gap-2 text-xs text-[var(--cyan)]">
                        {href && (
                          <Link href={href} className="hover:underline">
                            Codex
                          </Link>
                        )}
                        {cardHref && (
                          <Link href={cardHref} className="hover:underline">
                            Card / deck
                          </Link>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {issue.arcId && (
              <p className="mt-3 text-xs text-[var(--amber)]">
                Arc: {issue.arcId}
                {issue.volumeId ? ` · ${issue.volumeId}` : ""}
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Covers: {issue.covers.length} variants · Unlock:{" "}
              {(issue.unlockGates ?? [{ kind: "free" }]).map((g) => g.kind).join(", ")}
            </p>
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

        <div className="grid gap-3 md:grid-cols-2">
          <ColoringDownloads variant="compact" />
          <WallpaperDownloads variant="compact" />
        </div>

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
          Swipe on touch devices. Gamepad D-pad supported as best-effort stub. Page-turn sound toggle
          plays a soft paper rustle. Narration toggle plays storybook voiceover — pre-generated clips
          when present, otherwise your browser's speech voice. Prefer reduced motion for a simple
          crossfade instead of a 3D flip.
        </p>
      </div>
    </div>
  );
}
