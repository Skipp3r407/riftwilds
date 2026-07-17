import type { SpeciesAbilityDef, SpeciesBaseStats, SpeciesTraitDef } from "@/game/creatures/rpg-types";
import { GameImage } from "@/components/assets/game-image";
import { itemIconFallback, itemIconPath } from "@/lib/assets/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  baseStats: SpeciesBaseStats;
  abilities: SpeciesAbilityDef[];
  traits: SpeciesTraitDef[];
  compact?: boolean;
  className?: string;
};

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <span className="tabular-nums text-white">{value}</span>
    </div>
  );
}

export function SpeciesKitPanel({
  baseStats,
  abilities,
  traits,
  compact = false,
  className,
}: Props) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h4 className="font-display text-sm text-white">Base stats</h4>
        <div
          className={cn(
            "mt-2 grid gap-1.5 rounded-md border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] p-3",
            compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-5",
          )}
        >
          <StatRow label="HP" value={baseStats.hp} />
          <StatRow label="ATK" value={baseStats.attack} />
          <StatRow label="DEF" value={baseStats.defense} />
          <StatRow label="SPD" value={baseStats.speed} />
          <StatRow label="EN" value={baseStats.energy} />
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm text-white">Abilities</h4>
        <ul className="mt-2 space-y-2">
          {abilities.map((ab) => (
            <li
              key={ab.id}
              className="rounded-md border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] px-3 py-2"
            >
              <div className="flex items-start gap-3">
                <GameImage
                  src={itemIconPath("abilities", ab.id)}
                  fallbackSrc={itemIconFallback("abilities", ab.id)}
                  alt=""
                  width={36}
                  height={36}
                  showDevBadge={false}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-white">{ab.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">
                      {ab.category}
                      {ab.power > 0 ? ` · Pwr ${ab.power}` : ""}
                      {ab.energyCost > 0 ? ` · EN ${ab.energyCost}` : ""}
                      {ab.cooldown > 0 ? ` · CD ${ab.cooldown}` : ""}
                    </span>
                  </div>
                  {!compact ? (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{ab.description}</p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-display text-sm text-white">Traits</h4>
        <ul className="mt-2 space-y-2">
          {traits.map((tr) => (
            <li
              key={tr.id}
              className="rounded-md border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] px-3 py-2"
            >
              <div className="flex items-start gap-3">
                <GameImage
                  src={itemIconPath("abilities", tr.id)}
                  fallbackSrc={itemIconFallback("abilities", tr.id)}
                  alt=""
                  width={36}
                  height={36}
                  showDevBadge={false}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-[var(--amber)]">{tr.name}</span>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{tr.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
