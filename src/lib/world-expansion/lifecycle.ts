import type { ExpansionLifecycle } from "@/lib/world-expansion/types";

const TRANSITIONS: Record<ExpansionLifecycle, ExpansionLifecycle[]> = {
  PLANNED: ["QUEUED", "FAILED", "ROLLED_BACK"],
  QUEUED: ["GENERATING", "FAILED", "ROLLED_BACK"],
  GENERATING: ["VALIDATING", "FAILED", "ROLLED_BACK"],
  VALIDATING: ["PENDING_REVIEW", "FAILED", "ROLLED_BACK"],
  PENDING_REVIEW: ["APPROVED", "FAILED", "ROLLED_BACK", "PAUSED"],
  APPROVED: ["SEEDING", "PAUSED", "ROLLED_BACK"],
  SEEDING: ["OPEN", "FAILED", "ROLLED_BACK"],
  OPEN: ["PAUSED", "ARCHIVING"],
  PAUSED: ["OPEN", "ARCHIVING", "ROLLED_BACK"],
  ARCHIVING: ["ARCHIVED", "FAILED"],
  ARCHIVED: ["RETIRED"],
  RETIRED: [],
  FAILED: ["QUEUED", "ROLLED_BACK"],
  ROLLED_BACK: [],
};

export function canTransition(from: ExpansionLifecycle, to: ExpansionLifecycle): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Players only see OPEN (and PAUSED as Full/closed labels — never PLANNED…VALIDATING). */
export function isPlayerVisible(lifecycle: ExpansionLifecycle): boolean {
  return lifecycle === "OPEN" || lifecycle === "PAUSED" || lifecycle === "ARCHIVING";
}

export function assertTransition(
  from: ExpansionLifecycle,
  to: ExpansionLifecycle,
): { ok: true } | { ok: false; error: string } {
  if (!canTransition(from, to)) {
    return { ok: false, error: `illegal_transition:${from}->${to}` };
  }
  return { ok: true };
}
