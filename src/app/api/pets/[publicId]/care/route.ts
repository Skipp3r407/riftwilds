import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { careForPet, petCareSummary } from "@/game/eggs/hatchery-store";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";

const bodySchema = z.object({
  action: z.enum([
    "FEED",
    "GIVE_WATER",
    "PLAY",
    "CLEAN",
    "REST",
    "HEAL",
    "MEDICINE",
    "TRAIN",
    "ENCOURAGE",
    "GIVE_ITEM",
    "RECOVERY_CENTER",
  ]),
});

type Params = { params: Promise<{ publicId: string }> };

export async function POST(req: Request, { params }: Params) {
  if (!isFeatureEnabled("PET_CARE_ENABLED") && !isFeatureEnabled("CARE_ENABLED")) {
    return NextResponse.json({ error: "CARE_DISABLED" }, { status: 403 });
  }

  const { publicId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  try {
    const pet = careForPet(ownerKey, publicId, parsed.data.action);
    const species = getSpeciesBySlug(pet.speciesSlug);
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
      },
      demo: true,
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "CARE_FAILED";
    const status = msg === "FORBIDDEN" ? 403 : msg === "PET_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
