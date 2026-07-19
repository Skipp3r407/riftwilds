import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { ingestViaAdapter, type RevenueSourceKey } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

/** POST Receive Revenue — admin/demo ingest via modular adapters. */
export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-ingest",
    limit: 40,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_ingest",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let body: {
    sourceKey?: RevenueSourceKey;
    amountLamports?: string;
    amountSol?: number;
    senderAddress?: string;
    txSignature?: string;
    idempotencyKey?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request", guard.requestId);
  }

  const sourceKey = body.sourceKey ?? "pumpfun_creator_fees";
  try {
    const result = await ingestViaAdapter(
      sourceKey,
      {
        amountLamports: body.amountLamports,
        amountSol: body.amountSol,
        senderAddress: body.senderAddress,
        txSignature: body.txSignature,
        id: body.idempotencyKey,
      },
      { actorId: auth.session.userId, requestId: guard.requestId },
    );
    return jsonOk(result, guard.requestId);
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Ingest failed",
      400,
      "ingest_failed",
      guard.requestId,
    );
  }
}
