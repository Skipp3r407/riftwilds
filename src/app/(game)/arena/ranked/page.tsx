import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { RANKED_NORMALIZATION } from "@/game/arena/ranked-normalization";

export const metadata = { title: "Arena · Ranked" };

export default function ArenaRankedPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-white">Ranked</h1>
      <ArenaNoWageringBanner />
      <div className="panel space-y-3 p-6 text-sm text-[var(--text-muted)]">
        <p>
          Seasonal ranks Scout → Celestial. RANKED_DUELS_ENABLED=
          {String(featureFlagDefaults.RANKED_DUELS_ENABLED)}. Arena Points never purchase
          tradable assets.
        </p>
        <p className="text-[var(--amber)]">{RANKED_NORMALIZATION.disclosures.ranked}</p>
        <p>{RANKED_NORMALIZATION.disclosures.marketplace}</p>
        <ul className="space-y-1 text-xs">
          <li>
            • Normalized level: {RANKED_NORMALIZATION.normalizedLevel} (flag{" "}
            RANKED_EQUIPMENT_NORMALIZATION_ENABLED=
            {String(featureFlagDefaults.RANKED_EQUIPMENT_NORMALIZATION_ENABLED)})
          </li>
          <li>
            • Equipment attack bonus capped at{" "}
            {Math.round(RANKED_NORMALIZATION.equipAttackBonusCapOfBase * 100)}% of base
          </li>
          <li>
            • Paid ability uplift capped at {RANKED_NORMALIZATION.paidAbilityPowerCapBps} bps
            vs kit baseline
          </li>
          <li>• Implementation: `src/game/arena/ranked-normalization.ts` via `buildCombatant(..., rankedMode: true)`</li>
        </ul>
      </div>
    </div>
  );
}
