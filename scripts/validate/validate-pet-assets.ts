/**
 * Validate launch species portrait assets on disk.
 * Expects public/assets/pets/{slug}.png for every LAUNCH_SPECIES entry.
 */

import { existsSync, statSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES } from "../../src/game/creatures/species-catalog";
import { creaturePortraitPath } from "../../src/lib/assets/paths";
import {
  ARTIFACTS_DIR,
  ensureArtifactsDir,
  writeJsonReport,
  type ValidationReport,
} from "../lib/report-writer";
import { writeFileSync } from "fs";

const ROOT = path.resolve(__dirname, "../..");

function main() {
  const missing: string[] = [];
  const empty: string[] = [];
  const present: string[] = [];

  for (const sp of LAUNCH_SPECIES) {
    const webPath = creaturePortraitPath(sp.slug);
    const diskPath = path.join(ROOT, "public", webPath.replace(/^\//, ""));
    if (!existsSync(diskPath)) {
      missing.push(sp.slug);
      continue;
    }
    const size = statSync(diskPath).size;
    if (size < 100) empty.push(sp.slug);
    else present.push(sp.slug);
  }

  const critical = [
    ...missing.map((s) => `Missing portrait PNG: ${s}`),
    ...empty.map((s) => `Empty/tiny portrait PNG: ${s}`),
  ];

  const report: ValidationReport = {
    name: "validate-pet-assets",
    generatedAt: new Date().toISOString(),
    assumptions: ["Portrait path = /assets/pets/{slug}.png under public/"],
    sections: [
      {
        title: "Launch species portraits",
        status: critical.length === 0 ? "PASS" : "FAIL",
        summary: `${present.length}/${LAUNCH_SPECIES.length} portraits OK; missing=${missing.length}; empty=${empty.length}`,
        details: { present: present.length, missing, empty },
      },
      {
        title: "Catalog size",
        status: LAUNCH_SPECIES.length === 100 ? "PASS" : "FAIL",
        summary: `${LAUNCH_SPECIES.length} launch species`,
      },
    ],
    criticalFailures: critical,
    ok: critical.length === 0 && LAUNCH_SPECIES.length === 100,
  };

  ensureArtifactsDir();
  const jsonPath = writeJsonReport("validate-pet-assets.json", report);
  writeFileSync(
    path.join(ARTIFACTS_DIR, "validate-pet-assets.md"),
    `# Pet Asset Validation\n\nOK: ${present.length}/${LAUNCH_SPECIES.length}\nMissing: ${missing.join(", ") || "none"}\nEmpty: ${empty.join(", ") || "none"}\n`,
    "utf8",
  );
  console.log(`Pet assets: ${jsonPath} ok=${report.ok}`);
  if (!report.ok) process.exitCode = 1;
}

main();
