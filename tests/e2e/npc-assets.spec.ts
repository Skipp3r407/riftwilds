import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "docs/testing/NPC_ASSET_MANIFEST.json");

test.describe("NPC assets", () => {
  test("manifest reports 54 named portraits", () => {
    expect(fs.existsSync(MANIFEST)).toBe(true);
    const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    expect(man.namedTotal).toBe(54);
    expect(man.stats.portrait).toBe(54);
  });

  test("Commons starter portraits exist on disk with real bytes", () => {
    const commons = [
      "rowan-vale",
      "elara-venn",
      "mira-shellbright",
      "bram-ironroot",
      "captain-orren",
    ];
    for (const slug of commons) {
      const p = path.join(
        ROOT,
        "public/assets/npcs/riftwild-commons",
        slug,
        "portrait.png",
      );
      expect(fs.existsSync(p), p).toBe(true);
      expect(fs.statSync(p).size).toBeGreaterThan(2000);
    }
  });
});
