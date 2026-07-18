/**
 * Install Grok-generated Live World Commons showcase art:
 * actors (player/pet), props (riftstone, dummy, resources), ambient NPC bodies.
 *
 * Usage: node scripts/assets/install-live-world-showcase-art.mjs
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
const GEN = [
  path.join(ROOT, "public/assets/game/_sources"),
  CURSOR_ASSETS,
];

function resolveSrc(file) {
  for (const dir of GEN) {
    const p = path.join(dir, file);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function whiteKeyMask(srcBuf, size) {
  // Soft white-background key for studio plates (keeps pale clothing via chroma)
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
    if (lum >= 232 && chroma <= 18) {
      data[i + 3] = 0;
    } else if (lum >= 210 && chroma <= 22) {
      const t = (lum - 210) / 22;
      data[i + 3] = Math.round(data[i + 3] * (1 - t * 0.85));
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

async function installMasked(srcFile, dest, size) {
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing source", srcFile);
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const raw = await sharp(src).ensureAlpha().png().toBuffer();
  const masked = await whiteKeyMask(raw, size);
  await sharp(masked).png().toFile(dest);
  console.log("wrote", path.relative(ROOT, dest));
  return true;
}

async function installNpcBundle(srcFile, slug, opts = {}) {
  const dir = path.join(ROOT, "public/assets/npcs/riftwild-commons", slug);
  fs.mkdirSync(dir, { recursive: true });
  const src = resolveSrc(srcFile);
  if (!src) {
    console.warn("missing npc source", srcFile);
    return;
  }
  const raw = await sharp(src).ensureAlpha().png().toBuffer();
  const full = await whiteKeyMask(raw, opts.fullSize ?? 768);
  await sharp(full).png().toFile(path.join(dir, "full-body.png"));
  const sprite = await whiteKeyMask(raw, opts.spriteSize ?? 256);
  await sharp(sprite).png().toFile(path.join(dir, "sprite.png"));
  const thumb = await sharp(full)
    .resize(128, 128, { fit: "cover" })
    .png()
    .toBuffer();
  await sharp(thumb).png().toFile(path.join(dir, "thumbnail.png"));
  if (opts.replacePortrait) {
    const portrait = await sharp(raw)
      .resize(512, 512, { fit: "cover" })
      .png()
      .toBuffer();
    // Keep darker studio portraits if source is dark; otherwise use masked full crop
    await sharp(portrait).png().toFile(path.join(dir, "portrait.png"));
    await sharp(portrait)
      .resize(256, 256)
      .png()
      .toFile(path.join(dir, "dialogue-portrait.png"));
  }
  console.log("npc bundle", slug);
}

async function sliceMinimapSheet(srcFile) {
  const src = resolveSrc(srcFile);
  if (!src) return;
  const outDir = path.join(ROOT, "public/assets/ui/map");
  fs.mkdirSync(outDir, { recursive: true });
  const meta = await sharp(src).metadata();
  const tw = Math.floor(meta.width / 2);
  const th = Math.floor(meta.height / 2);
  const names = [
    ["minimap-portal.png", 0, 0],
    ["minimap-waypoint.png", 1, 0],
    ["minimap-player.png", 0, 1],
    ["minimap-quest.png", 1, 1],
  ];
  for (const [name, c, r] of names) {
    const buf = await sharp(src)
      .extract({ left: c * tw, top: r * th, width: tw, height: th })
      .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const masked = await whiteKeyMask(buf, 64);
    await sharp(masked).png().toFile(path.join(outDir, name));
    console.log("wrote ui/map", name);
  }
}

async function main() {
  const actors = path.join(ROOT, "public/assets/game/actors");
  const props = path.join(ROOT, "public/assets/game/props");
  fs.mkdirSync(actors, { recursive: true });
  fs.mkdirSync(props, { recursive: true });

  await installMasked("player-keeper-overworld.png", path.join(actors, "player-keeper.png"), 256);
  await installMasked("pet-riftling-companion.png", path.join(actors, "pet-riftling.png"), 192);

  await installMasked("prop-riftstone-monument.png", path.join(props, "riftstone-monument.png"), 256);
  await installMasked("prop-training-dummy.png", path.join(props, "training-dummy.png"), 192);
  await installMasked("prop-resource-berry-bush.png", path.join(props, "resource-berry.png"), 160);
  await installMasked("prop-resource-herb.png", path.join(props, "resource-herb.png"), 144);
  await installMasked("prop-resource-fish-marker.png", path.join(props, "resource-fish.png"), 144);

  // Also keep copies under _sources for reproducibility
  const sources = path.join(ROOT, "public/assets/game/_sources");
  fs.mkdirSync(sources, { recursive: true });
  for (const f of [
    "player-keeper-overworld.png",
    "pet-riftling-companion.png",
    "prop-riftstone-monument.png",
    "prop-training-dummy.png",
    "prop-resource-berry-bush.png",
    "prop-resource-herb.png",
    "prop-resource-fish-marker.png",
    "npc-cal-reed-fullbody.png",
    "ui-minimap-icon-sheet.png",
  ]) {
    const src = resolveSrc(f);
    if (src && path.dirname(src) !== sources) {
      fs.copyFileSync(src, path.join(sources, f));
    }
  }

  await installNpcBundle("npc-cal-reed-fullbody.png", "plaza-vendor-cal", {
    replacePortrait: false,
  });
  const calPortrait = resolveSrc("npc-cal-reed-dialogue-portrait.png");
  if (calPortrait) {
    const dir = path.join(ROOT, "public/assets/npcs/riftwild-commons/plaza-vendor-cal");
    await sharp(calPortrait)
      .resize(512, 512, { fit: "cover" })
      .png()
      .toFile(path.join(dir, "dialogue-portrait.png"));
    await sharp(calPortrait)
      .resize(256, 256, { fit: "cover" })
      .png()
      .toFile(path.join(dir, "thumbnail.png"));
  }

  const ambient = [
    ["npc-plaza-musician-reo-fullbody.png", "plaza-musician-reo"],
    ["npc-plaza-child-mim-fullbody.png", "plaza-child-mim"],
    ["npc-farm-hand-jot-fullbody.png", "farm-hand-jot"],
    ["npc-dock-sweeper-ana-fullbody.png", "dock-sweeper-ana"],
    ["npc-cook-pot-uma-fullbody.png", "cook-pot-uma"],
    ["npc-gardener-sip-fullbody.png", "gardener-sip"],
    ["npc-scribe-runner-kel-fullbody.png", "scribe-runner-kel"],
    ["npc-guard-east-ryn-fullbody.png", "guard-east-ryn"],
    ["npc-guard-west-dao-fullbody.png", "guard-west-dao"],
    ["npc-guard-portal-hex-fullbody.png", "guard-portal-hex"],
  ];
  for (const [file, slug] of ambient) {
    await installNpcBundle(file, slug);
  }

  const riftlings = [
    ["npc-riftling-emberkit-sprite.png", "riftling-plaza-emberkit"],
    ["npc-riftling-glowpup-sprite.png", "riftling-hatchery-glowpup"],
    ["npc-riftling-pouchling-sprite.png", "riftling-market-pouchling"],
  ];
  for (const [file, slug] of riftlings) {
    await installNpcBundle(file, slug, { fullSize: 512, spriteSize: 192 });
  }

  await sliceMinimapSheet("ui-minimap-icon-sheet.png");

  // Flood-fill mask pass (border-connected) then rebuild sheets
  spawnSync(
    process.execPath,
    [
      "scripts/assets/mask-npc-black.mjs",
      "--all-png",
      "public/assets/game/actors",
      "public/assets/game/props/riftstone-monument.png",
      "public/assets/game/props/training-dummy.png",
      "public/assets/game/props/resource-berry.png",
      "public/assets/game/props/resource-herb.png",
      "public/assets/game/props/resource-fish.png",
      "public/assets/npcs/riftwild-commons/plaza-vendor-cal",
      "public/assets/npcs/riftwild-commons/plaza-musician-reo",
      "public/assets/npcs/riftwild-commons/plaza-child-mim",
      "public/assets/npcs/riftwild-commons/farm-hand-jot",
      "public/assets/npcs/riftwild-commons/dock-sweeper-ana",
      "public/assets/npcs/riftwild-commons/cook-pot-uma",
      "public/assets/npcs/riftwild-commons/gardener-sip",
      "public/assets/npcs/riftwild-commons/scribe-runner-kel",
      "public/assets/npcs/riftwild-commons/guard-east-ryn",
      "public/assets/npcs/riftwild-commons/guard-west-dao",
      "public/assets/npcs/riftwild-commons/guard-portal-hex",
      "public/assets/npcs/riftwild-commons/riftling-plaza-emberkit",
      "public/assets/npcs/riftwild-commons/riftling-hatchery-glowpup",
      "public/assets/npcs/riftwild-commons/riftling-market-pouchling",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );

  spawnSync(process.execPath, ["scripts/npcs/build-npc-overworld-sheets.mjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });

  console.log("live world showcase art install complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
