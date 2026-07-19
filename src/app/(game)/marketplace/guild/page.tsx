import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MarketplaceComingStub } from "@/components/marketplace/coming-stub";

export const metadata = { title: "Guild marketplace · Marketplace" };

export default function MarketplaceGuildPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Guild vendors"
        description="Guild stalls, contracts, and blueprints for cosmetics / habitat — never pay-to-win decks."
        status="Coming"
        statusTone="warn"
        actions={
          <Link href="/guilds" className="btn-secondary focus-ring text-sm">
            Guilds hub
          </Link>
        }
      />
      <MarketplaceComingStub
        title="Guild marketplace scaffold"
        blurb="Vendor slots, breeding cosmetics, and contract boards are documented for a later phase."
        ideas={[
          "Guild-branded cosmetic vendors",
          "Blueprint / habitat kits (Living World)",
          "Contribution-gated listings",
        ]}
      />
    </div>
  );
}
