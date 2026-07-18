/**
 * Equipment / cosmetics / loadouts are preserved across Downed → recovery.
 * Nothing is destroyed on spirit journey or Soft recovery.
 */

import { getActiveLoadout, listPresets } from "@/lib/equipment/loadout-store";
import type { CosmeticLoadout } from "@/lib/equipment/types";

export type EquipmentPreservationSnapshot = {
  petPublicId: string;
  ownerKey: string;
  activePresetName: string;
  presets: CosmeticLoadout[];
  itemIds: string[];
  capturedAt: string;
};

export function snapshotEquipmentForRecovery(params: {
  ownerKey: string;
  petPublicId: string;
}): EquipmentPreservationSnapshot {
  const active = getActiveLoadout(params.ownerKey, params.petPublicId);
  const presets = listPresets(params.ownerKey, params.petPublicId);
  const itemIds = new Set<string>();
  for (const p of presets) {
    for (const id of Object.values(p.slots)) {
      if (id) itemIds.add(id);
    }
  }
  return {
    petPublicId: params.petPublicId,
    ownerKey: params.ownerKey,
    activePresetName: active.presetName,
    presets: presets.map((p) => ({
      ...p,
      slots: { ...p.slots },
    })),
    itemIds: [...itemIds],
    capturedAt: new Date().toISOString(),
  };
}

/** Verify equipment still present after recovery — no destruction. */
export function assertEquipmentPreserved(
  before: EquipmentPreservationSnapshot,
  after: EquipmentPreservationSnapshot,
): { ok: true } | { ok: false; missing: string[] } {
  const missing = before.itemIds.filter((id) => !after.itemIds.includes(id));
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}
