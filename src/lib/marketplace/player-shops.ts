/**
 * Player shop stubs — name, banner, featured listings, ratings.
 */

import { getDemoReputation } from "@/lib/exchange/reputation";
import { getDemoMarketplaceListings } from "@/lib/marketplace/demo-listings";

export type PlayerShopStub = {
  slug: string;
  name: string;
  bannerPath: string;
  motto: string;
  ownerLabel: string;
  featuredListingIds: string[];
  rating: {
    score: number;
    tierLabel: string;
    reviewCount: number;
    authoritative: false;
  };
  specialties: string[];
};

const SHOPS: PlayerShopStub[] = [
  {
    slug: "lantern-archives",
    name: "Lantern Archives",
    bannerPath: "/assets/marketplace/desk-atmosphere.png",
    motto: "Alt-art sleeves and binder spines for quiet Keepers.",
    ownerLabel: "LanternArchivist",
    featuredListingIds: [],
    rating: { ...getDemoReputation("lantern"), reviewCount: 42, authoritative: false },
    specialties: ["sleeves", "binder", "alt_art"],
  },
  {
    slug: "ember-atelier-stall",
    name: "Ember Atelier Stall",
    bannerPath: "/assets/ui/wallpapers/shop.png",
    motto: "Board skins that glow — never stronger cards.",
    ownerLabel: "EmberAtelier",
    featuredListingIds: [],
    rating: { ...getDemoReputation("ember"), reviewCount: 28, authoritative: false },
    specialties: ["board", "emotes", "cosmetics"],
  },
  {
    slug: "tide-collectors",
    name: "Tide Collectors",
    bannerPath: "/assets/ui/wallpapers/marketplace.png",
    motto: "Collectible editions and showcase foils.",
    ownerLabel: "TidequillKeeper",
    featuredListingIds: [],
    rating: { ...getDemoReputation("tide"), reviewCount: 61, authoritative: false },
    specialties: ["collectibles", "packs"],
  },
];

function attachFeatured(shop: PlayerShopStub): PlayerShopStub {
  const cosmetic = getDemoMarketplaceListings().filter(
    (l) =>
      l.category === "EQUIPMENT" ||
      l.category === "COLLECTIBLES" ||
      l.category === "PACKS" ||
      l.category === "CARDS",
  );
  const ids = cosmetic.slice(0, 3).map((l) => l.publicId);
  return { ...shop, featuredListingIds: ids };
}

export function listPlayerShops(): PlayerShopStub[] {
  return SHOPS.map(attachFeatured);
}

export function getPlayerShop(slug: string): PlayerShopStub | null {
  const shop = SHOPS.find((s) => s.slug === slug);
  return shop ? attachFeatured(shop) : null;
}
