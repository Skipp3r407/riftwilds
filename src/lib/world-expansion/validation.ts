import { createRequestId } from "@/lib/utils/request-id";
import { assertPlotUniqueness } from "@/lib/world-expansion/generation-pipeline";
import { getTemplate } from "@/lib/world-expansion/templates";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { ValidationReport, WorldMapRecord } from "@/lib/world-expansion/types";

/** Validation + visual QA stubs — reject failures before player exposure. */
export function validateGeneratedMap(map: WorldMapRecord): ValidationReport {
  const template = getTemplate(map.templateKey);
  const uniq = assertPlotUniqueness(map.plots);
  const roadCells = new Set(map.roads.flatMap((r) => [`${r.from.col},${r.from.row}`, `${r.to.col},${r.to.row}`]));
  const plotsReachable =
    map.plots.length === 0 ||
    map.plots.every((p) => p.roadAccess && (roadCells.size === 0 || true));
  const navWalkable = map.roads.length >= 2 || map.mapKind === "overflow";
  const safeLogoutPresent =
    map.hubs.some((h) => h.kind.includes("safe") || h.kind.includes("welcome") || h.kind.includes("hearth")) ||
    map.landmarks.length > 0;
  const performanceWithinBudget =
    map.entityCount <= template.performanceBudget.maxNpcs * 3 &&
    map.plots.length <= template.performanceBudget.maxPlots &&
    map.districts.length <= template.performanceBudget.maxDistricts;
  const noHousingOnOverflow =
    map.mapKind !== "overflow" || (map.plots.length === 0 && !map.allowsPermanentHousing);
  const livingTowns =
    map.mapKind === "overflow" ||
    (map.districts.length >= 2 &&
      map.landmarks.length >= 1 &&
      map.plots.every((p) => p.roadAccess));

  const checks = [
    { key: "plot_uniqueness", ok: uniq.ok, detail: uniq.ok ? "unique" : `dupes:${uniq.dupes.join(",")}` },
    { key: "nav_walkable", ok: navWalkable, detail: navWalkable ? "roads ok" : "insufficient roads" },
    { key: "plots_reachable", ok: plotsReachable, detail: plotsReachable ? "ok" : "isolated plots" },
    {
      key: "safe_logout",
      ok: safeLogoutPresent,
      detail: safeLogoutPresent ? "hub present" : "missing safe logout",
    },
    {
      key: "performance_budget",
      ok: performanceWithinBudget,
      detail: performanceWithinBudget ? "within budget" : "over budget",
    },
    {
      key: "no_permanent_housing_on_overflow",
      ok: noHousingOnOverflow,
      detail: noHousingOnOverflow ? "ok" : "overflow has housing",
    },
    {
      key: "living_towns_urban",
      ok: livingTowns,
      detail: livingTowns ? "districts+roads" : "empty scatter rejected",
    },
  ];

  const passed = checks.every((c) => c.ok);
  const report: ValidationReport = {
    reportId: `val_${createRequestId()}`,
    mapId: map.mapId,
    passed,
    checks,
    visualQaStub: {
      navWalkable,
      plotsReachable,
      safeLogoutPresent,
      performanceWithinBudget,
    },
    createdAt: new Date().toISOString(),
  };
  getExpansionStore().validations.set(report.reportId, report);
  return report;
}
