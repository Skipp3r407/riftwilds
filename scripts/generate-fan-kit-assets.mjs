import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "assets", "fan-kit");
for (const d of ["frames", "stickers", "share"]) {
  fs.mkdirSync(path.join(root, d), { recursive: true });
}

function write(rel, content) {
  fs.writeFileSync(path.join(root, rel), content);
  console.log("wrote", rel);
}

write(
  "frames/amber-hearth.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <circle cx="256" cy="256" r="220" stroke="#ffb84d" stroke-width="18" opacity="0.95"/>
  <circle cx="256" cy="256" r="200" stroke="#c4883a" stroke-width="6" opacity="0.7"/>
  <circle cx="256" cy="256" r="188" stroke="#3de7ff" stroke-width="3" opacity="0.35"/>
  <path d="M256 48c18 28 22 48 0 72-22-24-18-44 0-72Z" fill="#ffb84d" opacity="0.9"/>
  <path d="M256 392c18 28 22 48 0 72-22-24-18-44 0-72Z" fill="#ffb84d" opacity="0.75"/>
  <path d="M48 256c28-18 48-22 72 0-24 22-44 18-72 0Z" fill="#ffb84d" opacity="0.75"/>
  <path d="M392 256c28-18 48-22 72 0-24 22-44 18-72 0Z" fill="#ffb84d" opacity="0.75"/>
</svg>`,
);

write(
  "frames/rift-cyan.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="g" x1="80" y1="80" x2="432" y2="432">
      <stop stop-color="#3de7ff"/><stop offset="1" stop-color="#2bb8e8"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="222" stroke="url(#g)" stroke-width="16"/>
  <circle cx="256" cy="256" r="198" stroke="#a8e7ff" stroke-width="4" opacity="0.5" stroke-dasharray="8 10"/>
  <path d="M256 70c40 50 58 90 0 140-58-50-40-90 0-140Z" fill="#3de7ff" opacity="0.55"/>
  <circle cx="256" cy="256" r="178" stroke="#ffb84d" stroke-width="2" opacity="0.35"/>
</svg>`,
);

write(
  "frames/keeper-seal.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <circle cx="256" cy="256" r="218" stroke="#c4a882" stroke-width="20"/>
  <circle cx="256" cy="256" r="196" stroke="#8b5a3c" stroke-width="8"/>
  <circle cx="256" cy="256" r="182" stroke="#e8d5b0" stroke-width="3" opacity="0.7"/>
  <path d="M256 96l18 36 40 6-29 28 7 40-36-19-36 19 7-40-29-28 40-6 18-36Z" fill="#ffb84d" opacity="0.85"/>
  <path d="M256 360l12 24 26 4-19 18 5 26-24-13-24 13 5-26-19-18 26-4 12-24Z" fill="#c4a882" opacity="0.8"/>
</svg>`,
);

write(
  "frames/commons-laurel.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <circle cx="256" cy="256" r="200" stroke="#5aad62" stroke-width="10" opacity="0.85"/>
  <path d="M120 300c20-70 50-120 90-150-10 40-8 90 10 140-40-10-70 0-100 10Z" fill="#5aad62" opacity="0.75"/>
  <path d="M392 300c-20-70-50-120-90-150 10 40 8 90-10 140 40-10 70 0 100 10Z" fill="#5aad62" opacity="0.75"/>
  <path d="M140 340c30-20 60-30 90-28-20 24-30 50-28 80-30-10-50-20-62-52Z" fill="#3dffb0" opacity="0.55"/>
  <path d="M372 340c-30-20-60-30-90-28 20 24 30 50 28 80 30-10 50-20 62-52Z" fill="#3dffb0" opacity="0.55"/>
  <circle cx="256" cy="256" r="178" stroke="#ffb84d" stroke-width="4" opacity="0.45"/>
</svg>`,
);

write(
  "stickers/spark.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <ellipse cx="128" cy="150" rx="70" ry="62" fill="#ffe566"/>
  <ellipse cx="128" cy="138" rx="54" ry="48" fill="#fff6b0"/>
  <circle cx="108" cy="132" r="8" fill="#2a2118"/>
  <circle cx="148" cy="132" r="8" fill="#2a2118"/>
  <path d="M116 152c8 10 24 10 32 0" stroke="#2a2118" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M128 48l10 28 28 6-22 20 6 28-22-14-22 14 6-28-22-20 28-6 10-28Z" fill="#ffb84d"/>
  <ellipse cx="78" cy="168" rx="16" ry="22" fill="#ffb84d" transform="rotate(-25 78 168)"/>
  <ellipse cx="178" cy="168" rx="16" ry="22" fill="#ffb84d" transform="rotate(25 178 168)"/>
</svg>`,
);

write(
  "stickers/hatch-egg.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <ellipse cx="128" cy="210" rx="70" ry="18" fill="#5aad62" opacity="0.45"/>
  <path d="M60 210c20-18 40-22 68-22s48 4 68 22c-16 8-40 14-68 14s-52-6-68-14Z" fill="#3dffb0" opacity="0.55"/>
  <ellipse cx="128" cy="128" rx="58" ry="78" fill="#e8d5b0"/>
  <ellipse cx="128" cy="128" rx="46" ry="64" fill="#f3efe6"/>
  <path d="M100 100c20-8 40 4 52 20" stroke="#3de7ff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>
  <circle cx="128" cy="140" r="10" fill="#ffb84d" opacity="0.8"/>
</svg>`,
);

write(
  "stickers/cindercub.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <ellipse cx="128" cy="150" rx="72" ry="58" fill="#ff7a3d"/>
  <ellipse cx="128" cy="145" rx="54" ry="44" fill="#ffb084"/>
  <circle cx="108" cy="138" r="7" fill="#2a2118"/>
  <circle cx="148" cy="138" r="7" fill="#2a2118"/>
  <ellipse cx="128" cy="158" rx="10" ry="7" fill="#ff5c7a" opacity="0.7"/>
  <path d="M86 108c-8-22-4-40 10-48 2 16 8 28 18 36-14 0-24 4-28 12Z" fill="#ffb84d"/>
  <path d="M170 108c8-22 4-40-10-48-2 16-8 28-18 36 14 0 24 4 30 12Z" fill="#ffb84d"/>
  <path d="M128 70l8 20 20 4-16 14 4 20-16-10-16 10 4-20-16-14 20-4 8-20Z" fill="#ffe566"/>
</svg>`,
);

write(
  "stickers/mossprig.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <ellipse cx="128" cy="160" rx="60" ry="50" fill="#5aad62"/>
  <ellipse cx="128" cy="155" rx="44" ry="38" fill="#8fd49a"/>
  <circle cx="112" cy="150" r="6" fill="#2a2118"/>
  <circle cx="144" cy="150" r="6" fill="#2a2118"/>
  <path d="M118 168c6 8 14 8 20 0" stroke="#2a2118" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M128 60c20 30 10 50-8 70 30-8 48-30 40-62-10 8-20 8-32-8Z" fill="#3dffb0"/>
  <path d="M98 90c-10 24 0 40 18 50-22 4-40-10-40-34 8 2 14 0 22-16Z" fill="#5aad62"/>
  <path d="M158 90c10 24 0 40-18 50 22 4 40-10 40-34-8 2-14 0-22-16Z" fill="#5aad62"/>
</svg>`,
);

write(
  "stickers/bubbloon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="130" r="70" fill="#3d9bff" opacity="0.85"/>
  <circle cx="128" cy="130" r="54" fill="#7ec8ff"/>
  <circle cx="108" cy="118" r="10" fill="#fff" opacity="0.55"/>
  <circle cx="112" cy="140" r="6" fill="#2a2118"/>
  <circle cx="144" cy="140" r="6" fill="#2a2118"/>
  <path d="M116 158c8 10 20 10 28 0" stroke="#2a2118" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="70" cy="90" r="16" fill="#a8e7ff" opacity="0.7"/>
  <circle cx="190" cy="100" r="12" fill="#a8e7ff" opacity="0.6"/>
  <circle cx="175" cy="190" r="10" fill="#3de7ff" opacity="0.5"/>
</svg>`,
);

write(
  "stickers/commons-crest.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect x="48" y="48" width="160" height="160" rx="28" fill="#1a1814" stroke="#c4a882" stroke-width="8"/>
  <circle cx="128" cy="120" r="36" fill="none" stroke="#3de7ff" stroke-width="6"/>
  <path d="M88 170h80" stroke="#ffb84d" stroke-width="8" stroke-linecap="round"/>
  <path d="M100 70l28 20 28-20" stroke="#e8d5b0" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="128" cy="120" r="10" fill="#ffb84d"/>
</svg>`,
);

write(
  "stickers/keeper-badge.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <path d="M128 36l28 20 34-6 12 32 30 18-12 34 12 34-30 18-12 32-34-6-28 20-28-20-34 6-12-32-30-18 12-34-12-34 30-18 12-32 34 6 28-20Z" fill="#c4a882"/>
  <circle cx="128" cy="128" r="52" fill="#1a1814"/>
  <ellipse cx="128" cy="120" rx="22" ry="28" fill="#e8d5b0"/>
  <path d="M96 170c16-18 48-18 64 0" fill="#3de7ff" opacity="0.7"/>
  <path d="M128 78l6 14 14 2-10 10 2 14-12-8-12 8 2-14-10-10 14-2 6-14Z" fill="#ffb84d"/>
</svg>`,
);

write(
  "stickers/care-heart.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <path d="M128 214s-72-44-92-90c-14-32 6-62 36-62 22 0 40 14 56 34 16-20 34-34 56-34 30 0 50 30 36 62-20 46-92 90-92 90Z" fill="#ff6b6b"/>
  <path d="M128 198s-56-34-72-70c-10-24 6-46 28-46 16 0 30 12 44 28 14-16 28-28 44-28 22 0 38 22 28 46-16 36-72 70-72 70Z" fill="#ff9a9a"/>
  <circle cx="100" cy="110" r="10" fill="#fff" opacity="0.45"/>
</svg>`,
);

function shareCard(title, subtitle, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630">
      <stop stop-color="#1a1510"/>
      <stop offset="0.45" stop-color="#0f1826"/>
      <stop offset="1" stop-color="#12161c"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="20%" r="55%">
      <stop stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="48" y="48" width="1104" height="534" rx="28" fill="none" stroke="#c4a882" stroke-opacity="0.35" stroke-width="3"/>
  <text x="96" y="140" fill="#ffb84d" font-family="Georgia, serif" font-size="28" letter-spacing="6">RIFTWILDS</text>
  <text x="96" y="260" fill="#f3efe6" font-family="Georgia, serif" font-size="64" font-weight="700">${title}</text>
  <text x="96" y="340" fill="#a89b86" font-family="Georgia, serif" font-size="30">${subtitle}</text>
  <rect x="96" y="420" width="220" height="56" rx="14" fill="${accent}"/>
  <text x="206" y="456" text-anchor="middle" fill="#0c0e12" font-family="Georgia, serif" font-size="22" font-weight="700">Share the story</text>
  <circle cx="980" cy="320" r="120" fill="${accent}" opacity="0.2"/>
  <circle cx="980" cy="320" r="80" fill="none" stroke="${accent}" stroke-width="6"/>
  <ellipse cx="980" cy="320" rx="36" ry="48" fill="#e8d5b0" opacity="0.9"/>
</svg>`;
}

write("share/moment-hatch.svg", shareCard("I hatched a Riftling", "Free egg · Care · Explore", "#3de7ff"));
write("share/moment-comics.svg", shareCard("Legends of the Rift", "Official comic series", "#ffb84d"));
write("share/moment-commons.svg", shareCard("Visit the Commons", "Live World plaza awaits", "#3dffb0"));
write("share/moment-coloring.svg", shareCard("Kids coloring pack", "Print · Color · Share", "#ff6b6b"));
write("share/moment-keeper.svg", shareCard("Become a Keeper", "Story first · Crypto optional", "#c4a882"));
write("share/moment-listen.svg", shareCard("Listen to the Rift", "Soundtrack ambience teasers", "#3d9bff"));

console.log("fan-kit assets ready");
