import path from "node:path";
import fs from "node:fs";
import { buildExpectedAssets } from "../../src/lib/assets/asset-manifest";
import { validateAssetRecords } from "../../src/lib/assets/image-validator";

const ROOT = path.resolve(__dirname, "../..");

async function main() {
  const strict = process.argv.includes("--strict");
  const assets = buildExpectedAssets(ROOT);
  const toCheck = strict
    ? assets
    : assets.filter((a) => a.status === "generated" || a.status === "legacy");
  const report = await validateAssetRecords(toCheck, ROOT);
  const outDir = path.join(ROOT, "artifacts/assets/reports");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "validate-latest.json"), JSON.stringify(report, null, 2));

  console.log(`Checked: ${report.checked}`);
  console.log(`OK: ${report.ok}`);
  console.log(`Missing: ${report.missing}`);
  console.log(`Issues: ${report.issues.length}`);
  for (const issue of report.issues.slice(0, 40)) {
    console.log(`  [${issue.severity}] ${issue.code} ${issue.id}: ${issue.message}`);
  }
  if (report.issues.some((i) => i.severity === "error")) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
