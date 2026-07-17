import Link from "next/link";
import { LeaderboardsHud } from "@/components/leaderboards";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Arena · Leaderboard" };

export default function ArenaLeaderboardPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Riftwilds Arena"
        titleSlug="arena"
        title="Arena Leaderboard"
        description="Seasonal Arena Points and ranks. Points are earn-only, non-transferable, and have no monetary value."
        status="Seasonal"
        statusTone="info"
        actions={
          <Link href="/leaderboards" className="btn-secondary focus-ring">
            Full leaderboards HUD
          </Link>
        }
      />
      <LeaderboardsHud defaultTab="arena" showNoWagering />
    </div>
  );
}
