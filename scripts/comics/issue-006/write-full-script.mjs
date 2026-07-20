/**
 * Thin wrapper — emits Issue #6 content via Python script author.
 *   node scripts/comics/issue-006/write-full-script.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const py = spawnSync("python", [path.join(ROOT, "scripts/comics/issue-006/emit_issue_006.py")], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
});
process.exit(py.status ?? 1);
