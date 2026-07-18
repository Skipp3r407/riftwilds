/**
 * Generate Riftwilds game asset library (≥1000 catalogued sprites).
 *
 * Engines:
 *   procedural (default) — SVG → WebP via sharp (no API key)
 *   grok — xAI Images API when XAI_API_KEY is set (rate-limited, resumable)
 *
 * Usage:
 *   node scripts/assets/generate-game-library.mjs
 *   node scripts/assets/generate-game-library.mjs --engine=grok --limit=20
 *   node scripts/assets/generate-game-library.mjs --force --concurrency=12
 *   node scripts/assets/generate-game-library.mjs --catalog-only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { expandCatalog, categoryBreakdown, bootCriticalEntries } from "./game-library/defs.mjs";
import { renderEntrySvg } from "./game-library/render-svg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT_LIB = path.join(ROOT, "public/assets/game/library");
const ARTIFACTS = path.join(ROOT, "artifacts/assets/game-library");
const PROGRESS_PATH = path.join(ARTIFACTS, "progress.json");
const CATALOG_JSON = path.join(ROOT, "src/content/assets/game-library.json");
const CATALOG_TS = path.join(ROOT, "src/content/assets/game-library.ts");
const REPORT_MD = path.join(ARTIFACTS, "GENERATION_REPORT.md");

const STYLE =
  "Original Riftwilds IP only — never copy other games or brands. " +
  "Painterly soft-isometric game-ready cutout sprite, transparent background, " +
  "warm earth greens browns sandstone, cyan rift and amber hearth accents only, " +
  "no purple AI-fantasy default, no text, logos, watermarks, or UI chrome.";

function parseArgs(argv) {
  const opts = {
    engine: process.env.GAME_LIBRARY_ENGINE || "procedural",
    force: false,
    limit: null,
    concurrency: Number(process.env.GAME_LIBRARY_CONCURRENCY || 10),
    catalogOnly: false,
    delayMs: Number(process.env.GAME_LIBRARY_GROK_DELAY_MS || 1200),
  };
  for (const a of argv) {
    if (a === "--force") opts.force = true;
    else if (a === "--catalog-only") opts.catalogOnly = true;
    else if (a.startsWith("--engine=")) opts.engine = a.slice(9);
    else if (a.startsWith("--limit=")) opts.limit = Number(a.slice(8));
    else if (a.startsWith("--concurrency=")) opts.concurrency = Number(a.slice(14));
    else if (a.startsWith("--delay=")) opts.delayMs = Number(a.slice(8));
  }
  return opts;
}

function absFromPublicPath(publicPath) {
  return path.join(ROOT, "public", publicPath.replace(/^\//, ""));
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) return { done: {}, failed: {} };
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
  } catch {
    return { done: {}, failed: {} };
  }
}

function saveProgress(progress) {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf8");
}

async function writeProcedural(entry) {
  const abs = absFromPublicPath(entry.path);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const svg = renderEntrySvg(entry);
  const size = entry.size ?? 96;
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(abs);
  return { bytes: fs.statSync(abs).size, engine: "procedural" };
}

async function writeGrok(entry, delayMs) {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("XAI_API_KEY missing");
  const model = process.env.XAI_IMAGE_MODEL || "grok-imagine-image";
  const prompt = `${entry.prompt} ${STYLE}`;
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      aspect_ratio: "1:1",
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Grok ${res.status}: ${text.slice(0, 240)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No b64_json in Grok response");
  const abs = absFromPublicPath(entry.path);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const size = entry.size ?? 96;
  const buf = Buffer.from(b64, "base64");
  // Normalize + soft matte via ensureAlpha; prefer WebP
  await sharp(buf)
    .ensureAlpha()
    .resize(size, size, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(abs);
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  return { bytes: fs.statSync(abs).size, engine: "grok" };
}

async function mapPool(items, concurrency, fn) {
  let i = 0;
  const results = new Array(items.length);
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

function writeCatalogFiles(entries, meta) {
  fs.mkdirSync(path.dirname(CATALOG_JSON), { recursive: true });
  const slim = entries.map((e) => ({
    id: e.id,
    category: e.category,
    path: e.path,
    tags: e.tags,
    biome: e.biome,
    layer: e.layer,
    anchors: e.anchors,
    label: e.label,
    family: e.family,
    variant: e.variant,
    bootCritical: e.bootCritical || false,
  }));
  const doc = {
    version: 1,
    generatedAt: new Date().toISOString(),
    count: slim.length,
    engine: meta.engine,
    enginesUsed: meta.enginesUsed,
    categoryBreakdown: categoryBreakdown(entries),
    bootCritical: bootCriticalEntries(entries).map((e) => e.id),
    entries: slim,
  };
  fs.writeFileSync(CATALOG_JSON, JSON.stringify(doc, null, 2), "utf8");

  const ts = `/**
 * Riftwilds game asset library catalog (generated).
 * Regenerate: npm run assets:generate:library
 * Do not hand-edit entries — update scripts/assets/game-library/defs.mjs
 */

export type GameLibraryLayer = "ground" | "prop" | "entity" | "structure" | "overhead" | "fx";

export type GameLibraryEntry = {
  id: string;
  category: string;
  path: string;
  tags: string[];
  biome: string;
  layer: GameLibraryLayer;
  anchors: { x: number; y: number };
  label: string;
  family: string;
  variant?: Record<string, string>;
  bootCritical?: boolean;
};

export type GameLibraryCatalog = {
  version: number;
  generatedAt: string;
  count: number;
  engine: string;
  enginesUsed: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  bootCritical: string[];
  entries: GameLibraryEntry[];
};

import catalogJson from "./game-library.json";

export const GAME_LIBRARY = catalogJson as unknown as GameLibraryCatalog;

export function getLibraryEntry(id: string): GameLibraryEntry | undefined {
  return GAME_LIBRARY.entries.find((e) => e.id === id);
}

export function libraryByTag(tag: string): GameLibraryEntry[] {
  return GAME_LIBRARY.entries.filter((e) => e.tags.includes(tag));
}

export function libraryByCategory(category: string): GameLibraryEntry[] {
  return GAME_LIBRARY.entries.filter((e) => e.category === category);
}

export function libraryBootCritical(): GameLibraryEntry[] {
  return GAME_LIBRARY.entries.filter((e) => e.bootCritical);
}
`;
  fs.writeFileSync(CATALOG_TS, ts, "utf8");
}

function writeReport(meta) {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const lines = [
    `# Game Asset Library — Generation Report`,
    ``,
    `- **When:** ${meta.generatedAt}`,
    `- **Catalog entries:** ${meta.count}`,
    `- **Files written this run:** ${meta.written}`,
    `- **Skipped (resume):** ${meta.skipped}`,
    `- **Failed:** ${meta.failed}`,
    `- **Primary engine requested:** \`${meta.engine}\``,
    `- **Engines used:** ${JSON.stringify(meta.enginesUsed)}`,
    `- **Grok / XAI_API_KEY:** ${meta.grokAvailable ? "present" : "**missing** — procedural SVG→WebP used"}`,
    `- **Blender CLI:** ${meta.blenderAvailable ? "on PATH (optional renders unused by default)" : "not on PATH"}`,
    ``,
    `## Category breakdown`,
    ``,
    ...Object.entries(meta.breakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Regenerate`,
    ``,
    `\`\`\`bash`,
    `npm run assets:generate:library`,
    `# With Grok (costs credits, rate-limited):`,
    `GAME_LIBRARY_ENGINE=grok XAI_API_KEY=... npm run assets:generate:library -- --limit=50`,
    `npm run assets:install:library`,
    `\`\`\``,
    ``,
    `See docs/art/GAME_ASSET_LIBRARY.md`,
    ``,
  ];
  fs.writeFileSync(REPORT_MD, lines.join("\n"), "utf8");
  fs.writeFileSync(path.join(ARTIFACTS, "latest-report.json"), JSON.stringify(meta, null, 2), "utf8");
}

async function detectBlender() {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.platform === "win32" ? "where" : "which", ["blender"], {
    encoding: "utf8",
  });
  return r.status === 0;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let entries = expandCatalog();
  if (opts.limit != null && Number.isFinite(opts.limit)) {
    entries = entries.slice(0, opts.limit);
  }

  console.log(`Catalog expanded: ${expandCatalog().length} total; processing ${entries.length}`);

  const grokAvailable = Boolean(process.env.XAI_API_KEY);
  let engine = opts.engine;
  if (engine === "grok" && !grokAvailable) {
    console.warn("GAME_LIBRARY_ENGINE=grok but XAI_API_KEY missing — falling back to procedural.");
    engine = "procedural";
  }

  writeCatalogFiles(expandCatalog(), {
    engine,
    enginesUsed: { pending: expandCatalog().length },
  });

  if (opts.catalogOnly) {
    console.log("Catalog-only write complete:", CATALOG_JSON);
    return;
  }

  const progress = opts.force ? { done: {}, failed: {} } : loadProgress();
  const enginesUsed = { procedural: 0, grok: 0 };
  let written = 0;
  let skipped = 0;
  let failed = 0;

  const todo = entries.filter((e) => {
    const abs = absFromPublicPath(e.path);
    if (!opts.force && fs.existsSync(abs) && fs.statSync(abs).size > 80) {
      skipped++;
      progress.done[e.id] = { path: e.path, skipped: true };
      return false;
    }
    return true;
  });

  console.log(`Generating ${todo.length} assets (concurrency=${opts.concurrency}, engine=${engine})...`);

  await mapPool(todo, engine === "grok" ? Math.min(2, opts.concurrency) : opts.concurrency, async (entry) => {
    try {
      const result =
        engine === "grok" ? await writeGrok(entry, opts.delayMs) : await writeProcedural(entry);
      enginesUsed[result.engine] = (enginesUsed[result.engine] || 0) + 1;
      progress.done[entry.id] = { path: entry.path, bytes: result.bytes, engine: result.engine };
      delete progress.failed[entry.id];
      written++;
      if (written % 50 === 0) {
        saveProgress(progress);
        process.stdout.write(`  … ${written}/${todo.length}\n`);
      }
    } catch (err) {
      failed++;
      progress.failed[entry.id] = String(err?.message || err);
      console.warn(`FAIL ${entry.id}:`, err?.message || err);
    }
  });

  saveProgress(progress);

  // Ensure every catalog entry has a file (fill gaps with procedural)
  const full = expandCatalog();
  let filled = 0;
  for (const e of full) {
    const abs = absFromPublicPath(e.path);
    if (!fs.existsSync(abs) || fs.statSync(abs).size < 80) {
      await writeProcedural(e);
      enginesUsed.procedural++;
      filled++;
    }
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    count: full.length,
    written: written + filled,
    skipped,
    failed,
    engine,
    enginesUsed,
    grokAvailable,
    blenderAvailable: await detectBlender(),
    breakdown: categoryBreakdown(full),
  };

  writeCatalogFiles(full, meta);
  writeReport(meta);

  console.log(`Done. Catalog=${full.length} written=${meta.written} skipped=${skipped} failed=${failed}`);
  console.log(`Report: ${REPORT_MD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
