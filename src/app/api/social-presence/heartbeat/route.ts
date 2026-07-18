import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import { recordPresenceHeartbeat } from "@/lib/social-presence";

const bodySchema = z.object({
  signals: z.array(z.string().min(2).max(16)).max(12).optional(),
  regionSlug: z.string().max(64).optional().nullable(),
  locationId: z.string().max(64).optional().nullable(),
  restZoneKind: z.string().max(32).optional().nullable(),
  fingerprintHash: z.string().max(128).optional().nullable(),
  genuineDeltaMs: z.number().min(0).max(120_000).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-heartbeat",
    limit: 180,
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
  const result = recordPresenceHeartbeat({
    userId: ownerKey,
    signals: parsed.data.signals as never,
    regionSlug: parsed.data.regionSlug,
    locationId: parsed.data.locationId,
    restZoneKind: parsed.data.restZoneKind as never,
    fingerprintHash: parsed.data.fingerprintHash,
    genuineDeltaMs: parsed.data.genuineDeltaMs,
  });

  const res = NextResponse.json({
    requestId: guard.requestId,
    ok: true,
    antiAfk: result.antiAfk,
    presenceXp: result.state.presenceXp,
    inRestZone: result.state.inRestZone,
    status: result.state.status,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
