import { ProgressionPanel } from "@/components/progression/progression-panel";
import { PageHeader } from "@/components/shared/page-header";
import { RiftPageShell } from "@/components/ui/rift-page-shell";

export default function ProgressionPage() {
  return (
    <RiftPageShell mood="hearth">
      <div className="space-y-6">
        <PageHeader
          kicker="Keeper"
          titleSlug="progression"
          title="Progression"
          description="Level, XP, mastery, and prestige — earn through battles, quests, care, and exploration. Server-authoritative; never pay-to-win."
          status="XP Live"
          statusTone="info"
        />
        <ProgressionPanel />
      </div>
    </RiftPageShell>
  );
}
