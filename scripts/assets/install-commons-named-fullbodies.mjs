/**
 * Install Grok-generated full-body kits for Commons named cast + hatchery facade.
 * Does NOT touch dialogue portraits.
 *
 * Usage: node scripts/assets/install-commons-named-fullbodies.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const CURSOR_ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);
const GEN = [path.join(ROOT, "public/assets/game/_sources"), CURSOR_ASSETS];

const NAMED = [
  ["npc-mira-shellbright-fullbody.png", "mira-shellbright"],
  ["npc-rowan-vale-fullbody.png", "rowan-vale"],
  ["npc-elara-venn-fullbody.png", "elara-venn"],
  ["npc-nyla-brook-fullbody.png", "nyla-brook"],
  ["npc-bram-ironroot-fullbody.png", "bram-ironroot"],
  ["npc-tessa-windmere-fullbody.png", "tessa-windmere"],
  ["npc-archivist-solen-fullbody.png", "archivist-solen"],
  ["npc-captain-orren-fullbody.png", "captain-orren"],
  ["npc-pip-gearwhistle-fullbody.png", "pip-gearwhistle"],
  ["npc-rook-emberfall-fullbody.png", "rook-emberfall"],
];

function resolveSrc(file) {
  for (const dir of GEN) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function whiteKeyMask(srcBuf, size) {
  const { data, info } = await sharp(srcBuf)
    .ensureAlpha()
    .resize(size, size, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (lum >= 232 && chroma <= 22) {
      data[i + 3] = 0;
    } else if (lum >= 205 && chroma <= 28) {
      const t = (lum - 205) / 40;
      data[i + 3] = Math.round(data[i + 3] * (1 - t * 0.9));
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function installNpcBundle(srcFile, slug) {
  const dir = path.join(ROOT, "public/assets/npcs/riftwild-commons", slug);
  fs.mkdirSync(dir, { recursive: true });
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing npc source", srcFile);
    return false;
  }
  // Keep a copy under _sources
  const sources = path.join(ROOT, "public/assets/game/_sources");
  fs.mkdirSync(sources, { recursive: true });
  fs.copyFileSync(src, path.join(sources, srcFile));

  const raw = await sharp(src).ensureAlpha().png().toBuffer();
  const full = await whiteKeyMask(raw, 768);
  await sharp(full).png().toFile(path.join(dir, "full-body.png"));
  const sprite = await whiteKeyMask(raw, 256);
  await sharp(sprite).png().toFile(path.join(dir, "sprite.png"));

  const metaPath = path.join(dir, "metadata.json");
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      meta = {};
    }
  }
  meta.id = slug;
  meta.slug = slug;
  meta.regionId = "riftwild-commons";
  meta.artStatus = "generated";
  meta.fullBodyDistinct = true;
  meta.spriteDistinct = true;
  meta.worldArtSource = "dedicated-fullbody";
  meta.updatedAt = new Date().toISOString();
  meta.note =
    "Dedicated full-body overworld kit installed; dialogue portrait left unchanged";
  if (!meta.assets) meta.assets = {};
  meta.assets.fullBodyDistinct = true;
  meta.assets.spriteDistinct = true;
  meta.assets.fullBodyPresent = true;
  meta.assets.spritePresent = true;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  console.log("npc bundle", slug);
  return true;
}

async function installHatchery() {
  const src = resolveSrc("building-hatchery-masked.png");
  if (!src) {
    console.warn("missing hatchery facade source");
    return;
  }
  const dest = path.join(ROOT, "public/assets/game/buildings/hatchery.png");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const sources = path.join(ROOT, "public/assets/game/_sources");
  fs.mkdirSync(sources, { recursive: true });
  fs.copyFileSync(src, path.join(sources, "building-hatchery-masked.png"));
  const raw = await sharp(src).ensureAlpha().png().toBuffer();
  const masked = await whiteKeyMask(raw, 768);
  await sharp(masked).png().toFile(dest);
  console.log("wrote buildings/hatchery.png");
}

async function main() {
  let ok = 0;
  for (const [file, slug] of NAMED) {
    if (await installNpcBundle(file, slug)) ok++;
  }
  await installHatchery();

  const npcDirs = NAMED.map(([, slug]) =>
    path.join("public/assets/npcs/riftwild-commons", slug),
  );
  // Mask only world kits + facade — never dialogue portraits / portrait masters
  const maskTargets = [];
  for (const dir of npcDirs) {
    for (const name of ["full-body.png", "sprite.png", "overworld-sheet.png"]) {
      maskTargets.push(path.join(dir, name));
    }
  }
  maskTargets.push("public/assets/game/buildings/hatchery.png");
  spawnSync(
    process.execPath,
    ["scripts/assets/mask-npc-black.mjs", "--all-png", ...maskTargets],
    { cwd: ROOT, stdio: "inherit" },
  );

  spawnSync(
    process.execPath,
    ["scripts/npcs/build-npc-overworld-sheets.mjs", "public/assets/npcs/riftwild-commons"],
    { cwd: ROOT, stdio: "inherit" },
  );

  console.log(`Installed ${ok}/${NAMED.length} named full-body kits`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
