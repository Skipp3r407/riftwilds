/**
 * Riftwilds ElevenLabs narration pipeline.
 *
 * Comics: per-page VO from Legends of the Rift catalog dialogue/narration.
 * Commercials: regenerates commercial VO via scripts/commercials/generate-vo.mjs
 *              forced to the ElevenLabs engine (then rebuild videos separately).
 *
 * Usage:
 *   npm run assets:narrate
 *   npm run assets:narrate -- --dry-run
 *   npm run assets:narrate -- --comics --issue=the-first-rift
 *   npm run assets:narrate -- --commercials
 *   npm run assets:narrate -- --all
 *
 * Env:
 *   ELEVENLABS_API_KEY   (required for real synthesis; dry-run works without)
 *   ELEVENLABS_VOICE_ID  (optional warm narrator — default Rachel)
 *   ELEVENLABS_MODEL_ID  (optional)
 *
 * Outputs:
 *   public/assets/audio/comics/{slug}/page-NN.mp3
 *   public/assets/audio/comics/MANIFEST.json
 *   .cache/elevenlabs/ (temp dumps)
 *   public/assets/commercials/audio/*-vo.m4a (via generate-vo when --commercials)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_ELEVENLABS_MODEL_ID,
  DEFAULT_ELEVENLABS_VOICE_ID,
  getElevenLabsConfig,
  loadDotEnv,
  REPO_ROOT,
  writeElevenLabsMp3,
} from "./elevenlabs-client.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = REPO_ROOT;
const comicsOut = path.join(root, "public/assets/audio/comics");
const cacheDir = path.join(root, ".cache/elevenlabs");
const manifestPath = path.join(comicsOut, "MANIFEST.json");

loadDotEnv(root);
fs.mkdirSync(comicsOut, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

function parseArgs(argv) {
  const flags = new Set();
  const opts = { issue: "the-first-rift" };
  for (const a of argv) {
    if (a === "--dry-run") flags.add("dry-run");
    else if (a === "--comics") flags.add("comics");
    else if (a === "--commercials") flags.add("commercials");
    else if (a === "--all") flags.add("all");
    else if (a === "--force") flags.add("force");
    else if (a.startsWith("--issue=")) opts.issue = a.slice("--issue=".length);
    else if (a === "--help" || a === "-h") flags.add("help");
  }
  if (!flags.has("comics") && !flags.has("commercials") && !flags.has("all")) {
    flags.add("comics");
    flags.add("commercials");
  }
  if (flags.has("all")) {
    flags.add("comics");
    flags.add("commercials");
    opts.issue = "all";
  }
  return { flags, opts };
}

function dumpComicScripts(issueArg) {
  const dumpArg = issueArg === "all" ? "--all" : issueArg;
  const dumpTs = path.join(__dirname, "dump-comic-narration.ts");
  const tsxCli = path.join(root, "node_modules/tsx/dist/cli.mjs");
  const r = fs.existsSync(tsxCli)
    ? spawnSync(process.execPath, [tsxCli, dumpTs, dumpArg], {
        encoding: "utf8",
        cwd: root,
        maxBuffer: 20 * 1024 * 1024,
      })
    : spawnSync("npx", ["tsx", dumpTs, dumpArg], {
        encoding: "utf8",
        cwd: root,
        maxBuffer: 20 * 1024 * 1024,
        shell: true,
      });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || r.error);
    throw new Error("Failed to dump comic narration scripts");
  }
  // tsx/npm may print warnings before JSON — take the last JSON object
  const out = String(r.stdout || "");
  const start = out.indexOf("{");
  const end = out.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error("dump-comic-narration produced no JSON");
  }
  const json = JSON.parse(out.slice(start, end + 1));
  const dumpFile = path.join(
    cacheDir,
    `comic-scripts-${String(dumpArg).replace(/[^\w.-]+/g, "_")}.json`,
  );
  fs.writeFileSync(dumpFile, JSON.stringify(json, null, 2), "utf8");
  return { json, dumpFile };
}

async function narrateComics({ issue, dryRun, force }) {
  const cfg = getElevenLabsConfig();
  const { json, dumpFile } = dumpComicScripts(issue);
  console.log(`Comic scripts dumped → ${path.relative(root, dumpFile)}`);

  const manifest = {
    version: 1,
    provider: dryRun || !cfg.hasKey ? "none" : "elevenlabs",
    voiceId: cfg.voiceId,
    modelId: cfg.modelId,
    generatedAt: new Date().toISOString(),
    tip: cfg.hasKey
      ? "Re-run npm run assets:narrate -- --comics to refresh clips."
      : "Set ELEVENLABS_API_KEY then re-run npm run assets:narrate (see docs/audio/ELEVENLABS_NARRATION.md).",
    issues: [],
  };

  if (!dryRun && !cfg.hasKey) {
    console.warn(
      "No ELEVENLABS_API_KEY — writing pending manifest + scripts only (reader stays silent).",
    );
  }

  for (const issueData of json.issues) {
    const issueDir = path.join(comicsOut, issueData.slug);
    fs.mkdirSync(issueDir, { recursive: true });
    const scriptOut = path.join(issueDir, "SCRIPT.json");
    fs.writeFileSync(scriptOut, JSON.stringify(issueData, null, 2), "utf8");

    const pages = [];
    for (const page of issueData.pages) {
      const outFile = path.join(issueDir, page.file);
      const entry = {
        pageNumber: page.pageNumber,
        file: page.file,
        src: page.src,
        text: page.text,
        status: "pending",
      };

      if (dryRun) {
        entry.status = "skipped";
        pages.push(entry);
        console.log(`  [dry-run] ${issueData.slug}/${page.file} (${page.charCount} chars)`);
        continue;
      }

      if (!cfg.hasKey) {
        pages.push(entry);
        continue;
      }

      if (fs.existsSync(outFile) && !force && fs.statSync(outFile).size > 200) {
        entry.status = "ready";
        entry.bytes = fs.statSync(outFile).size;
        pages.push(entry);
        console.log(`  [skip] ${issueData.slug}/${page.file} (exists)`);
        continue;
      }

      try {
        const { bytes } = await writeElevenLabsMp3(page.text, outFile);
        entry.status = "ready";
        entry.bytes = bytes;
        console.log(`  [ok] ${issueData.slug}/${page.file} (${bytes} bytes)`);
      } catch (err) {
        entry.status = "pending";
        console.error(`  [fail] ${issueData.slug}/${page.file}: ${err.message}`);
      }
      pages.push(entry);
    }

    manifest.issues.push({
      slug: issueData.slug,
      issueNumber: issueData.issueNumber,
      title: issueData.title,
      pages,
    });
  }

  // Merge with existing manifest pages for other issues when regenerating one issue
  if (issue !== "all" && fs.existsSync(manifestPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const keep = (prev.issues || []).filter(
        (i) => !manifest.issues.some((n) => n.slug === i.slug),
      );
      manifest.issues = [...keep, ...manifest.issues].sort(
        (a, b) => a.issueNumber - b.issueNumber,
      );
    } catch {
      // replace
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Manifest → ${path.relative(root, manifestPath)}`);
  return manifest;
}

function narrateCommercials({ dryRun }) {
  const cfg = getElevenLabsConfig();
  if (dryRun) {
    console.log(
      "[dry-run] Would run: COMMERCIAL_TTS=elevenlabs node scripts/commercials/generate-vo.mjs",
    );
    console.log(
      `[dry-run] voice=${cfg.voiceId || DEFAULT_ELEVENLABS_VOICE_ID} model=${cfg.modelId || DEFAULT_ELEVENLABS_MODEL_ID}`,
    );
    return { dryRun: true };
  }
  if (!cfg.hasKey) {
    console.warn(
      "No ELEVENLABS_API_KEY — skipping commercial VO. Existing Edge/SAPI tracks remain.",
    );
    return { skipped: true };
  }

  console.log("Generating commercial VO with ElevenLabs…");
  const r = spawnSync(
    process.execPath,
    [path.join(root, "scripts/commercials/generate-vo.mjs")],
    {
      encoding: "utf8",
      cwd: root,
      env: {
        ...process.env,
        COMMERCIAL_TTS: "elevenlabs",
        ELEVENLABS_API_KEY: cfg.apiKey,
        ELEVENLABS_VOICE_ID: cfg.voiceId,
        ELEVENLABS_MODEL_ID: cfg.modelId,
      },
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) {
    throw new Error("commercials:vo (ElevenLabs) failed");
  }
  console.log(
    "Commercial VO written. Rebuild videos: npm run commercials:build (mux music + new VO).",
  );
  return { ok: true };
}

function printHelp() {
  console.log(`ElevenLabs narration for Riftwilds

Usage:
  npm run assets:narrate -- [options]

Options:
  --comics              Generate comic page VO (default with --commercials)
  --commercials         Regenerate commercial VO via ElevenLabs
  --all                 All published comic issues + commercials
  --issue=<slug>        Comic issue slug (default: the-first-rift)
  --dry-run             Dump scripts / print plan; no API calls
  --force               Re-synthesize even if MP3 exists
  -h, --help            Show this help

Env: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (optional), ELEVENLABS_MODEL_ID
Docs: docs/audio/ELEVENLABS_NARRATION.md`);
}

async function main() {
  const { flags, opts } = parseArgs(process.argv.slice(2));
  if (flags.has("help")) {
    printHelp();
    return;
  }

  const dryRun = flags.has("dry-run");
  const force = flags.has("force");
  const cfg = getElevenLabsConfig();
  console.log(
    `ElevenLabs narrate | dryRun=${dryRun} hasKey=${cfg.hasKey} voice=${cfg.voiceId}`,
  );

  if (flags.has("comics")) {
    await narrateComics({ issue: opts.issue, dryRun, force });
  }
  if (flags.has("commercials")) {
    narrateCommercials({ dryRun });
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
