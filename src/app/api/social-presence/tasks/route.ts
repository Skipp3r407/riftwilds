import { NextResponse } from "next/server";
import { z } from "zod";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import {
  claimDailyTask,
  getSocialPresenceSnapshot,
  tasksForDay,
  WEEKLY_COMMUNITY_GOALS,
} from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-tasks",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const snap = getSocialPresenceSnapshot({ userId: ownerKey });
  const res = NextResponse.json({
    requestId: guard.requestId,
    daily: snap.dailyTasks,
    weekly: WEEKLY_COMMUNITY_GOALS,
    catalog: tasksForDay(),
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}

const claimSchema = z.object({ taskId: z.string().min(2).max(64) });

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-tasks-claim",
    limit: 30,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.LIVING_SERVER_POPULATION_ENABLED) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const parsed = claimSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY" }, { status: 400 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = claimDailyTask({ userId: ownerKey, taskId: parsed.data.taskId });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
