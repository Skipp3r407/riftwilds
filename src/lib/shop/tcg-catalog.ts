/**
 * Credits-first Rift Battle shop offers — packs, binder slots, card cosmetics.
 * SOL remains optional (cosmetics may still quote wallet SOL via shared purchase panel).
 */

import type { ShopCardData } from "@/lib/items/shop-serialize";
import { solToLamports } from "@/lib/items/lamports";
import { lamportsToCreditsPrice } from "@/lib/economy/core/credits-pricing";

function card(
  partial: Omit<ShopCardData, "price" | "affixes" | "compatibleAnatomy" | "supply"> & {
    priceSol: string;
    effect?: string;
  },
): ShopCardData {
  const lamports = solToLamports(partial.priceSol);
  return {
    id: partial.id,
    name: partial.name,
    description: partial.description,
    rarity: partial.rarity,
    family: partial.family,
    affinity: partial.affinity,
    iconPath: partial.iconPath,
    affixes: [],
    supply: "UNLIMITED",
    compatibleAnatomy: ["deck", "binder"],
    price: {
      sol: partial.priceSol,
      estimatedUsd: null,
      usdDisclaimer: "USD estimate unavailable — Credits are the play path.",
      lamports: lamports.toString(),
      credits: lamportsToCreditsPrice(lamports),
    },
    effect: partial.effect,
  };
}

/** Featured TCG offers (hero row). */
export function getTcgFeaturedOffers(): ShopCardData[] {
  return [
    card({
      id: "tcg-pack-ember-spark",
      name: "Ember Spark Pack",
      description:
        "Three practice cards weighted toward Ember affinity. Disclosed pool — no paid mystery gear.",
      rarity: "UNCOMMON",
      family: "TCG_PACK",
      affinity: "EMBER",
      iconPath: "/assets/ui/shop/pack-ember.svg",
      priceSol: "0.02",
      effect: "Adds 3 binder cards · Credits checkout",
    }),
    card({
      id: "tcg-pack-tideglass",
      name: "Tideglass Pack",
      description: "Three Tide-leaning practice cards for coastal board themes.",
      rarity: "UNCOMMON",
      family: "TCG_PACK",
      affinity: "TIDE",
      iconPath: "/assets/ui/shop/pack-tide.svg",
      priceSol: "0.02",
      effect: "Adds 3 binder cards · Credits checkout",
    }),
    card({
      id: "tcg-binder-page",
      name: "Binder Page",
      description: "Unlocks one extra Card Binder page (12 slots). Pure collection QoL.",
      rarity: "COMMON",
      family: "TCG_BINDER",
      affinity: null,
      iconPath: "/assets/ui/shop/binder-page.svg",
      priceSol: "0.015",
      effect: "+1 binder page",
    }),
    card({
      id: "tcg-deck-slot",
      name: "Extra Deck Slot",
      description: "Save a second active deck preset for quick swaps before Rift Battles.",
      rarity: "RARE",
      family: "TCG_DECK",
      affinity: null,
      iconPath: "/assets/ui/shop/deck-slot.svg",
      priceSol: "0.04",
      effect: "+1 saved deck",
    }),
  ];
}

export function getTcgPackOffers(): ShopCardData[] {
  return [
    ...getTcgFeaturedOffers().filter((c) => c.family === "TCG_PACK"),
    card({
      id: "tcg-pack-grove-moss",
      name: "Grove Moss Pack",
      description: "Grove-affinity practice cards for forest board themes.",
      rarity: "COMMON",
      family: "TCG_PACK",
      affinity: "GROVE",
      iconPath: "/assets/ui/shop/pack-grove.svg",
      priceSol: "0.018",
      effect: "Adds 3 binder cards",
    }),
    card({
      id: "tcg-pack-storm-spire",
      name: "Stormspire Pack",
      description: "Storm-affinity burst cards — disclosed pool, Credits-first.",
      rarity: "RARE",
      family: "TCG_PACK",
      affinity: "STORM",
      iconPath: "/assets/ui/shop/pack-storm.svg",
      priceSol: "0.035",
      effect: "Adds 3 binder cards",
    }),
  ];
}

export function getTcgCosmeticOffers(): ShopCardData[] {
  return [
    card({
      id: "tcg-sleeve-cyan-rift",
      name: "Cyan Rift Sleeve",
      description: "Card back cosmetic for your practice deck. Optional SOL cosmetics path.",
      rarity: "UNCOMMON",
      family: "TCG_COSMETIC",
      affinity: null,
      iconPath: "/assets/ui/shop/sleeve-cyan.svg",
      priceSol: "0.05",
      effect: "Cosmetic card back",
    }),
    card({
      id: "tcg-sleeve-amber-hearth",
      name: "Amber Hearth Sleeve",
      description: "Warm amber card back — prestige only, no power.",
      rarity: "RARE",
      family: "TCG_COSMETIC",
      affinity: null,
      iconPath: "/assets/ui/shop/sleeve-amber.svg",
      priceSol: "0.08",
      effect: "Cosmetic card back",
    }),
    card({
      id: "tcg-board-ember-felt",
      name: "Ember Felt Board Skin",
      description: "Duel board atmosphere skin for practice matches.",
      rarity: "EPIC",
      family: "TCG_COSMETIC",
      affinity: "EMBER",
      iconPath: "/assets/ui/shop/board-ember.svg",
      priceSol: "0.12",
      effect: "Cosmetic board skin",
    }),
  ];
}

export function getTcgBinderOffers(): ShopCardData[] {
  return [
    ...getTcgFeaturedOffers().filter(
      (c) => c.family === "TCG_BINDER" || c.family === "TCG_DECK",
    ),
    card({
      id: "tcg-binder-folio",
      name: "Keeper Folio",
      description: "Three binder pages + a display spine — collection vanity, Credits-first.",
      rarity: "EPIC",
      family: "TCG_BINDER",
      affinity: null,
      iconPath: "/assets/ui/shop/binder-folio.svg",
      priceSol: "0.1",
      effect: "+3 binder pages",
    }),
  ];
}
