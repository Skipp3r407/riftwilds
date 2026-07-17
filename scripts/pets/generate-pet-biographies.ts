/**
 * Generate sample biographies for every launch species (report / review).
 * Does not mutate hatchery store. npm run generate:pet-biographies
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES } from "../../src/game/creatures/species-catalog";
import { generatePetBiography } from "../../src/lib/pets/backstory-generator";
import { ARTIFACTS_DIR, ensureArtifactsDir } from "../lib/report-writer";

const REPORT_DIR = path.join(ARTIFACTS_DIR, "pet-lore");

function main() {
  ensureArtifactsDir();
  mkdirSync(REPORT_DIR, { recursive: true });

  const bios = LAUNCH_SPECIES.map((sp) => {
    const bio = generatePetBiography({
      petPublicId: `pet_sample_${sp.slug}`,
      speciesSlug: sp.slug,
      speciesName: sp.name,
      affinity: sp.affinity,
      rarity: sp.rarityBias,
      geneticsSeed: `gen_sample_${sp.slug}`,
      temperament: sp.temperament,
      eggType: "COMMON_RIFT",
      eggOriginSource: "STARTER_CLAIM",
      nativeRegion: sp.habitat,
      generation: 0,
      favoriteFoodHint: sp.food,
    });
    return {
      speciesSlug: sp.slug,
      title: bio.title,
      originStory: bio.originStory,
      firstMemory: bio.firstMemory,
      uniqueHabit: bio.uniqueHabit,
      mysteryClue: bio.mysteryClue,
      questHooks: bio.personalQuestHooks.map((q) => q.title),
      personalBio: bio.personalBio,
    };
  });

  const out = path.join(REPORT_DIR, "sample-biographies.json");
  writeFileSync(out, JSON.stringify(bios, null, 2), "utf8");
  writeFileSync(
    path.join(REPORT_DIR, "sample-biographies.md"),
    [
      "# Sample Personal Biographies",
      "",
      ...bios.flatMap((b) => [
        `## ${b.speciesSlug}`,
        "",
        `**${b.title}**`,
        "",
        b.personalBio,
        "",
        `- Origin: ${b.originStory}`,
        `- Habit: ${b.uniqueHabit}`,
        `- Mystery: ${b.mysteryClue}`,
        "",
      ]),
    ].join("\n"),
    "utf8",
  );
  console.log(`Wrote ${bios.length} sample biographies to ${out}`);
}

main();
