import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { recordPlayerActivity } from "@/lib/loyalty/service";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  kind: z.string().min(2).max(32),
  detail: z.string().max(200).optional(),
  minutesPlayed: z.number().min(0).max(180).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-activity",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = recordPlayerActivity({
    userId: ownerKey,
    kind: parsed.data.kind as never,
    detail: parsed.data.detail,
    minutesPlayed: parsed.data.minutesPlayed,
  });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
