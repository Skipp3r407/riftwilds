import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import {
  allSolEconomyFlagsOff,
  solFlagDefaults,
  CURRENCY_CATALOG,
  getSolEconomyNetwork,
} from "@/lib/economy/sol";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

/** Public status of optional SOL economy — never enables spends. */
export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-status",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return jsonOk(
    {
      network: getSolEconomyNetwork(),
      allSolFlagsOff: allSolEconomyFlagsOff(),
      flags: solFlagDefaults(),
      legacyGates: {
        REAL_SOL_MARKETPLACE_ENABLED: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED,
        NFT_MINTING_ENABLED: featureFlagDefaults.NFT_MINTING_ENABLED,
        ONCHAIN_COLLECTIBLES_ENABLED: featureFlagDefaults.ONCHAIN_COLLECTIBLES_ENABLED,
      },
      currencies: CURRENCY_CATALOG,
      invariants: {
        corePlayRequiresSol: false,
        goldIsCreditsAlias: true,
        spectatorBetting: false,
      },
    },
    guard.requestId,
  );
}
