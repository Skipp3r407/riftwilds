import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { trackAnalytics } from "@/lib/analytics/events";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  endPerformance,
  joinPerformance,
  listLivePerformances,
  recordPresenceAction,
  recordPresenceHeartbeat,
  startPerformance,
} from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-perf",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    requestId: guard.requestId,
    enabled: featureFlagDefaults.SOCIAL_PERFORMANCES_ENABLED,
    live: listLivePerformances(),
    note: "Performance rewards are cosmetic / Presence XP only — never SOL.",
  });
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    title: z.string().max(80).optional(),
    kind: z.enum(["music", "dance", "story", "instrument"]).optional(),
    hubId: z.string().max(64).optional(),
  }),
  z.object({
    action: z.literal("join"),
    performanceId: z.string().min(2).max(80),
  }),
  z.object({
    action: z.literal("end"),
    performanceId: z.string().min(2).max(80),
  }),
]);

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-perf-write",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.SOCIAL_PERFORMANCES_ENABLED) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  let result: Record<string, unknown> = {};

  if (parsed.data.action === "start") {
    recordPresenceHeartbeat({
      userId: ownerKey,
      signals: ["MUSIC", "INTERACT"],
      locationId: parsed.data.hubId ?? "commons-stage",
      restZoneKind: "music_stage",
    });
    const perf = startPerformance({
      hostId: ownerKey,
      hubId: parsed.data.hubId,
      kind: parsed.data.kind,
      title: parsed.data.title,
    });
    recordPresenceAction({
      userId: ownerKey,
      kind: "PERFORMANCE",
      locationId: perf.hubId,
      regionSlug: "riftwild-commons",
    });
    trackAnalytics("presence_performance_start", { userId: ownerKey });
    result = { ok: true, performance: perf };
  } else if (parsed.data.action === "join") {
    const perf = joinPerformance({
      performanceId: parsed.data.performanceId,
      userId: ownerKey,
    });
    if (perf) {
      recordPresenceHeartbeat({
        userId: ownerKey,
        signals: ["MUSIC", "UI"],
        locationId: perf.hubId,
      });
      recordPresenceAction({
        userId: ownerKey,
        kind: "MUSIC_LISTEN",
        locationId: perf.hubId,
      });
    }
    result = { ok: Boolean(perf), performance: perf };
  } else {
    result = {
      ok: true,
      performance: endPerformance(parsed.data.performanceId),
    };
  }

  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
