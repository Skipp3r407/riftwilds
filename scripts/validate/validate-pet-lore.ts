/**
 * Validate species lore coverage + word counts for every LAUNCH_SPECIES.
 * npm run validate:pet-lore
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES } from "../../src/game/creatures/species-catalog";
import { getSpeciesLore, listSpeciesLore } from "../../src/content/pets/lore";
import { SpeciesLoreSchema, wordCount } from "../../src/lib/pets/lore-types";
import { generatePetBiography } from "../../src/lib/pets/backstory-generator";
import {
  ARTIFACTS_DIR,
  ensureArtifactsDir,
  writeJsonReport,
  type ValidationReport,
} from "../lib/report-writer";

const REPORT_DIR = path.join(ARTIFACTS_DIR, "pet-lore");

function main() {
  const gaps: string[] = [];
  const wordIssues: string[] = [];
  const schemaIssues: string[] = [];
  const rows: Record<string, unknown>[] = [];

  for (const sp of LAUNCH_SPECIES) {
    const lore = getSpeciesLore(sp.slug);
    if (!lore) {
      gaps.push(sp.slug);
      rows.push({ slug: sp.slug, status: "MISSING" });
      continue;
    }

    const parsed = SpeciesLoreSchema.safeParse(lore);
    if (!parsed.success) {
      schemaIssues.push(`${sp.slug}: ${parsed.error.issues[0]?.message ?? "schema fail"}`);
    }

    const short = wordCount(lore.shortBio);
    const standard = wordCount(lore.standardBio);
    const full = wordCount(lore.fullLore);
    if (short < 40 || short > 75) wordIssues.push(`${sp.slug} short=${short}`);
    if (standard < 150 || standard > 260) wordIssues.push(`${sp.slug} standard=${standard}`);
    if (full < 450) wordIssues.push(`${sp.slug} full=${full}`);
    if (lore.nativeRegion !== sp.habitat) {
      wordIssues.push(`${sp.slug} region mismatch lore=${lore.nativeRegion} catalog=${sp.habitat}`);
    }
    if (lore.affinity !== sp.affinity) {
      wordIssues.push(`${sp.slug} affinity mismatch`);
    }
    if (/pokemon|digimon|nintendo|pikachu|eevee/i.test(lore.fullLore)) {
      wordIssues.push(`${sp.slug} possible copyrighted terminology`);
    }

    rows.push({
      slug: sp.slug,
      name: lore.name,
      affinity: lore.affinity,
      region: lore.nativeRegion,
      short,
      standard,
      full,
      status: lore.status,
    });
  }

  // Determinism smoke: same seed => same biography
  const sample = LAUNCH_SPECIES[0]!;
  const input = {
    petPublicId: "pet_validate_01",
    speciesSlug: sample.slug,
    speciesName: sample.name,
    affinity: sample.affinity,
    rarity: "COMMON",
    geneticsSeed: "gen_validate_stable",
    temperament: sample.temperament,
    eggType: "COMMON_RIFT",
    eggOriginSource: "STARTER_CLAIM" as const,
    nativeRegion: sample.habitat,
    generation: 0,
    favoriteFoodHint: sample.food,
  };
  const a = generatePetBiography(input);
  const b = generatePetBiography(input);
  const deterministicOk = a.personalBio === b.personalBio && a.originStory === b.originStory;

  // Bred vs wild contradiction check
  const bred = generatePetBiography({
    ...input,
    eggOriginSource: "BREEDING",
    parentLabels: ["Parent A", "Parent B"],
    generation: 2,
  });
  const wildClaim =
    /washed ashore|discovered|recovered from|found (beneath|inside|beside|near)|gifted by/i.test(
      bred.originStory,
    ) && !/breeding|bred|parents/i.test(bred.originStory);
  const bredOk = !wildClaim && !!bred.familyHistory;

  const critical = [
    ...gaps.map((s) => `Missing lore: ${s}`),
    ...schemaIssues,
    ...wordIssues,
    ...(!deterministicOk ? ["Biography generator not deterministic"] : []),
    ...(!bredOk ? ["Bred origin may contradict breeding rules"] : []),
  ];

  ensureArtifactsDir();
  mkdirSync(REPORT_DIR, { recursive: true });

  const report: ValidationReport = {
    name: "validate-pet-lore",
    generatedAt: new Date().toISOString(),
    assumptions: [
      "Short bio target 40–70 words (soft max 75)",
      "Standard bio target 150–250 words (soft max 260)",
      "Full lore minimum ~450 words (ideal 500–900)",
    ],
    sections: [
      {
        title: "Species lore coverage",
        status: gaps.length === 0 ? "PASS" : "FAIL",
        summary: `${LAUNCH_SPECIES.length - gaps.length}/${LAUNCH_SPECIES.length} species have lore files`,
        details: { missing: gaps },
      },
      {
        title: "Word counts & consistency",
        status: wordIssues.length === 0 ? "PASS" : "FAIL",
        summary: wordIssues.length
          ? `${wordIssues.length} word/consistency issues`
          : "All word bands acceptable",
        details: { issues: wordIssues },
      },
      {
        title: "Schema parse",
        status: schemaIssues.length === 0 ? "PASS" : "FAIL",
        summary: schemaIssues.length
          ? `${schemaIssues.length} schema issues`
          : "All lore objects parse",
      },
      {
        title: "Biography determinism",
        status: deterministicOk ? "PASS" : "FAIL",
        summary: deterministicOk
          ? "Same seed produces identical biography"
          : "Non-deterministic biography",
      },
      {
        title: "Bred origin safety",
        status: bredOk ? "PASS" : "FAIL",
        summary: bredOk
          ? "Bred pets use breeding-compatible origins + family history"
          : "Bred contradiction detected",
        details: { originStory: bred.originStory, familyHistory: bred.familyHistory },
      },
      {
        title: "Catalog size",
        status: LAUNCH_SPECIES.length === 100 && listSpeciesLore().length === 100 ? "PASS" : "WARN",
        summary: `catalog=${LAUNCH_SPECIES.length} lore=${listSpeciesLore().length}`,
      },
    ],
    criticalFailures: critical,
    ok: critical.length === 0,
  };

  const jsonPath = writeJsonReport("pet-lore/validate-pet-lore.json", report);
  writeFileSync(
    path.join(REPORT_DIR, "contact-sheet.md"),
    [
      "# Pet Lore Contact Sheet",
      "",
      `| Species | Affinity | Region | Short | Standard | Full | Status |`,
      `|---|---|---|---:|---:|---:|---|`,
      ...rows.map((r) => {
        const row = r as {
          slug: string;
          name?: string;
          affinity?: string;
          region?: string;
          short?: number;
          standard?: number;
          full?: number;
          status: string;
        };
        return `| ${row.name ?? row.slug} | ${row.affinity ?? "—"} | ${row.region ?? "—"} | ${row.short ?? "—"} | ${row.standard ?? "—"} | ${row.full ?? "—"} | ${row.status} |`;
      }),
      "",
      `Generated ${report.generatedAt}. OK=${report.ok}`,
    ].join("\n"),
    "utf8",
  );

  writeFileSync(
    path.join(REPORT_DIR, "summary.md"),
    `# Pet Lore Validation\n\nOK: ${report.ok}\n\n${report.sections.map((s) => `- **${s.status}** ${s.title}: ${s.summary}`).join("\n")}\n\nCritical: ${critical.join("; ") || "none"}\n`,
    "utf8",
  );

  console.log(`Pet lore validation: ${jsonPath} ok=${report.ok}`);
  if (!report.ok) process.exitCode = 1;
}

main();
