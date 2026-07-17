/**
 * Audit log stub — mirrors Prisma AuditLog shape for local/dev.
 * Production should persist via prisma.auditLog.create.
 */

export type AuditEntry = {
  id: string;
  createdAt: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  requestId?: string | null;
};

const buffer: AuditEntry[] = [];
const MAX = 1000;

export function recordAudit(input: Omit<AuditEntry, "id" | "createdAt">): AuditEntry {
  const entry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  buffer.unshift(entry);
  if (buffer.length > MAX) buffer.length = MAX;
  return entry;
}

export function listAuditEntries(limit = 50): AuditEntry[] {
  return buffer.slice(0, limit);
}

export function resetAuditLogForTests(): void {
  buffer.length = 0;
}
