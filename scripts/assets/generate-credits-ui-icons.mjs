import { mkdirSync, writeFileSync } from "fs";
import path from "path";

function svg(c1, c2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
  <defs>
    <linearGradient id="g" x1="8" y1="8" x2="56" y2="56">
      <stop stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#g)" opacity="0.92"/>
  <circle cx="32" cy="28" r="12" stroke="#f5f0e6" stroke-width="3" fill="none"/>
  <path d="M20 48c4-8 20-8 24 0" stroke="#f5f0e6" stroke-width="3" stroke-linecap="round"/>
</svg>
`;
}

const icons = {
  "public/assets/ui/map-goals/story.svg": ["#2a6f6a", "#1a3a48"],
  "public/assets/ui/map-goals/care.svg": ["#6a8f4a", "#2a4028"],
  "public/assets/ui/map-goals/job.svg": ["#b8843a", "#4a3018"],
  "public/assets/ui/map-goals/gather.svg": ["#3a8f6a", "#1a4030"],
  "public/assets/ui/map-goals/restoration.svg": ["#8a6a3a", "#3a2810"],
  "public/assets/ui/map-goals/combat.svg": ["#8a3a3a", "#401818"],
  "public/assets/ui/map-goals/explore.svg": ["#3a6a8a", "#182838"],
  "public/assets/ui/map-goals/craft.svg": ["#6a5a8a", "#282038"],
  "public/assets/ui/credits/icon.svg": ["#c9a227", "#5a4010"],
  "public/assets/ui/jobs/board.svg": ["#4a7a6a", "#203028"],
  "public/assets/ui/events/banner.svg": ["#7a4a6a", "#301828"],
};

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");

for (const [rel, [a, b]] of Object.entries(icons)) {
  const full = path.join(root, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, svg(a, b));
}
console.log(`wrote ${Object.keys(icons).length} credit/map-goal icons`);
