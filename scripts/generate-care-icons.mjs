import fs from "fs";
import path from "path";

const outDir = path.join("public", "assets", "ui", "pets", "care");
fs.mkdirSync(outDir, { recursive: true });

const icons = {
  feed: { stroke: "#e6a15c", paths: ["M14 34c0-8 4-14 10-14s10 6 10 14", "M20 18c0-3 2-6 4-6s4 3 4 6", "M18 34h12"] },
  water: { stroke: "#3de7ff", paths: ["M24 10c0 0-10 14-10 22a10 10 0 0020 0c0-8-10-22-10-22z"] },
  play: { stroke: "#f0c36a", paths: ["M16 18l16 8-16 8V18z", "M34 14l4 4-4 4"] },
  clean: { stroke: "#6bcb8a", paths: ["M12 30c6-8 18-8 24 0", "M18 22l3-8 3 8", "M24 14v6"] },
  rest: { stroke: "#94c5ff", paths: ["M12 30h24v4H12z", "M14 30v-8a6 6 0 0112 0v8", "M30 22a4 4 0 014 4v4"] },
  sleep: { stroke: "#a78bfa", paths: ["M28 14c-6 0-10 5-10 11 4-2 8-1 11 2 1-4 2-8-1-13z", "M32 12l2 2 2-2", "M36 16l1.5 1.5L39 16"] },
  heal: { stroke: "#3dffb0", paths: ["M24 12v24", "M12 24h24"] },
  medicine: { stroke: "#f07178", paths: ["M18 14h12v8l-4 16h-4l-4-16v-8z", "M20 18h8"] },
  recovery: { stroke: "#3de7ff", paths: ["M12 28c0-8 5-14 12-14s12 6 12 14", "M18 28h12", "M24 18v6"] },
  brush: { stroke: "#e6d06a", paths: ["M14 34l20-20", "M30 10l8 8", "M12 36l6-2"] },
  train: { stroke: "#e6a15c", paths: ["M16 32l8-18 8 18", "M20 26h8"] },
  walk: { stroke: "#6bcb8a", paths: ["M18 14a3 3 0 116 0 3 3 0 01-6 0", "M21 18l-2 10 4 2 2-8 4 8 4-2-3-12"] },
  pet: { stroke: "#f0a0c0", paths: ["M24 36s-12-7-12-16C12 14 17 11 21 11c2 0 3 1 3 3 1-2 3-3 5-3 4 0 7 3 7 9 0 9-12 16-12 16z"] },
  groom: { stroke: "#94c5ff", paths: ["M14 16h20", "M16 22h16", "M18 28h12", "M22 12v4"] },
  cook: { stroke: "#e6a15c", paths: ["M14 28h20l-2 8H16l-2-8z", "M18 28v-6a6 6 0 0112 0v6", "M22 14h4"] },
  treat: { stroke: "#f0c36a", paths: ["M24 12l3 7h7l-5.5 4.5 2 7L24 26l-6.5 4.5 2-7L14 19h7l3-7z"] },
  vet: { stroke: "#3dffb0", paths: ["M12 20h8v-6h8v6h8v8h-8v6h-8v-6h-8v-8z"] },
  adventure: { stroke: "#e6a15c", paths: ["M12 34l12-22 12 22H12z", "M24 18v8"] },
  exercise: { stroke: "#f07178", paths: ["M14 24h20", "M18 18v12", "M30 18v12"] },
  trick: { stroke: "#a78bfa", paths: ["M24 10v6", "M18 20h12l-2 14H20L18 20z", "M22 28h4"] },
  meditate: { stroke: "#94c5ff", paths: ["M24 14a4 4 0 110 8 4 4 0 010-8z", "M16 34c2-6 6-8 8-8s6 2 8 8"] },
  socialize: { stroke: "#f0a0c0", paths: ["M16 20a4 4 0 118 0 4 4 0 01-8 0", "M28 20a4 4 0 118 0 4 4 0 01-8 0", "M12 34c1-5 4-7 8-7s6 2 7 5"] },
  decorate: { stroke: "#e6d06a", paths: ["M12 34h24V20L24 12 12 20v14z", "M24 12v22"] },
  encourage: { stroke: "#3de7ff", paths: ["M14 18h12v10H14z", "M26 22l8-4v12l-8-4"] },
  item: { stroke: "#94c5ff", paths: ["M16 18h16v16H16z", "M20 18v-4h8v4"] },
};

for (const [name, conf] of Object.entries(icons)) {
  const paths = conf.paths
    .map(
      (d) =>
        `<path d="${d}" stroke="${conf.stroke}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" fill="${conf.stroke}22" stroke="${conf.stroke}" stroke-width="1.25" opacity="0.9"/>${paths}</svg>`;
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
}

console.log(`wrote ${Object.keys(icons).length} icons to ${outDir}`);
