import { PageHeader } from "@/components/shared/page-header";
import { MarketplaceComingStub } from "@/components/marketplace/coming-stub";

export const metadata = { title: "Rentals · Marketplace" };

export default function MarketplaceRentalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Cosmetic rentals"
        description="Time-boxed sleeve / board / showcase rentals. Competitive cards cannot be rented for power."
        status="Coming"
        statusTone="warn"
      />
      <MarketplaceComingStub
        title="Rental ledger not live"
        blurb="Data model includes RENTAL listing type. Settlement, duration caps, and return escrow remain scaffolded."
        ideas={[
          "Max rental window + non-transfer during rent",
          "Credits fee with platform cut display",
          "Never rent base competitive card power",
        ]}
      />
    </div>
  );
}
