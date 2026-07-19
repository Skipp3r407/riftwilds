import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  getDashboard,
  listRevenueAdapters,
  updateSettings,
  updateWalletAddress,
  addCustomWallet,
} from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function GET(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-config",
    limit: 60,
    clientKey: auth.session.userId,
  });
  if (!guard.ok) return guard.response;

  const dash = getDashboard();
  return jsonOk(
    {
      settings: dash.settings,
      wallets: dash.wallets,
      rules: dash.rules,
      adapters: listRevenueAdapters().map((a) => ({
        key: a.key,
        label: a.label,
        description: a.description,
      })),
      flags: {
        TREASURY_OPS_ENABLED: featureFlagDefaults.TREASURY_OPS_ENABLED,
        TREASURY_OPS_REAL_TRANSFERS: featureFlagDefaults.TREASURY_OPS_REAL_TRANSFERS,
        TREASURY_OPS_MONITOR_ENABLED: featureFlagDefaults.TREASURY_OPS_MONITOR_ENABLED,
      },
    },
    guard.requestId,
  );
}

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-config-write",
    limit: 30,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_config_write",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let body: {
    action?: "update_settings" | "update_wallet" | "add_wallet";
    settings?: Parameters<typeof updateSettings>[0]["patch"];
    walletId?: string;
    address?: string;
    name?: string;
    description?: string;
    percentBps?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request", guard.requestId);
  }

  try {
    if (body.action === "update_wallet" && body.walletId && body.address) {
      const wallet = updateWalletAddress({
        walletId: body.walletId,
        address: body.address,
        actorId: auth.session.userId,
        requestId: guard.requestId,
      });
      return jsonOk({ wallet }, guard.requestId);
    }
    if (body.action === "add_wallet" && body.name && body.address) {
      const wallet = addCustomWallet({
        name: body.name,
        description: body.description,
        address: body.address,
        percentBps: body.percentBps,
        actorId: auth.session.userId,
        requestId: guard.requestId,
      });
      return jsonOk({ wallet }, guard.requestId);
    }
    if (body.settings) {
      // Hard block enabling real transfers unless feature flag allows
      if (body.settings.realTransfersEnabled && !featureFlagDefaults.TREASURY_OPS_REAL_TRANSFERS) {
        return jsonError(
          "TREASURY_OPS_REAL_TRANSFERS flag is off",
          403,
          "forbidden",
          guard.requestId,
        );
      }
      const settings = updateSettings({
        patch: body.settings,
        actorId: auth.session.userId,
        requestId: guard.requestId,
      });
      return jsonOk({ settings }, guard.requestId);
    }
    return jsonError("Unknown action", 400, "bad_request", guard.requestId);
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Config update failed",
      400,
      "config_failed",
      guard.requestId,
    );
  }
}
