/**
 * Legendary Ancestors — account lore bonuses only. Never combat power.
 */

import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";
import type { AncestorBonus, LegendaryAncestor } from "@/game/spirit/types";

export function canAscendToAncestor(params: {
  bond: number;
  level: number;
  createdAt: string;
  nowMs?: number;
}): boolean {
  const now = params.nowMs ?? Date.now();
  const age = now - new Date(params.createdAt).getTime();
  return (
    age >= SPIRIT_RECOVERY_CONFIG.ancestorMinAgeMs &&
    params.bond >= SPIRIT_RECOVERY_CONFIG.ancestorMinBond &&
    params.level >= SPIRIT_RECOVERY_CONFIG.ancestorMinLevel
  );
}

export function createLegendaryAncestor(input: {
  petPublicId: string;
  ownerKey: string;
  name: string;
  speciesSlug: string;
}): LegendaryAncestor {
  const bonuses: AncestorBonus[] = [
    {
      id: "lore-museum",
      kind: "MUSEUM",
      label: "Museum plaque unlocked",
      combatPower: false,
    },
    {
      id: "lore-title",
      kind: "TITLE",
      label: "Title: Hearthline Ancestor",
      combatPower: false,
    },
    {
      id: "lore-family",
      kind: "FAMILY_HISTORY",
      label: "Family history entry",
      combatPower: false,
    },
    {
      id: "account-cosmetic",
      kind: "ACCOUNT_COSMETIC",
      label: "Ancestor lantern cosmetic (account)",
      combatPower: false,
    },
  ];
  return {
    id: `anc_${input.petPublicId}`,
    petPublicId: input.petPublicId,
    ownerKey: input.ownerKey,
    name: input.name,
    speciesSlug: input.speciesSlug,
    ascendedAt: new Date().toISOString(),
    loreEntry: `${input.name} watches from the lantern shore — a legend of care, not of combat.`,
    titles: ["Hearthline Ancestor"],
    bonuses,
  };
}

/** Account bonuses are lore/cosmetic only — assert no combat fields. */
export function ancestorBonusesAreNonCombat(ancestor: LegendaryAncestor): boolean {
  return ancestor.bonuses.every((b) => b.combatPower === false);
}
