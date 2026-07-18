/**
 * Server-authoritative cosmetic loadouts + presets.
 * Persists in globalThis for Phase 1 (same pattern as hatchery-store).
 * Prisma PetLoadout remains the Phase 2 durable target.
 */

import { getPet } from "@/game/eggs/hatchery-store";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import { assertOwnership } from "@/lib/security/authorization";
import { getCatalogItem } from "@/lib/items/catalog";
import { buildAppearanceSnapshot } from "@/lib/equipment/appearance";
import {
  anatomyTagsForBodyType,
  validateEquipCompatibility,
} from "@/lib/equipment/compatibility";
import { bindItemToPet, listOwnedItems, ownsItem } from "@/lib/equipment/inventory-store";
import { checkEquipmentSafety } from "@/lib/equipment/safety";
import {
  emptySlotMap,
  LOADOUT_PRESET_NAMES,
  type AppearanceSnapshot,
  type CosmeticLoadout,
  type EquipResult,
  type EquipmentSlotKey,
  type LoadoutPresetName,
  type SafetyGateContext,
  type SlotLoadoutMap,
} from "@/lib/equipment/types";

type LoadoutMaps = {
  /** key = `${ownerKey}:${publicPetId}:${presetName}` */
  byKey: Map<string, CosmeticLoadout>;
  /** active preset name per pet */
  activePreset: Map<string, string>;
};

function maps(): LoadoutMaps {
  const g = globalThis as unknown as { __riftwildsPetLoadouts?: LoadoutMaps };
  if (!g.__riftwildsPetLoadouts) {
    g.__riftwildsPetLoadouts = { byKey: new Map(), activePreset: new Map() };
  }
  return g.__riftwildsPetLoadouts;
}

function petKey(ownerKey: string, publicPetId: string): string {
  return `${ownerKey}:${publicPetId}`;
}

function loadoutKey(ownerKey: string, publicPetId: string, presetName: string): string {
  return `${ownerKey}:${publicPetId}:${presetName}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultStarterSlots(): SlotLoadoutMap {
  const slots = emptySlotMap();
  slots.weapon = "wooden-paw-guard";
  slots.armor = "cloth-pet-vest";
  return slots;
}

function ensureLoadout(
  ownerKey: string,
  publicPetId: string,
  presetName: string = "Default",
): CosmeticLoadout {
  const m = maps();
  const key = loadoutKey(ownerKey, publicPetId, presetName);
  let row = m.byKey.get(key);
  if (!row) {
    const activeName = m.activePreset.get(petKey(ownerKey, publicPetId)) ?? "Default";
    row = {
      publicPetId,
      ownerKey,
      presetName,
      revision: 1,
      updatedAt: nowIso(),
      slots: presetName === "Default" ? defaultStarterSlots() : emptySlotMap(),
      active: presetName === activeName,
    };
    m.byKey.set(key, row);
    if (!m.activePreset.has(petKey(ownerKey, publicPetId))) {
      m.activePreset.set(petKey(ownerKey, publicPetId), "Default");
    }
  }
  return row;
}

export function getActiveLoadout(ownerKey: string, publicPetId: string): CosmeticLoadout {
  const m = maps();
  const name = m.activePreset.get(petKey(ownerKey, publicPetId)) ?? "Default";
  return ensureLoadout(ownerKey, publicPetId, name);
}

export function listPresets(ownerKey: string, publicPetId: string): CosmeticLoadout[] {
  return LOADOUT_PRESET_NAMES.map((name) => ensureLoadout(ownerKey, publicPetId, name));
}

export function activatePreset(
  ownerKey: string,
  publicPetId: string,
  presetName: LoadoutPresetName | string,
): CosmeticLoadout {
  const m = maps();
  const loadout = ensureLoadout(ownerKey, publicPetId, presetName);
  m.activePreset.set(petKey(ownerKey, publicPetId), presetName);
  for (const name of LOADOUT_PRESET_NAMES) {
    const row = ensureLoadout(ownerKey, publicPetId, name);
    row.active = name === presetName;
    m.byKey.set(loadoutKey(ownerKey, publicPetId, name), row);
  }
  loadout.active = true;
  loadout.revision += 1;
  loadout.updatedAt = nowIso();
  m.byKey.set(loadoutKey(ownerKey, publicPetId, presetName), loadout);
  return loadout;
}

function resolvePetContext(ownerKey: string, publicPetId: string) {
  // Demo companion id used by Live World when hatchery pet isn't loaded yet.
  // Species art for the follower is driven client-side from hatch persist /
  // /api/pets — this stub must not force Alloybit/Cindercub onto the sprite.
  if (publicPetId === "demo-riftling" || publicPetId === "live-companion") {
    return {
      ok: true as const,
      speciesSlug: "riftpup",
      anatomy: anatomyTagsForBodyType("QUADRUPED"),
      level: 5,
      demo: true,
    };
  }
  const pet = getPet(publicPetId);
  if (!pet) {
    return { ok: false as const, reason: "PET_NOT_FOUND" as const, message: "Riftling not found." };
  }
  try {
    assertOwnership(pet.ownerKey, ownerKey);
  } catch {
    return {
      ok: false as const,
      reason: "PET_NOT_OWNED" as const,
      message: "You do not own this Riftling.",
    };
  }
  const species = getSpeciesBySlug(pet.speciesSlug);
  const bodyType = species?.bodyType ?? "QUADRUPED";
  return {
    ok: true as const,
    speciesSlug: pet.speciesSlug,
    anatomy: anatomyTagsForBodyType(bodyType),
    level: 5,
    demo: false,
  };
}

export function getAppearance(
  ownerKey: string,
  publicPetId: string,
): AppearanceSnapshot | null {
  const ctx = resolvePetContext(ownerKey, publicPetId);
  if (!ctx.ok) return null;
  const loadout = getActiveLoadout(ownerKey, publicPetId);
  return buildAppearanceSnapshot({ loadout, speciesSlug: ctx.speciesSlug });
}

export function equipItem(input: {
  ownerKey: string;
  publicPetId: string;
  itemId: string;
  slot?: EquipmentSlotKey;
  safety?: Partial<SafetyGateContext>;
}): EquipResult {
  const safety = checkEquipmentSafety({
    inCombat: input.safety?.inCombat ?? false,
    inCutscene: input.safety?.inCutscene ?? false,
    otherPlayer: input.safety?.otherPlayer ?? false,
    actorIsOwner: input.safety?.actorIsOwner ?? true,
  });
  if (!safety.ok) {
    return { ok: false, reason: safety.reason, message: safety.message };
  }

  const ctx = resolvePetContext(input.ownerKey, input.publicPetId);
  if (!ctx.ok) {
    return { ok: false, reason: ctx.reason, message: ctx.message };
  }

  if (!ownsItem(input.ownerKey, input.itemId)) {
    return {
      ok: false,
      reason: "NOT_OWNED",
      message: "You do not own this item. Purchase or earn it first.",
    };
  }

  const compat = validateEquipCompatibility({
    itemId: input.itemId,
    petAnatomy: ctx.anatomy,
    petLevel: ctx.level,
    expectedSlot: input.slot ?? null,
  });
  if (!compat.ok) {
    return { ok: false, reason: compat.reason, message: compat.message };
  }

  const loadout = getActiveLoadout(input.ownerKey, input.publicPetId);
  loadout.slots = { ...loadout.slots, [compat.slot]: input.itemId };
  loadout.revision += 1;
  loadout.updatedAt = nowIso();
  maps().byKey.set(
    loadoutKey(input.ownerKey, input.publicPetId, loadout.presetName),
    loadout,
  );

  const catalog = getCatalogItem(input.itemId);
  let bound = false;
  if (catalog?.tradeability === "PET_BOUND_ON_USE") {
    bound = bindItemToPet(input.ownerKey, input.itemId, input.publicPetId);
  }

  const appearance = buildAppearanceSnapshot({
    loadout,
    speciesSlug: ctx.speciesSlug,
  });

  return {
    ok: true,
    loadout,
    appearance,
    bound,
    message: `Equipped ${compat.item.name}.`,
  };
}

export function unequipSlot(input: {
  ownerKey: string;
  publicPetId: string;
  slot: EquipmentSlotKey;
  safety?: Partial<SafetyGateContext>;
}): EquipResult {
  const safety = checkEquipmentSafety({
    inCombat: input.safety?.inCombat ?? false,
    inCutscene: input.safety?.inCutscene ?? false,
    otherPlayer: input.safety?.otherPlayer ?? false,
    actorIsOwner: input.safety?.actorIsOwner ?? true,
  });
  if (!safety.ok) {
    return { ok: false, reason: safety.reason, message: safety.message };
  }

  const ctx = resolvePetContext(input.ownerKey, input.publicPetId);
  if (!ctx.ok) {
    return { ok: false, reason: ctx.reason, message: ctx.message };
  }

  const loadout = getActiveLoadout(input.ownerKey, input.publicPetId);
  if (!loadout.slots[input.slot]) {
    return { ok: false, reason: "SLOT_EMPTY", message: "That slot is already empty." };
  }
  loadout.slots = { ...loadout.slots, [input.slot]: null };
  loadout.revision += 1;
  loadout.updatedAt = nowIso();
  maps().byKey.set(
    loadoutKey(input.ownerKey, input.publicPetId, loadout.presetName),
    loadout,
  );

  return {
    ok: true,
    loadout,
    appearance: buildAppearanceSnapshot({ loadout, speciesSlug: ctx.speciesSlug }),
    message: `Unequipped ${input.slot}.`,
  };
}

/** List owned equippable items that pass compatibility for this pet. */
export function listCompatibleOwned(input: {
  ownerKey: string;
  publicPetId: string;
  filter?: { slot?: EquipmentSlotKey; query?: string; rarity?: string };
}): Array<{
  itemId: string;
  name: string;
  slot: EquipmentSlotKey;
  rarity: string;
  iconPath: string;
  compatible: boolean;
  reason?: string;
}> {
  const ctx = resolvePetContext(input.ownerKey, input.publicPetId);
  const anatomy = ctx.ok ? ctx.anatomy : anatomyTagsForBodyType("QUADRUPED");
  const level = ctx.ok ? ctx.level : 1;
  const owned = listOwnedItems(input.ownerKey);
  const q = input.filter?.query?.toLowerCase().trim();

  const out: Array<{
    itemId: string;
    name: string;
    slot: EquipmentSlotKey;
    rarity: string;
    iconPath: string;
    compatible: boolean;
    reason?: string;
  }> = [];

  for (const row of owned) {
    const item = getCatalogItem(row.itemId);
    if (!item) continue;
    const compat = validateEquipCompatibility({
      itemId: row.itemId,
      petAnatomy: anatomy,
      petLevel: level,
    });
    if (!compat.ok && compat.reason === "NOT_EQUIPPABLE") continue;
    if (!compat.ok && compat.reason === "ITEM_NOT_FOUND") continue;

    const slot = compat.ok ? compat.slot : ("armor" as EquipmentSlotKey);
    if (input.filter?.slot && slot !== input.filter.slot) continue;
    if (input.filter?.rarity && item.rarity !== input.filter.rarity) continue;
    if (q && !item.name.toLowerCase().includes(q) && !item.id.includes(q)) continue;

    out.push({
      itemId: item.id,
      name: item.name,
      slot,
      rarity: item.rarity,
      iconPath: item.iconPath,
      compatible: compat.ok,
      reason: compat.ok ? undefined : compat.message,
    });
  }
  return out.sort((a, b) => Number(b.compatible) - Number(a.compatible) || a.name.localeCompare(b.name));
}

export function __resetLoadoutsForTests(): void {
  const m = maps();
  m.byKey.clear();
  m.activePreset.clear();
}
