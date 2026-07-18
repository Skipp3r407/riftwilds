/**
 * Phase 8 economy compatibility facade.
 *
 * Canonical Spirit Recovery lives in the shipped Spirit system:
 *   POST /api/pets/[publicId]/recovery
 *   GET  /api/pets/[publicId]/spirit
 *   /spirit-realm, /memorials, docs/riftlings/*
 *
 * This route does NOT rebuild Spirit Realm — it only proxies recovery options
 * / recover calls into `src/game/spirit` for economy clients that know /api/spirit/*.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  RECOVERY_METHODS,
  recoverRiftling,
  getRecoveryOptions,
} from "@/game/spirit";
import { resolveOwnerKey, attachGuestCookie, guestIdentityFields } from "@/lib/auth/owner-key";

const bodySchema = z.object({
  petPublicId: z.string().min(2).max(120),
  method: z.enum(RECOVERY_METHODS),
  requestId: z.string().min(8).max(128).optional(),
  itemId: z.string().optional(),
  assistantKey: z.string().optional(),
  walletAddress: z.string().optional(),
  questStepId: z.string().optional(),
});

function spiritEnabled(): boolean {
  return isFeatureEnabled("SPIRIT_SYSTEM_ENABLED") || isFeatureEnabled("SPIRIT_RECOVERY_API_ENABLED");
}

export async function GET(req: Request) {
  if (!spiritEnabled()) {
    return NextResponse.json({ error: "SPIRIT_DISABLED" }, { status: 503 });
  }
  const url = new URL(req.url);
  const petPublicId = url.searchParams.get("petPublicId");
  if (!petPublicId) {
    return NextResponse.json({ error: "petPublicId required" }, { status: 400 });
  }
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const options = getRecoveryOptions(petPublicId, ownerKey);
  const res = NextResponse.json({
    ok: true,
    petPublicId,
    options,
    canonicalApi: `/api/pets/${petPublicId}/recovery`,
    spiritStatusApi: `/api/pets/${petPublicId}/spirit`,
    spiritRealmPath: "/spirit-realm",
    solNeverRequired: true,
    solSpiritRecallEnabled: isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED"),
    note: "Compatibility facade — prefer POST /api/pets/[publicId]/recovery",
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(req: Request) {
  if (!spiritEnabled()) {
    return NextResponse.json({ error: "SPIRIT_DISABLED" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.method === "SOL_INSTANT_RECALL" && !isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED")) {
    return NextResponse.json(
      {
        error: "SOL_RECALL_DISABLED",
        message: "SOL Instant Recall is optional and flagged off. Use Credits healer or other methods.",
        canonicalApi: `/api/pets/${parsed.data.petPublicId}/recovery`,
      },
      { status: 403 },
    );
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = recoverRiftling({
    petPublicId: parsed.data.petPublicId,
    ownerKey,
    method: parsed.data.method,
    requestId: parsed.data.requestId,
    itemId: parsed.data.itemId,
    assistantKey: parsed.data.assistantKey,
    walletAddress: parsed.data.walletAddress,
    questStepId: parsed.data.questStepId,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        message: result.message,
        creditsBalance: result.creditsBalance,
        canonicalApi: `/api/pets/${parsed.data.petPublicId}/recovery`,
        solNeverRequired: true,
      },
      { status: 400 },
    );
  }

  const res = NextResponse.json({
    ok: true,
    method: result.method,
    creditsSpent: result.creditsSpent,
    loyaltyTokensSpent: result.loyaltyTokensSpent,
    solLamports: result.solLamports,
    dialogue: result.dialogue,
    equipmentPreserved: result.equipmentPreserved,
    idempotentReplay: result.idempotentReplay,
    petPublicId: result.pet.publicId,
    lifeState: result.spirit.lifeState,
    canonicalApi: `/api/pets/${parsed.data.petPublicId}/recovery`,
    disclaimer: "Credits / loyalty recovery never requires SOL. Integrated with shipped Spirit system.",
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
