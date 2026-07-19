import { GameImage } from "@/components/assets/game-image";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { resolveMarketplaceEggArt } from "@/lib/marketplace/product-icons";
import { cn } from "@/lib/utils/cn";

type Props = {
  listing: MarketplaceListingView;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

function listingCredits(listing: MarketplaceListingView): number {
  return (
    listing.priceCredits ??
    Math.round(Number.parseFloat(listing.priceSol) * 10_000)
  );
}

export function EggListingCard({ listing, selected, onSelect, className }: Props) {
  const egg = listing.egg;
  if (!egg) return null;

  const art = resolveMarketplaceEggArt(egg.sourceKind);
  const credits = listingCredits(listing);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group panel relative w-full overflow-hidden p-3 text-left transition duration-200",
        "hover:-translate-y-0.5 hover:border-[var(--cyan)]/55 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
        selected && "border-[var(--cyan)] ring-1 ring-[var(--cyan)]/40",
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="panel-inset relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(61,231,255,0.12)] to-transparent opacity-80"
            aria-hidden
          />
          <GameImage
            src={art}
            alt=""
            width={72}
            height={72}
            className="relative z-[1] object-contain transition duration-200 group-hover:scale-105"
            showDevBadge={false}
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">
                Unopened egg · Gen {egg.generation}
              </p>
              <h3 className="mt-1 font-display text-base text-white">{listing.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{egg.eggType}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-lg text-[var(--cyan)]">
                {credits.toLocaleString()}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">Credits</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">
                optional {listing.priceSol} SOL
              </p>
            </div>
          </div>
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
