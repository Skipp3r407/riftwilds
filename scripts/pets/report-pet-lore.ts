/**
 * Write a human-readable pet lore report under artifacts/reports/pet-lore/
 * npm run report:pet-lore
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { listSpeciesLore } from "../../src/content/pets/lore";
import { wordCount } from "../../src/lib/pets/lore-types";
import { ARTIFACTS_DIR, ensureArtifactsDir } from "../lib/report-writer";

const REPORT_DIR = path.join(ARTIFACTS_DIR, "pet-lore");

function main() {
  ensureArtifactsDir();
  mkdirSync(REPORT_DIR, { recursive: true });
  const lore = listSpeciesLore().sort((a, b) => a.name.localeCompare(b.name));

  const md = [
    "# Riftwilds Pet Lore Report",
    "",
    `Generated ${new Date().toISOString()}`,
    "",
    `Species with lore: **${lore.length}**`,
    "",
    "## Routes",
    "",
    "- `/codex/riftlings` — encyclopedia index",
    "- `/codex/riftlings/[speciesSlug]` — full lore",
    "- `/pets/[publicPetId]` — personal biography tabs",
    "- `/admin/pets/lore` — admin completeness table",
    "",
    "## Species",
    "",
    ...lore.flatMap((l) => [
      `### ${l.name}`,
      "",
      `- Title: ${l.title}`,
      `- Affinity: ${l.affinity}`,
      `- Region: ${l.nativeRegion}`,
      `- Words: short ${wordCount(l.shortBio)} · standard ${wordCount(l.standardBio)} · full ${wordCount(l.fullLore)}`,
      `- Status: ${l.status}`,
      `- Short: ${l.shortBio}`,
      "",
    ]),
  ].join("\n");

  const out = path.join(REPORT_DIR, "lore-report.md");
  writeFileSync(out, md, "utf8");
  writeFileSync(
    path.join(REPORT_DIR, "lore-index.json"),
    JSON.stringify(
      lore.map((l) => ({
        slug: l.slug,
        name: l.name,
        affinity: l.affinity,
        region: l.nativeRegion,
        status: l.status,
        words: {
          short: wordCount(l.shortBio),
          standard: wordCount(l.standardBio),
          full: wordCount(l.fullLore),
        },
      })),
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Wrote ${out}`);
}

main();
