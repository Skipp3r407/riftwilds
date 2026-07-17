import { BattleHistoryList } from "@/components/arena/battle-history";
import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import Link from "next/link";

export const metadata = { title: "Arena · History" };

export default function ArenaHistoryPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
            Riftwilds Arena
          </p>
          <h1 className="font-display text-3xl text-white">Battle history</h1>
        </div>
        <Link href="/arena/training" className="btn-secondary focus-ring text-sm">
          Train again
        </Link>
      </div>
      <ArenaNoWageringBanner />
      <BattleHistoryList />
    </div>
  );
}
