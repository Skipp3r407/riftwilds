import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  awardHousingCompetitionTop,
  enterHousingCompetition,
  housingCompetitionSnapshot,
} from "@/lib/housing-competitions";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  action: z.enum(["enter", "claim_top"]),
  blurb: z.string().min(1).max(160).optional(),
  decorScore: z.number().int().min(0).max(100).optional(),
  visitLikes: z.number().int().min(0).max(500).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "housing-comp",
    limit: 80,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;
  return NextResponse.json({
    requestId: guard.requestId,
    ...housingCompetitionSnapshot(),
  });
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "housing-comp-write",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.action === "claim_top") {
    const result = awardHousingCompetitionTop({
      userId: ownerKey,
      requestId: guard.requestId,
    });
    const res = NextResponse.json({ ...result, requestId: guard.requestId, ...guestIdentityFields(isGuest, guestToken) });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const result = enterHousingCompetition({
    userId: ownerKey,
    blurb: parsed.data.blurb ?? "Welcome to my hearth.",
    decorScore: parsed.data.decorScore,
    visitLikes: parsed.data.visitLikes,
  });
  const res = NextResponse.json({ ...result, requestId: guard.requestId, ...guestIdentityFields(isGuest, guestToken) });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
