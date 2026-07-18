/**
 * Install a substantial Live World pack from the game library into
 * public/assets/game/props/lw-*.png and generate typed keys for BootScene.
 *
 * Re-renders pack sprites with the current procedural SVG (quality pass)
 * when --rerender is set (default on).
 *
 * Usage:
 *   node scripts/assets/install-game-library.mjs
 *   node scripts/assets/install-game-library.mjs --no-rerender
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { expandCatalog } from "./game-library/defs.mjs";
import { renderEntrySvg } from "./game-library/render-svg.mjs";
import { selectWorldPack, worldKeyForId } from "./game-library/world-pack.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CATALOG = path.join(ROOT, "src/content/assets/game-library.json");
const OUT_PROPS = path.join(ROOT, "public/assets/game/props");
const OUT_INDEX = path.join(ROOT, "public/assets/game/library/WORLD_INSTALL.json");
const OUT_KEYS_TS = path.join(ROOT, "src/content/assets/library-world-keys.ts");
const OUT_DOCS_SNIPPET = path.join(ROOT, "artifacts/assets/game-library/WORLD_INSTALL_REPORT.md");

const LEGACY_BOOT_MAP = {
  "tree-oak-summer-mature": "lib-tree-oak-summer",
  "bush-moss-summer-large": "lib-bush-moss",
  "flower-riftlily-cyan-small": "lib-flower-riftlily",
  "mushroom-cap-amber-small": "lib-mushroom-amber",
  "fence-wood-post": "lib-fence-post",
  "crate-market-amber": "lib-crate-market",
  "lantern-rift-glow": "lib-lantern-rift",
};

function parseArgs(argv) {
  return { rerender: !argv.includes("--no-rerender") };
}

async function writePngFromSvg(entry, destAbs, size = 140) {
  const svg = renderEntrySvg({ ...entry, size });
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(destAbs);
}

async function writePngFromLibrary(srcPublicPath, destAbs, size = 140) {
  const src = path.join(ROOT, "public", srcPublicPath.replace(/^\//, ""));
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  await sharp(src)
    .ensureAlpha()
    .resize(size, size, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(destAbs);
  return true;
}

function writeKeysTs(keys) {
  const body = `/**
 * Live World–installed library prop keys (generated).
 * Regenerate: npm run assets:install:library
 * Do not hand-edit — update scripts/assets/game-library/world-pack.mjs
 */

export const LIBRARY_WORLD_KEYS = ${JSON.stringify(keys, null, 2)} as const;

export type LibraryWorldKey = (typeof LIBRARY_WORLD_KEYS)[number];

export function isLibraryWorldKey(key: string): key is LibraryWorldKey {
  return (LIBRARY_WORLD_KEYS as readonly string[]).includes(key);
}

export function isLibraryTreeKey(key: string): boolean {
  return key.startsWith("lw-tree-");
}

export function isLibraryBushKey(key: string): boolean {
  return key.startsWith("lw-bush-");
}

export function isLibraryFlowerKey(key: string): boolean {
  return key.startsWith("lw-flower-") || key.startsWith("lw-mushroom-");
}
`;
  fs.mkdirSync(path.dirname(OUT_KEYS_TS), { recursive: true });
  fs.writeFileSync(OUT_KEYS_TS, body, "utf8");
}

function districtHints(entry) {
  const f = entry.family;
  if (f === "tree" || f === "bush" || f === "flower" || f === "grass" || f === "mushroom") {
    return ["grove", "residential", "recovery", "farm"];
  }
  if (f === "crate" || f === "barrel" || f === "goods" || f === "stall" || f === "sign") {
    return ["market", "dock", "craft"];
  }
  if (f === "lantern" || f === "furniture" || f === "fence" || f === "gate") {
    return ["plaza", "residential", "guild"];
  }
  if (f === "animal" || f === "riftling" || f === "npc" || f === "keeper") {
    return ["plaza", "market", "residential"];
  }
  if (f === "rock" || f === "bridge" || f === "dock" || f === "wall" || f === "door") {
    return ["forest", "dock", "plaza"];
  }
  return ["plaza"];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(CATALOG)) {
    console.error("Catalog missing. Run: npm run assets:generate:library");
    process.exit(1);
  }
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const full = expandCatalog();
  const pack = selectWorldPack(full);
  console.log(`World pack: ${pack.length} assets (catalog ${catalog.count}). rerender=${opts.rerender}`);

  const installed = [];
  const keys = [];

  for (const entry of pack) {
    const key = worldKeyForId(entry.id);
    const dest = path.join(OUT_PROPS, `${key}.png`);
    if (opts.rerender) {
      await writePngFromSvg(entry, dest, entry.family === "tree" || entry.family === "stall" ? 160 : 140);
    } else {
      const ok = await writePngFromLibrary(entry.path, dest);
      if (!ok) {
        await writePngFromSvg(entry, dest);
      }
    }
    // Also refresh library webp so catalog stays in sync with quality pass
    if (opts.rerender) {
      const libAbs = path.join(ROOT, "public", entry.path.replace(/^\//, ""));
      fs.mkdirSync(path.dirname(libAbs), { recursive: true });
      const size = entry.size ?? 96;
      const svg = renderEntrySvg({ ...entry, size });
      await sharp(Buffer.from(svg))
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 84, alphaQuality: 90 })
        .toFile(libAbs);
    }

    keys.push(key);
    installed.push({
      id: entry.id,
      key,
      path: `/assets/game/props/${key}.png`,
      libraryPath: entry.path,
      category: entry.category,
      family: entry.family,
      layer: entry.layer,
      tags: entry.tags,
      districts: districtHints(entry),
    });
    if (installed.length % 25 === 0) console.log(`  … ${installed.length}/${pack.length}`);
  }

  // Keep legacy short lib-* aliases for the original 7
  for (const [id, legacyKey] of Object.entries(LEGACY_BOOT_MAP)) {
    const entry = pack.find((e) => e.id === id) ?? full.find((e) => e.id === id);
    if (!entry) continue;
    const dest = path.join(OUT_PROPS, `${legacyKey}.png`);
    await writePngFromSvg(entry, dest, 140);
    if (!keys.includes(legacyKey)) {
      // legacy keys stay in asset-keys separately; don't add to LIBRARY_WORLD_KEYS
    }
  }

  writeKeysTs(keys);

  const byFamily = {};
  for (const row of installed) {
    byFamily[row.family] = (byFamily[row.family] ?? 0) + 1;
  }

  const index = {
    version: 2,
    installedAt: new Date().toISOString(),
    catalogCount: catalog.count,
    worldPackCount: installed.length,
    engineNote: process.env.XAI_API_KEY
      ? "XAI_API_KEY present — prefer GAME_LIBRARY_ENGINE=grok for hero regen"
      : "No XAI_API_KEY — procedural SVG quality pass installed into Live World",
    byFamily,
    props: installed,
  };
  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
  fs.writeFileSync(OUT_INDEX, JSON.stringify(index, null, 2), "utf8");

  // Also write BOOT_INDEX for backwards compat
  fs.writeFileSync(
    path.join(ROOT, "public/assets/game/library/BOOT_INDEX.json"),
    JSON.stringify(
      {
        version: 2,
        installedAt: index.installedAt,
        catalogCount: catalog.count,
        bootProps: installed.filter((p) => LEGACY_BOOT_MAP[p.id]).map((p) => ({
          id: p.id,
          key: LEGACY_BOOT_MAP[p.id],
          path: `/assets/game/props/${LEGACY_BOOT_MAP[p.id]}.png`,
          libraryPath: p.libraryPath,
        })),
        worldPackCount: installed.length,
      },
      null,
      2,
    ),
    "utf8",
  );

  const report = [
    `# Live World library install`,
    ``,
    `- **When:** ${index.installedAt}`,
    `- **Catalog total:** ${catalog.count}`,
    `- **Installed into Live World (BootScene props):** ${installed.length}`,
    `- **Catalog-only (not preloaded):** ${catalog.count - installed.length}`,
    `- **Note:** ${index.engineNote}`,
    ``,
    `## By family`,
    ``,
    ...Object.entries(byFamily)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Paths`,
    ``,
    `- Props: \`public/assets/game/props/lw-*.png\``,
    `- Index: \`public/assets/game/library/WORLD_INSTALL.json\``,
    `- Keys: \`src/content/assets/library-world-keys.ts\``,
    ``,
    `Players see these via Commons scatter + BootScene preload. Remaining catalog assets stay under \`public/assets/game/library/\` for tools and future districts.`,
    ``,
  ].join("\n");
  fs.mkdirSync(path.dirname(OUT_DOCS_SNIPPET), { recursive: true });
  fs.writeFileSync(OUT_DOCS_SNIPPET, report, "utf8");

  console.log(`Installed ${installed.length} Live World props. Keys → ${path.relative(ROOT, OUT_KEYS_TS)}`);
  console.log(`Report → ${path.relative(ROOT, OUT_DOCS_SNIPPET)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
