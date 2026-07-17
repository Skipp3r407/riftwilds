import { NextResponse } from "next/server";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getPet, petCareSummary } from "@/game/eggs/hatchery-store";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import { getSpeciesLore } from "@/content/pets/lore";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { assertOwnership } from "@/lib/security/authorization";

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);
  if (!pet) return NextResponse.json({ error: "PET_NOT_FOUND" }, { status: 404 });
  try {
    assertOwnership(pet.ownerKey, ownerKey);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const species = getSpeciesBySlug(pet.speciesSlug);
  const loreEnabled = isFeatureEnabled("PET_LORE_ENABLED");
  const speciesLore = loreEnabled ? getSpeciesLore(pet.speciesSlug) : undefined;
  const res = NextResponse.json({
    pet: {
      ...pet,
      summary: petCareSummary(pet),
      rpg: species
        ? {
            bodyType: species.bodyType,
            habitat: species.habitat,
            food: species.food,
            baseStats: species.baseStats,
            abilities: species.abilities,
            traits: species.traits,
            evolutionPaths: species.evolutionPaths,
          }
        : null,
      speciesLore: speciesLore
        ? {
            slug: speciesLore.slug,
            name: speciesLore.name,
            title: speciesLore.title,
            pronunciation: speciesLore.pronunciation,
            shortBio: speciesLore.shortBio,
            standardBio: speciesLore.standardBio,
            fullLore: speciesLore.fullLore,
            origin: speciesLore.origin,
            nativeRegion: speciesLore.nativeRegion,
            affinity: speciesLore.affinity,
            ancientLegend: speciesLore.ancientLegend,
            hiddenTruth: speciesLore.spoilerHiddenTruth
              ? null
              : speciesLore.hiddenTruth,
            hiddenTruthLocked: speciesLore.spoilerHiddenTruth,
            commonMisunderstanding: speciesLore.commonMisunderstanding,
            diet: speciesLore.diet,
            favoriteFoods: speciesLore.favoriteFoods,
            naturalBehavior: speciesLore.naturalBehavior,
            socialBehavior: speciesLore.socialBehavior,
            eggAppearance: speciesLore.eggAppearance,
            evolutionPhilosophy: speciesLore.evolutionPhilosophy,
            marketplaceCollectorNote: speciesLore.marketplaceCollectorNote,
            storyHooks: speciesLore.storyHooks,
            historicalTimeline: speciesLore.historicalTimeline,
            myths: speciesLore.myths,
          }
        : null,
    },
    demo: true,
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
