import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { runMonitorTick, type RevenueSourceKey } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

/** POST — run monitoring tick; optional simulateDeposit for local Pump.fun → treasury flow. */
export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-monitor-tick",
    limit: 30,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_monitor_tick",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let body: {
    simulateDeposit?: {
      amountLamports: string;
      sourceKey?: RevenueSourceKey;
      senderAddress?: string;
      txSignature?: string;
    };
    force?: boolean;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const result = await runMonitorTick({
    simulateDeposit: body.simulateDeposit,
    force: body.force,
    actorId: auth.session.userId,
    requestId: guard.requestId,
  });

  return jsonOk({ tick: result }, guard.requestId);
}
