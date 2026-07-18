import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../public/assets/housing");
fs.mkdirSync(dir, { recursive: true });

const props = [
  "prop-starter-cabin",
  "prop-cottage",
  "prop-townhouse",
  "prop-farmstead",
  "prop-manor",
  "prop-treehouse",
  "prop-lakeside",
  "prop-cliffside",
  "prop-hideout",
  "prop-observatory",
];
const furn = [
  "furn-wall-timber",
  "furn-lantern-ember",
  "furn-bed-moss",
  "furn-anvil",
  "furn-fountain-tide",
  "furn-crystal-scope",
  "furn-riftling-bed",
  "furn-mailbox",
];

function svg(title, c1, c2) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="320" viewBox="0 0 512 320" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="320" fill="url(#g)"/>
  <rect x="48" y="96" width="220" height="160" rx="8" fill="#5c3d2e" opacity="0.9"/>
  <polygon points="48,96 158,40 268,96" fill="#8b5a3c"/>
  <rect x="120" y="160" width="48" height="96" fill="#2a2118"/>
  <rect x="190" y="140" width="40" height="40" fill="#3de7ff" opacity="0.55"/>
  <circle cx="380" cy="120" r="36" fill="#ffb84d" opacity="0.7"/>
  <rect x="300" y="180" width="160" height="76" rx="10" fill="#2f5a3a" opacity="0.85"/>
  <text x="24" y="300" fill="#e8d5b0" font-family="Georgia, serif" font-size="18">${title}</text>
</svg>
`;
}

for (const k of [...props, ...furn]) {
  const title = k.replace(/^(prop|furn)-/, "").replace(/-/g, " ");
  const c1 = k.startsWith("prop") ? "#2f5a3a" : "#3a2820";
  const c2 = k.startsWith("prop") ? "#c4a882" : "#4a8f4a";
  fs.writeFileSync(path.join(dir, `${k}.svg`), svg(title, c1, c2));
}
console.log(`wrote ${props.length + furn.length} housing thumbs`);
