/**
 * Companion ↔ collectible card dual existence.
 * On hatch, grant a binder card for the species when a matching TCG card exists.
 * Codex family discovery is client-side (localStorage) — API returns familyId for UI hooks.
 */

import { cardsForRiftling, getCardFamilyBySpecies } from "@/content/tcg";
import { grantCardCopies, getCollection } from "@/game/tcg/collection-store";

export type CompanionCardGrantResult = {
  speciesSlug: string;
  grantedCardIds: string[];
  familyId: string | null;
  alreadyOwned: boolean;
};

/**
 * Grant at least one gameplay card copy linked to the hatched species.
 * Prefer the family's first released stage card; otherwise first matching content card.
 */
export function grantCompanionCardForSpecies(
  ownerKey: string,
  speciesSlug: string,
): CompanionCardGrantResult {
  const family = getCardFamilyBySpecies(speciesSlug);
  const familyId = family?.id ?? null;
  const stage1 = family?.stages.find((s) => s.cardId && s.status === "released");
  const matches = cardsForRiftling(speciesSlug);
  const preferredId = stage1?.cardId ?? matches[0]?.id;

  if (!preferredId) {
    return {
      speciesSlug,
      grantedCardIds: [],
      familyId,
      alreadyOwned: false,
    };
  }

  const binder = getCollection(ownerKey);
  const previousCount = binder.cards.find((c) => c.defId === preferredId)?.count ?? 0;
  const result = grantCardCopies(ownerKey, preferredId, 1);
  return {
    speciesSlug,
    grantedCardIds: result.ok ? [preferredId] : [],
    familyId,
    alreadyOwned: previousCount > 0,
  };
}
