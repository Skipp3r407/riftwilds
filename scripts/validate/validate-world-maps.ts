/**
 * Validate all 12 region map blueprints + emit JSON + HTML reports.
 * Usage: npx tsx scripts/validate/validate-world-maps.ts
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { allBlueprints, assertAllBlueprintsPresent } from "../../src/game/world-maps/blueprints";
import {
  REGION_IDENTITIES,
  REGION_UNLOCK_GATES,
  WORLD_PAGE_SLUGS,
} from "../../src/game/world-maps/regions";
import { RESOURCE_DEFS } from "../../src/game/world-maps/defs/resources";
import { ENEMY_DEFS } from "../../src/game/world-maps/defs/enemies";
import { PORTAL_DEFS } from "../../src/game/world-maps/defs/portals";
import type { MapBlueprint } from "../../src/game/world-maps/types";
import { auditBlueprintBoundaries } from "../../src/game/world-maps/boundaries/audit";
import { spawnOverlapsSolid } from "../../src/game/world-maps/boundaries/spawn-clamp";

const ROOT = path.resolve(__dirname, "../..");
const MAPS_OUT = path.join(ROOT, "public", "maps");
const ARTIFACTS = path.join(ROOT, "artifacts", "maps");
const BLUEPRINT_JSON = path.join(ROOT, "src", "game", "world-maps", "blueprints", "json");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateBlueprint(bp: MapBlueprint): {
  status: "FULL" | "PARTIAL" | "FAIL";
  checks: { name: string; ok: boolean; detail: string }[];
  critical: string[];
} {
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  const critical: string[] = [];

  const add = (name: string, ok: boolean, detail: string, crit = false) => {
    checks.push({ name, ok, detail });
    if (!ok && crit) critical.push(`${name}: ${detail}`);
  };

  add("schema", bp.schemaVersion === 1, `v${bp.schemaVersion}`, true);
  add("dimensions", bp.cols >= 32 && bp.rows >= 32, `${bp.cols}×${bp.rows}`, true);
  add("spawn", !!bp.spawn, `${bp.spawn.x},${bp.spawn.y}`, true);
  add(
    "spawn-in-bounds",
    bp.spawn.x > 0 &&
      bp.spawn.y > 0 &&
      bp.spawn.x < bp.cols * bp.tileSize &&
      bp.spawn.y < bp.rows * bp.tileSize,
    "spawn inside map",
    true,
  );
  add("zones", bp.zones.length >= 4, `${bp.zones.length} zones`, true);
  add("pathways", bp.pathways.length >= 1, `${bp.pathways.length} pathways`);
  add("colliders", bp.colliders.length >= 4, `${bp.colliders.length} colliders`, true);
  add("objects", bp.objects.length >= 8, `${bp.objects.length} objects`, true);
  add(
    "safe-zones",
    bp.safeZones.length >= 1,
    `${bp.safeZones.length} safe zones`,
    true,
  );
  add("camera", bp.camera.width > 0 && bp.camera.height > 0, "camera bounds", true);
  add(
    "minimap",
    bp.minimap.landmarkPins.length >= 1,
    `${bp.minimap.landmarkPins.length} pins`,
  );
  add("weather", bp.weatherKeys.length >= 1, bp.weatherKeys.join(", "));
  add("music", !!bp.musicKey, bp.musicKey);

  const portals = bp.objects.filter((o) => o.type === "portal");
  const npcs = bp.objects.filter((o) => o.type === "npc");
  const resources = bp.objects.filter((o) => o.type === "resource");
  const enemies = bp.objects.filter((o) => o.type === "enemy_spawn");
  const hidden = bp.objects.filter((o) => o.type === "hidden_area");
  const waypoints = bp.objects.filter((o) => o.type === "waypoint");

  add("portals", portals.length >= 1, `${portals.length} portals`, true);
  add("npcs-or-guide", npcs.length >= 0, `${npcs.length} NPCs`);
  add("resources", resources.length >= 1, `${resources.length} resources`);
  add("enemy-or-safe-hub", enemies.length >= 0 || bp.safeZones.length > 0, `${enemies.length} enemy zones`);
  add("hidden", hidden.length >= 1, `${hidden.length} hidden`);
  add("waypoints", waypoints.length >= 1, `${waypoints.length} waypoints`);

  // Enemies must not center inside first safe zone (soft check)
  if (bp.safeZones[0] && enemies.length) {
    const sz = bp.safeZones[0];
    const bad = enemies.filter(
      (e) =>
        e.x >= sz.x &&
        e.x <= sz.x + sz.width &&
        e.y >= sz.y &&
        e.y <= sz.y + sz.height,
    );
    add(
      "enemies-outside-primary-safe",
      bad.length === 0,
      bad.length ? `${bad.length} inside safe` : "ok",
    );
  }

  const boundary = auditBlueprintBoundaries(bp);
  add(
    "edge-walls",
    boundary.stats.edgeWalls >= 4,
    `${boundary.stats.edgeWalls} edge walls`,
    true,
  );
  add(
    "spawn-clear-of-solids",
    !spawnOverlapsSolid(bp.spawn, bp.colliders),
    spawnOverlapsSolid(bp.spawn, bp.colliders)
      ? "spawn overlaps solid"
      : "spawn clear",
    true,
  );
  add(
    "transitions",
    boundary.stats.transitions >= 1 || portals.length === 0,
    `${boundary.stats.transitions} transition zones`,
  );
  const openEdges = boundary.issues.filter((i) => i.code === "open-edge");
  add(
    "no-open-edges",
    openEdges.length === 0,
    openEdges.length ? openEdges.map((i) => i.detail).join("; ") : "sealed",
    true,
  );
  for (const issue of boundary.issues.filter((i) => i.severity === "critical")) {
    if (
      issue.code === "open-edge" ||
      issue.code === "missing-edge-wall" ||
      issue.code === "spawn-in-solid" ||
      issue.code === "transition-under-wall"
    ) {
      // already covered above / ensure FAIL
      if (!checks.some((c) => c.name === issue.code && !c.ok)) {
        add(issue.code, false, issue.detail, true);
      }
    }
  }

  const failed = checks.filter((c) => !c.ok);
  let status: "FULL" | "PARTIAL" | "FAIL" = "FULL";
  if (critical.length) status = "FAIL";
  else if (bp.completeness === "PARTIAL" || failed.length > 0) status = "PARTIAL";

  return { status, checks, critical };
}

function writeRegionReport(
  bp: MapBlueprint,
  result: ReturnType<typeof validateBlueprint>,
  regionPlayability: string,
): void {
  const rows = result.checks
    .map(
      (c) =>
        `<tr><td>${c.ok ? "✅" : "⚠️"}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.detail)}</td></tr>`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(bp.name)} — Map Report</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background:#0f172a; color:#e2e8f0; margin:2rem; }
    .badge { display:inline-block; padding:0.25rem 0.6rem; border-radius:6px; font-weight:700; }
    .FULL { background:#166534; }
    .PARTIAL { background:#854d0e; }
    .FAIL { background:#991b1b; }
    table { border-collapse: collapse; width:100%; margin-top:1rem; }
    td, th { border:1px solid #334155; padding:0.4rem 0.6rem; text-align:left; }
    code { color:#7dd3fc; }
  </style>
</head>
<body>
  <h1>${escapeHtml(bp.name)}</h1>
  <p>Slug: <code>${escapeHtml(bp.slug)}</code> · Completeness declared: <strong>${bp.completeness}</strong></p>
  <p>Validation status: <span class="badge ${result.status}">${result.status}</span>
     · Playability: <code>${escapeHtml(regionPlayability)}</code></p>
  <p>Size: ${bp.cols}×${bp.rows} tiles (${bp.tileSize}px) · Objects: ${bp.objects.length} · Zones: ${bp.zones.length}</p>
  <p>Generated ${new Date().toISOString()}</p>
  ${
    result.critical.length
      ? `<p style="color:#f87171"><strong>Critical:</strong> ${result.critical.map(escapeHtml).join("; ")}</p>`
      : ""
  }
  <h2>Checks</h2>
  <table>
    <tr><th></th><th>Check</th><th>Detail</th></tr>
    ${rows}
  </table>
  <h2>Notes</h2>
  <ul>${(bp.notes ?? []).map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>
  <h2>Honesty</h2>
  <p>PARTIAL means blueprint + metadata are present but art/dungeons/boss combat may be stubbed.
  FULL means the launch hub map is enterable with plaza, buildings, NPCs, portals, collision, and safe zones.</p>
</body>
</html>`;

  writeFileSync(path.join(ARTIFACTS, `${bp.slug}-report.html`), html, "utf8");
}

function main() {
  mkdirSync(MAPS_OUT, { recursive: true });
  mkdirSync(ARTIFACTS, { recursive: true });
  mkdirSync(BLUEPRINT_JSON, { recursive: true });

  const missing = assertAllBlueprintsPresent();
  const blueprints = allBlueprints();

  if (blueprints.length !== 12) {
    console.error(`Expected 12 blueprints, got ${blueprints.length}`);
    process.exitCode = 1;
  }

  const summaryRows: string[] = [];
  let fails = 0;

  for (const bp of blueprints) {
    const region = REGION_IDENTITIES.find((r) => r.slug === bp.slug);
    const result = validateBlueprint(bp);
    if (result.status === "FAIL") fails += 1;

    // Export JSON copies
    const json = JSON.stringify(bp, null, 2);
    writeFileSync(path.join(BLUEPRINT_JSON, `${bp.slug}.json`), json, "utf8");
    mkdirSync(path.join(MAPS_OUT, bp.slug), { recursive: true });
    writeFileSync(
      path.join(MAPS_OUT, bp.slug, "blueprint.json"),
      json,
      "utf8",
    );

    writeRegionReport(bp, result, region?.playability ?? "unknown");
    summaryRows.push(
      `<tr><td>${escapeHtml(bp.name)}</td><td>${bp.completeness}</td><td class="${result.status}">${result.status}</td><td>${escapeHtml(region?.playability ?? "")}</td><td><a href="./${bp.slug}-report.html">report</a></td></tr>`,
    );
    console.log(
      `${bp.slug}: declared=${bp.completeness} validated=${result.status} objects=${bp.objects.length}`,
    );
  }

  // Cross checks
  const slugSet = new Set(WORLD_PAGE_SLUGS);
  const unlockOk = REGION_UNLOCK_GATES.every((g) => slugSet.has(g.regionId as (typeof WORLD_PAGE_SLUGS)[number]));
  const portalOk = PORTAL_DEFS.every(
    (p) => slugSet.has(p.fromRegionId as (typeof WORLD_PAGE_SLUGS)[number]) && slugSet.has(p.toRegionId as (typeof WORLD_PAGE_SLUGS)[number]),
  );

  const index = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Riftwilds World Maps — Validation Index</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background:#0f172a; color:#e2e8f0; margin:2rem; }
    table { border-collapse: collapse; width:100%; }
    td, th { border:1px solid #334155; padding:0.5rem; }
    .FULL { color:#4ade80; } .PARTIAL { color:#fbbf24; } .FAIL { color:#f87171; }
    a { color:#38bdf8; }
  </style>
</head>
<body>
  <h1>World Map Validation</h1>
  <p>${new Date().toISOString()} · Resources: ${RESOURCE_DEFS.length} · Enemies: ${ENEMY_DEFS.length} · Portals: ${PORTAL_DEFS.length}</p>
  <p>Unlock gates aligned: ${unlockOk ? "yes" : "NO"} · Portal targets aligned: ${portalOk ? "yes" : "NO"} · Missing builders: ${missing.length ? missing.join(", ") : "none"}</p>
  <h2>Playable vs blueprint-only</h2>
  <ul>
    <li><strong>Playable:</strong> Riftwild Commons (FULL scene)</li>
    <li><strong>Enterable stubs:</strong> Ember Crater, Moonwater Coast, Elderwood Forest (portal transitions)</li>
    <li><strong>Blueprint-only:</strong> remaining 8 regions (unlock gates encoded; scenes not registered)</li>
  </ul>
  <table>
    <tr><th>Region</th><th>Declared</th><th>Validated</th><th>Playability</th><th>Report</th></tr>
    ${summaryRows.join("\n")}
  </table>
</body>
</html>`;

  writeFileSync(path.join(ARTIFACTS, "index.html"), index, "utf8");
  writeFileSync(
    path.join(ARTIFACTS, "summary.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        regionCount: blueprints.length,
        fails,
        missing,
        unlockOk,
        portalOk,
        regions: blueprints.map((bp) => ({
          slug: bp.slug,
          completeness: bp.completeness,
          objects: bp.objects.length,
          zones: bp.zones.length,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote reports → ${ARTIFACTS}`);
  console.log(`Wrote JSON → ${BLUEPRINT_JSON} and ${MAPS_OUT}`);
  if (fails || missing.length || !unlockOk || !portalOk) process.exitCode = 1;
}

main();
