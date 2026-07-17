/**
 * Generate themed illustrated SVGs for every Riftwilds visual: pets, eggs,
 * weapons, armor, potions, materials, abilities, furniture, regions, UI icons.
 *
 * Run: npx tsx scripts/assets/generate-all-illustrated.ts
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";
import { ARMOR_CATALOG } from "@/lib/items/catalog/armor";
import { POTION_CATALOG } from "@/lib/items/catalog/potions";
import { MATERIAL_CATALOG } from "@/lib/items/catalog/materials";
import { ABILITY_CATALOG } from "@/lib/items/catalog/abilities";
import type { ItemRarity } from "@/lib/items/types";

const ROOT = path.resolve(__dirname, "../..");
const AFFINITY: Record<string, string> = {
  EMBER: "#ff7a3d",
  TIDE: "#3d9bff",
  GROVE: "#4adf7a",
  STORM: "#b8d4ff",
  STONE: "#c4a882",
  FROST: "#a8e7ff",
  RADIANT: "#ffe566",
  VOID: "#7a5cff",
  ALLOY: "#d0d6e0",
  SPIRIT: "#ff9ad5",
  NONE: "#9aa3b5",
};
const RARITY: Record<ItemRarity, string> = {
  COMMON: "#8b93a7",
  UNCOMMON: "#3ecf7a",
  RARE: "#3d9bff",
  EPIC: "#a855f7",
  LEGENDARY: "#f5c542",
  MYTHIC: "#ff6bcb",
  CELESTIAL: "#7dd3fc",
};

function ensure(p: string) {
  mkdirSync(p, { recursive: true });
}
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}
function write(file: string, content: string) {
  ensure(path.dirname(file));
  writeFileSync(file, content);
}

function petSvg(species: (typeof LAUNCH_SPECIES)[number]): string {
  const c = AFFINITY[species.affinity] ?? "#3de7ff";
  const h = hash(species.slug);
  const ear = 18 + (h % 10);
  const eye = 4 + (h % 3);
  const body =
    species.bodyType === "SERPENTINE"
      ? `<path d="M40 90 Q20 60 40 40 Q70 20 100 45 Q120 70 90 95" fill="url(#b)" stroke="#0a1020" stroke-width="3"/>`
      : species.bodyType === "FLOATING" || species.bodyType === "SPIRIT_BODIED" || species.bodyType === "AMORPHOUS"
        ? `<ellipse cx="80" cy="78" rx="38" ry="42" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><ellipse cx="80" cy="70" rx="22" ry="16" fill="#fff" opacity="0.12"/>`
        : species.bodyType === "AVIAN"
          ? `<ellipse cx="80" cy="82" rx="34" ry="28" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><path d="M50 70 L20 55 L52 82 Z" fill="${c}" stroke="#0a1020" stroke-width="2"/><path d="M110 70 L140 55 L108 82 Z" fill="${c}" stroke="#0a1020" stroke-width="2"/>`
          : species.bodyType === "AQUATIC"
            ? `<ellipse cx="78" cy="80" rx="40" ry="30" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><path d="M118 80 Q148 60 148 90 Q148 110 118 95 Z" fill="${c}" opacity="0.85"/>`
            : species.bodyType === "INSECTOID"
              ? `<ellipse cx="80" cy="86" rx="28" ry="24" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><ellipse cx="56" cy="60" rx="14" ry="18" fill="url(#b)" stroke="#0a1020" stroke-width="2"/><ellipse cx="104" cy="60" rx="14" ry="18" fill="url(#b)" stroke="#0a1020" stroke-width="2"/>`
              : species.bodyType === "BIPED"
                ? `<ellipse cx="80" cy="70" rx="26" ry="30" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><rect x="62" y="95" width="12" height="28" rx="6" fill="${c}"/><rect x="86" y="95" width="12" height="28" rx="6" fill="${c}"/>`
                : species.bodyType === "PLANT_BODIED"
                  ? `<ellipse cx="80" cy="88" rx="32" ry="34" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><path d="M80 40 Q60 20 50 48 Q70 40 80 55 Q90 40 110 48 Q100 20 80 40 Z" fill="${c}"/>`
                  : species.bodyType === "STONE_BODIED" || species.bodyType === "MECHANICAL_ORGANIC"
                    ? `<path d="M50 100 L55 55 L80 40 L105 55 L110 100 Z" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><circle cx="80" cy="70" r="10" fill="#0a1020" opacity="0.25"/>`
                    : `<ellipse cx="80" cy="88" rx="36" ry="30" fill="url(#b)" stroke="#0a1020" stroke-width="3"/><circle cx="80" cy="58" r="28" fill="url(#b)" stroke="#0a1020" stroke-width="3"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="512" height="512">
  <defs>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="b" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="${c}"/>
      <stop offset="100%" stop-color="#1a2744"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" fill="none"/>
  <circle cx="80" cy="80" r="70" fill="url(#glow)"/>
  ${body}
  <circle cx="${68 + (h % 5)}" cy="56" r="${eye}" fill="#0a1020"/>
  <circle cx="${92 - (h % 5)}" cy="56" r="${eye}" fill="#0a1020"/>
  <circle cx="${66 + (h % 5)}" cy="54" r="1.5" fill="#fff" opacity="0.8"/>
  <path d="M${80 - ear} 40 Q${80 - ear - 4} ${20} ${70} 42" fill="${c}" stroke="#0a1020" stroke-width="2"/>
  <path d="M${80 + ear} 40 Q${80 + ear + 4} ${20} ${90} 42" fill="${c}" stroke="#0a1020" stroke-width="2"/>
  <ellipse cx="80" cy="145" rx="34" ry="6" fill="${c}" opacity="0.25"/>
</svg>`;
}

function itemArt(opts: {
  id: string;
  rarity: ItemRarity;
  affinity: string | null;
  kind: "weapon" | "armor" | "potion" | "material" | "ability";
}): string {
  const ac = AFFINITY[opts.affinity ?? "NONE"] ?? "#9aa3b5";
  const rc = RARITY[opts.rarity];
  const h = hash(opts.id);
  const rot = (h % 21) - 10;
  const core =
    opts.kind === "potion"
      ? `<path d="M70 40 H90 L96 55 V120 Q80 140 64 120 V55 Z" fill="url(#g)" stroke="#0a1020" stroke-width="3"/><ellipse cx="80" cy="40" rx="14" ry="8" fill="${rc}"/><ellipse cx="80" cy="80" rx="8" ry="14" fill="#fff" opacity="0.2"/>`
      : opts.kind === "ability"
        ? `<circle cx="80" cy="80" r="40" fill="none" stroke="${ac}" stroke-width="5"/><path d="M80 40 L95 75 L80 70 L65 75 Z M80 120 L65 85 L80 90 L95 85 Z" fill="${ac}"/><circle cx="80" cy="80" r="10" fill="${rc}"/>`
        : opts.kind === "material"
          ? `<polygon points="80,30 120,60 105,120 55,120 40,60" fill="url(#g)" stroke="#0a1020" stroke-width="3"/><polygon points="80,50 100,70 90,105 70,105 60,70" fill="#fff" opacity="0.15"/>`
          : opts.kind === "armor"
            ? `<path d="M50 45 L80 28 L110 45 L118 100 L80 130 L42 100 Z" fill="url(#g)" stroke="#0a1020" stroke-width="3"/><path d="M60 55 L80 42 L100 55 L98 95 L80 115 L62 95 Z" fill="#070b16" opacity="0.3"/>`
            : `<g transform="rotate(${rot} 80 80)"><path d="M50 105 L80 30 L110 105 L95 135 L65 135 Z" fill="url(#g)" stroke="#0a1020" stroke-width="3"/><circle cx="80" cy="95" r="12" fill="${rc}"/><path d="M55 115 H105" stroke="${ac}" stroke-width="4" stroke-linecap="round"/></g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="512" height="512">
  <defs>
    <radialGradient id="a" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${rc}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="g" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="${ac}"/>
      <stop offset="100%" stop-color="#152038"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" fill="none"/>
  <circle cx="80" cy="80" r="68" fill="url(#a)"/>
  ${core}
</svg>`;
}

// Pets
const petsDir = path.join(ROOT, "public/assets/pets");
const placeholders = path.join(ROOT, "public/assets/placeholders");
ensure(petsDir);
ensure(placeholders);
for (const sp of LAUNCH_SPECIES) {
  const svg = petSvg(sp);
  write(path.join(petsDir, `${sp.slug}.svg`), svg);
  write(path.join(petsDir, `${sp.slug}-portrait.svg`), svg);
  write(path.join(petsDir, `${sp.slug}-icon.svg`), svg);
  write(path.join(placeholders, `creature-${sp.slug}-icon.svg`), svg);
  // If AI PNG already exists, keep it; otherwise SVG is the display asset
  const png = path.join(petsDir, `${sp.slug}.png`);
  if (!existsSync(png)) {
    // marker for UI: prefer svg
  }
}

// Items
const items = path.join(ROOT, "public/assets/items");
function dumpItems(
  list: { id: string; rarity: ItemRarity; affinity: string | null }[],
  kind: "weapon" | "armor" | "potion" | "material" | "ability",
) {
  const folder = kind === "ability" ? "abilities" : `${kind}s`;
  for (const it of list) {
    const art = itemArt({ id: it.id, rarity: it.rarity, affinity: it.affinity, kind });
    write(path.join(items, folder, "inventory", `${it.id}.svg`), art);
    write(path.join(items, folder, "icons", `${it.id}.svg`), art);
  }
}
dumpItems(WEAPON_CATALOG, "weapon");
dumpItems(ARMOR_CATALOG, "armor");
dumpItems(POTION_CATALOG, "potion");
dumpItems(MATERIAL_CATALOG, "material");
dumpItems(
  ABILITY_CATALOG.map((a) => ({ id: a.id, rarity: a.rarity, affinity: a.affinity })),
  "ability",
);

// Eggs (affinity painted)
const eggsDir = path.join(ROOT, "public/assets/eggs");
ensure(eggsDir);
const eggTypes: [string, string, string][] = [
  ["common-rift", "#ffb84d", "#3de7ff"],
  ["ember", "#ff7a3d", "#ffb84d"],
  ["tide", "#3d9bff", "#3de7ff"],
  ["grove", "#4adf7a", "#3de7ff"],
  ["storm", "#b8d4ff", "#3de7ff"],
  ["stone", "#c4a882", "#ffb84d"],
  ["frost", "#a8e7ff", "#3de7ff"],
  ["radiant", "#ffe566", "#ffb84d"],
  ["void", "#7a5cff", "#3de7ff"],
  ["alloy", "#d0d6e0", "#3de7ff"],
  ["spirit", "#ff9ad5", "#3de7ff"],
  ["celestial", "#7dd3fc", "#ffe566"],
];
for (const [slug, c1, c2] of eggTypes) {
  write(
    path.join(eggsDir, `${slug}.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="512" height="640">
  <defs>
    <radialGradient id="s" cx="35%" cy="28%" r="70%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="40%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </radialGradient>
  </defs>
  <ellipse cx="128" cy="255" rx="70" ry="16" fill="${c2}" opacity="0.3"/>
  <ellipse cx="128" cy="150" rx="78" ry="105" fill="url(#s)" stroke="#0a1020" stroke-width="4"/>
  <path d="M70 130 Q128 95 186 130" fill="none" stroke="${c2}" stroke-width="3" opacity="0.6"/>
  <ellipse cx="100" cy="110" rx="18" ry="12" fill="#fff" opacity="0.3"/>
</svg>`,
  );
}

// Manifest for the site
const manifest = {
  generatedAt: new Date().toISOString(),
  theme: "riftwilds-cel-shaded-navy",
  pets: LAUNCH_SPECIES.map((s) => s.slug),
  weapons: WEAPON_CATALOG.map((w) => w.id),
  armor: ARMOR_CATALOG.map((a) => a.id),
  potions: POTION_CATALOG.map((p) => p.id),
  materials: MATERIAL_CATALOG.map((m) => m.id),
  abilities: ABILITY_CATALOG.map((a) => a.id),
  eggs: eggTypes.map((e) => e[0]),
};
write(path.join(ROOT, "public/assets/manifest.theme.json"), JSON.stringify(manifest, null, 2));

console.log(
  `Illustrated theme pack ready: ${LAUNCH_SPECIES.length} pets, ${WEAPON_CATALOG.length} weapons, ${ARMOR_CATALOG.length} armor, ${POTION_CATALOG.length} potions, ${MATERIAL_CATALOG.length} materials, ${ABILITY_CATALOG.length} abilities, ${eggTypes.length} eggs`,
);
