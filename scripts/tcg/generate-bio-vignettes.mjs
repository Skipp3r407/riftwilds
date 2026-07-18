import fs from "node:fs";
import path from "node:path";

const out = path.join("public", "assets", "tcg", "bio");
fs.mkdirSync(out, { recursive: true });

const affinities = {
  ember: { a: "#e07030", b: "#3a1810", c: "#ffb060" },
  tide: { a: "#3aa0d8", b: "#102838", c: "#8ad4ff" },
  grove: { a: "#4a9e58", b: "#142818", c: "#a8e090" },
  storm: { a: "#7ec8ff", b: "#182438", c: "#d0ecff" },
  stone: { a: "#b89460", b: "#2a2218", c: "#e0c898" },
  frost: { a: "#9ad4e8", b: "#142430", c: "#e8f6ff" },
  radiant: { a: "#f0d060", b: "#2a2410", c: "#fff0a8" },
  void: { a: "#8a6ad8", b: "#141020", c: "#c8b0ff" },
  alloy: { a: "#a8b0b8", b: "#1c2024", c: "#e0e6ec" },
  spirit: { a: "#d080c0", b: "#241828", c: "#f0c0e8" },
  celestial: { a: "#90b8ff", b: "#101828", c: "#d8e8ff" },
};

function behaviorSvg(name, c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-label="${name} behavior">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.b}"/>
      <stop offset="100%" stop-color="#05080c"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${c.a}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${c.a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="320" height="180" fill="url(#sky)"/>
  <ellipse cx="160" cy="72" rx="110" ry="58" fill="url(#glow)"/>
  <path d="M0 128 C60 108 110 140 160 124 C210 108 250 136 320 118 L320 180 L0 180 Z" fill="${c.b}" opacity="0.9"/>
  <circle cx="118" cy="96" r="18" fill="${c.a}" opacity="0.35" stroke="${c.c}" stroke-width="2"/>
  <circle cx="168" cy="90" r="22" fill="${c.a}" opacity="0.45" stroke="${c.c}" stroke-width="2.2"/>
  <circle cx="214" cy="98" r="16" fill="${c.a}" opacity="0.32" stroke="${c.c}" stroke-width="1.8"/>
  <path d="M136 112 C148 128 178 130 196 114" fill="none" stroke="${c.c}" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
  <circle cx="48" cy="40" r="2" fill="${c.c}" opacity="0.55"/>
  <circle cx="272" cy="52" r="1.6" fill="${c.c}" opacity="0.45"/>
  <circle cx="290" cy="30" r="1.2" fill="${c.c}" opacity="0.4"/>
</svg>
`;
}

function dietSvg(name, c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" role="img" aria-label="${name} diet">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.b}"/>
      <stop offset="100%" stop-color="#070b10"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="55%" r="50%">
      <stop offset="0%" stop-color="${c.a}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${c.a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="320" height="180" fill="url(#sky)"/>
  <ellipse cx="160" cy="110" rx="120" ry="50" fill="url(#glow)"/>
  <ellipse cx="160" cy="128" rx="78" ry="18" fill="${c.a}" opacity="0.18" stroke="${c.c}" stroke-width="1.5"/>
  <path d="M112 118 C112 96 130 82 160 82 C190 82 208 96 208 118 C208 136 186 148 160 148 C134 148 112 136 112 118 Z" fill="${c.a}" opacity="0.35" stroke="${c.c}" stroke-width="2"/>
  <circle cx="148" cy="108" r="7" fill="${c.c}" opacity="0.7"/>
  <circle cx="172" cy="112" r="5.5" fill="${c.c}" opacity="0.55"/>
  <circle cx="160" cy="124" r="4.5" fill="${c.c}" opacity="0.45"/>
  <path d="M160 70 C164 58 176 54 182 62" fill="none" stroke="${c.c}" stroke-width="2" stroke-linecap="round" opacity="0.65"/>
  <path d="M96 150 C130 140 190 140 224 150" fill="none" stroke="${c.a}" stroke-width="2" opacity="0.35" stroke-linecap="round"/>
</svg>
`;
}

let count = 0;
for (const [name, c] of Object.entries(affinities)) {
  fs.writeFileSync(path.join(out, `behavior-${name}.svg`), behaviorSvg(name, c));
  fs.writeFileSync(path.join(out, `diet-${name}.svg`), dietSvg(name, c));
  count += 2;
}
console.log(`Wrote ${count} bio vignettes to ${out}`);
