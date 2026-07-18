/**
 * Generate world-layer PNGs for equippable catalog items (weapons + armor).
 * Original Riftwilds stylized silhouettes — full-body attachment overlays, not head-only.
 * Uses sharp (no external Grok call required when API key unavailable).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const WEAPON_COLORS = ["#ff7a3d", "#3d9bff", "#4adf7a", "#ffe566", "#a855f7", "#a8e7ff"];
const ARMOR_COLORS = ["#8b93a7", "#3ecf7a", "#3d9bff", "#f5c542", "#ff6bcb", "#c4a882"];

function layerSvg(id, kind, attachment) {
  const h = hash(id);
  const palette = kind === "weapons" ? WEAPON_COLORS : ARMOR_COLORS;
  const c1 = palette[h % palette.length];
  const c2 = palette[(h >> 4) % palette.length];
  const isWing = attachment?.includes("wing");
  const isTail = attachment?.includes("tail");
  const isHead = attachment === "head" || attachment === "horn";
  const isPaw = attachment?.toLowerCase().includes("paw");
  const isFocus = attachment === "floatingFocus";

  let shape;
  if (isWing) {
    shape = `<path d="M20 70 Q48 20 76 70 Q48 58 20 70 Z" fill="${c1}" opacity="0.9"/><path d="M28 68 Q48 36 68 68" fill="none" stroke="${c2}" stroke-width="3"/>`;
  } else if (isTail) {
    shape = `<path d="M30 40 Q70 50 78 90 Q50 70 28 55 Z" fill="${c1}"/><circle cx="74" cy="88" r="8" fill="${c2}"/>`;
  } else if (isHead) {
    shape = `<ellipse cx="48" cy="44" rx="28" ry="22" fill="${c1}"/><path d="M30 30 L48 12 L66 30" fill="${c2}"/>`;
  } else if (isPaw) {
    shape = `<ellipse cx="48" cy="70" rx="22" ry="16" fill="${c1}"/><circle cx="36" cy="62" r="6" fill="${c2}"/><circle cx="60" cy="62" r="6" fill="${c2}"/>`;
  } else if (isFocus) {
    shape = `<circle cx="48" cy="48" r="22" fill="none" stroke="${c1}" stroke-width="4"/><circle cx="48" cy="48" r="10" fill="${c2}"/><circle cx="48" cy="48" r="28" fill="none" stroke="${c2}" stroke-width="1" opacity="0.5"/>`;
  } else {
    // Chest / harness / full-body wrap — reads as torso gear on a body silhouette
    shape = `<ellipse cx="48" cy="72" rx="26" ry="34" fill="${c1}" opacity="0.35"/>
      <path d="M26 48 L48 36 L70 48 L74 88 L48 104 L22 88 Z" fill="${c1}"/>
      <path d="M34 54 L48 46 L62 54 L60 84 L48 92 L36 84 Z" fill="${c2}" opacity="0.85"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 96 128">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#1a2438"/>
      <stop offset="100%" stop-color="#0a101c"/>
    </radialGradient>
  </defs>
  <rect width="96" height="128" rx="12" fill="url(#g)" opacity="0.15"/>
  ${shape}
</svg>`;
}

/** Minimal id lists mirrored from expansion catalogs — regenerated when catalogs grow. */
const WEAPONS = [
  ["wooden-paw-guard", "frontPawLeft"],
  ["ember-spark-claws", "frontPawLeft"],
  ["tide-fin-blade", "tailTip"],
  ["pebble-horn-cap", "horn"],
  ["breeze-focus-seed", "floatingFocus"],
  ["reed-training-harness", "chest"],
  ["smooth-stone-claw", "frontPawLeft"],
  ["cloth-battle-harness", "chest"],
  ["ember-talons", "frontPawLeft"],
];

const ARMOR = [
  ["cloth-pet-vest", "chest"],
  ["linen-ear-hood", "head"],
  ["reed-chest-wrap", "chest"],
  ["mossy-back-cape", "back"],
  ["pebble-paw-boots", "frontPawLeft"],
  ["soft-tail-sleeve", "tailBase"],
  ["breeze-wing-bands", "wingLeft"],
];

async function writeLayers(entries, kind) {
  const dir = path.join(ROOT, "public/assets/items", kind, "world");
  fs.mkdirSync(dir, { recursive: true });
  let made = 0;
  for (const [id, attachment] of entries) {
    const out = path.join(dir, `${id}.png`);
    if (fs.existsSync(out) && fs.statSync(out).size > 800) continue;
    const svg = layerSvg(id, kind, attachment);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
    made++;
  }
  return made;
}

async function main() {
  const w = await writeLayers(WEAPONS, "weapons");
  const a = await writeLayers(ARMOR, "armor");
  const manifest = {
    generatedAt: new Date().toISOString(),
    weapons: WEAPONS.map(([id]) => `/assets/items/weapons/world/${id}.png`),
    armor: ARMOR.map(([id]) => `/assets/items/armor/world/${id}.png`),
    note: "Phase-1 world equipment overlays. Full Grok batch can replace these placeholders.",
  };
  const manifestPath = path.join(ROOT, "artifacts/assets/equipment-world-layers-manifest.json");
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${w} weapon + ${a} armor world layers`);
  console.log("Manifest:", manifestPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
