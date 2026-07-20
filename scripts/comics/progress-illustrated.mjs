/**
 * Track which issue page plates look like real art vs procedural stubs.
 * Heuristic: stub SVG→webp plates are ~15–40KB; illustrated plates are >>100KB.
 *
 *   node scripts/comics/progress-illustrated.mjs
 *   node scripts/comics/progress-illustrated.mjs the-first-rift
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PAGES = path.join(ROOT, "public/assets/comics/pages");
const STUB_MAX = 80_000; // bytes

const ISSUES = [
  { slug: "the-first-rift", pages: 40 },
  { slug: "sparks-journey", pages: 36 },
  { slug: "the-traveling-circus", pages: 37 },
  { slug: "the-lost-city", pages: 36 },
  { slug: "the-storm-king", pages: 37 },
  { slug: "the-merchants-secret", pages: 36 },
  { slug: "the-great-hunt", pages: 36 },
  { slug: "the-last-guardian", pages: 36 },
  { slug: "festival-of-lights", pages: 36 },
  { slug: "the-shadow-beyond", pages: 37 },
];

const filter = process.argv[2];
const list = filter ? ISSUES.filter((i) => i.slug === filter) : ISSUES;

for (const issue of list) {
  const dir = path.join(PAGES, issue.slug);
  let illustrated = 0;
  let stub = 0;
  let missing = 0;
  const missingPages = [];
  const stubPages = [];
  for (let i = 1; i <= issue.pages; i++) {
    const f = path.join(dir, `page-${String(i).padStart(2, "0")}.webp`);
    if (!fs.existsSync(f)) {
      missing += 1;
      missingPages.push(i);
      continue;
    }
    const size = fs.statSync(f).size;
    if (size >= STUB_MAX) illustrated += 1;
    else {
      stub += 1;
      stubPages.push(i);
    }
  }
  console.log(
    `${issue.slug}: ${illustrated}/${issue.pages} illustrated, ${stub} stub, ${missing} missing`,
  );
  if (stubPages.length && stubPages.length <= 20) {
    console.log(`  stubs: ${stubPages.join(", ")}`);
  } else if (stubPages.length) {
    console.log(`  stubs: ${stubPages.slice(0, 12).join(", ")}… (+${stubPages.length - 12})`);
  }
  if (missingPages.length) console.log(`  missing: ${missingPages.join(", ")}`);
}
