import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import {
  getStormPlayerView,
  participateInStorm,
  rollRiftStorm,
} from "@/lib/loyalty/service";
import { withApiGuard } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-storm",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const view = getStormPlayerView(ownerKey);
  const res = NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    ...view,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

const postSchema = z.object({
  action: z.enum(["participate", "roll"]),
  participationAction: z.string().min(2).max(40).optional(),
  regionId: z.string().max(64).optional(),
  waveId: z.enum(["WAVE_1", "WAVE_2", "WAVE_3", "FINAL"]).optional(),
  shareWin: z.boolean().optional(),
  walletAddress: z.string().max(64).optional().nullable(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-storm-act",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = postSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.action === "participate") {
    if (!parsed.data.participationAction) {
      return NextResponse.json({ ok: false, error: "ACTION_REQUIRED" }, { status: 400 });
    }
    const result = participateInStorm({
      userId: ownerKey,
      action: parsed.data.participationAction,
      regionId: parsed.data.regionId,
    });
    const res = NextResponse.json({
      requestId: guard.requestId,
      ...result,
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const result = rollRiftStorm({
    userId: ownerKey,
    waveId: parsed.data.waveId,
    shareWin: parsed.data.shareWin,
    walletAddress: parsed.data.walletAddress,
  });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
