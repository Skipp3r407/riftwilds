import path from "node:path";
import { runGenerateBatch } from "../../src/lib/assets/image-generator";
import type { AssetCategory } from "../../src/lib/assets/asset-manifest";

const ROOT = path.resolve(__dirname, "../..");

async function main() {
  const categoryArg = process.argv[2] as AssetCategory | "all" | undefined;
  const category = categoryArg && categoryArg !== "all" ? categoryArg : "all";
  const limitIdx = process.argv.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(process.argv[limitIdx + 1]) : undefined;
  const maxPriorityIdx = process.argv.indexOf("--max-priority");
  const maxPriority =
    maxPriorityIdx >= 0 ? Number(process.argv[maxPriorityIdx + 1]) : undefined;
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");

  const result = await runGenerateBatch({
    projectRoot: ROOT,
    category,
    limit: Number.isFinite(limit) ? limit : undefined,
    maxPriority: Number.isFinite(maxPriority) ? maxPriority : undefined,
    dryRun,
    force,
  });

  console.log(`Provider: ${result.provider}`);
  console.log(`Jobs: ${result.jobs.length}`);
  if (result.batchPaths) {
    console.log(`Batch JSONL: ${result.batchPaths.jobsPath}`);
    console.log(`Batch MD: ${result.batchPaths.mdPath}`);
  }
  const pending = result.results.filter((r) => r.status === "pending_manual").length;
  const generated = result.results.filter((r) => r.status === "generated").length;
  const failed = result.results.filter((r) => r.status === "failed").length;
  console.log(`Results: generated=${generated} pending_manual=${pending} failed=${failed}`);
  if (result.provider === "cursor-local") {
    console.log(
      "\nNext: use Cursor GenerateImage for each prompt in the batch MD, copy PNGs into public/, then npm run assets:scan",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
