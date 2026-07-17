import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import path from "path";

export type ReportSeverity = "info" | "warn" | "critical";

export type ReportSection = {
  title: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP" | "NOT_IMPLEMENTED" | "PENDING";
  summary: string;
  details?: Record<string, unknown>;
};

export type ValidationReport = {
  name: string;
  generatedAt: string;
  assumptions?: string[];
  sections: ReportSection[];
  criticalFailures: string[];
  ok: boolean;
};

const ROOT = path.resolve(__dirname, "../..");
export const ARTIFACTS_DIR = path.join(ROOT, "artifacts", "reports");

export function ensureArtifactsDir() {
  mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

export function writeJsonReport(filename: string, report: ValidationReport): string {
  ensureArtifactsDir();
  const filePath = path.join(ARTIFACTS_DIR, filename);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(report, null, 2), "utf8");
  return filePath;
}

export function writeTextReport(filename: string, body: string): string {
  ensureArtifactsDir();
  const filePath = path.join(ARTIFACTS_DIR, filename);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, body, "utf8");
  return filePath;
}

export function buildHtmlSummary(reports: ValidationReport[]): string {
  const rows = reports
    .map((r) => {
      const badge = r.ok
        ? `<span style="color:#16a34a">PASS</span>`
        : `<span style="color:#dc2626">FAIL</span>`;
      const sectionList = r.sections
        .map(
          (s) =>
            `<li><strong>${s.status}</strong> — ${escapeHtml(s.title)}: ${escapeHtml(s.summary)}</li>`,
        )
        .join("");
      return `<section style="margin:1.5rem 0;padding:1rem;border:1px solid #334155;border-radius:8px">
  <h2>${escapeHtml(r.name)} ${badge}</h2>
  <p style="color:#94a3b8;font-size:0.85rem">${escapeHtml(r.generatedAt)}</p>
  ${
    r.assumptions?.length
      ? `<p><em>Assumptions:</em> ${r.assumptions.map(escapeHtml).join("; ")}</p>`
      : ""
  }
  <ul>${sectionList}</ul>
  ${
    r.criticalFailures.length
      ? `<p style="color:#dc2626"><strong>Critical:</strong> ${r.criticalFailures.map(escapeHtml).join("; ")}</p>`
      : ""
  }
</section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Riftwilds Validation Summary</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background:#0f172a; color:#e2e8f0; margin:2rem; }
    h1 { font-size:1.75rem; }
    a { color:#38bdf8; }
  </style>
</head>
<body>
  <h1>Riftwilds Validation Summary</h1>
  <p>Generated ${new Date().toISOString()}. Financial figures are model assumptions unless labeled otherwise.</p>
  ${rows}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function loadJsonReportIfExists(filename: string): ValidationReport | null {
  const filePath = path.join(ARTIFACTS_DIR, filename);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8")) as ValidationReport;
}
