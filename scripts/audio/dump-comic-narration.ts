/**
 * Dump speakable comic scripts as JSON for the ElevenLabs narrate pipeline.
 * Usage: npx tsx scripts/audio/dump-comic-narration.ts [issueSlug|--all]
 */
import { COMIC_ISSUES } from "@/content/comics/catalog";
import {
  comicNarrationFileName,
  comicPageNarrationUrl,
  pageHasNarration,
  pageNarrationScript,
} from "@/lib/comics/narration";

const arg = process.argv[2] || "the-first-rift";
const issues =
  arg === "--all" || arg === "all"
    ? COMIC_ISSUES
    : COMIC_ISSUES.filter((i) => i.slug === arg);

if (!issues.length) {
  console.error(JSON.stringify({ error: `Unknown issue slug: ${arg}` }));
  process.exit(1);
}

const payload = {
  version: 1 as const,
  dumpedAt: new Date().toISOString(),
  issues: issues.map((issue) => ({
    slug: issue.slug,
    issueNumber: issue.issueNumber,
    title: issue.title,
    pages: issue.pages
      .filter((p) => pageHasNarration(p))
      .map((p) => {
        const text = pageNarrationScript(p);
        const file = comicNarrationFileName(p.pageNumber);
        return {
          pageNumber: p.pageNumber,
          file,
          src: comicPageNarrationUrl(issue.slug, p.pageNumber),
          text,
          charCount: text.length,
        };
      }),
  })),
};

process.stdout.write(JSON.stringify(payload, null, 2));
