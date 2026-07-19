import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const dir = path.join(ROOT, "src/content/pets/lore");
function get(src, k) {
  const m = src.match(new RegExp(`"${k}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "m"));
  return m ? m[1] : "";
}
const titles = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts") && x !== "index.ts")) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const t = get(src, "title");
  const slug = get(src, "slug") || f;
  (titles[t] ||= []).push(slug);
}
const dups = Object.entries(titles).filter(([, v]) => v.length > 1);
console.log("unique titles", Object.keys(titles).length);
console.log("duplicate title groups", dups.length);
for (const [t, slugs] of dups) console.log(`- ${t}: ${slugs.join(", ")}`);
