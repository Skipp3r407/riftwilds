/**
 * Admin economy ops stubs for SOL layer — requires caller to enforce admin auth.
 */

import { solFlagDefaults, allSolEconomyFlagsOff } from "@/lib/economy/sol/flags";
import { getSolEconomyAnalyticsSnapshot } from "@/lib/economy/sol/analytics";
import { getEconomyAdminSnapshot } from "@/lib/economy/admin-ops";
import { listTournamentEconomyConfigs } from "@/lib/economy/sol/tournament-sol";
import { DEFAULT_SOL_MARKETPLACE_FEES, serializeFeePreview, calculateSolMarketplaceFees } from "@/lib/economy/sol/marketplace-sol";
import { CURRENCY_CATALOG } from "@/lib/economy/sol/currencies";
import { getSolEconomyNetwork } from "@/lib/economy/sol/wallet-challenge";

export function getSolEconomyAdminPanel() {
  const feeExample = serializeFeePreview(
    calculateSolMarketplaceFees(1_000_000_000n, DEFAULT_SOL_MARKETPLACE_FEES),
  );
  return {
    network: getSolEconomyNetwork(),
    allSolFlagsOff: allSolEconomyFlagsOff(),
    flags: solFlagDefaults(),
    currencies: CURRENCY_CATALOG,
    marketplaceFees: DEFAULT_SOL_MARKETPLACE_FEES,
    feeExample1Sol: feeExample,
    tournaments: listTournamentEconomyConfigs(),
    creditsAdmin: getEconomyAdminSnapshot(),
    analytics: getSolEconomyAnalyticsSnapshot(),
    warnings: [
      "Do not enable SOL_* flags in production without legal + escrow review.",
      "Never store production private keys in source or client bundles.",
      "Dev network only: devnet or local validator.",
    ],
  };
}
