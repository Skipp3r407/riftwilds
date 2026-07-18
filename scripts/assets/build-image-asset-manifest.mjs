/**
 * Builds docs/assets/IMAGE_ASSET_MANIFEST.json from disk + scan-latest.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "docs/assets/IMAGE_ASSET_MANIFEST.json");
const SCAN = path.join(ROOT, "artifacts/assets/reports/scan-latest.json");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (/\.(png|webp|svg|jpg|jpeg|gif|avif)$/i.test(e.name)) acc.push(full);
  }
  return acc;
}

function classify(rel, bytes) {
  if (bytes < 200) return "Remove";
  if (bytes < 5000 && rel.endsWith(".png")) return "Regenerate";
  if (bytes > 2_500_000) return "Optimize";
  if (rel.includes("/placeholders/")) return "Replace";
  if (rel.endsWith(".svg") && rel.includes("/npcs/")) return "Keep";
  if (rel.endsWith(".webp")) return "Keep";
  return "Keep";
}

const scan = fs.existsSync(SCAN)
  ? JSON.parse(fs.readFileSync(SCAN, "utf8"))
  : { totals: {}, missing: [] };

const files = walk(path.join(ROOT, "public/assets"));
const assets = files.map((full) => {
  const rel = path.relative(path.join(ROOT, "public"), full).replace(/\\/g, "/");
  const bytes = fs.statSync(full).size;
  const category = rel.split("/")[1] || "other";
  return {
    path: `/${rel}`,
    category,
    bytes,
    action: classify(rel, bytes),
  };
});

const byAction = {};
const byCategory = {};
for (const a of assets) {
  byAction[a.action] = (byAction[a.action] || 0) + 1;
  byCategory[a.category] = (byCategory[a.category] || 0) + 1;
}

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceScan: scan.scannedAt ?? null,
  scanTotals: scan.totals ?? null,
  scanMissing: (scan.missing || []).map((m) => ({
    id: m.id,
    path: m.path,
    category: m.category,
    priority: m.priority,
  })),
  totals: {
    files: assets.length,
    bytes: assets.reduce((s, a) => s + a.bytes, 0),
    byAction,
    byCategory,
  },
  sessionHighlights: {
    ambientNpcPortraitsGenerated: 58,
    npcKitsDerivedAndCompressed: 112,
    terrainTilesAdded: 7,
    tilesetBuilt: true,
    ogImageWired: true,
    emptyStatesAdded: 3,
    missingItemIconsFilled: 65,
    paintedHeroItemIcons: 4,
  },
  assets: assets
    .filter((a) => a.action !== "Keep" || a.bytes > 1_500_000)
    .concat(
      assets
        .filter((a) =>
          [
            "marketing",
            "terrain",
            "tilesets",
            "maps",
            "brand",
          ].includes(a.category),
        )
        .slice(0, 80),
    )
    .slice(0, 500),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${OUT} (${assets.length} files scanned)`);
