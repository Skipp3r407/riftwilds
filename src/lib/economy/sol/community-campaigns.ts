/**
 * Community funding campaigns — unlock content for everyone.
 * Real SOL contributions behind SOL_COMMUNITY_FUNDING_ENABLED (default false).
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type CommunityCampaign = {
  campaignId: string;
  title: string;
  goalLamports: string;
  raisedLamports: string;
  status: "DRAFT" | "OPEN_SOFT" | "BLOCKED_SOL" | "FUNDED" | "CANCELED";
  unlocksForEveryone: true;
  note: string;
};

export const SEED_COMMUNITY_CAMPAIGNS: CommunityCampaign[] = [
  {
    campaignId: "camp-board-theme-aurora",
    title: "Community Board Theme: Aurora Commons",
    goalLamports: "50000000000",
    raisedLamports: "0",
    status: "BLOCKED_SOL",
    unlocksForEveryone: true,
    note: "SOL contributions disabled until SOL_COMMUNITY_FUNDING_ENABLED. Soft pledges may use Gold later.",
  },
];

export function listCommunityCampaigns(): CommunityCampaign[] {
  return SEED_COMMUNITY_CAMPAIGNS.map((c) => ({
    ...c,
    status: isFeatureEnabled("SOL_COMMUNITY_FUNDING_ENABLED") ? "OPEN_SOFT" : c.status,
  }));
}

export function contributeToCampaign(_params: {
  campaignId: string;
  userId: string;
  lamports: string;
  requestId: string;
}): { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("SOL_COMMUNITY_FUNDING_ENABLED")) {
    return {
      ok: false,
      error: "disabled",
      message: "Community SOL funding is feature-flagged off.",
    };
  }
  return {
    ok: false,
    error: "not_wired",
    message: "Campaign contribution escrow not wired — refusing live SOL transfer.",
  };
}
