/**
 * Shared product art keys for marketplace demo listings + shop catalog.
 */

const SHOP = "/assets/ui/shop";

export const MARKETPLACE_PRODUCT_ICONS: Record<string, string> = {
  "ember-spark-pack": `${SHOP}/pack-ember.png`,
  "tideglass-pack": `${SHOP}/pack-tide.png`,
  "grove-moss-pack": `${SHOP}/pack-grove.png`,
  "stormspire-pack": `${SHOP}/pack-storm.png`,
  "binder-page": `${SHOP}/binder-page.png`,
  "extra-deck-slot": `${SHOP}/deck-slot.png`,
  "cyan-rift-sleeve": `${SHOP}/sleeve-cyan.png`,
  "amber-hearth-sleeve": `${SHOP}/sleeve-amber.png`,
  "ember-felt-board": `${SHOP}/board-ember.png`,
  "keeper-folio": `${SHOP}/binder-folio.png`,
  "ember-talons": "/assets/items/weapons/icons/ember-talons.png",
  "heart-of-the-volcano": "/assets/items/weapons/icons/heart-of-the-volcano.png",
  "cinder-swipe": `${SHOP}/pack-ember.png`,
  "tide-guard": `${SHOP}/pack-tide.png`,
};

export function resolveMarketplaceProductIcon(key: string | null | undefined): string | null {
  if (!key) return null;
  return MARKETPLACE_PRODUCT_ICONS[key] ?? null;
}
