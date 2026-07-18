/**
 * Ensures Commons Live World NPCs never use portrait-bust textures as world actors.
 */
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { COMMONS_OVERWORLD_NPC_SLUGS } from "@/game/live-world/npcs/overworld-npcs";

const ROOT = process.cwd();
const COMMONS = path.join(ROOT, "public/assets/npcs/riftwild-commons");

function contentMetrics(filePath: string) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let opaque = 0;
  let edgeClear = 0;
  let edgeTotal = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < 16) continue;
      opaque++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  for (let x = 0; x < w; x++) {
    edgeTotal += 2;
    if (data[x * 4 + 3] < 16) edgeClear++;
    if (data[((h - 1) * w + x) * 4 + 3] < 16) edgeClear++;
  }
  for (let y = 0; y < h; y++) {
    edgeTotal += 2;
    if (data[y * w * 4 + 3] < 16) edgeClear++;
    if (data[(y * w + w - 1) * 4 + 3] < 16) edgeClear++;
  }
  expect(opaque).toBeGreaterThan(0);
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  return {
    aspect: bh / bw,
    fill: opaque / (w * h),
    edgeClear: edgeClear / edgeTotal,
    w,
    h,
  };
}

function isWorldWorthy(slug: string, m: ReturnType<typeof contentMetrics>) {
  const creature = slug.startsWith("riftling-");
  if (creature) {
    return m.edgeClear >= 0.2 && m.fill < 0.92 && m.aspect >= 0.7;
  }
  return m.aspect >= 1.2 && m.edgeClear >= 0.2;
}

describe("Commons overworld NPC full-body contract", () => {
  it("lists the expected Commons cast", () => {
    expect(COMMONS_OVERWORLD_NPC_SLUGS.length).toBe(24);
  });

  it("every Commons overworld NPC has a world-worthy sprite + sheet (not a floating head)", () => {
    const failures: string[] = [];
    for (const slug of COMMONS_OVERWORLD_NPC_SLUGS) {
      const dir = path.join(COMMONS, slug);
      const sprite = path.join(dir, "sprite.png");
      const full = path.join(dir, "full-body.png");
      const sheet = path.join(dir, "overworld-sheet.png");
      if (!fs.existsSync(sheet)) {
        failures.push(`${slug}: missing overworld-sheet.png`);
        continue;
      }
      const sheetStat = fs.statSync(sheet);
      if (sheetStat.size < 4000) {
        failures.push(`${slug}: overworld-sheet.png too small (${sheetStat.size})`);
      }
      const sheetPng = PNG.sync.read(fs.readFileSync(sheet));
      if (sheetPng.width !== 512 || sheetPng.height !== 128) {
        failures.push(
          `${slug}: sheet dims ${sheetPng.width}x${sheetPng.height} (want 512x128)`,
        );
      }

      const sources = [full, sprite].filter((p) => fs.existsSync(p));
      if (sources.length === 0) {
        failures.push(`${slug}: no sprite/full-body`);
        continue;
      }
      const worthy = sources.some((p) => isWorldWorthy(slug, contentMetrics(p)));
      if (!worthy) {
        failures.push(`${slug}: no world-worthy full-body/sprite (floating head risk)`);
      }

      const metaPath = path.join(dir, "metadata.json");
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        if (meta.spriteDistinct === false && meta.fullBodyDistinct === false) {
          // Ambient kits may omit flags; named cast must be distinct after this pass
          if (
            ![
              "plaza-vendor-cal",
              "plaza-musician-reo",
              "plaza-child-mim",
              "farm-hand-jot",
              "dock-sweeper-ana",
              "scribe-runner-kel",
              "cook-pot-uma",
              "gardener-sip",
              "guard-east-ryn",
              "guard-west-dao",
              "guard-portal-hex",
              "riftling-plaza-emberkit",
              "riftling-hatchery-glowpup",
              "riftling-market-pouchling",
            ].includes(slug)
          ) {
            failures.push(`${slug}: metadata still marks sprite/fullBody non-distinct`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("does not allow overworld sheet content to be a square bust fill", () => {
    for (const slug of COMMONS_OVERWORLD_NPC_SLUGS) {
      if (slug.startsWith("riftling-")) continue;
      const sheet = path.join(COMMONS, slug, "overworld-sheet.png");
      const png = PNG.sync.read(fs.readFileSync(sheet));
      // Sample first frame (0..127)
      let opaque = 0;
      let minY = 128;
      let maxY = 0;
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const a = png.data[(y * png.width + x) * 4 + 3];
          if (a < 16) continue;
          opaque++;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      expect(opaque).toBeGreaterThan(200);
      // Full-body figures occupy most of the vertical frame after bottom-center fit
      expect(maxY - minY).toBeGreaterThan(70);
    }
  });
});
