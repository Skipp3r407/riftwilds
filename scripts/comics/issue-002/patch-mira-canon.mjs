/**
 * One-shot: rewrite Issue #002 script writer from Cal Reed → Mira Eggwarden.
 * Run: node scripts/comics/issue-002/patch-mira-canon.mjs
 */
import fs from "node:fs";
import path from "node:path";

const file = path.resolve(import.meta.dirname, "write-full-script.mjs");
let s = fs.readFileSync(file, "utf8");

const pairs = [
  [/Cal Reed/g, "Mira Eggwarden"],
  [/cal-reed/g, "mira-eggwarden"],
  [/Mira Shellbright/g, "Mira Eggwarden"],
  [/mira-shellbright/g, "mira-eggwarden"],
  [/mud-stained torn-sleeve coat, cheek cut healing/g, "practical hatchery travel robes, egg-care satchel"],
  [/mud-stained travel coat, left sleeve torn/g, "practical hatchery travel coat over Compact robes"],
  [/\["small cheek cut", "scraped knuckles"\]/g, "[]"],
  [/torn-sleeve travel coat, cheek cut healing/g, "hatchery mentor portrait — Compact robes, soft braid, satchel"],
  [/despite cheek cut/g, "warmly"],
  [/torn sleeve flapping/g, "satchel bouncing"],
  [/Junior Keeper/g, "Hatchery mentor"],
  [/CAL REED — Hatchery mentor/g, "MIRA EGGWARDEN — Hatchery mentor"],
  [/CAL REED — Junior Keeper/g, "MIRA EGGWARDEN — Hatchery mentor"],
  [/Cal's party/g, "Mira's party"],
  [/Spark and Cal silhouettes/g, "Spark and Mira silhouettes"],
  [/Cal realizes/g, "Mira realizes"],
  [/opts\.characters \|\| \["mira-eggwarden"\]/g, 'opts.characters || ["mira-eggwarden"]'],
  [/characters: \["mira-eggwarden"\]/g, 'characters: ["mira-eggwarden"]'],
];

for (const [re, to] of pairs) s = s.replace(re, to);

// Default character in pageBase
s = s.replace(
  /characters: opts\.characters \|\| \["mira-eggwarden"\],/g,
  'characters: opts.characters || ["mira-eggwarden"],',
);
s = s.replace(
  /`Characters: \$\{\(opts\.characters \|\| \["mira-eggwarden"\]\)\.join/g,
  '`Characters: ${(opts.characters || ["mira-eggwarden"]).join',
);

// Characters.json cast — drop duplicate Shellbright entry if any, prefer Eggwarden
s = s.replace(
  /\{ id: "mira-eggwarden", name: "Mira Eggwarden", role: "Keeper protagonist" \},\s*\{ id: "mira-eggwarden", name: "Mira Eggwarden", role: "Hatchery mentor" \},/,
  '{ id: "mira-eggwarden", name: "Mira Eggwarden", role: "Keeper protagonist · Hatchery mentor" },',
);

// Fix page 3 double Mira speech — second becomes narration
s = s.replace(
  /balloon\(\s*"speech",\s*"Mira Eggwarden",\s*"I'm not going to grab you\. Invite only\.",\s*50,\s*25,\s*"down",\s*\{\s*maxWidthPct: 40,\s*\}\),\s*balloon\(\s*"speech",\s*"Mira Eggwarden",\s*"Good\. Compact starts at the first breath\.",\s*50,\s*75,\s*"up",\s*\{\s*maxWidthPct: 40,\s*\}\),/,
  `balloon("speech", "Mira Eggwarden", "I'm not going to grab you. Invite only.", 50, 25, "down", {
            maxWidthPct: 40,
          }),
          balloon("narration", null, "Compact starts at the first breath.", 50, 75, null),`,
);

// Continuity keeper block labels
s = s.replace(/keeper: \{\s*clothing:/g, "keeper: {\n          name: \"Mira Eggwarden\",\n          clothing:");

// Synopsis string
s = s.replace(
  /Junior Keeper Mira Eggwarden escorts/g,
  "Hatchery mentor Mira Eggwarden escorts",
);
s = s.replace(
  /The glyph-veined egg from The First Rift hatches into Spark[\s\S]*?Traveling Circus\./,
  "The pulse-egg under Mira Eggwarden's Compact care hatches into Spark, an unstable Glowpup-line Riftborn. Mira escorts Spark toward Shellward Sanctum while Veiled Meridian hunters try to capture Subject One. Spark flees fear, returns by choice, unlocks Prismatic Burst, and discovers it is one of several Riftborn — as the Meridian begins the collection at the Traveling Circus.",
);

fs.writeFileSync(file, s);
const mira = (s.match(/Mira Eggwarden/g) || []).length;
const cal = (s.match(/Cal Reed/g) || []).length;
const shell = (s.match(/Shellbright/g) || []).length;
console.log({ mira, calLeft: cal, shellbrightLeft: shell });
