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
        description="Seasonal Riftwilds ladders for Arena Points, care, and collection. Live ranking APIs are still wiring up — this HUD runs on demo data that mirrors the final board."
        status="Demo live"
        statusTone="live"
      />
      <LeaderboardsHud />
    </div>
  );
}
