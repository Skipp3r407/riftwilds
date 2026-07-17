import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  listing: MarketplaceListingView;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function PetListingCard({ listing, selected, onSelect, className }: Props) {
  const pet = listing.pet;
  if (!pet) return null;

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
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--mint)]">
            Hatched pet · Gen {pet.generation}
            {pet.founderStatus ? " · Founder" : ""}
          </p>
          <h3 className="mt-1 font-display text-lg text-white">{listing.title}</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {pet.speciesName} · {pet.affinity} · {pet.rarity}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-white">{listing.priceSol} SOL</p>
          <p className="text-[10px] text-[var(--amber)]">{listing.currency}</p>
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

      <div className="mt-3 rounded-md border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-3">
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
