import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { ROOT } from "./lib";

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

const dir = path.join(ROOT, "game/assets/creatures");
mkdirSync(dir, { recursive: true });

for (const species of SPECIES) {
  const content = `import type { CreatureAssetConfig } from "@/lib/assets/types";
import { DEFAULT_BATTLE_ANIMATIONS } from "@/lib/assets/types";

const ${species}Asset: CreatureAssetConfig = {
  species: "${species}",
  battle: {
    frameWidth: 512,
    frameHeight: 512,
    scale: 0.72,
    originX: 0.5,
    originY: 0.88,
    animations: { ...DEFAULT_BATTLE_ANIMATIONS },
  },
  overworld: {
    frameWidth: 128,
    frameHeight: 128,
    scale: 1,
    originX: 0.5,
    originY: 0.82,
  },
};

export default ${species}Asset;
`;
  writeFileSync(path.join(dir, `${species}.asset.ts`), content);
}

console.log(`Wrote ${SPECIES.length} species asset configs`);
