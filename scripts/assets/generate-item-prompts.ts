/**
 * Markdown art prompts for catalog items.
 * Run: npx tsx scripts/assets/generate-item-prompts.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";
import { ARMOR_CATALOG } from "@/lib/items/catalog/armor";
import { POTION_CATALOG } from "@/lib/items/catalog/potions";
import { MATERIAL_CATALOG } from "@/lib/items/catalog/materials";
import { ABILITY_CATALOG } from "@/lib/items/catalog/abilities";

const negative = `photorealism, 3D plastic render, realistic firearm, gun, rifle, pistol, ammunition, military weapon, blood, gore, text, logo, watermark, brand mark, UI chrome, existing game icons, Pokémon, Digimon, Final Fantasy, WoW, Diablo, Zelda, Fortnite, Axie, Palworld, Neopets, human hands, pet body in inventory art, mannequin, environment background`;

function writeMd(dir: string, slug: string, body: string) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, `${slug}.md`), body, "utf8");
}

const root = path.resolve(__dirname, "../../asset-prompts");

for (const w of WEAPON_CATALOG) {
  writeMd(
    path.join(root, "weapons"),
    w.id,
    `# ${w.name}

| Field | Value |
|-------|-------|
| Name | ${w.name} |
| Category | Weapon / ${w.weaponClass} |
| Rarity | ${w.rarity} |
| Affinity | ${w.affinity ?? "None"} |
| Purpose | Inventory + battle overlay |
| Canvas | 1024×1024 inventory · 256 icon · 512 overlay |
| Attachment | ${w.attachment} |
| File names | \`${w.id}.png\`, \`${w.id}-icon.png\`, \`${w.id}-overlay-l.png\`, \`${w.id}-overlay-r.png\` |

## Full art prompt

Create a completely original 2D fantasy pet weapon named ${w.name}.

Weapon class: ${w.weaponClass}
Affinity: ${w.affinity ?? "neutral"}
Rarity: ${w.rarity}
Compatible anatomy: ${w.compatibleAnatomy.join(", ")}

The weapon has a distinctive silhouette matching ${w.description}, constructed from original fantasy materials with controlled magical energy.

It attaches using ${w.attachment}.

Use a three-quarter game-item presentation, full object visible, centered, transparent background, polished 2D fantasy-game illustration, subtle pixel-art influence, clean dark outlines, layered cel shading, soft upper-left lighting, strong readable silhouette, and controlled magical energy.

Use the rarity’s visual language without adding a border directly into the source image.

No pet. No character. No hand. No text. No logo. No watermark. No environment. No realistic firearm design. No copied game weapon.

## Icon prompt

Cropped iconic ${w.name} on transparent background, strong silhouette, readable at 48px.

## Overlay prompt

Battle overlay for ${w.attachment}, left and right facing, transparent, no clipping through pet face.

## Effect prompt

Attack VFX for ${w.name}: stylized non-graphic impact sparks matching ${w.affinity ?? "neutral"} affinity.

## Negative prompt

${negative}

## Approval checklist

- [ ] Transparent background
- [ ] No text/logo
- [ ] Fantasy only (no firearm)
- [ ] Attachment readable
- [ ] Original IP
`,
  );
}

for (const a of ARMOR_CATALOG) {
  writeMd(
    path.join(root, "armor"),
    a.id,
    `# ${a.name}

| Field | Value |
|-------|-------|
| Name | ${a.name} |
| Category | Armor / ${a.armorClass} |
| Rarity | ${a.rarity} |
| Affinity | ${a.affinity ?? "None"} |
| Attachment | ${a.attachment} |

## Full art prompt

Create a completely original 2D fantasy armor item for a collectible Riftling pet.

Name: ${a.name}
Armor category: ${a.armorClass}
Affinity: ${a.affinity ?? "neutral"}
Rarity: ${a.rarity}
Compatible body type: ${a.compatibleAnatomy.join(", ")}

${a.description}

Design it so that it can attach cleanly to a small fantasy creature without covering the creature’s face or major identifying features.

Create a full inventory version on a transparent background.

Use polished 2D fantasy-game illustration, clean dark outline, layered cel shading, soft upper-left lighting, readable silhouette, and controlled magical effects.

No creature. No mannequin. No human. No text. No logo. No watermark. No environment.

## Negative prompt

${negative}
`,
  );
}

for (const p of POTION_CATALOG) {
  writeMd(
    path.join(root, "potions"),
    p.id,
    `# ${p.name}

| Field | Value |
|-------|-------|
| Name | ${p.name} |
| Type | ${p.potionType} |
| Rarity | ${p.rarity} |
| Affinity | ${p.affinity ?? "None"} |

## Full art prompt

Create a completely original 2D fantasy potion named ${p.name}.

Potion type: ${p.potionType}
Affinity: ${p.affinity ?? "neutral"}
Rarity: ${p.rarity}
Bottle shape: unique cork/stopper/charm design for ${p.name}
Liquid color: affinity-inspired
Magical effect: ${p.effect}

Centered game inventory item, transparent background, full bottle visible, polished 2D fantasy-game illustration, clean outline, layered glass reflections, glowing liquid, soft upper-left lighting.

No text. No label words. No logo. No watermark. No character. No environment. No copied potion bottle.

## Negative prompt

${negative}
`,
  );
}

for (const m of MATERIAL_CATALOG) {
  writeMd(
    path.join(root, "materials"),
    m.id,
    `# ${m.name}

| Field | Value |
|-------|-------|
| Name | ${m.name} |
| Rarity | ${m.rarity} |
| Category | Crafting material |

## Full art prompt

Create a completely original 2D fantasy crafting material named ${m.name}. ${m.description}
Transparent background, centered pile or crystal cluster, polished 2D fantasy illustration, no text, no logo.

## Negative prompt

${negative}
`,
  );
}

for (const ab of ABILITY_CATALOG) {
  writeMd(
    path.join(root, "abilities"),
    ab.id,
    `# ${ab.name}

| Field | Value |
|-------|-------|
| Name | ${ab.name} |
| Category | ${ab.category} |
| Affinity | ${ab.affinity ?? "None"} |
| Rarity | ${ab.rarity} |
| Canvas | 1024×1024 master → 512/32 icons |

## Ability icon prompt

Create a completely original square 2D fantasy ability icon for ${ab.name}.

Affinity: ${ab.affinity ?? "neutral"}
Ability category: ${ab.category}
Visual action: ${ab.description}

Use a single clear focal symbol with strong silhouette, dramatic magical motion, controlled particles, high contrast, no text, no letters, no border, and no character face.

Create at 1024 × 1024 pixels for later resizing. Must remain readable at 32 × 32 pixels.

## Negative prompt

${negative}
`,
  );
}

// Index files
for (const folder of ["weapons", "armor", "potions", "materials", "abilities", "scrolls", "cosmetics", "marketplace"]) {
  mkdirSync(path.join(root, folder), { recursive: true });
}
writeFileSync(
  path.join(root, "weapons", "index.md"),
  `# Weapon prompts\n\n${WEAPON_CATALOG.map((w) => `- [${w.name}](./${w.id}.md)`).join("\n")}\n`,
);
writeFileSync(
  path.join(root, "armor", "index.md"),
  `# Armor prompts\n\n${ARMOR_CATALOG.map((a) => `- [${a.name}](./${a.id}.md)`).join("\n")}\n`,
);
writeFileSync(
  path.join(root, "potions", "index.md"),
  `# Potion prompts\n\n${POTION_CATALOG.map((p) => `- [${p.name}](./${p.id}.md)`).join("\n")}\n`,
);

console.log("Item art prompts generated under asset-prompts/");
