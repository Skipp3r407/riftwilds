/**
 * Shared demo inventory for shop grants + inventory UI.
 * Server inventory syncs after Phase 2 purchases.
 *
 * Care / food goods that formerly appeared as TCG "item" cards live here.
 */

import type { ItemRarity } from "@/lib/items/types";

export const DEMO_INVENTORY_STORAGE_KEY = "riftwilds-demo-inventory-v5";

export type DemoInventoryTab =
  | "All"
  | "Food"
  | "Weapons"
  | "Armor"
  | "Potions"
  | "Abilities"
  | "Materials"
  | "Care"
  | "Tools"
  | "Quests"
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
  /** Optional Companion Care action hint for Use/Feed buttons. */
  careHint?: "feed" | "play" | "train" | "heal" | "clean" | "rest" | "bond" | "use";
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
    quantity: 8,
    iconPath: "/assets/items/potions/icons/basic-pet-meal.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Food",
    careHint: "feed",
  },
  {
    id: "premium-pet-meal",
    name: "Premium Pet Meal",
    family: "CARE",
    rarity: "UNCOMMON",
    quantity: 2,
    iconPath: "/assets/items/potions/icons/premium-pet-meal.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Food",
    careHint: "feed",
  },
  {
    id: "crystal-berry-snack",
    name: "Crystal Berry Snack",
    family: "CARE",
    rarity: "COMMON",
    quantity: 4,
    iconPath: "/assets/items/potions/icons/crystal-berry-snack.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Food",
    careHint: "feed",
  },
  {
    id: "happiness-treat",
    name: "Happiness Treat",
    family: "CARE",
    rarity: "COMMON",
    quantity: 3,
    iconPath: "/assets/items/potions/icons/happiness-treat.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Food",
    careHint: "feed",
  },
  {
    id: "rift-toy",
    name: "Rift Toy",
    family: "CARE",
    rarity: "COMMON",
    quantity: 2,
    iconPath: "/assets/items/potions/icons/rift-toy.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Care",
    careHint: "play",
  },
  {
    id: "comfortable-nest",
    name: "Comfortable Nest",
    family: "CARE",
    rarity: "UNCOMMON",
    quantity: 1,
    iconPath: "/assets/items/potions/icons/comfortable-nest.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Care",
    careHint: "rest",
  },
  {
    id: "medicine-pack",
    name: "Medicine Pack",
    family: "RECOVERY",
    rarity: "UNCOMMON",
    quantity: 2,
    iconPath: "/assets/items/potions/icons/medicine-pack.png?v=4",
    ownership: "Off-chain",
    tradeability: "Tradable",
    tab: "Recovery",
    careHint: "heal",
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
    case "FOOD":
      return "Food";
    case "TOOL":
      return "Tools";
    case "QUEST":
      return "Quests";
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
    quantity?: number;
    careHint?: DemoInventoryRow["careHint"];
  },
): DemoInventoryRow[] {
  const qty = item.quantity ?? 1;
  const idx = rows.findIndex((r) => r.id === item.id);
  if (idx >= 0) {
    const next = [...rows];
    const cur = next[idx]!;
    next[idx] = { ...cur, quantity: cur.quantity + qty };
    return next;
  }
  return [
    ...rows,
    {
      id: item.id,
      name: item.name,
      family: item.family,
      rarity: item.rarity,
      quantity: qty,
      iconPath: item.iconPath,
      ownership: "Off-chain",
      tradeability: "Tradable",
      tab: familyToInventoryTab(item.family),
      careHint: item.careHint,
    },
  ];
}

export function parseDemoInventory(raw: string): DemoInventoryRow[] {
  try {
    const parsed = JSON.parse(raw) as DemoInventoryRow[];
    if (!Array.isArray(parsed)) return [...DEMO_STARTER_INVENTORY];
    return parsed.map((r) => ({
      ...r,
      tab: r.tab ?? familyToInventoryTab(r.family),
      quantity: Math.max(0, Number(r.quantity) || 0),
    }));
  } catch {
    return [...DEMO_STARTER_INVENTORY];
  }
}
