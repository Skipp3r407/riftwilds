import type { NpcShopDef } from "@/game/npcs/types";

/** Soft-currency NPC shops — demo credits only, no real SOL. */
export const NPC_SHOPS: Record<string, NpcShopDef> = {
  "shop-mira-care": {
    id: "shop-mira-care",
    title: "Mira's Care Supplies",
    sellHint: "Care items for early bonds",
    buy: [
      {
        itemId: "basic-pet-meal",
        name: "Basic Pet Meal",
        price: 15,
        currency: "demo_credits",
        family: "CARE",
        rarity: "COMMON",
        iconPath: "/assets/items/potions/icons/basic-pet-meal.png?v=4",
      },
      {
        itemId: "mossmeal",
        name: "Mossmeal",
        price: 20,
        currency: "demo_credits",
        family: "CARE",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
      {
        itemId: "spark-ribbon",
        name: "Spark Ribbon",
        price: 25,
        currency: "demo_credits",
        family: "CARE",
        rarity: "COMMON",
        iconPath: "/assets/items/potions/icons/small-healing-salve.png?v=4",
      },
    ],
  },
  "shop-bram-tools": {
    id: "shop-bram-tools",
    title: "Bram's Forge Counter",
    sellHint: "Beginner tools and repair kits",
    buy: [
      {
        itemId: "starter-pick",
        name: "Starter Pick",
        price: 40,
        currency: "demo_credits",
        family: "WEAPON",
        rarity: "COMMON",
        iconPath: "/assets/items/weapons/icons/wooden-paw-guard.png?v=4",
      },
      {
        itemId: "keeper-hatchet",
        name: "Keeper Hatchet",
        price: 40,
        currency: "demo_credits",
        family: "WEAPON",
        rarity: "COMMON",
        iconPath: "/assets/items/weapons/icons/wooden-paw-guard.png?v=4",
      },
      {
        itemId: "repair-kit-basic",
        name: "Basic Repair Kit",
        price: 30,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-tessa-goods": {
    id: "shop-tessa-goods",
    title: "Tessa's Trading Post",
    sellHint: "Consumables and common goods",
    buy: [
      {
        itemId: "travel-ration",
        name: "Travel Ration",
        price: 10,
        currency: "demo_credits",
        family: "CARE",
        rarity: "COMMON",
        iconPath: "/assets/items/potions/icons/basic-pet-meal.png?v=4",
      },
      {
        itemId: "small-healing-salve",
        name: "Small Healing Salve",
        price: 18,
        currency: "demo_credits",
        family: "POTION",
        rarity: "COMMON",
        iconPath: "/assets/items/potions/icons/small-healing-salve.png?v=4",
      },
      {
        itemId: "plaza-herb-bundle",
        name: "Plaza Herb Bundle",
        price: 12,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-nyla-heal": {
    id: "shop-nyla-heal",
    title: "Nyla's Recovery Shelf",
    sellHint: "Healing supplies",
    buy: [
      {
        itemId: "small-healing-salve",
        name: "Small Healing Salve",
        price: 16,
        currency: "demo_credits",
        family: "POTION",
        rarity: "COMMON",
        iconPath: "/assets/items/potions/icons/small-healing-salve.png?v=4",
      },
      {
        itemId: "recovery-draught",
        name: "Recovery Draught",
        price: 35,
        currency: "demo_credits",
        family: "POTION",
        rarity: "UNCOMMON",
        iconPath: "/assets/items/potions/icons/small-healing-salve.png?v=4",
      },
    ],
  },
  "shop-vessa-ember": {
    id: "shop-vessa-ember",
    title: "Vessa's Ember Temper",
    buy: [
      {
        itemId: "ember-temper-oil",
        name: "Ember Temper Oil",
        price: 45,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "UNCOMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-marina-coast": {
    id: "shop-marina-coast",
    title: "Marina's Coastal Kits",
    buy: [
      {
        itemId: "coastal-kit",
        name: "Coastal Starter Kit",
        price: 30,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-elden-herbs": {
    id: "shop-elden-herbs",
    title: "Elden's Herb Pouch",
    buy: [
      {
        itemId: "groveleaf",
        name: "Groveleaf",
        price: 14,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-volt-spark": {
    id: "shop-volt-spark",
    title: "Volt's Spark Bench",
    buy: [
      {
        itemId: "spark-cell",
        name: "Spark Cell",
        price: 50,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "UNCOMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-opal-gems": {
    id: "shop-opal-gems",
    title: "Opal's Gem Tray",
    buy: [
      {
        itemId: "beginner-socket",
        name: "Beginner Socket Crystal",
        price: 55,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "UNCOMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-jori-frost": {
    id: "shop-jori-frost",
    title: "Jori's Frost Draughts",
    buy: [
      {
        itemId: "chill-balm",
        name: "Chill Balm",
        price: 28,
        currency: "demo_credits",
        family: "POTION",
        rarity: "COMMON",
        iconPath: "/assets/items/potions/icons/small-healing-salve.png?v=4",
      },
    ],
  },
  "shop-verin-relics": {
    id: "shop-verin-relics",
    title: "Verin's Study Copies",
    buy: [
      {
        itemId: "relic-rubbing",
        name: "Relic Rubbing",
        price: 22,
        currency: "demo_credits",
        family: "COLLECTIBLE",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-knox-salvage": {
    id: "shop-knox-salvage",
    title: "Knox Salvage",
    buy: [
      {
        itemId: "clean-scrap",
        name: "Clean Scrap Bundle",
        price: 20,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "COMMON",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
  "shop-orion-star": {
    id: "shop-orion-star",
    title: "Orion's Starforge (Preview)",
    buy: [
      {
        itemId: "star-shard-sample",
        name: "Star Shard Sample",
        price: 120,
        currency: "demo_credits",
        family: "MATERIAL",
        rarity: "RARE",
        iconPath: "/assets/items/materials/icons/ember-dust.png?v=4",
      },
    ],
  },
};

export function getNpcShop(shopId: string): NpcShopDef | undefined {
  return NPC_SHOPS[shopId];
}
