import type { AttachmentPoint, ItemRarity } from "@/lib/items/types";

/** Cosmetic / gear slots on an active Riftling. */
export type EquipmentSlotKey =
  | "weapon"
  | "armor"
  | "charm"
  | "cosmetic"
  | "head"
  | "back"
  | "paw"
  | "tail"
  | "wing";

export const EQUIPMENT_SLOT_KEYS: EquipmentSlotKey[] = [
  "weapon",
  "armor",
  "head",
  "back",
  "paw",
  "tail",
  "wing",
  "charm",
  "cosmetic",
];

export type LoadoutPresetName =
  | "Default"
  | "Adventure"
  | "Arena"
  | "Homestead"
  | "Ceremony";

export const LOADOUT_PRESET_NAMES: LoadoutPresetName[] = [
  "Default",
  "Adventure",
  "Arena",
  "Homestead",
  "Ceremony",
];

/** Full slot map for world cosmetics + pet gear. */
export type SlotLoadoutMap = Record<EquipmentSlotKey, string | null>;

export function emptySlotMap(): SlotLoadoutMap {
  return {
    weapon: null,
    armor: null,
    charm: null,
    cosmetic: null,
    head: null,
    back: null,
    paw: null,
    tail: null,
    wing: null,
  };
}

/** Prisma PetLoadout–compatible projection. */
export type CosmeticLoadoutSlots = {
  weaponKey: string | null;
  armorKey: string | null;
  charmKey: string | null;
  cosmeticKey: string | null;
};

export type CosmeticLoadout = {
  publicPetId: string;
  ownerKey: string;
  presetName: LoadoutPresetName | string;
  revision: number;
  updatedAt: string;
  slots: SlotLoadoutMap;
  /** Active preset flag — only one active per pet. */
  active: boolean;
};

export type EquippedLayer = {
  itemId: string;
  slot: EquipmentSlotKey;
  attachment: AttachmentPoint;
  iconPath: string;
  /** World overlay path — falls back to icon when layer art is missing. */
  worldLayerPath: string;
  rarity: ItemRarity;
  name: string;
};

export type AppearanceSnapshot = {
  publicPetId: string;
  ownerKey: string;
  speciesSlug: string;
  revision: number;
  layers: EquippedLayer[];
  slots: SlotLoadoutMap;
  updatedAt: string;
};

export type CompatibilityReason =
  | "OK"
  | "ITEM_NOT_FOUND"
  | "NOT_EQUIPPABLE"
  | "INCOMPATIBLE_ANATOMY"
  | "WRONG_SLOT"
  | "LEVEL_TOO_LOW"
  | "NOT_OWNED"
  | "PET_NOT_OWNED"
  | "PET_NOT_FOUND"
  | "SAFETY_BLOCKED"
  | "OTHER_PLAYER"
  | "ALREADY_EQUIPPED"
  | "SLOT_EMPTY";

export type EquipResult =
  | {
      ok: true;
      loadout: CosmeticLoadout;
      appearance: AppearanceSnapshot;
      bound?: boolean;
      message?: string;
    }
  | {
      ok: false;
      reason: CompatibilityReason;
      message: string;
    };

export type SafetyGateContext = {
  inCombat: boolean;
  inCutscene: boolean;
  /** True when inspecting another player's Riftling. */
  otherPlayer: boolean;
  /** Active owner attempting the equip. */
  actorIsOwner: boolean;
};

export type OwnedItemRef = {
  itemId: string;
  quantity: number;
  bound: boolean;
  boundToPetId?: string | null;
};
