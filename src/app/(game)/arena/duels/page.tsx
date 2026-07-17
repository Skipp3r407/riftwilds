import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import Link from "next/link";

export const metadata = { title: "Arena · Duels" };

export default function ArenaDuelsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-white">Duels</h1>
      <ArenaNoWageringBanner />
      <div className="panel p-6 text-sm text-[var(--text-muted)]">
        <p>
          Friend and public challenges arrive in Phase 2. CASUAL_DUELS_ENABLED=
          {String(featureFlagDefaults.CASUAL_DUELS_ENABLED)}.
        </p>
        <p className="mt-3">
          No real-money or token wagering is permitted.{" "}
          <Link href="/arena/training" className="text-[var(--cyan)] underline">
            Train against AI now
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
