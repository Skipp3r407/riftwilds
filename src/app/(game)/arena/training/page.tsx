import { TrainingBattle } from "@/components/arena/training-battle";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import Link from "next/link";

export const metadata = { title: "Arena · Training" };

export default function ArenaTrainingPage() {
  if (!featureFlagDefaults.ARENA_ENABLED) {
    return (
      <div className="panel p-6">
        <h1 className="font-display text-2xl text-white">Arena paused</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">ARENA_ENABLED is false.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
            Riftwilds Arena
          </p>
          <h1 className="font-display text-3xl text-white">Practice</h1>
        </div>
        <Link href="/arena" className="btn-secondary focus-ring text-sm">
          Arena hub
        </Link>
      </div>
      <TrainingBattle />
    </div>
  );
}
