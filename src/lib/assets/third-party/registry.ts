import fs from "node:fs";
import path from "node:path";
import type { AssetPipelineStatus, ThirdPartyAssetRecord, ThirdPartyAssetRegistry } from "./schema";
import { validateRegistry } from "./validate";

export const DEFAULT_REGISTRY_REL = "assets/licenses/third-party-assets.json";

export function registryPath(projectRoot = process.cwd()): string {
  return path.join(projectRoot, DEFAULT_REGISTRY_REL);
}

export function loadThirdPartyRegistry(projectRoot = process.cwd()): ThirdPartyAssetRegistry {
  const full = registryPath(projectRoot);
  if (!fs.existsSync(full)) {
    return {
      version: "1.0.0",
      updatedAt: new Date().toISOString(),
      policyDoc: "docs/assets/THIRD_PARTY_ASSET_POLICY.md",
      records: [],
    };
  }
  const raw = JSON.parse(fs.readFileSync(full, "utf8")) as ThirdPartyAssetRegistry;
  return raw;
}

export function listByStatus(
  registry: ThirdPartyAssetRegistry,
  status: AssetPipelineStatus,
): ThirdPartyAssetRecord[] {
  return registry.records.filter((r) => r.status === status);
}

export function listBrowsableForAdmin(registry: ThirdPartyAssetRegistry): ThirdPartyAssetRecord[] {
  /** Admin may browse metadata; raw restricted packs stay private. */
  return registry.records.map((r) => ({
    ...r,
    privatePath: r.status === "RESTRICTED" || r.status === "REJECTED" ? undefined : r.privatePath,
  }));
}

export function assertRegistryValid(projectRoot = process.cwd()): void {
  const registry = loadThirdPartyRegistry(projectRoot);
  const result = validateRegistry(registry);
  if (!result.ok) {
    const summary = result.issues
      .slice(0, 8)
      .map((i) => `${i.code}: ${i.message}`)
      .join("; ");
    throw new Error(`Third-party asset registry invalid (${result.issues.length} issues): ${summary}`);
  }
}
