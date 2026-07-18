import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  charterPlayerCity,
  getCityForUser,
  joinPlayerCity,
  listPlayerCities,
  playerCitiesAdminSnapshot,
  postCityBillboard,
} from "@/lib/player-cities";

const bodySchema = z.object({
  action: z.enum(["charter", "join", "billboard", "snapshot"]),
  name: z.string().min(3).max(40).optional(),
  regionSlug: z.string().min(2).max(64).optional(),
  seedParcelId: z.string().min(2).max(64).optional(),
  charterBlurb: z.string().max(240).optional(),
  cityId: z.string().min(2).max(64).optional(),
  message: z.string().min(1).max(120).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "player-cities",
    limit: 80,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    requestId: guard.requestId,
    cities: listPlayerCities(),
    mine: getCityForUser(ownerKey),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "player-cities-write",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.action === "snapshot") {
    return NextResponse.json({
      ok: true,
      ...playerCitiesAdminSnapshot(),
      requestId: guard.requestId,
    });
  }

  if (parsed.data.action === "charter") {
    if (!parsed.data.name || !parsed.data.regionSlug || !parsed.data.seedParcelId) {
      return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }
    const result = charterPlayerCity(
      {
        name: parsed.data.name,
        regionSlug: parsed.data.regionSlug,
        founderUserId: ownerKey,
        seedParcelId: parsed.data.seedParcelId,
        charterBlurb: parsed.data.charterBlurb,
      },
      guard.requestId,
    );
    const res = NextResponse.json({ ...result, requestId: guard.requestId, ...guestIdentityFields(isGuest, guestToken) });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (parsed.data.action === "join") {
    if (!parsed.data.cityId) {
      return NextResponse.json({ ok: false, error: "MISSING_CITY" }, { status: 400 });
    }
    const result = joinPlayerCity({ cityId: parsed.data.cityId, userId: ownerKey });
    const res = NextResponse.json({ ...result, requestId: guard.requestId, ...guestIdentityFields(isGuest, guestToken) });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (!parsed.data.cityId || !parsed.data.message) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }
  const result = postCityBillboard({
    cityId: parsed.data.cityId,
    userId: ownerKey,
    message: parsed.data.message,
    requestId: guard.requestId,
  });
  const res = NextResponse.json({ ...result, requestId: guard.requestId, ...guestIdentityFields(isGuest, guestToken) });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
