import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { RECOVERY_METHODS, downRiftling, enterSpiritForm, recoverRiftling } from "@/game/spirit";
import { petCareSummary } from "@/game/eggs/hatchery-store";

const bodySchema = z.object({
  action: z.enum(["DOWN", "ENTER_SPIRIT", "RECOVER"]).default("RECOVER"),
  method: z.enum(RECOVERY_METHODS).optional(),
  requestId: z.string().min(8).max(128).optional(),
  itemId: z.string().min(1).max(64).optional(),
  assistantKey: z.string().min(1).max(128).optional(),
  walletAddress: z.string().min(32).max(64).optional().nullable(),
  treasuryValidated: z.boolean().optional(),
  fraudRisk: z.number().min(0).max(1).optional(),
  questStepId: z.string().min(1).max(64).optional(),
  cause: z.string().max(200).optional(),
});

type Params = { params: Promise<{ publicId: string }> };

export async function POST(req: Request, { params }: Params) {
  if (!isFeatureEnabled("SPIRIT_SYSTEM_ENABLED")) {
    return NextResponse.json({ error: "DISABLED" }, { status: 403 });
  }
  const { publicId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: parsed.error.flatten() }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const body = parsed.data;

  if (body.action === "DOWN") {
    const result = downRiftling({
      petPublicId: publicId,
      ownerKey,
      cause: body.cause,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error, message: result.message }, { status: 400 });
    }
    const res = NextResponse.json({
      ok: true,
      action: "DOWN",
      spirit: result.spirit,
      pet: petCareSummary(result.pet),
      note: "Downed — not dead. Multiple recovery paths available. SOL never required.",
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (body.action === "ENTER_SPIRIT") {
    const result = enterSpiritForm(publicId, ownerKey);
    if (!result.ok) {
      return NextResponse.json({ error: result.error, message: result.message }, { status: 400 });
    }
    const res = NextResponse.json({
      ok: true,
      action: "ENTER_SPIRIT",
      spirit: result.spirit,
      questId: "questId" in result ? result.questId : null,
      dialogue: "dialogue" in result ? result.dialogue : null,
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (!body.method) {
    return NextResponse.json({ error: "METHOD_REQUIRED" }, { status: 400 });
  }

  const result = recoverRiftling({
    petPublicId: publicId,
    ownerKey,
    method: body.method,
    requestId: body.requestId,
    itemId: body.itemId,
    assistantKey: body.assistantKey,
    walletAddress: body.walletAddress,
    treasuryValidated: body.treasuryValidated,
    fraudRisk: body.fraudRisk,
    questStepId: body.questStepId,
  });

  if (!result.ok) {
    const status =
      result.error === "DUPLICATE"
        ? 409
        : result.error === "INSUFFICIENT_CREDITS" || result.error === "INSUFFICIENT_LOYALTY"
          ? 402
          : result.error === "QUEST_IN_PROGRESS"
            ? 202
            : 400;
    const res = NextResponse.json(
      {
        error: result.error,
        message: result.message,
        creditsBalance: result.creditsBalance,
        solNeverRequired: true,
      },
      { status },
    );
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const res = NextResponse.json({
    ok: true,
    action: "RECOVER",
    method: result.method,
    spirit: result.spirit,
    pet: petCareSummary(result.pet),
    creditsSpent: result.creditsSpent,
    loyaltyTokensSpent: result.loyaltyTokensSpent,
    solLamports: result.solLamports,
    dialogue: result.dialogue,
    equipmentPreserved: result.equipmentPreserved,
    historyId: result.historyId,
    solNeverRequired: true,
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
