import { LeaderboardsHud } from "@/components/leaderboards";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Leaderboards" };

export default function LeaderboardsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Rankings"
        titleSlug="leaderboards"
        title="Leaderboards"
        description="Seasonal Rift Battles ladder — wins, win rate, and Card Binder progress. Legacy Arena Points stay secondary. Live ranking APIs are still wiring up; this HUD runs on demo data."
        status="Rift ladder"
        statusTone="live"
      />
      <LeaderboardsHud />
    </div>
  );
}
