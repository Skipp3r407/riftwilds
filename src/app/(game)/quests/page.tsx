import { QuestBoard } from "@/components/quests/quest-board";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { RiftPageShell } from "@/components/ui/rift-page-shell";
import { QUEST_CATALOG } from "@/game/quests/quest-catalog";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export const metadata = { title: "Quests" };

export default function QuestsPage() {
  const live = featureFlagDefaults.QUESTS_ENABLED;

  return (
    <RiftPageShell mood="hearth">
      <div className="space-y-4">
        <PageHeader
          kicker="Duel contracts"
          titleSlug="quests"
          title="Quests"
          description={
            <>
              Rift Battle, binder, hatchery, and care contracts — Living World habitat steps are
              soft-deferred for launch. Rewards are keeper XP, Credits, care items, and Rift Points —
              not real-money payouts.{" "}
              <span className="text-[var(--text-dim)]">
                {QUEST_CATALOG.length} definitions loaded
                {live ? "" : " · progress tracks from practice battles & binder locally"}.
              </span>
            </>
          }
          status={live ? "Live" : "TCG demo"}
          statusTone={live ? "live" : "warn"}
          actions={!live ? <StatusChip tone="warn">BATTLE TRACKING</StatusChip> : null}
        />
        <QuestBoard />
      </div>
    </RiftPageShell>
  );
}
