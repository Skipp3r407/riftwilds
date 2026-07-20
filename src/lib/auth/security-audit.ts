import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function writeSecurityAudit(params: {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  ipHash?: string;
  userAgentHash?: string;
  requestId?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.securityAuditLog.create({
      data: {
        userId: params.userId ?? undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        ipHash: params.ipHash,
        userAgentHash: params.userAgentHash,
        requestId: params.requestId,
        metadata: params.metadata,
      },
    });
  } catch {
    // Never fail request path on audit write.
  }
}

export async function recordLoginAttempt(params: {
  email?: string | null;
  userId?: string | null;
  success: boolean;
  reason?: string;
  ipHash?: string;
  userAgentHash?: string;
  provider?: string;
}): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: params.email ?? undefined,
        userId: params.userId ?? undefined,
        success: params.success,
        reason: params.reason,
        ipHash: params.ipHash,
        userAgentHash: params.userAgentHash,
        provider: params.provider,
      },
    });
  } catch {
    // ignore
  }
}
