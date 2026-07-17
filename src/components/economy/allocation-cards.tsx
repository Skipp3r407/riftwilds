import {
  getActiveTreasuryPolicy,
  type AllocationBucket,
  type AllocationBucketId,
} from "@/lib/config/treasury-policy";
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
};

function AllocationCard({ bucket }: { bucket: AllocationBucket }) {
  const visible = bucket.purpose.slice(0, VISIBLE_PURPOSE_COUNT);
  const hiddenCount = bucket.purpose.length - visible.length;

  return (
    <article
      id={ANCHOR_BY_ID[bucket.id]}
      className="panel scroll-mt-24 p-5"
      style={{ borderLeftColor: bucket.color, borderLeftWidth: "3px" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base text-white">{bucket.label}</h3>
        <span
          className="font-display text-2xl tabular-nums"
          style={{ color: bucket.color }}
        >
          {bucket.percent}%
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
        {bucket.description}
      </p>

      <ul className="mt-4 space-y-1.5 text-sm text-[var(--text-muted)]">
        {visible.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[var(--cyan)]" aria-hidden>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
        {hiddenCount > 0 ? (
          <li className="text-xs italic text-[var(--text-muted)]">
            + {hiddenCount} more purpose{hiddenCount === 1 ? "" : "s"}
          </li>
        ) : null}
      </ul>
    </article>
  );
}

export function AllocationCards({ allocations, className }: AllocationCardsProps) {
  const policy = getActiveTreasuryPolicy();
  const buckets = allocations ?? policy.allocations;

  return (
    <section
      id="treasury-allocation"
      className={cn("scroll-mt-24 space-y-4", className)}
      aria-labelledby="treasury-allocation-heading"
    >
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

      <div className="grid gap-4 md:grid-cols-2">
        {buckets.map((bucket) => (
          <AllocationCard key={bucket.id} bucket={bucket} />
        ))}
      </div>
    </section>
  );
}
