import {
  ABILITY_CATALOG,
  getShopItemsByCategory,
} from "@/lib/items/catalog";
import { quoteDirectPurchase } from "@/lib/items/pricing";
import { toShopCards, type ShopCardData } from "@/lib/items/shop-serialize";
import type { AnyCatalogItem } from "@/lib/items/types";

export type ShopSectionId =
  | "featured"
  | "weapons"
  | "armor"
  | "potions"
  | "magic"
  | "materials"
  | "cosmetics"
  | "recovery";

export type ShopSectionDef = {
  id: ShopSectionId;
  slug: string;
  label: string;
  href: string;
  description: string;
};

export const SHOP_SECTIONS: ShopSectionDef[] = [
  {
    id: "featured",
    slug: "featured",
    label: "Featured",
    href: "/shop/featured",
    description: "Highlighted gear and care picks at disclosed SOL prices.",
  },
  {
    id: "weapons",
    slug: "weapons",
    label: "Weapons",
    href: "/shop/weapons",
    description: "Named weapons for Riftling loadouts. Exact stats disclosed.",
  },
  {
    id: "armor",
    slug: "armor",
    label: "Armor",
    href: "/shop/armor",
    description: "Harnesses, vests, and guards — no mystery rarity rolls.",
  },
  {
    id: "potions",
    slug: "potions",
    label: "Potions",
    href: "/shop/potions",
    description: "Healing and status tonics with listed effects.",
  },
  {
    id: "magic",
    slug: "magic",
    label: "Magic",
    href: "/shop/magic",
    description: "Ability scrolls that teach a disclosed skill to compatible pets.",
  },
  {
    id: "materials",
    slug: "materials",
    label: "Materials",
    href: "/shop/materials",
    description: "Crafting inputs and affinity dusts.",
  },
  {
    id: "cosmetics",
    slug: "cosmetics",
    label: "Cosmetics",
    href: "/shop/cosmetics",
    description: "Prestige and celestial looks — still entertainment items only.",
  },
  {
    id: "recovery",
    slug: "recovery",
    label: "Recovery",
    href: "/shop/recovery",
    description: "Care meals and revival supplies for pet health loops.",
  },
];

function abilityScrollsToCards(solUsdRate: number): ShopCardData[] {
  return ABILITY_CATALOG.filter((a) => a.scrollId).map((a) => {
    const id = a.scrollId!;
    const quote = quoteDirectPurchase({ itemId: id, rarity: a.rarity, solUsdRate });
    return {
      id,
      name: `Scroll of ${a.name}`,
      description: `Teaches a compatible pet ${a.name}. Exact ability disclosed. ${a.description}`,
      rarity: a.rarity,
      family: "ABILITY_SCROLL",
      affinity: a.affinity,
      iconPath: a.iconPath,
      affixes: [] as string[],
      supply: "UNLIMITED",
      compatibleAnatomy: ["compatible affinity"],
      price: {
        sol: quote.priceSol,
        estimatedUsd: quote.estimatedUsd,
        usdDisclaimer: quote.usdDisclaimer,
        lamports: quote.priceLamports.toString(),
      },
      effect: `${a.category} · Power ${a.power} · Energy ${a.energyCost}`,
    };
  });
}

function cosmeticsSourceItems(): AnyCatalogItem[] {
  const celestial = getShopItemsByCategory("WEAPONS").filter((i) => i.rarity === "CELESTIAL");
  const armorCos = getShopItemsByCategory("ARMOR").filter((i) =>
    ["CELESTIAL", "MYTHIC"].includes(i.rarity),
  );
  return [...celestial, ...armorCos];
}

export function getShopSectionItems(
  sectionId: ShopSectionId,
  solUsdRate = 150,
): ShopCardData[] {
  switch (sectionId) {
    case "featured":
      return toShopCards(getShopItemsByCategory("FEATURED"), solUsdRate);
    case "weapons":
      return toShopCards(getShopItemsByCategory("WEAPONS"), solUsdRate);
    case "armor":
      return toShopCards(getShopItemsByCategory("ARMOR"), solUsdRate);
    case "potions":
      return toShopCards(getShopItemsByCategory("POTIONS"), solUsdRate);
    case "magic":
      return abilityScrollsToCards(solUsdRate);
    case "materials":
      return toShopCards(getShopItemsByCategory("MATERIALS"), solUsdRate);
    case "cosmetics":
      return toShopCards(cosmeticsSourceItems(), solUsdRate);
    case "recovery":
      return toShopCards(
        [...getShopItemsByCategory("RECOVERY"), ...getShopItemsByCategory("CARE")],
        solUsdRate,
      );
    default:
      return [];
  }
}

export function getAllShopSectionsWithItems(solUsdRate = 150): {
  section: ShopSectionDef;
  items: ShopCardData[];
}[] {
  return SHOP_SECTIONS.map((section) => ({
    section,
    items: getShopSectionItems(section.id, solUsdRate),
  }));
}
