import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import {
  RIFTLING_CRY_CATALOG,
  allRiftlingCrySlugs,
  hasRiftlingCry,
  riftlingCryPath,
} from "@/lib/audio/riftling-cries";

const ROOT = path.resolve(__dirname, "../..");

describe("Riftling species cries", () => {
  it("catalogs exactly one cry path per launch species", () => {
    expect(allRiftlingCrySlugs()).toHaveLength(LAUNCH_SPECIES.length);
    expect(Object.keys(RIFTLING_CRY_CATALOG)).toHaveLength(100);
    for (const sp of LAUNCH_SPECIES) {
      expect(hasRiftlingCry(sp.slug)).toBe(true);
      expect(riftlingCryPath(sp.slug)).toBe(`/assets/audio/riftlings/${sp.slug}.wav`);
      expect(RIFTLING_CRY_CATALOG[sp.slug]?.runtimePath).toBe(
        `/sounds/sfx/riftlings/${sp.slug}.wav`,
      );
    }
  });

  it("has a unique WAV on disk for every species slug", () => {
    const missing = LAUNCH_SPECIES.filter((sp) => {
      const disk = path.join(
        ROOT,
        "public",
        "assets",
        "audio",
        "riftlings",
        `${sp.slug}.wav`,
      );
      return !existsSync(disk);
    }).map((s) => s.slug);
    expect(missing).toEqual([]);
  });

  it("mirrors cries under public/sounds/sfx/riftlings/", () => {
    const missing = LAUNCH_SPECIES.filter((sp) => {
      const disk = path.join(
        ROOT,
        "public",
        "sounds",
        "sfx",
        "riftlings",
        `${sp.slug}.wav`,
      );
      return !existsSync(disk);
    }).map((s) => s.slug);
    expect(missing).toEqual([]);
  });

  it("does not reuse the same file bytes for every species (uniqueness smoke)", () => {
    const sizes = new Set<number>();
    const hashes = new Set<string>();
    for (const sp of LAUNCH_SPECIES) {
      const disk = path.join(
        ROOT,
        "public",
        "assets",
        "audio",
        "riftlings",
        `${sp.slug}.wav`,
      );
      const buf = readFileSync(disk);
      sizes.add(buf.length);
      // Mid-clip fingerprint (skip fade-in silence after 44-byte WAV header)
      const mid = Math.min(buf.length - 64, Math.floor(buf.length * 0.35));
      hashes.add(buf.subarray(mid, mid + 64).toString("hex"));
    }
    // Distinct envelopes / lengths — not a single duplicated clip
    expect(hashes.size).toBe(100);
    expect(sizes.size).toBeGreaterThan(5);
  });
});
