/**
 * In-memory feedback store for local/dev.
 * Prisma `PlayerFeedback` is prepared in schema — wire persistence after migrate approval.
 */

import type { FeedbackSubmissionInput } from "@/lib/feedback/schema";

export type StoredFeedback = {
  id: string;
  createdAt: string;
  kind: FeedbackSubmissionInput["kind"];
  payload: Omit<FeedbackSubmissionInput, "website">;
  userAgent: string | null;
  requestId: string;
};

type Store = {
  entries: StoredFeedback[];
};

const MAX = 200;

function getStore(): Store {
  const g = globalThis as unknown as { __riftwildsFeedback?: Store };
  if (!g.__riftwildsFeedback) g.__riftwildsFeedback = { entries: [] };
  return g.__riftwildsFeedback;
}

export function storeFeedback(entry: Omit<StoredFeedback, "id" | "createdAt">): StoredFeedback {
  const stored: StoredFeedback = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  const store = getStore();
  store.entries.unshift(stored);
  if (store.entries.length > MAX) store.entries.length = MAX;
  return stored;
}

export function listFeedback(limit = 50): StoredFeedback[] {
  return getStore().entries.slice(0, limit);
}

export function resetFeedbackStoreForTests(): void {
  const g = globalThis as unknown as { __riftwildsFeedback?: Store };
  g.__riftwildsFeedback = { entries: [] };
}
