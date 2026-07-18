/**
 * Optional Prisma persistence for WorldSaveState / sessions.
 * Prepared for migration — no-ops when Prisma models unavailable or flag off.
 * Never execute production migrations from this module.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import type { WorldSaveRecord } from "@/lib/persistence/types";

export function isPersistencePrismaEnabled(): boolean {
  try {
    if (!isFeatureEnabled("WORLD_PERSISTENCE_PRISMA_ENABLED")) return false;
  } catch {
    return false;
  }
  if (process.env.WORLD_PERSISTENCE_PRISMA_ENABLED === "false") return false;
  if (process.env.WORLD_PERSISTENCE_PRISMA_ENABLED === "true") return true;
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(url) && !url.includes("USER:PASSWORD") && !url.includes("localhost/dummy");
}

/**
 * Best-effort write. Uses dynamic import so unit tests don't need generated client fields
 * before `prisma generate` after migration apply.
 */
export async function persistSaveToPrisma(save: WorldSaveRecord): Promise<boolean> {
  if (!isPersistencePrismaEnabled()) return false;
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const client = prisma as unknown as {
      worldSaveState?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
    };
    if (!client.worldSaveState?.upsert) {
      // Client not regenerated yet — memory remains authoritative.
      return false;
    }
    await client.worldSaveState.upsert({
      where: { ownerKey: save.ownerKey },
      create: {
        ownerKey: save.ownerKey,
        userId: save.userId,
        version: save.version,
        mapId: save.mapId,
        posX: save.posX,
        posY: save.posY,
        lastSafeMapId: save.lastSafeMapId,
        lastSafePosX: save.lastSafePosX,
        lastSafePosY: save.lastSafePosY,
        lastSafeZoneId: save.lastSafeZoneId,
        lastSafeZoneKind: save.lastSafeZoneKind,
        playStateJson: save.playState ?? undefined,
        dirtyCategoryA: save.dirty.categoryA,
        dirtyCategoryB: save.dirty.categoryB,
        dirtyCategoryC: save.dirty.categoryC,
        lastRequestId: save.lastRequestId,
        schemaVersion: save.schemaVersion,
      },
      update: {
        userId: save.userId,
        version: save.version,
        mapId: save.mapId,
        posX: save.posX,
        posY: save.posY,
        lastSafeMapId: save.lastSafeMapId,
        lastSafePosX: save.lastSafePosX,
        lastSafePosY: save.lastSafePosY,
        lastSafeZoneId: save.lastSafeZoneId,
        lastSafeZoneKind: save.lastSafeZoneKind,
        playStateJson: save.playState ?? undefined,
        dirtyCategoryA: save.dirty.categoryA,
        dirtyCategoryB: save.dirty.categoryB,
        dirtyCategoryC: save.dirty.categoryC,
        lastRequestId: save.lastRequestId,
        schemaVersion: save.schemaVersion,
      },
    });
    return true;
  } catch {
    return false;
  }
}
