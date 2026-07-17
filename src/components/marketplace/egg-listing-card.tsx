import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  listing: MarketplaceListingView;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function EggListingCard({ listing, selected, onSelect, className }: Props) {
  const egg = listing.egg;
  if (!egg) return null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "panel w-full p-4 text-left transition hover:border-[var(--cyan)]/50",
        selected && "border-[var(--cyan)] ring-1 ring-[var(--cyan)]/40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">
            Unopened egg · Gen {egg.generation}
          </p>
          <h3 className="mt-1 font-display text-lg text-white">{listing.title}</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{egg.eggType}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-white">{listing.priceSol} SOL</p>
          <p className="text-[10px] text-[var(--amber)]">{listing.currency}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--amber)]">
        Exact creature unknown until hatch — disclosed ranges only.
      </p>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-[var(--text-muted)]">Possible species</dt>
          <dd className="mt-0.5 text-white">{egg.possibleSpecies.slice(0, 4).join(", ")}…</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Possible affinities</dt>
          <dd className="mt-0.5 text-white">{egg.possibleAffinities.slice(0, 4).join(", ")}…</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Rarity range</dt>
          <dd className="mt-0.5 text-white">{egg.possibleRarityRange.join(" → ")}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Hatch time</dt>
          <dd className="mt-0.5 text-white">
            {egg.hatchTimeHours.min}–{egg.hatchTimeHours.max}h
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Source</dt>
          <dd className="mt-0.5 text-white">{egg.originalSource}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Parents</dt>
          <dd className="mt-0.5 text-white">
            {egg.parents?.map((p) => p.label).join(" × ") ?? "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded border border-[var(--stroke)] px-2 py-1 text-[var(--text-muted)]">
          Cosmetics: {egg.possibleCosmeticTraits.join(", ")}
        </span>
        <span className="rounded border border-[var(--stroke)] px-2 py-1 text-[var(--text-muted)]">
          Breedable: {egg.breedable ? "yes" : "no"}
        </span>
        <span className="rounded border border-[var(--stroke)] px-2 py-1 text-[var(--text-muted)]">
          Holder-reward eligible: {egg.holderRewardEligible ? "yes" : "no"}
        </span>
      </div>
    </button>
  );
}
