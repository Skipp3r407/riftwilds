import { ArenaNoWageringBanner } from "@/components/arena/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { RANKED_NORMALIZATION } from "@/game/arena/ranked-normalization";
import { getLadderStub, RANKED_TIERS } from "@/game/arena/ranked-ladder";
import { listQueueDepth } from "@/game/arena/matchmaking";
import { BOND_CONFIG } from "@/game/arena/bond";

export const metadata = { title: "Arena · Ranked" };

export default function ArenaRankedPage() {
  const ladder = getLadderStub();
  const queues = listQueueDepth();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-white">Ranked</h1>
      <ArenaNoWageringBanner />
      <div className="panel space-y-3 p-6 text-sm text-[var(--text-muted)]">
        <p>
          Seasonal tiers {RANKED_TIERS.join(" → ")}. RANKED_DUELS_ENABLED=
          {String(featureFlagDefaults.RANKED_DUELS_ENABLED)}. Arena Points never purchase
          tradable assets. Care/Bond normalized to {BOND_CONFIG.RANKED_NORMALIZED_BOND}.
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
          <li>• Matchmaking queue depth (stub): {JSON.stringify(queues)}</li>
        </ul>
      </div>
      <div className="panel p-6">
        <h2 className="font-display text-lg text-white">Ladder stub</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          {ladder.map((e) => (
            <li key={e.playerId} className="flex flex-wrap justify-between gap-2 border-b border-[var(--stroke)] py-2">
              <span className="text-white">{e.displayName}</span>
              <span>
                {e.tier} · {e.rating} · {e.wins}W/{e.losses}L
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
