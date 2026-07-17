"use client";

import { getActiveTreasuryPolicy } from "@/lib/config/treasury-policy";
import { cn } from "@/lib/utils/cn";

export type EligibilityStatus = "pass" | "fail" | "unknown";

export type EligibilityCheck = {
  id: string;
  label: string;
  explanation: string;
  status: EligibilityStatus;
};

const STATUS_STYLES: Record<
  EligibilityStatus,
  { dot: string; label: string; text: string }
> = {
  pass: {
    dot: "bg-[var(--emerald)]",
    label: "Pass",
    text: "text-[var(--emerald)]",
  },
  fail: {
    dot: "bg-[var(--coral)]",
    label: "Fail",
    text: "text-[var(--coral)]",
  },
  unknown: {
    dot: "bg-[var(--text-muted)]",
    label: "Unknown",
    text: "text-[var(--text-muted)]",
  },
};

function buildDefaultChecks(): EligibilityCheck[] {
  const policy = getActiveTreasuryPolicy();
  const { rewardRules } = policy;

  return [
    {
      id: "living",
      label: "Pet is living and not dormant, critical, or memorialized",
      explanation:
        "Reward epochs only consider active lifecycle states. Dormant, critical, and memorial pets are excluded.",
      status: "unknown",
    },
    {
      id: "care-score",
      label: `Care score meets minimum (${rewardRules.minCareScore}+)`,
      explanation:
        "Sustained care actions contribute to eligibility. Low care may suspend reward access.",
      status: "unknown",
    },
    {
      id: "pet-age",
      label: `Pet age meets minimum (${rewardRules.minPetAgeHours}h)`,
      explanation: "Newly hatched pets must mature before entering reward selection.",
      status: "unknown",
    },
    {
      id: "not-listed",
      label: "Pet is not listed on the marketplace",
      explanation: "Listed pets cannot earn epoch allocations during the reward commit window.",
      status: "unknown",
    },
    {
      id: "reward-slots",
      label: `Within reward pet limit (${rewardRules.maxRewardActivePets} active)`,
      explanation:
        "Each wallet may designate up to the configured number of pets for epoch rewards.",
      status: "unknown",
    },
    {
      id: "token-hold",
      label:
        rewardRules.minTokenHoldHours > 0
          ? `Token held for ${rewardRules.minTokenHoldHours}h+`
          : "Token hold requirement (none configured)",
      explanation:
        rewardRules.minTokenHoldHours > 0
          ? "Minimum token holding duration may apply before reward eligibility."
          : "No minimum token hold is required in the current demo policy.",
      status: "unknown",
    },
    {
      id: "disclosure",
      label: "Current risk disclosure accepted (if real-money mode)",
      explanation:
        "Real-money reward paths require accepting the latest published risk disclosure.",
      status: "unknown",
    },
  ];
}

type EligibilityChecklistProps = {
  checks?: EligibilityCheck[];
  className?: string;
  title?: string;
};

function CheckRow({ check }: { check: EligibilityCheck }) {
  const styles = STATUS_STYLES[check.status];

  return (
    <li className="flex gap-3 rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
      <span
        className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", styles.dot)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-white">{check.label}</p>
          <span className={cn("text-[10px] uppercase tracking-wider", styles.text)}>
            {styles.label}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
          {check.explanation}
        </p>
      </div>
    </li>
  );
}

export function EligibilityChecklist({
  checks,
  className,
  title = "Reward eligibility",
}: EligibilityChecklistProps) {
  const items = checks ?? buildDefaultChecks();

  return (
    <section
      className={cn("space-y-4", className)}
      aria-labelledby="eligibility-checklist-heading"
    >
      <div>
        <h2 id="eligibility-checklist-heading" className="font-display text-xl text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Status reflects your wallet and pets when connected. No dollar amounts or guaranteed
          payouts are shown here.
        </p>
      </div>

      <ul className="space-y-2">
        {items.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </ul>
    </section>
  );
}
