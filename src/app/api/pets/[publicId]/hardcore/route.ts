import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, resolveOwnerKey } from "@/lib/auth/owner-key";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { getPet } from "@/game/eggs/hatchery-store";
import {
  disableHardcore,
  enableHardcore,
  ensureSpiritRecord,
  hardcoreWarningPayload,
  saveSpiritRecord,
} from "@/game/spirit";

const bodySchema = z.object({
  enable: z.boolean(),
  checkboxAccepted: z.boolean().optional(),
  warningAcknowledged: z.boolean().optional(),
  typedConfirm: z.string().max(32).optional(),
});

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { publicId } = await params;
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);
  if (!pet) return NextResponse.json({ error: "PET_NOT_FOUND" }, { status: 404 });
  const spirit = ensureSpiritRecord({ petPublicId: publicId, ownerKey: pet.ownerKey });
  const res = NextResponse.json({
    petPublicId: publicId,
    hardcore: spirit.hardcore,
    warning: hardcoreWarningPayload(),
    flagEnabled: isFeatureEnabled("HARDCORE_MODE_ENABLED"),
    normalPlaySafe: true,
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(req: Request, { params }: Params) {
  const { publicId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const pet = getPet(publicId);
  if (!pet) return NextResponse.json({ error: "PET_NOT_FOUND" }, { status: 404 });
  if (pet.ownerKey !== ownerKey) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const spirit = ensureSpiritRecord({ petPublicId: publicId, ownerKey });
  if (!parsed.data.enable) {
    const next = { ...spirit, hardcore: disableHardcore(), updatedAt: new Date().toISOString() };
    saveSpiritRecord(next);
    const res = NextResponse.json({ ok: true, hardcore: next.hardcore });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const result = enableHardcore({
    checkboxAccepted: parsed.data.checkboxAccepted === true,
    warningAcknowledged: parsed.data.warningAcknowledged === true,
    typedConfirm: parsed.data.typedConfirm,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, message: result.message, warning: result.warning },
      { status: 400 },
    );
  }
  const next = {
    ...spirit,
    hardcore: result.hardcore,
    updatedAt: new Date().toISOString(),
    version: spirit.version + 1,
  };
  saveSpiritRecord(next);
  const res = NextResponse.json({ ok: true, hardcore: next.hardcore, warning: hardcoreWarningPayload() });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
