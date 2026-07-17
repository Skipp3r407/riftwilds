import { LoadoutBuilder } from "@/components/arena/loadout-builder";
import Link from "next/link";

export const metadata = { title: "Arena · Loadout" };

export default function ArenaLoadoutPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
            Riftwilds Arena
          </p>
          <h1 className="font-display text-3xl text-white">Loadout</h1>
        </div>
        <Link href="/arena/training" className="btn-primary focus-ring text-sm">
          Train with loadout
        </Link>
      </div>
      <LoadoutBuilder />
    </div>
  );
}
