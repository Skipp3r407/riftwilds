import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { PurchaseSimPanel, WalletCenter } from "@/components/economy/sol";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = {
  title: "Wallet Center",
  description: "Optional Solana wallet connection, network badge, and soft purchase simulation.",
};

export default function WalletCenterPage() {
  const solWallet = featureFlagDefaults.SOL_WALLET_ENABLED;

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Optional Web3"
        titleSlug="wallet"
        title="Wallet Center"
        description={
          <>
            Connect a wallet for identity and future optional SOL cosmetics. Gold and Rift Shards
            power play. SOL spend UX is{" "}
            <strong className="text-[var(--amber)]">
              {solWallet ? "enabled" : "disabled / coming soon"}
            </strong>
            .
          </>
        }
        status={solWallet ? "SOL UX on" : "Soft mode"}
        statusTone={solWallet ? "live" : "warn"}
        actions={
          <>
            <Link href="/collectibles" className="btn-primary focus-ring">
              Collectibles
            </Link>
            <Link href="/economy/credits" className="btn-secondary focus-ring">
              Credits guide
            </Link>
          </>
        }
      />

      <WalletCenter />
      <PurchaseSimPanel />
    </div>
  );
}
