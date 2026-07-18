import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const script = path.join(root, "scripts/audio/elevenlabs-narrate.mjs");

describe("assets:narrate dry-run", () => {
  it("exits 0 without API key and writes pending comic manifest", () => {
    expect(fs.existsSync(script)).toBe(true);
    const r = spawnSync(process.execPath, [script, "--comics", "--issue=the-first-rift", "--dry-run"], {
      encoding: "utf8",
      cwd: root,
      env: { ...process.env, ELEVENLABS_API_KEY: "" },
      timeout: 120_000,
    });
    expect(r.status, r.stderr || r.stdout).toBe(0);
    expect(r.stdout).toMatch(/dryRun=true/);
    const manifestPath = path.join(root, "public/assets/audio/comics/MANIFEST.json");
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(manifest.version).toBe(1);
    expect(manifest.provider).toBe("none");
    const issue = manifest.issues.find((i: { slug: string }) => i.slug === "the-first-rift");
    expect(issue).toBeTruthy();
    expect(issue.pages.length).toBeGreaterThan(0);
    expect(issue.pages.every((p: { status: string }) => p.status === "skipped")).toBe(true);
  });
});
