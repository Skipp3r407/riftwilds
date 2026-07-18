import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import { submitHomeVisit } from "@/lib/social-presence";

const bodySchema = z.object({
  homeId: z.string().min(2).max(64),
  liked: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional().nullable(),
  guestbookNote: z.string().max(200).optional().nullable(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-home",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (
    !featureFlagDefaults.SOCIAL_PRESENCE_ENABLED ||
    !featureFlagDefaults.SOCIAL_HOME_VISITS_ENABLED
  ) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = submitHomeVisit({
    userId: ownerKey,
    homeId: parsed.data.homeId,
    liked: parsed.data.liked,
    rating: parsed.data.rating,
    guestbookNote: parsed.data.guestbookNote,
  });

  const res = NextResponse.json({
    requestId: guard.requestId,
    ok: result.action.ok,
    record: result.record,
    popularity: result.popularity,
    action: result.action,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
