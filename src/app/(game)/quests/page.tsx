import { QuestBoard } from "@/components/quests/quest-board";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { QUEST_CATALOG } from "@/game/quests/quest-catalog";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Quests" };

export default function QuestsPage() {
  const live = featureFlagDefaults.QUESTS_ENABLED;

  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Missions"
        titleSlug="quests"
        title="Quests"
        description={
          <>
            Story arcs, rotating dailies, and exploration contracts across The Riftwilds. Rewards
            are keeper XP, care items, and Arena Points — not real-money payouts.{" "}
            <span className="text-[var(--text-dim)]">
              {QUEST_CATALOG.length} definitions loaded
              {live ? "" : " · progress is demo-tracked locally until backend sync ships"}.
            </span>
          </>
        }
        status={live ? "Live" : "Phase 3"}
        statusTone={live ? "live" : "warn"}
        actions={!live ? <StatusChip tone="warn">DEMO TRACKING</StatusChip> : null}
      />
      <QuestBoard />
    </div>
  );
}
