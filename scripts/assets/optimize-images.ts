import path from "node:path";
import { optimizeTree } from "../../src/lib/assets/image-optimizer";

const ROOT = path.resolve(__dirname, "../..");

async function main() {
  const rel = process.argv[2] ?? "public/assets/worlds";
  const dir = path.resolve(ROOT, rel);
  const maxEdge = process.argv.includes("--max-edge")
    ? Number(process.argv[process.argv.indexOf("--max-edge") + 1])
    : 2048;
  console.log(`Optimizing PNGs under ${dir} (maxEdge=${maxEdge})…`);
  const results = await optimizeTree(dir, { maxEdge });
  let saved = 0;
  for (const r of results) {
    saved += Math.max(0, r.beforeBytes - r.afterBytes);
  }
  console.log(`Optimized ${results.length} files, saved ~${Math.round(saved / 1024)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
