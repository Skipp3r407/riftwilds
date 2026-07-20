/**
 * Thin wrapper — emits Issue #4 content via Python script author.
 *   node scripts/comics/issue-004/write-full-script.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const py = spawnSync("python", [path.join(ROOT, "scripts/comics/issue-004/emit_issue_004.py")], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});
process.exit(py.status ?? 1);
