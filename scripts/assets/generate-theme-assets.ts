/**
 * Riftwilds-themed 2D placeholders: items, eggs, UI wallpapers, region panels.
 * Palette matches site CSS. Original silhouettes only.
 *
 * Run: npx tsx scripts/assets/generate-theme-assets.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { WEAPON_CATALOG } from "@/lib/items/catalog/weapons";
import { ARMOR_CATALOG } from "@/lib/items/catalog/armor";
import { POTION_CATALOG } from "@/lib/items/catalog/potions";
import { MATERIAL_CATALOG } from "@/lib/items/catalog/materials";
import { ABILITY_CATALOG } from "@/lib/items/catalog/abilities";
import type { ItemRarity } from "@/lib/items/types";

const ROOT = path.resolve(__dirname, "../..");

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

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

function itemSvg(opts: {
  id: string;
  rarity: ItemRarity;
  affinity: string | null;
  kind: "weapon" | "armor" | "potion" | "material" | "ability";
}): string {
  const rc = rarityColor[opts.rarity];
  const ac = affinityColor[opts.affinity ?? "NONE"] ?? affinityColor.NONE!;
  const h = hash(opts.id);
  const tilt = ((h % 11) - 5) * 1.2;
  const glow = opts.rarity === "COMMON" || opts.rarity === "UNCOMMON" ? 0.2 : 0.45;

  const body =
    opts.kind === "potion"
      ? `
      <ellipse cx="64" cy="36" rx="14" ry="8" fill="${rc}" opacity="0.9"/>
      <path d="M50 42 L78 42 L74 96 Q64 112 54 96 Z" fill="url(#grad)" stroke="#0a1020" stroke-width="2.5"/>
      <ellipse cx="64" cy="62" rx="8" ry="12" fill="#fff" opacity="0.18"/>
      <path d="M58 50 Q64 70 70 50" fill="none" stroke="${ac}" stroke-width="2" opacity="0.7"/>`
      : opts.kind === "ability"
        ? `
      <circle cx="64" cy="64" r="34" fill="${ac}" opacity="0.12"/>
      <circle cx="64" cy="64" r="26" fill="none" stroke="${ac}" stroke-width="3"/>
      <path d="M64 34 L72 58 L64 54 L56 58 Z" fill="${ac}"/>
      <path d="M64 94 L56 70 L64 74 L72 70 Z" fill="${rc}" opacity="0.85"/>
      <circle cx="64" cy="64" r="6" fill="#e8f0ff"/>`
        : opts.kind === "material"
          ? `
      <polygon points="64,28 92,52 80,96 48,96 36,52" fill="url(#grad)" stroke="#0a1020" stroke-width="2.5"/>
      <polygon points="64,40 78,56 70,80 58,80 50,56" fill="#fff" opacity="0.15"/>
      <circle cx="64" cy="62" r="5" fill="${rc}"/>`
          : opts.kind === "armor"
            ? `
      <path d="M40 40 L64 28 L88 40 L92 78 L64 100 L36 78 Z" fill="url(#grad)" stroke="#0a1020" stroke-width="2.5"/>
      <path d="M48 48 L64 40 L80 48 L78 74 L64 88 L50 74 Z" fill="#0c1428" opacity="0.35"/>
      <circle cx="64" cy="58" r="7" fill="${rc}" opacity="0.9"/>`
            : `
      <g transform="rotate(${tilt} 64 64)">
        <path d="M40 78 L64 24 L88 78 L76 104 L52 104 Z" fill="url(#grad)" stroke="#0a1020" stroke-width="2.5"/>
        <path d="M56 70 L64 42 L72 70" fill="none" stroke="#0a1020" stroke-width="2"/>
        <circle cx="64" cy="72" r="9" fill="${rc}"/>
        <path d="M48 86 L80 86" stroke="${ac}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="512" height="512">
  <defs>
    <radialGradient id="aura" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${rc}" stop-opacity="${glow}"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="grad" x1="20%" y1="10%" x2="80%" y2="95%">
      <stop offset="0%" stop-color="${ac}"/>
      <stop offset="55%" stop-color="${ac}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#1a2744"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="none"/>
  <circle cx="64" cy="64" r="52" fill="url(#aura)"/>
  ${body}
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
  const content = itemSvg({ id, rarity, affinity, kind });
  writeFileSync(path.join(invDir, `${id}.svg`), content);
  writeFileSync(path.join(iconDir, `${id}.svg`), content);
}

function eggSvg(name: string, c1: string, c2: string, accent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="512" height="640">
  <defs>
    <radialGradient id="shell" cx="35%" cy="28%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="35%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="60%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="256" height="320" fill="none"/>
  <ellipse cx="128" cy="260" rx="70" ry="18" fill="url(#glow)"/>
  <ellipse cx="128" cy="150" rx="78" ry="105" fill="url(#shell)" stroke="#0a1020" stroke-width="4"/>
  <path d="M70 130 Q128 90 186 130" fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/>
  <path d="M80 170 Q128 200 176 160" fill="none" stroke="#0a1020" stroke-width="2" opacity="0.25"/>
  <ellipse cx="100" cy="110" rx="18" ry="12" fill="#fff" opacity="0.28"/>
</svg>
`;
}

function wallpaperSvg(opts: {
  title: string;
  c1: string;
  c2: string;
  c3: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="a" cx="20%" cy="30%" r="55%">
      <stop offset="0%" stop-color="${opts.c1}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="${opts.c2}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c" cx="50%" cy="95%" r="45%">
      <stop offset="0%" stop-color="${opts.c3}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30 26 V34 M26 30 H34" stroke="#e8f0ff" stroke-opacity="0.06" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="#070b16"/>
  <rect width="1920" height="1080" fill="url(#a)"/>
  <rect width="1920" height="1080" fill="url(#b)"/>
  <rect width="1920" height="1080" fill="url(#c)"/>
  <rect width="1920" height="1080" fill="url(#grid)"/>
  <path d="M0 820 Q480 760 960 840 T1920 780 L1920 1080 L0 1080 Z" fill="#0c1428" opacity="0.55"/>
  <path d="M200 200 L320 260 L280 300 Z" fill="${opts.c1}" opacity="0.08"/>
  <path d="M1500 140 L1680 200 L1600 260 Z" fill="${opts.c2}" opacity="0.08"/>
  <!-- ${opts.title} -->
</svg>
`;
}

function regionCardSvg(name: string, color: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c1428"/>
      <stop offset="100%" stop-color="#121c34"/>
    </linearGradient>
    <radialGradient id="r" cx="70%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <rect width="640" height="360" fill="url(#r)"/>
  <path d="M0 260 Q160 220 320 270 T640 250 L640 360 L0 360 Z" fill="${color}" opacity="0.15"/>
  <circle cx="480" cy="120" r="40" fill="${color}" opacity="0.2"/>
  <text x="32" y="48" fill="#e8f0ff" font-family="Orbitron, sans-serif" font-size="22" opacity="0.9">${name}</text>
</svg>
`;
}

// ─── Items ───────────────────────────────────────────────────────────────────
const itemsRoot = path.join(ROOT, "public/assets/items");
ensureDir(itemsRoot);
for (const w of WEAPON_CATALOG) writeItem(itemsRoot, w.id, w.rarity, w.affinity, "weapon");
for (const a of ARMOR_CATALOG) writeItem(itemsRoot, a.id, a.rarity, a.affinity, "armor");
for (const p of POTION_CATALOG) writeItem(itemsRoot, p.id, p.rarity, p.affinity, "potion");
for (const m of MATERIAL_CATALOG) writeItem(itemsRoot, m.id, m.rarity, m.affinity, "material");
for (const ab of ABILITY_CATALOG) writeItem(itemsRoot, ab.id, ab.rarity, ab.affinity, "ability");

const rarityDir = path.join(itemsRoot, "rarity");
ensureDir(rarityDir);
for (const [r, color] of Object.entries(rarityColor)) {
  writeFileSync(
    path.join(rarityDir, `${r.toLowerCase()}-frame.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="f" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="120" height="120" rx="14" fill="none" stroke="url(#f)" stroke-width="4"/>
  <rect x="10" y="10" width="108" height="108" rx="10" fill="${color}" opacity="0.06"/>
</svg>
`,
  );
}

// ─── Eggs ────────────────────────────────────────────────────────────────────
const eggsDir = path.join(ROOT, "public/assets/eggs");
const placeholdersDir = path.join(ROOT, "public/assets/placeholders");
ensureDir(eggsDir);
ensureDir(placeholdersDir);

const eggs: [string, string, string, string][] = [
  ["common-rift", "#fff2d6", "#ffb84d", "#3de7ff"],
  ["ember", "#ffe0c2", "#ff7a3d", "#ffb84d"],
  ["tide", "#d6ecff", "#3d9bff", "#3de7ff"],
  ["grove", "#d9ffe6", "#4adf7a", "#3de7ff"],
  ["storm", "#e8f0ff", "#b8d4ff", "#3de7ff"],
  ["stone", "#ebe0d0", "#c4a882", "#ffb84d"],
  ["frost", "#e8fbff", "#a8e7ff", "#3de7ff"],
  ["radiant", "#fff8d0", "#ffe566", "#ffb84d"],
  ["void", "#e8dfff", "#7a5cff", "#3de7ff"],
  ["alloy", "#edf0f5", "#d0d6e0", "#3de7ff"],
  ["spirit", "#ffe6f4", "#ff9ad5", "#3de7ff"],
  ["celestial", "#e6f9ff", "#7dd3fc", "#ffe566"],
];

for (const [slug, c1, c2, accent] of eggs) {
  const svg = eggSvg(slug, c1, c2, accent);
  writeFileSync(path.join(eggsDir, `${slug}.svg`), svg);
}
writeFileSync(path.join(placeholdersDir, "egg-wild.svg"), eggSvg("wild", "#fff2d6", "#ffb84d", "#3de7ff"));

// ─── UI wallpapers ───────────────────────────────────────────────────────────
const uiDir = path.join(ROOT, "public/assets/ui/wallpapers");
ensureDir(uiDir);
const walls: [string, string, string, string][] = [
  ["hero", "#ff7a3d", "#3d9bff", "#4adf7a"],
  ["hatchery", "#ffb84d", "#3de7ff", "#ff7a3d"],
  ["shop", "#3de7ff", "#9b7bff", "#ffb84d"],
  ["arena", "#ff6b6b", "#3de7ff", "#7a5cff"],
  ["live-world", "#4adf7a", "#3de7ff", "#ff9ad5"],
  ["marketplace", "#ffb84d", "#3d9bff", "#3de7ff"],
  ["economy", "#3de7ff", "#ffe566", "#4adf7a"],
  ["guilds", "#9b7bff", "#3de7ff", "#ffb84d"],
  ["homestead", "#4adf7a", "#c4a882", "#ffb84d"],
  ["inventory", "#3d9bff", "#d0d6e0", "#3de7ff"],
];
for (const [name, c1, c2, c3] of walls) {
  writeFileSync(path.join(uiDir, `${name}.svg`), wallpaperSvg({ title: name, c1, c2, c3 }));
  writeFileSync(
    path.join(ROOT, "asset-prompts/ui", `wallpaper-${name}.md`),
    `# Wallpaper: ${name}

## Style
Follow \`asset-prompts/STYLE_GUIDE.md\`. Riftwilds dark navy (#070b16), cyan (#3de7ff), amber (#ffb84d).

## Scene
Full-bleed atmospheric wallpaper for the **${name}** route. Soft affinity glows (${c1}, ${c2}, ${c3}), faint plus-grid, distant rift ridges. No UI chrome, no text, no logos.

## Specs
1920×1080 (or 2560×1440). Soft upper-left light. Cel-shaded fantasy atmosphere. Original — not copied from any game.
`,
  );
}

// ─── Region panels ───────────────────────────────────────────────────────────
const regionsDir = path.join(ROOT, "public/assets/regions");
ensureDir(regionsDir);
const regions: [string, string][] = [
  ["riftwild-commons", "#3de7ff"],
  ["ember-crater", "#ff7a3d"],
  ["moonwater-coast", "#3d9bff"],
  ["elderwood-forest", "#4adf7a"],
  ["stormspire-peaks", "#b8d4ff"],
  ["stoneheart-canyon", "#c4a882"],
  ["frostveil-basin", "#a8e7ff"],
  ["radiant-citadel", "#ffe566"],
  ["void-hollow", "#7a5cff"],
  ["alloy-ruins", "#d0d6e0"],
  ["spirit-marsh", "#ff9ad5"],
  ["celestial-rift", "#7dd3fc"],
];
for (const [slug, color] of regions) {
  writeFileSync(
    path.join(regionsDir, `${slug}.svg`),
    regionCardSvg(slug.replace(/-/g, " "), color),
  );
}

// ─── Furniture / homestead accents ───────────────────────────────────────────
const furnDir = path.join(ROOT, "public/assets/furniture");
ensureDir(furnDir);
const furniture = [
  ["pet-bed", "#ff9ad5"],
  ["ember-lantern", "#ff7a3d"],
  ["tide-fountain", "#3d9bff"],
  ["grove-planter", "#4adf7a"],
  ["alloy-workbench", "#d0d6e0"],
  ["spirit-shrine", "#ff9ad5"],
  ["trophy-plinth", "#ffb84d"],
  ["storage-crate", "#c4a882"],
];
for (const [slug, color] of furniture) {
  writeFileSync(
    path.join(furnDir, `${slug}.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#1a2744"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="none"/>
  <rect x="28" y="48" width="72" height="52" rx="8" fill="url(#g)" stroke="#0a1020" stroke-width="2.5"/>
  <rect x="40" y="36" width="48" height="16" rx="4" fill="${color}" opacity="0.7"/>
  <ellipse cx="64" cy="70" rx="16" ry="8" fill="#fff" opacity="0.12"/>
</svg>
`,
  );
}

console.log(
  [
    `Theme assets written:`,
    `- items: ${WEAPON_CATALOG.length + ARMOR_CATALOG.length + POTION_CATALOG.length + MATERIAL_CATALOG.length + ABILITY_CATALOG.length}`,
    `- eggs: ${eggs.length}`,
    `- wallpapers: ${walls.length}`,
    `- regions: ${regions.length}`,
    `- furniture: ${furniture.length}`,
  ].join("\n"),
);
