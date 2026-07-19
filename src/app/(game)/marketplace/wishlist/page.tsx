import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { WishlistPanel } from "@/components/marketplace/wishlist-panel";

export const metadata = { title: "Wishlist · Marketplace" };

export default function MarketplaceWishlistPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Wishlist & watchlist"
        description="Save wants and watch auctions. Demo store is session-scoped on the server — not yet account-persisted."
        status="Live demo"
        statusTone="live"
        actions={
          <Link href="/marketplace" className="btn-primary focus-ring text-sm">
            Desk
          </Link>
        }
      />
      <WishlistPanel />
    </div>
  );
}
