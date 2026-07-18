import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  getWorldEventPlayerView,
  recordWorldEventParticipation,
  WORLD_EVENT_PARTICIPATION_ACTIONS,
} from "@/lib/world-events";

const bodySchema = z.object({
  action: z.enum(["participate", "heartbeat"]),
  participationAction: z.enum(WORLD_EVENT_PARTICIPATION_ACTIONS as [string, ...string[]]).optional(),
  signals: z
    .array(
      z.enum(["MOVE", "CAMERA", "INTERACT", "CHAT", "EMOTE", "UI", "PET", "COMBAT"]),
    )
    .max(8)
    .optional(),
  regionSlug: z.string().min(2).max(64).optional(),
});

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-events-status",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.LIVE_WORLD_EVENTS_ENABLED) {
    return NextResponse.json({
      requestId: guard.requestId,
      enabled: false,
      view: null,
    });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const view = getWorldEventPlayerView({ userId: ownerKey, ensureDemo: true });
  const res = NextResponse.json({
    requestId: guard.requestId,
    enabled: true,
    view,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "world-events-act",
    limit: 80,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.LIVE_WORLD_EVENTS_ENABLED) {
    return NextResponse.json({ ok: false, error: "DISABLED" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();

  if (parsed.data.action === "heartbeat") {
    const view = getWorldEventPlayerView({ userId: ownerKey });
    const res = NextResponse.json({
      ok: true,
      view,
      requestId: guard.requestId,
      ...guestIdentityFields(isGuest, guestToken),
    });
    if (isGuest) attachGuestCookie(res, guestToken);
    return res;
  }

  if (!parsed.data.participationAction) {
    return NextResponse.json({ ok: false, error: "MISSING_ACTION" }, { status: 400 });
  }

  const result = recordWorldEventParticipation({
    userId: ownerKey,
    action: parsed.data.participationAction,
    signals: parsed.data.signals,
    regionSlug: parsed.data.regionSlug,
  });

  const view = getWorldEventPlayerView({ userId: ownerKey, ensureDemo: false });
  const res = NextResponse.json({
    ...result,
    view,
    requestId: guard.requestId,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
