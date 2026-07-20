"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComicIssue, ComicProgressIssue, ComicProgressState } from "@/content/comics/types";
import {
  createEmptyComicProgress,
  isIssueUnlocked,
  issueLockReason,
  readingPercent,
  unlockLabel,
} from "@/lib/comics";

type Props = {
  issue: ComicIssue;
  progress?: ComicProgressIssue;
  allProgress?: ComicProgressState;
  onToggleFavorite?: (slug: string) => void;
  comicsDevUnlock?: boolean;
};

export function ComicCoverCard({
  issue,
  progress,
  allProgress,
  onToggleFavorite,
  comicsDevUnlock,
}: Props) {
  const cover = issue.covers.find((c) => c.kind === "standard") ?? issue.covers[0]!;
  const pct = progress ? readingPercent(progress, issue.pages.length) : 0;
  const unlockCtx = {
    progress: allProgress ?? createEmptyComicProgress(),
    comicsDevUnlock,
  };
  const unlocked = isIssueUnlocked(issue, unlockCtx);
  const lockReason = unlocked ? null : issueLockReason(issue, unlockCtx);

  const continueHref =
    progress && progress.maxPageReached > 1 && !progress.completed
      ? `/comics/${issue.slug}?page=${progress.currentPage}`
      : `/comics/${issue.slug}`;

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/comics/${issue.slug}` : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: issue.title, text: issue.subtitle, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <article className="panel group flex flex-col overflow-hidden">
      {unlocked ? (
        <Link href={continueHref} className="relative block aspect-[3/4] overflow-hidden bg-[rgba(10,18,32,0.9)]">
          <Image
            src={cover.src}
            alt={`Cover art for Issue #${issue.issueNumber}: ${issue.title}`}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
              Issue #{issue.issueNumber}
            </p>
            <h2 className="font-display text-xl text-white">{issue.title}</h2>
            {(issue.shelfBadge || issue.volumeFinale || issue.volumeOpener) && (
              <p className="mt-1 inline-block rounded-sm bg-[rgba(255,184,77,0.2)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--amber)] ring-1 ring-[rgba(255,184,77,0.45)]">
                {issue.shelfBadge || (issue.volumeOpener ? "Volume Opener" : "Volume Finale")}
              </p>
            )}
          </div>
          {pct > 0 && (
            <div
              className="absolute left-0 right-0 top-0 h-1 bg-[rgba(255,255,255,0.12)]"
              aria-hidden
            >
              <div className="h-full bg-[var(--cyan)]" style={{ width: `${pct}%` }} />
            </div>
          )}
        </Link>
      ) : (
        <div className="relative block aspect-[3/4] overflow-hidden bg-[rgba(10,18,32,0.9)]">
          <Image
            src={cover.src}
            alt={`Locked cover for Issue #${issue.issueNumber}: ${issue.title}`}
            fill
            className="object-cover opacity-40 grayscale"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
              Issue #{issue.issueNumber}
            </p>
            <h2 className="font-display text-xl text-white">{issue.title}</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{lockReason}</p>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-[var(--text-muted)]">{issue.subtitle}</p>
        {(issue.shelfBadge || issue.volumeFinale) && (
          <p
            className="w-fit rounded-sm bg-[rgba(255,184,77,0.12)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--amber)] ring-1 ring-[rgba(255,184,77,0.35)]"
            aria-label={issue.shelfBadge || "Volume finale"}
          >
            {issue.shelfBadge || "Volume Finale"}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          <span>{issue.publishedAt}</span>
          <span aria-hidden>·</span>
          <span>{issue.readingTimeMinutes} min</span>
          <span aria-hidden>·</span>
          <span>{issue.pages.length} pages</span>
          <span aria-hidden>·</span>
          <span>{unlockLabel(issue)}</span>
          {pct > 0 && unlocked && (
            <>
              <span aria-hidden>·</span>
              <span className="text-[var(--cyan)]">{pct}% read</span>
            </>
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {unlocked ? (
            <Link href={continueHref} className="btn-primary focus-ring text-sm">
              {pct > 0 && !progress?.completed ? "Continue" : "Read Now"}
            </Link>
          ) : (
            <span className="btn-secondary cursor-not-allowed text-sm opacity-70">Locked</span>
          )}
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={() => onToggleFavorite?.(issue.slug)}
            aria-pressed={progress?.favorite ?? false}
          >
            {progress?.favorite ? "Favorited" : "Favorite"}
          </button>
          <button type="button" className="btn-secondary focus-ring text-sm" onClick={share}>
            Share
          </button>
        </div>
      </div>
    </article>
  );
}
