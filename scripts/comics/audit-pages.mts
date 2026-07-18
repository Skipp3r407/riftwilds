/**
 * Audit every comic page for missing artSrc / missing files.
 * Run: npx tsx scripts/comics/audit-pages.mts
 */
import { existsSync } from "fs";
import { join } from "path";
import { COMIC_ISSUES } from "../../src/content/comics/catalog";

async function main() {
  const issues = COMIC_ISSUES as Array<{
    slug: string;
    issueNumber: number;
    pages: Array<{
      pageNumber: number;
      layout: string;
      artSrc?: string;
      panels: Array<{ artSrc?: string }>;
    }>;
  }>;

  const publicRoot = join(process.cwd(), "public");
  const pagesNoArt: string[] = [];
  const pagesMissingFile: string[] = [];

  for (const issue of issues) {
    for (const page of issue.pages) {
      const artSrc = page.artSrc ?? page.panels.find((p) => p.artSrc)?.artSrc;
      if (!artSrc) {
        pagesNoArt.push(`${issue.slug} p${page.pageNumber} (${page.layout})`);
        continue;
      }
      const disk = join(publicRoot, artSrc.replace(/^\//, ""));
      if (!existsSync(disk)) {
        pagesMissingFile.push(`${issue.slug} p${page.pageNumber}: ${artSrc}`);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        issues: issues.length,
        totalPages: issues.reduce((a, i) => a + i.pages.length, 0),
        noArt: pagesNoArt.length,
        missingFile: pagesMissingFile.length,
        pagesNoArt,
        pagesMissingFile,
      },
      null,
      2,
    ),
  );

  if (pagesNoArt.length || pagesMissingFile.length) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
