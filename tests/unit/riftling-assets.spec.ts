import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STARTER_SPECIES } from "@/lib/assets/manifest";
import { creaturePortraitPath } from "@/lib/assets/paths";

const ROOT = process.cwd();

describe("Riftling / pet assets", () => {
  it("starter species portraits exist under /assets/pets", () => {
    const missing: string[] = [];
    for (const slug of STARTER_SPECIES) {
      const rel = creaturePortraitPath(slug).replace(/^\//, "");
      const full = path.join(ROOT, "public", rel);
      if (!fs.existsSync(full) || fs.statSync(full).size < 5_000) missing.push(slug);
    }
    expect(missing).toEqual([]);
  });

  it("plaza ambient Riftling portraits exist", () => {
    const slugs = [
      "riftling-plaza-emberkit",
      "riftling-hatchery-glowpup",
      "riftling-market-pouchling",
    ];
    for (const slug of slugs) {
      const full = path.join(
        ROOT,
        "public/assets/npcs/riftwild-commons",
        slug,
        "portrait.png",
      );
      expect(fs.existsSync(full), full).toBe(true);
      expect(fs.statSync(full).size).toBeGreaterThan(20_000);
    }
  });

  it("affinity icons exist for launch affinities", () => {
    const affinities = [
      "ember",
      "tide",
      "grove",
      "storm",
      "stone",
      "frost",
      "radiant",
      "void",
      "alloy",
      "spirit",
      "celestial",
    ];
    for (const a of affinities) {
      const candidates = [
        path.join(ROOT, "public/assets/affinities", `affinity-${a}-icon.png`),
        path.join(ROOT, "public/assets/affinities", `${a}.png`),
        path.join(ROOT, "public/assets/affinities", a, "icon.png"),
      ];
      const hit = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).size > 2_000);
      expect(hit, a).toBeTruthy();
    }
  });
});

