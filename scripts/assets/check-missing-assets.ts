import { existsSync } from "fs";
import path from "path";
import { ROOT, PLACEHOLDERS_DIR, SOURCE_DIR } from "./lib";

const SPECIES = [
  "cindercub",
  "mossprig",
  "bubbloon",
  "voltkit",
  "pebblit",
  "wisplet",
  "frostuft",
  "alloyfin",
  "sunmote",
  "noxling",
  "brambleback",
  "zephyroo",
  "glimmermoth",
  "magmole",
  "tiderune",
  "gearling",
  "bloomble",
  "astralynx",
];

const requiredPlaceholders = ["profile", "card", "icon", "silhouette", "battle"];

function main() {
  const missing: string[] = [];
  for (const slug of SPECIES) {
    for (const kind of requiredPlaceholders) {
      const p = path.join(PLACEHOLDERS_DIR, `creature-${slug}-${kind}.svg`);
      if (!existsSync(p)) missing.push(p);
    }
    const prompt = path.join(ROOT, "asset-prompts/creatures", `${slug}.md`);
    if (!existsSync(prompt)) missing.push(prompt);
  }

  console.log(`Source art directory: ${SOURCE_DIR} (approved masters go here)`);
  if (missing.length) {
    console.error("Missing assets/prompts:");
    missing.forEach((m) => console.error(" -", m));
    process.exit(1);
  }
  console.log("All starter placeholders + prompt files present.");
}

main();
