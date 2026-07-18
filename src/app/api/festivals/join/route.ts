import { NextResponse } from "next/server";
import { z } from "zod";
import {
  festivalBoardSnapshot,
  joinFestivalActivity,
} from "@/game/festivals/participation";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  festivalKey: z.string().min(2).max(64),
  activity: z.string().min(2).max(64),
  engaged: z.boolean().default(true),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "festival-join",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.FESTIVALS_ENABLED) {
    return NextResponse.json({ enabled: false, requestId: guard.requestId });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    enabled: true,
    requestId: guard.requestId,
    ...festivalBoardSnapshot(ownerKey),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "festival-join-write",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.FESTIVALS_ENABLED) {
    return NextResponse.json({ ok: false, error: "DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = joinFestivalActivity({
    userId: ownerKey,
    festivalKey: parsed.data.festivalKey,
    activity: parsed.data.activity,
    engaged: parsed.data.engaged,
    requestId: guard.requestId,
  });
  const res = NextResponse.json({
    ...result,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
