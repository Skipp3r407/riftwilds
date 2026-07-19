import Link from "next/link";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { HousingHub } from "@/components/housing/housing-hub";
import { PageHeader } from "@/components/shared/page-header";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Housing" };

export default function HousingPage() {
  return (
    <div className="space-y-6">
      <SoundscapeMount mode="housing" fadeMs={850} />
      <PageHeader
        kicker="Private instances"
        titleSlug="homestead"
        title="Player Housing"
        description="Buy or build homes, decorate private interiors, invite friends, farm, craft, and host events. Neighborhood exteriors are shared — interiors stay yours."
        status={featureFlagDefaults.PLAYER_HOUSING_ENABLED ? "Open" : "Flagged off"}
        statusTone={featureFlagDefaults.PLAYER_HOUSING_ENABLED ? "live" : "warn"}
        actions={
          <>
            <Link href="/neighborhoods" className="btn-secondary focus-ring text-sm">
              Neighborhoods
            </Link>
            <Link href="/homestead" className="btn-secondary focus-ring text-sm">
              Classic Homestead
            </Link>
            <Link href="/live-world" className="btn-secondary focus-ring text-sm">
              Live World
            </Link>
          </>
        }
      />
      <HousingHub />
    </div>
  );
}
