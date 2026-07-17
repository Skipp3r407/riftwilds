import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Arena · Tournaments" };

export default function ArenaTournamentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-white">Tournaments</h1>
      <ArenaNoWageringBanner />
      <div className="panel p-6 text-sm text-[var(--text-muted)]">
        Free-entry brackets with predetermined prizes. No player-funded stakes at launch.
        TOURNAMENTS_ENABLED={String(featureFlagDefaults.TOURNAMENTS_ENABLED)}.
        SPONSORED_PRIZES_ENABLED={String(featureFlagDefaults.SPONSORED_PRIZES_ENABLED)}.
      </div>
    </div>
  );
}
