import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  getHelperProfile,
  helpNewPlayer,
  HELPER_RULES,
  toggleHelper,
} from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-helper",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const res = NextResponse.json({
    requestId: guard.requestId,
    enabled: featureFlagDefaults.SOCIAL_HELPER_SYSTEM_ENABLED,
    profile: getHelperProfile(ownerKey),
    rules: HELPER_RULES,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("opt_in"),
    optIn: z.boolean(),
    tutorialComplete: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("assist"),
    newcomerId: z.string().min(2).max(128),
  }),
]);

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-helper-write",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.SOCIAL_HELPER_SYSTEM_ENABLED) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  let payload: Record<string, unknown> = {};
  if (parsed.data.action === "opt_in") {
    payload = {
      ok: true,
      profile: toggleHelper({
        userId: ownerKey,
        optIn: parsed.data.optIn,
        tutorialComplete: parsed.data.tutorialComplete,
      }),
    };
  } else {
    payload = helpNewPlayer({
      helperId: ownerKey,
      newcomerId: parsed.data.newcomerId,
    });
  }

  const res = NextResponse.json({
    requestId: guard.requestId,
    ...payload,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
