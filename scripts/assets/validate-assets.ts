import { existsSync, readdirSync, statSync } from "fs";
import path from "path";
import sharp from "sharp";
import { SOURCE_DIR, BATTLE, OVERWORLD } from "./lib";

type Issue = { file: string; message: string };

async function validatePng(file: string): Promise<Issue[]> {
  const issues: Issue[] = [];
  const img = sharp(file);
  const meta = await img.metadata();
  if (meta.format !== "png") {
    issues.push({ file, message: `Expected PNG, got ${meta.format}` });
  }
  if (!meta.hasAlpha) {
    issues.push({ file, message: "Missing alpha channel / transparency" });
  }
  if (!meta.width || !meta.height) {
    issues.push({ file, message: "Missing dimensions" });
    return issues;
  }

  const base = path.basename(file);
  if (base.includes("battle") && (meta.width !== BATTLE.frameWidth || meta.height !== BATTLE.frameHeight)) {
    if (meta.width % BATTLE.frameWidth !== 0) {
      issues.push({
        file,
        message: `Unexpected battle size ${meta.width}x${meta.height} (want ${BATTLE.frameWidth}x${BATTLE.frameHeight} or sheet multiple)`,
      });
    }
  }
  if (base.includes("overworld") && meta.width !== OVERWORLD.frameWidth && meta.width % OVERWORLD.frameWidth !== 0) {
    issues.push({
      file,
      message: `Unexpected overworld size ${meta.width}x${meta.height}`,
    });
  }
  if (base.includes("profile") && (meta.width !== 2048 || meta.height !== 2048)) {
    issues.push({ file, message: `Profile should be 2048x2048, got ${meta.width}x${meta.height}` });
  }

  return issues;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.toLowerCase().endsWith(".png")) out.push(full);
  }
  return out;
}

async function main() {
  const files = walk(SOURCE_DIR);
  if (files.length === 0) {
    console.log(`No source PNGs in ${SOURCE_DIR} — validation skipped (placeholders OK).`);
    return;
  }
  const all: Issue[] = [];
  for (const file of files) {
    all.push(...(await validatePng(file)));
  }
  if (all.length) {
    console.error("Validation failed:");
    for (const i of all) console.error(`- ${i.file}: ${i.message}`);
    process.exit(1);
  }
  console.log(`Validated ${files.length} PNG(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
