import type { BodyCategory } from "@/game/creatures/species-catalog";
import { getCatalogItem } from "@/lib/items/catalog";
import type { AnyCatalogItem, AttachmentPoint } from "@/lib/items/types";
import type { CompatibilityReason, EquipmentSlotKey } from "@/lib/equipment/types";

/** Anatomy tags implied by a species body plan. */
export function anatomyTagsForBodyType(bodyType: BodyCategory): string[] {
  const base = ["head", "chest", "back", "neck"];
  switch (bodyType) {
    case "QUADRUPED":
      return [
        ...base,
        "quadruped",
        "frontPaw",
        "rearPaw",
        "tailBase",
        "tailMiddle",
        "tailTip",
        "horn",
      ];
    case "BIPED":
      return [...base, "biped", "frontPaw", "rearPaw", "tailBase", "horn"];
    case "AVIAN":
      return [...base, "avian", "wing", "wingLeft", "wingRight", "rearPaw", "tailBase", "horn"];
    case "AQUATIC":
      return [...base, "aquatic", "tailBase", "tailMiddle", "tailTip", "fin"];
    case "SERPENTINE":
      return [...base, "serpentine", "tailBase", "tailMiddle", "tailTip", "horn"];
    case "FLOATING":
      return [...base, "floating", "floatingFocus", "spirit"];
    case "INSECTOID":
      return [...base, "insectoid", "wing", "wingLeft", "wingRight", "frontPaw", "rearPaw"];
    case "STONE_BODIED":
      return [...base, "stone", "quadruped", "frontPaw", "rearPaw", "horn"];
    case "PLANT_BODIED":
      return [...base, "plant", "back", "frontPaw", "tailBase"];
    case "SPIRIT_BODIED":
      return [...base, "spirit", "floatingFocus", "floating", "horn"];
    case "MECHANICAL_ORGANIC":
      return [...base, "mechanical", "alloy", "frontPaw", "rearPaw", "back", "horn"];
    case "AMORPHOUS":
      return [...base, "amorphous", "floatingFocus", "spirit"];
    default:
      return [...base, "quadruped", "frontPaw", "rearPaw", "tailBase"];
  }
}

export function slotForCatalogItem(item: AnyCatalogItem): EquipmentSlotKey | null {
  if (item.family === "WEAPON") return "weapon";
  if (item.family === "ARMOR") {
    if ("armorClass" in item) {
      switch (item.armorClass) {
        case "HEAD":
          return "head";
        case "BACK":
          return "back";
        case "PAW":
          return "paw";
        case "TAIL":
          return "tail";
        case "WING":
          return "wing";
        case "COSMETIC_SET":
          return "cosmetic";
        case "CHEST":
        case "BARRIER":
        default:
          return "armor";
      }
    }
    return "armor";
  }
  if (item.family === "COSMETIC") return "cosmetic";
  return null;
}

export function isEquippableFamily(item: AnyCatalogItem): boolean {
  return item.family === "WEAPON" || item.family === "ARMOR" || item.family === "COSMETIC";
}

export function checkAnatomyCompatibility(
  item: AnyCatalogItem,
  petAnatomy: string[],
): { ok: true } | { ok: false; reason: CompatibilityReason; message: string } {
  const required = item.compatibleAnatomy ?? [];
  if (required.length === 0 || required.includes("any")) {
    return { ok: true };
  }
  const petSet = new Set(petAnatomy.map((a) => a.toLowerCase()));
  const hit = required.some((tag) => petSet.has(tag.toLowerCase()));
  if (hit) return { ok: true };
  return {
    ok: false,
    reason: "INCOMPATIBLE_ANATOMY",
    message: `${item.name} needs anatomy [${required.join(", ")}] — this Riftling has [${petAnatomy.slice(0, 8).join(", ")}].`,
  };
}

export function validateEquipCompatibility(input: {
  itemId: string;
  petAnatomy: string[];
  petLevel?: number;
  expectedSlot?: EquipmentSlotKey | null;
}):
  | { ok: true; item: AnyCatalogItem; slot: EquipmentSlotKey; attachment: AttachmentPoint }
  | { ok: false; reason: CompatibilityReason; message: string } {
  const item = getCatalogItem(input.itemId);
  if (!item) {
    return { ok: false, reason: "ITEM_NOT_FOUND", message: "That item is not in the catalog." };
  }
  if (!isEquippableFamily(item)) {
    return {
      ok: false,
      reason: "NOT_EQUIPPABLE",
      message: `${item.name} cannot be equipped on a Riftling.`,
    };
  }
  const slot = slotForCatalogItem(item);
  if (!slot) {
    return {
      ok: false,
      reason: "NOT_EQUIPPABLE",
      message: `${item.name} has no equipment slot.`,
    };
  }
  if (input.expectedSlot && input.expectedSlot !== slot) {
    return {
      ok: false,
      reason: "WRONG_SLOT",
      message: `${item.name} belongs in the ${slot} slot, not ${input.expectedSlot}.`,
    };
  }
  const anatomy = checkAnatomyCompatibility(item, input.petAnatomy);
  if (!anatomy.ok) return anatomy;

  const level = input.petLevel ?? 1;
  if (item.levelRequirement > level) {
    return {
      ok: false,
      reason: "LEVEL_TOO_LOW",
      message: `${item.name} requires Keeper/pet level ${item.levelRequirement} (current ${level}).`,
    };
  }

  const attachment = item.attachment ?? defaultAttachmentForSlot(slot);
  return { ok: true, item, slot, attachment };
}

export function defaultAttachmentForSlot(slot: EquipmentSlotKey): AttachmentPoint {
  switch (slot) {
    case "weapon":
      return "frontPawLeft";
    case "head":
      return "head";
    case "back":
      return "back";
    case "paw":
      return "frontPawLeft";
    case "tail":
      return "tailBase";
    case "wing":
      return "wingLeft";
    case "charm":
      return "neck";
    case "cosmetic":
      return "chest";
    case "armor":
    default:
      return "chest";
  }
}

/** Project full slot map onto Prisma PetLoadout keys. */
export function toPrismaLoadoutKeys(slots: {
  weapon: string | null;
  armor: string | null;
  charm: string | null;
  cosmetic: string | null;
}): {
  weaponKey: string | null;
  armorKey: string | null;
  charmKey: string | null;
  cosmeticKey: string | null;
} {
  return {
    weaponKey: slots.weapon,
    armorKey: slots.armor,
    charmKey: slots.charm,
    cosmeticKey: slots.cosmetic,
  };
}
