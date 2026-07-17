import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NAMED_NPCS } from "@/content/npcs";

const ROOT = process.cwd();

function assetExists(rel: string, minBytes = 5000): boolean {
  const full = path.join(ROOT, "public", rel.replace(/^\//, ""));
  if (!fs.existsSync(full)) return false;
  return fs.statSync(full).size >= minBytes;
}

describe("NPC assets", () => {
  it("every named NPC has a real portrait on disk", () => {
    const missing: string[] = [];
    for (const n of NAMED_NPCS) {
      const rel = n.portraitAsset.replace(/\?.*$/, "");
      if (!assetExists(rel)) missing.push(n.slug);
    }
    expect(missing).toEqual([]);
  });

  it("Commons starter cast has portrait + thumbnail + metadata", () => {
    const commons = NAMED_NPCS.filter((n) => n.regionId === "riftwild-commons");
    expect(commons.length).toBeGreaterThanOrEqual(10);
    for (const n of commons) {
      const dir = path.join(ROOT, "public/assets/npcs", n.regionId, n.slug);
      expect(fs.existsSync(path.join(dir, "portrait.png"))).toBe(true);
      expect(fs.statSync(path.join(dir, "portrait.png")).size).toBeGreaterThan(5000);
      expect(fs.existsSync(path.join(dir, "thumbnail.png"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "metadata.json"))).toBe(true);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
      expect(meta.slug).toBe(n.slug);
      expect(meta.artStatus).toBe("generated");
    }
  });

  it("no named NPC portrait is a 1x1 stub", () => {
    for (const n of NAMED_NPCS) {
      const full = path.join(
        ROOT,
        "public/assets/npcs",
        n.regionId,
        n.slug,
        "portrait.png",
      );
      expect(fs.statSync(full).size).toBeGreaterThan(5000);
    }
  });
});
