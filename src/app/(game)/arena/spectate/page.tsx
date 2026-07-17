import {
  ArenaNoWageringBanner,
  CommunityPredictionDisclaimer,
} from "@/components/arena/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Arena · Spectate" };

export default function ArenaSpectatePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-white">Spectate</h1>
      <ArenaNoWageringBanner />
      <CommunityPredictionDisclaimer />
      <div className="panel p-6 text-sm text-[var(--text-muted)]">
        Live World arena viewing and Community Predictions (no stake, no prize) arrive in Phase 2.
        SPECTATOR_MODE_ENABLED={String(featureFlagDefaults.SPECTATOR_MODE_ENABLED)}.
        COMMUNITY_PREDICTIONS_ENABLED={String(featureFlagDefaults.COMMUNITY_PREDICTIONS_ENABLED)}.
      </div>
    </div>
  );
}
