/**
 * Generates reusable Riftwilds button skin PNGs/WebPs (no baked labels).
 * Output: public/assets/ui/buttons/
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";

const OUT = path.resolve(__dirname, "../../public/assets/ui/buttons");
const W = 512;
const H = 96;
const R = 48; // full pill

type Skin = {
  id: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  glow: string;
  highlight: string;
  shade: string;
  innerGlow?: string;
};

const skins: Skin[] = [
  {
    id: "primary",
    fill: "url(#primaryFill)",
    stroke: "rgba(255,255,255,0.35)",
    strokeWidth: 2,
    glow: "rgba(61,231,255,0.55)",
    highlight: "rgba(255,255,255,0.45)",
    shade: "rgba(20,10,60,0.22)",
    innerGlow: "rgba(155,123,255,0.35)",
  },
  {
    id: "primary-hover",
    fill: "url(#primaryHoverFill)",
    stroke: "rgba(255,255,255,0.5)",
    strokeWidth: 2.5,
    glow: "rgba(61,231,255,0.75)",
    highlight: "rgba(255,255,255,0.55)",
    shade: "rgba(20,10,60,0.18)",
    innerGlow: "rgba(155,123,255,0.45)",
  },
  {
    id: "primary-pressed",
    fill: "url(#primaryPressedFill)",
    stroke: "rgba(255,255,255,0.28)",
    strokeWidth: 2,
    glow: "rgba(61,231,255,0.35)",
    highlight: "rgba(255,255,255,0.25)",
    shade: "rgba(10,8,40,0.35)",
    innerGlow: "rgba(120,90,220,0.4)",
  },
  {
    id: "secondary",
    fill: "url(#secondaryFill)",
    stroke: "rgba(61,231,255,0.42)",
    strokeWidth: 2.5,
    glow: "rgba(61,231,255,0.18)",
    highlight: "rgba(255,255,255,0.12)",
    shade: "rgba(0,0,0,0.35)",
  },
  {
    id: "secondary-hover",
    fill: "url(#secondaryHoverFill)",
    stroke: "rgba(61,231,255,0.7)",
    strokeWidth: 2.5,
    glow: "rgba(61,231,255,0.32)",
    highlight: "rgba(255,255,255,0.18)",
    shade: "rgba(0,0,0,0.28)",
  },
  {
    id: "danger",
    fill: "url(#dangerFill)",
    stroke: "rgba(255,180,190,0.4)",
    strokeWidth: 2,
    glow: "rgba(255,92,122,0.45)",
    highlight: "rgba(255,255,255,0.35)",
    shade: "rgba(60,0,20,0.28)",
  },
  {
    id: "danger-hover",
    fill: "url(#dangerHoverFill)",
    stroke: "rgba(255,200,210,0.5)",
    strokeWidth: 2.5,
    glow: "rgba(255,92,122,0.65)",
    highlight: "rgba(255,255,255,0.45)",
    shade: "rgba(60,0,20,0.22)",
  },
  {
    id: "success",
    fill: "url(#successFill)",
    stroke: "rgba(200,255,230,0.4)",
    strokeWidth: 2,
    glow: "rgba(61,255,176,0.45)",
    highlight: "rgba(255,255,255,0.35)",
    shade: "rgba(0,40,30,0.28)",
  },
  {
    id: "success-hover",
    fill: "url(#successHoverFill)",
    stroke: "rgba(220,255,240,0.5)",
    strokeWidth: 2.5,
    glow: "rgba(61,255,176,0.65)",
    highlight: "rgba(255,255,255,0.45)",
    shade: "rgba(0,40,30,0.22)",
  },
  {
    id: "ghost",
    fill: "url(#ghostFill)",
    stroke: "rgba(148,197,255,0.22)",
    strokeWidth: 1.5,
    glow: "rgba(61,231,255,0.08)",
    highlight: "rgba(255,255,255,0.08)",
    shade: "rgba(0,0,0,0.2)",
  },
  {
    id: "ghost-hover",
    fill: "url(#ghostHoverFill)",
    stroke: "rgba(61,231,255,0.4)",
    strokeWidth: 1.5,
    glow: "rgba(61,231,255,0.16)",
    highlight: "rgba(255,255,255,0.12)",
    shade: "rgba(0,0,0,0.15)",
  },
  {
    id: "amber",
    fill: "url(#amberFill)",
    stroke: "rgba(255,230,180,0.45)",
    strokeWidth: 2,
    glow: "rgba(255,184,77,0.5)",
    highlight: "rgba(255,255,255,0.4)",
    shade: "rgba(50,25,0,0.28)",
  },
  {
    id: "amber-hover",
    fill: "url(#amberHoverFill)",
    stroke: "rgba(255,240,200,0.55)",
    strokeWidth: 2.5,
    glow: "rgba(255,184,77,0.7)",
    highlight: "rgba(255,255,255,0.5)",
    shade: "rgba(50,25,0,0.22)",
  },
  {
    id: "icon",
    fill: "url(#iconFill)",
    stroke: "rgba(61,231,255,0.45)",
    strokeWidth: 2,
    glow: "rgba(61,231,255,0.25)",
    highlight: "rgba(255,255,255,0.15)",
    shade: "rgba(0,0,0,0.3)",
  },
  {
    id: "icon-hover",
    fill: "url(#iconHoverFill)",
    stroke: "rgba(61,231,255,0.7)",
    strokeWidth: 2.5,
    glow: "rgba(61,231,255,0.4)",
    highlight: "rgba(255,255,255,0.22)",
    shade: "rgba(0,0,0,0.22)",
  },
];

function defs(): string {
  return `
  <defs>
    <linearGradient id="primaryFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3de7ff"/>
      <stop offset="55%" stop-color="#7b6dff"/>
      <stop offset="100%" stop-color="#9b7bff"/>
    </linearGradient>
    <linearGradient id="primaryHoverFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6ef0ff"/>
      <stop offset="50%" stop-color="#9a8aff"/>
      <stop offset="100%" stop-color="#b49bff"/>
    </linearGradient>
    <linearGradient id="primaryPressedFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2bc4db"/>
      <stop offset="55%" stop-color="#6558d4"/>
      <stop offset="100%" stop-color="#7d63d4"/>
    </linearGradient>
    <linearGradient id="secondaryFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(28,30,52,0.92)"/>
      <stop offset="100%" stop-color="rgba(12,14,28,0.95)"/>
    </linearGradient>
    <linearGradient id="secondaryHoverFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(36,40,68,0.95)"/>
      <stop offset="100%" stop-color="rgba(16,20,40,0.97)"/>
    </linearGradient>
    <linearGradient id="dangerFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff7a92"/>
      <stop offset="100%" stop-color="#e63d6a"/>
    </linearGradient>
    <linearGradient id="dangerHoverFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff9aad"/>
      <stop offset="100%" stop-color="#ff5c7a"/>
    </linearGradient>
    <linearGradient id="successFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5dffc0"/>
      <stop offset="100%" stop-color="#2ad89a"/>
    </linearGradient>
    <linearGradient id="successHoverFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7affe0"/>
      <stop offset="100%" stop-color="#3dffb0"/>
    </linearGradient>
    <linearGradient id="ghostFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(22,22,37,0.35)"/>
      <stop offset="100%" stop-color="rgba(10,10,18,0.45)"/>
    </linearGradient>
    <linearGradient id="ghostHoverFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(30,34,55,0.55)"/>
      <stop offset="100%" stop-color="rgba(14,16,28,0.65)"/>
    </linearGradient>
    <linearGradient id="amberFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd078"/>
      <stop offset="100%" stop-color="#ff9a2e"/>
    </linearGradient>
    <linearGradient id="amberHoverFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe0a0"/>
      <stop offset="100%" stop-color="#ffb84d"/>
    </linearGradient>
    <linearGradient id="iconFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(26,30,52,0.95)"/>
      <stop offset="100%" stop-color="rgba(12,14,28,0.98)"/>
    </linearGradient>
    <linearGradient id="iconHoverFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(34,40,70,0.97)"/>
      <stop offset="100%" stop-color="rgba(16,20,40,0.99)"/>
    </linearGradient>
    <filter id="softGlow" x="-40%" y="-80%" width="180%" height="260%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="topSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
      <stop offset="45%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>`;
}

function pillSvg(skin: Skin): string {
  // Tight transparent pad — outer bloom lives in CSS box-shadow so stretch stays clean.
  const pad = 4;
  const x = pad;
  const y = pad;
  const w = W - pad * 2;
  const h = H - pad * 2;
  const r = Math.min(R, h / 2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs()}
  <!-- Soft edge bloom (kept inside pad for transparent corners) -->
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}"
    fill="${skin.glow}" opacity="0.28"/>
  <!-- Body -->
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}"
    fill="${skin.fill}" stroke="${skin.stroke}" stroke-width="${skin.strokeWidth}"/>
  <!-- Top sheen -->
  <rect x="${x + 5}" y="${y + 4}" width="${w - 10}" height="${h * 0.4}" rx="${r * 0.85}" ry="${r * 0.85}"
    fill="url(#topSheen)" opacity="0.5"/>
  <!-- Bottom shade -->
  <rect x="${x + 8}" y="${y + h * 0.58}" width="${w - 16}" height="${h * 0.32}" rx="${r * 0.65}" ry="${r * 0.65}"
    fill="${skin.shade}"/>
  ${
    skin.innerGlow
      ? `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="${r - 2}" ry="${r - 2}"
    fill="none" stroke="${skin.innerGlow}" stroke-width="1.5" opacity="0.65"/>`
      : ""
  }
</svg>`;
}

function squareSvg(skin: Skin, size = 96): string {
  const pad = 12;
  const x = pad;
  const y = pad;
  const s = size - pad * 2;
  const r = 22;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${defs()}
  <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" ry="${r}"
    fill="${skin.glow}" opacity="0.5" filter="url(#softGlow)"/>
  <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" ry="${r}"
    fill="${skin.fill}" stroke="${skin.stroke}" stroke-width="${skin.strokeWidth}"/>
  <rect x="${x + 3}" y="${y + 3}" width="${s - 6}" height="${s * 0.4}" rx="${r * 0.7}" ry="${r * 0.7}"
    fill="url(#topSheen)" opacity="0.5"/>
</svg>`;
}

async function writeSkin(id: string, svg: string) {
  const pngPath = path.join(OUT, `${id}.png`);
  const webpPath = path.join(OUT, `${id}.webp`);
  const buf = Buffer.from(svg);
  await sharp(buf).png().toFile(pngPath);
  await sharp(buf).webp({ quality: 92 }).toFile(webpPath);
  writeFileSync(path.join(OUT, `${id}.svg`), svg);
  console.log(`wrote ${id}.png / .webp / .svg`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  for (const skin of skins) {
    const isIcon = skin.id.startsWith("icon");
    const svg = isIcon ? squareSvg(skin, 96) : pillSvg(skin);
    await writeSkin(skin.id, svg);
  }

  // Compact variants (same art, smaller raster for header CTAs)
  for (const id of ["primary", "secondary"] as const) {
    const src = path.join(OUT, `${id}.png`);
    await sharp(src)
      .resize(320, 64, { fit: "fill" })
      .png()
      .toFile(path.join(OUT, `${id}-sm.png`));
    await sharp(src)
      .resize(320, 64, { fit: "fill" })
      .webp({ quality: 92 })
      .toFile(path.join(OUT, `${id}-sm.webp`));
    console.log(`wrote ${id}-sm.png / .webp`);
  }

  writeFileSync(
    path.join(OUT, "README.md"),
    `# Button skins

Reusable Riftwilds UI button backgrounds — **no baked text**.

| Skin | Use |
|------|-----|
| \`primary\` / \`primary-hover\` / \`primary-pressed\` | Main CTAs (Connect Wallet, Hatch, Buy) |
| \`secondary\` / \`secondary-hover\` | Outlined / guest-style actions |
| \`danger\` / \`danger-hover\` | Destructive |
| \`success\` / \`success-hover\` | Confirm / claim |
| \`ghost\` / \`ghost-hover\` | Low-emphasis |
| \`amber\` / \`amber-hover\` | Warning / reward accents |
| \`icon\` / \`icon-hover\` | Square icon-only controls |
| \`primary-sm\` / \`secondary-sm\` | Compact header sizes |

Wire via \`.btn-primary\`, \`.btn-secondary\`, etc. in \`globals.css\` or \`ImageButton\`.
`,
  );

  console.log(`Done → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
