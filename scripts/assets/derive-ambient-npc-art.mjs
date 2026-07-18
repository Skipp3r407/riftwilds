/**
 * For ambient NPC dirs with a real portrait.png, derive thumbnail / sprite /
 * full-body stand-ins and compress the portrait for web delivery.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const NPC_ROOT = path.join(ROOT, "public/assets/npcs");
const MIN_PORTRAIT = 20_000;

async function deriveDir(dir) {
  const portraitPath = path.join(dir, "portrait.png");
  if (!fs.existsSync(portraitPath)) return null;
  const st = fs.statSync(portraitPath);
  if (st.size < MIN_PORTRAIT) return null;

  const metaPath = path.join(dir, "metadata.json");
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch {
      meta = {};
    }
  }

  const before = st.size;
  const img = sharp(portraitPath).rotate();
  const { width = 1024, height = 1024 } = await img.metadata();

  // Compress portrait in place (max 768 edge, png effort)
  const edge = Math.min(768, Math.max(width, height));
  await sharp(portraitPath)
    .rotate()
    .resize(edge, edge, { fit: "cover", position: "attention" })
    .png({ compressionLevel: 9, quality: 85, effort: 8 })
    .toFile(portraitPath + ".tmp");
  fs.renameSync(portraitPath + ".tmp", portraitPath);

  // Thumbnail 128 — safe UI crop from portrait
  await sharp(portraitPath)
    .resize(128, 128, { fit: "cover", position: "attention" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(dir, "thumbnail.png"));

  // NEVER overwrite dedicated full-body / world sprites with portrait crops.
  // Portrait-derived "sprites" become floating heads in Live World.
  const spritePath = path.join(dir, "sprite.png");
  const fullBodyPath = path.join(dir, "full-body.png");
  const preserveSprite = meta.spriteDistinct === true || meta.worldArtSource === "dedicated-fullbody";
  const preserveFullBody =
    meta.fullBodyDistinct === true || meta.worldArtSource === "dedicated-fullbody";

  if (!preserveSprite) {
    // UI-only list icon (96) — marked non-world; sheet builder rejects busts
    await sharp(portraitPath)
      .resize(96, 96, { fit: "cover", position: "attention" })
      .png({ compressionLevel: 9 })
      .toFile(spritePath);
  }

  if (!preserveFullBody && !fs.existsSync(fullBodyPath)) {
    // Placeholder only when missing — do not pretend this is world-ready
    await sharp(portraitPath)
      .resize(512, 768, { fit: "cover", position: "top" })
      .png({ compressionLevel: 9 })
      .toFile(fullBodyPath);
  }

  // WebP companion for progressive delivery
  await sharp(portraitPath)
    .webp({ quality: 82 })
    .toFile(path.join(dir, "portrait.webp"));

  const after = fs.statSync(portraitPath).size;
  meta.artStatus = "generated";
  meta.derivedAt = new Date().toISOString();
  meta.fullBodyDistinct = preserveFullBody || meta.fullBodyDistinct === true;
  meta.spriteDistinct = preserveSprite || meta.spriteDistinct === true;
  if (!meta.spriteDistinct) {
    meta.note =
      "Portrait/thumbnail derived; world sprite/full-body pending dedicated sheets (do not use portrait crop in Live World)";
  } else {
    meta.note = meta.note ?? "Portrait refreshed; dedicated world kit preserved";
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");

  return { dir, before, after, saved: before - after };
}

async function main() {
  const targets = [];
  for (const region of fs.readdirSync(NPC_ROOT, { withFileTypes: true })) {
    if (!region.isDirectory()) continue;
    const regionDir = path.join(NPC_ROOT, region.name);
    for (const npc of fs.readdirSync(regionDir, { withFileTypes: true })) {
      if (!npc.isDirectory()) continue;
      targets.push(path.join(regionDir, npc.name));
    }
  }

  let processed = 0;
  let saved = 0;
  for (const dir of targets) {
    const thumb = path.join(dir, "thumbnail.png");
    const portrait = path.join(dir, "portrait.png");
    if (!fs.existsSync(portrait)) continue;
    const needs =
      fs.statSync(portrait).size > 400_000 ||
      !fs.existsSync(thumb) ||
      (fs.existsSync(thumb) && fs.statSync(thumb).size < 5_000);
    if (!needs && fs.statSync(portrait).size >= MIN_PORTRAIT) {
      // Still refresh stub derivatives if needed
      const sprite = path.join(dir, "sprite.png");
      if (fs.existsSync(sprite) && fs.statSync(sprite).size >= 5_000) continue;
    }
    const r = await deriveDir(dir);
    if (r) {
      processed++;
      saved += r.saved;
      console.log(
        `ok ${path.relative(NPC_ROOT, dir)} ${(r.before / 1024).toFixed(0)}KB → ${(r.after / 1024).toFixed(0)}KB`,
      );
    }
  }
  console.log(`Derived ${processed} NPC kits, saved ~${Math.round(saved / 1024)} KB on portraits`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
