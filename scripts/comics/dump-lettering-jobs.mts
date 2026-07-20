/**
 * Dump per-page lettering jobs (bubbles + titles) for bake-comic-lettering.mjs
 *
 *   npx tsx scripts/comics/dump-lettering-jobs.mts
 *   npx tsx scripts/comics/dump-lettering-jobs.mts the-first-rift
 */
import fs from "node:fs";
import path from "node:path";
import { COMIC_ISSUES, getComicIssue } from "../../src/content/comics/catalog";
import { resolveBubbleLayout } from "../../src/lib/comics/bubble-layout";
import type { ComicIssue, ComicPage } from "../../src/content/comics/types";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "artifacts/comics/lettering");

function flattenPage(page: ComicPage) {
  const panels = page.panels;
  if (panels.length <= 1) {
    return resolveBubbleLayout(panels.flatMap((p) => p.bubbles));
  }
  // Remap panel-local coords → page space (matches composedPlate reader)
  const flat = panels.flatMap((panel, panelIndex) => {
    const frame = panel.frame ?? { x: 0, y: 0, w: 100, h: 100 };
    return panel.bubbles.map((bubble, bubbleIndex) => {
      const lx = bubble.x ?? 50;
      const ly = bubble.y ?? 50;
      return {
        ...bubble,
        x: frame.x + (lx / 100) * frame.w,
        y: frame.y + (ly / 100) * frame.h,
        readOrder: bubble.readOrder ?? panelIndex * 20 + bubbleIndex,
      };
    });
  });
  return resolveBubbleLayout(flat);
}

function jobForPage(issue: ComicIssue, page: ComicPage) {
  const bubbles = flattenPage(page);
  const caption = page.panels.find((p) => p.caption)?.caption;
  return {
    id: `${issue.slug}-p${String(page.pageNumber).padStart(2, "0")}`,
    issueSlug: issue.slug,
    pageNumber: page.pageNumber,
    role: page.role,
    title: page.title ?? null,
    caption: caption ?? null,
    loreSidebar: page.loreSidebar ?? null,
    plateRel: `public/assets/comics/pages/${issue.slug}/page-${String(page.pageNumber).padStart(2, "0")}.webp`,
    bubbles: bubbles.map((b) => ({
      kind: b.kind,
      speaker: b.speaker ?? null,
      text: b.text,
      x: b.x,
      y: b.y,
      tail: b.tail,
      maxWidthPct: b.maxWidthPct,
    })),
  };
}

function main() {
  const slug = process.argv[2];
  fs.mkdirSync(OUT, { recursive: true });
  const issues = slug
    ? ([getComicIssue(slug)].filter(Boolean) as ComicIssue[])
    : COMIC_ISSUES;
  if (!issues.length) {
    console.error("No issue:", slug);
    process.exit(1);
  }
  const all = [];
  for (const issue of issues) {
    const jobs = issue.pages.map((p) => jobForPage(issue, p));
    const outPath = path.join(OUT, `${issue.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2), "utf8");
    all.push(...jobs);
    console.log(`wrote ${jobs.length} → ${path.relative(ROOT, outPath)}`);
  }
  fs.writeFileSync(path.join(OUT, "all.json"), JSON.stringify(all, null, 2), "utf8");
  console.log(`total ${all.length} jobs`);
}

main();
