/**
 * Shared demo inventory for shop grants + inventory UI.
 * Server inventory syncs after Phase 2 purchases.
 */

import type { ItemRarity } from "@/lib/items/types";

export const DEMO_INVENTORY_STORAGE_KEY = "riftwilds-demo-inventory-v4";

export type DemoInventoryTab =
  | "All"
  | "Weapons"
  | "Armor"
  | "Potions"
  | "Abilities"
  | "Materials"
  | "Care"
  | "Cosmetics"
  | "Recovery"
  | "Collectibles";

export type DemoInventoryRow = {
  id: string;
  name: string;
  family: string;
  rarity: ItemRarity;
  quantity: number;
  iconPath: string;
  ownership: string;
  tradeability: string;
  tab: Exclude<DemoInventoryTab, "All">;
};

export const DEMO_STARTER_INVENTORY: DemoInventoryRow[] = [
  {
    id: "wooden-paw-guard",
    name: "Wooden Paw Guard",
    family: "WEAPON",
    rarity: "COMMON",
    quantity: 1,
    iconPath: "/assets/items/weapons/icons/wooden-paw-guard.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Weapons",
  },
  {
    id: "basic-pet-meal",
    name: "Basic Pet Meal",
    family: "CARE",
    rarity: "COMMON",
    quantity: 5,
    iconPath: "/assets/items/potions/icons/basic-pet-meal.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Care",
  },
  {
    id: "small-healing-salve",
    name: "Small Healing Salve",
    family: "POTION",
    rarity: "COMMON",
    quantity: 3,
    iconPath: "/assets/items/potions/icons/small-healing-salve.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Potions",
  },
  {
    id: "ember-dust",
    name: "Ember Dust",
    family: "MATERIAL",
    rarity: "UNCOMMON",
    quantity: 12,
    iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Materials",
  },
  {
    id: "cloth-pet-vest",
    name: "Cloth Pet Vest",
    family: "ARMOR",
    rarity: "COMMON",
    quantity: 1,
    iconPath: "/assets/items/armor/icons/cloth-pet-vest.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Armor",
  },
];

export function familyToInventoryTab(family: string): Exclude<DemoInventoryTab, "All"> {
  switch (family) {
    case "WEAPON":
      return "Weapons";
    case "ARMOR":
      return "Armor";
    case "POTION":
      return "Potions";
    case "ABILITY_SCROLL":
      return "Abilities";
    case "MATERIAL":
      return "Materials";
    case "CARE":
      return "Care";
    case "COSMETIC":
      return "Cosmetics";
    case "RECOVERY":
      return "Recovery";
    default:
      return "Collectibles";
  }
}

export function grantDemoInventoryItem(
  rows: DemoInventoryRow[],
  item: {
    id: string;
    name: string;
    family: string;
    rarity: ItemRarity;
    iconPath: string;
  },
  quantity = 1,
): DemoInventoryRow[] {
  const qty = Math.max(1, Math.floor(quantity));
  const existing = rows.find((r) => r.id === item.id);
  if (existing) {
    return rows.map((r) =>
      r.id === item.id ? { ...r, quantity: r.quantity + qty } : r,
    );
  }
  const next: DemoInventoryRow = {
    id: item.id,
    name: item.name,
    family: item.family,
    rarity: item.rarity,
    quantity: qty,
    iconPath: item.iconPath,
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: familyToInventoryTab(item.family),
  };
  return [...rows, next];
}

export function parseDemoInventory(raw: string | null): DemoInventoryRow[] {
  if (!raw) return [...DEMO_STARTER_INVENTORY];
  try {
    const parsed = JSON.parse(raw) as DemoInventoryRow[];
    if (!Array.isArray(parsed)) return [...DEMO_STARTER_INVENTORY];
    return parsed;
  } catch {
    return [...DEMO_STARTER_INVENTORY];
  }
}
