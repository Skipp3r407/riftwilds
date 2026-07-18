import { getCatalogItem } from "@/lib/items/catalog";
import { worldLayerPathForItem } from "@/lib/equipment/anchors";
import {
  defaultAttachmentForSlot,
  slotForCatalogItem,
} from "@/lib/equipment/compatibility";
import type {
  AppearanceSnapshot,
  CosmeticLoadout,
  EquipmentSlotKey,
  EquippedLayer,
  SlotLoadoutMap,
} from "@/lib/equipment/types";
import { EQUIPMENT_SLOT_KEYS } from "@/lib/equipment/types";

function layerForSlot(slot: EquipmentSlotKey, itemId: string | null): EquippedLayer | null {
  if (!itemId) return null;
  const item = getCatalogItem(itemId);
  if (!item) return null;
  const resolvedSlot = slotForCatalogItem(item) ?? slot;
  const attachment = item.attachment ?? defaultAttachmentForSlot(resolvedSlot);
  const family =
    item.family === "WEAPON" || item.family === "ARMOR" || item.family === "COSMETIC"
      ? item.family
      : "ARMOR";
  return {
    itemId: item.id,
    slot: resolvedSlot,
    attachment,
    iconPath: item.iconPath,
    worldLayerPath: worldLayerPathForItem(item.id, family),
    rarity: item.rarity,
    name: item.name,
  };
}

export function buildAppearanceSnapshot(input: {
  loadout: CosmeticLoadout;
  speciesSlug: string;
}): AppearanceSnapshot {
  const layers: EquippedLayer[] = [];
  for (const slot of EQUIPMENT_SLOT_KEYS) {
    const layer = layerForSlot(slot, input.loadout.slots[slot]);
    if (layer) layers.push(layer);
  }
  return {
    publicPetId: input.loadout.publicPetId,
    ownerKey: input.loadout.ownerKey,
    speciesSlug: input.speciesSlug,
    revision: input.loadout.revision,
    layers,
    slots: { ...input.loadout.slots },
    updatedAt: input.loadout.updatedAt,
  };
}

/** Compact multiplayer stub payload — enough for remote pet overlays. */
export type AppearanceNetStub = {
  publicPetId: string;
  revision: number;
  layers: Array<{
    itemId: string;
    slot: EquipmentSlotKey;
    attachment: string;
    iconPath: string;
  }>;
};

export function toAppearanceNetStub(snap: AppearanceSnapshot): AppearanceNetStub {
  return {
    publicPetId: snap.publicPetId,
    revision: snap.revision,
    layers: snap.layers.map((l) => ({
      itemId: l.itemId,
      slot: l.slot,
      attachment: l.attachment,
      iconPath: l.iconPath,
    })),
  };
}

export function summarizeSlots(slots: SlotLoadoutMap): string {
  return EQUIPMENT_SLOT_KEYS.filter((s) => slots[s])
    .map((s) => `${s}:${slots[s]}`)
    .join(",") || "empty";
}
