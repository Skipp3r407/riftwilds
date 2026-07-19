import Link from "next/link";
import { SoundscapeMount } from "@/components/audio/soundscape-mount";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";
import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { RiftArenaHub } from "@/components/arena/rift-arena-hub";
import { PageHeader, StatusChip } from "@/components/shared/page-header";

export const metadata = { title: "Rift Arena" };

export default function ArenaHomePage() {
  if (!featureFlagDefaults.RIFT_ARENA_HUB_ENABLED) {
    return (
      <div className="space-y-6">
        <PageHeader
          kicker="Paused"
          titleSlug="arena"
          title="Rift Arena"
          description="Hub flag is off. Practice Board remains available."
          status="Paused"
          statusTone="warn"
          actions={
            <Link href="/tcg/battle" className="btn-primary focus-ring">
              Practice Board
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SoundscapeMount mode="arena" fadeMs={1000} />
      <PageHeader
        kicker="Skill competition"
        titleSlug="arena"
        title="Rift Arena"
        description="Free skill card duels by default. Invite friends, train vs AI, browse ladders and calendars. SOL Arena is a separate optional mode and stays disabled."
        status="Live · Free"
        statusTone="live"
        actions={
          <>
            <Link href="/tcg/battle" className="btn-primary focus-ring">
              Practice vs Kael
            </Link>
            <Link href="/tcg/deck-builder" className="btn-secondary focus-ring">
              Deck Atelier
            </Link>
          </>
        }
      />

      <ArenaNoWageringBanner />

      <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <StatusChip tone="danger">No wagering</StatusChip>
        <StatusChip tone="danger">SOL stakes OFF</StatusChip>
        REAL_VALUE_WAGERING_ENABLED={String(REAL_VALUE_WAGERING_ENABLED)} ·
        RIFT_ARENA_SOL_STAKES_ENABLED=
        {String(featureFlagDefaults.RIFT_ARENA_SOL_STAKES_ENABLED)}
      </p>

      <RiftArenaHub />
    </div>
  );
}
