import Link from "next/link";
import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";
import { cn } from "@/lib/utils/cn";
import { RewardDisclaimer } from "./disclaimers";

type EconomySummaryProps = {
  variant?: "home" | "compact";
  className?: string;
};

export function EconomySummary({ variant = "home", className }: EconomySummaryProps) {
  const policy = getActiveTreasuryPolicy();
  const isCompact = variant === "compact";

  return (
    <section
      className={cn("panel", isCompact ? "p-5" : "p-6 md:p-8", className)}
      aria-labelledby="economy-summary-heading"
    >
      <p className="font-display text-xs uppercase tracking-[0.22em] text-[var(--cyan)]">
        {policy.status === "demo" ? "Demo policy" : policy.status}
      </p>
      <h2
        id="economy-summary-heading"
        className={cn(
          "font-display mt-2 text-white",
          isCompact ? "text-lg" : "text-2xl md:text-3xl",
        )}
      >
        A GAME ECONOMY BUILT TO GROW
      </h2>

      <p
        className={cn(
          "mt-3 text-[var(--text-muted)]",
          isCompact ? "text-sm" : "max-w-2xl text-base",
        )}
      >
        Eligible creator fees and marketplace activity help support promotion, development,
        community events, reserves, and potential allocations to active pets.
      </p>

      <div
        className={cn(
          "mt-6 grid gap-2",
          isCompact ? "grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
        )}
      >
        {policy.allocations.map((bucket) => (
          <div
            key={bucket.id}
            className="rounded-xl border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] p-3 text-center"
          >
            <p
              className="font-display text-xl tabular-nums md:text-2xl"
              style={{ color: bucket.color }}
            >
              {bucket.percent}%
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {bucket.label
                .replace(" Treasury", "")
                .replace("Community Reward Treasury", "Community Rewards")
                .replace("Active Pet Reward Vault", "Community Rewards")}
            </p>
          </div>
        ))}
      </div>

      <div className={cn("mt-6 flex flex-wrap gap-3", isCompact && "mt-4")}>
        <Link href="/economy" className="btn-primary focus-ring text-sm">
          Explore the Economy
        </Link>
        <Link href="/transparency" className="btn-secondary focus-ring text-sm">
          View Transparency
        </Link>
      </div>

      <RewardDisclaimer className="mt-5" />
    </section>
  );
}
