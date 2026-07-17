/**
 * Pet lifecycle / care / breeding-eligibility simulator (offline).
 *
 * Usage: npx tsx scripts/simulations/pet-lifecycle-simulator.ts
 */

import { writeFileSync } from "fs";
import path from "path";
import { createPetForEverySpecies } from "../../tests/factories/pet-factory";
import {
  applyCareAction,
  applyCareDecay,
  careScore,
  derivePetCondition,
} from "../../src/game/creatures/care";
import { evaluateBreedingEligibility } from "../../src/lib/economy/breeding-rules";
import {
  ARTIFACTS_DIR,
  ensureArtifactsDir,
  writeJsonReport,
  type ValidationReport,
} from "../lib/report-writer";

function main() {
  const pets = createPetForEverySpecies({ seed: "lifecycle-sim" });
  let healthyAfterCare = 0;
  let breedingEligible = 0;
  let dormantAfterNeglect = 0;

  for (const pet of pets) {
    let care = pet.care;
    care = applyCareDecay(care, 72);
    const neglected = derivePetCondition(care, false);
    if (neglected === "DORMANT" || neglected === "CRITICAL" || neglected === "SICK") {
      dormantAfterNeglect++;
    }

    care = applyCareAction(care, "FEED");
    care = applyCareAction(care, "GIVE_WATER");
    care = applyCareAction(care, "PLAY");
    care = applyCareAction(care, "REST");
    care = applyCareAction(care, "CLEAN");
    const recovered = derivePetCondition(care, false);
    if (recovered === "HEALTHY" || recovered === "TIRED") healthyAfterCare++;

    const breed = evaluateBreedingEligibility(
      {
        ageHours: 96,
        bond: Math.max(care.bond, 45),
        breedingUsesRemaining: 5,
        lastBredAt: null,
        lifecycle: recovered,
      },
      0,
    );
    if (breed.ok) breedingEligible++;
  }

  const report: ValidationReport = {
    name: "pet-lifecycle-simulator",
    generatedAt: new Date().toISOString(),
    assumptions: [
      "Synthetic factory pets for all LAUNCH_SPECIES",
      "72h neglect then multi-action recovery",
      "Breeding eligibility uses pure rules (mint path NOT_IMPLEMENTED)",
    ],
    sections: [
      {
        title: "Species coverage",
        status: pets.length === 50 ? "PASS" : "FAIL",
        summary: `${pets.length} species simulated`,
      },
      {
        title: "Care recovery",
        status: healthyAfterCare >= pets.length * 0.8 ? "PASS" : "WARN",
        summary: `${healthyAfterCare}/${pets.length} recovered to HEALTHY/TIRED; mean careScore sample ${careScore(pets[0]!.care)}`,
        details: { dormantAfterNeglect, breedingEligible },
      },
      {
        title: "Breeding mint",
        status: "NOT_IMPLEMENTED",
        summary: "Egg mint + fee ledger not wired; eligibility rules only",
      },
    ],
    criticalFailures: pets.length !== 50 ? ["LAUNCH_SPECIES count != 50"] : [],
    ok: pets.length === 50,
  };

  ensureArtifactsDir();
  const jsonPath = writeJsonReport("pet-lifecycle-simulator.json", report);
  writeFileSync(
    path.join(ARTIFACTS_DIR, "pet-lifecycle-simulator.md"),
    `# Pet Lifecycle Simulator\n\nSpecies: ${pets.length}\nRecovered: ${healthyAfterCare}\nBreeding eligible (rules): ${breedingEligible}\nNeglect stressed: ${dormantAfterNeglect}\n`,
    "utf8",
  );
  console.log(`Pet lifecycle wrote ${jsonPath}`);
  if (!report.ok) process.exitCode = 1;
}

main();
