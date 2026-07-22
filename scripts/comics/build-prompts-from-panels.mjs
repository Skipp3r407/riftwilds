/**
 * Build GenerateImage prompts from issue page panel descriptions.
 * node scripts/comics/build-prompts-from-panels.mjs sparks-journey issue-002
 */
import fs from "node:fs";
import path from "node:path";

const slug = process.argv[2];
const issue = process.argv[3];
const dir = path.join("content/comics", slug, issue, "pages");
const outDir = path.join("artifacts/comics/generated", slug);
fs.mkdirSync(outDir, { recursive: true });

const STYLE =
  "Western fantasy sequential COMIC BOOK PAGE, portrait 3:4, clear inked panel grid with white gutters and thick black borders when multi-panel. Characters drawn INSIDE panels only. NO floating portrait cards, NO collage insets, NO lore-plate overlays, NO encyclopedia UI. Painterly digital comic, earth greens/sandstone/timber first; cyan rift energy and amber lantern as accents only. NO purple AI-fantasy default. Leave clean empty corners for speech balloons. NO readable text, captions, logos, watermarks, page numbers, or UI painted into the art. Original Riftwilds IP.";

const pages = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));

const prompts = {};
for (const p of pages) {
  const role = p.bookRole || p.role || "story";
  const layout = p.layout?.type || p.layout || "narrative";
  const panelCount = p.layout?.panelCount || (p.panels || []).length || 1;
  const descs = (p.panels || [])
    .map((panel, i) => `Panel ${i + 1}: ${panel.description || panel.camera || ""}`)
    .filter((s) => s.length > 10)
    .join(" ");
  const beat = p.storyPurpose || p.beat || p.title || "";
  const prompt = `${STYLE} Issue page ${p.pageNumber} (${role}, ${layout}, ~${panelCount} panels). Story beat: ${beat}. Illustrate: ${descs || beat}. Mira Eggwarden is the hatchery mentor Keeper (not Cal Reed).`;
  prompts[p.pageNumber] = {
    role,
    layout,
    panelCount,
    title: p.title,
    beat,
    prompt,
  };
}

fs.writeFileSync(path.join(outDir, "GENERATE_PROMPTS.json"), JSON.stringify(prompts, null, 2));
console.log("wrote", Object.keys(prompts).length, "prompts →", path.join(outDir, "GENERATE_PROMPTS.json"));
for (const n of Object.keys(prompts)
  .map(Number)
  .sort((a, b) => a - b)
  .slice(0, 6)) {
  console.log("---", n, prompts[n].role);
  console.log(prompts[n].prompt.slice(0, 280));
}
