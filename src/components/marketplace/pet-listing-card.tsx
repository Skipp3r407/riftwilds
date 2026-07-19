import { GameImage } from "@/components/assets/game-image";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { resolveMarketplacePetArt } from "@/lib/marketplace/product-icons";
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

export function PetListingCard({ listing, selected, onSelect, className }: Props) {
  const pet = listing.pet;
  if (!pet) return null;

  const art = resolveMarketplacePetArt(pet.speciesSlug);
  const credits = listingCredits(listing);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group panel relative w-full overflow-hidden p-3 text-left transition duration-200",
        "hover:-translate-y-0.5 hover:border-[var(--mint)]/50 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
        selected && "border-[var(--mint)] ring-1 ring-[var(--mint)]/40",
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="panel-inset relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(110,231,183,0.14)] to-transparent"
            aria-hidden
          />
          <GameImage
            src={art}
            alt=""
            width={72}
            height={72}
            className="relative z-[1] object-contain transition duration-200 group-hover:scale-105"
            fallbackSrc={`/assets/pets/${pet.speciesSlug}.png`}
            showDevBadge={false}
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--mint)]">
                Hatched pet · Gen {pet.generation}
                {pet.founderStatus ? " · Founder" : ""}
              </p>
              <h3 className="mt-1 font-display text-base text-white">{listing.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {pet.speciesName} · {pet.affinity} · {pet.rarity}
              </p>
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

      {pet.shortBio ? (
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-3">
          {pet.shortBio}
        </p>
      ) : null}
      {pet.originStory ? (
        <p className="mt-2 text-[11px] text-white/80">
          <span className="text-[var(--text-muted)]">Origin · </span>
          {pet.originStory}
        </p>
      ) : null}
      {pet.uniqueHabit ? (
        <p className="mt-1 text-[11px] text-white/80">
          <span className="text-[var(--text-muted)]">Habit · </span>
          {pet.uniqueHabit}
        </p>
      ) : null}
      {pet.personalBioPreview ? (
        <p className="mt-2 text-[11px] italic text-[var(--text-muted)] line-clamp-2">
          {pet.personalBioPreview}
        </p>
      ) : null}

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-[var(--text-muted)]">Level / evolution</dt>
          <dd className="mt-0.5 text-white">
            Lv {pet.level} · {pet.evolutionStage}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Battle record</dt>
          <dd className="mt-0.5 text-white">
            {pet.battleRecord.wins}W / {pet.battleRecord.losses}L
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Abilities</dt>
          <dd className="mt-0.5 text-white">{pet.abilities.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Ultimate</dt>
          <dd className="mt-0.5 text-white">{pet.ultimate ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Breeding</dt>
          <dd className="mt-0.5 text-white">
            {pet.breeding.available
              ? `${pet.breeding.usesRemaining} uses remaining`
              : "Not available"}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--text-muted)]">Genetics</dt>
          <dd className="mt-0.5 text-white">{pet.geneticsSummary}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-md border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] p-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Bundle mode
        </p>
        <p className="mt-1 text-sm text-white">
          {listing.bundleMode === "PET_PLUS_LOADOUT" ? "Pet + selected loadout" : "Pet only"}
        </p>
        {listing.bundleMode === "PET_PLUS_LOADOUT" ? (
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            {listing.bundledItems.map((item) => (
              <li key={item.key}>
                • {item.name}
                {item.slot ? ` (${item.slot})` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Equipped items are not transferred unless explicitly bundled.
          </p>
        )}
      </div>
    </button>
  );
}
