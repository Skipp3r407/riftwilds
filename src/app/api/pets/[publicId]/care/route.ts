import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import type { CareAction } from "@/game/creatures/care";
import { CARE_ACTION_DEFS, CARE_ACTIONS } from "@/game/creatures/care-catalog";
import {
  listCareCatalogForUi,
  performCareAction,
  previewCareAction,
} from "@/game/creatures/care-service";
import { petCareSummary } from "@/game/eggs/hatchery-store";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import { ensureStarterCredits, getCreditBalance } from "@/lib/credits";

const bodySchema = z.object({
  action: z.string().refine((a): a is CareAction => a in CARE_ACTION_DEFS, {
    message: "Invalid care action",
  }),
  requestId: z.string().min(8).max(128).optional(),
  catalogItemId: z.string().min(1).max(64).optional(),
});

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  ensureStarterCredits(ownerKey);
  const previews = CARE_ACTIONS.map((a) => previewCareAction(a)).filter(Boolean);
  const res = NextResponse.json({
    petPublicId: publicId,
    creditsBalance: getCreditBalance(ownerKey),
    neverRequiresSol: true,
    actions: previews,
    catalog: listCareCatalogForUi(),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

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
  const result = performCareAction({
    ownerKey,
    petPublicId: publicId,
    action: parsed.data.action,
    requestId: parsed.data.requestId,
    catalogItemId: parsed.data.catalogItemId,
  });

  if (!result.ok) {
    const status =
      result.error === "FORBIDDEN"
        ? 403
        : result.error === "PET_NOT_FOUND"
          ? 404
          : result.error === "INSUFFICIENT_CREDITS" || result.error === "INSUFFICIENT_ENERGY"
            ? 402
            : result.error === "ON_COOLDOWN"
              ? 429
              : 400;
    const res = NextResponse.json(
      {
        error: result.error,
        message: result.message,
        retryAfterMs: result.retryAfterMs,
        creditsBalance: result.creditsBalance,
        neverRequiresSol: true,
      },
      { status },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const species = getSpeciesBySlug(result.pet.speciesSlug);
  const res = NextResponse.json({
    pet: {
      ...result.pet,
      care: result.displayCare,
      summary: petCareSummary(result.pet),
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
    care: {
      action: result.action,
      creditCost: result.creditCost,
      creditsBalance: result.creditsBalance,
      energySpent: result.energySpent,
      careXpGained: result.careXpGained,
      journalEntry: result.journalEntry,
      newMilestones: result.newMilestones,
      needMessage: result.needMessage,
      modifiers: result.modifiers,
      animation: result.animation,
      neverRequiresSol: true,
      idempotentReplay: result.idempotentReplay ?? false,
    },
    demo: true,
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
