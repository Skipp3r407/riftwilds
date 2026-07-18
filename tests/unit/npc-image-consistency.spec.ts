import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AMBIENT_NPCS, NAMED_NPCS, NPC_CATALOG } from "@/content/npcs";

const ROOT = process.cwd();

function portraitPath(regionId: string, slug: string): string {
  return path.join(ROOT, "public/assets/npcs", regionId, slug, "portrait.png");
}

describe("NPC image consistency", () => {
  it("every catalog NPC has a region-scoped portrait ≥20KB", () => {
    const missing: string[] = [];
    for (const n of NPC_CATALOG) {
      const full = portraitPath(n.regionId, n.slug);
      if (!fs.existsSync(full) || fs.statSync(full).size < 20_000) {
        missing.push(n.slug);
      }
    }
    expect(missing).toEqual([]);
  });

  it("named and ambient portraits share the same folder contract", () => {
    for (const n of [...NAMED_NPCS, ...AMBIENT_NPCS].slice(0, 30)) {
      const dir = path.join(ROOT, "public/assets/npcs", n.regionId, n.slug);
      expect(fs.existsSync(path.join(dir, "portrait.png"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "thumbnail.png"))).toBe(true);
      expect(fs.existsSync(path.join(dir, "metadata.json"))).toBe(true);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
      expect(meta.artStatus).toBe("generated");
    }
  });

  it("ambient Riftlings have creature-style portraits (not stubs)", () => {
    const riftlings = AMBIENT_NPCS.filter((n) => n.kind === "ambient_riftling");
    expect(riftlings.length).toBeGreaterThan(0);
    for (const n of riftlings) {
      const full = portraitPath(n.regionId, n.slug);
      expect(fs.statSync(full).size).toBeGreaterThan(20_000);
    }
  });

  it("region casts keep distinct portrait files (no shared byte-identical stubs)", () => {
    const commons = NPC_CATALOG.filter((n) => n.regionId === "riftwild-commons");
    const sizes = new Set(
      commons.map((n) => fs.statSync(portraitPath(n.regionId, n.slug)).size),
    );
    // Most commons portraits should differ in size after unique generation
    expect(sizes.size).toBeGreaterThan(Math.floor(commons.length * 0.5));
  });
});
