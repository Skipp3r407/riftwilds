import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ComicReader } from "@/components/comics/comic-reader";
import { COMIC_ISSUES, getComicIssue, listPublishedComics } from "@/content/comics";
import { adjacentIssues } from "@/lib/comics";

type Props = { params: Promise<{ issueSlug: string }> };

export function generateStaticParams() {
  return COMIC_ISSUES.map((i) => ({ issueSlug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { issueSlug } = await params;
  const issue = getComicIssue(issueSlug);
  if (!issue) return { title: "Comic not found" };
  return {
    title: `Issue #${issue.issueNumber}: ${issue.title} | Legends of the Rift`,
    description: issue.synopsis,
  };
}

export default async function ComicIssuePage({ params }: Props) {
  const { issueSlug } = await params;
  const issue = getComicIssue(issueSlug);
  if (!issue || issue.status === "draft") notFound();

  const { prev, next } = adjacentIssues(listPublishedComics(), issue.slug);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-[var(--text-muted)]">
          Opening reader…
        </div>
      }
    >
      <ComicReader issue={issue} prevSlug={prev?.slug} nextSlug={next?.slug} />
    </Suspense>
  );
}
