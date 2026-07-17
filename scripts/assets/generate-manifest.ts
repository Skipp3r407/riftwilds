import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { ROOT } from "./lib";

/** Mirrors STARTER_SPECIES — keep in sync with src/lib/assets/manifest.ts */
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

const now = new Date().toISOString();

function main() {
  const entries = SPECIES.flatMap((slug) => [
    {
      id: `creature-${slug}-profile`,
      path: `/assets/placeholders/creature-${slug}-profile.svg`,
      type: "creature_profile",
      association: slug,
      width: 2048,
      height: 2048,
      status: "planned",
      version: "0.1.0",
      source: "placeholder-generator",
      licenseNotes: "Dev placeholder — not production art",
      createdAt: now,
    },
    {
      id: `creature-${slug}-battle-idle`,
      path: `/assets/placeholders/creature-${slug}-battle.svg`,
      type: "creature_battle",
      association: slug,
      width: 512,
      height: 512,
      frameCount: 8,
      animationSpeedMs: 110,
      loop: true,
      anchor: { x: 0.5, y: 0.88 },
      scale: 0.72,
      status: "planned",
      version: "0.1.0",
      createdAt: now,
    },
  ]);

  const outDir = path.join(ROOT, "public/assets");
  mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, "manifest.json");
  writeFileSync(out, JSON.stringify({ version: 1, generatedAt: now, assets: entries }, null, 2));
  console.log(`Wrote ${entries.length} entries → ${out}`);
}

main();
