/**
 * Paint unique PNG icons for missing catalog item paths (no DEV watermark).
 * Uses sharp gradients + silhouettes keyed by id hash for visual variety.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const missingPath = path.join(ROOT, "artifacts/assets/batches/missing-items.json");

const KIND_COLORS = {
  weapons: ["#ff7a3d", "#3d9bff", "#4adf7a", "#b8d4ff", "#c4a882", "#a8e7ff", "#ffe566", "#7a5cff"],
  armor: ["#8b93a7", "#3ecf7a", "#3d9bff", "#a855f7", "#f5c542", "#ff6bcb"],
  armors: ["#8b93a7", "#3ecf7a", "#3d9bff", "#a855f7", "#f5c542", "#ff6bcb"],
  potions: ["#3ecf7a", "#3d9bff", "#ff7a3d", "#a8e7ff", "#ff9ad5", "#ffe566"],
  materials: ["#c4a882", "#d0d6e0", "#4adf7a", "#7a5cff", "#ff7a3d", "#3d9bff"],
};

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function svgIcon(id, kind) {
  const h = hash(id);
  const palette = KIND_COLORS[kind] || KIND_COLORS.materials;
  const c1 = palette[h % palette.length];
  const c2 = palette[(h >> 3) % palette.length];
  const c3 = palette[(h >> 6) % palette.length];
  const shape =
    kind === "weapons"
      ? `<path d="M48 14 L62 48 L54 90 L42 90 L34 48 Z" fill="${c1}"/><circle cx="48" cy="52" r="10" fill="${c2}"/><rect x="44" y="88" width="8" height="22" rx="2" fill="${c3}"/>`
      : kind === "armor" || kind === "armors"
        ? `<path d="M28 34 L48 22 L68 34 L72 78 L48 96 L24 78 Z" fill="${c1}"/><path d="M36 40 L48 32 L60 40 L58 72 L48 82 L38 72 Z" fill="${c2}" opacity="0.85"/>`
        : kind === "potions"
          ? `<path d="M40 28 L56 28 L62 44 L62 96 Q62 108 48 108 Q34 108 34 96 L34 44 Z" fill="${c1}"/><ellipse cx="48" cy="28" rx="12" ry="7" fill="${c2}"/><ellipse cx="48" cy="70" rx="10" ry="14" fill="${c3}" opacity="0.55"/>`
          : `<polygon points="48,18 82,42 70,88 26,88 14,42" fill="${c1}"/><circle cx="48" cy="54" r="14" fill="${c2}" opacity="0.8"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 96 128">
  <defs>
    <radialGradient id="g" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#2a3144"/>
      <stop offset="100%" stop-color="#0c1018"/>
    </radialGradient>
  </defs>
  <rect width="96" height="128" rx="16" fill="url(#g)"/>
  <circle cx="48" cy="56" r="42" fill="none" stroke="${c3}" stroke-width="2" opacity="0.35"/>
  ${shape}
</svg>`;
}

async function main() {
  if (!fs.existsSync(missingPath)) {
    console.error("missing-items.json not found — run assets:scan first");
    process.exit(1);
  }
  const missing = JSON.parse(fs.readFileSync(missingPath, "utf8"));
  let made = 0;
  for (const item of missing) {
    const rel = item.path.replace(/^\//, "");
    const full = path.join(ROOT, "public", rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (fs.existsSync(full) && fs.statSync(full).size > 2000) continue;
    const kind = rel.split("/")[2];
    const svg = svgIcon(item.id.replace(/^item-/, ""), kind);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(full);
    made++;
    console.log("wrote", rel, fs.statSync(full).size);
  }
  console.log(`Created ${made} item icons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
