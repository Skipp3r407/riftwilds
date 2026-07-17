/**
 * Creates labeled development placeholders for every NPC asset path.
 * Does not claim generated art — clearly marked PLACEHOLDER.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

// Dynamic import of generated catalog via ts transpilation isn't available;
// read JSON-ish from the generated TS by eval-safe extract.
const catalogPath = path.join(ROOT, "src/content/npcs/catalog.generated.ts");
const src = fs.readFileSync(catalogPath, "utf8");
const jsonMatch = src.match(/export const NPC_CATALOG_GENERATED: NpcDef\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error("Could not parse catalog");
  process.exit(1);
}
const npcs = JSON.parse(jsonMatch[1]);

function ensurePng(filePath, label, w, h, color) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 800) return false;
  // Minimal valid 1x1 PNG expanded via SVG→ we'll write SVG placeholders as .png labeled
  // Use a tiny PNG encoder without deps: write SVG sibling + simple PNG header via canvas-less approach
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#1a2438"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="#3de7ff" stroke-width="4"/>
  <text x="50%" y="42%" text-anchor="middle" fill="#e8e0ff" font-family="Segoe UI, sans-serif" font-size="${Math.max(14, Math.floor(w / 16))}">PLACEHOLDER</text>
  <text x="50%" y="58%" text-anchor="middle" fill="#3de7ff" font-family="Segoe UI, sans-serif" font-size="${Math.max(12, Math.floor(w / 20))}">${label}</text>
</svg>`;
  const svgPath = filePath.replace(/\.png$/i, ".svg");
  fs.writeFileSync(svgPath, svg, "utf8");
  // Also copy svg bytes as .png fallback won't decode — write a real tiny PNG
  // 1x1 cyan PNG
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  fs.writeFileSync(filePath, png);
  return true;
}

let created = 0;
for (const n of npcs) {
  const region = n.regionId;
  const slug = n.slug;
  const dir = path.join(ROOT, "public/assets/npcs", region, slug);
  const color = (n.colorPalette && n.colorPalette[0]) || "#3de7ff";
  const files = [
    ["portrait.png", n.displayName, 512, 512],
    ["full-body.png", n.displayName, 512, 768],
    ["thumbnail.png", n.shortName || n.displayName, 256, 256],
    ["sprite.png", n.shortName || "NPC", 128, 128],
  ];
  for (const [file, label, w, h] of files) {
    if (ensurePng(path.join(dir, file), label, w, h, color)) created++;
  }
  const meta = {
    id: n.id,
    slug,
    regionId: region,
    artStatus: "placeholder",
    note: "Labeled development placeholder — not final Grok art",
    prompts: n.imagePrompts,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(meta, null, 2));
}

console.log(`Placeholders ensured for ${npcs.length} NPCs (${created} new png stubs + svg labels)`);
