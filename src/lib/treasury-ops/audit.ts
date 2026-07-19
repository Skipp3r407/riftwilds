import type { TreasuryAuditEntry, TreasuryOpsState } from "./types";

const MAX_AUDIT = 2_000;

export function appendAudit(
  state: TreasuryOpsState,
  input: Omit<TreasuryAuditEntry, "id" | "createdAt">,
): TreasuryAuditEntry {
  const entry: TreasuryAuditEntry = {
    id: `taudit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  state.auditLogs.unshift(entry);
  if (state.auditLogs.length > MAX_AUDIT) state.auditLogs.length = MAX_AUDIT;
  state.updatedAt = entry.createdAt;
  return entry;
}
