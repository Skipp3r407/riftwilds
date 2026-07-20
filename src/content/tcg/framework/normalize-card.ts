/**
 * Normalize legacy / partial card JSON into the full AAA gameplay surface.
 * Does not mutate source JSON — safe for 5,000+ cards loaded from expansions.
 * Applies versioned stat overlays (card-stats-v2) before deriving missing axes.
 */

import type {
  TcgCard,
  TcgCraftCost,
  TcgRole,
  TcgUnlockMethod,
} from "@/content/tcg/types";
import { defaultCraftCost } from "@/content/tcg/framework/craft";
import { migrateCardStats } from "@/content/tcg/framework/apply-stat-migration";
import { canonicalizeRole } from "@/content/tcg/framework/roles";
import {
  clampStat,
  STAT_RANGES,
} from "@/game/tcg/combat/formulas";
import { normalizeKeywordList } from "@/game/tcg/combat/keywords";
import { resolvePublishedCleanArt } from "@/content/tcg/framework/card-asset-paths";
import {
  categoryToTemplateLayout,
  resolveCardCategory,
  type TcgCardCategory,
  type TcgTemplateLayout,
} from "@/content/tcg/framework/card-categories";

export type NormalizedTcgCard = TcgCard & {
  /** Canonical category (Companion / Spell / Item / …). */
  category: TcgCardCategory;
  defense: number;
  speed: number;
  role: TcgRole;
  familyId: string | null;
  evolutionStage: string | null;
  strengths: string[];
  weaknesses: string[];
  factionId: string | null;
  craftCosts: TcgCraftCost;
  unlockMethod: TcgUnlockMethod;
  competitiveEligible: boolean;
  isPlaceholder: boolean;
  voiceLines: NonNullable<TcgCard["voiceLines"]>;
  balance: NonNullable<TcgCard["balance"]>;
  /** Collection number alias for brief compatibility. */
  collectionNumber: number;
  expansionSet: string;
  creatureFamily: string | null;
  /** Clean art path preferred for dynamic template (no baked stats). */
  cleanArtPath: string | null;
  /** Progressive disclosure size hints — one layout per category. */
  templateLayout: TcgTemplateLayout;
};

const ELEMENT_STRENGTHS: Record<string, string[]> = {
  fire: ["metal", "nature"],
  water: ["fire", "earth"],
  nature: ["water", "earth"],
  earth: ["storm", "fire"],
  storm: ["water", "metal"],
  crystal: ["shadow", "poison"],
  shadow: ["spirit", "light"],
  light: ["shadow", "void"],
  spirit: ["arcane", "poison"],
  arcane: ["spirit", "metal"],
  poison: ["nature", "water"],
  metal: ["crystal", "earth"],
  celestial: ["void", "shadow"],
  void: ["celestial", "light"],
  neutral: [],
};

const ELEMENT_WEAKNESSES: Record<string, string[]> = {
  fire: ["water", "earth"],
  water: ["storm", "nature"],
  nature: ["fire", "poison"],
  earth: ["water", "nature"],
  storm: ["earth", "crystal"],
  crystal: ["metal", "earth"],
  shadow: ["light", "celestial"],
  light: ["void", "shadow"],
  spirit: ["void", "corrupt"],
  arcane: ["silence", "shatter"],
  poison: ["crystal", "light"],
  metal: ["storm", "fire"],
  celestial: ["void"],
  void: ["light", "celestial"],
  neutral: [],
};

function deriveRole(card: TcgCard, category: TcgCardCategory): TcgRole {
  if (card.role) return canonicalizeRole(card.role) as TcgRole;
  const atk = card.attack ?? 0;
  const hp = card.health ?? 0;
  const keywords = new Set(card.keywords.map((k) => k.toLowerCase()));

  if (category === "spell" || category === "trap" || category === "item") {
    if (keywords.has("heal") || category === "item") return "healer";
    if (keywords.has("draw") || (card.energyCost <= 2 && atk <= 2)) return "utility";
    if (atk >= 5 || card.energyCost >= 6) return "finisher";
    return "controller";
  }
  if (category === "equipment" || category === "relic") {
    return "support";
  }
  if (category === "terrain") return "utility";
  if (category === "commander") return "support";
  if (keywords.has("guardian") || keywords.has("taunt") || keywords.has("guard")) {
    return "tank";
  }
  if (keywords.has("charge") || (atk >= hp + 2 && card.energyCost <= 3)) {
    return "assassin";
  }
  if (keywords.has("bloom") || keywords.has("harmony") || keywords.has("ward")) {
    return "support";
  }
  if (card.isToken || keywords.has("summon")) return "swarm";
  if (atk >= 6) return "finisher";
  if (hp >= 7 && atk <= 3) return "defender";
  if (card.energyCost <= 1) return "energy_generator";
  if (atk >= 3 && hp >= 4) return "bruiser";
  return "bruiser";
}

function deriveDefense(card: TcgCard, role: TcgRole): number {
  if (typeof card.defense === "number") {
    return clampStat(card.defense, STAT_RANGES.defense);
  }
  const hp = card.health ?? 0;
  if (!hp) return 0;
  const roleBonus =
    role === "tank" || role === "defender"
      ? 2
      : role === "assassin" || role === "skirmisher"
        ? -1
        : 0;
  return clampStat(Math.round(hp * 0.45) + roleBonus, STAT_RANGES.defense);
}

function deriveSpeed(card: TcgCard, role: TcgRole): number {
  if (typeof card.speed === "number") {
    return clampStat(card.speed, STAT_RANGES.speed);
  }
  const cost = card.energyCost;
  let base = Math.max(1, 8 - cost);
  if (role === "assassin" || role === "skirmisher") base += 2;
  if (role === "tank" || role === "defender" || role === "wall") base -= 1;
  if (card.keywords.some((k) => k.toLowerCase() === "charge")) base += 2;
  if (card.keywords.some((k) => k.toLowerCase() === "flying")) base += 1;
  return clampStat(base, STAT_RANGES.speed);
}

function deriveEvolutionStage(
  card: TcgCard,
  category: TcgCardCategory,
): string | null {
  if (card.evolutionStage) return card.evolutionStage;
  if (category === "companion") {
    if (card.id.startsWith("rotr-comp-")) return "companion";
    if (card.id.startsWith("rotr-c-")) return "keeper";
    if (card.isToken) return "shellseed";
    return "companion";
  }
  if (category === "evolution") return "awaken";
  return null;
}

function deriveFamilyId(card: TcgCard): string | null {
  if (card.familyId) return card.familyId;
  if (card.riftlingSlug) return `family-${card.riftlingSlug}`;
  return null;
}

function deriveFactionId(card: TcgCard): string | null {
  if (card.factionId) return card.factionId;
  const map: Record<string, string> = {
    fire: "ember-forge",
    metal: "ember-forge",
    water: "tideward-coast",
    crystal: "tideward-coast",
    nature: "grove-circle",
    poison: "grove-circle",
    earth: "grove-circle",
    storm: "stormspire",
    arcane: "stormspire",
    light: "stormspire",
  };
  return map[card.element] ?? null;
}

function deriveCompetitive(
  card: TcgCard,
  category: TcgCardCategory,
): boolean {
  if (typeof card.competitiveEligible === "boolean") return card.competitiveEligible;
  if (card.isToken) return false;
  if (card.finish && card.finish !== "standard") return false;
  if (
    card.id.includes("-prop-") ||
    card.id.includes("-npc-") ||
    (category === "commander" && card.id.includes("-npc-"))
  ) {
    return false;
  }
  // Terrain weather-origin stubs remain non-competitive when tagged.
  if (card.collectionTags?.includes("weather-prop")) return false;
  return true;
}

function derivePowerScore(card: TcgCard): number {
  const atk = card.attack ?? 0;
  const hp = card.health ?? 0;
  const def = card.defense ?? 0;
  const spd = card.speed ?? 5;
  const cost = Math.max(1, card.energyCost);
  const raw =
    ((atk + hp + def * 0.7 + spd * 0.3) / cost) * 12 + card.keywords.length * 3;
  const rarityBump: Record<string, number> = {
    common: 0,
    uncommon: 4,
    rare: 8,
    epic: 12,
    legendary: 16,
    mythic: 20,
    founder: 0, // cosmetic band — no competitive bump
  };
  return Math.max(5, Math.min(100, Math.round(raw + (rarityBump[card.rarity] ?? 0))));
}

function deriveUnlock(card: TcgCard): TcgUnlockMethod {
  if (card.unlockMethod) return card.unlockMethod;
  if (card.isPlaceholder) return "placeholder";
  if (card.collectionTags.includes("starter")) return "starter";
  if (card.rarity === "legendary" || card.rarity === "mythic") return "craft";
  return "pack";
}

export function normalizeCard(card: TcgCard): NormalizedTcgCard {
  // Versioned overlays first — never mutate the imported JSON object identity chain.
  const migrated = migrateCardStats(card);
  const category = resolveCardCategory(migrated.type, migrated.id);
  const keywords = normalizeKeywordList(migrated.keywords);
  const withKw = { ...migrated, type: category, keywords };
  const role = deriveRole(withKw, category);
  const defense = deriveDefense(withKw, role);
  const speed = deriveSpeed(withKw, role);
  const familyId = deriveFamilyId(withKw);
  const evolutionStage = deriveEvolutionStage(withKw, category);
  const strengths = withKw.strengths?.length
    ? withKw.strengths
    : ELEMENT_STRENGTHS[withKw.element] ?? [];
  const weaknesses = withKw.weaknesses?.length
    ? withKw.weaknesses
    : ELEMENT_WEAKNESSES[withKw.element] ?? [];
  const craftCosts =
    withKw.craftCosts ?? defaultCraftCost(withKw.rarity, withKw.craftCost);
  const competitiveEligible = deriveCompetitive(withKw, category);
  const powerScore = withKw.balance?.powerScore ?? derivePowerScore({
    ...withKw,
    defense,
    speed,
    role,
  });

  const passiveAbility = withKw.abilities.find((a) => a.timing === "passive");
  const activeAbility = withKw.abilities.find(
    (a) => a.timing === "activated" || a.timing === "battlecry",
  );
  const ultimateAbility = withKw.abilities.find((a) => a.timing === "ultimate");

  const attack =
    typeof withKw.attack === "number"
      ? clampStat(withKw.attack, STAT_RANGES.attack)
      : withKw.attack;
  const health =
    typeof withKw.health === "number"
      ? clampStat(withKw.health, STAT_RANGES.health)
      : withKw.health;
  const energyCost = clampStat(withKw.energyCost, STAT_RANGES.cost);

  return {
    ...withKw,
    type: category,
    category,
    attack,
    health,
    energyCost,
    keywords,
    defense,
    speed,
    role,
    familyId,
    evolutionStage,
    strengths,
    weaknesses,
    factionId: deriveFactionId(withKw),
    craftCosts,
    unlockMethod: deriveUnlock(withKw),
    competitiveEligible,
    isPlaceholder: Boolean(withKw.isPlaceholder),
    activeAbilityId: withKw.activeAbilityId ?? activeAbility?.id ?? null,
    ultimateAbilityId: withKw.ultimateAbilityId ?? ultimateAbility?.id ?? null,
    passive: withKw.passive ?? passiveAbility?.text ?? null,
    voiceLines: withKw.voiceLines ?? {
      play: withKw.voiceDirection,
      attack: withKw.sound.hit,
      death: withKw.sound.death,
    },
    balance: {
      powerScore,
      targetWinRate: withKw.balance?.targetWinRate ?? 0.5,
      watchlist: withKw.balance?.watchlist ?? powerScore >= 85,
      patchTag: withKw.balance?.patchTag ?? "STATS-V2",
      notes: withKw.balance?.notes ?? withKw.balanceNotes,
    },
    collectionNumber: withKw.collectorNumber,
    expansionSet: withKw.expansionId,
    creatureFamily: familyId,
    cleanArtPath:
      resolvePublishedCleanArt(withKw.id) ??
      withKw.art.assetPath ??
      null,
    templateLayout: categoryToTemplateLayout(category),
  };
}
