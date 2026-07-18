import type { AffinityName } from "@prisma/client";
import {
  getCardById,
  resolveCardImagePath,
  TCG_CARDS,
  type TcgCard,
  type TcgElement,
} from "@/content/tcg";
import type { TcgCardDef, TcgCardType, TcgRarity } from "@/game/tcg/types";

/**
 * Adapter: foundational JSON content (`@/content/tcg`) → engine card defs.
 * Do not maintain a parallel species-generated catalog.
 */

const ELEMENT_TO_AFFINITY: Record<TcgElement, AffinityName> = {
  fire: "EMBER",
  water: "TIDE",
  nature: "GROVE",
  earth: "STONE",
  storm: "STORM",
  crystal: "FROST",
  shadow: "VOID",
  light: "RADIANT",
  spirit: "SPIRIT",
  arcane: "SPIRIT",
  poison: "GROVE",
  metal: "ALLOY",
  celestial: "RADIANT",
  void: "VOID",
  neutral: "SPIRIT",
};

const UNIT_TYPES = new Set([
  "creature",
  "companion",
  "legendary",
  "token",
  "hero",
]);

function mapRarity(r: TcgCard["rarity"]): TcgRarity {
  if (r === "legendary" || r === "mythic" || r === "founder") return "LEGENDARY";
  if (r === "epic") return "EPIC";
  if (r === "rare") return "RARE";
  if (r === "uncommon") return "UNCOMMON";
  return "COMMON";
}

function mapType(t: TcgCard["type"]): TcgCardType {
  if (UNIT_TYPES.has(t)) return "UNIT";
  if (t === "weather" || t === "location") return "AURA";
  return "SPELL";
}

function spellPower(card: TcgCard): number {
  if (typeof card.attack === "number" && card.attack > 0) return card.attack;
  for (const ab of card.abilities) {
    for (const fx of ab.effects) {
      if (fx.op === "deal_damage" && typeof fx.value === "number") return fx.value;
    }
  }
  return Math.max(1, card.energyCost);
}

export function contentCardToEngineDef(card: TcgCard): TcgCardDef {
  const rarity = mapRarity(card.rarity);
  const type = mapType(card.type);
  const power =
    type === "UNIT"
      ? Math.max(1, card.attack ?? 1)
      : spellPower(card);
  const resolved = resolveCardImagePath(card);
  const cardImagePath =
    card.art.cardImagePath ||
    (resolved?.startsWith("/assets/tcg/cards/") ? resolved : undefined);
  return {
    id: card.id,
    name: card.localization.name,
    type,
    affinity: ELEMENT_TO_AFFINITY[card.element] ?? "SPIRIT",
    riftCost: Math.max(0, card.energyCost),
    power,
    rarity,
    speciesSlug: card.riftlingSlug,
    description: card.localization.rulesText || card.localization.flavorText,
    maxCopies:
      rarity === "LEGENDARY" || rarity === "EPIC" ? 1 : rarity === "RARE" ? 2 : 3,
    cardImagePath,
    artPath: card.art.assetPath,
  };
}

let cached: TcgCardDef[] | null = null;

export function getTcgCardCatalog(): TcgCardDef[] {
  if (cached) return cached;
  cached = TCG_CARDS.map(contentCardToEngineDef);
  return cached;
}

export function getTcgCardDef(id: string): TcgCardDef | undefined {
  const fromCache = getTcgCardCatalog().find((c) => c.id === id);
  if (fromCache) return fromCache;
  const raw = getCardById(id);
  return raw ? contentCardToEngineDef(raw) : undefined;
}

export function listUnitCards(): TcgCardDef[] {
  return getTcgCardCatalog().filter((c) => c.type === "UNIT");
}

export function listSpellCards(): TcgCardDef[] {
  return getTcgCardCatalog().filter((c) => c.type === "SPELL");
}
