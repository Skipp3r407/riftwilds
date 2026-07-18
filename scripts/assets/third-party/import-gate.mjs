#!/usr/bin/env node
/**
 * Import gate scaffold — refuses to copy any non-runtime-eligible third-party asset.
 * Does NOT download packs. After human approval, a future importer may copy from
 * private-assets/approved/ into public/ only when status is APPROVED / NEEDS_ATTRIBUTION.
 *
 * Usage: node scripts/assets/third-party/import-gate.mjs [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const REGISTRY = path.join(ROOT, "assets/licenses/third-party-assets.json");

const RUNTIME_OK = new Set(["APPROVED", "NEEDS_ATTRIBUTION", "IN_USE"]);
const BLOCKED = new Set(["DISCOVERED", "LICENSE_REVIEW", "REJECTED", "RESTRICTED"]);

function main() {
  if (!fs.existsSync(REGISTRY)) {
    console.error("Missing registry:", REGISTRY);
    process.exit(1);
  }
  const doc = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  let blockedAttempts = 0;
  for (const r of doc.records ?? []) {
    if (r.runtimePath && BLOCKED.has(r.status)) {
      console.error(`BLOCK: ${r.id} status=${r.status} has runtimePath — remove before import`);
      blockedAttempts++;
    }
    if (!RUNTIME_OK.has(r.status) && r.privatePath?.includes("approved")) {
      console.warn(`WARN: ${r.id} under approved/ folder but status=${r.status}`);
    }
  }
  if (blockedAttempts > 0) {
    console.error(`Import gate failed: ${blockedAttempts} restricted runtime path(s)`);
    process.exit(2);
  }
  console.log(
    `Import gate OK — ${doc.records.length} records. No downloads performed. Awaiting human approval for DISCOVERED / LICENSE_REVIEW.`,
  );
}

main();
