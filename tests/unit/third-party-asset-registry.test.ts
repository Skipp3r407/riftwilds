import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ThirdPartyAssetRecord, ThirdPartyAssetRegistry } from "@/lib/assets/third-party/schema";
import {
  canEnterRuntime,
  detectDuplicates,
  validateLicensePresence,
  validateRegistry,
  validateRuntimeEligibility,
} from "@/lib/assets/third-party/validate";
import { loadThirdPartyRegistry } from "@/lib/assets/third-party/registry";

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, "assets/licenses/third-party-assets.json");

function baseRecord(overrides: Partial<ThirdPartyAssetRecord> = {}): ThirdPartyAssetRecord {
  return {
    id: "test-asset",
    title: "Test",
    kind: "ui_icon",
    sourceUrl: "https://example.com/asset",
    creator: "Example",
    licenseName: "CC0 1.0",
    licenseCategory: "CC0",
    status: "DISCOVERED",
    styleScore: 50,
    riskNotes: [],
    attributionRequired: false,
    discoveredAt: "2026-07-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("third-party asset registry", () => {
  it("ships a registry JSON file", () => {
    expect(fs.existsSync(REGISTRY)).toBe(true);
    const doc = JSON.parse(fs.readFileSync(REGISTRY, "utf8")) as ThirdPartyAssetRegistry;
    expect(doc.version).toBeTruthy();
    expect(Array.isArray(doc.records)).toBe(true);
    expect(doc.records.length).toBeGreaterThan(5);
  });

  it("loads and validates the on-disk registry", () => {
    const registry = loadThirdPartyRegistry(ROOT);
    const result = validateRegistry(registry);
    expect(result.ok, result.issues.map((i) => `${i.code}:${i.message}`).join("\n")).toBe(true);
  });

  it("rejects assets with no license from runtime statuses", () => {
    const record = baseRecord({
      licenseName: "",
      licenseCategory: "UNKNOWN",
      status: "APPROVED",
    });
    const issues = validateLicensePresence(record);
    expect(issues.some((i) => i.code === "NO_LICENSE")).toBe(true);
    expect(issues.some((i) => i.code === "NO_LICENSE_RUNTIME")).toBe(true);
  });

  it("blocks restricted statuses from declaring runtimePath", () => {
    const record = baseRecord({
      status: "RESTRICTED",
      licenseCategory: "RESTRICTED",
      licenseName: "UNVERIFIED",
      runtimePath: "/assets/tilesets/stolen.png",
    });
    const issues = [
      ...validateLicensePresence(record),
      ...validateRuntimeEligibility(record),
    ];
    expect(issues.some((i) => i.code === "RESTRICTED_CANNOT_ENTER_RUNTIME" || i.code === "RESTRICTED_RUNTIME_PATH")).toBe(
      true,
    );
    expect(canEnterRuntime("RESTRICTED")).toBe(false);
    expect(canEnterRuntime("DISCOVERED")).toBe(false);
    expect(canEnterRuntime("APPROVED")).toBe(true);
  });

  it("detects duplicate ids and fingerprints", () => {
    const a = baseRecord({ id: "a", fingerprint: "same-bytes" });
    const b = baseRecord({
      id: "b",
      fingerprint: "same-bytes",
      sourceUrl: "https://example.com/other",
    });
    const dupId = detectDuplicates([a, { ...a, title: "clone" }]);
    expect(dupId.some((i) => i.code === "DUPLICATE_ID")).toBe(true);
    const dupFp = detectDuplicates([a, b]);
    expect(dupFp.some((i) => i.code === "DUPLICATE_FINGERPRINT")).toBe(true);
  });

  it("keeps Kenmi unverified pack out of runtime", () => {
    const registry = loadThirdPartyRegistry(ROOT);
    const kenmi = registry.records.find((r) => r.id === "reject-kenmi-cute-fantasy-unverified");
    expect(kenmi).toBeTruthy();
    expect(kenmi!.status).toBe("RESTRICTED");
    expect(kenmi!.runtimePath).toBeUndefined();
    expect(canEnterRuntime(kenmi!.status)).toBe(false);
  });
});
