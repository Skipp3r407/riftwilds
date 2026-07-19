import fs from "node:fs";
import path from "node:path";

const dir = path.join("public/assets/social/avatar-bgs");
fs.mkdirSync(dir, { recursive: true });

/** @type {Record<string, { c0: string; c1: string; c2: string; motif: string }>} */
const themes = {
  "ember-crater": { c0: "#2a1208", c1: "#ff7a3d", c2: "#ffb84d", motif: "crater" },
  "ember-forge": { c0: "#1a0e0c", c1: "#ff5a2a", c2: "#ffe566", motif: "forge" },
  "ember-ashfall": { c0: "#18100e", c1: "#c44a2a", c2: "#ff9a5a", motif: "ash" },
  "grove-glade": { c0: "#0c1810", c1: "#3ecf7a", c2: "#a8e06c", motif: "glade" },
  "grove-thicket": { c0: "#0a140e", c1: "#2a8f4a", c2: "#6bcf6a", motif: "thicket" },
  "grove-canopy": { c0: "#081810", c1: "#4db86a", c2: "#c4e87a", motif: "canopy" },
  "tide-cove": { c0: "#061820", c1: "#2ec4ff", c2: "#7ae0ff", motif: "cove" },
  "tide-reef": { c0: "#04141c", c1: "#1a8aaa", c2: "#5ad4c8", motif: "reef" },
  "tide-moonfoam": { c0: "#08141c", c1: "#5a9fd4", c2: "#c8e8ff", motif: "moon" },
  "storm-spire": { c0: "#0c1020", c1: "#6b7cff", c2: "#c8d0ff", motif: "spire" },
  "storm-ridge": { c0: "#0a0e1a", c1: "#4a6aff", c2: "#a0b8ff", motif: "ridge" },
  "storm-spark": { c0: "#0e1024", c1: "#8a6aff", c2: "#ffe566", motif: "spark" },
  "stone-canyon": { c0: "#14100c", c1: "#c48a4a", c2: "#e8c48a", motif: "canyon" },
  "stone-geode": { c0: "#120e14", c1: "#8a6ac4", c2: "#d4a8ff", motif: "geode" },
  "stone-mesa": { c0: "#16120a", c1: "#a87840", c2: "#f0d0a0", motif: "mesa" },
  "spirit-marsh": { c0: "#0c1018", c1: "#8a7cff", c2: "#d4c8ff", motif: "marsh" },
  "spirit-lantern": { c0: "#0a0e16", c1: "#c4a06a", c2: "#ffe8a0", motif: "lantern" },
  "spirit-veil": { c0: "#0e0c18", c1: "#7a6ad4", c2: "#e8d0ff", motif: "veil" },
  "frost-basin": { c0: "#0a1420", c1: "#7ad4ff", c2: "#e8f4ff", motif: "basin" },
  "frost-glaze": { c0: "#0c1824", c1: "#5ab8e0", c2: "#c8ecff", motif: "glaze" },
  "frost-aurora": { c0: "#081420", c1: "#5ad4c8", c2: "#a0c8ff", motif: "aurora" },
  "radiant-citadel": { c0: "#18140a", c1: "#f5c542", c2: "#fff0c0", motif: "citadel" },
  "radiant-dawn": { c0: "#1a1208", c1: "#ffb84d", c2: "#ffe8a0", motif: "dawn" },
  "radiant-prism": { c0: "#141018", c1: "#f0d060", c2: "#a0e0ff", motif: "prism" },
  "void-hollow": { c0: "#080610", c1: "#6a3ad4", c2: "#c070ff", motif: "hollow" },
  "void-rift": { c0: "#06040e", c1: "#4a28a0", c2: "#ff6bcb", motif: "rift" },
  "void-mire": { c0: "#0a0812", c1: "#3a2860", c2: "#a060d4", motif: "mire" },
  "alloy-ruins": { c0: "#101214", c1: "#8a9aaa", c2: "#d4e0e8", motif: "ruins" },
  "alloy-forge": { c0: "#12100e", c1: "#c07040", c2: "#e8c080", motif: "aforge" },
  "alloy-scrap": { c0: "#0e1012", c1: "#6a8090", c2: "#b0c8d4", motif: "scrap" },
  "rift-commons": { c0: "#0c1018", c1: "#3de7ff", c2: "#7ad4ff", motif: "commons" },
  "rift-sky": { c0: "#0a0e1a", c1: "#5a8aff", c2: "#c8a0ff", motif: "sky" },
  "rift-meadow": { c0: "#0c1410", c1: "#5ad48a", c2: "#3de7ff", motif: "meadow" },
};

function motifs(motif, c1, c2) {
  const m = {
    crater: `<ellipse cx="256" cy="340" rx="140" ry="48" fill="${c1}" opacity="0.22"/><ellipse cx="256" cy="330" rx="70" ry="24" fill="${c2}" opacity="0.35"/><circle cx="180" cy="120" r="3" fill="${c2}" opacity="0.6"/>`,
    forge: `<rect x="160" y="280" width="192" height="80" rx="8" fill="${c1}" opacity="0.2"/><path d="M200 280 Q256 200 312 280" stroke="${c2}" stroke-width="3" fill="none" opacity="0.45"/><circle cx="256" cy="240" r="18" fill="${c2}" opacity="0.35"/>`,
    ash: `<circle cx="120" cy="100" r="2.5" fill="${c2}" opacity="0.5"/><circle cx="200" cy="180" r="1.8" fill="${c1}" opacity="0.45"/><circle cx="340" cy="140" r="2.2" fill="${c2}" opacity="0.4"/><path d="M80 400 Q200 300 400 380" stroke="${c1}" stroke-width="2" opacity="0.2" fill="none"/>`,
    glade: `<ellipse cx="256" cy="380" rx="180" ry="40" fill="${c1}" opacity="0.18"/><path d="M160 380 Q160 220 200 180" stroke="${c1}" stroke-width="10" fill="none" opacity="0.25"/><circle cx="200" cy="160" r="28" fill="${c2}" opacity="0.2"/><circle cx="280" cy="140" r="36" fill="${c1}" opacity="0.18"/>`,
    thicket: `<path d="M100 420 L140 200 L180 420" fill="${c1}" opacity="0.2"/><path d="M220 420 L260 160 L300 420" fill="${c2}" opacity="0.18"/><path d="M340 420 L380 210 L420 420" fill="${c1}" opacity="0.16"/>`,
    canopy: `<circle cx="160" cy="200" r="70" fill="${c1}" opacity="0.2"/><circle cx="280" cy="160" r="90" fill="${c2}" opacity="0.16"/><circle cx="380" cy="220" r="60" fill="${c1}" opacity="0.18"/><rect x="240" y="240" width="16" height="160" fill="${c1}" opacity="0.15"/>`,
    cove: `<path d="M0 320 Q128 260 256 320 T512 320 L512 512 L0 512Z" fill="${c1}" opacity="0.22"/><path d="M0 360 Q128 310 256 360 T512 360" stroke="${c2}" stroke-width="2" fill="none" opacity="0.35"/><circle cx="380" cy="120" r="28" fill="${c2}" opacity="0.2"/>`,
    reef: `<ellipse cx="180" cy="360" rx="50" ry="70" fill="${c1}" opacity="0.2"/><ellipse cx="280" cy="340" rx="40" ry="90" fill="${c2}" opacity="0.16"/><ellipse cx="360" cy="370" rx="55" ry="60" fill="${c1}" opacity="0.18"/>`,
    moon: `<circle cx="360" cy="120" r="48" fill="${c2}" opacity="0.25"/><circle cx="380" cy="110" r="40" fill="#04141c" opacity="0.5"/><path d="M0 380 Q256 300 512 380" stroke="${c1}" stroke-width="3" fill="none" opacity="0.3"/>`,
    spire: `<path d="M220 420 L256 80 L292 420Z" fill="${c1}" opacity="0.22"/><path d="M160 420 L200 200 L240 420Z" fill="${c2}" opacity="0.12"/><path d="M280 420 L330 180 L380 420Z" fill="${c1}" opacity="0.14"/>`,
    ridge: `<path d="M0 360 L120 220 L220 340 L320 180 L420 300 L512 240 L512 512 L0 512Z" fill="${c1}" opacity="0.2"/><path d="M80 200 L140 120" stroke="${c2}" stroke-width="2" opacity="0.4"/>`,
    spark: `<path d="M256 80 L270 200 L380 160 L290 240 L400 300 L270 290 L256 420 L240 290 L120 300 L230 240 L140 160 L240 200Z" fill="${c2}" opacity="0.28"/>`,
    canyon: `<path d="M0 200 L80 280 L160 180 L240 300 L320 160 L400 280 L512 200 L512 512 L0 512Z" fill="${c1}" opacity="0.2"/>`,
    geode: `<polygon points="256,100 340,180 310,300 200,300 170,180" fill="${c1}" opacity="0.22"/><polygon points="256,140 300,190 280,260 230,260 210,190" fill="${c2}" opacity="0.28"/>`,
    mesa: `<rect x="80" y="260" width="120" height="160" fill="${c1}" opacity="0.18"/><rect x="220" y="200" width="160" height="220" fill="${c2}" opacity="0.14"/><rect x="400" y="280" width="80" height="140" fill="${c1}" opacity="0.16"/>`,
    marsh: `<ellipse cx="180" cy="360" rx="100" ry="30" fill="${c1}" opacity="0.2"/><ellipse cx="340" cy="380" rx="120" ry="28" fill="${c2}" opacity="0.14"/><circle cx="200" cy="200" r="8" fill="${c2}" opacity="0.35"/>`,
    lantern: `<rect x="236" y="200" width="40" height="60" rx="6" fill="${c2}" opacity="0.3"/><circle cx="256" cy="190" r="22" fill="${c2}" opacity="0.35"/><path d="M256 260 L256 360" stroke="${c1}" stroke-width="3" opacity="0.25"/>`,
    veil: `<path d="M100 100 Q256 280 400 100" stroke="${c1}" stroke-width="40" fill="none" opacity="0.12"/><path d="M80 180 Q256 360 420 180" stroke="${c2}" stroke-width="30" fill="none" opacity="0.1"/>`,
    basin: `<ellipse cx="256" cy="340" rx="160" ry="50" fill="${c1}" opacity="0.2"/><path d="M120 340 Q256 280 390 340" stroke="${c2}" stroke-width="2" fill="none" opacity="0.4"/>`,
    glaze: `<path d="M0 300 L512 260 L512 512 L0 512Z" fill="${c1}" opacity="0.16"/><path d="M0 340 L512 300" stroke="${c2}" stroke-width="2" opacity="0.3"/>`,
    aurora: `<path d="M0 160 Q128 80 256 160 T512 160" stroke="${c1}" stroke-width="24" fill="none" opacity="0.2"/><path d="M0 200 Q128 120 256 200 T512 200" stroke="${c2}" stroke-width="18" fill="none" opacity="0.18"/>`,
    citadel: `<rect x="180" y="180" width="152" height="200" fill="${c1}" opacity="0.18"/><rect x="210" y="120" width="92" height="60" fill="${c2}" opacity="0.2"/><polygon points="256,60 300,120 212,120" fill="${c2}" opacity="0.25"/>`,
    dawn: `<circle cx="256" cy="200" r="70" fill="${c2}" opacity="0.25"/><circle cx="256" cy="200" r="40" fill="${c1}" opacity="0.3"/><path d="M0 320 Q256 260 512 320 L512 512 L0 512Z" fill="${c1}" opacity="0.15"/>`,
    prism: `<polygon points="256,80 360,320 152,320" fill="${c1}" opacity="0.2"/><polygon points="256,120 320,280 192,280" fill="${c2}" opacity="0.18"/>`,
    hollow: `<ellipse cx="256" cy="256" rx="120" ry="160" fill="${c1}" opacity="0.18"/><ellipse cx="256" cy="256" rx="60" ry="90" fill="#000" opacity="0.35"/>`,
    rift: `<path d="M240 40 L280 40 L300 472 L220 472Z" fill="${c2}" opacity="0.22"/><path d="M250 80 L270 80 L285 420 L235 420Z" fill="${c1}" opacity="0.3"/>`,
    mire: `<ellipse cx="200" cy="380" rx="140" ry="40" fill="${c1}" opacity="0.22"/><ellipse cx="340" cy="360" rx="100" ry="50" fill="${c2}" opacity="0.14"/>`,
    ruins: `<rect x="120" y="220" width="60" height="180" fill="${c1}" opacity="0.2"/><rect x="220" y="160" width="80" height="240" fill="${c2}" opacity="0.14"/><rect x="340" y="240" width="50" height="160" fill="${c1}" opacity="0.18"/>`,
    aforge: `<rect x="140" y="280" width="232" height="100" rx="10" fill="${c1}" opacity="0.2"/><circle cx="256" cy="260" r="36" fill="${c2}" opacity="0.28"/>`,
    scrap: `<rect x="100" y="300" width="80" height="40" fill="${c1}" opacity="0.22"/><rect x="280" y="280" width="100" height="30" fill="${c2}" opacity="0.2"/><circle cx="240" cy="200" r="20" fill="${c1}" opacity="0.25"/><circle cx="240" cy="200" r="10" fill="none" stroke="${c2}" stroke-width="3" opacity="0.4"/>`,
    commons: `<circle cx="256" cy="220" r="60" fill="${c1}" opacity="0.2"/><circle cx="256" cy="220" r="28" fill="${c2}" opacity="0.25"/><path d="M100 380 Q256 300 412 380" stroke="${c1}" stroke-width="3" fill="none" opacity="0.3"/>`,
    sky: `<circle cx="120" cy="100" r="3" fill="${c2}" opacity="0.55"/><circle cx="200" cy="160" r="2" fill="${c1}" opacity="0.5"/><circle cx="360" cy="80" r="2.5" fill="${c2}" opacity="0.45"/><path d="M0 280 Q256 200 512 280" stroke="${c1}" stroke-width="40" fill="none" opacity="0.12"/>`,
    meadow: `<ellipse cx="256" cy="380" rx="200" ry="50" fill="${c1}" opacity="0.18"/><circle cx="160" cy="300" r="8" fill="${c2}" opacity="0.3"/><circle cx="240" cy="280" r="6" fill="${c1}" opacity="0.28"/><circle cx="340" cy="310" r="7" fill="${c2}" opacity="0.25"/>`,
  };
  return m[motif] ?? "";
}

for (const [id, t] of Object.entries(themes)) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <radialGradient id="g" cx="45%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${t.c1}" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="${t.c0}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#050508" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${t.c2}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${t.c0}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <rect width="512" height="512" fill="url(#v)"/>
  ${motifs(t.motif, t.c1, t.c2)}
</svg>
`;
  fs.writeFileSync(path.join(dir, `${id}.svg`), svg);
}

console.log(`wrote ${Object.keys(themes).length} plates to ${dir}`);
