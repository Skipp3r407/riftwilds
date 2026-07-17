"use client";

import { useState } from "react";
import {
  evaluatePetRewardEligibility,
  HOLDER_REWARD_CONFIG,
} from "@/lib/revenue/eligibility";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

type Props = {
  petName?: string;
  publicPetId?: string;
  /** Demo defaults for profile shell */
  demo?: Partial<{
    careScore: number;
    isSick: boolean;
    isDormant: boolean;
    selected: boolean;
  }>;
};

export function PetRewardStatus({
  petName = "Demo Riftling",
  publicPetId = "demo-riftling",
  demo,
}: Props) {
  const [selected, setSelected] = useState(demo?.selected ?? false);

  const result = evaluatePetRewardEligibility({
    ownsEligibleLivingPet: true,
    meetsMinTokenBalance: false,
    petSelectedForRewards: selected,
    careScore: demo?.careScore ?? 55,
    isSick: demo?.isSick ?? false,
    isDormant: demo?.isDormant ?? false,
    isDeceased: false,
    isListedForSale: false,
    ownershipHours: 48,
    tokenHoldHours: 0,
    walletBlocked: false,
    rewardPetSlotsUsed: selected ? 1 : 0,
  });

  return (
    <div className="panel space-y-3 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]">
            Reward status
          </p>
          <h3 className="font-display text-lg text-white">{petName}</h3>
          <p className="text-[10px] text-[var(--text-muted)]">{publicPetId}</p>
        </div>
        <span
          className={
            result.eligible
              ? "text-[var(--mint)]"
              : "text-[var(--amber)]"
          }
        >
          {result.eligible ? "Eligible" : "Not eligible"}
        </span>
      </div>

      <ul className="grid gap-1 text-xs text-[var(--text-muted)] sm:grid-cols-2">
        <li>Reward-active: {selected ? "Yes" : "No"}</li>
        <li>Current weight: {result.weight}</li>
        <li>Min care: {HOLDER_REWARD_CONFIG.minCareScore}</li>
        <li>Token requirement: required (server-verified)</li>
        <li>Ownership: ≥ {HOLDER_REWARD_CONFIG.minPetOwnershipHours}h</li>
        <li>
          Egg rewards:{" "}
          {featureFlagDefaults.EGG_HOLDER_REWARDS_ENABLED ? "on" : "off"}
        </li>
      </ul>

      {result.failures.length > 0 ? (
        <div>
          <p className="text-xs text-[var(--amber)]">Reasons for ineligibility</p>
          <ul className="mt-1 list-inside list-disc text-xs text-[var(--text-muted)]">
            {result.failures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[10px] text-[var(--text-muted)]">{revenueDisclosures.holderRewards}</p>
      <p className="text-[10px] text-[var(--amber)]">
        Do not treat this as a guaranteed daily amount.
      </p>

      <button
        type="button"
        className="btn-secondary focus-ring w-full text-sm"
        onClick={() => setSelected((s) => !s)}
      >
        {selected ? "Remove from rewards" : "Select for rewards"}
      </button>
    </div>
  );
}
