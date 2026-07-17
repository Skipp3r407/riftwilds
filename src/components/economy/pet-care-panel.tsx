"use client";

import { useState } from "react";
import { CARE_SHOP_ITEMS } from "@/lib/config/treasury-policy";
import { cn } from "@/lib/utils/cn";

type CareStatKey = "hunger" | "happiness" | "hygiene" | "energy" | "health" | "bond";

type CareStats = Record<CareStatKey, number>;

const DEMO_STATS: CareStats = {
  hunger: 62,
  happiness: 71,
  hygiene: 55,
  energy: 48,
  health: 80,
  bond: 34,
};

const STAT_LABELS: Record<CareStatKey, string> = {
  hunger: "Hunger",
  happiness: "Happiness",
  hygiene: "Hygiene",
  energy: "Energy",
  health: "Health",
  bond: "Bond",
};

const STAT_COLORS: Record<CareStatKey, string> = {
  hunger: "var(--amber)",
  happiness: "var(--violet)",
  hygiene: "var(--cyan)",
  energy: "var(--emerald)",
  health: "var(--coral)",
  bond: "var(--radiant)",
};

const CARE_ACTIONS = [
  "Feed",
  "Water",
  "Play",
  "Clean",
  "Rest",
  "Medicine",
  "Use Item",
  "Marketplace",
] as const;

const RARE_ITEMS = new Set(["revival-bloom", "medicine"]);

type PetCarePanelProps = {
  className?: string;
  petName?: string;
  condition?: string;
  rewardEligible?: boolean | null;
  stats?: CareStats;
  lastCareLabel?: string | null;
  nextCareCountdown?: string | null;
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="tabular-nums text-white">{clamped}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[rgba(148,197,255,0.1)]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function PetCarePanel({
  className,
  petName = "Demo Riftling",
  condition = "Stable (placeholder)",
  rewardEligible = null,
  stats = DEMO_STATS,
  lastCareLabel = null,
  nextCareCountdown = null,
}: PetCarePanelProps) {
  const [confirmItem, setConfirmItem] = useState<(typeof CARE_SHOP_ITEMS)[number] | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const eligibilityLabel =
    rewardEligible === null
      ? "Unknown — connect wallet"
      : rewardEligible
        ? "May qualify (rules apply)"
        : "Not eligible this epoch";

  const eligibilityClass =
    rewardEligible === null
      ? "text-[var(--text-muted)]"
      : rewardEligible
        ? "text-[var(--emerald)]"
        : "text-[var(--coral)]";

  function handleUseItem() {
    const rare = CARE_SHOP_ITEMS.find((item) => RARE_ITEMS.has(item.slug));
    if (rare) setConfirmItem(rare);
  }

  function handleAction(action: string) {
    if (action === "Use Item") {
      handleUseItem();
      return;
    }
    if (action === "Medicine") {
      const medicine = CARE_SHOP_ITEMS.find((item) => item.slug === "medicine");
      if (medicine) setConfirmItem(medicine);
      return;
    }
    setPendingAction(action);
  }

  return (
    <>
      <section
        className={cn("panel space-y-5 p-5", className)}
        aria-labelledby="pet-care-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">
              Pet care
            </p>
            <h2 id="pet-care-heading" className="font-display text-lg text-white">
              {petName}
            </h2>
          </div>
          <span className="rounded-full border border-[var(--stroke)] px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--amber)]">
            Demo stats
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Condition
            </p>
            <p className="mt-1 text-sm text-white">{condition}</p>
          </div>
          <div className="rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Reward eligibility
            </p>
            <p className={cn("mt-1 text-sm", eligibilityClass)}>{eligibilityLabel}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(stats) as CareStatKey[]).map((key) => (
            <StatBar
              key={key}
              label={STAT_LABELS[key]}
              value={stats[key]}
              color={STAT_COLORS[key]}
            />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Last care
            </p>
            <p className="mt-1 text-white">
              {lastCareLabel ?? "Unavailable — no live session"}
            </p>
          </div>
          <div className="rounded-lg border border-[var(--stroke)] bg-[rgba(7,11,22,0.35)] p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Next care window
            </p>
            <p className="mt-1 text-white">
              {nextCareCountdown ?? "—:—:— (placeholder)"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CARE_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              className="btn-secondary focus-ring px-3 py-2 text-sm"
              onClick={() => handleAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {pendingAction ? (
          <p className="text-xs text-[var(--text-muted)]" role="status">
            Demo: &quot;{pendingAction}&quot; would call the care API when connected — no live
            mutation performed.
          </p>
        ) : null}

        <p className="text-xs text-[var(--text-muted)]">
          Shop reference: {CARE_SHOP_ITEMS.length} care items configured. Rare items require
          confirmation before use.
        </p>
      </section>

      {confirmItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(7,11,22,0.75)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-item-title"
        >
          <div className="panel w-full max-w-md space-y-4 p-6">
            <h3 id="confirm-item-title" className="font-display text-lg text-white">
              Confirm item use
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              You are about to use{" "}
              <strong className="text-white">{confirmItem.name}</strong> (
              {confirmItem.rarity}). {confirmItem.description}
            </p>
            <ul className="text-xs text-[var(--text-muted)]">
              {confirmItem.effects.map((effect) => (
                <li key={effect}>• {effect}</li>
              ))}
            </ul>
            <p className="text-xs text-[var(--amber)]">
              Stub modal — confirm will not consume inventory in demo mode.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary focus-ring text-sm"
                onClick={() => setConfirmItem(null)}
              >
                Confirm (demo)
              </button>
              <button
                type="button"
                className="btn-secondary focus-ring text-sm"
                onClick={() => setConfirmItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
