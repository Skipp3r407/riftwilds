import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const src = path.join(ROOT, "scripts/comics/issue-001/generate-and-letter.mjs");
const dest = path.join(ROOT, "scripts/comics/issue-003/generate-and-letter.mjs");
let t = fs.readFileSync(src, "utf8");
t = t.replaceAll("the-first-rift/issue-001", "the-traveling-circus/issue-003");
t = t.replaceAll("pages/the-first-rift", "pages/the-traveling-circus");
t = t.replaceAll("The First Rift Issue #1", "The Traveling Circus Issue #3");
t = t.replaceAll("issue-001", "issue-003");
t = t.replaceAll('"the-first-rift.webp"', '"03-traveling-circus.webp"');
t = t.replaceAll("the-first-rift.webp", "03-traveling-circus.webp");
// Remaining the-first-rift refs in comments/paths for covers folder name
t = t.replaceAll("the-first-rift", "the-traveling-circus");
fs.writeFileSync(dest, t);
console.log("wrote", dest);

const emitSrc = path.join(ROOT, "scripts/comics/issue-001/emit-generated.mjs");
const emitDest = path.join(ROOT, "scripts/comics/issue-003/emit-generated.mjs");
let e = fs.readFileSync(emitSrc, "utf8");
e = e.replaceAll("the-first-rift/issue-001", "the-traveling-circus/issue-003");
e = e.replaceAll("the-first-rift/issue-001.generated.ts", "the-traveling-circus/issue-003.generated.ts");
e = e.replaceAll("ISSUE_001", "ISSUE_003");
e = e.replaceAll("Issue001", "Issue003");
e = e.replaceAll("issue-001", "issue-003");
e = e.replaceAll('slug: "the-first-rift"', 'slug: "the-traveling-circus"');
e = e.replaceAll("/assets/comics/pages/the-first-rift/", "/assets/comics/pages/the-traveling-circus/");
e = e.replaceAll("/assets/comics/covers/the-first-rift.webp", "/assets/comics/covers/03-traveling-circus.webp");
e = e.replaceAll("the-first-rift-p", "the-traveling-circus-p");
e = e.replaceAll("The First Rift", "The Traveling Circus");
e = e.replaceAll("Cal Reed", "Mira Eggwarden");
e = e.replaceAll("cal-reed", "mira-eggwarden");
e = e.replaceAll("Mira Shellbright", "Mira Eggwarden");
e = e.replaceAll("Issue #1", "Issue #3");
e = e.replaceAll("sparks-journey", "the-lost-city");
e = e.replaceAll("rw-issue-1-badge", "rw-issue-3-badge");
fs.writeFileSync(emitDest, e);
console.log("wrote", emitDest);
