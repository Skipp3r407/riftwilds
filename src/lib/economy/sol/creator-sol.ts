/**
 * Creator marketplace SOL stubs — extends Credits creator marketplace.
 * Real SOL payouts behind SOL_CREATOR_MARKETPLACE_ENABLED (default false).
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type CreatorSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type CreatorSubmission = {
  submissionId: string;
  creatorUserId: string;
  title: string;
  status: CreatorSubmissionStatus;
  requiresReview: true;
  solPayoutEnabled: boolean;
  note: string;
};

type Store = { submissions: Map<string, CreatorSubmission> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsCreatorSol?: Store };
  if (!g.__riftwildsCreatorSol) g.__riftwildsCreatorSol = { submissions: new Map() };
  return g.__riftwildsCreatorSol;
}

export function submitCreatorProduct(params: {
  creatorUserId: string;
  title: string;
  requestId: string;
}): CreatorSubmission {
  const submission: CreatorSubmission = {
    submissionId: `cs_${params.requestId}`,
    creatorUserId: params.creatorUserId,
    title: params.title.slice(0, 120),
    status: "SUBMITTED",
    requiresReview: true,
    solPayoutEnabled: isFeatureEnabled("SOL_CREATOR_MARKETPLACE_ENABLED"),
    note: isFeatureEnabled("SOL_CREATOR_MARKETPLACE_ENABLED")
      ? "Flags on but payout rails not wired."
      : "SOL creator payouts disabled — Credits creator path remains available.",
  };
  store().submissions.set(submission.submissionId, submission);
  return submission;
}

export function listCreatorSubmissions(): CreatorSubmission[] {
  return [...store().submissions.values()];
}
