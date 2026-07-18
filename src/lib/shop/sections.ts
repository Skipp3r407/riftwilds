import {
  ABILITY_CATALOG,
  getShopItemsByCategory,
} from "@/lib/items/catalog";
import { lamportsToCreditsPrice } from "@/lib/economy/core/credits-pricing";
import { quoteDirectPurchase } from "@/lib/items/pricing";
import { toShopCards, type ShopCardData } from "@/lib/items/shop-serialize";
import type { AnyCatalogItem } from "@/lib/items/types";
import {
  getTcgBinderOffers,
  getTcgCosmeticOffers,
  getTcgFeaturedOffers,
  getTcgPackOffers,
} from "@/lib/shop/tcg-catalog";

export type ShopSectionId =
  | "featured"
  | "packs"
  | "binders"
  | "card-cosmetics"
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

/** TCG-first shop IA — packs/binders/cosmetics lead; legacy gear stays available. */
export const SHOP_SECTIONS: ShopSectionDef[] = [
  {
    id: "featured",
    slug: "featured",
    label: "Featured",
    href: "/shop/featured",
    description: "Rift Battle packs, binder pages, and deck slots — Credits-first.",
  },
  {
    id: "packs",
    slug: "packs",
    label: "Card packs",
    href: "/shop/packs",
    description: "Disclosed affinity packs for your Card Binder. No paid mystery gear.",
  },
  {
    id: "binders",
    slug: "binders",
    label: "Binders & decks",
    href: "/shop/binders",
    description: "Binder pages and extra deck slots for practice boards.",
  },
  {
    id: "card-cosmetics",
    slug: "card-cosmetics",
    label: "Card cosmetics",
    href: "/shop/card-cosmetics",
    description: "Sleeves and board skins — optional prestige, SOL never required to play.",
  },
  {
    id: "cosmetics",
    slug: "cosmetics",
    label: "Prestige looks",
    href: "/shop/cosmetics",
    description: "Legacy celestial looks — still entertainment items only.",
  },
  {
    id: "recovery",
    slug: "recovery",
    label: "Care & recovery",
    href: "/shop/recovery",
    description: "Care meals and revival supplies for Riftling health loops.",
  },
  {
    id: "weapons",
    slug: "weapons",
    label: "Weapons",
    href: "/shop/weapons",
    description: "Legacy Arena loadout weapons — soft-secondary to Rift Battles.",
  },
  {
    id: "armor",
    slug: "armor",
    label: "Armor",
    href: "/shop/armor",
    description: "Legacy harnesses and guards — soft-secondary.",
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
        credits: lamportsToCreditsPrice(quote.priceLamports),
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
      return [
        ...getTcgFeaturedOffers(),
        ...toShopCards(getShopItemsByCategory("FEATURED"), solUsdRate).slice(0, 4),
      ];
    case "packs":
      return getTcgPackOffers();
    case "binders":
      return getTcgBinderOffers();
    case "card-cosmetics":
      return getTcgCosmeticOffers();
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
