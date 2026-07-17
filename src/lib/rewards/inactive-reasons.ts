import type { InactiveReasonCode } from "@/lib/rewards/types";

export const INACTIVE_REASON_LABELS: Record<InactiveReasonCode, string> = {
  listed: "Listed for sale on the marketplace",
  transferred: "Recently transferred — ownership cooldown",
  cooldown: "Ownership duration cooldown not met",
  min_token: "Below minimum token balance",
  sleeping: "Pet is sleeping / dormant",
  sick: "Pet is sick",
  deceased: "Pet is deceased",
  not_selected: "Pet not selected for rewards",
  slots_exceeded: "Exceeds max reward-bearing pet slots",
  wallet_blocked: "Wallet under review or blocked",
  no_living_pet: "No eligible living Riftling",
  rewards_disabled: "Community rewards are disabled",
  care_too_low: "Care score below the minimum",
};

export function labelsForReasons(codes: InactiveReasonCode[]): string[] {
  return codes.map((c) => INACTIVE_REASON_LABELS[c]);
}
