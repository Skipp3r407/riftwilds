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
  | "cosmetics"
  | "recovery"
  | "weapons"
  | "armor"
  | "potions"
  | "magic"
  | "materials";

export type ShopSectionDef = {
  id: ShopSectionId;
  slug: string;
  label: string;
  href: string;
  description: string;
  /** Soft-hide in primary nav chrome (still linked from legacy pages). */
  demoted?: boolean;
};

/** TCG card-shop IA — packs/binders/cosmetics lead; Live World gear is demoted. */
export const SHOP_SECTIONS: ShopSectionDef[] = [
  {
    id: "featured",
    slug: "featured",
    label: "Featured",
    href: "/shop/featured",
    description: "Card packs, binder pages, and deck slots — Credits-first Rift Battle goods.",
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
    description: "Sleeves and board skins — optional prestige, never competitive power.",
  },
  {
    id: "cosmetics",
    slug: "cosmetics",
    label: "Prestige looks",
    href: "/shop/cosmetics",
    description: "Legacy celestial looks — entertainment cosmetics only.",
    demoted: true,
  },
  {
    id: "recovery",
    slug: "recovery",
    label: "Care & recovery",
    href: "/shop/recovery",
    description: "Care meals and revival supplies for companion health loops.",
    demoted: true,
  },
  {
    id: "weapons",
    slug: "weapons",
    label: "Legacy weapons",
    href: "/shop/weapons",
    description: "Live World / Arena loadout weapons — not Rift Battle power.",
    demoted: true,
  },
  {
    id: "armor",
    slug: "armor",
    label: "Legacy armor",
    href: "/shop/armor",
    description: "Live World harnesses and guards — soft-secondary.",
    demoted: true,
  },
  {
    id: "potions",
    slug: "potions",
    label: "Potions",
    href: "/shop/potions",
    description: "Healing and status tonics with listed effects.",
    demoted: true,
  },
  {
    id: "magic",
    slug: "magic",
    label: "Ability scrolls",
    href: "/shop/magic",
    description: "Scrolls that teach a disclosed skill to compatible pets.",
    demoted: true,
  },
  {
    id: "materials",
    slug: "materials",
    label: "Materials",
    href: "/shop/materials",
    description: "Crafting inputs and affinity dusts.",
    demoted: true,
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
      // TCG desk only — Live World weapons stay in legacy sections.
      return getTcgFeaturedOffers();
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
