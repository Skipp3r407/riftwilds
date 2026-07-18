import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { getEconomyHealth } from "@/lib/credits/ledger";
import {
  CREDITS_CONFIG_VERSION,
  CREDITS_DISCLAIMER,
  FAUCET_RULES,
  FAUCET_SINK_PAIRINGS,
  SINK_RULES,
} from "@/lib/credits/config";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "credits-health",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return jsonOk(
    {
      health: getEconomyHealth(),
      configVersion: CREDITS_CONFIG_VERSION,
      faucetRules: FAUCET_RULES,
      sinkRules: SINK_RULES,
      pairings: FAUCET_SINK_PAIRINGS,
      disclaimer: CREDITS_DISCLAIMER,
      note: "Alerts never auto-mutate extreme economy changes — admin review required.",
    },
    guard.requestId,
  );
}
