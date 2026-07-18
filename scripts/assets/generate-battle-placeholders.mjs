import fs from "fs";
import path from "path";

const root = process.cwd();
const arenasDir = path.join(root, "public/assets/battle/arenas");
const uiDir = path.join(root, "public/assets/battle/ui");
const fxDir = path.join(root, "public/assets/battle/fx");
const elDir = path.join(root, "public/assets/battle/elements");
for (const d of [arenasDir, uiDir, fxDir, elDir]) fs.mkdirSync(d, { recursive: true });

const arenas = [
  ["commons-yard", "#2a3344", "#6b8cae", "Commons Yard"],
  ["ember-crucible", "#3a1810", "#e07030", "Ember Crucible"],
  ["tide-basin", "#0e2438", "#3aa0c8", "Moonwater Basin"],
  ["grove-hollow", "#142818", "#5aaa58", "Sproutfall Hollow"],
  ["storm-spire", "#1a2038", "#7a90e0", "Storm Spire"],
  ["stone-plateau", "#2c2820", "#a09070", "Stone Plateau"],
  ["frost-shelf", "#1a2838", "#90c8e8", "Frost Shelf"],
  ["radiant-dais", "#2a2410", "#e8c060", "Radiant Dais"],
  ["void-rift", "#120818", "#7040a0", "Void Rift"],
  ["alloy-grid", "#1c2228", "#8aa0b0", "Alloy Grid"],
  ["spirit-circle", "#181828", "#a080d0", "Spirit Circle"],
];

for (const [id, c1, c2, title] of arenas) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="70%" r="55%">
      <stop offset="0%" stop-color="${c2}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <ellipse cx="640" cy="520" rx="420" ry="90" fill="url(#r)"/>
  <rect x="220" y="480" width="840" height="24" rx="8" fill="${c2}" opacity="0.35"/>
  <text x="640" y="80" text-anchor="middle" fill="white" font-family="Georgia, serif" font-size="42" opacity="0.85">${title}</text>
  <text x="640" y="120" text-anchor="middle" fill="${c2}" font-family="sans-serif" font-size="18" opacity="0.7">Riftwilds Arena</text>
</svg>`;
  fs.writeFileSync(path.join(arenasDir, `${id}.svg`), svg);
}

const colors = {
  EMBER: "#e07030",
  TIDE: "#3aa0c8",
  GROVE: "#5aaa58",
  STORM: "#7a90e0",
  STONE: "#a09070",
  FROST: "#90c8e8",
  RADIANT: "#e8c060",
  VOID: "#7040a0",
  ALLOY: "#8aa0b0",
  SPIRIT: "#a080d0",
};
for (const [el, c] of Object.entries(colors)) {
  fs.writeFileSync(
    path.join(elDir, `${el.toLowerCase()}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="54" fill="${c}" opacity="0.25" stroke="${c}" stroke-width="4"/><text x="64" y="72" text-anchor="middle" fill="${c}" font-family="Georgia,serif" font-size="18">${el.slice(0, 3)}</text></svg>`,
  );
}

fs.writeFileSync(
  path.join(uiDir, "victory-banner.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320"><defs><linearGradient id="v" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a4030"/><stop offset="100%" stop-color="#3ecf8e"/></linearGradient></defs><rect width="1280" height="320" fill="url(#v)"/><text x="640" y="175" text-anchor="middle" fill="white" font-family="Georgia,serif" font-size="72">Victory</text></svg>`,
);
fs.writeFileSync(
  path.join(uiDir, "defeat-banner.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320"><defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a1820"/><stop offset="100%" stop-color="#8a4058"/></linearGradient></defs><rect width="1280" height="320" fill="url(#d)"/><text x="640" y="175" text-anchor="middle" fill="white" font-family="Georgia,serif" font-size="72">Retreat</text></svg>`,
);
fs.writeFileSync(
  path.join(fxDir, "rift-burst.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><circle cx="128" cy="128" r="40" fill="#f0b040"/><circle cx="128" cy="128" r="70" fill="none" stroke="#f0b040" stroke-width="6" opacity="0.6"/><circle cx="128" cy="128" r="100" fill="none" stroke="#80e0ff" stroke-width="3" opacity="0.4"/></svg>`,
);

console.log("Battle placeholder assets written.");
