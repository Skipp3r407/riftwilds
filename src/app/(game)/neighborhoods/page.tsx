import Link from "next/link";
import { NeighborhoodsHub } from "@/components/housing/neighborhoods-hub";
import { PageHeader } from "@/components/shared/page-header";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Neighborhoods" };

export default function NeighborhoodsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Shared exteriors"
        titleSlug="homestead"
        title="Player Neighborhoods"
        description="Roads, parks, districts, and community projects in the shared world. Step through your door into a private home instance. Kingdoms and wars stay future."
        status={featureFlagDefaults.PLAYER_NEIGHBORHOODS_ENABLED ? "Open" : "Flagged off"}
        statusTone={featureFlagDefaults.PLAYER_NEIGHBORHOODS_ENABLED ? "live" : "warn"}
        actions={
          <>
            <Link href="/housing" className="btn-secondary focus-ring text-sm">
              Housing hub
            </Link>
            <Link href="/live-world" className="btn-secondary focus-ring text-sm">
              Enter Live World
            </Link>
          </>
        }
      />
      <NeighborhoodsHub />
    </div>
  );
}
