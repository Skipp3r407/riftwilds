import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { claimDailyAirdrop, claimMilestone } from "@/lib/loyalty/service";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  type: z.enum(["daily", "milestone"]),
  days: z.number().int().positive().optional(),
  share: z.boolean().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-claim",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.type === "milestone") {
    if (!parsed.data.days) {
      return NextResponse.json({ ok: false, error: "DAYS_REQUIRED" }, { status: 400 });
    }
    const result = claimMilestone({ userId: ownerKey, days: parsed.data.days });
    const res = NextResponse.json({
      requestId: guard.requestId,
      ...result,
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  const result = claimDailyAirdrop({
    userId: ownerKey,
    share: parsed.data.share,
  });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
