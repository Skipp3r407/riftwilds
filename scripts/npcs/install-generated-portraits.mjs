/**
 * Copies GenerateImage outputs from Cursor assets folder into public/assets/npcs.
 * Also writes metadata.json with artStatus=generated for installed portraits.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CURSOR_ASSETS = path.resolve(
  ROOT,
  "../../.cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);
const ALT_ASSETS = "C:/Users/Skipp3r407/.cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets";
const assetsDir = fs.existsSync(CURSOR_ASSETS) ? CURSOR_ASSETS : ALT_ASSETS;

const catalogPath = path.join(ROOT, "src/content/npcs/catalog.generated.ts");
const src = fs.readFileSync(catalogPath, "utf8");
const jsonMatch = src.match(/export const NPC_CATALOG_GENERATED: NpcDef\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error("Could not parse catalog");
  process.exit(1);
}
const npcs = JSON.parse(jsonMatch[1]);
const bySlug = Object.fromEntries(npcs.map((n) => [n.slug, n]));

const files = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter((f) => f.endsWith("-portrait.png") || f.endsWith("-fullbody.png"))
  : [];

let installed = 0;
for (const file of files) {
  const isFull = file.endsWith("-fullbody.png");
  const slug = file.replace(/-portrait\.png$/, "").replace(/-fullbody\.png$/, "");
  const npc = bySlug[slug];
  if (!npc) {
    console.warn("No NPC for", file);
    continue;
  }
  const dir = path.join(ROOT, "public/assets/npcs", npc.regionId, slug);
  fs.mkdirSync(dir, { recursive: true });
  const from = path.join(assetsDir, file);
  if (isFull) {
    fs.copyFileSync(from, path.join(dir, "full-body.png"));
  } else {
    fs.copyFileSync(from, path.join(dir, "portrait.png"));
    fs.copyFileSync(from, path.join(dir, "thumbnail.png"));
    // Use portrait as sprite stand-in until dedicated sprite art ships
    if (!fs.existsSync(path.join(dir, "sprite.png")) || fs.statSync(path.join(dir, "sprite.png")).size < 2000) {
      fs.copyFileSync(from, path.join(dir, "sprite.png"));
    }
    if (!fs.existsSync(path.join(dir, "full-body.png")) || fs.statSync(path.join(dir, "full-body.png")).size < 2000) {
      fs.copyFileSync(from, path.join(dir, "full-body.png"));
    }
  }
  const metaPath = path.join(dir, "metadata.json");
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      meta = {};
    }
  }
  meta.id = npc.id;
  meta.slug = slug;
  meta.regionId = npc.regionId;
  meta.artStatus = "generated";
  meta.portraitSource = file;
  meta.updatedAt = new Date().toISOString();
  meta.prompts = npc.imagePrompts;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  installed++;
  console.log("installed", slug, "->", dir);
}

console.log(`Installed ${installed} asset sets from ${assetsDir}`);
