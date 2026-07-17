import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { AssetRecord } from "@/lib/assets/asset-manifest";

export type ValidationIssue = {
  id: string;
  path: string;
  severity: "error" | "warn";
  code: string;
  message: string;
};

export type ValidationReport = {
  checked: number;
  ok: number;
  missing: number;
  issues: ValidationIssue[];
};

const MIN_BYTES = 800;

/**
 * Validate that expected assets exist and look like real raster masters (not empty stubs).
 */
export async function validateAssetRecords(
  records: AssetRecord[],
  projectRoot: string,
): Promise<ValidationReport> {
  const issues: ValidationIssue[] = [];
  let ok = 0;
  let missing = 0;

  for (const rec of records) {
    if (rec.status === "pending" || rec.status === "planned" || rec.status === "not_applicable") {
      // Pending is honest — not an error unless --strict
      continue;
    }
    const abs = path.join(projectRoot, "public", rec.publicPath.replace(/^\//, ""));
    if (!fs.existsSync(abs)) {
      missing++;
      issues.push({
        id: rec.id,
        path: rec.publicPath,
        severity: "error",
        code: "MISSING_FILE",
        message: `Expected file missing for status=${rec.status}`,
      });
      continue;
    }

    const stat = fs.statSync(abs);
    if (stat.size < MIN_BYTES) {
      issues.push({
        id: rec.id,
        path: rec.publicPath,
        severity: "error",
        code: "TOO_SMALL",
        message: `File only ${stat.size} bytes — likely stub`,
      });
      continue;
    }

    if (/\.png$/i.test(abs)) {
      try {
        const meta = await sharp(abs).metadata();
        if (!meta.width || !meta.height) {
          issues.push({
            id: rec.id,
            path: rec.publicPath,
            severity: "error",
            code: "BAD_PNG",
            message: "PNG metadata unreadable",
          });
          continue;
        }
        if (rec.minWidth && meta.width < rec.minWidth) {
          issues.push({
            id: rec.id,
            path: rec.publicPath,
            severity: "warn",
            code: "LOW_RES",
            message: `Width ${meta.width} < min ${rec.minWidth}`,
          });
        }
      } catch (e) {
        issues.push({
          id: rec.id,
          path: rec.publicPath,
          severity: "error",
          code: "SHARP_FAIL",
          message: e instanceof Error ? e.message : String(e),
        });
        continue;
      }
    }

    ok++;
  }

  return {
    checked: records.length,
    ok,
    missing,
    issues,
  };
}

export function fileExistsPublic(projectRoot: string, publicPath: string): boolean {
  const abs = path.join(projectRoot, "public", publicPath.replace(/^\//, ""));
  return fs.existsSync(abs);
}
