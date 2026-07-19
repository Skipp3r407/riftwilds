import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CollectibleBrowser } from "@/components/economy/sol";

export const metadata = {
  title: "Collectible Editions",
  description:
    "Cosmetic card editions linked to TCG gameplay cards — never competitive power.",
};

export default function CollectiblesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Cosmetics"
        titleSlug="collectibles"
        title="Collectible Editions"
        description={
          <>
            Browse artwork editions tied to Rift Battle cards. Ownership is cosmetic — deck legality
            and stats use gameplay copies from your binder.
          </>
        }
        status="Off-chain"
        statusTone="warn"
        actions={
          <>
            <Link href="/tcg/collection" className="btn-primary focus-ring">
              Card Binder
            </Link>
            <Link href="/wallet" className="btn-secondary focus-ring">
              Wallet Center
            </Link>
            <Link href="/marketplace" className="btn-secondary focus-ring">
              Marketplace
            </Link>
          </>
        }
      />
      <CollectibleBrowser />
    </div>
  );
}
