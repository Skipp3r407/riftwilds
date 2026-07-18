"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComicIssue, ComicProgressIssue } from "@/content/comics/types";
import { readingPercent } from "@/lib/comics";

type Props = {
  issue: ComicIssue;
  progress?: ComicProgressIssue;
  onToggleFavorite?: (slug: string) => void;
};

export function ComicCoverCard({ issue, progress, onToggleFavorite }: Props) {
  const cover = issue.covers.find((c) => c.kind === "standard") ?? issue.covers[0]!;
  const pct = progress ? readingPercent(progress, issue.pages.length) : 0;
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
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm text-[var(--text-muted)]">{issue.subtitle}</p>
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          <span>{issue.publishedAt}</span>
          <span aria-hidden>·</span>
          <span>{issue.readingTimeMinutes} min</span>
          <span aria-hidden>·</span>
          <span>{issue.pages.length} pages</span>
          {pct > 0 && (
            <>
              <span aria-hidden>·</span>
              <span className="text-[var(--cyan)]">{pct}% read</span>
            </>
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link href={continueHref} className="btn-primary focus-ring text-sm">
            {pct > 0 && !progress?.completed ? "Continue" : "Read Now"}
          </Link>
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
