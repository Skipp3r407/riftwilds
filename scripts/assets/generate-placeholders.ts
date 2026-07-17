/**
 * Generates clean SVG placeholders with distinct affinity shapes.
 * Dev-only labels — never ship placeholder text in production UI without the DEV badge.
 */
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "../../public/assets/placeholders");

const affinities: Record<string, { fill: string; shape: string }> = {
  ember: { fill: "#ff7a3d", shape: "flame" },
  tide: { fill: "#3d9bff", shape: "drop" },
  grove: { fill: "#4adf7a", shape: "leaf" },
  storm: { fill: "#b8d4ff", shape: "bolt" },
  stone: { fill: "#c4a882", shape: "hex" },
  frost: { fill: "#a8e7ff", shape: "crystal" },
  radiant: { fill: "#ffe566", shape: "sun" },
  void: { fill: "#7a5cff", shape: "ring" },
  alloy: { fill: "#d0d6e0", shape: "gear" },
  spirit: { fill: "#ff9ad5", shape: "wisp" },
};

const speciesAffinity: Record<string, string> = {
  cindercub: "ember",
  mossprig: "grove",
  bubbloon: "tide",
  voltkit: "storm",
  pebblit: "stone",
  wisplet: "spirit",
  frostuft: "frost",
  alloyfin: "alloy",
  sunmote: "radiant",
  noxling: "void",
  brambleback: "grove",
  zephyroo: "storm",
  glimmermoth: "spirit",
  magmole: "ember",
  tiderune: "tide",
  gearling: "alloy",
  bloomble: "grove",
  astralynx: "void",
};

function shapePath(kind: string, cx: number, cy: number, r: number): string {
  switch (kind) {
    case "flame":
      return `M ${cx} ${cy + r} Q ${cx - r} ${cy} ${cx - r * 0.3} ${cy - r} Q ${cx} ${cy - r * 0.2} ${cx + r * 0.35} ${cy - r} Q ${cx + r} ${cy} ${cx} ${cy + r} Z`;
    case "drop":
      return `M ${cx} ${cy - r} Q ${cx + r} ${cy} ${cx} ${cy + r} Q ${cx - r} ${cy} ${cx} ${cy - r} Z`;
    case "leaf":
      return `M ${cx} ${cy + r} Q ${cx - r} ${cy} ${cx} ${cy - r} Q ${cx + r} ${cy} ${cx} ${cy + r} Z`;
    case "bolt":
      return `M ${cx - r * 0.2} ${cy - r} L ${cx + r * 0.4} ${cy - r * 0.1} L ${cx} ${cy - r * 0.1} L ${cx + r * 0.3} ${cy + r} L ${cx - r * 0.45} ${cy + r * 0.05} L ${cx - r * 0.05} ${cy + r * 0.05} Z`;
    case "hex":
      return polygon(cx, cy, r, 6);
    case "crystal":
      return `M ${cx} ${cy - r} L ${cx + r * 0.7} ${cy} L ${cx} ${cy + r} L ${cx - r * 0.7} ${cy} Z`;
    case "sun":
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    case "ring":
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    case "gear":
      return polygon(cx, cy, r, 8);
    case "wisp":
      return `M ${cx} ${cy - r * 0.6} Q ${cx + r} ${cy} ${cx} ${cy + r} Q ${cx - r} ${cy} ${cx} ${cy - r * 0.6} Z`;
    default:
      return `M ${cx - r} ${cy - r} H ${cx + r} V ${cy + r} H ${cx - r} Z`;
  }
}

function polygon(cx: number, cy: number, r: number, sides: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function svg(opts: {
  size: number;
  label: string;
  fill: string;
  shape: string;
  showLabel: boolean;
}): string {
  const { size, label, fill, shape, showLabel } = opts;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28;
  const pathD = shapePath(shape, cx, cy, r);
  const labelEl = showLabel
    ? `<text x="${cx}" y="${size - size * 0.08}" text-anchor="middle" fill="#9bb0d0" font-family="ui-monospace,monospace" font-size="${Math.max(10, size * 0.045)}">${label}</text>
       <text x="${cx}" y="${size * 0.1}" text-anchor="middle" fill="#ffb84d" font-family="ui-monospace,monospace" font-size="${Math.max(9, size * 0.04)}">DEV PLACEHOLDER</text>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="none"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 1.35}" fill="#121c34" stroke="#3de7ff" stroke-width="${size * 0.01}" opacity="0.85"/>
  <path d="${pathD}" fill="${fill}" opacity="0.95"/>
  ${labelEl}
</svg>
`;
}

mkdirSync(root, { recursive: true });

for (const [slug, affinity] of Object.entries(speciesAffinity)) {
  const meta = affinities[affinity]!;
  for (const [suffix, size] of [
    ["profile", 512],
    ["card", 512],
    ["icon", 256],
    ["silhouette", 512],
    ["battle", 512],
  ] as const) {
    const file = path.join(root, `creature-${slug}-${suffix}.svg`);
    const isSilhouette = suffix === "silhouette";
    writeFileSync(
      file,
      svg({
        size,
        label: `${slug}/${suffix}`,
        fill: isSilhouette ? "#0a0f1c" : meta.fill,
        shape: meta.shape,
        showLabel: !isSilhouette,
      }),
    );
  }
}

for (const [name, meta] of Object.entries(affinities)) {
  writeFileSync(
    path.join(root, `affinity-${name}.svg`),
    svg({ size: 512, label: name, fill: meta.fill, shape: meta.shape, showLabel: true }),
  );
}

const eggs = [
  "wild",
  "ember",
  "tide",
  "grove",
  "storm",
  "stone",
  "frost",
  "radiant",
  "void",
  "alloy",
  "spirit",
  "ancient",
  "celestial",
  "event",
];

for (const egg of eggs) {
  const fill = affinities[egg as keyof typeof affinities]?.fill ?? "#f4efe6";
  const shape = affinities[egg as keyof typeof affinities]?.shape ?? "drop";
  writeFileSync(
    path.join(root, `egg-${egg}.svg`),
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <ellipse cx="256" cy="280" rx="110" ry="150" fill="${fill}" stroke="#1a2744" stroke-width="8"/>
  <ellipse cx="220" cy="220" rx="28" ry="18" fill="#ffffff" opacity="0.35"/>
  <text x="256" y="480" text-anchor="middle" fill="#9bb0d0" font-family="ui-monospace,monospace" font-size="18">DEV egg-${egg}</text>
  <text x="256" y="36" text-anchor="middle" fill="#ffb84d" font-family="ui-monospace,monospace" font-size="16">DEV PLACEHOLDER</text>
</svg>
`,
  );
  void shape;
}

console.log(`Placeholders written to ${root}`);
