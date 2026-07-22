import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2] || "sparks-journey";
const issue = process.argv[3] || "issue-002";
const dir = path.join("content/comics", slug, issue, "pages");
const outDir = path.join("artifacts/comics/generated", slug);
fs.mkdirSync(outDir, { recursive: true });

const pages = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));

const roles = {};
const out = {};
for (const p of pages) {
  const r = p.role || p.bookRole || "?";
  roles[r] = (roles[r] || 0) + 1;
  out[p.pageNumber] = {
    role: r,
    layout: p.layout,
    beat: p.beat,
    title: p.title,
    artPrompt: p.artPrompt || p.grokPrompt || null,
    panelCount: (p.panels || []).length,
  };
  console.log(
    String(p.pageNumber).padStart(2),
    r.padEnd(14),
    (p.beat || p.title || "").slice(0, 70),
  );
}
console.log("roles", roles);
fs.writeFileSync(path.join(outDir, "PROMPTS.json"), JSON.stringify(out, null, 2));
console.log("wrote", path.join(outDir, "PROMPTS.json"));
