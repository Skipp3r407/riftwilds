import path from "node:path";
import fs from "node:fs";
import { writeManifestFiles, missingAssets, buildExpectedAssets } from "../../src/lib/assets/asset-manifest";

const ROOT = path.resolve(__dirname, "../..");

function main() {
  const doc = writeManifestFiles(ROOT);
  const missing = missingAssets(buildExpectedAssets(ROOT));
  const byCat: Record<string, { generated: number; pending: number }> = {};
  for (const a of doc.assets) {
    byCat[a.category] ??= { generated: 0, pending: 0 };
    if (a.status === "generated" || a.status === "legacy") byCat[a.category]!.generated++;
    else byCat[a.category]!.pending++;
  }

  const lines = [
    `# Riftwilds asset report`,
    ``,
    `- Generated at: ${doc.generatedAt}`,
    `- Provider: ${doc.provider}`,
    `- Totals: generated=${doc.byStatus.generated} pending=${doc.byStatus.pending} legacy=${doc.byStatus.legacy} failed=${doc.byStatus.failed}`,
    ``,
    `## By category`,
    ``,
    ...Object.entries(byCat).map(
      ([k, v]) => `- **${k}**: ${v.generated} present / ${v.pending} pending`,
    ),
    ``,
    `## Top pending (priority ≤ 2)`,
    ``,
    ...missing
      .filter((m) => m.priority <= 2)
      .slice(0, 60)
      .map((m) => `- P${m.priority} ${m.category} \`${m.publicPath}\``),
  ];

  const reportDir = path.join(ROOT, "artifacts/assets/reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const md = lines.join("\n");
  fs.writeFileSync(path.join(reportDir, "report-latest.md"), md);
  fs.writeFileSync(
    path.join(reportDir, "report-latest.json"),
    JSON.stringify({ ...doc, missingPriority: missing.filter((m) => m.priority <= 2).length }, null, 2),
  );
  console.log(md);
}

main();
