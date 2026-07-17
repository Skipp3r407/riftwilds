/**
 * Polished SVG placeholders for shop/inventory items.
 * Run: npx tsx scripts/assets/generate-item-placeholders.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";
import { ARMOR_CATALOG } from "@/lib/items/catalog/armor";
import { POTION_CATALOG } from "@/lib/items/catalog/potions";
import { MATERIAL_CATALOG } from "@/lib/items/catalog/materials";
import { ABILITY_CATALOG } from "@/lib/items/catalog/abilities";
import type { ItemRarity } from "@/lib/items/types";

const rarityColor: Record<ItemRarity, string> = {
  COMMON: "#8b93a7",
  UNCOMMON: "#3ecf7a",
  RARE: "#3d9bff",
  EPIC: "#a855f7",
  LEGENDARY: "#f5c542",
  MYTHIC: "#ff6bcb",
  CELESTIAL: "#7dd3fc",
};

const affinityColor: Record<string, string> = {
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

function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
}

function svgFor(opts: {
  rarity: ItemRarity;
  affinity: string | null;
  kind: "weapon" | "armor" | "potion" | "material" | "ability";
}): string {
  const rc = rarityColor[opts.rarity];
  const ac = affinityColor[opts.affinity ?? "NONE"] ?? affinityColor.NONE!;
  const shape =
    opts.kind === "potion"
      ? `<path d="M48 28 L56 28 L60 40 L60 88 Q60 100 48 100 Q36 100 36 88 L36 40 Z" fill="${ac}" opacity="0.85"/><ellipse cx="48" cy="28" rx="10" ry="6" fill="${rc}"/>`
      : opts.kind === "ability"
        ? `<circle cx="48" cy="48" r="28" fill="none" stroke="${ac}" stroke-width="4"/><path d="M48 24 L56 48 L48 72 L40 48 Z" fill="${ac}"/>`
        : opts.kind === "material"
          ? `<polygon points="48,18 78,40 68,78 28,78 18,40" fill="${ac}" opacity="0.9"/>`
          : opts.kind === "armor"
            ? `<path d="M30 30 L48 22 L66 30 L70 70 L48 86 L26 70 Z" fill="${ac}" opacity="0.85"/>`
            : `<path d="M24 60 L48 20 L72 60 L60 84 L36 84 Z" fill="${ac}" opacity="0.9"/><circle cx="48" cy="52" r="8" fill="${rc}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 128" width="256" height="256">
  <rect width="96" height="128" fill="none"/>
  <circle cx="48" cy="52" r="40" fill="none" stroke="${rc}" stroke-width="2" opacity="0.55"/>
  ${shape}
  <text x="48" y="118" text-anchor="middle" fill="#667088" font-size="7" font-family="monospace">DEV</text>
</svg>
`;
}

function writeItem(
  base: string,
  id: string,
  rarity: ItemRarity,
  affinity: string | null,
  kind: "weapon" | "armor" | "potion" | "material" | "ability",
) {
  const folder = kind === "ability" ? "abilities" : `${kind}s`;
  const invDir = path.join(base, folder, "inventory");
  const iconDir = path.join(base, folder, "icons");
  ensureDir(invDir);
  ensureDir(iconDir);
  const content = svgFor({ rarity, affinity, kind });
  writeFileSync(path.join(invDir, `${id}.svg`), content);
  writeFileSync(path.join(iconDir, `${id}.svg`), content);
}

const root = path.resolve(__dirname, "../../public/assets/items");
ensureDir(root);

for (const w of WEAPON_CATALOG) writeItem(root, w.id, w.rarity, w.affinity, "weapon");
for (const a of ARMOR_CATALOG) writeItem(root, a.id, a.rarity, a.affinity, "armor");
for (const p of POTION_CATALOG) writeItem(root, p.id, p.rarity, p.affinity, "potion");
for (const m of MATERIAL_CATALOG) writeItem(root, m.id, m.rarity, m.affinity, "material");
for (const ab of ABILITY_CATALOG) writeItem(root, ab.id, ab.rarity, ab.affinity, "ability");

const rarityDir = path.join(root, "rarity");
ensureDir(rarityDir);
for (const [r, color] of Object.entries(rarityColor)) {
  writeFileSync(
    path.join(rarityDir, `${r.toLowerCase()}-frame.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect x="4" y="4" width="120" height="120" rx="10" fill="none" stroke="${color}" stroke-width="4"/>
</svg>
`,
  );
}

console.log(
  `Item placeholders written under public/assets/items (${WEAPON_CATALOG.length} weapons, ${ARMOR_CATALOG.length} armor, ${POTION_CATALOG.length} potions, ${MATERIAL_CATALOG.length} materials, ${ABILITY_CATALOG.length} abilities)`,
);
