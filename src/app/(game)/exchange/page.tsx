import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ExchangeDashboard } from "@/components/exchange/exchange-dashboard";
import { MarketplaceDisclaimer } from "@/components/economy";

export const metadata = {
  title: "Rift Exchange",
  description:
    "Optional entertainment rewards from skill, creation, cosmetics trade, and community contribution — never guaranteed earnings.",
};

export default function RiftExchangePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player economy · entertainment rewards"
        titleSlug="economy"
        title="Rift Exchange"
        description={
          <>
            A hub for optional reward paths — tournaments, Player Marketplace cosmetics, creators,
            events, and community vaults.{" "}
            <strong className="text-[var(--amber)]">No guaranteed SOL, profit, or passive income.</strong>{" "}
            Core play stays fun with Credits even if SOL is worth nothing.
          </>
        }
        status="Credits-first"
        statusTone="info"
        actions={
          <>
            <Link href="/marketplace" className="btn-primary focus-ring">
              Marketplace
            </Link>
            <Link href="/rewards" className="btn-secondary focus-ring">
              Rewards
            </Link>
            <Link href="/treasury" className="btn-secondary focus-ring">
              Treasury
            </Link>
          </>
        }
      >
        <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
          <li>• Earn via skill, creativity, contribution, and cosmetic trade — not match grinding for SOL.</li>
          <li>• Wallet optional · competitive power never for sale.</li>
          <li>• Reward ranges are illustrative entertainment bands only.</li>
        </ul>
        <MarketplaceDisclaimer className="mt-4" />
      </PageHeader>

      <ExchangeDashboard />
    </div>
  );
}
