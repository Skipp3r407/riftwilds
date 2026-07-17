/**
 * Critical validation orchestrator — fails closed on critical failures.
 *
 * Runs: typecheck → unit tests (critical suites) → pet assets → economy sim → summary HTML
 * Does NOT mark NOT_IMPLEMENTED systems as passing.
 */

import { spawnSync } from "child_process";
import path from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import {
  ARTIFACTS_DIR,
  ensureArtifactsDir,
  buildHtmlSummary,
  loadJsonReportIfExists,
  writeJsonReport,
  writeTextReport,
  type ValidationReport,
} from "../lib/report-writer";

const ROOT = path.resolve(__dirname, "../..");

type Step = {
  name: string;
  critical: boolean;
  command: string;
  args: string[];
};

const STEPS: Step[] = [
  { name: "typecheck", critical: true, command: "npx", args: ["tsc", "--noEmit"] },
  {
    name: "test:unit",
    critical: true,
    command: "npx",
    args: ["vitest", "run", "tests/unit"],
  },
  {
    name: "test:pets",
    critical: true,
    command: "npx",
    args: ["vitest", "run", "tests/pets", "tests/unit/pet-care.test.ts", "tests/unit/hatchery-ownership.test.ts", "tests/unit/species-kits.test.ts"],
  },
  {
    name: "test:economy",
    critical: true,
    command: "npx",
    args: [
      "vitest",
      "run",
      "tests/economy",
      "tests/unit/revenue-allocation.test.ts",
      "tests/unit/economy-flywheel.test.ts",
      "tests/unit/item-economy.test.ts",
    ],
  },
  {
    name: "test:marketplace",
    critical: true,
    command: "npx",
    args: ["vitest", "run", "tests/marketplace", "tests/unit/marketplace-economy.test.ts"],
  },
  {
    name: "test:battles",
    critical: true,
    command: "npx",
    args: [
      "vitest",
      "run",
      "tests/battles",
      "tests/unit/arena-engine.test.ts",
      "tests/unit/damage.test.ts",
    ],
  },
  {
    name: "test:security",
    critical: true,
    command: "npx",
    args: ["vitest", "run", "tests/security"],
  },
  {
    name: "validate:assets",
    critical: true,
    command: "npx",
    args: ["tsx", "scripts/validate/validate-pet-assets.ts"],
  },
  {
    name: "simulate:economy",
    critical: true,
    command: "npx",
    args: ["tsx", "scripts/simulations/economy-simulator.ts", "--sol=100", "--players=2000"],
  },
  {
    name: "simulate:pets",
    critical: false,
    command: "npx",
    args: ["tsx", "scripts/simulations/pet-lifecycle-simulator.ts"],
  },
  {
    name: "simulate:battles",
    critical: false,
    command: "npx",
    args: ["tsx", "scripts/simulations/battle-balance.ts", "--matches=10000"],
  },
  {
    name: "validate:expansion",
    critical: false,
    command: "npx",
    args: ["tsx", "scripts/validate/validate-expansion.ts"],
  },
  {
    name: "validate:ecosystem",
    critical: false,
    command: "npx",
    args: ["tsx", "scripts/validate/validate-ecosystem.ts"],
  },
  {
    name: "test:expansion",
    critical: false,
    command: "npx",
    args: ["vitest", "run", "tests/unit/expansion-foundations.test.ts"],
  },
  {
    name: "test:ecosystem",
    critical: false,
    command: "npx",
    args: ["vitest", "run", "tests/unit/ecosystem-transition.test.ts"],
  },
];

function runStep(step: Step): { ok: boolean; exitCode: number; durationMs: number } {
  const started = Date.now();
  const result = spawnSync(step.command, step.args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  const exitCode = result.status ?? 1;
  return { ok: exitCode === 0, exitCode, durationMs: Date.now() - started };
}

function main() {
  ensureArtifactsDir();
  const sections: ValidationReport["sections"] = [];
  const criticalFailures: string[] = [];

  // Track known gaps from registry
  const registryPath = path.join(ROOT, "tests", "system-registry.json");
  if (existsSync(registryPath)) {
    const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
      systems: { name: string; status: string }[];
    };
    const pending = registry.systems.filter(
      (s) => s.status === "NOT_IMPLEMENTED" || s.status === "PENDING" || s.status === "STUB",
    );
    sections.push({
      title: "System registry gaps",
      status: "PENDING",
      summary: `${pending.length} systems marked NOT_IMPLEMENTED/PENDING/STUB (not counted as pass)`,
      details: { pending: pending.map((p) => `${p.name}:${p.status}`) },
    });
  }

  for (const step of STEPS) {
    console.log(`\n═══ ${step.name} (critical=${step.critical}) ═══`);
    const result = runStep(step);
    if (!result.ok) {
      sections.push({
        title: step.name,
        status: "FAIL",
        summary: `exit ${result.exitCode} in ${result.durationMs}ms`,
      });
      if (step.critical) criticalFailures.push(`${step.name} failed (exit ${result.exitCode})`);
    } else {
      sections.push({
        title: step.name,
        status: "PASS",
        summary: `ok in ${result.durationMs}ms`,
      });
    }
  }

  const report: ValidationReport = {
    name: "validate-all",
    generatedAt: new Date().toISOString(),
    assumptions: [
      "SOL settlement flags must remain OFF in featureFlagDefaults",
      "Simulator USD figures are model assumptions",
      "NOT_IMPLEMENTED systems are tracked, not marked PASS",
    ],
    sections,
    criticalFailures,
    ok: criticalFailures.length === 0,
  };

  writeJsonReport("validate-all.json", report);
  writeTextReport(
    "validate-all.md",
    [
      "# validate:all",
      "",
      `Generated: ${report.generatedAt}`,
      `Overall: ${report.ok ? "PASS" : "FAIL"}`,
      "",
      ...sections.map((s) => `- **${s.status}** ${s.title}: ${s.summary}`),
      "",
      criticalFailures.length
        ? `## Critical failures\n${criticalFailures.map((c) => `- ${c}`).join("\n")}`
        : "No critical failures.",
      "",
    ].join("\n"),
  );

  const collected: ValidationReport[] = [report];
  for (const f of readdirSync(ARTIFACTS_DIR)) {
    if (f.endsWith(".json") && f !== "validate-all.json") {
      const r = loadJsonReportIfExists(f);
      if (r) collected.push(r);
    }
  }
  writeTextReport("summary.html", buildHtmlSummary(collected));

  console.log(`\nvalidate:all → ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`Reports in ${ARTIFACTS_DIR}`);
  if (!report.ok) process.exit(1);
}

main();
