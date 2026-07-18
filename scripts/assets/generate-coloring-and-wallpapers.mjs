/**
 * Generate original Riftwilds kids coloring sheets + desktop wallpapers.
 * Run: node scripts/assets/generate-coloring-and-wallpapers.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const COLORING_DIR = path.join(ROOT, "public/assets/coloring");
const WALLPAPER_DIR = path.join(ROOT, "public/assets/wallpapers");

const LETTER_W = 2550;
const LETTER_H = 3300;
const DESK_W = 1920;
const DESK_H = 1080;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pageFrame(title, art) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${LETTER_W}" height="${LETTER_H}" viewBox="0 0 850 1100">
  <rect width="850" height="1100" fill="#ffffff"/>
  <rect x="28" y="28" width="794" height="1044" fill="none" stroke="#1a1a1a" stroke-width="3" rx="8"/>
  <text x="425" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#1a1a1a">${title}</text>
  <text x="425" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#444444">Riftwilds · Kids coloring page</text>
  <g transform="translate(0, 40)" fill="none" stroke="#111111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    ${art}
  </g>
  <text x="425" y="1068" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#555555">Free for personal &amp; kids use · Not for resale · riftwilds.com</text>
</svg>`;
}

const COLORING = [
  {
    slug: "spark",
    title: "Spark the Glowpup",
    art: `
      <!-- Spark body -->
      <ellipse cx="425" cy="520" rx="140" ry="155"/>
      <ellipse cx="425" cy="470" rx="70" ry="48"/>
      <!-- ears -->
      <path d="M330 400 Q300 300 370 390"/>
      <path d="M520 400 Q550 300 480 390"/>
      <path d="M340 395 Q320 340 365 390" stroke-width="1.5"/>
      <path d="M510 395 Q530 340 485 390" stroke-width="1.5"/>
      <!-- eyes -->
      <circle cx="385" cy="480" r="18"/>
      <circle cx="465" cy="480" r="18"/>
      <circle cx="385" cy="480" r="6" fill="#111" stroke="none"/>
      <circle cx="465" cy="480" r="6" fill="#111" stroke="none"/>
      <!-- smile + nose -->
      <ellipse cx="425" cy="515" rx="10" ry="7"/>
      <path d="M400 545 Q425 570 450 545"/>
      <!-- paws -->
      <ellipse cx="350" cy="640" rx="36" ry="28"/>
      <ellipse cx="500" cy="640" rx="36" ry="28"/>
      <ellipse cx="370" cy="700" rx="40" ry="22"/>
      <ellipse cx="480" cy="700" rx="40" ry="22"/>
      <!-- sparkles -->
      <path d="M260 360 L270 390 L300 400 L270 410 L260 440 L250 410 L220 400 L250 390 Z" stroke-width="2"/>
      <path d="M580 340 L588 362 L610 370 L588 378 L580 400 L572 378 L550 370 L572 362 Z" stroke-width="2"/>
      <circle cx="300" cy="300" r="8"/>
      <circle cx="560" cy="280" r="6"/>
      <circle cx="620" cy="480" r="7"/>
      <!-- ground -->
      <ellipse cx="425" cy="760" rx="200" ry="24" stroke-width="2"/>
      <text x="425" y="860" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#222" stroke="none">Color Spark any way you like!</text>
    `,
  },
  {
    slug: "riftwild-commons",
    title: "Riftwild Commons",
    art: `
      <!-- sky hills -->
      <path d="M60 420 Q200 280 360 360 Q500 260 680 340 Q760 300 790 360 L790 820 L60 820 Z" stroke-width="2.5"/>
      <!-- fountain -->
      <ellipse cx="425" cy="620" rx="120" ry="28"/>
      <path d="M340 620 L360 520 L490 520 L510 620"/>
      <ellipse cx="425" cy="520" rx="70" ry="16"/>
      <path d="M390 520 L400 460 L450 460 L460 520"/>
      <ellipse cx="425" cy="460" rx="40" ry="12"/>
      <circle cx="425" cy="430" r="14"/>
      <path d="M425 416 Q410 390 425 370 Q440 390 425 416" stroke-width="2"/>
      <!-- plaza stones -->
      <path d="M120 720 L730 720"/>
      <path d="M160 760 L690 760"/>
      <path d="M200 800 L650 800"/>
      <!-- banners -->
      <path d="M180 380 L180 520"/>
      <path d="M180 380 Q210 400 180 430 Q150 400 180 380"/>
      <path d="M670 360 L670 500"/>
      <path d="M670 360 Q700 380 670 410 Q640 380 670 360"/>
      <!-- gateway stones far -->
      <rect x="140" y="480" width="36" height="90" rx="4"/>
      <rect x="674" y="470" width="36" height="100" rx="4"/>
      <!-- sun -->
      <circle cx="680" cy="200" r="42"/>
      <path d="M680 140 L680 120 M730 160 L745 145 M740 200 L760 200 M730 240 L745 255 M680 260 L680 280 M630 240 L615 255 M620 200 L600 200 M630 160 L615 145" stroke-width="2"/>
      <text x="425" y="900" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">Welcome to the Commons plaza</text>
    `,
  },
  {
    slug: "traveling-circus",
    title: "Traveling Circus",
    art: `
      <!-- tent -->
      <path d="M200 700 L425 280 L650 700 Z"/>
      <path d="M425 280 L425 700"/>
      <path d="M280 560 L570 560"/>
      <path d="M320 640 L530 640"/>
      <!-- stripes suggestion -->
      <path d="M340 420 L300 620" stroke-width="1.8"/>
      <path d="M510 420 L550 620" stroke-width="1.8"/>
      <!-- entrance -->
      <path d="M380 700 Q425 600 470 700"/>
      <!-- flags -->
      <path d="M425 280 L425 220"/>
      <path d="M425 220 L470 240 L425 260"/>
      <path d="M250 520 L250 460 L290 480 L250 500"/>
      <path d="M600 520 L600 460 L640 480 L600 500"/>
      <!-- balloons -->
      <ellipse cx="160" cy="360" rx="28" ry="36"/>
      <path d="M160 396 Q155 430 170 460"/>
      <ellipse cx="720" cy="340" rx="26" ry="34"/>
      <path d="M720 374 Q725 410 710 450"/>
      <ellipse cx="120" cy="420" rx="20" ry="26"/>
      <path d="M120 446 Q118 470 130 490"/>
      <!-- ringmaster hat -->
      <ellipse cx="425" cy="820" rx="70" ry="12"/>
      <path d="M390 820 L400 760 L450 760 L460 820"/>
      <path d="M380 760 L470 760"/>
      <ellipse cx="425" cy="760" rx="50" ry="10"/>
      <text x="425" y="920" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">Under the big top!</text>
    `,
  },
  {
    slug: "hatchery-egg",
    title: "Hatchery Egg",
    art: `
      <!-- nest -->
      <ellipse cx="425" cy="720" rx="220" ry="60"/>
      <path d="M220 700 Q280 640 340 700 Q380 660 425 710 Q470 660 510 700 Q570 640 630 700" stroke-width="2"/>
      <path d="M250 730 Q320 690 400 740 Q450 700 520 735 Q580 700 620 730" stroke-width="1.8"/>
      <!-- egg -->
      <ellipse cx="425" cy="520" rx="110" ry="150"/>
      <path d="M370 450 Q425 420 480 450" stroke-width="1.8"/>
      <path d="M355 520 Q425 490 495 520" stroke-width="1.8"/>
      <path d="M365 590 Q425 560 485 590" stroke-width="1.8"/>
      <!-- cute face peek -->
      <circle cx="400" cy="500" r="8" fill="#111" stroke="none"/>
      <circle cx="450" cy="500" r="8" fill="#111" stroke="none"/>
      <path d="M410 535 Q425 548 440 535"/>
      <!-- leaves -->
      <path d="M260 680 Q220 620 280 640 Q250 680 260 680"/>
      <path d="M590 680 Q630 620 570 640 Q600 680 590 680"/>
      <!-- sparkles -->
      <path d="M280 360 L288 380 L308 388 L288 396 L280 416 L272 396 L252 388 L272 380 Z" stroke-width="2"/>
      <path d="M580 300 L586 318 L604 324 L586 330 L580 348 L574 330 L556 324 L574 318 Z" stroke-width="2"/>
      <circle cx="320" cy="300" r="6"/>
      <circle cx="540" cy="280" r="5"/>
      <text x="425" y="880" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">Soon to hatch…</text>
    `,
  },
  {
    slug: "riftling-friends",
    title: "Riftling Friends",
    art: `
      <!-- sun -->
      <circle cx="680" cy="220" r="50"/>
      <path d="M680 150 V130 M740 180 L755 165 M760 220 H780 M740 260 L755 275 M680 290 V310 M620 260 L605 275 M600 220 H580 M620 180 L605 165" stroke-width="2"/>
      <!-- left critter (round) -->
      <ellipse cx="250" cy="560" rx="90" ry="100"/>
      <circle cx="220" cy="540" r="12"/>
      <circle cx="280" cy="540" r="12"/>
      <circle cx="220" cy="540" r="4" fill="#111" stroke="none"/>
      <circle cx="280" cy="540" r="4" fill="#111" stroke="none"/>
      <path d="M230 590 Q250 610 270 590"/>
      <path d="M190 480 Q170 430 220 470"/>
      <path d="M310 480 Q330 430 280 470"/>
      <ellipse cx="210" cy="650" rx="28" ry="18"/>
      <ellipse cx="290" cy="650" rx="28" ry="18"/>
      <!-- middle Spark-like -->
      <ellipse cx="425" cy="540" rx="85" ry="95"/>
      <circle cx="400" cy="520" r="11"/>
      <circle cx="450" cy="520" r="11"/>
      <circle cx="400" cy="520" r="4" fill="#111" stroke="none"/>
      <circle cx="450" cy="520" r="4" fill="#111" stroke="none"/>
      <path d="M405 560 Q425 580 445 560"/>
      <path d="M370 470 Q355 420 400 455"/>
      <path d="M480 470 Q495 420 450 455"/>
      <ellipse cx="390" cy="630" rx="26" ry="16"/>
      <ellipse cx="460" cy="630" rx="26" ry="16"/>
      <!-- right tall critter -->
      <ellipse cx="600" cy="550" rx="70" ry="110"/>
      <circle cx="575" cy="510" r="10"/>
      <circle cx="625" cy="510" r="10"/>
      <circle cx="575" cy="510" r="3.5" fill="#111" stroke="none"/>
      <circle cx="625" cy="510" r="3.5" fill="#111" stroke="none"/>
      <path d="M580 555 Q600 575 620 555"/>
      <path d="M560 440 Q540 390 580 430"/>
      <path d="M640 440 Q660 390 620 430"/>
      <path d="M600 660 Q600 720 600 740" stroke-width="2"/>
      <ellipse cx="600" cy="750" rx="40" ry="14"/>
      <!-- ground -->
      <ellipse cx="425" cy="780" rx="280" ry="30" stroke-width="2"/>
      <path d="M140 760 Q200 740 260 760" stroke-width="1.5"/>
      <path d="M560 760 Q620 740 700 760" stroke-width="1.5"/>
      <text x="425" y="880" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">Friends of the Riftwilds</text>
    `,
  },
  {
    slug: "elara-venn",
    title: "Elara Venn",
    art: `
      <!-- ground -->
      <ellipse cx="425" cy="820" rx="180" ry="28" stroke-width="2"/>
      <!-- boots -->
      <path d="M370 780 L360 820 L400 820 L395 780 Z"/>
      <path d="M455 780 L450 820 L490 820 L480 780 Z"/>
      <!-- legs / tunic -->
      <path d="M380 620 L370 780 L480 780 L470 620 Z"/>
      <path d="M360 620 Q425 660 490 620 L480 700 L370 700 Z" stroke-width="2"/>
      <!-- belt -->
      <path d="M375 700 L475 700"/>
      <rect x="410" y="690" width="30" height="20" rx="3"/>
      <!-- torso / cloak -->
      <path d="M350 480 Q425 450 500 480 L490 620 L360 620 Z"/>
      <path d="M340 500 Q300 560 330 640" stroke-width="2"/>
      <path d="M510 500 Q550 560 520 640" stroke-width="2"/>
      <!-- arms -->
      <path d="M360 520 Q300 560 320 620"/>
      <path d="M490 520 Q550 560 530 620"/>
      <circle cx="315" cy="630" r="14"/>
      <circle cx="535" cy="630" r="14"/>
      <!-- satchel -->
      <path d="M460 640 Q520 650 510 720 Q470 740 450 700 Z"/>
      <path d="M455 640 Q440 600 460 580"/>
      <!-- head -->
      <circle cx="425" cy="400" r="70"/>
      <!-- hair -->
      <path d="M360 390 Q355 320 425 300 Q495 320 490 390 Q470 340 425 335 Q380 340 360 390"/>
      <path d="M355 420 Q340 480 360 520" stroke-width="2"/>
      <path d="M495 420 Q510 480 490 520" stroke-width="2"/>
      <!-- face -->
      <circle cx="400" cy="400" r="6" fill="#111" stroke="none"/>
      <circle cx="450" cy="400" r="6" fill="#111" stroke="none"/>
      <path d="M405 435 Q425 452 445 435"/>
      <path d="M390 385 Q400 378 410 385" stroke-width="1.5"/>
      <path d="M440 385 Q450 378 460 385" stroke-width="1.5"/>
      <!-- staff -->
      <path d="M200 820 L280 300"/>
      <circle cx="285" cy="280" r="22"/>
      <path d="M285 258 L285 240 M305 270 L320 255 M305 295 L320 310 M265 270 L250 255 M265 295 L250 310" stroke-width="1.5"/>
      <text x="425" y="920" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">Guide of the Commons</text>
    `,
  },
  {
    slug: "gateway-stones",
    title: "Gateway Stones",
    art: `
      <!-- ground arc -->
      <path d="M80 780 Q425 860 770 780" stroke-width="2.5"/>
      <path d="M100 820 Q425 900 750 820" stroke-width="1.8"/>
      <!-- five standing stones -->
      <path d="M140 780 L160 420 L220 420 L240 780 Z"/>
      <path d="M260 790 L285 480 L345 480 L360 790 Z"/>
      <path d="M390 800 L415 380 L485 380 L510 800 Z"/>
      <path d="M530 790 L555 470 L615 470 L640 790 Z"/>
      <path d="M650 780 L675 430 L735 430 L760 780 Z"/>
      <!-- carved swirls -->
      <path d="M175 520 Q190 500 205 520" stroke-width="1.8"/>
      <path d="M300 560 Q315 540 330 560" stroke-width="1.8"/>
      <path d="M435 500 Q450 470 465 500" stroke-width="1.8"/>
      <path d="M570 550 Q585 530 600 550" stroke-width="1.8"/>
      <path d="M690 520 Q705 500 720 520" stroke-width="1.8"/>
      <!-- glow rings (line art) -->
      <ellipse cx="450" cy="400" rx="50" ry="18" stroke-width="1.8"/>
      <ellipse cx="450" cy="400" rx="30" ry="10" stroke-width="1.5"/>
      <!-- stars -->
      <circle cx="200" cy="220" r="4" fill="#111" stroke="none"/>
      <circle cx="320" cy="180" r="3" fill="#111" stroke="none"/>
      <circle cx="500" cy="200" r="4" fill="#111" stroke="none"/>
      <circle cx="650" cy="170" r="3" fill="#111" stroke="none"/>
      <circle cx="720" cy="250" r="3.5" fill="#111" stroke="none"/>
      <path d="M425 160 L433 180 L453 186 L433 192 L425 212 L417 192 L397 186 L417 180 Z" stroke-width="2"/>
      <text x="425" y="960" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">Five stones, one welcome song</text>
    `,
  },
  {
    slug: "elderwood-path",
    title: "Elderwood Path",
    art: `
      <!-- path -->
      <path d="M300 820 Q360 600 400 400 Q430 280 450 200" stroke-width="3"/>
      <path d="M550 820 Q490 600 470 400 Q455 280 450 200" stroke-width="3"/>
      <path d="M320 700 Q425 720 530 700" stroke-width="1.5"/>
      <path d="M350 560 Q425 580 500 560" stroke-width="1.5"/>
      <!-- left trees -->
      <path d="M180 820 L200 420"/>
      <path d="M200 450 Q120 380 160 300 Q220 340 200 450"/>
      <path d="M200 480 Q100 420 140 320 Q230 380 200 480"/>
      <path d="M120 820 L140 500"/>
      <path d="M140 520 Q60 460 100 380 Q180 440 140 520"/>
      <!-- right trees -->
      <path d="M680 820 L660 400"/>
      <path d="M660 430 Q740 360 700 280 Q640 330 660 430"/>
      <path d="M660 470 Q760 400 720 310 Q630 380 660 470"/>
      <path d="M740 820 L720 520"/>
      <path d="M720 540 Q800 480 760 400 Q690 460 720 540"/>
      <!-- bridge -->
      <path d="M360 640 Q425 600 490 640"/>
      <path d="M370 655 Q425 625 480 655"/>
      <path d="M380 640 L380 670"/>
      <path d="M470 640 L470 670"/>
      <!-- stream -->
      <path d="M200 680 Q320 700 360 655" stroke-width="1.8"/>
      <path d="M490 655 Q560 700 700 690" stroke-width="1.8"/>
      <!-- mushrooms -->
      <path d="M260 780 L260 800"/>
      <path d="M240 780 Q260 750 280 780 Z"/>
      <path d="M600 790 L600 810"/>
      <path d="M585 790 Q600 765 615 790 Z"/>
      <!-- birds -->
      <path d="M400 240 Q410 230 420 240" stroke-width="1.8"/>
      <path d="M480 220 Q490 210 500 220" stroke-width="1.8"/>
      <text x="425" y="940" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#222" stroke="none">A sunny path through Elderwood</text>
    `,
  },
];

/** Minimal one-page PDF embedding a RGB JPEG at letter size. */
function jpegToPdf(jpegBuf, imgW, imgH) {
  const pageW = 612; // letter points
  const pageH = 792;
  const objects = [];
  const add = (s) => {
    objects.push(s);
    return objects.length;
  };

  const jpegObj = add(null); // placeholder index
  const imgObjNum = 1;
  const contentObjNum = 2;
  const pageObjNum = 3;
  const pagesObjNum = 4;
  const catalogObjNum = 5;

  const imgDict =
    `${imgObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuf.length} >>\n` +
    `stream\n`;
  const contentStream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentDict =
    `${contentObjNum} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;
  const pageDict =
    `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
    `/Contents ${contentObjNum} 0 R /Resources << /XObject << /Im0 ${imgObjNum} 0 R >> >> >>\nendobj\n`;
  const pagesDict =
    `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [${pageObjNum} 0 R] /Count 1 >>\nendobj\n`;
  const catalogDict =
    `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`;

  // Build with correct offsets
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  const pushObj = (chunk) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += chunk;
  };

  offsets.push(Buffer.byteLength(pdf, "utf8"));
  const imgHead = Buffer.from(imgDict, "latin1");
  const imgTail = Buffer.from("\nendstream\nendobj\n", "latin1");
  // We'll assemble binary
  const parts = [];
  const enc = (s) => Buffer.from(s, "latin1");

  parts.push(enc("%PDF-1.4\n"));
  const off = [0];
  const mark = () => {
    off.push(parts.reduce((n, b) => n + b.length, 0));
  };

  mark();
  parts.push(imgHead, jpegBuf, imgTail);
  mark();
  parts.push(enc(contentDict));
  mark();
  parts.push(enc(pageDict));
  mark();
  parts.push(enc(pagesDict));
  mark();
  parts.push(enc(catalogDict));

  const bodyLen = parts.reduce((n, b) => n + b.length, 0);
  const xrefPos = bodyLen;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size 6 /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  parts.push(enc(xref));
  return Buffer.concat(parts);
}

async function writeColoringSheet({ slug, title, art }) {
  const svg = pageFrame(title, art);
  const svgPath = path.join(COLORING_DIR, `${slug}.svg`);
  const pngPath = path.join(COLORING_DIR, `${slug}.png`);
  const pdfPath = path.join(COLORING_DIR, `${slug}.pdf`);
  fs.writeFileSync(svgPath, svg, "utf8");

  await sharp(Buffer.from(svg))
    .resize(LETTER_W, LETTER_H)
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  const jpeg = await sharp(Buffer.from(svg))
    .resize(LETTER_W, LETTER_H)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
  const pdf = jpegToPdf(jpeg, LETTER_W, LETTER_H);
  fs.writeFileSync(pdfPath, pdf);
  console.log(`  coloring: ${slug}`);
}

function wallpaperSvg(theme) {
  const { id, sky, mid, ground, accents, title } = theme;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${DESK_W}" height="${DESK_H}" viewBox="0 0 ${DESK_W} ${DESK_H}">
  <defs>
    <linearGradient id="sky-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      ${sky}
    </linearGradient>
    <linearGradient id="mid-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      ${mid}
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#fff6d5" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#ffb84d" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ground-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      ${ground}
    </linearGradient>
    <filter id="soft-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky-${id})"/>
  <rect width="100%" height="100%" fill="url(#glow-${id})"/>
  ${accents}
  <rect y="620" width="100%" height="460" fill="url(#ground-${id})"/>
  <rect y="0" width="100%" height="100%" fill="url(#mid-${id})" opacity="0.22"/>
  <!-- brand whisper -->
  <text x="60" y="1020" font-family="Georgia, serif" font-size="28" fill="#e8d5b0" opacity="0.55">${title}</text>
  <text x="60" y="1050" font-family="Georgia, serif" font-size="16" fill="#c4a882" opacity="0.4">Riftwilds</text>
</svg>`;
}

const WALLPAPERS = [
  {
    id: "commons-plaza",
    title: "Commons Plaza",
    sky: `<stop offset="0%" stop-color="#1a2744"/><stop offset="45%" stop-color="#3d5a80"/><stop offset="100%" stop-color="#f0c27a"/>`,
    mid: `<stop offset="0%" stop-color="#3de7ff" stop-opacity="0.15"/><stop offset="100%" stop-color="#ffb84d" stop-opacity="0.1"/>`,
    ground: `<stop offset="0%" stop-color="#5a4632"/><stop offset="100%" stop-color="#2a1f14"/>`,
    accents: `
      <ellipse cx="960" cy="420" rx="220" ry="40" fill="#7ec8e3" opacity="0.35"/>
      <ellipse cx="960" cy="400" rx="140" ry="24" fill="#a8e6ff" opacity="0.4"/>
      <circle cx="960" cy="320" r="28" fill="#fff0c0" opacity="0.85"/>
      <path d="M820 700 Q960 560 1100 700" fill="#c4a882" opacity="0.5"/>
      <rect x="200" y="580" width="24" height="120" rx="4" fill="#d4b896" opacity="0.55"/>
      <rect x="1680" y="560" width="24" height="140" rx="4" fill="#d4b896" opacity="0.55"/>
      <path d="M0 720 Q480 640 960 700 Q1440 760 1920 680 L1920 1080 L0 1080 Z" fill="#3d3226" opacity="0.65"/>
      <circle cx="1480" cy="220" r="70" fill="#ffd27a" opacity="0.75"/>
    `,
  },
  {
    id: "spark-glow",
    title: "Spark Glow",
    sky: `<stop offset="0%" stop-color="#0a1228"/><stop offset="50%" stop-color="#1a3058"/><stop offset="100%" stop-color="#2a4a6e"/>`,
    mid: `<stop offset="0%" stop-color="#3de7ff" stop-opacity="0.35"/><stop offset="100%" stop-color="#ffb84d" stop-opacity="0.2"/>`,
    ground: `<stop offset="0%" stop-color="#1a2438"/><stop offset="100%" stop-color="#0a1018"/>`,
    accents: `
      <circle cx="960" cy="480" r="180" fill="#3de7ff" opacity="0.12" filter="url(#soft-spark-glow)"/>
      <ellipse cx="960" cy="500" rx="100" ry="115" fill="#b8d4ff" opacity="0.55"/>
      <ellipse cx="960" cy="470" rx="55" ry="40" fill="#ffffff" opacity="0.2"/>
      <circle cx="930" cy="455" r="10" fill="#0a1020"/>
      <circle cx="990" cy="455" r="10" fill="#0a1020"/>
      <path d="M900 400 Q880 340 930 395" fill="#b8d4ff" opacity="0.7"/>
      <path d="M1020 400 Q1040 340 990 395" fill="#b8d4ff" opacity="0.7"/>
      <circle cx="720" cy="300" r="6" fill="#fff6d5" opacity="0.9"/>
      <circle cx="1200" cy="260" r="5" fill="#3de7ff" opacity="0.9"/>
      <circle cx="1100" cy="380" r="4" fill="#ffb84d" opacity="0.85"/>
      <path d="M760 360 L780 400 L820 410 L780 420 L760 460 L740 420 L700 410 L740 400 Z" fill="#ffb84d" opacity="0.55"/>
    `,
  },
  {
    id: "riftling-meadow",
    title: "Riftling Meadow",
    sky: `<stop offset="0%" stop-color="#6eb5ff"/><stop offset="55%" stop-color="#b8e0ff"/><stop offset="100%" stop-color="#ffe8a8"/>`,
    mid: `<stop offset="0%" stop-color="#7dcea0" stop-opacity="0.2"/><stop offset="100%" stop-color="#f5c16c" stop-opacity="0.15"/>`,
    ground: `<stop offset="0%" stop-color="#4a8f5a"/><stop offset="100%" stop-color="#2d5a38"/>`,
    accents: `
      <ellipse cx="400" cy="720" rx="80" ry="90" fill="#e8c4a0" opacity="0.7"/>
      <ellipse cx="960" cy="700" rx="70" ry="80" fill="#b8d4ff" opacity="0.75"/>
      <ellipse cx="1400" cy="730" rx="75" ry="95" fill="#f0a878" opacity="0.7"/>
      <circle cx="1500" cy="180" r="90" fill="#fff2a8" opacity="0.9"/>
      <path d="M0 780 Q400 700 800 760 Q1200 820 1920 740 L1920 1080 L0 1080 Z" fill="#3d7a4a" opacity="0.8"/>
      <circle cx="500" cy="850" r="8" fill="#ff8fab" opacity="0.8"/>
      <circle cx="700" cy="900" r="6" fill="#ffd166" opacity="0.8"/>
      <circle cx="1100" cy="860" r="7" fill="#ff8fab" opacity="0.75"/>
    `,
  },
  {
    id: "circus-night",
    title: "Circus Night",
    sky: `<stop offset="0%" stop-color="#0d0818"/><stop offset="60%" stop-color="#2a1840"/><stop offset="100%" stop-color="#5a2a4a"/>`,
    mid: `<stop offset="0%" stop-color="#ff6b6b" stop-opacity="0.2"/><stop offset="100%" stop-color="#ffb84d" stop-opacity="0.15"/>`,
    ground: `<stop offset="0%" stop-color="#2a1a28"/><stop offset="100%" stop-color="#120810"/>`,
    accents: `
      <path d="M640 900 L960 280 L1280 900 Z" fill="#c44b4b" opacity="0.75"/>
      <path d="M960 280 L960 900" stroke="#ffd27a" stroke-width="4" opacity="0.6"/>
      <path d="M760 650 L1160 650" stroke="#ffd27a" stroke-width="3" opacity="0.45"/>
      <circle cx="400" cy="400" r="30" fill="#ff6b6b" opacity="0.7"/>
      <circle cx="1500" cy="360" r="28" fill="#3de7ff" opacity="0.65"/>
      <circle cx="300" cy="500" r="22" fill="#ffb84d" opacity="0.7"/>
      <path d="M400 430 Q395 500 410 560" stroke="#e8d5b0" stroke-width="2" fill="none" opacity="0.5"/>
      <circle cx="200" cy="200" r="3" fill="#fff" opacity="0.8"/>
      <circle cx="1600" cy="180" r="2.5" fill="#fff" opacity="0.7"/>
      <circle cx="1200" cy="140" r="2" fill="#fff" opacity="0.7"/>
      <ellipse cx="960" cy="920" rx="400" ry="40" fill="#1a1018" opacity="0.6"/>
    `,
  },
  {
    id: "festival-lanterns",
    title: "Festival Lanterns",
    sky: `<stop offset="0%" stop-color="#1a1030"/><stop offset="50%" stop-color="#3d2060"/><stop offset="100%" stop-color="#8b4518"/>`,
    mid: `<stop offset="0%" stop-color="#ffb84d" stop-opacity="0.25"/><stop offset="100%" stop-color="#ff6b9d" stop-opacity="0.15"/>`,
    ground: `<stop offset="0%" stop-color="#3a2818"/><stop offset="100%" stop-color="#1a1008"/>`,
    accents: `
      <ellipse cx="400" cy="380" rx="36" ry="48" fill="#ffb84d" opacity="0.85"/>
      <ellipse cx="700" cy="320" rx="32" ry="44" fill="#ff8fab" opacity="0.8"/>
      <ellipse cx="1000" cy="360" rx="38" ry="50" fill="#3de7ff" opacity="0.75"/>
      <ellipse cx="1300" cy="300" rx="34" ry="46" fill="#ffd166" opacity="0.85"/>
      <ellipse cx="1600" cy="380" rx="30" ry="42" fill="#c77dff" opacity="0.8"/>
      <path d="M400 428 V700 M700 364 V680 M1000 410 V720 M1300 346 V660 M1600 422 V700" stroke="#e8d5b0" stroke-width="2" opacity="0.35"/>
      <path d="M0 800 Q480 720 960 780 Q1440 840 1920 760" fill="none" stroke="#ffb84d" stroke-width="3" opacity="0.3"/>
      <circle cx="250" cy="150" r="2" fill="#fff" opacity="0.7"/>
      <circle cx="900" cy="120" r="2.5" fill="#fff" opacity="0.8"/>
      <circle cx="1700" cy="160" r="2" fill="#fff" opacity="0.7"/>
    `,
  },
  {
    id: "lantern-street",
    title: "Night Lantern Street",
    sky: `<stop offset="0%" stop-color="#050810"/><stop offset="70%" stop-color="#121c30"/><stop offset="100%" stop-color="#2a2038"/>`,
    mid: `<stop offset="0%" stop-color="#ffb84d" stop-opacity="0.12"/><stop offset="100%" stop-color="#3de7ff" stop-opacity="0.08"/>`,
    ground: `<stop offset="0%" stop-color="#1a1520"/><stop offset="100%" stop-color="#0a0810"/>`,
    accents: `
      <path d="M0 650 L400 500 L400 1080 L0 1080 Z" fill="#1e2438" opacity="0.7"/>
      <path d="M1520 480 L1920 620 L1920 1080 L1520 1080 Z" fill="#1e2438" opacity="0.7"/>
      <rect x="480" y="420" width="180" height="400" fill="#243048" opacity="0.75"/>
      <rect x="720" y="380" width="160" height="440" fill="#2a3450" opacity="0.7"/>
      <rect x="980" y="400" width="200" height="420" fill="#243048" opacity="0.75"/>
      <rect x="1240" y="360" width="150" height="460" fill="#2a3450" opacity="0.7"/>
      <circle cx="560" cy="500" r="18" fill="#ffb84d" opacity="0.9"/>
      <circle cx="800" cy="460" r="16" fill="#ffd27a" opacity="0.85"/>
      <circle cx="1080" cy="480" r="18" fill="#ffb84d" opacity="0.9"/>
      <circle cx="1320" cy="440" r="15" fill="#3de7ff" opacity="0.7"/>
      <path d="M200 900 Q960 820 1720 900" fill="none" stroke="#c4a882" stroke-width="40" opacity="0.15"/>
      <ellipse cx="960" cy="200" rx="80" ry="80" fill="#e8e0d0" opacity="0.25"/>
    `,
  },
  {
    id: "rift-sky",
    title: "Rift Sky",
    sky: `<stop offset="0%" stop-color="#050018"/><stop offset="40%" stop-color="#1a0a40"/><stop offset="100%" stop-color="#0a2040"/>`,
    mid: `<stop offset="0%" stop-color="#7b5cff" stop-opacity="0.35"/><stop offset="50%" stop-color="#3de7ff" stop-opacity="0.25"/><stop offset="100%" stop-color="#ff6b9d" stop-opacity="0.2"/>`,
    ground: `<stop offset="0%" stop-color="#120820"/><stop offset="100%" stop-color="#050010"/>`,
    accents: `
      <path d="M600 0 Q900 400 700 1080" fill="none" stroke="#7b5cff" stroke-width="60" opacity="0.25" filter="url(#soft-rift-sky)"/>
      <path d="M1000 0 Q1100 500 1300 1080" fill="none" stroke="#3de7ff" stroke-width="40" opacity="0.3" filter="url(#soft-rift-sky)"/>
      <path d="M400 200 Q960 300 1500 180" fill="none" stroke="#ff6b9d" stroke-width="30" opacity="0.2" filter="url(#soft-rift-sky)"/>
      <circle cx="300" cy="180" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="500" cy="120" r="1.5" fill="#fff" opacity="0.8"/>
      <circle cx="800" cy="90" r="2.5" fill="#fff" opacity="0.9"/>
      <circle cx="1200" cy="140" r="2" fill="#fff" opacity="0.85"/>
      <circle cx="1600" cy="100" r="1.5" fill="#fff" opacity="0.8"/>
      <circle cx="1700" cy="220" r="2" fill="#3de7ff" opacity="0.9"/>
      <ellipse cx="960" cy="900" rx="600" ry="80" fill="#1a1040" opacity="0.5"/>
    `,
  },
  {
    id: "moonwater-harbor",
    title: "Moonwater Harbor",
    sky: `<stop offset="0%" stop-color="#0a1830"/><stop offset="50%" stop-color="#1a4060"/><stop offset="100%" stop-color="#4a7088"/>`,
    mid: `<stop offset="0%" stop-color="#7ec8e3" stop-opacity="0.2"/><stop offset="100%" stop-color="#c4a882" stop-opacity="0.1"/>`,
    ground: `<stop offset="0%" stop-color="#1a3048"/><stop offset="100%" stop-color="#0a1520"/>`,
    accents: `
      <ellipse cx="1400" cy="200" rx="100" ry="100" fill="#e8e8f0" opacity="0.55"/>
      <path d="M0 700 Q480 640 960 720 Q1440 800 1920 680 L1920 1080 L0 1080 Z" fill="#1a4058" opacity="0.75"/>
      <path d="M0 780 Q500 720 1000 800 Q1400 860 1920 760" fill="#2a6080" opacity="0.4"/>
      <rect x="300" y="560" width="18" height="160" fill="#8b6914" opacity="0.7"/>
      <path d="M318 560 L420 620 L318 640 Z" fill="#c4a882" opacity="0.65"/>
      <rect x="1200" y="540" width="16" height="180" fill="#8b6914" opacity="0.7"/>
      <path d="M1216 540 L1320 600 L1216 630 Z" fill="#d4b896" opacity="0.6"/>
      <ellipse cx="700" cy="820" rx="120" ry="20" fill="#0a2030" opacity="0.5"/>
      <path d="M640 820 Q700 780 760 820" fill="#c4a882" opacity="0.55"/>
    `,
  },
  {
    id: "elderwood-forest",
    title: "Elderwood Forest",
    sky: `<stop offset="0%" stop-color="#1a3020"/><stop offset="45%" stop-color="#3d6b4a"/><stop offset="100%" stop-color="#c4d878"/>`,
    mid: `<stop offset="0%" stop-color="#2d5a38" stop-opacity="0.25"/><stop offset="100%" stop-color="#ffb84d" stop-opacity="0.1"/>`,
    ground: `<stop offset="0%" stop-color="#2a4028"/><stop offset="100%" stop-color="#142018"/>`,
    accents: `
      <ellipse cx="280" cy="500" rx="140" ry="280" fill="#1a3a28" opacity="0.8"/>
      <ellipse cx="500" cy="480" rx="120" ry="260" fill="#244830" opacity="0.75"/>
      <ellipse cx="1400" cy="460" rx="150" ry="300" fill="#1a3a28" opacity="0.8"/>
      <ellipse cx="1650" cy="500" rx="130" ry="270" fill="#244830" opacity="0.75"/>
      <rect x="250" y="600" width="30" height="280" fill="#3d2814" opacity="0.7"/>
      <rect x="470" y="580" width="28" height="300" fill="#4a3018" opacity="0.7"/>
      <rect x="1370" y="560" width="32" height="320" fill="#3d2814" opacity="0.7"/>
      <rect x="1620" y="600" width="28" height="280" fill="#4a3018" opacity="0.7"/>
      <path d="M700 900 Q960 820 1220 900" fill="none" stroke="#c4a882" stroke-width="50" opacity="0.25"/>
      <circle cx="900" cy="300" r="40" fill="#fff2a8" opacity="0.35" filter="url(#soft-elderwood-forest)"/>
    `,
  },
  {
    id: "radiant-castle",
    title: "Radiant Castle",
    sky: `<stop offset="0%" stop-color="#1a1040"/><stop offset="50%" stop-color="#4a3080"/><stop offset="100%" stop-color="#f0a060"/>`,
    mid: `<stop offset="0%" stop-color="#ffd27a" stop-opacity="0.2"/><stop offset="100%" stop-color="#7b5cff" stop-opacity="0.15"/>`,
    ground: `<stop offset="0%" stop-color="#3a2a48"/><stop offset="100%" stop-color="#1a1020"/>`,
    accents: `
      <path d="M700 900 L700 400 L780 320 L860 400 L860 900 Z" fill="#e8d5b0" opacity="0.75"/>
      <path d="M860 900 L860 450 L960 350 L1060 450 L1060 900 Z" fill="#f0e0c0" opacity="0.8"/>
      <path d="M1060 900 L1060 420 L1140 340 L1220 420 L1220 900 Z" fill="#e8d5b0" opacity="0.75"/>
      <rect x="900" y="700" width="80" height="120" fill="#2a1840" opacity="0.6"/>
      <circle cx="1400" cy="220" r="80" fill="#ffb84d" opacity="0.7"/>
      <path d="M0 850 Q960 750 1920 850 L1920 1080 L0 1080 Z" fill="#2a2038" opacity="0.7"/>
      <circle cx="940" cy="520" r="8" fill="#3de7ff" opacity="0.8"/>
      <circle cx="980" cy="520" r="8" fill="#3de7ff" opacity="0.8"/>
    `,
  },
  {
    id: "homestead-dusk",
    title: "Homestead Dusk",
    sky: `<stop offset="0%" stop-color="#2a1840"/><stop offset="45%" stop-color="#8b4060"/><stop offset="100%" stop-color="#f0a060"/>`,
    mid: `<stop offset="0%" stop-color="#ffb84d" stop-opacity="0.2"/><stop offset="100%" stop-color="#ff6b6b" stop-opacity="0.1"/>`,
    ground: `<stop offset="0%" stop-color="#4a3828"/><stop offset="100%" stop-color="#2a1c14"/>`,
    accents: `
      <path d="M600 700 L780 520 L1100 520 L1280 700 Z" fill="#c4a082" opacity="0.8"/>
      <rect x="700" y="700" width="480" height="180" fill="#8b6914" opacity="0.75"/>
      <rect x="880" y="760" width="80" height="120" fill="#3d2814" opacity="0.7"/>
      <rect x="780" y="740" width="50" height="50" fill="#ffd27a" opacity="0.55"/>
      <rect x="1040" y="740" width="50" height="50" fill="#ffd27a" opacity="0.5"/>
      <circle cx="1500" cy="280" r="70" fill="#ff8c5a" opacity="0.75"/>
      <ellipse cx="400" cy="780" rx="60" ry="100" fill="#2d5a38" opacity="0.6"/>
      <ellipse cx="1500" cy="800" rx="80" ry="120" fill="#2d5a38" opacity="0.55"/>
      <path d="M0 880 Q960 820 1920 880 L1920 1080 L0 1080 Z" fill="#3a2818" opacity="0.7"/>
    `,
  },
  {
    id: "stormspire",
    title: "Stormspire Peaks",
    sky: `<stop offset="0%" stop-color="#0a1020"/><stop offset="40%" stop-color="#1a2848"/><stop offset="100%" stop-color="#4a6080"/>`,
    mid: `<stop offset="0%" stop-color="#3de7ff" stop-opacity="0.2"/><stop offset="100%" stop-color="#7b5cff" stop-opacity="0.15"/>`,
    ground: `<stop offset="0%" stop-color="#2a3040"/><stop offset="100%" stop-color="#101418"/>`,
    accents: `
      <path d="M200 900 L500 300 L800 900 Z" fill="#3a4860" opacity="0.85"/>
      <path d="M700 900 L1100 200 L1500 900 Z" fill="#2a3850" opacity="0.9"/>
      <path d="M1200 900 L1550 400 L1900 900 Z" fill="#3a4860" opacity="0.8"/>
      <path d="M1050 280 L1120 200 L1180 300" fill="none" stroke="#3de7ff" stroke-width="4" opacity="0.7"/>
      <path d="M400 400 L460 320 L500 420" fill="none" stroke="#a8e6ff" stroke-width="3" opacity="0.5"/>
      <circle cx="300" cy="180" r="2" fill="#fff" opacity="0.6"/>
      <circle cx="1600" cy="150" r="2" fill="#fff" opacity="0.5"/>
      <ellipse cx="1100" cy="250" rx="40" ry="20" fill="#e8e8f0" opacity="0.4"/>
    `,
  },
  {
    id: "keeper-academy",
    title: "Keeper Academy",
    sky: `<stop offset="0%" stop-color="#1a2744"/><stop offset="55%" stop-color="#3d5a80"/><stop offset="100%" stop-color="#e8c4a0"/>`,
    mid: `<stop offset="0%" stop-color="#c4a882" stop-opacity="0.15"/><stop offset="100%" stop-color="#3de7ff" stop-opacity="0.1"/>`,
    ground: `<stop offset="0%" stop-color="#4a3a28"/><stop offset="100%" stop-color="#2a2014"/>`,
    accents: `
      <rect x="560" y="360" width="800" height="420" fill="#d4c4a8" opacity="0.8"/>
      <path d="M520 360 L960 180 L1400 360 Z" fill="#c4a882" opacity="0.85"/>
      <rect x="900" y="560" width="120" height="220" fill="#3d2814" opacity="0.65"/>
      <circle cx="960" cy="280" r="36" fill="#3de7ff" opacity="0.45"/>
      <rect x="640" y="440" width="70" height="90" fill="#1a2744" opacity="0.5"/>
      <rect x="780" y="440" width="70" height="90" fill="#1a2744" opacity="0.5"/>
      <rect x="1070" y="440" width="70" height="90" fill="#1a2744" opacity="0.5"/>
      <rect x="1210" y="440" width="70" height="90" fill="#1a2744" opacity="0.5"/>
      <path d="M0 820 Q960 760 1920 820 L1920 1080 L0 1080 Z" fill="#3a3020" opacity="0.7"/>
      <circle cx="1600" cy="220" r="60" fill="#ffd27a" opacity="0.65"/>
    `,
  },
  {
    id: "fountain-square",
    title: "Fountain Square",
    sky: `<stop offset="0%" stop-color="#2a4060"/><stop offset="50%" stop-color="#6a9cbc"/><stop offset="100%" stop-color="#f5d0a0"/>`,
    mid: `<stop offset="0%" stop-color="#7ec8e3" stop-opacity="0.25"/><stop offset="100%" stop-color="#ffb84d" stop-opacity="0.12"/>`,
    ground: `<stop offset="0%" stop-color="#8b7a60"/><stop offset="100%" stop-color="#5a4a38"/>`,
    accents: `
      <ellipse cx="960" cy="720" rx="280" ry="50" fill="#5a8a9a" opacity="0.55"/>
      <ellipse cx="960" cy="680" rx="180" ry="30" fill="#7ec8e3" opacity="0.5"/>
      <rect x="880" y="520" width="160" height="160" rx="8" fill="#d4c4a8" opacity="0.75"/>
      <ellipse cx="960" cy="520" rx="100" ry="20" fill="#e8d5b0" opacity="0.8"/>
      <circle cx="960" cy="420" r="36" fill="#a8e6ff" opacity="0.7"/>
      <path d="M960 384 Q940 340 960 300 Q980 340 960 384" fill="#7ec8e3" opacity="0.8"/>
      <circle cx="960" cy="280" r="12" fill="#fff6d5" opacity="0.9"/>
      <path d="M200 900 Q960 820 1720 900" fill="none" stroke="#c4a882" stroke-width="80" opacity="0.2"/>
      <circle cx="400" cy="200" r="50" fill="#ffd27a" opacity="0.55"/>
    `,
  },
  {
    id: "cosmic-aurora",
    title: "Cosmic Rift Aurora",
    sky: `<stop offset="0%" stop-color="#020010"/><stop offset="35%" stop-color="#0a1838"/><stop offset="100%" stop-color="#1a0a30"/>`,
    mid: `<stop offset="0%" stop-color="#3de7ff" stop-opacity="0.3"/><stop offset="40%" stop-color="#7b5cff" stop-opacity="0.35"/><stop offset="100%" stop-color="#ff6b9d" stop-opacity="0.25"/>`,
    ground: `<stop offset="0%" stop-color="#0a1020"/><stop offset="100%" stop-color="#020008"/>`,
    accents: `
      <path d="M0 400 Q400 200 800 450 Q1200 700 1920 300" fill="none" stroke="#3de7ff" stroke-width="50" opacity="0.35" filter="url(#soft-cosmic-aurora)"/>
      <path d="M0 500 Q500 300 900 520 Q1400 750 1920 400" fill="none" stroke="#7b5cff" stroke-width="40" opacity="0.4" filter="url(#soft-cosmic-aurora)"/>
      <path d="M0 600 Q600 400 1000 580 Q1500 780 1920 500" fill="none" stroke="#ff6b9d" stroke-width="35" opacity="0.3" filter="url(#soft-cosmic-aurora)"/>
      <circle cx="200" cy="120" r="2" fill="#fff" opacity="0.95"/>
      <circle cx="450" cy="80" r="1.5" fill="#fff" opacity="0.85"/>
      <circle cx="700" cy="150" r="2.5" fill="#fff" opacity="0.9"/>
      <circle cx="1100" cy="60" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="1400" cy="130" r="1.5" fill="#3de7ff" opacity="0.95"/>
      <circle cx="1700" cy="90" r="2" fill="#fff" opacity="0.85"/>
      <circle cx="960" cy="200" r="60" fill="#fff6d5" opacity="0.15" filter="url(#soft-cosmic-aurora)"/>
      <ellipse cx="960" cy="950" rx="700" ry="60" fill="#1a1040" opacity="0.45"/>
    `,
  },
];

async function writeWallpaper(theme) {
  // Fix filter ids to match theme id
  let svg = wallpaperSvg(theme);
  // filters referenced as soft-${id} — already correct in accents for some; normalize
  svg = svg.replace(/filter="url\(#soft-[^)]+\)"/g, `filter="url(#soft-${theme.id})"`);
  const pngPath = path.join(WALLPAPER_DIR, `${theme.id}.png`);
  const svgPath = path.join(WALLPAPER_DIR, `${theme.id}.svg`);
  fs.writeFileSync(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg))
    .resize(DESK_W, DESK_H)
    .png({ compressionLevel: 8 })
    .toFile(pngPath);
  console.log(`  wallpaper: ${theme.id}`);
}

async function main() {
  ensureDir(COLORING_DIR);
  ensureDir(WALLPAPER_DIR);
  console.log("Generating coloring sheets…");
  for (const sheet of COLORING) {
    await writeColoringSheet(sheet);
  }
  console.log("Generating wallpapers…");
  for (const wp of WALLPAPERS) {
    await writeWallpaper(wp);
  }
  console.log(`Done. ${COLORING.length} coloring + ${WALLPAPERS.length} wallpapers.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
