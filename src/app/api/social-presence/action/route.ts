import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import { recordPresenceAction, recordPresenceHeartbeat } from "@/lib/social-presence";

const bodySchema = z.object({
  kind: z.string().min(2).max(32),
  locationId: z.string().max(64).optional(),
  regionSlug: z.string().max(64).optional(),
  restZoneKind: z.string().max(32).optional().nullable(),
  detail: z.string().max(200).optional(),
  /** Client should send a matching engagement signal with social actions. */
  signal: z.string().max(16).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-action",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.SOCIAL_PRESENCE_ENABLED) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  // Auto-attach engagement signal so legitimate UI actions aren't AFK-blocked
  recordPresenceHeartbeat({
    userId: ownerKey,
    signals: [parsed.data.signal ?? "INTERACT"] as never,
    regionSlug: parsed.data.regionSlug,
    locationId: parsed.data.locationId,
    restZoneKind: parsed.data.restZoneKind as never,
  });

  const result = recordPresenceAction({
    userId: ownerKey,
    kind: parsed.data.kind as never,
    locationId: parsed.data.locationId,
    regionSlug: parsed.data.regionSlug,
    restZoneKind: parsed.data.restZoneKind as never,
    detail: parsed.data.detail,
  });

  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    presenceXp: result.state?.presenceXp,
    featuredTitle: result.state?.activeFeaturedTitle ?? null,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
