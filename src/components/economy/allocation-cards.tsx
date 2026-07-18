import Image from "next/image";
import {
  getActiveTreasuryPolicy,
  type AllocationBucket,
  type AllocationBucketId,
} from "@/lib/config/treasury-policy";
import { ALLOCATION_BUCKET_ART } from "@/lib/revenue/revenue-art";
import { cn } from "@/lib/utils/cn";

const ANCHOR_BY_ID: Record<AllocationBucketId, string> = {
  GROWTH: "growth",
  PET_REWARDS: "pet-rewards",
  OPERATIONS: "operations",
  EVENTS: "events",
  EMERGENCY: "emergency-reserve",
};

const VISIBLE_PURPOSE_COUNT = 4;

type AllocationCardsProps = {
  allocations?: AllocationBucket[];
  className?: string;
  /** Hide the built-in heading when the parent already provides one. */
  hideHeading?: boolean;
};

function AllocationCard({ bucket }: { bucket: AllocationBucket }) {
  const visible = bucket.purpose.slice(0, VISIBLE_PURPOSE_COUNT);
  const hiddenCount = bucket.purpose.length - visible.length;
  const art = ALLOCATION_BUCKET_ART[bucket.id];
  const accent = art?.accent ?? bucket.color;

  return (
    <article
      id={ANCHOR_BY_ID[bucket.id]}
      className="panel relative min-h-[14rem] scroll-mt-24 overflow-hidden p-0 sm:min-h-[15rem]"
      style={{ borderLeftColor: accent, borderLeftWidth: "3px" }}
    >
      {art ? (
        <Image
          src={art.imageSrc}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center"
          aria-hidden
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.96)] via-[rgba(6,12,24,0.84)] to-[rgba(6,12,24,0.45)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.55)] via-transparent to-[rgba(6,12,24,0.25)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-90"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="flex items-start gap-3">
          {art ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.25)] bg-[rgba(6,12,24,0.55)] shadow-[0_0_18px_rgba(61,231,255,0.12)] sm:h-14 sm:w-14">
              <Image
                src={art.iconSrc}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                aria-hidden
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-base text-white drop-shadow-sm">
                {bucket.label}
              </h3>
              <span
                className="font-display text-2xl tabular-nums drop-shadow-sm"
                style={{ color: accent }}
              >
                {bucket.percent}%
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[rgba(220,230,245,0.88)] drop-shadow-sm">
          {bucket.description}
        </p>

        <ul className="mt-4 space-y-1.5 text-sm text-[rgba(200,214,232,0.88)]">
          {visible.map((item) => (
            <li key={item} className="flex gap-2">
              <span style={{ color: accent }} aria-hidden>
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li className="text-xs italic text-[rgba(180,198,220,0.8)]">
              + {hiddenCount} more purpose{hiddenCount === 1 ? "" : "s"}
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}

export function AllocationCards({
  allocations,
  className,
  hideHeading = false,
}: AllocationCardsProps) {
  const policy = getActiveTreasuryPolicy();
  const buckets = allocations ?? policy.allocations;
  const Wrapper = hideHeading ? "div" : "section";

  return (
    <Wrapper
      id={hideHeading ? undefined : "treasury-allocation"}
      className={cn("scroll-mt-24 space-y-4", className)}
      aria-labelledby={hideHeading ? undefined : "treasury-allocation-heading"}
    >
      {hideHeading ? null : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="treasury-allocation-heading"
              className="font-display text-xl text-white"
            >
              Revenue allocation
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {policy.label} ·{" "}
              <span className="uppercase tracking-wider text-[var(--amber)]">
                {policy.status}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {buckets.map((bucket) => (
          <AllocationCard key={bucket.id} bucket={bucket} />
        ))}
      </div>
    </Wrapper>
  );
}
