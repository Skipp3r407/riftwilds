import { PageHeader } from "@/components/shared/page-header";
import { MarketplaceComingStub } from "@/components/marketplace/coming-stub";

export const metadata = { title: "Commissions · Marketplace" };

export default function MarketplaceCommissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Player Marketplace"
        titleSlug="marketplace"
        title="Player commissions"
        description="Custom cosmetic / lore briefs between keepers. Escrow and dispute SLA are not live."
        status="Coming"
        statusTone="warn"
      />
      <MarketplaceComingStub
        title="Commission desk scaffold"
        blurb="Briefs, milestones, and delivery review UI will land after trade double-confirm hardens."
        ideas={[
          "Cosmetic-only deliverables",
          "Double-confirm accept + delivery",
          "No competitive-power commissions",
        ]}
      />
    </div>
  );
}
