import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { getSessionContext } from "@/lib/auth/session";
import {
  listBrowsableForAdmin,
  loadThirdPartyRegistry,
} from "@/lib/assets/third-party/registry";
import { validateRegistry } from "@/lib/assets/third-party/validate";
import type { AssetPipelineStatus } from "@/lib/assets/third-party/schema";

/**
 * Admin third-party asset library stub.
 * Browse + metadata only. Does not expose restricted raw pack bytes.
 * Approve/reject mutations are stubs pending product approval of the pipeline.
 */
export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session || session.role !== "admin") {
    return jsonError("Admin only", 403, "forbidden");
  }

  const guard = await withApiGuard({
    bucket: "admin-asset-library",
    limit: 60,
    clientKey: session.userId,
    auditAction: "admin_asset_library_list",
    actorId: session.userId,
  });
  if (!guard.ok) return guard.response;

  const registry = loadThirdPartyRegistry();
  const validation = validateRegistry(registry);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") as AssetPipelineStatus | null;
  let records = listBrowsableForAdmin(registry);
  if (status) {
    records = records.filter((r) => r.status === status);
  }

  return jsonOk(
    {
      version: registry.version,
      updatedAt: registry.updatedAt,
      policyDoc: registry.policyDoc,
      validationOk: validation.ok,
      issueCount: validation.issues.length,
      records,
      note: "Raw packs under private-assets/ are never served by this API.",
    },
    guard.requestId,
  );
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session || session.role !== "admin") {
    return jsonError("Admin only", 403, "forbidden");
  }

  const guard = await withApiGuard({
    bucket: "admin-asset-library-write",
    limit: 20,
    clientKey: session.userId,
    auditAction: "admin_asset_library_mutate",
    actorId: session.userId,
  });
  if (!guard.ok) return guard.response;

  let body: { action?: string; id?: string } = {};
  try {
    body = (await request.json()) as { action?: string; id?: string };
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json", guard.requestId);
  }

  const action = body.action;
  if (action !== "approve" && action !== "reject" && action !== "request_license_review") {
    return jsonError(
      "Stub only — supported actions later: approve | reject | request_license_review",
      400,
      "stub_not_implemented",
      guard.requestId,
    );
  }

  return jsonOk(
    {
      stub: true,
      accepted: false,
      message:
        "Mutation scaffolding only. Human review of docs/assets/ASSET_DISCOVERY_CANDIDATES.md required before approve writes are enabled.",
      action,
      id: body.id ?? null,
    },
    guard.requestId,
  );
}
