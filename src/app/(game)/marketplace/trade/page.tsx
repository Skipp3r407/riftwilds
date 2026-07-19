import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { TradeDeskShell } from "@/components/marketplace/trade-desk-shell";

export const metadata = { title: "Trade requests · Marketplace" };

export default function MarketplaceTradePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Trade requests"
        description="Item-for-item shell with double-confirm. Escrow settlement is not live — cosmetics and collectibles only."
        status="Shell"
        statusTone="warn"
        actions={
          <>
            <Link href="/marketplace" className="btn-primary focus-ring text-sm">
              Desk
            </Link>
            <Link href="/exchange" className="btn-secondary focus-ring text-sm">
              Rift Exchange
            </Link>
          </>
        }
      />
      <TradeDeskShell />
    </div>
  );
}
