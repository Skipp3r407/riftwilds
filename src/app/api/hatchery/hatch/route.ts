import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { hatchEgg } from "@/game/eggs/hatchery-store";
import { grantCompanionCardForSpecies } from "@/game/eggs/companion-card-link";
import { onPetHatched } from "@/game/achievements/hooks";
import { appendTimelineEvent } from "@/game/timeline/store";
import { grantXp } from "@/lib/progression";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

const bodySchema = z.object({
  eggPublicId: z.string().min(4).max(64),
  /** Demo hatchery: skip the ~30s incubation countdown. */
  skipWait: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!isFeatureEnabled("HATCHING_ENABLED")) {
    return NextResponse.json({ error: "HATCHING_DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  try {
    const result = hatchEgg(ownerKey, parsed.data.eggPublicId, {
      skipWait: parsed.data.skipWait === true,
    });
    const companionCard = grantCompanionCardForSpecies(ownerKey, result.reveal.speciesSlug);
    const unlocked = onPetHatched();
    appendTimelineEvent({
      scope: "player",
      title: "Riftling hatched",
      detail: "A companion emerged from its egg into The Riftwilds.",
      tags: ["hatchery", "pet", "companion-card"],
    });
    let progressionXp = null;
    if (featureFlagDefaults.KEEPER_PROGRESSION_ENABLED) {
      progressionXp = grantXp({
        ownerKey,
        source: "RIFT_HATCH",
        requestId: `hatch:${parsed.data.eggPublicId}`,
        context: { petId: result.pet.publicId },
      });
    }
    const res = NextResponse.json({
      ...result,
      progressionXp,
      companionCard,
      cinematic: {
        kind: "hatch_reveal",
        speciesSlug: result.reveal.speciesSlug,
        rarity: result.reveal.rarity,
        familyId: companionCard.familyId,
        /** Client may play SFX / cry / Codex discovery banner. */
        hooks: ["sfx.hatchery.hatch_reveal", "riftling_cry", "codex_family_hint"],
      },
      demo: true,
      achievementUnlocks: unlocked.map((a) => a.key),
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "HATCH_FAILED";
    const status =
      msg === "FORBIDDEN" ? 403 : msg === "EGG_NOT_FOUND" ? 404 : msg === "NOT_READY" ? 409 : 400;
    const res = NextResponse.json(
      { error: msg, ...guestIdentityFields(isGuest, guestToken) },
      { status },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }
}
