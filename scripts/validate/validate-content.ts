import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { validateGameContent } from "../../src/lib/content/validate";

const report = validateGameContent();
const outDir = path.join(process.cwd(), "artifacts", "reports");
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "content-validation.json"), JSON.stringify(report, null, 2));

const md = [
  "# Content Validation",
  "",
  `Checked: ${report.checkedAt}`,
  `Status: ${report.ok ? "OK" : "FAILED"}`,
  "",
  "## Stats",
  ...Object.entries(report.stats).map(([k, v]) => `- ${k}: ${v}`),
  "",
  "## Issues",
  ...(report.issues.length
    ? report.issues.map((i) => `- **${i.severity}** \`${i.code}\`: ${i.message}`)
    : ["- None"]),
  "",
].join("\n");
writeFileSync(path.join(outDir, "content-validation.md"), md);
console.log(md);
process.exit(report.ok ? 0 : 1);
