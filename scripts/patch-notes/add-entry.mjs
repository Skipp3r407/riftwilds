#!/usr/bin/env node
/**
 * Prepend a stub patch-note entry to src/content/patch-notes.ts
 *
 * Usage:
 *   npm run patch-notes:add -- --title "Short release title"
 *   npm run patch-notes:add -- --title "Hotfix" --version abc1234 --date 2026-07-19
 *   npm run patch-notes:add -- --title "HUD fix" --id 2026-07-19-hud-fix
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const TARGET = path.join(ROOT, "src/content/patch-notes.ts");

function usage(exitCode = 1) {
  console.log(`Usage:
  npm run patch-notes:add -- --title "Short release title" [--version SHA] [--date YYYY-MM-DD] [--id slug]

Prepends a stub entry (newest first) to src/content/patch-notes.ts.
Edit Added / Fixed / Changed / Known issues before you push.
See docs/PATCH_NOTES_WORKFLOW.md`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") usage(0);
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (!val || val.startsWith("--")) {
        console.error(`Missing value for --${key}`);
        usage(1);
      }
      out[key] = val;
      i++;
    }
  }
  return out;
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function escapeTsString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildStub({ id, date, title, version }) {
  const versionLine = version
    ? `\n    version: "${escapeTsString(version)}",`
    : "";
  return `  {
    id: "${escapeTsString(id)}",
    date: "${escapeTsString(date)}",
    title: "${escapeTsString(title)}",${versionLine}
    summary: "TODO: one-line summary of this push.",
    added: ["TODO: player-facing additions"],
    changed: [],
    fixed: ["TODO: fixes"],
    knownIssues: [],
  },
`;
}

const args = parseArgs(process.argv.slice(2));
if (!args.title) {
  console.error("Error: --title is required.\n");
  usage(1);
}

const date = args.date ?? todayUtc();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Error: --date must be YYYY-MM-DD");
  process.exit(1);
}

const id = args.id ?? `${date}-${slugify(args.title) || "update"}`;
const stub = buildStub({
  id,
  date,
  title: args.title,
  version: args.version,
});

const source = fs.readFileSync(TARGET, "utf8");
const marker = "export const PATCH_NOTES: PatchNoteEntry[] = [\n";
const idx = source.indexOf(marker);
if (idx === -1) {
  console.error(`Could not find PATCH_NOTES array marker in ${TARGET}`);
  process.exit(1);
}

if (source.includes(`id: "${id}"`)) {
  console.error(`Error: entry id "${id}" already exists. Pass a unique --id.`);
  process.exit(1);
}

const insertAt = idx + marker.length;
const next = source.slice(0, insertAt) + stub + source.slice(insertAt);
fs.writeFileSync(TARGET, next, "utf8");

console.log(`Prepended stub entry "${id}" to src/content/patch-notes.ts`);
console.log("Fill in the TODO bullets, then commit with your push.");
console.log("Public page: /patch-notes");
