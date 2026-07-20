/**
 * Replace leftover bare "Cal" references with Mira after Eggwarden rename.
 *   node scripts/comics/issue-002/patch-cal-leftovers.mjs
 */
import fs from "node:fs";
import path from "node:path";

const file = path.resolve(import.meta.dirname, "write-full-script.mjs");
let s = fs.readFileSync(file, "utf8");

const reps = [
  [/Cal with cracked egg/g, "Mira with cracked pulse-egg"],
  [/Cal kneels/g, "Mira kneels"],
  [/Cal holds/g, "Mira holds"],
  [/Mira and Cal exchange/g, "Mira and Scholar Len exchange"],
  [/Cal packs/g, "Mira packs"],
  [/Mira hands a lantern charm/g, "she checks her Compact lantern charm"],
  [/Cal leads/g, "Mira leads"],
  [/against Cal's chest/g, "against Mira's satchel"],
  [/Cal smiles/g, "Mira smiles"],
  [/Cal defends/g, "Mira defends"],
  [/Cal publicly/g, "Mira publicly"],
  [/Cal steps between/g, "Mira steps between"],
  [/Cal glances/g, "Mira glances"],
  [/Cal reaches/g, "Mira reaches"],
  [/Cal follows/g, "Mira follows"],
  [/Cal running/g, "Mira running"],
  [/Cal refuses/g, "Mira refuses"],
  [/Cal plants/g, "Mira plants"],
  [/Cal knocked/g, "Mira knocked"],
  [/beside Cal/g, "beside Mira"],
  [/Cal does not/g, "Mira does not"],
  [/Cal shields/g, "Mira shields"],
  [/Cal and companions/g, "Mira and companions"],
  [/Cal silhouette/g, "Mira silhouette"],
  [/prof-cal/g, "prof-mira"],
  [/against Cal/g, "against Mira"],
  [/Cal's approach/g, "Mira's approach"],
  [/Cal's group/g, "Mira's group"],
  [/Cal, breathless/g, "Mira, breathless"],
  [/with Cal/g, "with Mira"],
  [/Cal silhouette/g, "Mira silhouette"],
  [/prof-cal/g, "prof-mira"],
  [/Mira watches\./g, "scan light washes Spark's markings."],
];

for (const [a, b] of reps) s = s.replace(a, b);

// Cover main composition still says Keeper — ensure Mira
s = s.replace(/Keeper reaching toward Spark/g, "Mira Eggwarden reaching toward Spark");

fs.writeFileSync(file, s);
console.log({
  calLeft: (s.match(/\bCal\b/g) || []).length,
  mira: (s.match(/Mira Eggwarden/g) || []).length,
});
