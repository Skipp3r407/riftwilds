/**
 * Enhanced OG-style shareable moment cards (1200×630).
 * Writes to public/assets/fan-kit/share/og/ — separate from legacy share/*.svg
 * so regenerating fan-kit frames/stickers won't clobber these.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "assets", "fan-kit", "share", "og");
fs.mkdirSync(outDir, { recursive: true });

function write(name, content) {
  fs.writeFileSync(path.join(outDir, name), content);
  console.log("wrote", name);
}

function chrome({ id, accent, title, subtitle, hook, scene }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Riftwilds — ${title}">
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1510"/>
      <stop offset="42%" stop-color="#0c141f"/>
      <stop offset="100%" stop-color="#12161c"/>
    </linearGradient>
    <radialGradient id="${id}-bloomL" cx="18%" cy="22%" r="48%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-bloomR" cx="82%" cy="38%" r="42%">
      <stop offset="0%" stop-color="#ffb84d" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffb84d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0c10" stop-opacity="0"/>
      <stop offset="55%" stop-color="#0a0c10" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0a0c10" stop-opacity="0.88"/>
    </linearGradient>
    <linearGradient id="${id}-btn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.82"/>
    </linearGradient>
    <filter id="${id}-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>

  <!-- Atmosphere -->
  <rect width="1200" height="630" fill="url(#${id}-sky)"/>
  <rect width="1200" height="630" fill="url(#${id}-bloomL)"/>
  <rect width="1200" height="630" fill="url(#${id}-bloomR)"/>
  <circle cx="980" cy="120" r="3" fill="#f3efe6" opacity="0.55"/>
  <circle cx="1040" cy="90" r="2" fill="#f3efe6" opacity="0.4"/>
  <circle cx="860" cy="70" r="2.5" fill="#3de7ff" opacity="0.45"/>
  <circle cx="720" cy="110" r="1.8" fill="#f3efe6" opacity="0.35"/>
  <circle cx="1120" cy="200" r="2" fill="#ffb84d" opacity="0.4"/>

  <!-- Scene art (right half) -->
  <g transform="translate(620,40)">${scene}</g>

  <!-- Left readability veil -->
  <rect x="0" y="0" width="620" height="630" fill="url(#${id}-bar)" opacity="0.35"/>
  <path d="M0 0 H560 Q640 0 640 80 V550 Q640 630 560 630 H0 Z" fill="#0a0c10" opacity="0.42"/>

  <!-- Frame -->
  <rect x="28" y="28" width="1144" height="574" rx="22" fill="none" stroke="#c4a882" stroke-opacity="0.38" stroke-width="2.5"/>
  <rect x="40" y="40" width="1120" height="550" rx="16" fill="none" stroke="${accent}" stroke-opacity="0.18" stroke-width="1.5"/>

  <!-- Brand egg mark -->
  <g transform="translate(72,72)">
    <ellipse cx="22" cy="28" rx="18" ry="24" fill="#1a2030" stroke="#c9a15a" stroke-width="2"/>
    <ellipse cx="22" cy="28" rx="10" ry="14" fill="#3de7ff" opacity="0.55"/>
    <circle cx="22" cy="30" r="5" fill="#ffb84d"/>
  </g>
  <text x="118" y="108" fill="#ffb84d" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="7" font-weight="700">RIFTWILDS</text>
  <text x="118" y="132" fill="#a89b86" font-family="Georgia, 'Times New Roman', serif" font-size="14" letter-spacing="3">SHAREABLE MOMENT</text>

  <!-- Copy -->
  <text x="72" y="280" fill="#f3efe6" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="700">${title}</text>
  <text x="72" y="340" fill="#c4b8a4" font-family="Georgia, 'Times New Roman', serif" font-size="26">${subtitle}</text>

  <!-- CTA chip -->
  <rect x="72" y="420" width="${Math.max(168, hook.length * 12 + 48)}" height="52" rx="12" fill="url(#${id}-btn)"/>
  <text x="${72 + Math.max(168, hook.length * 12 + 48) / 2}" y="454" text-anchor="middle" fill="#0c0e12" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700">${hook}</text>

  <text x="72" y="540" fill="#7a7268" font-family="Georgia, 'Times New Roman', serif" font-size="15">riftwilds.com · Free for Keepers, kids &amp; streamers</text>
</svg>`;
}

/* ── Distinct scenes (local coords ~560×550) ── */

const sceneHatch = `
  <ellipse cx="280" cy="480" rx="200" ry="36" fill="#1a2a1a" opacity="0.55"/>
  <path d="M80 470c40-50 90-70 160-70s130 30 170 80c-40 20-100 36-170 36s-120-18-160-46Z" fill="#3dffb0" opacity="0.28"/>
  <path d="M120 450c30-28 60-36 100-36s70 10 100 36c-24 14-60 22-100 22s-76-8-100-22Z" fill="#5aad62" opacity="0.55"/>
  <!-- cracked egg -->
  <ellipse cx="280" cy="300" rx="110" ry="148" fill="#e8d5b0"/>
  <ellipse cx="280" cy="300" rx="88" ry="120" fill="#f3efe6"/>
  <path d="M210 240c40-18 80 8 100 40" stroke="#3de7ff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.75"/>
  <circle cx="280" cy="320" r="22" fill="#ffb84d"/>
  <circle cx="280" cy="320" r="10" fill="#fff6d0" opacity="0.8"/>
  <!-- crack lines -->
  <path d="M280 160 L268 210 L292 230 L270 270" stroke="#1a1510" stroke-width="4" fill="none" opacity="0.35"/>
  <path d="M320 190 L350 230 L330 250" stroke="#1a1510" stroke-width="3.5" fill="none" opacity="0.3"/>
  <!-- cyan rift bloom -->
  <ellipse cx="280" cy="200" rx="70" ry="40" fill="#3de7ff" opacity="0.25" filter="url(#hatch-soft)"/>
  <!-- tiny Spark peek -->
  <g transform="translate(360,180)">
    <ellipse cx="0" cy="20" rx="36" ry="32" fill="#ffe566"/>
    <circle cx="-10" cy="14" r="5" fill="#2a2118"/>
    <circle cx="10" cy="14" r="5" fill="#2a2118"/>
    <path d="M-8 28c6 7 16 7 22 0" stroke="#2a2118" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M0 -28l6 16 16 3-12 12 3 16-13-8-13 8 3-16-12-12 16-3 6-16Z" fill="#ffb84d"/>
  </g>
  <!-- hatch rings -->
  <circle cx="280" cy="300" r="170" fill="none" stroke="#3de7ff" stroke-width="3" opacity="0.28"/>
  <circle cx="280" cy="300" r="200" fill="none" stroke="#ffb84d" stroke-width="2" opacity="0.2" stroke-dasharray="10 14"/>
`;

const sceneComics = `
  <!-- stacked comic pages -->
  <g transform="rotate(-8 280 300)">
    <rect x="140" y="120" width="280" height="380" rx="10" fill="#2a2118" stroke="#c4a882" stroke-width="4"/>
    <rect x="156" y="136" width="248" height="300" rx="6" fill="#0f1826"/>
    <rect x="170" y="156" width="100" height="70" rx="4" fill="#ffb84d" opacity="0.55"/>
    <rect x="284" y="156" width="100" height="70" rx="4" fill="#3de7ff" opacity="0.4"/>
    <rect x="170" y="240" width="214" height="90" rx="4" fill="#c4a882" opacity="0.25"/>
    <rect x="170" y="346" width="140" height="60" rx="4" fill="#ff6b6b" opacity="0.35"/>
    <rect x="324" y="346" width="60" height="60" rx="4" fill="#3dffb0" opacity="0.3"/>
    <text x="280" y="470" text-anchor="middle" fill="#ffb84d" font-family="Georgia, serif" font-size="18" letter-spacing="2">LEGENDS</text>
  </g>
  <g transform="rotate(6 320 280)">
    <rect x="200" y="80" width="260" height="360" rx="10" fill="#1a1510" stroke="#ffb84d" stroke-width="3" opacity="0.95"/>
    <rect x="216" y="96" width="228" height="280" rx="6" fill="#12161c"/>
    <path d="M240 140h180 M240 180h140 M240 220h160" stroke="#a89b86" stroke-width="4" opacity="0.45"/>
    <circle cx="330" cy="310" r="48" fill="none" stroke="#3de7ff" stroke-width="5" opacity="0.5"/>
    <ellipse cx="330" cy="310" rx="18" ry="24" fill="#e8d5b0"/>
  </g>
  <!-- amber star burst -->
  <path d="M460 100l10 28 28 6-22 20 6 28-22-14-22 14 6-28-22-20 28-6 10-28Z" fill="#ffb84d" opacity="0.85"/>
`;

const sceneCommons = `
  <!-- plaza ground -->
  <ellipse cx="280" cy="500" rx="240" ry="40" fill="#1a2a22" opacity="0.6"/>
  <path d="M40 460 Q280 400 520 460 L520 520 L40 520 Z" fill="#3dffb0" opacity="0.12"/>
  <!-- gateway arch -->
  <path d="M120 480 V220 Q120 100 280 90 Q440 100 440 220 V480" fill="none" stroke="#c4a882" stroke-width="18"/>
  <path d="M150 480 V230 Q150 130 280 122 Q410 130 410 230 V480" fill="none" stroke="#5aad62" stroke-width="8" opacity="0.7"/>
  <!-- cyan rift portal -->
  <ellipse cx="280" cy="280" rx="90" ry="140" fill="#3de7ff" opacity="0.18"/>
  <ellipse cx="280" cy="280" rx="60" ry="100" fill="#3de7ff" opacity="0.22"/>
  <circle cx="280" cy="280" r="28" fill="#ffb84d" opacity="0.55"/>
  <!-- laurel leaves -->
  <path d="M90 300c30-80 70-130 120-160-20 50-18 110 8 170-40-8-80 0-128-10Z" fill="#5aad62" opacity="0.75"/>
  <path d="M470 300c-30-80-70-130-120-160 20 50 18 110-8 170 40-8 80 0 128-10Z" fill="#5aad62" opacity="0.75"/>
  <path d="M100 380c40-30 80-40 120-30-30 28-40 60-36 100-40-12-70-30-84-70Z" fill="#3dffb0" opacity="0.45"/>
  <path d="M460 380c-40-30-80-40-120-30 30 28 40 60 36 100 40-12 70-30 84-70Z" fill="#3dffb0" opacity="0.45"/>
  <!-- tiny figures -->
  <circle cx="200" cy="460" r="10" fill="#e8d5b0"/>
  <rect x="194" y="470" width="12" height="22" rx="3" fill="#3de7ff" opacity="0.7"/>
  <circle cx="360" cy="455" r="10" fill="#e8d5b0"/>
  <rect x="354" y="465" width="12" height="24" rx="3" fill="#ffb84d" opacity="0.7"/>
`;

const sceneColoring = `
  <!-- paper sheet -->
  <rect x="100" y="80" width="340" height="420" rx="12" fill="#f3efe6" stroke="#c4a882" stroke-width="4"/>
  <rect x="120" y="100" width="300" height="360" rx="6" fill="#fffdf8"/>
  <!-- line-art Spark -->
  <g transform="translate(270,260)" fill="none" stroke="#2a2118" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="0" cy="20" rx="70" ry="60"/>
    <circle cx="-22" cy="8" r="8"/>
    <circle cx="22" cy="8" r="8"/>
    <path d="M-18 36c12 14 36 14 48 0"/>
    <path d="M0 -70l12 32 34 6-26 24 8 34-28-18-28 18 8-34-26-24 34-6 12-32Z"/>
    <ellipse cx="-58" cy="40" rx="16" ry="22" transform="rotate(-25 -58 40)"/>
    <ellipse cx="58" cy="40" rx="16" ry="22" transform="rotate(25 58 40)"/>
  </g>
  <!-- crayons -->
  <g transform="translate(420,140) rotate(28)">
    <rect x="0" y="0" width="22" height="160" rx="6" fill="#ff6b6b"/>
    <polygon points="0,0 22,0 11,-28" fill="#ff9a9a"/>
  </g>
  <g transform="translate(460,180) rotate(18)">
    <rect x="0" y="0" width="22" height="150" rx="6" fill="#3de7ff"/>
    <polygon points="0,0 22,0 11,-28" fill="#a8e7ff"/>
  </g>
  <g transform="translate(500,220) rotate(8)">
    <rect x="0" y="0" width="22" height="140" rx="6" fill="#ffb84d"/>
    <polygon points="0,0 22,0 11,-28" fill="#ffe566"/>
  </g>
  <!-- color dabs -->
  <circle cx="150" cy="420" r="16" fill="#ff6b6b" opacity="0.7"/>
  <circle cx="190" cy="440" r="12" fill="#3dffb0" opacity="0.7"/>
  <circle cx="170" cy="460" r="10" fill="#3de7ff" opacity="0.7"/>
`;

const scenePrintables = `
  <!-- stacked print sheets -->
  <g transform="translate(40,60) rotate(-4)">
    <rect x="40" y="40" width="300" height="400" rx="8" fill="#2a2118" opacity="0.4"/>
  </g>
  <g transform="translate(60,40) rotate(2)">
    <rect x="40" y="40" width="300" height="400" rx="8" fill="#c4a882" opacity="0.35"/>
  </g>
  <g transform="translate(80,20)">
    <rect x="40" y="40" width="300" height="400" rx="8" fill="#f3efe6" stroke="#c4a882" stroke-width="4"/>
    <rect x="60" y="60" width="260" height="200" rx="6" fill="#0f1826"/>
    <!-- mini poster art -->
    <circle cx="190" cy="140" r="48" fill="none" stroke="#3de7ff" stroke-width="5"/>
    <ellipse cx="190" cy="140" rx="20" ry="28" fill="#e8d5b0"/>
    <text x="190" y="220" text-anchor="middle" fill="#ffb84d" font-family="Georgia, serif" font-size="16" letter-spacing="2">300 DPI</text>
    <!-- sticker row -->
    <circle cx="100" cy="300" r="28" fill="#ffe566" stroke="#2a2118" stroke-width="2"/>
    <circle cx="170" cy="300" r="28" fill="#ff7a3d" stroke="#2a2118" stroke-width="2"/>
    <circle cx="240" cy="300" r="28" fill="#5aad62" stroke="#2a2118" stroke-width="2"/>
    <circle cx="310" cy="300" r="28" fill="#3d9bff" stroke="#2a2118" stroke-width="2"/>
    <!-- bookmark -->
    <rect x="90" y="360" width="200" height="48" rx="4" fill="#1a1510" stroke="#ffb84d" stroke-width="2"/>
    <text x="190" y="392" text-anchor="middle" fill="#c4a882" font-family="Georgia, serif" font-size="14">PRINT PACK</text>
  </g>
  <!-- printer dots -->
  <circle cx="460" cy="100" r="6" fill="#ff6b6b"/>
  <circle cx="480" cy="100" r="6" fill="#ffb84d"/>
  <circle cx="500" cy="100" r="6" fill="#3dffb0"/>
`;

const sceneKeeper = `
  <!-- parchment seal -->
  <ellipse cx="280" cy="300" rx="180" ry="180" fill="#c4a882" opacity="0.25"/>
  <circle cx="280" cy="300" r="150" fill="none" stroke="#c4a882" stroke-width="14"/>
  <circle cx="280" cy="300" r="128" fill="none" stroke="#8b5a3c" stroke-width="6"/>
  <circle cx="280" cy="300" r="112" fill="#1a1814" stroke="#e8d5b0" stroke-width="3"/>
  <!-- egg crest -->
  <ellipse cx="280" cy="280" rx="42" ry="56" fill="#e8d5b0"/>
  <ellipse cx="280" cy="280" rx="28" ry="38" fill="#f3efe6"/>
  <path d="M255 255c18-8 36 4 48 22" stroke="#3de7ff" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="280" cy="295" r="10" fill="#ffb84d"/>
  <!-- star -->
  <path d="M280 180l10 24 26 4-20 18 6 26-22-12-22 12 6-26-20-18 26-4 10-24Z" fill="#ffb84d"/>
  <!-- cape / cloak hint -->
  <path d="M200 360c30-40 80-50 160-50s130 10 160 50c-20 50-80 90-160 90s-140-40-160-90Z" fill="#3de7ff" opacity="0.2"/>
  <path d="M220 370c24-28 60-36 120-36s96 8 120 36c-16 36-60 64-120 64s-104-28-120-64Z" fill="#c4a882" opacity="0.35"/>
  <text x="280" y="480" text-anchor="middle" fill="#ffb84d" font-family="Georgia, serif" font-size="18" letter-spacing="4">KEEPER</text>
`;

const sceneListen = `
  <!-- vinyl / rift disc -->
  <circle cx="280" cy="300" r="190" fill="#0a1020" stroke="#3d9bff" stroke-width="6"/>
  <circle cx="280" cy="300" r="160" fill="none" stroke="#3de7ff" stroke-width="2" opacity="0.35"/>
  <circle cx="280" cy="300" r="130" fill="none" stroke="#3d9bff" stroke-width="2" opacity="0.4"/>
  <circle cx="280" cy="300" r="100" fill="none" stroke="#a8e7ff" stroke-width="2" opacity="0.3"/>
  <circle cx="280" cy="300" r="48" fill="#1a1510" stroke="#ffb84d" stroke-width="4"/>
  <circle cx="280" cy="300" r="16" fill="#3de7ff"/>
  <!-- sound waves -->
  <path d="M480 200 Q560 300 480 400" fill="none" stroke="#3d9bff" stroke-width="6" opacity="0.55" stroke-linecap="round"/>
  <path d="M510 160 Q620 300 510 440" fill="none" stroke="#3de7ff" stroke-width="5" opacity="0.4" stroke-linecap="round"/>
  <path d="M540 120 Q680 300 540 480" fill="none" stroke="#a8e7ff" stroke-width="4" opacity="0.28" stroke-linecap="round"/>
  <!-- left waves -->
  <path d="M80 200 Q0 300 80 400" fill="none" stroke="#3d9bff" stroke-width="5" opacity="0.35" stroke-linecap="round"/>
  <path d="M50 160 Q-60 300 50 440" fill="none" stroke="#3de7ff" stroke-width="4" opacity="0.25" stroke-linecap="round"/>
  <!-- note accents -->
  <g transform="translate(420,120)" fill="#ffb84d">
    <ellipse cx="0" cy="28" rx="14" ry="10"/>
    <rect x="10" y="-20" width="5" height="48" rx="2"/>
    <path d="M15 -20c20 0 28 12 28 24" fill="none" stroke="#ffb84d" stroke-width="4"/>
  </g>
  <g transform="translate(100,140)" fill="#3de7ff" opacity="0.85">
    <ellipse cx="0" cy="22" rx="12" ry="8"/>
    <rect x="8" y="-16" width="4" height="40" rx="2"/>
  </g>
`;

const cards = [
  {
    file: "moment-hatch.svg",
    id: "hatch",
    accent: "#3de7ff",
    title: "I hatched a Riftling",
    subtitle: "Free egg · Care · Explore the Rift",
    hook: "Hatch free",
    scene: sceneHatch,
  },
  {
    file: "moment-comics.svg",
    id: "comics",
    accent: "#ffb84d",
    title: "Legends of the Rift",
    subtitle: "Official comic series · cozy lore",
    hook: "Read comics",
    scene: sceneComics,
  },
  {
    file: "moment-commons.svg",
    id: "commons",
    accent: "#3dffb0",
    title: "Visit the Commons",
    subtitle: "Live World plaza · NPCs · friends",
    hook: "Enter Live World",
    scene: sceneCommons,
  },
  {
    file: "moment-coloring.svg",
    id: "coloring",
    accent: "#ff6b6b",
    title: "Kids coloring pack",
    subtitle: "28 printable pages · free for families",
    hook: "Color &amp; print",
    scene: sceneColoring,
  },
  {
    file: "moment-printables.svg",
    id: "print",
    accent: "#ff9a4d",
    title: "300 DPI printables",
    subtitle: "Stickers · posters · bookmarks",
    hook: "Download printables",
    scene: scenePrintables,
  },
  {
    file: "moment-keeper.svg",
    id: "keeper",
    accent: "#c4a882",
    title: "Become a Keeper",
    subtitle: "Story first · Credits ≠ SOL",
    hook: "Learn the story",
    scene: sceneKeeper,
  },
  {
    file: "moment-listen.svg",
    id: "listen",
    accent: "#3d9bff",
    title: "Listen to the Rift",
    subtitle: "Soundtrack ambience teasers",
    hook: "Listen",
    scene: sceneListen,
  },
];

for (const c of cards) {
  write(
    c.file,
    chrome({
      id: c.id,
      accent: c.accent,
      title: c.title,
      subtitle: c.subtitle,
      hook: c.hook,
      scene: c.scene,
    }),
  );
}

console.log("moment OG cards ready →", outDir);
