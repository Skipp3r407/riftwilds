import {
  getCardById,
  getNormalizedCardById,
  resolveCardImagePath,
  TCG_CARDS,
  type TcgCard,
} from "@/content/tcg";
import { ELEMENT_TO_AFFINITY } from "@/content/tcg/framework/element-map";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { normalizeCard } from "@/content/tcg/framework/normalize-card";
import { summarizeAbilities } from "@/game/tcg/combat/abilities";
import type { TcgCardDef, TcgCardType, TcgRarity } from "@/game/tcg/types";

/**
 * Adapter: foundational JSON content (`@/content/tcg`) → engine card defs.
 * Competitive defs always use migrated base stats (never cosmetic finishes).
 */

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
      if (fx.op === "heal" && typeof fx.value === "number") return fx.value;
    }
  }
  return Math.max(1, card.energyCost);
}

export function contentCardToEngineDef(card: TcgCard): TcgCardDef {
  const normalized = normalizeCard(card);
  const rarity = mapRarity(card.rarity);
  const type = mapType(card.type);
  const attack =
    type === "UNIT"
      ? Math.max(0, normalized.attack ?? 1)
      : spellPower(normalized);
  const health = type === "UNIT" ? Math.max(1, normalized.health ?? 1) : 0;
  const resolved = resolveCardImagePath(card);
  const cardImagePath = resolved || `/assets/tcg/cards/${card.id}.webp`;
  const maxCopies = CONSTRUCTED_RULES.copyLimits[card.rarity] ?? 3;
  const abilitySummary = summarizeAbilities(normalized.abilities);

  return {
    id: card.id,
    name: normalized.localization.name,
    type,
    affinity: ELEMENT_TO_AFFINITY[normalized.element] ?? "SPIRIT",
    riftCost: Math.max(0, normalized.energyCost),
    power: attack,
    attack,
    health,
    defense: type === "UNIT" ? normalized.defense : 0,
    speed: normalized.speed,
    rarity,
    speciesSlug: normalized.riftlingSlug || normalized.relatedRiftlings?.[0],
    description:
      normalized.localization.rulesText || normalized.localization.flavorText,
    maxCopies,
    cardImagePath,
    artPath: normalized.art.assetPath,
    cleanArtPath: normalized.cleanArtPath ?? normalized.art.assetPath,
    role: normalized.role,
    element: normalized.element,
    familyId: normalized.familyId ?? undefined,
    competitiveEligible: normalized.competitiveEligible,
    keywords: normalized.keywords,
    passive: normalized.passive ?? abilitySummary.passive,
    activeSummary: abilitySummary.active,
    ultimateSummary: abilitySummary.ultimate,
    contentType: normalized.type,
    templateLayout: normalized.templateLayout,
  };
}

let cached: TcgCardDef[] | null = null;

export function getTcgCardCatalog(): TcgCardDef[] {
  if (cached) return cached;
  cached = TCG_CARDS.map(contentCardToEngineDef);
  return cached;
}

/** Invalidate after hot-reload / admin edits (tests). */
export function clearTcgCardCatalogCache(): void {
  cached = null;
}

export function getTcgCardDef(id: string): TcgCardDef | undefined {
  const fromCache = getTcgCardCatalog().find((c) => c.id === id);
  if (fromCache) return fromCache;
  const raw = getCardById(id);
  return raw ? contentCardToEngineDef(raw) : undefined;
}

export function getNormalizedEngineCard(id: string) {
  return getNormalizedCardById(id);
}

export function listUnitCards(): TcgCardDef[] {
  return getTcgCardCatalog().filter((c) => c.type === "UNIT");
}

export function listSpellCards(): TcgCardDef[] {
  return getTcgCardCatalog().filter((c) => c.type === "SPELL");
}
