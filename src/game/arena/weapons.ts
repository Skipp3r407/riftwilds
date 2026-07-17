/**
 * Arena weapon helpers — backed by the SOL item catalog.
 * Ranked normalization remains Option A (≤18% equip contribution).
 */
import { WEAPON_CATALOG, getWeaponById as getCatalogWeapon } from "@/lib/items/catalog/weapons";
import type { WeaponCatalogItem } from "@/lib/items/types";

export type WeaponClass = WeaponCatalogItem["weaponClass"] | "SHIELD" | "SUPPORT";

export type WeaponDefinition = {
  id: string;
  name: string;
  weaponClass: WeaponClass;
  affinity: string | null;
  rarity: WeaponCatalogItem["rarity"];
  description: string;
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
  compatibleAnatomy: string[];
  attachment: string;
  iconPath: string;
};

export const STARTER_WEAPONS: WeaponDefinition[] = WEAPON_CATALOG.map((w) => ({
  id: w.id,
  name: w.name,
  weaponClass: w.weaponClass,
  affinity: w.affinity,
  rarity: w.rarity,
  description: w.description,
  attackBonus: w.stats.attack,
  defenseBonus: w.stats.defense,
  speedBonus: w.stats.speed,
  compatibleAnatomy: w.compatibleAnatomy,
  attachment: w.attachment ?? "chest",
  iconPath: w.iconPath,
}));

export function getWeapon(id: string): WeaponDefinition | undefined {
  const w = getCatalogWeapon(id);
  if (!w) return STARTER_WEAPONS.find((x) => x.id === id);
  return {
    id: w.id,
    name: w.name,
    weaponClass: w.weaponClass,
    affinity: w.affinity,
    rarity: w.rarity,
    description: w.description,
    attackBonus: w.stats.attack,
    defenseBonus: w.stats.defense,
    speedBonus: w.stats.speed,
    compatibleAnatomy: w.compatibleAnatomy,
    attachment: w.attachment ?? "chest",
    iconPath: w.iconPath,
  };
}

export function normalizeEquipAttackBonus(rawBonus: number, baseAttack: number): number {
  const cap = Math.floor(baseAttack * 0.18);
  return Math.min(Math.max(0, rawBonus), cap);
}
