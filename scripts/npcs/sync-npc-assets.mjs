import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);
const BASE = path.join(ROOT, "public/assets/npcs");
const catalogPath = path.join(ROOT, "src/content/npcs/catalog.generated.ts");
const srcText = fs.readFileSync(catalogPath, "utf8");
const marker = "NPC_CATALOG_GENERATED";
const markerAt = srcText.indexOf(marker);
const assignAt = srcText.indexOf("=", markerAt);
const jsonStart = srcText.indexOf("[", assignAt);
let depth = 0;
let jsonEnd = -1;
for (let i = jsonStart; i < srcText.length; i++) {
  const ch = srcText[i];
  if (ch === "[") depth++;
  else if (ch === "]") {
    depth--;
    if (depth === 0) {
      jsonEnd = i;
      break;
    }
  }
}
if (jsonStart < 0 || jsonEnd < 0) throw new Error("Could not locate NPC catalog array");
const npcs = JSON.parse(srcText.slice(jsonStart, jsonEnd + 1));
const named = npcs.filter((n) => n.kind === "named");

function real(file) {
  return fs.existsSync(file) && fs.statSync(file).size > 2000;
}

const stats = {
  portrait: 0,
  fullDistinct: 0,
  fullPortraitCopy: 0,
  spriteDistinct: 0,
  spritePortraitCopy: 0,
  thumb: 0,
};
const entries = [];

for (const n of named) {
  const dir = path.join(BASE, n.regionId, n.slug);
  fs.mkdirSync(dir, { recursive: true });
  const pairs = [
    ["portrait.png", "-portrait.png"],
    ["thumbnail.png", "-portrait.png"],
    ["dialogue-portrait.png", "-portrait.png"],
    ["full-body.png", "-fullbody.png"],
    ["sprite.png", "-sprite.png"],
  ];
  for (const [dest, suf] of pairs) {
    let from = path.join(SRC, n.slug + suf);
    if (dest === "full-body.png") {
      const v2 = path.join(SRC, `${n.slug}-fullbody-v2.png`);
      if (fs.existsSync(v2)) from = v2;
    }
    if (fs.existsSync(from)) fs.copyFileSync(from, path.join(dir, dest));
  }
  const spr = path.join(dir, "sprite.png");
  const por = path.join(dir, "portrait.png");
  if (!real(spr) && real(por)) fs.copyFileSync(por, spr);

  const check = (f) => real(path.join(dir, f));
  const sameAsPortrait = (f) =>
    check("portrait.png") &&
    check(f) &&
    fs.statSync(path.join(dir, "portrait.png")).size ===
      fs.statSync(path.join(dir, f)).size;

  if (check("portrait.png")) stats.portrait++;
  if (check("thumbnail.png")) stats.thumb++;
  if (check("full-body.png")) {
    if (sameAsPortrait("full-body.png")) stats.fullPortraitCopy++;
    else stats.fullDistinct++;
  }
  if (check("sprite.png")) {
    if (sameAsPortrait("sprite.png")) stats.spritePortraitCopy++;
    else stats.spriteDistinct++;
  }

  const entry = {
    id: n.id,
    slug: n.slug,
    regionId: n.regionId,
    paths: {
      portrait: `/assets/npcs/${n.regionId}/${n.slug}/portrait.png`,
      fullBody: `/assets/npcs/${n.regionId}/${n.slug}/full-body.png`,
      sprite: `/assets/npcs/${n.regionId}/${n.slug}/sprite.png`,
      thumbnail: `/assets/npcs/${n.regionId}/${n.slug}/thumbnail.png`,
    },
    assets: {
      portrait: check("portrait.png"),
      fullBodyDistinct: check("full-body.png") && !sameAsPortrait("full-body.png"),
      fullBodyPresent: check("full-body.png"),
      spriteDistinct: check("sprite.png") && !sameAsPortrait("sprite.png"),
      spritePresent: check("sprite.png"),
      thumbnail: check("thumbnail.png"),
    },
    artStatus: check("portrait.png") ? "generated" : "placeholder",
    updatedAt: new Date().toISOString(),
  };
  entries.push(entry);
  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(entry, null, 2));
}

const report = {
  namedTotal: named.length,
  stats,
  npcs: entries,
  generatedAt: new Date().toISOString(),
  notes: [
    "Portraits generated via Cursor GenerateImage for all 54 named NPCs.",
    "fullBodyDistinct counts full-body files that differ in size from portrait.",
    "Sprites may reuse portraits where dedicated sprite sheets are not yet authored.",
  ],
};
fs.mkdirSync(path.join(ROOT, "docs/testing"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "docs/testing/NPC_ASSET_MANIFEST.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
