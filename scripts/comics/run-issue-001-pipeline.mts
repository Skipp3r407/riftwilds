/**
 * Two-stage Issue #001 pipeline:
 *   1) text-free art (Grok / OpenAI / cursor-local job)
 *   2) programmatic lettering → flattened WebP in public/
 *
 *   npx tsx scripts/comics/run-issue-001-pipeline.mts
 *   npx tsx scripts/comics/run-issue-001-pipeline.mts --lettering-only
 *   npx tsx scripts/comics/run-issue-001-pipeline.mts --from=1 --to=8
 *   npx tsx scripts/comics/run-issue-001-pipeline.mts --seed-from-legacy
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { letteringToSvg, type LetterBubble } from "../../src/lib/comics/lettering-engine";
import { generateComicArt } from "../../src/lib/comics/imageProviders/grokComicProvider";

const ROOT = path.resolve(import.meta.dirname, "../..");
const ISSUE = path.join(ROOT, "content/comics/the-first-rift/issue-001");
const ISSUE_MIRROR = path.join(ROOT, "src/content/comics/the-first-rift/issue-001");
const W = 1200;
const H = 1600;

const letteringOnly = process.argv.includes("--lettering-only");
const seedLegacy = process.argv.includes("--seed-from-legacy");
const fromArg = process.argv.find((a) => a.startsWith("--from="));
const toArg = process.argv.find((a) => a.startsWith("--to="));
const from = fromArg ? Number(fromArg.split("=")[1]) : 1;
const to = toArg ? Number(toArg.split("=")[1]) : 32;

type PageJson = {
  pageNumber: number;
  id: string;
  role: string;
  title?: string | null;
  artPrompt: string;
  panels: { caption?: string; lines: LetterBubble[] }[];
  generationStatus: string;
  letteringStatus: string;
  cleanArtRel: string;
  letteredArtRel: string;
  publicArtRel: string;
};

function loadPage(n: number): PageJson {
  const nn = String(n).padStart(3, "0");
  return JSON.parse(fs.readFileSync(path.join(ISSUE, "pages", `page-${nn}.json`), "utf8"));
}

function savePage(page: PageJson) {
  const nn = String(page.pageNumber).padStart(3, "0");
  fs.writeFileSync(path.join(ISSUE, "pages", `page-${nn}.json`), JSON.stringify(page, null, 2) + "\n");
}

function legacyPlate(n: number): string | null {
  // Map issue-001 book pages onto older 40-plate folder where useful
  const map: Record<number, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 3,
    5: 7,
    6: 8,
    7: 9,
    8: 10,
    9: 11,
    10: 12,
    11: 12,
    12: 14,
    13: 13,
    14: 14,
    15: 14,
    16: 15,
    17: 16,
    18: 17,
    19: 20,
    20: 21,
    21: 19,
    22: 22,
    23: 23,
    24: 24,
    25: 25,
    26: 26,
    27: 27,
    28: 28,
    29: 29,
    30: 30,
    31: 31,
    32: 32,
  };
  const legacyN = map[n] ?? n;
  const p = path.join(
    ROOT,
    "public/assets/comics/pages/the-first-rift",
    `page-${String(legacyN).padStart(2, "0")}.webp`,
  );
  return fs.existsSync(p) ? p : null;
}

async function ensureCleanArt(page: PageJson): Promise<boolean> {
  const cleanAbs = path.join(ISSUE, page.cleanArtRel);
  if (fs.existsSync(cleanAbs) && fs.statSync(cleanAbs).size > 50_000) {
    page.generationStatus = "generated";
    return true;
  }

  if (seedLegacy) {
    const legacy = legacyPlate(page.pageNumber);
    if (legacy) {
      fs.mkdirSync(path.dirname(cleanAbs), { recursive: true });
      await sharp(legacy).resize(W, H, { fit: "cover" }).png().toFile(cleanAbs);
      page.generationStatus = "seeded-legacy";
      return true;
    }
  }

  if (letteringOnly) {
    page.generationStatus = page.generationStatus || "pending";
    return fs.existsSync(cleanAbs);
  }

  const result = await generateComicArt({
    id: page.id,
    prompt: page.artPrompt,
    outputPath: cleanAbs,
    aspectRatio: "3:4",
  });
  page.generationStatus = result.status === "generated" ? "generated" : result.status;
  if (result.message) {
    const reportDir = path.join(ISSUE, "reports");
    fs.mkdirSync(reportDir, { recursive: true });
    fs.appendFileSync(
      path.join(reportDir, "art-jobs.log"),
      `${page.pageNumber}\t${result.status}\t${result.message}\n`,
    );
  }
  return result.ok;
}

async function letterPage(page: PageJson): Promise<boolean> {
  const cleanAbs = path.join(ISSUE, page.cleanArtRel);
  if (!fs.existsSync(cleanAbs)) {
    page.letteringStatus = "blocked-no-art";
    return false;
  }

  const bubbles: LetterBubble[] = page.panels.flatMap((panel, pi) => {
    const count = page.panels.length;
    return (panel.lines || []).map((line, li) => {
      // If multi-panel without coords, spread vertically by panel
      if (line.x != null && line.y != null) return line;
      const slotY = ((pi + 0.35) / count) * 100;
      return {
        ...line,
        x: line.x ?? (li % 2 === 0 ? 32 : 68),
        y: line.y ?? slotY,
      };
    });
  });

  const caption = page.panels.find((p) => p.caption)?.caption ?? null;
  const svg = letteringToSvg({
    width: W,
    height: H,
    title: page.role === "title" || page.role === "front-cover" ? page.title : null,
    caption,
    bubbles,
  });

  const base = await sharp(cleanAbs).resize(W, H, { fit: "cover" }).png().toBuffer();
  const letteredAbs = path.join(ISSUE, page.letteredArtRel);
  const publicAbs = path.join(ROOT, "public", page.publicArtRel);
  fs.mkdirSync(path.dirname(letteredAbs), { recursive: true });
  fs.mkdirSync(path.dirname(publicAbs), { recursive: true });

  const out = await sharp(base)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: 88 })
    .toBuffer();
  fs.writeFileSync(letteredAbs, out);
  fs.writeFileSync(publicAbs, out);
  page.letteringStatus = "lettered";
  return true;
}

async function main() {
  let artOk = 0;
  let letterOk = 0;
  let blocked = 0;

  for (let n = from; n <= to; n++) {
    const page = loadPage(n);
    const hasArt = await ensureCleanArt(page);
    if (hasArt) artOk += 1;
    const didLetter = await letterPage(page);
    if (didLetter) letterOk += 1;
    else blocked += 1;
    savePage(page);
    console.log(
      `p${String(n).padStart(3, "0")} art=${page.generationStatus} letter=${page.letteringStatus}`,
    );
  }

  const issue = JSON.parse(fs.readFileSync(path.join(ISSUE, "issue.json"), "utf8"));
  issue.pages = issue.pages.map((p: { pageNumber: number }) => {
    const page = loadPage(p.pageNumber);
    return {
      ...p,
      generationStatus: page.generationStatus,
      letteringStatus: page.letteringStatus,
    };
  });
  fs.writeFileSync(path.join(ISSUE, "issue.json"), JSON.stringify(issue, null, 2) + "\n");

  const status = {
    updatedAt: new Date().toISOString(),
    from,
    to,
    artReady: artOk,
    lettered: letterOk,
    blocked,
    resume: `npx tsx scripts/comics/run-issue-001-pipeline.mts --from=${from} --to=${to} --seed-from-legacy`,
    resumeArt: `COMIC_IMAGE_PROVIDER=grok XAI_API_KEY=… npx tsx scripts/comics/run-issue-001-pipeline.mts --from=1 --to=32`,
  };
  fs.mkdirSync(path.join(ISSUE, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(ISSUE, "reports", "GENERATION_STATUS.json"),
    JSON.stringify(status, null, 2) + "\n",
  );
  // Mirror page status JSON into src/content tree
  try {
    fs.mkdirSync(path.join(ISSUE_MIRROR, "pages"), { recursive: true });
    fs.mkdirSync(path.join(ISSUE_MIRROR, "reports"), { recursive: true });
    for (let n = from; n <= to; n++) {
      const nn = String(n).padStart(3, "0");
      const src = path.join(ISSUE, "pages", `page-${nn}.json`);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(ISSUE_MIRROR, "pages", `page-${nn}.json`));
      }
    }
    fs.copyFileSync(
      path.join(ISSUE, "issue.json"),
      path.join(ISSUE_MIRROR, "issue.json"),
    );
    fs.copyFileSync(
      path.join(ISSUE, "reports", "GENERATION_STATUS.json"),
      path.join(ISSUE_MIRROR, "reports", "GENERATION_STATUS.json"),
    );
  } catch {
    /* mirror best-effort */
  }
  console.log(JSON.stringify(status, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
