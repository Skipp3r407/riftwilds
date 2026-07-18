/**
 * Deterministic SVG renderers for Riftwilds library assets.
 * Warm earth palette; cyan/amber accents only.
 */

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rnd(seed, i = 0) {
  const x = Math.sin(seed * 0.0001 + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const PAL = {
  moss: "#4a7a45",
  mossDark: "#2f5230",
  mossLight: "#6b9a5a",
  bark: "#6b4a2e",
  barkDark: "#3d2a18",
  sandstone: "#c4a882",
  sandDark: "#8a6f4b",
  amber: "#e8a84a",
  amberBright: "#ffc76b",
  cyan: "#3ecfbf",
  cyanDeep: "#1a8a8a",
  earth: "#5c4030",
  cream: "#f0e6d2",
  stone: "#8a8f7a",
  stoneDark: "#5a5e4e",
  water: "#3d8bb8",
  waterDeep: "#1e5a78",
  ember: "#d4652f",
  frost: "#a8d4e8",
  shadow: "rgba(20,30,20,0.35)",
};

function seasonTint(season) {
  if (season === "spring") return { leaf: "#6bb86a", accent: "#e8a0c0" };
  if (season === "autumn") return { leaf: "#c4783a", accent: "#e8c04a" };
  if (season === "winter") return { leaf: "#b8c4b0", accent: "#e8f0f4" };
  return { leaf: PAL.moss, accent: PAL.amber };
}

function sizeScale(size) {
  if (size === "sapling" || size === "small" || size === "hatchling") return 0.72;
  if (size === "ancient" || size === "large" || size === "juvenile") return 1.12;
  return 1;
}

function wrap(w, h, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7ab86a"/>
      <stop offset="100%" stop-color="#3d6a38"/>
    </linearGradient>
    <linearGradient id="barkGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8a6238"/>
      <stop offset="100%" stop-color="#3d2a18"/>
    </linearGradient>
    <radialGradient id="glowAmber" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffc76b" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#e8a84a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowCyan" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#6eefe0" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#1a8a8a" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b"/>
      <feOffset dy="1.2" result="o"/>
      <feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${body}
</svg>`;
}

export function renderEntrySvg(entry) {
  const w = entry.size ?? 96;
  const h = w;
  const seed = hash(entry.id);
  const family = entry.family;
  const v = entry.variant ?? {};

  let body = "";
  switch (family) {
    case "tree":
      body = treeSvg(w, h, seed, v);
      break;
    case "bush":
      body = bushSvg(w, h, seed, v);
      break;
    case "flower":
      body = flowerSvg(w, h, seed, v);
      break;
    case "grass":
      body = grassSvg(w, h, seed, v);
      break;
    case "mushroom":
      body = mushroomSvg(w, h, seed, v);
      break;
    case "vine":
      body = vineSvg(w, h, seed, v);
      break;
    case "rock":
      body = rockSvg(w, h, seed, v);
      break;
    case "road":
      body = roadSvg(w, h, seed, v);
      break;
    case "water":
      body = waterSvg(w, h, seed, v);
      break;
    case "decal":
      body = decalSvg(w, h, seed, v);
      break;
    case "wall":
      body = wallSvg(w, h, seed, v);
      break;
    case "roof":
      body = roofSvg(w, h, seed, v);
      break;
    case "door":
      body = doorSvg(w, h, seed, v);
      break;
    case "window":
      body = windowSvg(w, h, seed, v);
      break;
    case "stall":
      body = stallSvg(w, h, seed, v);
      break;
    case "fence":
      body = fenceSvg(w, h, seed, v);
      break;
    case "gate":
      body = gateSvg(w, h, seed, v);
      break;
    case "bridge":
      body = bridgeSvg(w, h, seed, v);
      break;
    case "dock":
      body = dockSvg(w, h, seed, v);
      break;
    case "crate":
      body = crateSvg(w, h, seed, v);
      break;
    case "barrel":
      body = barrelSvg(w, h, seed, v);
      break;
    case "lantern":
      body = lanternSvg(w, h, seed, v);
      break;
    case "sign":
      body = signSvg(w, h, seed, v);
      break;
    case "furniture":
      body = furnitureSvg(w, h, seed, v);
      break;
    case "tool":
      body = toolSvg(w, h, seed, v);
      break;
    case "goods":
      body = goodsSvg(w, h, seed, v);
      break;
    case "animal":
      body = animalSvg(w, h, seed, v);
      break;
    case "ambient":
      body = ambientSvg(w, h, seed, v);
      break;
    case "riftling":
      body = riftlingSvg(w, h, seed, v);
      break;
    case "npc":
    case "keeper":
      body = personSvg(w, h, seed, v, family === "keeper");
      break;
    case "item":
    case "equipment":
      body = iconSvg(w, h, seed, v, family);
      break;
    case "egg":
      body = eggSvg(w, h, seed, v);
      break;
    case "smoke":
      body = smokeSvg(w, h, seed, v);
      break;
    case "sparkle":
      body = sparkleSvg(w, h, seed, v);
      break;
    case "shadow":
      body = shadowSvg(w, h, seed, v);
      break;
    case "weather":
      body = weatherSvg(w, h, seed, v);
      break;
    case "clutter":
      body = clutterSvg(w, h, seed, v);
      break;
    default:
      body = `<ellipse cx="${w / 2}" cy="${h * 0.85}" rx="${w * 0.25}" ry="${h * 0.08}" fill="${PAL.shadow}"/>
        <circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.28}" fill="${PAL.moss}"/>`;
  }

  return wrap(w, h, `<g filter="url(#soft)">${body}</g>`);
}

function treeSvg(w, h, seed, v) {
  const sc = sizeScale(v.size);
  const t = seasonTint(v.season);
  const cx = w / 2;
  const foot = h * 0.92;
  const trunkH = h * 0.38 * sc;
  const canopyR = w * 0.32 * sc;
  const rift = String(v.type).includes("rift") || String(v.type).includes("crystal");
  const pine = String(v.type).includes("pine") || String(v.type).includes("needle") || String(v.type).includes("cypress");
  const blobs = 7 + (seed % 4);
  let foliage = "";
  if (pine) {
    for (let i = 0; i < 4; i++) {
      const y = foot - trunkH - i * canopyR * 0.35;
      const rw = canopyR * (1.05 - i * 0.18);
      foliage += `<path d="M${cx} ${y - rw * 0.7} L${cx + rw} ${y + rw * 0.25} L${cx - rw} ${y + rw * 0.25} Z" fill="${i % 2 ? t.leaf : PAL.mossDark}"/>`;
    }
  } else {
    for (let i = 0; i < blobs; i++) {
      const a = rnd(seed, i) * Math.PI * 2;
      const r = canopyR * (0.5 + rnd(seed, i + 10) * 0.55);
      const ox = Math.cos(a) * canopyR * 0.5;
      const oy = Math.sin(a) * canopyR * 0.32 - canopyR * 0.15;
      foliage += `<ellipse cx="${cx + ox}" cy="${foot - trunkH - canopyR * 0.25 + oy}" rx="${r}" ry="${r * 0.82}" fill="${i % 2 ? t.leaf : PAL.mossDark}" opacity="0.94"/>`;
    }
    foliage += `<ellipse cx="${cx - canopyR * 0.15}" cy="${foot - trunkH - canopyR * 0.45}" rx="${canopyR * 0.35}" ry="${canopyR * 0.22}" fill="#fff" opacity="0.12"/>`;
  }
  return `
    <ellipse cx="${cx}" cy="${foot}" rx="${canopyR * 0.6}" ry="${h * 0.055}" fill="${PAL.shadow}"/>
    <path d="M${cx - 7 * sc} ${foot} L${cx - 4.5 * sc} ${foot - trunkH} L${cx + 4.5 * sc} ${foot - trunkH} L${cx + 7 * sc} ${foot} Z" fill="${PAL.bark}"/>
    <path d="M${cx - 2 * sc} ${foot - trunkH * 0.3} L${cx - 12 * sc} ${foot - trunkH * 0.55}" stroke="${PAL.barkDark}" stroke-width="${2 * sc}" stroke-linecap="round"/>
    ${foliage}
    ${rift ? `<circle cx="${cx}" cy="${foot - trunkH - canopyR * 0.35}" r="${canopyR * 0.2}" fill="${PAL.cyan}" opacity="0.8"/><circle cx="${cx}" cy="${foot - trunkH - canopyR * 0.35}" r="${canopyR * 0.35}" fill="${PAL.cyan}" opacity="0.2"/>` : ""}
    ${v.season === "spring" || v.season === "autumn" ? `<circle cx="${cx + canopyR * 0.28}" cy="${foot - trunkH - canopyR * 0.5}" r="3.2" fill="${t.accent}"/><circle cx="${cx - canopyR * 0.22}" cy="${foot - trunkH - canopyR * 0.32}" r="2.6" fill="${t.accent}"/><circle cx="${cx + canopyR * 0.05}" cy="${foot - trunkH - canopyR * 0.15}" r="2.2" fill="${t.accent}"/>` : ""}
  `;
}

function bushSvg(w, h, seed, v) {
  const sc = sizeScale(v.size);
  const t = seasonTint(v.season);
  const cx = w / 2;
  const foot = h * 0.9;
  let b = `<ellipse cx="${cx}" cy="${foot}" rx="${w * 0.28 * sc}" ry="${h * 0.06}" fill="${PAL.shadow}"/>`;
  for (let i = 0; i < 4; i++) {
    const ox = (rnd(seed, i) - 0.5) * w * 0.25 * sc;
    const oy = rnd(seed, i + 3) * h * 0.08;
    b += `<ellipse cx="${cx + ox}" cy="${foot - h * 0.22 * sc - oy}" rx="${w * 0.22 * sc}" ry="${h * 0.18 * sc}" fill="${i % 2 ? t.leaf : PAL.mossDark}"/>`;
  }
  if (String(v.type).includes("berry") || String(v.type).includes("bloom")) {
    for (let i = 0; i < 5; i++) {
      b += `<circle cx="${cx + (rnd(seed, i + 20) - 0.5) * w * 0.3}" cy="${foot - h * 0.25 * sc - rnd(seed, i) * 10}" r="2.5" fill="${PAL.ember}"/>`;
    }
  }
  return b;
}

function flowerSvg(w, h, seed, v) {
  const cx = w / 2;
  const foot = h * 0.92;
  const colors = { moss: PAL.mossLight, amber: PAL.amber, cyan: PAL.cyan };
  const petal = colors[v.palette] ?? PAL.amber;
  let b = `<ellipse cx="${cx}" cy="${foot}" rx="10" ry="4" fill="${PAL.shadow}"/>`;
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * 14;
    b += `<line x1="${x}" y1="${foot}" x2="${x}" y2="${foot - 22}" stroke="${PAL.mossDark}" stroke-width="2"/>`;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      b += `<ellipse cx="${x + Math.cos(a) * 6}" cy="${foot - 26 + Math.sin(a) * 5}" rx="4" ry="3" fill="${petal}"/>`;
    }
    b += `<circle cx="${x}" cy="${foot - 26}" r="2.5" fill="${PAL.amberBright}"/>`;
  }
  return b;
}

function grassSvg(w, h, seed, v) {
  const cx = w / 2;
  const foot = h * 0.9;
  let b = "";
  const n = 7 + (seed % 4);
  for (let i = 0; i < n; i++) {
    const x = cx + (rnd(seed, i) - 0.5) * w * 0.7;
    const hh = 12 + rnd(seed, i + 2) * 22;
    const lean = (rnd(seed, i + 5) - 0.5) * 10;
    b += `<path d="M${x} ${foot} Q${x + lean} ${foot - hh / 2} ${x + lean * 1.2} ${foot - hh}" fill="none" stroke="${rnd(seed, i) > 0.5 ? PAL.moss : PAL.mossLight}" stroke-width="2" stroke-linecap="round"/>`;
  }
  return b;
}

function mushroomSvg(w, h, seed, v) {
  const cx = w / 2;
  const foot = h * 0.92;
  const sc = sizeScale(v.size);
  const glow = String(v.type).includes("glow") || String(v.type).includes("cyan") || String(v.type).includes("rift");
  const cap = String(v.type).includes("ember") ? PAL.ember : glow ? PAL.cyan : PAL.amber;
  return `
    <ellipse cx="${cx}" cy="${foot}" rx="${10 * sc}" ry="3" fill="${PAL.shadow}"/>
    <rect x="${cx - 3 * sc}" y="${foot - 18 * sc}" width="${6 * sc}" height="${18 * sc}" rx="2" fill="${PAL.cream}"/>
    <ellipse cx="${cx}" cy="${foot - 20 * sc}" rx="${14 * sc}" ry="${8 * sc}" fill="${cap}"/>
    <ellipse cx="${cx - 3}" cy="${foot - 22 * sc}" rx="${4 * sc}" ry="${2 * sc}" fill="#fff" opacity="0.25"/>
    ${glow ? `<circle cx="${cx}" cy="${foot - 20 * sc}" r="${6 * sc}" fill="${cap}" opacity="0.35"/>` : ""}
  `;
}

function vineSvg(w, h, seed, v) {
  let b = "";
  for (let i = 0; i < 3; i++) {
    const x = w * (0.3 + i * 0.2);
    b += `<path d="M${x} 4 Q${x + 12} ${h * 0.3} ${x - 8} ${h * 0.55} Q${x + 10} ${h * 0.75} ${x} ${h - 6}" fill="none" stroke="${PAL.mossDark}" stroke-width="3"/>`;
    for (let j = 0; j < 4; j++) {
      b += `<ellipse cx="${x + (j % 2 ? 6 : -6)}" cy="${20 + j * h * 0.2}" rx="6" ry="4" fill="${PAL.moss}"/>`;
    }
  }
  return b;
}

function rockSvg(w, h, seed, v) {
  const cx = w / 2;
  const foot = h * 0.9;
  const pal = v.palette === "cyan" ? PAL.cyanDeep : v.palette === "amber" ? PAL.sandstone : PAL.stone;
  return `
    <ellipse cx="${cx}" cy="${foot}" rx="18" ry="5" fill="${PAL.shadow}"/>
    <path d="M${cx - 20} ${foot - 4} L${cx - 14} ${foot - 22} L${cx + 6} ${foot - 28} L${cx + 22} ${foot - 12} L${cx + 16} ${foot - 2} Z" fill="${pal}"/>
    <path d="M${cx - 10} ${foot - 18} L${cx + 2} ${foot - 24} L${cx + 8} ${foot - 14}" fill="none" stroke="#fff" opacity="0.15" stroke-width="2"/>
  `;
}

function roadSvg(w, h, seed, v) {
  const worn = v.wear === "worn";
  const fillA = worn ? "#8a7355" : "#a89070";
  const fillB = worn ? "#7a6548" : "#b8a080";
  let pebbles = "";
  for (let i = 0; i < 6; i++) {
    const px = 10 + rnd(seed, i) * (w - 20);
    const py = 10 + rnd(seed, i + 3) * (h - 20);
    pebbles += `<ellipse cx="${px}" cy="${py}" rx="4" ry="3" fill="${PAL.stoneDark}" opacity="0.35"/>`;
  }
  return `
    <rect width="${w}" height="${h}" fill="${fillA}"/>
    <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="${fillB}" opacity="0.8"/>
    ${pebbles}
  `;
}

function waterSvg(w, h, seed, v) {
  const deep = v.tone === "deep";
  return `
    <rect width="${w}" height="${h}" fill="${deep ? PAL.waterDeep : PAL.water}"/>
    <ellipse cx="${w * 0.35}" cy="${h * 0.4}" rx="12" ry="5" fill="#fff" opacity="0.2"/>
    <ellipse cx="${w * 0.65}" cy="${h * 0.6}" rx="10" ry="4" fill="#fff" opacity="0.15"/>
    <path d="M8 ${h * 0.5} Q${w / 2} ${h * 0.35} ${w - 8} ${h * 0.55}" fill="none" stroke="${PAL.cyan}" opacity="0.35" stroke-width="2"/>
  `;
}

function decalSvg(w, h, seed, v) {
  const t = String(v.type);
  if (t.includes("shadow")) {
    return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.4}" ry="${h * 0.22}" fill="#1a2018" opacity="0.4"/>`;
  }
  if (t.includes("rift")) {
    return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="16" ry="10" fill="${PAL.cyan}" opacity="0.35"/>`;
  }
  let b = "";
  for (let i = 0; i < 8; i++) {
    b += `<ellipse cx="${rnd(seed, i) * w}" cy="${rnd(seed, i + 2) * h}" rx="3" ry="2" fill="${PAL.mossDark}" opacity="0.5"/>`;
  }
  return b;
}

function wallSvg(w, h, seed, v) {
  const timber = v.style === "timber" || v.style === "mixed";
  const base = timber ? PAL.bark : PAL.stone;
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.92}" rx="${w * 0.4}" ry="6" fill="${PAL.shadow}"/>
    <path d="M${w * 0.15} ${h * 0.85} L${w * 0.2} ${h * 0.25} L${w * 0.8} ${h * 0.25} L${w * 0.85} ${h * 0.85} Z" fill="${base}"/>
    <rect x="${w * 0.22}" y="${h * 0.28}" width="${w * 0.56}" height="${h * 0.5}" fill="${timber ? PAL.sandstone : PAL.stoneDark}" opacity="0.35"/>
    ${v.style === "rift-inlaid" ? `<rect x="${w * 0.45}" y="${h * 0.4}" width="8" height="${h * 0.25}" fill="${PAL.cyan}" opacity="0.7"/>` : ""}
  `;
}

function roofSvg(w, h, seed, v) {
  const c = v.style === "copper-rift" ? PAL.cyanDeep : v.style === "tile" ? PAL.ember : PAL.bark;
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.75}" rx="${w * 0.4}" ry="5" fill="${PAL.shadow}"/>
    <path d="M${w * 0.1} ${h * 0.55} L${w / 2} ${h * 0.15} L${w * 0.9} ${h * 0.55} Z" fill="${c}"/>
    <path d="M${w * 0.2} ${h * 0.52} L${w / 2} ${h * 0.25} L${w * 0.8} ${h * 0.52}" fill="none" stroke="#fff" opacity="0.12" stroke-width="2"/>
  `;
}

function doorSvg(w, h, seed, v) {
  const open = v.state === "open";
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.95}" rx="16" ry="4" fill="${PAL.shadow}"/>
    <rect x="${w * 0.28}" y="${h * 0.2}" width="${w * 0.44}" height="${h * 0.7}" rx="4" fill="${PAL.barkDark}"/>
    ${open ? "" : `<rect x="${w * 0.32}" y="${h * 0.25}" width="${w * 0.36}" height="${h * 0.6}" rx="3" fill="${PAL.bark}"/>`}
    <circle cx="${w * 0.62}" cy="${h * 0.55}" r="3" fill="${PAL.amber}"/>
  `;
}

function windowSvg(w, h, seed, v) {
  const lit = v.lit === "night";
  return `
    <rect x="${w * 0.2}" y="${h * 0.2}" width="${w * 0.6}" height="${h * 0.6}" rx="4" fill="${PAL.barkDark}"/>
    <rect x="${w * 0.26}" y="${h * 0.26}" width="${w * 0.48}" height="${h * 0.48}" fill="${lit ? PAL.amberBright : PAL.frost}" opacity="${lit ? 0.85 : 0.45}"/>
    <line x1="${w / 2}" y1="${h * 0.26}" x2="${w / 2}" y2="${h * 0.74}" stroke="${PAL.bark}" stroke-width="2"/>
    <line x1="${w * 0.26}" y1="${h / 2}" x2="${w * 0.74}" y2="${h / 2}" stroke="${PAL.bark}" stroke-width="2"/>
  `;
}

function stallSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.92}" rx="${w * 0.4}" ry="6" fill="${PAL.shadow}"/>
    <rect x="${w * 0.2}" y="${h * 0.55}" width="${w * 0.6}" height="${h * 0.3}" fill="${PAL.bark}"/>
    <path d="M${w * 0.15} ${h * 0.55} L${w / 2} ${h * 0.2} L${w * 0.85} ${h * 0.55} Z" fill="${PAL.ember}"/>
    <rect x="${w * 0.28}" y="${h * 0.6}" width="${w * 0.44}" height="${h * 0.12}" fill="${PAL.sandstone}"/>
    <circle cx="${w * 0.4}" cy="${h * 0.66}" r="4" fill="${PAL.amber}"/>
    <circle cx="${w * 0.55}" cy="${h * 0.66}" r="4" fill="${PAL.moss}"/>
  `;
}

function fenceSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.92}" rx="20" ry="4" fill="${PAL.shadow}"/>
    <rect x="${w * 0.2}" y="${h * 0.35}" width="5" height="${h * 0.5}" fill="${PAL.bark}"/>
    <rect x="${w * 0.75}" y="${h * 0.35}" width="5" height="${h * 0.5}" fill="${PAL.bark}"/>
    <rect x="${w * 0.2}" y="${h * 0.45}" width="${w * 0.6}" height="4" fill="${PAL.barkDark}"/>
    <rect x="${w * 0.2}" y="${h * 0.62}" width="${w * 0.6}" height="4" fill="${PAL.barkDark}"/>
  `;
}

function gateSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.92}" rx="${w * 0.4}" ry="5" fill="${PAL.shadow}"/>
    <path d="M${w * 0.15} ${h * 0.9} L${w * 0.15} ${h * 0.35} Q${w / 2} ${h * 0.1} ${w * 0.85} ${h * 0.35} L${w * 0.85} ${h * 0.9}" fill="none" stroke="${PAL.stone}" stroke-width="10"/>
    <rect x="${w * 0.35}" y="${h * 0.45}" width="${w * 0.3}" height="${h * 0.4}" fill="${PAL.bark}"/>
  `;
}

function bridgeSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.85}" rx="${w * 0.42}" ry="5" fill="${PAL.shadow}"/>
    <path d="M${w * 0.1} ${h * 0.7} Q${w / 2} ${h * 0.45} ${w * 0.9} ${h * 0.7}" fill="none" stroke="${PAL.water}" stroke-width="8" opacity="0.4"/>
    <rect x="${w * 0.12}" y="${h * 0.58}" width="${w * 0.76}" height="10" rx="2" fill="${PAL.bark}"/>
    <rect x="${w * 0.15}" y="${h * 0.48}" width="4" height="14" fill="${PAL.barkDark}"/>
    <rect x="${w * 0.81}" y="${h * 0.48}" width="4" height="14" fill="${PAL.barkDark}"/>
  `;
}

function dockSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="22" ry="4" fill="${PAL.shadow}"/>
    <rect x="${w * 0.15}" y="${h * 0.55}" width="${w * 0.7}" height="12" fill="${PAL.bark}"/>
    <rect x="${w * 0.25}" y="${h * 0.65}" width="5" height="${h * 0.2}" fill="${PAL.barkDark}"/>
    <rect x="${w * 0.7}" y="${h * 0.65}" width="5" height="${h * 0.2}" fill="${PAL.barkDark}"/>
  `;
}

function crateSvg(w, h, seed, v) {
  const c = v.palette === "cyan" ? PAL.cyanDeep : v.palette === "amber" ? PAL.amber : PAL.bark;
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="16" ry="4" fill="${PAL.shadow}"/>
    <rect x="${w * 0.25}" y="${h * 0.35}" width="${w * 0.5}" height="${h * 0.45}" fill="${PAL.sandstone}"/>
    <rect x="${w * 0.25}" y="${h * 0.35}" width="${w * 0.5}" height="6" fill="${c}"/>
    <line x1="${w / 2}" y1="${h * 0.35}" x2="${w / 2}" y2="${h * 0.8}" stroke="${PAL.barkDark}" stroke-width="2"/>
  `;
}

function barrelSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="14" ry="4" fill="${PAL.shadow}"/>
    <ellipse cx="${w / 2}" cy="${h * 0.7}" rx="16" ry="22" fill="${PAL.bark}"/>
    <ellipse cx="${w / 2}" cy="${h * 0.52}" rx="14" ry="5" fill="${PAL.barkDark}"/>
    <ellipse cx="${w / 2}" cy="${h * 0.85}" rx="14" ry="5" fill="${PAL.barkDark}"/>
    <rect x="${w * 0.35}" y="${h * 0.55}" width="4" height="8" fill="${PAL.amber}"/>
  `;
}

function lanternSvg(w, h, seed, v) {
  const rift = String(v.type).includes("rift");
  const glow = rift ? PAL.cyan : PAL.amberBright;
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.95}" rx="8" ry="3" fill="${PAL.shadow}"/>
    <rect x="${w / 2 - 2}" y="${h * 0.35}" width="4" height="${h * 0.5}" fill="${PAL.barkDark}"/>
    <rect x="${w / 2 - 8}" y="${h * 0.28}" width="16" height="18" rx="3" fill="${PAL.earth}"/>
    <rect x="${w / 2 - 5}" y="${h * 0.32}" width="10" height="12" fill="${glow}" opacity="0.9"/>
    <circle cx="${w / 2}" cy="${h * 0.38}" r="10" fill="${glow}" opacity="0.25"/>
  `;
}

function signSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.95}" rx="8" ry="3" fill="${PAL.shadow}"/>
    <rect x="${w / 2 - 2}" y="${h * 0.4}" width="4" height="${h * 0.5}" fill="${PAL.bark}"/>
    <rect x="${w * 0.22}" y="${h * 0.22}" width="${w * 0.56}" height="${h * 0.28}" rx="3" fill="${PAL.sandstone}"/>
    <rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.4}" height="4" fill="${PAL.barkDark}" opacity="0.5"/>
    <rect x="${w * 0.35}" y="${h * 0.38}" width="${w * 0.3}" height="3" fill="${PAL.barkDark}" opacity="0.4"/>
  `;
}

function furnitureSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="18" ry="4" fill="${PAL.shadow}"/>
    <rect x="${w * 0.2}" y="${h * 0.55}" width="${w * 0.6}" height="8" fill="${PAL.bark}"/>
    <rect x="${w * 0.22}" y="${h * 0.63}" width="5" height="${h * 0.2}" fill="${PAL.barkDark}"/>
    <rect x="${w * 0.73}" y="${h * 0.63}" width="5" height="${h * 0.2}" fill="${PAL.barkDark}"/>
  `;
}

function toolSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.88}" rx="10" ry="3" fill="${PAL.shadow}"/>
    <rect x="${w / 2 - 2}" y="${h * 0.3}" width="4" height="${h * 0.45}" fill="${PAL.bark}"/>
    <path d="M${w * 0.3} ${h * 0.32} L${w * 0.7} ${h * 0.32} L${w * 0.65} ${h * 0.45} L${w * 0.35} ${h * 0.45} Z" fill="${PAL.stone}"/>
  `;
}

function goodsSvg(w, h, seed, v) {
  const c = [PAL.amber, PAL.moss, PAL.cyan, PAL.ember][seed % 4];
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="14" ry="4" fill="${PAL.shadow}"/>
    <ellipse cx="${w / 2}" cy="${h * 0.6}" rx="16" ry="14" fill="${PAL.sandstone}"/>
    <circle cx="${w / 2}" cy="${h * 0.55}" r="8" fill="${c}"/>
  `;
}

function animalSvg(w, h, seed, v) {
  const c = [PAL.earth, PAL.sandstone, PAL.mossDark, PAL.frost][seed % 4];
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="12" ry="4" fill="${PAL.shadow}"/>
    <ellipse cx="${w / 2}" cy="${h * 0.62}" rx="16" ry="12" fill="${c}"/>
    <circle cx="${w / 2 + 12}" cy="${h * 0.52}" r="8" fill="${c}"/>
    <circle cx="${w / 2 + 15}" cy="${h * 0.5}" r="1.5" fill="#1a1a1a"/>
    <ellipse cx="${w / 2 - 10}" cy="${h * 0.78}" rx="3" ry="6" fill="${PAL.barkDark}"/>
    <ellipse cx="${w / 2 + 4}" cy="${h * 0.78}" rx="3" ry="6" fill="${PAL.barkDark}"/>
  `;
}

function ambientSvg(w, h, seed, v) {
  let b = "";
  for (let i = 0; i < 6; i++) {
    const c = i % 2 ? PAL.cyan : PAL.amberBright;
    b += `<circle cx="${rnd(seed, i) * w}" cy="${rnd(seed, i + 4) * h}" r="${2 + rnd(seed, i) * 3}" fill="${c}" opacity="0.7"/>`;
  }
  return b;
}

function riftlingSvg(w, h, seed, v) {
  const sc = sizeScale(v.stage);
  const body = [PAL.cyan, PAL.amber, PAL.moss, PAL.ember, PAL.frost][seed % 5];
  const cx = w / 2;
  const foot = h * 0.92;
  return `
    <ellipse cx="${cx}" cy="${foot}" rx="${10 * sc}" ry="3" fill="${PAL.shadow}"/>
    <ellipse cx="${cx}" cy="${foot - 18 * sc}" rx="${14 * sc}" ry="${16 * sc}" fill="${body}"/>
    <circle cx="${cx}" cy="${foot - 34 * sc}" r="${10 * sc}" fill="${body}"/>
    <circle cx="${cx - 3}" cy="${foot - 35 * sc}" r="2" fill="#1a1a1a"/>
    <circle cx="${cx + 4}" cy="${foot - 35 * sc}" r="2" fill="#1a1a1a"/>
    <path d="M${cx - 8 * sc} ${foot - 40 * sc} Q${cx - 14 * sc} ${foot - 50 * sc} ${cx - 4 * sc} ${foot - 44 * sc}" fill="${PAL.cyan}" opacity="0.8"/>
    <path d="M${cx + 8 * sc} ${foot - 40 * sc} Q${cx + 14 * sc} ${foot - 50 * sc} ${cx + 4 * sc} ${foot - 44 * sc}" fill="${PAL.cyan}" opacity="0.8"/>
    <circle cx="${cx}" cy="${foot - 20 * sc}" r="${4 * sc}" fill="${PAL.amberBright}" opacity="0.7"/>
  `;
}

function personSvg(w, h, seed, v, keeper) {
  const cloak = [PAL.bark, PAL.mossDark, PAL.cyanDeep, PAL.ember, PAL.earth][seed % 5];
  const cx = w / 2;
  const foot = h * 0.96;
  return `
    <ellipse cx="${cx}" cy="${foot}" rx="10" ry="3" fill="${PAL.shadow}"/>
    <rect x="${cx - 5}" y="${foot - 18}" width="4" height="16" fill="${PAL.earth}"/>
    <rect x="${cx + 1}" y="${foot - 18}" width="4" height="16" fill="${PAL.earth}"/>
    <path d="M${cx - 12} ${foot - 20} L${cx - 10} ${foot - 48} L${cx + 10} ${foot - 48} L${cx + 12} ${foot - 20} Z" fill="${cloak}"/>
    <circle cx="${cx}" cy="${foot - 56}" r="8" fill="${PAL.sandstone}"/>
    ${keeper ? `<rect x="${cx - 9}" y="${foot - 50}" width="18" height="6" fill="${PAL.amber}" opacity="0.8"/>` : ""}
    <path d="M${cx - 14} ${foot - 46} Q${cx} ${foot - 38} ${cx + 14} ${foot - 46}" fill="${cloak}" opacity="0.85"/>
  `;
}

function iconSvg(w, h, seed, v, family) {
  const c = family === "equipment" ? PAL.stone : PAL.amber;
  return `
    <circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.38}" fill="${PAL.earth}" opacity="0.25"/>
    <rect x="${w * 0.3}" y="${h * 0.28}" width="${w * 0.4}" height="${h * 0.44}" rx="6" fill="${c}"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="6" fill="${PAL.cyan}" opacity="0.7"/>
  `;
}

function eggSvg(w, h, seed, v) {
  const accents = {
    grove: PAL.moss, ember: PAL.ember, tide: PAL.water, frost: PAL.frost,
    storm: PAL.frost, stone: PAL.stone, spirit: "#e8a0d0", void: "#3a3050",
    alloy: "#b0b8c0", radiant: PAL.amberBright, commons: PAL.cyan,
  };
  const a = accents[v.type] ?? PAL.cyan;
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.88}" rx="12" ry="4" fill="${PAL.shadow}"/>
    <ellipse cx="${w / 2}" cy="${h * 0.52}" rx="16" ry="22" fill="${PAL.cream}"/>
    <path d="M${w / 2 - 8} ${h * 0.45} Q${w / 2} ${h * 0.35} ${w / 2 + 8} ${h * 0.5}" fill="none" stroke="${a}" stroke-width="3"/>
    <circle cx="${w / 2 + 4}" cy="${h * 0.55}" r="3" fill="${a}" opacity="0.7"/>
  `;
}

function smokeSvg(w, h, seed, v) {
  let b = "";
  for (let i = 0; i < 4; i++) {
    b += `<ellipse cx="${w / 2 + (rnd(seed, i) - 0.5) * 20}" cy="${h - 15 - i * 12}" rx="${10 + i * 3}" ry="${7 + i * 2}" fill="#9aa090" opacity="${0.45 - i * 0.08}"/>`;
  }
  return b;
}

function sparkleSvg(w, h, seed, v) {
  const c = String(v.type).includes("rift") ? PAL.cyan : PAL.amberBright;
  return `
    <circle cx="${w / 2}" cy="${h / 2}" r="3" fill="${c}"/>
    <line x1="${w / 2}" y1="8" x2="${w / 2}" y2="${h - 8}" stroke="${c}" stroke-width="2"/>
    <line x1="8" y1="${h / 2}" x2="${w - 8}" y2="${h / 2}" stroke="${c}" stroke-width="2"/>
  `;
}

function shadowSvg(w, h, seed, v) {
  return `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w * 0.42}" ry="${h * 0.22}" fill="#1a2018" opacity="0.45"/>`;
}

function weatherSvg(w, h, seed, v) {
  const t = String(v.type);
  let b = "";
  if (t.includes("rain")) {
    for (let i = 0; i < 8; i++) {
      b += `<line x1="${rnd(seed, i) * w}" y1="${rnd(seed, i + 2) * h}" x2="${rnd(seed, i) * w - 2}" y2="${rnd(seed, i + 2) * h + 10}" stroke="${PAL.water}" stroke-width="1.5" opacity="0.7"/>`;
    }
  } else if (t.includes("snow")) {
    for (let i = 0; i < 8; i++) {
      b += `<circle cx="${rnd(seed, i) * w}" cy="${rnd(seed, i + 2) * h}" r="2" fill="#fff" opacity="0.8"/>`;
    }
  } else {
    for (let i = 0; i < 6; i++) {
      b += `<ellipse cx="${rnd(seed, i) * w}" cy="${rnd(seed, i + 2) * h}" rx="4" ry="2" fill="${PAL.amber}" opacity="0.5"/>`;
    }
  }
  return b;
}

function clutterSvg(w, h, seed, v) {
  return `
    <ellipse cx="${w / 2}" cy="${h * 0.9}" rx="16" ry="4" fill="${PAL.shadow}"/>
    <rect x="${w * 0.3}" y="${h * 0.55}" width="14" height="12" fill="${PAL.bark}"/>
    <circle cx="${w * 0.6}" cy="${h * 0.65}" r="7" fill="${PAL.stone}"/>
    <ellipse cx="${w * 0.45}" cy="${h * 0.7}" rx="6" ry="4" fill="${PAL.moss}"/>
  `;
}
