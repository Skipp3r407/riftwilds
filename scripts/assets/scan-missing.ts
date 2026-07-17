import path from "node:path";
import fs from "node:fs";
import {
  buildExpectedAssets,
  missingAssets,
  summarizeAssets,
  writeManifestFiles,
  type AssetCategory,
} from "../../src/lib/assets/asset-manifest";

const ROOT = path.resolve(__dirname, "../..");

function main() {
  const category = (process.argv[2] as AssetCategory | undefined) ?? undefined;
  const assets = buildExpectedAssets(ROOT).filter((a) =>
    category ? a.category === category : true,
  );
  const missing = missingAssets(assets);
  const byStatus = summarizeAssets(assets);
  const doc = writeManifestFiles(ROOT);

  const reportDir = path.join(ROOT, "artifacts/assets/reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const report = {
    scannedAt: new Date().toISOString(),
    category: category ?? "all",
    totals: byStatus,
    countsByCategory: doc.counts,
    missingCount: missing.length,
    missing: missing.map((m) => ({
      id: m.id,
      category: m.category,
      path: m.publicPath,
      priority: m.priority,
      label: m.label,
    })),
  };
  fs.writeFileSync(path.join(reportDir, "scan-latest.json"), JSON.stringify(report, null, 2));
  const md = [
    `# Asset scan report`,
    ``,
    `- Scanned: ${report.scannedAt}`,
    `- Category: ${report.category}`,
    `- Generated: ${byStatus.generated}`,
    `- Pending: ${byStatus.pending}`,
    `- Legacy: ${byStatus.legacy}`,
    `- Failed: ${byStatus.failed}`,
    `- Missing (actionable): ${missing.length}`,
    ``,
    `## Missing (priority order)`,
    ``,
    ...missing
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 80)
      .map((m) => `- P${m.priority} \`${m.id}\` → ${m.publicPath}`),
    missing.length > 80 ? `\n…and ${missing.length - 80} more` : "",
  ].join("\n");
  fs.writeFileSync(path.join(reportDir, "scan-latest.md"), md);

  console.log(md);
  console.log(`\nWrote public/assets/asset-manifest.json and artifacts/assets/reports/scan-latest.*`);
}

main();
