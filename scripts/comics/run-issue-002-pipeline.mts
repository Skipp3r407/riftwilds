/**
 * Two-stage Issue #002 pipeline (reuses lettering-engine + grokComicProvider):
 *   1) text-free art
 *   2) programmatic lettering → flattened WebP in public/
 *
 *   npx tsx scripts/comics/run-issue-002-pipeline.mts
 *   npx tsx scripts/comics/run-issue-002-pipeline.mts --lettering-only
 *   npx tsx scripts/comics/run-issue-002-pipeline.mts --from=1 --to=8
 *   npx tsx scripts/comics/run-issue-002-pipeline.mts --seed-placeholder
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { letteringToSvg, type LetterBubble } from "../../src/lib/comics/lettering-engine";
import { generateComicArt } from "../../src/lib/comics/imageProviders/grokComicProvider";

const ROOT = path.resolve(import.meta.dirname, "../..");
const ISSUE = path.join(ROOT, "content/comics/sparks-journey/issue-002");
const W = 1200;
const H = 1600;

const letteringOnly = process.argv.includes("--lettering-only");
const seedPlaceholder = process.argv.includes("--seed-placeholder");
const fromArg = process.argv.find((a) => a.startsWith("--from="));
const toArg = process.argv.find((a) => a.startsWith("--to="));
const from = fromArg ? Number(fromArg.split("=")[1]) : 1;
const to = toArg ? Number(toArg.split("=")[1]) : 38;

type Bubble = LetterBubble & { panelId?: string; readOrder?: number };

type PageJson = {
  pageNumber: number;
  id?: string;
  bookRole?: string;
  role?: string;
  title?: string | null;
  grokPrompt?: string;
  artPrompt?: string;
  panels: { id?: string; caption?: string; bubbles?: Bubble[]; lines?: LetterBubble[]; description?: string }[];
  dialogue?: Bubble[];
  captions?: Bubble[];
  soundEffects?: Bubble[];
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

function collectBubbles(page: PageJson): LetterBubble[] {
  const fromPanels = page.panels.flatMap((panel, pi) => {
    const raw = panel.bubbles || panel.lines || [];
    const count = Math.max(page.panels.length, 1);
    return raw.map((line, li) => {
      if (line.x != null && line.y != null) return line as LetterBubble;
      const slotY = ((pi + 0.35) / count) * 100;
      return {
        ...line,
        x: line.x ?? (li % 2 === 0 ? 32 : 68),
        y: line.y ?? slotY,
      } as LetterBubble;
    });
  });
  if (fromPanels.length) return fromPanels;
  const flat = [...(page.dialogue || []), ...(page.captions || []), ...(page.soundEffects || [])];
  return flat.map((b, i) => ({
    kind: b.kind,
    speaker: b.speaker,
    text: b.text,
    x: b.x ?? 50,
    y: b.y ?? 20 + (i % 5) * 14,
    tail: b.tail,
    maxWidthPct: b.maxWidthPct,
  }));
}

async function ensureCleanArt(page: PageJson): Promise<boolean> {
  const cleanAbs = path.join(ISSUE, page.cleanArtRel);
  if (fs.existsSync(cleanAbs) && fs.statSync(cleanAbs).size > 50_000) {
    page.generationStatus = "generated";
    return true;
  }

  if (seedPlaceholder) {
    fs.mkdirSync(path.dirname(cleanAbs), { recursive: true });
    const role = page.bookRole || page.role || "story";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1a2e24"/>
          <stop offset="55%" stop-color="#243d4a"/>
          <stop offset="100%" stop-color="#3a2a18"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="48" y="48" width="${W - 96}" height="${H - 96}" fill="none" stroke="#7ec8c4" stroke-width="3" stroke-dasharray="14 10" opacity="0.35"/>
      <circle cx="${W / 2}" cy="${H * 0.42}" r="90" fill="#c9a227" opacity="0.25"/>
      <circle cx="${W / 2}" cy="${H * 0.42}" r="48" fill="#5ec8d6" opacity="0.35"/>
    </svg>`;
    await sharp(Buffer.from(svg)).png().toFile(cleanAbs);
    page.generationStatus = "seeded-placeholder";
    return true;
  }

  if (letteringOnly) {
    page.generationStatus = page.generationStatus || "pending";
    return fs.existsSync(cleanAbs);
  }

  const prompt = page.grokPrompt || page.artPrompt || "";
  const result = await generateComicArt({
    id: page.id || `sparks-journey-p${page.pageNumber}`,
    prompt,
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

  const bubbles = collectBubbles(page);
  const role = page.bookRole || page.role || "story";
  const svg = letteringToSvg({
    width: W,
    height: H,
    title: role === "title" || role === "front-cover" ? page.title : null,
    caption: null,
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
    const pagePath = path.join(ISSUE, "pages", `page-${String(n).padStart(3, "0")}.json`);
    if (!fs.existsSync(pagePath)) continue;
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

  const status = {
    updatedAt: new Date().toISOString(),
    from,
    to,
    artReady: artOk,
    lettered: letterOk,
    blocked,
    resume: `npx tsx scripts/comics/run-issue-002-pipeline.mts --from=${from} --to=${to}`,
    resumeArt: `COMIC_IMAGE_PROVIDER=grok XAI_API_KEY=… npx tsx scripts/comics/run-issue-002-pipeline.mts --from=1 --to=38`,
    resumePlaceholder: `npx tsx scripts/comics/run-issue-002-pipeline.mts --seed-placeholder --from=1 --to=38`,
    letteringOnly: `npx tsx scripts/comics/run-issue-002-pipeline.mts --lettering-only --from=1 --to=38`,
  };
  fs.mkdirSync(path.join(ISSUE, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(ISSUE, "reports", "GENERATION_STATUS.json"),
    JSON.stringify(status, null, 2) + "\n",
  );
  console.log(JSON.stringify(status, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
