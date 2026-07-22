/**
 * Seed illustrated raw art + bake programmatic lettering for all 10 issues.
 *
 * Art sources (no XAI_API_KEY required):
 *   1) Existing large legacy plates under public/assets/comics/pages/<seedSlug>/
 *   2) Illustrated composites (run comics:composites first for thin issues)
 *   3) Optional Grok when XAI_API_KEY is set (--prefer-grok)
 *
 * Writes lettered WebP to each page's publicArtRel (reader path) and keeps
 * content/.../generated/{raw-art,lettered-pages} in sync.
 *
 * Usage:
 *   node scripts/comics/seed-illustrated-and-letter-all.mjs
 *   node scripts/comics/seed-illustrated-and-letter-all.mjs --issues=1,3,7
 *   node scripts/comics/seed-illustrated-and-letter-all.mjs --story-only
 *   node scripts/comics/seed-illustrated-and-letter-all.mjs --pages=1-25 --force
 *   node scripts/comics/seed-illustrated-and-letter-all.mjs --prefer-grok
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
try {
  require("dotenv").config();
} catch {
  /* optional */
}

const ROOT = path.resolve(import.meta.dirname, "../..");
const FONT_FILE = path.join(ROOT, "assets/fonts/comics/ComicNeue-Bold.ttf");
const W = 1200;
const H = 1600;
const ILLUSTRATED_MIN = 80_000;

const force = process.argv.includes("--force");
const storyOnly = process.argv.includes("--story-only");
const preferGrok = process.argv.includes("--prefer-grok");
const skipComposites = process.argv.includes("--skip-composites");
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));
const issuesArg = process.argv.find((a) => a.startsWith("--issues="));

function parsePages(arg) {
  if (!arg) return null;
  const spec = arg.split("=")[1];
  const set = new Set();
  for (const part of spec.split(",")) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= b; i++) set.add(i);
    } else set.add(Number(part));
  }
  return set;
}
const pageFilter = parsePages(pagesArg);
const issueFilter = issuesArg
  ? new Set(
      issuesArg
        .split("=")[1]
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean),
    )
  : null;

/** @type {{ num: number, slug: string, issue: string, seedSlug: string, pages: number }[]} */
const ISSUES = [
  { num: 1, slug: "the-first-rift", issue: "issue-001", seedSlug: "the-first-rift", pages: 32 },
  { num: 2, slug: "sparks-journey", issue: "issue-002", seedSlug: "sparks-journey", pages: 38 },
  { num: 3, slug: "the-traveling-circus", issue: "issue-003", seedSlug: "the-traveling-circus", pages: 38 },
  { num: 4, slug: "the-lost-city", issue: "issue-004", seedSlug: "the-lost-city", pages: 38 },
  { num: 5, slug: "the-storm-king", issue: "issue-005", seedSlug: "the-storm-king", pages: 38 },
  { num: 6, slug: "the-merchants-secret", issue: "issue-006", seedSlug: "the-merchants-secret", pages: 38 },
  { num: 7, slug: "the-traitors-gate", issue: "issue-007", seedSlug: "the-great-hunt", pages: 39 },
  { num: 8, slug: "the-forge-of-rifts", issue: "issue-008", seedSlug: "the-last-guardian", pages: 39 },
  { num: 9, slug: "the-riftwright", issue: "issue-009", seedSlug: "festival-of-lights", pages: 38 },
  { num: 10, slug: "the-shattered-star", issue: "issue-010", seedSlug: "the-shadow-beyond", pages: 39 },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapWords(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function fontFaceCss() {
  if (!fs.existsSync(FONT_FILE)) return "";
  const b64 = fs.readFileSync(FONT_FILE).toString("base64");
  return `@font-face { font-family: 'RiftComic'; src: url('data:font/ttf;base64,${b64}') format('truetype'); }`;
}

const FONT = fs.existsSync(FONT_FILE) ? "RiftComic, Georgia, serif" : "Georgia, 'Times New Roman', serif";

async function ensureFont() {
  if (fs.existsSync(FONT_FILE)) return;
  fs.mkdirSync(path.dirname(FONT_FILE), { recursive: true });
  const url = "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Bold.ttf";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    fs.writeFileSync(FONT_FILE, Buffer.from(await res.arrayBuffer()));
    console.log("Downloaded Comic Neue Bold");
  } catch (e) {
    console.warn("Font download failed — Georgia fallback:", e.message);
  }
}

function balloonPath(kind, x, y, bw, bh, tail) {
  const left = x - bw / 2;
  const top = y - bh / 2;
  const r = kind === "thought" || kind === "telepathy" ? Math.min(28, bh / 2) : 18;
  let tailSvg = "";
  const cx = x;
  const midY = y;
  if (!["narration", "caption", "sfx", "magic"].includes(kind)) {
    const tw = 16;
    const th = 18;
    if (tail?.startsWith("up")) {
      tailSvg = `<polygon points="${cx - tw},${top + 4} ${cx + tw},${top + 4} ${cx},${top - th}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else if (tail === "left") {
      tailSvg = `<polygon points="${left + 4},${midY - tw} ${left + 4},${midY + tw} ${left - th},${midY}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else if (tail === "right") {
      tailSvg = `<polygon points="${left + bw - 4},${midY - tw} ${left + bw - 4},${midY + tw} ${left + bw + th},${midY}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else {
      tailSvg = `<polygon points="${cx - tw},${top + bh - 4} ${cx + tw},${top + bh - 4} ${cx},${top + bh + th}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    }
  }
  return { left, top, r, tailSvg };
}

function renderBubbleSvg(b) {
  const kind = b.kind || "speech";
  const maxW = Math.round((W * (b.maxWidthPct || 34)) / 100);
  const cx = Math.round(((b.x ?? 50) / 100) * W);
  const cy = Math.round(((b.y ?? 50) / 100) * H);

  if (kind === "sfx") {
    const lines = wrapWords(String(b.text).toUpperCase(), 18);
    const fontSize = 40;
    const lineH = 46;
    const blockH = lines.length * lineH;
    const startY = cy - blockH / 2 + fontSize;
    const tspans = lines
      .map((line, i) => `<tspan x="${cx}" y="${startY + i * lineH}" text-anchor="middle">${escapeXml(line)}</tspan>`)
      .join("");
    return `<text font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="#ffb84d" stroke="rgba(20,14,10,0.75)" stroke-width="3" paint-order="stroke" letter-spacing="0.1em">${tspans}</text>`;
  }

  if (kind === "narration" || kind === "caption") {
    const lines = wrapWords(b.text, kind === "caption" ? 36 : 42);
    const fontSize = kind === "caption" ? 22 : 23;
    const lineH = fontSize + 8;
    const padX = 20;
    const padY = 14;
    const bw = Math.min(maxW, 640);
    const bh = padY * 2 + lines.length * lineH;
    const left = Math.max(24, Math.min(W - bw - 24, cx - bw / 2));
    const top = Math.max(24, Math.min(H - bh - 48, cy - bh / 2));
    const tspans = lines
      .map((line, i) => `<tspan x="${left + padX}" y="${top + padY + fontSize + i * lineH}">${escapeXml(line)}</tspan>`)
      .join("");
    return `
      <rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="4" ry="4"
            fill="rgba(20,14,10,0.88)" stroke="rgba(232,213,176,0.5)" stroke-width="2"/>
      <text font-family="${FONT}" font-size="${fontSize}" fill="#f5ead2"
            font-style="${kind === "narration" ? "italic" : "normal"}" font-weight="${kind === "caption" ? "700" : "400"}">${tspans}</text>`;
  }

  const speaker = b.speaker ? String(b.speaker).toUpperCase() : "";
  const bodyLines = wrapWords(b.text, 26);
  const fontSize = kind === "shout" ? 23 : 21;
  const lineH = fontSize + 7;
  const padX = 18;
  const padY = 12;
  const speakerH = speaker ? 16 : 0;
  const bw = Math.min(maxW, 400);
  const bh = padY * 2 + speakerH + bodyLines.length * lineH;
  const { left, top, r, tailSvg } = balloonPath(kind, cx, cy, bw, bh, b.tail);
  const fill =
    kind === "shout"
      ? "rgba(255,236,200,0.96)"
      : kind === "creature"
        ? "rgba(236,252,240,0.95)"
        : kind === "magic"
          ? "rgba(18,40,28,0.9)"
          : kind === "telepathy"
            ? "rgba(230,240,255,0.95)"
            : "rgba(255,252,245,0.96)";
  const stroke =
    kind === "thought" || kind === "telepathy" || kind === "whisper"
      ? "rgba(42,33,24,0.4)"
      : "rgba(42,33,24,0.5)";
  const dash =
    kind === "thought" || kind === "telepathy"
      ? `stroke-dasharray="6 4"`
      : kind === "creature"
        ? `stroke-dasharray="3 3"`
        : "";
  const textFill = kind === "magic" ? "#d8ffe8" : "#2a2118";
  let yCursor = top + padY + (speaker ? 13 : fontSize);
  const parts = [];
  if (speaker) {
    parts.push(
      `<text x="${left + padX}" y="${yCursor}" font-family="${FONT}" font-size="12" fill="#8b5a3c" letter-spacing="0.1em">${escapeXml(speaker)}</text>`,
    );
    yCursor += 16;
  }
  bodyLines.forEach((line, i) => {
    parts.push(
      `<text x="${left + padX}" y="${yCursor + i * lineH}" font-family="${FONT}" font-size="${fontSize}" fill="${textFill}" font-weight="${kind === "shout" ? "700" : "400"}" font-style="${kind === "whisper" ? "italic" : "normal"}">${escapeXml(line)}</text>`,
    );
  });
  return `${tailSvg}<rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${dash}/>${parts.join("")}`;
}

function collectBubbles(page) {
  const bubbles = [];
  for (const p of page.panels || []) {
    for (const b of p.bubbles || []) bubbles.push(b);
    for (const b of p.lines || []) bubbles.push(b);
  }
  if (!bubbles.length) {
    for (const b of page.dialogue || []) bubbles.push(b);
    for (const b of page.captions || []) bubbles.push(b);
    for (const b of page.soundEffects || []) bubbles.push(b);
  }
  return bubbles
    .filter((b) => b?.text?.trim())
    .sort((a, b) => (a.readOrder ?? 0) - (b.readOrder ?? 0));
}

function renderOverlay(page) {
  const parts = [`<style>${fontFaceCss()}</style>`];
  parts.push(
    `<text x="${W - 48}" y="${H - 28}" font-family="${FONT}" font-size="16" fill="rgba(245,234,210,0.75)" text-anchor="end">${page.pageNumber}</text>`,
  );
  for (const b of collectBubbles(page)) {
    parts.push(renderBubbleSvg(b));
  }
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${parts.join("\n")}
</svg>`);
}

async function callGrok(prompt, negativePrompt) {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  const model = process.env.XAI_IMAGE_MODEL || "grok-imagine-image";
  const full = `${prompt} Avoid: ${negativePrompt || "readable text, logos, watermarks"}`;
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: full,
      n: 1,
      aspect_ratio: "3:4",
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Grok ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No b64_json");
  return Buffer.from(b64, "base64");
}

function findSeedFile(seedSlug, pageNumber) {
  const dir = path.join(ROOT, "public/assets/comics/pages", seedSlug);
  if (!fs.existsSync(dir)) return null;
  const candidates = [
    `page-${String(pageNumber).padStart(2, "0")}.webp`,
    `page-${String(pageNumber).padStart(3, "0")}.webp`,
    `page-${String(pageNumber).padStart(2, "0")}.png`,
    `page-${String(pageNumber).padStart(3, "0")}.png`,
  ];
  for (const name of candidates) {
    const p = path.join(dir, name);
    if (fs.existsSync(p) && fs.statSync(p).size >= ILLUSTRATED_MIN) return p;
  }
  // wrap when seed pack is shorter than issue page count
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(webp|png)$/i.test(f) && fs.statSync(path.join(dir, f)).size >= ILLUSTRATED_MIN)
    .sort();
  if (!files.length) return null;
  return path.join(dir, files[(pageNumber - 1) % files.length]);
}

function countIllustratedSeeds(seedSlug) {
  const dir = path.join(ROOT, "public/assets/comics/pages", seedSlug);
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(webp|png)$/i.test(f) && fs.statSync(path.join(dir, f)).size >= ILLUSTRATED_MIN).length;
}

function ensureCompositesForThinSeeds(issues) {
  const need = issues.filter((i) => countIllustratedSeeds(i.seedSlug) < 25).map((i) => i.seedSlug);
  const unique = [...new Set(need)];
  if (!unique.length || skipComposites) return;
  console.log(`Generating illustrated composites for: ${unique.join(", ")}`);
  for (const slug of unique) {
    const r = spawnSync(
      process.execPath,
      [path.join(ROOT, "scripts/comics/generate-illustrated-composites.mjs"), slug, "--force", "--pages=40"],
      { cwd: ROOT, stdio: "inherit" },
    );
    if (r.status !== 0) {
      console.warn(`Composite generation failed for ${slug} (exit ${r.status})`);
    }
  }
}

function publicPagePath(meta, page) {
  if (page.publicArtRel) {
    const rel = page.publicArtRel.replace(/^\/?assets\//, "assets/");
    return path.join(ROOT, "public", rel);
  }
  const id = String(page.pageNumber).padStart(3, "0");
  return path.join(ROOT, "public/assets/comics", meta.slug, meta.issue, "pages", `page-${id}.webp`);
}

function loadPages(meta) {
  const dir = path.join(ROOT, "content/comics", meta.slug, meta.issue, "pages");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

async function processIssue(meta) {
  const issueRoot = path.join(ROOT, "content/comics", meta.slug, meta.issue);
  const rawDir = path.join(issueRoot, "generated/raw-art");
  const letteredDir = path.join(issueRoot, "generated/lettered-pages");
  const thumbsDir = path.join(issueRoot, "generated/thumbnails");
  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(letteredDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });

  const pages = loadPages(meta);
  const status = {
    updatedAt: new Date().toISOString(),
    issue: meta.num,
    slug: meta.slug,
    grokConfigured: Boolean(process.env.XAI_API_KEY),
    seedSlug: meta.seedSlug,
    seedIllustratedCount: countIllustratedSeeds(meta.seedSlug),
    pages: {},
    summary: {},
  };

  let seeded = 0;
  let lettered = 0;
  let grokOk = 0;
  let storyLettered = 0;
  let errors = 0;

  for (const page of pages) {
    if (pageFilter && !pageFilter.has(page.pageNumber)) continue;
    const role = page.bookRole || page.role || "story";
    if (storyOnly && role !== "story") continue;

    const id = String(page.pageNumber).padStart(3, "0");
    const rawPath = path.join(rawDir, `page-${id}.webp`);
    const letteredPath = path.join(letteredDir, `page-${id}.webp`);
    const publicPath = publicPagePath(meta, page);
    const thumbPath = path.join(thumbsDir, `page-${id}.webp`);
    fs.mkdirSync(path.dirname(publicPath), { recursive: true });

    const entry = {
      pageNumber: page.pageNumber,
      role,
      artSource: null,
      artStatus: "pending",
      letteringStatus: "pending",
      bubbleCount: collectBubbles(page).length,
      publicPath: path.relative(ROOT, publicPath).replace(/\\/g, "/"),
      error: null,
    };

    try {
      const publicOk =
        !force && fs.existsSync(publicPath) && fs.statSync(publicPath).size >= ILLUSTRATED_MIN;
      if (publicOk && fs.existsSync(letteredPath) && fs.statSync(letteredPath).size >= ILLUSTRATED_MIN) {
        entry.artStatus = "cached";
        entry.letteringStatus = "cached";
        lettered++;
        if (role === "story") storyLettered++;
        status.pages[page.pageNumber] = entry;
        continue;
      }

      let artBuf = null;
      if (!force && fs.existsSync(rawPath) && fs.statSync(rawPath).size >= ILLUSTRATED_MIN) {
        artBuf = fs.readFileSync(rawPath);
        entry.artSource = "cached-raw";
        entry.artStatus = "cached";
      } else if (preferGrok && process.env.XAI_API_KEY && (page.grokPrompt || page.artPrompt)) {
        try {
          artBuf = await callGrok(page.grokPrompt || page.artPrompt, page.negativePrompt);
          entry.artSource = "grok";
          entry.artStatus = "ok";
          grokOk++;
          await new Promise((r) => setTimeout(r, Number(process.env.COMIC_GROK_DELAY_MS || 1200)));
        } catch (e) {
          entry.error = `grok: ${e.message}`;
          console.warn(`Grok failed #${meta.num} p${page.pageNumber}: ${e.message}`);
        }
      }

      if (!artBuf) {
        const seed = findSeedFile(meta.seedSlug, page.pageNumber);
        if (!seed) throw new Error(`No illustrated seed for ${meta.seedSlug} p${page.pageNumber}`);
        artBuf = await sharp(seed).resize(W, H, { fit: "cover" }).webp({ quality: 88 }).toBuffer();
        entry.artSource = path.relative(ROOT, seed).replace(/\\/g, "/");
        entry.artStatus = "seeded";
        seeded++;
      }

      await sharp(artBuf).resize(W, H, { fit: "cover" }).webp({ quality: 88 }).toFile(rawPath);

      const base = await sharp(rawPath).resize(W, H, { fit: "cover" }).png().toBuffer();
      const overlay = renderOverlay(page);
      await sharp(base)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .webp({ quality: 90 })
        .toFile(letteredPath);
      fs.copyFileSync(letteredPath, publicPath);

      // Keep legacy catalog path for issue #003 (emit still references pages/<slug>/)
      if (meta.num === 3) {
        const legacy = path.join(
          ROOT,
          "public/assets/comics/pages/the-traveling-circus",
          `page-${String(page.pageNumber).padStart(2, "0")}.webp`,
        );
        fs.mkdirSync(path.dirname(legacy), { recursive: true });
        fs.copyFileSync(letteredPath, legacy);
      }

      await sharp(letteredPath).resize(240, 320, { fit: "cover" }).webp({ quality: 75 }).toFile(thumbPath);

      page.generationStatus = entry.artStatus;
      page.letteringStatus = "ok";
      page.bakedLettering = true;
      page.composedPlate = true;
      page.publicArtRel = `assets/comics/${meta.slug}/${meta.issue}/pages/page-${id}.webp`;
      fs.writeFileSync(path.join(issueRoot, "pages", `page-${id}.json`), JSON.stringify(page, null, 2) + "\n");

      entry.letteringStatus = "ok";
      lettered++;
      if (role === "story") storyLettered++;
    } catch (e) {
      entry.error = e.message;
      errors++;
      console.error(`#${meta.num} p${page.pageNumber} failed:`, e.message);
    }
    status.pages[page.pageNumber] = entry;
    if (page.pageNumber % 10 === 0) console.log(`  #${meta.num} … through page ${page.pageNumber}`);
  }

  status.summary = {
    seeded,
    lettered,
    storyLettered,
    grokOk,
    errors,
    resume: `node scripts/comics/seed-illustrated-and-letter-all.mjs --issues=${meta.num} --force`,
    grokResume: `set XAI_API_KEY=... && node scripts/comics/seed-illustrated-and-letter-all.mjs --issues=${meta.num} --prefer-grok --force`,
  };
  const statusFile = path.join(issueRoot, "reports/GENERATION_STATUS.json");
  fs.mkdirSync(path.dirname(statusFile), { recursive: true });
  fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
  console.log(
    `ok #${String(meta.num).padStart(3, "0")} ${meta.slug}: lettered=${lettered} story=${storyLettered} seeded=${seeded} grok=${grokOk} errors=${errors}`,
  );
  return status.summary;
}

async function main() {
  await ensureFont();
  const selected = ISSUES.filter((i) => !issueFilter || issueFilter.has(i.num));
  if (!selected.length) {
    console.error("No issues selected");
    process.exit(1);
  }

  console.log(
    `Seed+letter ${selected.length} issue(s) | force=${force} storyOnly=${storyOnly} grok=${Boolean(process.env.XAI_API_KEY && preferGrok)}`,
  );
  ensureCompositesForThinSeeds(selected);

  const rollup = { updatedAt: new Date().toISOString(), issues: {} };
  for (const meta of selected) {
    rollup.issues[meta.num] = await processIssue(meta);
  }

  const rollupPath = path.join(ROOT, "public/assets/comics/GENERATION_STATUS_ALL.json");
  fs.writeFileSync(rollupPath, JSON.stringify(rollup, null, 2));
  console.log(`Rollup → ${rollupPath}`);
  console.log(JSON.stringify(rollup, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
