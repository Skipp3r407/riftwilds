/**
 * Character sleeping stubs — DEFAULT OFF (remove from world).
 * Lightweight stubs only when housing privacy explicitly allows + flag on.
 */

import {
  SLEEPING_CHARACTERS_DEFAULT_ENABLED,
  SLEEP_STUB_TTL_MS,
} from "@/lib/persistence/config";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  deactivateSleepStub,
  getSleepStub,
  putSleepStub,
} from "@/lib/persistence/memory-store";
import type { LogoutZoneKind } from "@/lib/persistence/enums";

export function sleepingCharactersEnabled(): boolean {
  if (SLEEPING_CHARACTERS_DEFAULT_ENABLED) return true;
  try {
    return isFeatureEnabled("SLEEPING_CHARACTERS_ENABLED");
  } catch {
    return false;
  }
}

/**
 * Housing privacy gate — only HOME zone + visitPolicy that allows visitors
 * can show a stub. Phase 1: never auto-enable without explicit leaveSleepingStub.
 */
export function housingPrivacyAllowsSleepStub(params: {
  zoneKind: LogoutZoneKind | null;
  visitPolicy?: string | null;
  leaveSleepingStub: boolean;
}): boolean {
  if (!params.leaveSleepingStub) return false;
  if (!sleepingCharactersEnabled()) return false;
  if (params.zoneKind !== "HOME") return false;
  const policy = (params.visitPolicy ?? "FRIENDS").toUpperCase();
  return policy === "PUBLIC" || policy === "FRIENDS";
}

export function maybeCreateSleepStub(params: {
  ownerKey: string;
  userId: string | null;
  mapId: string;
  posX: number;
  posY: number;
  leaveSleepingStub: boolean;
  zoneKind: LogoutZoneKind | null;
  visitPolicy?: string | null;
  displayName?: string | null;
}): boolean {
  // Default: remove from world
  deactivateSleepStub(params.ownerKey);

  if (
    !housingPrivacyAllowsSleepStub({
      zoneKind: params.zoneKind,
      visitPolicy: params.visitPolicy,
      leaveSleepingStub: params.leaveSleepingStub,
    })
  ) {
    return false;
  }

  putSleepStub({
    ownerKey: params.ownerKey,
    userId: params.userId,
    mapId: params.mapId,
    posX: params.posX,
    posY: params.posY,
    displayName: params.displayName ?? null,
    visibleToVisitors: true,
    expiresAt: Date.now() + SLEEP_STUB_TTL_MS,
    active: true,
  });
  return true;
}

export function clearSleepStubOnLogin(ownerKey: string): void {
  deactivateSleepStub(ownerKey);
}

export function getActiveSleepStub(ownerKey: string) {
  const stub = getSleepStub(ownerKey);
  if (!stub || !stub.active) return null;
  if (stub.expiresAt < Date.now()) {
    deactivateSleepStub(ownerKey);
    return null;
  }
  return stub;
}
