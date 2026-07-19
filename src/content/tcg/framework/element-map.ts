/**
 * Element (TCG design) ↔ Affinity (battle / arena engine) mapping.
 * Design may list Fire/Water/…/Crystal; the engine still resolves via AffinityName.
 * Adding a new element here does not break combat — unmapped → SPIRIT fallback.
 */

import type { AffinityName } from "@prisma/client";
import type { TcgElement } from "@/content/tcg/types";

/** Canonical design elements from the AAA brief (superset of content enums). */
export const TCG_DESIGN_ELEMENTS = [
  "fire",
  "water",
  "nature",
  "earth",
  "storm",
  "crystal",
  "shadow",
  "light",
  "spirit",
  "arcane",
  "poison",
  "metal",
  "celestial",
  "void",
  "neutral",
] as const;

export type TcgDesignElement = (typeof TCG_DESIGN_ELEMENTS)[number];

/**
 * Battle engine affinities currently in Prisma / arena.
 * Crystal → FROST is intentional (frost/crystal shared identity in ROTR).
 */
export const ELEMENT_TO_AFFINITY: Record<TcgElement, AffinityName> = {
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

export const AFFINITY_TO_PRIMARY_ELEMENT: Partial<
  Record<AffinityName, TcgElement>
> = {
  EMBER: "fire",
  TIDE: "water",
  GROVE: "nature",
  STONE: "earth",
  STORM: "storm",
  FROST: "crystal",
  VOID: "shadow",
  RADIANT: "light",
  SPIRIT: "spirit",
  ALLOY: "metal",
};

export function elementToAffinity(element: TcgElement | string): AffinityName {
  return (
    ELEMENT_TO_AFFINITY[element as TcgElement] ?? ("SPIRIT" as AffinityName)
  );
}

export function documentElementMapping(): {
  element: TcgElement;
  affinity: AffinityName;
  note: string;
}[] {
  return (Object.keys(ELEMENT_TO_AFFINITY) as TcgElement[]).map((element) => ({
    element,
    affinity: ELEMENT_TO_AFFINITY[element],
    note:
      element === "crystal"
        ? "Crystal design element maps to FROST affinity until a CRYSTAL affinity ships."
        : element === "arcane" || element === "neutral"
          ? "Soft-mapped to SPIRIT for engine simplicity."
          : element === "poison"
            ? "Poison soft-maps to GROVE (nature toxins)."
            : element === "celestial"
              ? "Celestial soft-maps to RADIANT."
              : "1:1 identity mapping.",
  }));
}
