import {
  ALLOWED_LICENSE_CATEGORIES,
  ASSET_PIPELINE_STATUSES,
  NON_RUNTIME_STATUSES,
  RUNTIME_ELIGIBLE_STATUSES,
  type ThirdPartyAssetRecord,
  type ThirdPartyAssetRegistry,
  type ValidationIssue,
  type ValidationResult,
} from "./schema";

const ALLOWED = new Set<string>(ALLOWED_LICENSE_CATEGORIES);
const STATUSES = new Set<string>(ASSET_PIPELINE_STATUSES);
const NON_RUNTIME = new Set<string>(NON_RUNTIME_STATUSES);
const RUNTIME_OK = new Set<string>(RUNTIME_ELIGIBLE_STATUSES);

function issue(code: string, message: string, recordId?: string): ValidationIssue {
  return { code, message, recordId };
}

/** Reject records with no usable license documentation from runtime statuses. */
export function validateLicensePresence(record: ThirdPartyAssetRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nameBlank =
    !record.licenseName?.trim() || /^n\/?a|none|tbd$/i.test(record.licenseName.trim());
  const categoryUnknown =
    record.licenseCategory === "UNKNOWN" ||
    /^unknown$/i.test(record.licenseName?.trim() ?? "");
  const noUsableLicense = nameBlank || categoryUnknown;

  // Discovery / review may carry UNKNOWN — that is intentional. Hard-fail only for runtime.
  if (noUsableLicense && (RUNTIME_OK.has(record.status) || record.status === "IN_USE")) {
    issues.push(
      issue(
        "NO_LICENSE",
        "Asset has no documented allowed license — cannot be APPROVED, NEEDS_ATTRIBUTION, or IN_USE.",
        record.id,
      ),
    );
    issues.push(
      issue(
        "NO_LICENSE_RUNTIME",
        "Assets without a license cannot enter runtime statuses.",
        record.id,
      ),
    );
  }

  if (
    record.licenseCategory === "RESTRICTED" ||
    record.status === "RESTRICTED" ||
    record.status === "REJECTED"
  ) {
    if (record.runtimePath) {
      issues.push(
        issue(
          "RESTRICTED_RUNTIME_PATH",
          "Restricted or rejected assets must not declare a runtimePath under public/.",
          record.id,
        ),
      );
    }
  }

  return issues;
}

/** Restricted / non-approved statuses cannot enter production runtime. */
export function validateRuntimeEligibility(record: ThirdPartyAssetRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (record.runtimePath && NON_RUNTIME.has(record.status)) {
    issues.push(
      issue(
        "RESTRICTED_CANNOT_ENTER_RUNTIME",
        `Status ${record.status} cannot have runtimePath — keep under private-assets/ until approved.`,
        record.id,
      ),
    );
  }

  if (record.status === "IN_USE") {
    if (!RUNTIME_OK.has("IN_USE")) {
      /* unreachable guard for schema drift */
    }
    if (!ALLOWED.has(record.licenseCategory) && record.licenseCategory !== "UNKNOWN") {
      // UNKNOWN already handled; RESTRICTED category cannot be IN_USE
    }
    if (record.licenseCategory === "RESTRICTED" || record.licenseCategory === "UNKNOWN") {
      issues.push(
        issue(
          "IN_USE_BAD_LICENSE",
          "IN_USE requires an allowed license category (not UNKNOWN/RESTRICTED).",
          record.id,
        ),
      );
    }
    if (!record.runtimePath?.startsWith("/assets/") && !record.runtimePath?.startsWith("/sounds/")) {
      issues.push(
        issue(
          "IN_USE_MISSING_RUNTIME",
          "IN_USE records must point at an existing public runtime path (/assets/ or /sounds/).",
          record.id,
        ),
      );
    }
  }

  if (
    (record.status === "APPROVED" || record.status === "NEEDS_ATTRIBUTION") &&
    !ALLOWED.has(record.licenseCategory)
  ) {
    issues.push(
      issue(
        "APPROVED_BAD_LICENSE",
        "APPROVED / NEEDS_ATTRIBUTION require an allowed license category.",
        record.id,
      ),
    );
  }

  if (record.status === "NEEDS_ATTRIBUTION" && !record.attributionText?.trim()) {
    issues.push(
      issue(
        "ATTRIBUTION_MISSING",
        "NEEDS_ATTRIBUTION requires attributionText for credits surfaces.",
        record.id,
      ),
    );
  }

  return issues;
}

/** Basic duplicate detection by id, fingerprint, or identical source URL + pack. */
export function detectDuplicates(records: ThirdPartyAssetRecord[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const byId = new Map<string, string>();
  const byFingerprint = new Map<string, string>();
  const bySource = new Map<string, string>();

  for (const r of records) {
    if (byId.has(r.id)) {
      issues.push(issue("DUPLICATE_ID", `Duplicate registry id "${r.id}".`, r.id));
    } else {
      byId.set(r.id, r.id);
    }

    if (r.fingerprint) {
      const prev = byFingerprint.get(r.fingerprint);
      if (prev && prev !== r.id) {
        issues.push(
          issue(
            "DUPLICATE_FINGERPRINT",
            `Fingerprint collides with "${prev}" — likely same binary / pack file.`,
            r.id,
          ),
        );
      } else {
        byFingerprint.set(r.fingerprint, r.id);
      }
    }

    const sourceKey = `${r.sourceUrl}|${r.sourcePackId ?? ""}`;
    const prevSrc = bySource.get(sourceKey);
    if (prevSrc && prevSrc !== r.id) {
      issues.push(
        issue(
          "DUPLICATE_SOURCE",
          `Same sourceUrl/pack already registered as "${prevSrc}".`,
          r.id,
        ),
      );
    } else {
      bySource.set(sourceKey, r.id);
    }
  }

  return issues;
}

export function validateRecord(record: ThirdPartyAssetRecord): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!record.id?.trim()) {
    issues.push(issue("MISSING_ID", "Record requires a stable id."));
  }
  if (!STATUSES.has(record.status)) {
    issues.push(issue("BAD_STATUS", `Unknown status "${record.status}".`, record.id));
  }
  if (typeof record.styleScore !== "number" || record.styleScore < 0 || record.styleScore > 100) {
    issues.push(issue("BAD_STYLE_SCORE", "styleScore must be 0–100.", record.id));
  }
  if (record.privatePath?.startsWith("public/")) {
    issues.push(
      issue(
        "PRIVATE_IN_PUBLIC",
        "privatePath must not live under public/ — use private-assets/.",
        record.id,
      ),
    );
  }

  issues.push(...validateLicensePresence(record));
  issues.push(...validateRuntimeEligibility(record));
  return issues;
}

export function validateRegistry(registry: ThirdPartyAssetRegistry): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!registry.version) {
    issues.push(issue("MISSING_VERSION", "Registry requires version."));
  }
  if (!Array.isArray(registry.records)) {
    issues.push(issue("BAD_RECORDS", "Registry.records must be an array."));
    return { ok: false, issues };
  }

  for (const record of registry.records) {
    issues.push(...validateRecord(record));
  }
  issues.push(...detectDuplicates(registry.records));

  return { ok: issues.length === 0, issues };
}

/** Gate helper: may this status be copied into the game runtime? */
export function canEnterRuntime(status: string): boolean {
  return RUNTIME_OK.has(status);
}
