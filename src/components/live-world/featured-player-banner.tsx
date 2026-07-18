"use client";

type FeaturedSlot = {
  title: string;
  displayName: string;
  regionSlug: string;
};

type Props = {
  featured: FeaturedSlot[];
};

const TITLE_TONE: Record<string, string> = {
  "Town Hero": "text-[var(--amber,#ffb84d)]",
  "Master Merchant": "text-[var(--cyan)]",
  "Community Favorite": "text-[var(--emerald)]",
};

export function FeaturedPlayerBanner({ featured }: Props) {
  if (!featured.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-25 flex justify-center px-3 md:top-16">
      <div className="max-w-xl rounded-full border border-[var(--stroke)] bg-[rgba(8,12,22,0.75)] px-4 py-1.5 text-center backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
          Featured keepers · cosmetic only
        </p>
        <p className="mt-0.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[11px]">
          {featured.map((f) => (
            <span key={`${f.title}-${f.displayName}`} className={TITLE_TONE[f.title] ?? "text-white"}>
              {f.title}: {f.displayName}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
