/**
 * Thin wrapper — emits Issue #5 content via Python script author.
 *   node scripts/comics/issue-004/write-full-script.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const py = spawnSync("python", [path.join(ROOT, "scripts/comics/issue-005/emit_issue_005.py")], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});
process.exit(py.status ?? 1);
